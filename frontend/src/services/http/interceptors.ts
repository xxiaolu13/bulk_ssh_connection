import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { HTTP_CONFIG, HttpError, HTTP_STATUS } from './config';

/**
 * 请求拦截器
 */
export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  // 添加时间戳，防止缓存
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
  }

  // 可以在这里添加请求头，如 token
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }

  return config;
};

/**
 * 响应拦截器
 */
export const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  const { data, status } = response;

  // 可以根据后端返回的数据结构进行统一处理
  // if (data.code !== HTTP_STATUS.SUCCESS) {
  //   throw new HttpError(
  //     data.message || '请求失败',
  //     status,
  //     'server',
  //     data
  //   );
  // }

  return response;
};

/**
 * 错误拦截器
 */
export const errorInterceptor = (error: AxiosError): Promise<never> => {
  if (axios.isCancel(error)) {
    // 请求被取消
    return Promise.reject(error);
  }

  const { response, code, message } = error;

  if (response) {
    // 服务器返回错误
    const { status, data } = response;
    const dataMessage = (data as any)?.message;
    let errorMessage = dataMessage || `请求失败 (${status})`;
    let errorType: 'network' | 'timeout' | 'server' | 'client' | 'unknown' = 'server';

    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        errorMessage = dataMessage || '请求参数错误';
        errorType = 'client';
        break;
      case HTTP_STATUS.UNAUTHORIZED:
        errorMessage = '未授权，请重新登录';
        errorType = 'client';
        // 可以在这里处理跳转到登录页
        break;
      case HTTP_STATUS.FORBIDDEN:
        errorMessage = '没有权限访问';
        errorType = 'client';
        break;
      case HTTP_STATUS.NOT_FOUND:
        // 处理 "get all servers not found" 等错误
        if (dataMessage && dataMessage.includes('not found')) {
          errorMessage = '数据不存在或已删除';
        } else {
          errorMessage = '请求的资源不存在';
        }
        errorType = 'client';
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        // 服务器错误，尝试显示更友好的消息
        if (dataMessage) {
          errorMessage = dataMessage;
        } else {
          errorMessage = '服务器内部错误';
        }
        errorType = 'server';
        break;
    }

    return Promise.reject(new HttpError(errorMessage, status, errorType, data));
  }

  if (code === 'ECONNABORTED') {
    // 请求超时
    return Promise.reject(
      new HttpError(
        '请求超时，请稍后重试',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'timeout'
      )
    );
  }

  // 网络错误
  return Promise.reject(
    new HttpError(
      message || '网络连接失败，请检查网络设置',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'network'
    )
  );
};
