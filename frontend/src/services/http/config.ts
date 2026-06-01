/**
 * HTTP 请求配置
 */
export const HTTP_CONFIG = {
  timeout: 30000, // 请求超时时间（毫秒）
  baseURL: '/api', // API 基础路径
  retryTimes: 3, // 请求重试次数
  retryDelay: 1000, // 重试延迟（毫秒）
} as const;

/**
 * 响应状态码
 */
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 错误类型
 */
export type ErrorType = 'network' | 'timeout' | 'server' | 'client' | 'unknown';

/**
 * 自定义错误类
 */
export class HttpError extends Error {
  public status: number;
  public type: ErrorType;
  public data?: any;

  constructor(message: string, status: number, type: ErrorType, data?: any) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.type = type;
    this.data = data;
  }
}
