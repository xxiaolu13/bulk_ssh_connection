import { Message } from '@arco-design/web-react';
import { HttpError } from '../services/http/config';

let loadingMessageId: string | number | null = null;

/**
 * 消息提示工具
 */

/**
 * 显示成功消息
 * @param content 消息内容
 * @param duration 显示时长（毫秒）
 */
export const showSuccess = (content: string, duration = 3000): void => {
  clearAllMessages();
  Message.success({
    content,
    duration,
  });
};

/**
 * 显示错误消息
 * @param error 错误对象或字符串
 * @param duration 显示时长（毫秒）
 */
export const showError = (error: Error | string, duration = 5000): void => {
  clearAllMessages();
  let content = '操作失败';

  if (typeof error === 'string') {
    content = error;
  } else if (error instanceof HttpError) {
    content = error.message;
    // 可以根据错误类型做不同处理
    if (error.type === 'network') {
      content = '网络连接失败，请检查网络设置';
    } else if (error.type === 'timeout') {
      content = '请求超时，请稍后重试';
    }
  } else if (error.message) {
    content = error.message;
  }

  Message.error({
    content,
    duration,
  });
};

/**
 * 显示警告消息
 * @param content 消息内容
 * @param duration 显示时长（毫秒）
 */
export const showWarning = (content: string, duration = 3000): void => {
  clearAllMessages();
  Message.warning({
    content,
    duration,
  });
};

/**
 * 显示信息消息
 * @param content 消息内容
 * @param duration 显示时长（毫秒）
 */
export const showInfo = (content: string, duration = 3000): void => {
  Message.info({
    content,
    duration,
  });
};

/**
 * 显示加载消息
 * @param content 消息内容
 */
export const showLoading = (content = '加载中...'): void => {
  clearAllMessages();
  loadingMessageId = Message.loading({
    content,
    duration: 0, // 不自动关闭
  });
};

/**
 * 关闭指定消息
 * @param id 消息ID
 */
export const closeMessage = (id: string | number): void => {
  Message.clear();
};

/**
 * 清除所有消息
 */
export const clearAllMessages = (): void => {
  Message.clear();
  loadingMessageId = null;
};
