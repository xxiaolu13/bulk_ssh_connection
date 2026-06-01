/**
 * 日期格式化工具
 */

/**
 * 格式化日期为本地字符串
 * @param date 日期字符串或Date对象
 * @param format 格式：'full' | 'date' | 'time' | 'short'
 * @returns 格式化后的字符串
 */
export const formatDate = (
  date: string | Date | undefined | null,
  format: 'full' | 'date' | 'time' | 'short' = 'full'
): string => {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '-';

  const options: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case 'full':
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
      break;
    case 'date':
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      break;
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
      break;
    case 'short':
      options.month = 'short';
      options.day = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
  }

  return d.toLocaleString('zh-CN', options);
};

/**
 * 格式化相对时间
 * @param date 日期字符串或Date对象
 * @returns 相对时间字符串（如：5分钟前）
 */
export const formatRelativeTime = (
  date: string | Date | undefined | null
): string => {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '-';

  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;

  return formatDate(d, 'date');
};

/**
 * 格式化持续时间
 * @param ms 毫秒数
 * @returns 格式化后的字符串
 */
export const formatDuration = (ms: number | undefined | null): string => {
  if (ms === undefined || ms === null) return '-';

  if (ms < 1000) return `${ms}ms`;

  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;

  const minutes = seconds / 60;
  return `${minutes.toFixed(2)}m`;
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};
