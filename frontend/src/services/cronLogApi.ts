import { get } from './http';
import type { CronLog } from '../types';

/**
 * 任务日志 API
 */
export const cronLogApi = {
  /**
   * 根据任务ID获取日志
   */
  getByJobId: (jobId: number): Promise<CronLog[]> =>
    get<CronLog[]>(`/cronlog/${jobId}`).then((res) => res.data),

  /**
   * 根据服务器IP获取日志
   */
  getByServerIp: (ip: string): Promise<CronLog[]> =>
    get<CronLog[]>(`/cronlog/server/${ip}`).then((res) => res.data),
};
