import React from 'react';
import { Empty, Button } from '@arco-design/web-react';
import type { ReactNode } from 'react';

/**
 * 空状态类型
 */
export type EmptyType = 'DEFAULT' | 'LIST' | 'TABLE' | 'SEARCH' | 'NETWORK';

/**
 * 空状态组件属性
 */
export interface EmptyStateProps {
  /**
   * 空状态描述
   */
  description?: ReactNode;
  /**
   * 自定义图标
   */
  icon?: ReactNode;
  /**
   * 操作按钮
   */
  action?: ReactNode;
  /**
   * 空状态类型（预设样式）
   */
  type?: EmptyType;
  /**
   * 是否简单样式
   */
  simple?: boolean;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * 获取空状态默认配置
 */
const getEmptyStateConfig = (type: EmptyType) => {
  switch (type) {
    case 'LIST':
      return {
        description: '暂无列表数据',
      };
    case 'TABLE':
      return {
        description: '暂无表格数据',
      };
    case 'SEARCH':
      return {
        description: '未找到相关结果',
      };
    case 'NETWORK':
      return {
        description: '网络连接失败，请检查网络设置',
      };
    default:
      return {
        description: '暂无数据',
      };
  }
};

/**
 * 空状态组件
 *
 * @example
 * // 基础用法
 * <EmptyState />
 *
 * // 自定义描述和操作
 * <EmptyState
 *   description="暂无服务器，请先添加"
 *   action={<Button type="primary">添加服务器</Button>}
 * />
 *
 * // 使用预设类型
 * <EmptyState type="SEARCH" />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  description,
  icon,
  action,
  type = 'DEFAULT',
  simple = false,
  style = {},
  className = '',
}) => {
  const config = getEmptyStateConfig(type);
  const finalDescription = description || config.description;

  const wrapperStyle: React.CSSProperties = {
    padding: simple ? '40px 20px' : '80px 20px',
    textAlign: 'center',
    ...style,
  };

  if (simple) {
    return (
      <div className={`empty-state-simple ${className}`} style={wrapperStyle}>
        <div className="empty-state-icon-simple">
          {icon}
        </div>
        <div className="empty-state-text-simple">
          {finalDescription}
        </div>
        {action && (
          <div className="empty-state-action-simple">
            {action}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`empty-state ${className}`} style={wrapperStyle}>
      <Empty
        icon={icon}
        description={finalDescription}
        style={{ marginBottom: action ? 24 : 0 }}
      />
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
