use actix_web::web;
use anyhow::anyhow;
use chrono::{DateTime, Local, Utc};
use cron_parser::parse;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct CronJob {
    pub id: i32,
    pub name: Option<String>,
    pub cron_expression: String,
    pub server_id: Option<i32>,
    pub group_id: Option<i32>,
    pub job_type: String,
    pub command: String,
    pub job_config: serde_json::Value,
    pub status: String,
    pub enabled: bool,
    pub timeout_secs: i32,
    pub retry_count: i32,
    pub current_retry: i32,
    pub last_executed_at: Option<DateTime<Utc>>,
    pub next_execute_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub finished_at: Option<DateTime<Utc>>,
    pub description: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl TryFrom<web::Json<CronJob>> for CronJob {
    type Error = actix_web::Error;
    fn try_from(json: web::Json<CronJob>) -> actix_web::Result<CronJob, Self::Error> {
        Ok(CronJob {
            id: json.id,
            name: json.name.clone(),
            cron_expression: json.cron_expression.clone(),
            server_id: json.server_id,
            group_id: json.group_id,
            job_type: json.job_type.clone(),
            command: json.command.clone(),
            job_config: json.job_config.clone(),
            status: json.status.clone(),
            enabled: json.enabled,
            timeout_secs: json.timeout_secs,
            retry_count: json.retry_count,
            current_retry: json.current_retry,
            description: json.description.clone(),
            last_executed_at: json.last_executed_at.clone(),
            next_execute_at: json.next_execute_at.clone(),
            started_at: json.started_at.clone(),
            finished_at: json.finished_at.clone(),
            created_at: json.created_at.clone(),
            updated_at: json.updated_at.clone(),
        })
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CreateCronJob {
    pub name: Option<String>,
    pub cron_expression: String,
    pub server_id: Option<i32>,
    pub group_id: Option<i32>,
    #[serde(default = "default_job_type")]
    pub job_type: String,
    pub command: String,
    #[serde(default = "default_job_config")]
    pub job_config: serde_json::Value,
    pub enabled: bool,
    pub timeout_secs: i32,
    pub retry_count: i32,
    pub description: Option<String>,
    #[serde(skip_deserializing)]
    pub next_execute_at: DateTime<Utc>,
}

fn default_job_type() -> String {
    "SSH".to_string()
}

fn default_job_config() -> serde_json::Value {
    serde_json::json!({})
}
impl TryFrom<web::Json<CreateCronJob>> for CreateCronJob {
    type Error = actix_web::Error;
    fn try_from(json: web::Json<CreateCronJob>) -> actix_web::Result<CreateCronJob, Self::Error> {
        Ok(CreateCronJob {
            name: json.name.clone(),
            cron_expression: json.cron_expression.clone(),
            server_id: json.server_id,
            group_id: json.group_id,
            job_type: json.job_type.clone(),
            command: json.command.clone(),
            job_config: json.job_config.clone(),
            enabled: json.enabled,
            timeout_secs: json.timeout_secs,
            retry_count: json.retry_count,
            description: json.description.clone(),
            next_execute_at: json.next_execute_at.clone(),
        })
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UpdateCronJob {
    pub name: Option<String>,
    pub cron_expression: Option<String>,
    pub server_id: Option<i32>,
    pub group_id: Option<i32>,
    pub job_type: Option<String>,
    pub command: Option<String>,
    pub job_config: Option<serde_json::Value>,
    pub status: Option<String>,
    pub enabled: Option<bool>,
    pub timeout_secs: Option<i32>,
    pub retry_count: Option<i32>,
    pub current_retry: Option<i32>,
    pub description: Option<String>,
    #[serde(skip_deserializing)]
    pub next_execute_at: Option<DateTime<Utc>>,
}

impl TryFrom<web::Json<UpdateCronJob>> for UpdateCronJob {
    type Error = actix_web::Error;
    fn try_from(json: web::Json<UpdateCronJob>) -> actix_web::Result<UpdateCronJob, Self::Error> {
        Ok(UpdateCronJob {
            name: json.name.clone(),
            cron_expression: json.cron_expression.clone(),
            server_id: json.server_id,
            group_id: json.group_id,
            job_type: json.job_type.clone(),
            command: json.command.clone(),
            job_config: json.job_config.clone(),
            status: json.status.clone(),
            enabled: json.enabled,
            timeout_secs: json.timeout_secs,
            retry_count: json.retry_count,
            current_retry: json.current_retry,
            description: json.description.clone(),
            next_execute_at: json.next_execute_at.clone(),
        })
    }
}

pub trait CronJobExecutor {
    fn get_cron_expression(&self) -> &str;
    fn next_tick(&self) -> Result<DateTime<Utc>, anyhow::Error> {
        let time = parse(self.get_cron_expression(), &Local::now())
            .map_err(|e| anyhow!("Invalid cron expression: {}", e))?;
        Ok(time.with_timezone(&Utc))
    }
}

impl CronJobExecutor for CronJob {
    fn get_cron_expression(&self) -> &str {
        &self.cron_expression
    }
}

impl CronJobExecutor for CreateCronJob {
    fn get_cron_expression(&self) -> &str {
        &self.cron_expression
    }
}
