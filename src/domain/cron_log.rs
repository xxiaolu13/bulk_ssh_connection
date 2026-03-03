use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Clone,Debug,Serialize,Deserialize)]
pub struct CronLog{
    pub log_id :i32,
    pub job_id :i32,
    pub server_ip :Option<String>,
    pub status :String,
    pub output :Option<String>,
    pub duration_ms :Option<i32>,
    pub created_at: DateTime<Utc>
}

#[derive(Clone,Debug,Serialize,Deserialize)]
pub struct CreateCronLog{
    pub job_id :i32,
    pub server_ip :Option<String>,
    pub status :String,
    pub output :Option<String>,
    pub duration_ms :Option<i32>
}

impl CreateCronLog{
    pub fn new(job_id: i32, server_ip: Option<String>, status: String, output: Option<String>) -> Self{
        Self { job_id, server_ip, status, output, duration_ms: None }
    }

    pub fn new_with_duration(job_id: i32, server_ip: Option<String>, status: String, output: Option<String>, duration_ms: Option<i32>) -> Self{
        Self { job_id, server_ip, status, output, duration_ms }
    }
}