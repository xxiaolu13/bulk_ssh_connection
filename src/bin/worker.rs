use anyhow::Result;
use connect_ok::domain::scheduler::JobScheduler;
use connect_ok::repository::cron_job::*;
use connect_ok::scheduler::prepare::*;
use dotenvy::dotenv;
use log::warn;
use sqlx::{PgPool, Pool, Postgres};
use std::env;
use std::sync::Arc;
use tokio::sync::Semaphore;
use tokio::{signal, task::JoinSet};
use tracing::{debug, error, info};

fn start(
    worker_pool: Pool<Postgres>,
    worker_heap: JobScheduler,
    worker_semaphore: Arc<Semaphore>,
) -> tokio::task::JoinHandle<()> {
    tokio::spawn(async move {
        loop {
            let worker_pool2 = worker_pool.clone();
            let worker_heap2 = worker_heap.clone();
            let worker_semaphore2 = worker_semaphore.clone();

            match worker_heap.get_job().await {
                Ok(Some(job_id)) => {
                    info!("job {} should run", job_id);
                    // 先查询timeout_secs
                    let timeout_secs =
                        match sqlx::query!("select timeout_secs from cronjobs where id=$1", job_id)
                            .fetch_one(&worker_pool2)
                            .await
                        {
                            Ok(row) => row.timeout_secs as u64,
                            Err(e) => {
                                error!("Failed to get timeout_secs for job {}: {:?}", job_id, e);
                                tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
                                continue;
                            }
                        };

                    // get semaphore
                    let permit = match worker_semaphore2.clone().acquire_owned().await {
                        Ok(permit) => permit,
                        Err(e) => {
                            error!("Failed to acquire semaphore for job {}: {:?}", job_id, e);
                            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
                            continue;
                        }
                    };

                    // 一个任务的多个ssh

                    // let mut ssh_tasks = JoinSet::new();
                    // ssh_tasks.spawn(async move{

                    // })
                    tokio::spawn(async move {
                        let _permit = permit; // drop semaphore

                        let result = tokio::time::timeout(
                            tokio::time::Duration::from_secs(timeout_secs),
                            process_job(&worker_pool2, &worker_heap2, job_id),
                        )
                        .await;

                        match result {
                            Ok(Ok(_)) => {} // process_job 成功，状态已在内部更新
                            Ok(Err(e)) => {
                                // process_job 返回错误
                                error!("Failed to process job {}: {:?}", job_id, e);
                                let _ = tokio::time::timeout(
                                    tokio::time::Duration::from_secs(timeout_secs),
                                    retry_process_job(&worker_pool2, &worker_heap2, job_id),
                                )
                                .await;
                            }
                            Err(_) => {
                                // 超时
                                error!("job {} timed out after {} secs", job_id, timeout_secs);
                                let _ = update_job_status(&worker_pool2, job_id, JobStatus::Failed)
                                    .await;
                                let _ = tokio::time::timeout(
                                    tokio::time::Duration::from_secs(timeout_secs),
                                    retry_process_job(&worker_pool2, &worker_heap2, job_id),
                                )
                                .await;
                            }
                        }
                    });
                }
                Ok(None) => {
                    debug!("No jobs available");
                    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
                }
                Err(e) => {
                    error!("Scheduler error: {:?}", e);
                    // 防止 Redis 挂了导致 CPU 空转 100%
                    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
                }
            }
        }
    })
}
fn reload_db_backend_task(
    reload_sec: u64,
    save_sec: u64,
    pool: PgPool,
    heap: JobScheduler,
) -> tokio::task::JoinHandle<()> {
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(reload_sec));
        interval.tick().await;
        loop {
            interval.tick().await;
            match reload_job_from_sql(&pool, heap.clone(), save_sec).await {
                Ok(_) => info!("Reload job from sql success"),
                Err(_) => error!("Failed to reload job from sql!!"),
            };
        }
    })
}

// 业务逻辑抽离出来
async fn process_job(pool: &PgPool, heap: &JobScheduler, job_id: i32) -> Result<(), anyhow::Error> {
    info!("job {} start execute", job_id);
    let msg = get_cronjob_by_id_db(pool, job_id).await?;
    match msg.group_id {
        Some(_) => {
            batch_job_execute(Some(job_id), pool, msg.clone()).await?;
            heap.del_job(msg.id).await?; // 任务完成 从processing移除
        }
        None => {
            single_job_execute(Some(job_id), pool, msg.clone()).await?;
            heap.del_job(msg.id).await?;
        }
    }
    reload_single_job(pool, msg.id, heap.clone()).await?;
    Ok(())
}

async fn retry_process_job(pool: &PgPool, heap: &JobScheduler, job_id: i32) -> Result<()> {
    let retry_count = sqlx::query!("select retry_count from cronjobs where id = $1", job_id)
        .fetch_one(pool)
        .await
        .map(|row| row.retry_count)
        .unwrap_or(1); // 失败时默认重试1次
    if retry_count > 0 {
        info!("job{} start retry", job_id);
        let mut i = 0;
        while i < retry_count {
            i += 1;
            match process_job(pool, heap, job_id).await {
                Ok(_) => {
                    info!("job {} retry {} times success", job_id, i);
                    return Ok(());
                }
                _ => {
                    error!("job {} retry {} times failed", job_id, i);
                }
            }
            tokio::time::sleep(tokio::time::Duration::from_millis(200)).await; // 间隔200ms，这块的时间可能影响大时间的任务
            // 任务在重试机制后，如果失败，就再也不会执行了
        }
        // enabled 字段换成 false，关闭任务
        let _ = update_job_enabled(pool, job_id, false).await;
        // status 字段换成dead 证明了服务重试仍然失败
        let _ = update_job_status(pool, job_id, JobStatus::Dead).await;
        error!(
            "job {} all retry failed The job has been actively closed by the program",
            job_id
        )
    } else {
        warn!("job {} retry_count is 0, skip retry", job_id);
        return Ok(());
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    dotenv().ok();
    tracing_subscriber::fmt::init();
    info!("Process started with PID: {}", std::process::id());
    let db_url = std::env::var("DATABASE_URL").expect("notfound env var DATABASE_URL");
    info!("Using DATABASE_URL: {}", &db_url);

    let reload_sec: u64 = std::env::var("RELOAD_SECS")
        .unwrap_or("100".to_string())
        .parse()
        .expect("RELOAD_SECS must be number");
    let save_sec: u64 = std::env::var("SAVE_SECS")
        .unwrap_or("300".to_string())
        .parse()
        .expect("SAVE_SECS must be number");
    let pool = PgPool::connect(&db_url).await?;
    let heap = JobScheduler::new().await?;
    heap.clear_all_jobs().await?; // 清空所有队列
    info!(
        "Worker reloads every {} secs,Redis save {} secs",
        reload_sec, save_sec
    );

    let max_concurrent: usize = env::var("MAX_CONCURRENT_JOBS")
        .unwrap_or("10".to_string())
        .parse()
        .unwrap_or(10);

    let semaphore = Arc::new(Semaphore::new(max_concurrent));
    info!("Max concurrent jobs: {}", max_concurrent);

    // 初始化加载
    let pool1 = pool.clone();
    let heap1 = heap.clone();
    // 首次运行 先reload next execute at,如果不这么做，在执行时候，worker会有任务补偿，将所有任务都执行一遍
    let _ = init_job_from_sql(&pool, heap.clone()).await?;

    // 定时轮询数据库
    let _reload_handle = reload_db_backend_task(reload_sec, save_sec, pool1, heap1);
    // worker启动
    let worker_pool = pool.clone();
    let worker_heap = heap.clone();
    let worker_semaphore = semaphore.clone();

    start(worker_pool, worker_heap, worker_semaphore);

    match signal::ctrl_c().await {
        Ok(()) => info!("Received Ctrl-C, shutting down..."),
        Err(err) => error!("Unable to listen for shutdown signal: {}", err),
    }

    Ok(())
}
