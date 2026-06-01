import { get, post, put, del } from './http';
import type { CronJob, CreateCronJob, UpdateCronJob } from '../types';

/**
 * 计划任务 API
 */
export const cronJobApi = {
  /**
   * 获取所有计划任务
   */
  getAll: (): Promise<CronJob[]> =>
    get<CronJob[]>('/cronjob').then((res) => res.data),

  /**
   * 根据ID获取计划任务
   */
  getById: (id: number): Promise<CronJob> =>
    get<CronJob>(`/cronjob/${id}`).then((res) => res.data),

  /**
   * 创建计划任务
   */
  create: (data: CreateCronJob): Promise<CronJob> =>
    post<CronJob>('/cronjob', data).then((res) => res.data),

  /**
   * 更新计划任务
   */
  update: (id: number, data: UpdateCronJob): Promise<CronJob> =>
    put<CronJob>(`/cronjob/${id}`, data).then((res) => res.data),

  /**
   * 删除计划任务
   */
  delete: (id: number): Promise<void> =>
    del<void>(`/cronjob/${id}`).then(() => {}),
};
