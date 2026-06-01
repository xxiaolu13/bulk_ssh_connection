/**
 * 应用配置常量
 */
export const APP_CONFIG = {
  /**
   * 应用名称
   */
  APP_NAME: 'Bulk SSH Connection',

  /**
   * 应用版本
   */
  APP_VERSION: '1.0.0',

  /**
   * 默认分页大小
   */
  DEFAULT_PAGE_SIZE: 20,

  /**
   * 分页大小选项
   */
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,

  /**
   * 表格默认列配置
   */
  TABLE_CONFIG: {
    bordered: true as boolean,
    stripe: true as boolean,
    hover: true as boolean,
    size: 'middle' as const,
  },

  /**
   * 表单默认配置
   */
  FORM_CONFIG: {
    layout: 'vertical' as const,
    autoComplete: 'off' as const,
  },
} as const;

/**
 * 状态枚举
 */
export const STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  RUNNING: 'running',
  PENDING: 'pending',
  ENABLED: 'enabled',
  DISABLED: 'disabled',
} as const;

/**
 * Cron 任务类型
 */
export const CRON_JOB_TYPES = {
  SSH: 'SSH',
} as const;

/**
 * 快捷命令列表
 */
export const QUICK_COMMANDS = [
  { label: 'whoami', command: 'whoami' },
  { label: 'uptime', command: 'uptime' },
  { label: 'df -h', command: 'df -h' },
  { label: 'free -m', command: 'free -m' },
  { label: 'ps aux', command: 'ps aux' },
  { label: 'uname -a', command: 'uname -a' },
  { label: 'ls -la', command: 'ls -la' },
  { label: 'top', command: 'top -b -n 1' },
] as const;

/**
 * 菜单项配置
 */
export const MENU_ITEMS = [
  {
    key: 'server',
    label: '服务器列表',
    icon: 'IconStorage',
    path: '/server',
  },
  {
    key: 'cron',
    label: '计划任务',
    icon: 'IconClockCircle',
    path: '/cron',
  },
  {
    key: 'batch',
    label: '批量终端',
    icon: 'IconDesktop',
    path: '/batch',
  },
] as const;
