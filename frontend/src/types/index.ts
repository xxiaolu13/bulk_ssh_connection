// Group Types
export interface Group {
  group_id: number;
  name: string;
  description?: string;
}

export interface CreateGroup {
  name: string;
  description?: string;
}

export interface UpdateGroup {
  name?: string;
  description?: string;
}

// Server Types
export interface Server {
  id: number;
  name?: string;
  group_id?: number;
  ssh_user: string;
  ip: string;
  port: number;
  password: string;
}

export interface CreateSingleServer {
  name?: string;
  group_id?: number;
  ssh_user?: string;
  ip: string;
  port?: number;
  password: string;
}

export interface CreateGroupServer {
  name?: string;
  group_id: number;
  ssh_user?: string;
  ip: string[];
  port?: number;
  password: string;
}

export interface UpdateServer {
  name?: string;
  group_id?: number;
  ssh_user?: string;
  ip?: string;
  port?: number;
  password?: string;
}

// Cron Job Types
export interface CronJob {
  id: number;
  name?: string;
  cron_expression: string;
  server_id?: number;
  group_id?: number;
  job_type: string;
  command: string;
  job_config: any;
  status: string;
  enabled: boolean;
  timeout_secs: number;
  retry_count: number;
  current_retry: number;
  last_executed_at?: string;
  next_execute_at: string;
  started_at?: string;
  finished_at?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCronJob {
  name?: string;
  cron_expression: string;
  server_id?: number;
  group_id?: number;
  job_type?: string;
  command: string;
  job_config?: any;
  enabled: boolean;
  timeout_secs: number;
  retry_count: number;
  description?: string;
}

export interface UpdateCronJob {
  name?: string;
  cron_expression?: string;
  server_id?: number;
  group_id?: number;
  job_type?: string;
  command?: string;
  job_config?: any;
  status?: string;
  enabled?: boolean;
  timeout_secs?: number;
  retry_count?: number;
  current_retry?: number;
  description?: string;
}

// Cron Log Types
export interface CronLog {
  log_id: number;
  job_id: number;
  server_ip?: string;
  status: string;
  output?: string;
  duration_ms?: number;
  created_at: string;
}

// SSH Types
export interface SshRequest {
  server_id: number;
  command: string;
}

export interface BatchSshRequest {
  group_id: number;
  command: string;
}

export interface SshResponse {
  exit_code: number;
  output: string;
}

export interface SshResult {
  server: string;
  output: string;
  exit_code?: number;
}

export interface SshError {
  server: string;
  output: string;
  exit_code?: number;
}
