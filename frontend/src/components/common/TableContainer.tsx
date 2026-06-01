import React from 'react';
import { Table, Card, Empty, Space, Button } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { APP_CONFIG } from '../../config/constants';

interface TableContainerProps<T = any> {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  showRefresh?: boolean;
  onRefresh?: () => void;
  showEmpty?: boolean;
  emptyText?: string;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  columns?: ColumnProps<T>[];
  data?: T[];
  rowKey?: string;
  pagination?: any;
  scroll?: any;
}

/**
 * 表格容器组件
 * 提供统一的表格样式和功能
 */
export const TableContainer: React.FC<TableContainerProps> = ({
  title,
  extra,
  showRefresh = false,
  onRefresh,
  showEmpty = true,
  emptyText = '暂无数据',
  loading = false,
  className = '',
  style = {},
  children,
  columns,
  data,
  rowKey,
  pagination,
  scroll,
}) => {
  const renderContent = () => {
    if (showEmpty && data && data.length === 0 && !loading && !children) {
      return (
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <Empty
            description={
              <Space direction="vertical" size="small">
                <span style={{ fontSize: 14, color: 'var(--color-text-2)' }}>
                  {emptyText}
                </span>
                {showRefresh && onRefresh && (
                  <Button type="primary" icon={<IconRefresh />} onClick={onRefresh}>
                    刷新
                  </Button>
                )}
              </Space>
            }
          />
        </div>
      );
    }

    if (children) {
      return <>{children}</>;
    }

    return (
      <Table
        columns={columns}
        data={data}
        loading={loading}
        className={`enhanced-table ${className}`}
        style={style}
        rowKey={rowKey}
        pagination={{
          showTotal: true,
          showJumper: true,
          sizeCanChange: true,
          sizeOptions: [...APP_CONFIG.PAGE_SIZE_OPTIONS],
          pageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
          ...pagination,
        }}
        border={true}
        stripe={true}
        hover={true}
        scroll={scroll}
      />
    );
  };

  if (title || extra || showRefresh) {
    return (
      <Card
        className="table-card"
        style={{ marginBottom: 24 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {title}
          </div>
        }
        extra={
          <Space>
            {showRefresh && (
              <Button
                type="text"
                icon={<IconRefresh />}
                onClick={onRefresh}
                disabled={loading}
              />
            )}
            {extra}
          </Space>
        }
        bodyStyle={{ padding: 0 }}
      >
        {renderContent()}
      </Card>
    );
  }

  return renderContent();
};

export default TableContainer;
