use crate::domain::cron_job::CronJob;
use crate::domain::scheduler::JobScheduler;
use crate::domain::server::ServiceTerminal;
use crate::repository::server::*;
use crate::repository::ssh::batch_server_ssh_back;
use crate::utils::crypto::*;
use crate::{domain::ssh_configuration::Message, repository::ssh::single_server_ssh_back};
use bytes::Bytes;
use chrono::{DateTime, Duration, Utc};
use cron_parser::parse;
use dotenvy::dotenv;
use futures::future::join_all;
use log::{debug, info, warn};
use sqlx::PgPool;
use std::env;

pub fn judge_time(time: DateTime<Utc>) -> bool {
    dotenv().ok();
    let sec = env::var("SAVE_SECS")
        .unwrap_or("3600".to_string())
        .parse()
        .expect("RELOAD_SECS must be number");
    time - Utc::now() <= Duration::seconds(sec)
    // 下次执行时间 - 当前时间 < reload sql 间隔
}
// 这里面不用管 enable，任务执行后的善后处理，如果enable关闭 任务不会执行，除非在执行后的同时关闭了enable出现了竞态，概率较小
// 用于初始化，计算了每个任务的下次时间 并且进行更新
pub async fn reload_single_job(
    pool: &PgPool,
    job_id: i32,
    heap: JobScheduler,
) -> Result<(), anyhow::Error> {
    let job_expression = sqlx::query!("SELECT cron_expression FROM cronjobs where id = $1", job_id)
        .fetch_one(pool)
        .await?;
    let job_expression = job_expression.cron_expression;
    let next_time = parse(&job_expression, &Utc::now())?;
    let _ = sqlx::query!(
        "UPDATE cronjobs SET next_execute_at = $1 WHERE id = $2",
        next_time,
        job_id
    )
    .execute(pool)
    .await?;
    // 任务执行成功后，自动更新自己的下次执行时间
    info!("Reloaded job {} next execute time", job_id);
    if judge_time(next_time) {
        // 下次执行时间 - 当前时间 < redis 的保存时间
        heap.add_job(job_id, next_time.timestamp_millis()).await?; // 这块不用修正，符合新逻辑
    }
    Ok(())
}

// 初始化操作
pub async fn init_job_from_sql(pool: &PgPool, heap: JobScheduler) -> Result<(), anyhow::Error> {
    let cronjob_id_expression_list =
        sqlx::query!("SELECT id,cron_expression,enabled FROM cronjobs")
            .fetch_all(pool)
            .await?;
    let job_list: Vec<(i32, String)> = cronjob_id_expression_list
        .into_iter()
        .filter(|row| row.enabled)
        .map(|row| (row.id, row.cron_expression))
        .collect();
    // 如果看到有running的任务 说明上次没执行完这个任务，则记录下warning
    let unknown_list = sqlx::query!("SELECT id, name FROM cronjobs WHERE status = 'RUNNING'")
        .fetch_all(pool)
        .await?;

    for job in &unknown_list {
        warn!(
            "job {} ({}) was RUNNING on last exit, marking as UNKNOWN",
            job.id,
            job.name.as_deref().unwrap_or_default()
        );
    }
    let tasks: Vec<_> = job_list
        .into_iter()
        .map(|(job_id, _job_expression)| {
            let pool = pool.clone(); // clone 引用计数
            let heap = heap.clone();
            async move {
                debug!("job {} reloaded from sql", job_id);
                reload_single_job(&pool, job_id, heap).await
            }
        })
        .collect();
    let results = join_all(tasks).await;
    for result in results {
        result?;
    }
    Ok(())
}

// 定时 reload。redis存近3min的任务，每1min循环一次数据库
pub async fn reload_job_from_sql(
    pool: &PgPool,
    heap: JobScheduler,
    save_secs: u64,
) -> Result<(), anyhow::Error> {
    let save_time = Utc::now() + Duration::seconds(save_secs as i64);
    let due_job = sqlx::query!(
        r#"
    SELECT id,next_execute_at  FROM cronjobs
    WHERE enabled = true
    AND next_execute_at <= $1
    "#,
        save_time
    )
    .fetch_all(pool)
    .await?;
    let job_list = due_job
        .into_iter()
        .map(|due_job| (due_job.id, due_job.next_execute_at))
        .collect::<Vec<(i32, DateTime<Utc>)>>();

    let tasks: Vec<_> = job_list
        .into_iter()
        .map(|(job_id, next_execute_at)| {
            let heap = heap.clone();
            async move {
                info!("job {} add to queue from reload sql", job_id);
                heap.add_job(job_id, next_execute_at.timestamp_millis())
                    .await
            }
        })
        .collect();
    let results = join_all(tasks).await;
    for result in results {
        result?;
    }
    Ok(())
}

pub async fn batch_job_execute(
    job_id: Option<i32>,
    pool: &PgPool,
    msg: CronJob,
) -> Result<tokio::sync::mpsc::Receiver<Result<Bytes, std::io::Error>>, anyhow::Error> {
    if !msg.enabled {
        return Err(anyhow::anyhow!("Batch job is not enabled"));
    }
    let command = msg.command;

    // 如果 group_id 不存在，直接返回错误
    let group_id = msg
        .group_id
        .ok_or_else(|| anyhow::anyhow!("group_id is required"))?;

    let server_list: Vec<ServiceTerminal> = get_server_by_group_id_db(pool, group_id)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to get server by group_id: {}", e))?;

    let ssh_user = server_list[0].ssh_user.clone();
    let password = passwd_decrypt(server_list[0].password.clone())
        .map_err(|e| anyhow::anyhow!("Failed to change password: {}", e))?;

    let port = server_list[0].port.to_string();
    let server_list: Vec<String> = server_list.into_iter().map(|e| e.ip.clone()).collect();

    let msg = Message::new(ssh_user, password, port, None, Some(server_list));
    let rx = batch_server_ssh_back(job_id, pool, msg, command)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to get rx: {}", e))?;

    Ok(rx)
}

pub async fn single_job_execute(
    job_id: Option<i32>,
    pool: &PgPool,
    msg: CronJob,
) -> Result<(u32, String), anyhow::Error> {
    if !msg.enabled {
        return Err(anyhow::anyhow!("Single job is not enabled"));
    }
    let command = msg.command;
    let server_id = msg
        .server_id
        .ok_or_else(|| anyhow::anyhow!("server_id is required"))?;
    let server = get_server_by_id_db(pool, server_id)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to get server by group_id: {}", e))?;
    let msg = Message::new(
        server.ssh_user,
        server.password.clone(),
        server.port.to_string(),
        Some(server.ip),
        None,
    );
    let (code, output) = single_server_ssh_back(job_id, pool, msg, command.clone())
        .await
        .map_err(|e| anyhow::anyhow!("Failed to get output: {}", e))?;

    Ok((code, output))
}
