import React from 'react';
import {
  IconStorage,
  IconCheckCircle,
  IconCloseCircle,
  IconFolder,
} from '@arco-design/web-react/icon';

/**
 * 统计卡片属性
 */
export interface StatsCardProps {
  /**
   * 服务器总数
   */
  total: number;
  /**
   * 在线服务器数量
   */
  online: number;
  /**
   * 离线服务器数量
   */
  offline: number;
  /**
   * 分组数量
   */
  groups: number;
  /**
   * 点击回调
   */
  onClick?: (type: 'total' | 'online' | 'offline' | 'groups') => void;
}

/**
 * 统计卡片组件
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  total,
  online,
  offline,
  groups,
  onClick,
}) => {
  const stats = [
    {
      key: 'total',
      title: '服务器总数',
      value: total,
      prefix: <IconStorage />,
      color: 'var(--primary-color)',
      background: 'var(--primary-light)',
    },
    {
      key: 'online',
      title: '在线',
      value: online,
      prefix: <IconCheckCircle />,
      color: 'var(--success-color)',
      background: 'var(--success-light)',
    },
    {
      key: 'offline',
      title: '离线',
      value: offline,
      prefix: <IconCloseCircle />,
      color: 'var(--danger-color)',
      background: 'var(--danger-light)',
    },
    {
      key: 'groups',
      title: '分组数量',
      value: groups,
      prefix: <IconFolder />,
      color: 'var(--warning-color)',
      background: 'var(--warning-light)',
    },
  ];

  return (
    <div className="modern-stats-grid">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="modern-stat-card"
          style={{
            '--stat-color': stat.color,
            '--stat-background': stat.background,
          } as React.CSSProperties}
          onClick={() => onClick?.(stat.key as any)}
        >
          <div className="stat-card-inner">
            <div className="stat-icon-wrapper">
              {stat.prefix}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.title}</div>
            </div>
          </div>
          <div className="stat-card-decoration" />
        </div>
      ))}
    </div>
  );
};

export default StatsCard;
