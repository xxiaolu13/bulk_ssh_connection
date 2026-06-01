import { TagProps } from '@arco-design/web-react';

/**
 * 状态相关工具
 */

/**
 * 获取状态标签的颜色
 * @param status 状态字符串
 * @returns Arco Design Tag 组件的 color 属性值
 */
export const getStatusColor = (status: string): TagProps['color'] => {
  const colorMap: Record<string, TagProps['color']> = {
    success: 'green',
    failed: 'red',
    running: 'blue',
    pending: 'orange',
    enabled: 'green',
    disabled: 'gray',
    completed: 'green',
    active: 'green',
    inactive: 'gray',
  };

  return colorMap[status.toLowerCase()] || 'blue';
};

/**
 * 获取状态的显示文本
 * @param status 状态字符串
 * @returns 状态的中文文本
 */
export const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    running: '运行中',
    pending: '等待中',
    enabled: '启用',
    disabled: '禁用',
    completed: '已完成',
    active: '活跃',
    inactive: '未激活',
  };

  return textMap[status.toLowerCase()] || status;
};

/**
 * 判断状态是否为成功状态
 * @param status 状态字符串
 * @returns 是否为成功状态
 */
export const isSuccessStatus = (status: string): boolean => {
  const successStatuses = ['success', 'enabled', 'completed', 'active'];
  return successStatuses.includes(status.toLowerCase());
};

/**
 * 判断状态是否为失败状态
 * @param status 状态字符串
 * @returns 是否为失败状态
 */
export const isFailedStatus = (status: string): boolean => {
  const failedStatuses = ['failed', 'disabled', 'inactive'];
  return failedStatuses.includes(status.toLowerCase());
};

/**
 * 判断状态是否为运行中状态
 * @param status 状态字符串
 * @returns 是否为运行中状态
 */
export const isRunningStatus = (status: string): boolean => {
  const runningStatuses = ['running', 'pending'];
  return runningStatuses.includes(status.toLowerCase());
};
