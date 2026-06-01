import { get, post, stream } from './http';
import type { SshRequest, BatchSshRequest, SshResponse } from '../types';

/**
 * SSH API
 */
export const sshApi = {
  /**
   * 测试SSH连接
   */
  testConnection: (id: number): Promise<string> =>
    get<string>(`/ssh/${id}`).then((res) => res.data),

  /**
   * 执行单个服务器命令
   */
  execute: (data: SshRequest): Promise<SshResponse> =>
    post<SshResponse>('/ssh', data).then((res) => res.data),

  /**
   * 批量执行命令
   * @param data 批量请求参数
   * @param onData 接收每一行数据的回调
   * @param onError 错误回调
   */
  executeBatch: async (
    data: BatchSshRequest,
    onData: (result: any) => void,
    onError?: (error: Error) => void
  ): Promise<void> => {
    await stream('/ssh/batch', data, (line) => {
      try {
        const result = JSON.parse(line);
        onData(result);
      } catch (e) {
        console.error('Failed to parse stream line:', line, e);
      }
    }, onError);
  },
};
