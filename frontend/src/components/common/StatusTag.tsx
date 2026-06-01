import React from 'react';
import { Tag } from '@arco-design/web-react';
import { getStatusColor } from '../../utils/status';

/**
 * 状态标签组件
属性：
 * - status: 状态值
 * - text: 自定义显示文本（可选）
 */
interface StatusTagProps {
  status: string;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  bordered?: boolean;
}

/**
 * 状态标签组件
 */
export const StatusTag: React.FC<StatusTagProps> = ({
  status,
  text,
  size = 'small',
  bordered = false,
}) => {
  return (
    <Tag color={getStatusColor(status)} size={size} bordered={bordered}>
      {text || status}
    </Tag>
  );
};

export default StatusTag;
