import { get, post, put, del } from './http';
import type { Group, CreateGroup, UpdateGroup } from '../types';

/**
 * 分组 API
 */
export const groupApi = {
  /**
   * 获取所有分组
   */
  getAll: (): Promise<Group[]> =>
    get<Group[]>('/group').then((res) => res.data),

  /**
   * 根据ID获取分组
   */
  getById: (id: number): Promise<Group> =>
    get<Group>(`/group/${id}`).then((res) => res.data),

  /**
   * 创建分组
   */
  create: (data: CreateGroup): Promise<Group> =>
    post<Group>('/group', data).then((res) => res.data),

  /**
   * 更新分组
   */
  update: (id: number, data: UpdateGroup): Promise<Group> =>
    put<Group>(`/group/${id}`, data).then((res) => res.data),

  /**
   * 删除分组
   */
  delete: (id: number): Promise<void> =>
    del<void>(`/group/${id}`).then(() => {}),
};
