-- ==========================================
-- 1. 基础配置与扩展
-- ==========================================
CREATE DATABASE connect_management;
\c connect_management

-- 开启扩展（用于更灵活的任务配置处理）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. 服务器组别表
-- ==========================================
CREATE SEQUENCE IF NOT EXISTS groups_id_seq;
CREATE TABLE groups (
    group_id    integer      DEFAULT nextval('groups_id_seq'::regclass) NOT NULL PRIMARY KEY,
    name        varchar(100) NOT NULL UNIQUE,
    description text,
    created_at  timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. 服务器资产表
-- ==========================================
CREATE TABLE servers (
    id            serial PRIMARY KEY,
    name          varchar(255),
    group_id      integer CONSTRAINT fk_group REFERENCES groups ON UPDATE CASCADE ON DELETE SET NULL,
    ssh_user      varchar(100) DEFAULT 'root' NOT NULL,
    ip            varchar(45)  NOT NULL,
    port          integer      DEFAULT 22     NOT NULL,
    password_hash text         NOT NULL,
    created_at    timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at    timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_ip_port UNIQUE (ip, port)
);

-- ==========================================
-- 4. 任务主表 (CronJobs) - 已整合 Phase 1 & 2
-- ==========================================
CREATE SEQUENCE IF NOT EXISTS cron_jobs_id_seq;

CREATE TABLE IF NOT EXISTS cronjobs (
    id               integer      DEFAULT nextval('cron_jobs_id_seq'::regclass) NOT NULL PRIMARY KEY,
    name             varchar(255),
    cron_expression  varchar(100) NOT NULL,

    -- 任务执行对象
    server_id        integer CONSTRAINT fk_server REFERENCES servers(id) ON UPDATE CASCADE ON DELETE CASCADE,
    group_id         integer CONSTRAINT fk_group REFERENCES groups(group_id) ON UPDATE CASCADE ON DELETE CASCADE,

    -- 任务类型抽象 (Phase 2.1)
    job_type         varchar(20)  DEFAULT 'SSH' NOT NULL, -- SSH, HTTP, SQL
    command          text         NOT NULL,               -- 保持兼容，存核心命令
    job_config       jsonb        DEFAULT '{}'::jsonb,    -- 存储扩展配置 (如HTTP Header, SQL连接串)

    -- 状态机控制 (Phase 1.1)
    -- 状态流: PENDING -> RUNNING -> SUCCESS/FAILED/DEAD
    status           varchar(20)  DEFAULT 'PENDING' NOT NULL,
    enabled          boolean      DEFAULT true NOT NULL,

    -- 超时与重试 (Phase 1.3)
    timeout_secs     integer      DEFAULT 10 NOT NULL,
    retry_count      integer      DEFAULT 0  NOT NULL,     -- 最大重试次数
    current_retry    integer      DEFAULT 0  NOT NULL,     -- 当前已重试次数

    -- 时间线
    last_executed_at timestamp with time zone,
    next_execute_at  timestamp with time zone NOT NULL,
    started_at       timestamp with time zone,      -- 本次任务启动时间
    finished_at      timestamp with time zone,      -- 本次任务结束时间

    description      text,
    created_at       timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at       timestamp with time zone DEFAULT CURRENT_TIMESTAMP,

    -- 约束
    CONSTRAINT check_server_or_group
        CHECK ((server_id IS NOT NULL) OR (group_id IS NOT NULL))
);

-- ==========================================
-- 5. 任务日志表 (Phase 2.3)
-- ==========================================
CREATE TABLE IF NOT EXISTS cronjob_logs (
    log_id          serial PRIMARY KEY,
    job_id          integer NOT NULL CONSTRAINT fk_cronjob REFERENCES cronjobs(id) ON UPDATE CASCADE ON DELETE CASCADE,
    server_ip       varchar(45), -- 记录执行时的具体IP
    status          varchar(20) NOT NULL,
    output          text,        -- 存储执行结果或错误堆栈
    duration_ms     integer,     -- 耗时(毫秒)
    created_at      timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==========================================
-- 6. 索引优化 (Phase 1.2 关键)
-- ==========================================

-- 调度器核心索引：快速筛选待执行任务
CREATE INDEX idx_cronjobs_dispatch ON cronjobs (next_execute_at, status)
WHERE enabled = true AND status = 'PENDING';

-- 其他常用索引
CREATE INDEX idx_cronjobs_server_id ON cronjobs(server_id);
CREATE INDEX idx_cronjobs_group_id ON cronjobs(group_id);
CREATE INDEX idx_cronjob_logs_job_id ON cronjob_logs(job_id);
CREATE INDEX idx_cronjob_logs_created_at ON cronjob_logs(created_at);

-- ==========================================
-- 7. 触发器 (自动更新 updated_at)
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_groups_modtime BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servers_modtime BEFORE UPDATE ON servers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cronjobs_modtime BEFORE UPDATE ON cronjobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
