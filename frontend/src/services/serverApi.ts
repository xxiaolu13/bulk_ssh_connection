import { get, post, put, del } from './http';
import type {
  Server,
  CreateSingleServer,
  CreateGroupServer,
  UpdateServer,
} from '../types';

/**
 * 服务器 API
 */
export const serverApi = {
  /**
   * 获取所有服务器
   */
  getAll: (): Promise<Server[]> =>
    get<Server[]>('/server').then((res) => res.data),

  /**
   * 根据ID获取服务器
   */
  getById: (id: number): Promise<Server> =>
    get<Server>(`/server/${id}`).then((res) => res.data),

  /**
   * 根据分组ID获取服务器
   */
  getByGroupId: (groupId: number): Promise<Server[]> =>
    get<Server[]>(`/server/group/${groupId}`).then((res) => res.data),

  /**
   * 创建单个服务器
   */
  createSingle: (data: CreateSingleServer): Promise<Server> =>
    post<Server>('/server', data).then((res) => res.data),

  /**
   * 批量创建服务器
   */
  createGroup: (data: CreateGroupServer): Promise<Server[]> =>
    post<Server[]>('/server/group', data).then((res) => res.data),

  /**
   * 更新服务器
   */
  update: (id: number, data: UpdateServer): Promise<Server> =>
    put<Server>(`/server/${id}`, data).then((res) => res.data),

  /**
   * 删除服务器
   */
  delete: (id: number): Promise<void> =>
    del<void>(`/server/${id}`).then(() => {}),
};
