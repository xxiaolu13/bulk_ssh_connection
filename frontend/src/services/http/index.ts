import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HTTP_CONFIG } from './config';
import { requestInterceptor, responseInterceptor, errorInterceptor } from './interceptors';

/**
 * 创建 axios 实例
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: HTTP_CONFIG.baseURL,
    timeout: HTTP_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 添加请求拦截器
  instance.interceptors.request.use(
    requestInterceptor,
    error => Promise.reject(error)
  );

  // 添加响应拦截器
  instance.interceptors.response.use(
    responseInterceptor,
    errorInterceptor
  );

  return instance;
};

/**
 * HTTP 客户端实例
 */
export const httpClient = createAxiosInstance();

/**
 * GET 请求
 */
export const get = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => httpClient.get<T>(url, config);

/**
 * POST 请求
 */
export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => httpClient.post<T>(url, data, config);

/**
 * PUT 请求
 */
export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => httpClient.put<T>(url, data, config);

/**
 * DELETE 请求
 */
export const del = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => httpClient.delete<T>(url, config);

/**
 * PATCH 请求
 */
export const patch = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => httpClient.patch<T>(url, data, config);

/**
 * 流式请求（用于批量 SSH 执行等场景）
 */
export const stream = async (
  url: string,
  data: any,
  onData: (line: string) => void,
  onError?: (error: Error) => void
): Promise<void> => {
  const response = await fetch(`${HTTP_CONFIG.baseURL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = new Error(`Stream request failed: ${response.status}`);
    if (onError) {
      onError(error);
    }
    throw error;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const error = new Error('No response body');
    if (onError) {
      onError(error);
    }
    throw error;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          onData(line);
        }
      }
    }
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
    throw error;
  }
};

export default httpClient;
