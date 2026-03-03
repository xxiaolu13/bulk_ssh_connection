use crate::domain::cron_job::{CreateCronJob, CronJob, CronJobExecutor, UpdateCronJob};
use crate::domain::scheduler::JobScheduler;
use crate::repository::server::get_server_by_id_db;
use crate::repository::servergroup::get_group_by_id_db;
use crate::scheduler::prepare::judge_time;
use chrono::Utc;
use cron_parser::parse;
use log::debug;
use sqlx::PgPool;
use tracing::info;

pub async fn get_all_cronjobs_db(pool: &PgPool) -> Result<Vec<CronJob>, anyhow::Error> {
    let rows = sqlx::query_as!(
        CronJob,
        "select id, name, cron_expression, server_id, group_id, job_type, command, job_config, status, enabled, timeout_secs as \"timeout_secs!\", retry_count as \"retry_count!\", current_retry as \"current_retry!\", description, last_executed_at, next_execute_at, started_at, finished_at, created_at, updated_at from cronjobs"
    ).fetch_all(pool).await?;
    match rows.len() {
        0 => Err(anyhow::Error::msg("get all cronjobs not found")),
        _ => Ok(rows),
    }
}

pub async fn get_cronjob_by_id_db(pool: &PgPool, id: i32) -> Result<CronJob, anyhow::Error> {
    let row = sqlx::query_as!(
        CronJob,
        "select id, name, cron_expression, server_id, group_id, job_type, command, job_config, status, enabled, timeout_secs as \"timeout_secs!\", retry_count as \"retry_count!\", current_retry as \"current_retry!\", description, last_executed_at, next_execute_at, started_at, finished_at, created_at, updated_at from cronjobs where id=$1",
        id
    ).fetch_one(pool).await?;
    Ok(row)
}

pub async fn create_cronjob_db(
    pool: &PgPool,
    params: CreateCronJob,
) -> Result<CreateCronJob, anyhow::Error> {
    let next_time = params.next_tick()?;

    // 验证 job_type 是否有效
    let valid_job_types = ["SSH", "HTTP", "SQL"];
    if !valid_job_types.contains(&params.job_type.as_str()) {
        return Err(anyhow::Error::msg(format!(
            "Invalid job_type: {}, must be one of {:?}",
            params.job_type, valid_job_types
        )));
    }

    // 验证 server_id 和 group_id
    match (params.server_id, params.group_id) {
        (Some(sid), Some(gid)) => {
            get_server_by_id_db(pool, sid).await?;
            get_group_by_id_db(pool, gid).await?;
        }
        (Some(sid), None) => {
            get_server_by_id_db(pool, sid).await?;
        }
        (None, Some(gid)) => {
            get_group_by_id_db(pool, gid).await?;
        }
        (None, None) => {
            return Err(anyhow::Error::msg("must provide server_id or group_id"));
        }
    }

    // SSH 类型的任务需要有 server_id
    if params.job_type == "SSH" && params.server_id.is_none() && params.group_id.is_none() {
        return Err(anyhow::Error::msg(
            "SSH job type must provide server_id or group_id",
        ));
    }

    debug!("create new cronjob db");
    let row = sqlx::query!(
        r#"
        INSERT INTO cronjobs (name, cron_expression, server_id, group_id, job_type, command, job_config, status, enabled, timeout_secs, retry_count, current_retry, description, next_execute_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
        "#,
        params.name.clone(),
        params.cron_expression.clone(),
        params.server_id,
        params.group_id,
        params.job_type.clone(),
        params.command.clone(),
        params.job_config,
        "PENDING", // 默认状态
        params.enabled,
        params.timeout_secs,
        params.retry_count,
        0, // current_retry 默认为 0
        params.description.clone(),
        next_time
    ).fetch_one(pool).await?;

    if params.enabled {
        // 要看enabled是否开启
        let heap = JobScheduler::new().await?;
        if judge_time(next_time) {
            // 下次执行时间 - 当前时间 < redis 的保存时间
            heap.add_job(row.id, next_time.timestamp_millis()).await?;
        }
        info!("created new cronjob: {:?}", row);
    }

    Ok(CreateCronJob {
        name: params.name,
        cron_expression: params.cron_expression,
        server_id: params.server_id,
        group_id: params.group_id,
        job_type: params.job_type,
        command: params.command,
        job_config: params.job_config,
        enabled: params.enabled,
        timeout_secs: params.timeout_secs,
        retry_count: params.retry_count,
        description: params.description,
        next_execute_at: next_time,
    })
}

fn check<T>(a: Option<T>, b: Option<T>) -> Option<T> {
    a.or(b)
}

pub async fn delete_cronjob_by_id_db(pool: &PgPool, id: i32) -> Result<String, anyhow::Error> {
    let this_job = get_cronjob_by_id_db(pool, id).await?;

    // 从调度器中删除待执行任务
    let heap = JobScheduler::new().await?;
    heap.del_job_pending(this_job.id).await?;

    // 删除数据库中的任务
    let _row = sqlx::query!("delete from cronjobs where id=$1", id)
        .execute(pool)
        .await?;
    Ok(format!("Successfully deleted cronjob with id: {}", id))
}

pub async fn update_cronjob_db(
    pool: &PgPool,
    id: i32,
    params: UpdateCronJob,
) -> Result<CronJob, anyhow::Error> {
    let this_job = get_cronjob_by_id_db(pool, id).await?;
    let name = check(params.name.clone(), this_job.name.clone());
    let cron_expression = if let Some(e) = params.cron_expression {
        e
    } else {
        this_job.cron_expression.clone()
    };
    let group_id = check(params.group_id.clone(), this_job.group_id.clone());
    let server_id = check(params.server_id.clone(), this_job.server_id.clone());
    let job_type = params
        .job_type
        .clone()
        .unwrap_or_else(|| this_job.job_type.clone());
    let command = if let Some(e) = params.command {
        e
    } else {
        this_job.command.clone()
    };
    let job_config = params
        .job_config
        .clone()
        .unwrap_or_else(|| this_job.job_config.clone());
    let status = params
        .status
        .clone()
        .unwrap_or_else(|| this_job.status.clone());
    let enabled = if let Some(e) = params.enabled {
        e
    } else {
        this_job.enabled.clone()
    };
    let timeout_secs = check(params.timeout_secs.clone(), Some(this_job.timeout_secs));
    let retry_count = check(params.retry_count.clone(), Some(this_job.retry_count));
    let current_retry = check(params.current_retry.clone(), Some(this_job.current_retry));
    let description = check(params.description.clone(), this_job.description.clone());
    let next_execute_at = parse(&cron_expression, &Utc::now())?;

    let heap = JobScheduler::new().await?;
    // 如果更改表达式，则重新判断这条任务是否进入heap,并且需要enabled为true
    if cron_expression != this_job.cron_expression && enabled {
        if judge_time(next_execute_at) {
            heap.add_job(this_job.id, next_execute_at.timestamp_millis())
                .await?;
        } else {
            heap.del_job_pending(this_job.id).await?;
            // 意义为 如果开启任务，这个分支代表了下次执行时间大于save time的任务，那么就从redis删除，等待reload进入redis
        }
    } else if enabled != this_job.enabled && enabled == false {
        // 修改了enable且为false
        info!("enabled changed..");
        heap.del_job_pending(this_job.id).await?;
    } else if enabled != this_job.enabled && enabled == true {
        // 修改了enable且为true
        info!("enabled changed..");
        if judge_time(next_execute_at) {
            // 代表了下次执行时间小于于save time的任务，add进入Redis
            heap.add_job(this_job.id, next_execute_at.timestamp_millis())
                .await?;
        }
    }

    // 验证 job_type 是否有效（如果被修改）
    if params.job_type.is_some() {
        let valid_job_types = ["SSH", "HTTP", "SQL"];
        if !valid_job_types.contains(&job_type.as_str()) {
            return Err(anyhow::Error::msg(format!(
                "Invalid job_type: {}, must be one of {:?}",
                job_type, valid_job_types
            )));
        }
    }

    // 验证 server_id 和 group_id
    match (server_id, group_id) {
        (Some(sid), Some(gid)) => {
            get_server_by_id_db(pool, sid).await?;
            get_group_by_id_db(pool, gid).await?;
        }
        (Some(sid), None) => {
            get_server_by_id_db(pool, sid).await?;
        }
        (None, Some(gid)) => {
            get_group_by_id_db(pool, gid).await?;
        }
        (None, None) => {
            return Err(anyhow::Error::msg("must provide server_id or group_id"));
        }
    }

    // SSH 类型的任务需要有 server_id 或 group_id
    if job_type == "SSH" && server_id.is_none() && group_id.is_none() {
        return Err(anyhow::Error::msg(
            "SSH job type must provide server_id or group_id",
        ));
    }

    let row = sqlx::query_as!(
        CronJob,
        r#"
        UPDATE cronjobs
        SET name=$1, cron_expression=$2, group_id=$3, server_id=$4, job_type=$5, command=$6, job_config=$7, status=$8, enabled=$9, timeout_secs=$10, retry_count=$11, current_retry=$12, description=$13, next_execute_at=$14
        WHERE id=$15
        RETURNING id, name, cron_expression, server_id, group_id, job_type, command, job_config, status, enabled, timeout_secs as "timeout_secs!", retry_count as "retry_count!", current_retry as "current_retry!", description, last_executed_at, next_execute_at, started_at, finished_at, created_at, updated_at
        "#,
        name, cron_expression, group_id, server_id, job_type, command, job_config, status, enabled, timeout_secs, retry_count, current_retry, description, next_execute_at, id
    ).fetch_one(pool).await?;
    Ok(row)
}

// repository/cron_job.rs 里加这个

#[derive(Debug, sqlx::Type, PartialEq, Clone)]
#[sqlx(type_name = "varchar", rename_all = "UPPERCASE")]
pub enum JobStatus {
    Pending,
    Running,
    Success,
    Failed,
    Dead,
    Unknown,
}

pub async fn update_job_status(
    pool: &PgPool,
    job_id: i32,
    status: JobStatus,
) -> Result<(), anyhow::Error> {
    match status {
        JobStatus::Running => {
            sqlx::query!(
                "UPDATE cronjobs SET status = 'RUNNING', started_at = NOW(), updated_at = NOW() WHERE id = $1",
                job_id
            )
            .execute(pool)
            .await?;
        }
        JobStatus::Success => {
            sqlx::query!(
                "UPDATE cronjobs SET status = 'SUCCESS', finished_at = NOW(), updated_at = NOW() WHERE id = $1",
                job_id
            )
            .execute(pool)
            .await?;
        }
        JobStatus::Failed => {
            sqlx::query!(
                "UPDATE cronjobs SET status = 'FAILED', finished_at = NOW(), updated_at = NOW() WHERE id = $1",
                job_id
            )
            .execute(pool)
            .await?;
        }
        JobStatus::Dead => {
            // 替换掉原来的 UPDATE enabled = false
            sqlx::query!(
                "UPDATE cronjobs SET status = 'DEAD', enabled = false, finished_at = NOW(), updated_at = NOW() WHERE id = $1",
                job_id
            )
            .execute(pool)
            .await?;
        }
        JobStatus::Pending => {
            sqlx::query!(
                "UPDATE cronjobs SET status = 'PENDING', updated_at = NOW() WHERE id = $1",
                job_id
            )
            .execute(pool)
            .await?;
        }
        JobStatus::Unknown => {
            sqlx::query!(
                "UPDATE cronjobs SET status = 'UNKNOWN', updated_at = NOW() WHERE id = $1",
                job_id
            )
            .execute(pool)
            .await?;
        }
    }
    Ok(())
}

pub async fn update_job_enabled(pool: &PgPool, job_id: i32, enabled: bool) -> Result<(), anyhow::Error> {
    sqlx::query!(
        "UPDATE cronjobs SET enabled = $1, updated_at = NOW() WHERE id = $2",
        enabled,
        job_id
    )
    .execute(pool)
    .await?;
    Ok(())
}
