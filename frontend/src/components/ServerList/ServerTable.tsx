import React from 'react';
import {
  Button,
  Popconfirm,
  Space,
  Tag,
  Table,
  Tooltip,
  Card,
  Badge,
} from '@arco-design/web-react';
import {
  IconPlayArrow,
  IconCommand,
  IconEdit,
  IconDelete,
  IconClockCircle,
  IconCheckCircle,
  IconCloseCircle,
} from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import type { Server, Group } from '../../types';
import { APP_CONFIG } from '../../config/constants';

/**
 * 服务器表格组件属性
 */
interface ServerTableProps {
  data: Server[];
  groups: Group[];
  loading: boolean;
  onTestConnection: (id: number) => void;
  onOpenTerminal: (server: Server) => void;
  onEdit: (server: Server) => void;
  onDelete: (id: number) => void;
  viewMode?: 'list' | 'card';
}

/**
 * 服务器表格组件
 */
export const ServerTable: React.FC<ServerTableProps> = ({
  data,
  groups,
  loading,
  onTestConnection,
  onOpenTerminal,
  onEdit,
  onDelete,
  viewMode = 'list',
}) => {
  const getGroupName = (groupId?: number): string => {
    if (!groupId) return '-';
    const group = groups.find((g) => g.group_id === groupId);
    return group?.name || '-';
  };

  // 卡片视图渲染
  if (viewMode === 'card') {
    return (
      <div className="server-cards-grid">
        {data.map((server) => (
          <Card
            key={server.id}
            className="server-card"
            hoverable
            cover={
              <div className="server-card-header">
                <div className="server-status-indicator">
                  {server.status === 'online' ? (
                    <IconCheckCircle className="status-online" />
                  ) : (
                    <IconCloseCircle className="status-offline" />
                  )}
                </div>
                <h3 className="server-card-title">{server.name || server.ip}</h3>
              </div>
            }
          >
            <div className="server-card-content">
              <div className="server-card-info">
                <label>分组</label>
                <span>
                  {server.group_id ? (
                    <Tag color="blue" size="small">{getGroupName(server.group_id)}</Tag>
                  ) : (
                    <span className="info-empty">-</span>
                  )}
                </span>
              </div>
              <div className="server-card-info">
                <label>IP 地址</label>
                <span className="info-mono">{server.ip}</span>
              </div>
              <div className="server-card-info">
                <label>端口</label>
                <span className="info-mono">{server.port}</span>
              </div>
              <div className="server-card-info">
                <label>用户</label>
                <span>{server.ssh_user}</span>
              </div>
            </div>
            <div className="server-card-actions">
              <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  type="text"
                  icon={<IconPlayArrow />}
                  size="small"
                  onClick={() => onTestConnection(server.id)}
                  className="action-btn"
                >
                  测试
                </Button>
                <Button
                  type="text"
                  icon={<IconCommand />}
                  size="small"
                  onClick={() => onOpenTerminal(server)}
                  className="action-btn"
                >
                  终端
                </Button>
                <Button
                  type="text"
                  icon={<IconEdit />}
                  size="small"
                  onClick={() => onEdit(server)}
                  className="action-btn"
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确认删除这个服务器吗？"
                  onOk={() => onDelete(server.id)}
                >
                  <Button
                    type="text"
                    status="danger"
                    icon={<IconDelete />}
                    size="small"
                    className="action-btn danger"
                  >
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // 表格视图列配置
  const columns: ColumnProps<Server>[] = [
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Badge
          status={status === 'online' ? 'success' : 'error'}
          text={status === 'online' ? '在线' : '离线'}
        />
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 180,
      render: (name) => (
        <Tooltip content={name || '-'}>
          <span style={{
            fontWeight: 500,
            color: name ? 'var(--text-primary)' : 'var(--text-tertiary)'
          }}>
            {name || '-'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: '分组',
      dataIndex: 'group_id',
      width: 120,
      render: (groupId) => (
        groupId ? <Tag color="blue">{getGroupName(groupId)}</Tag> : <span style={{ color: 'var(--text-tertiary)' }}>-</span>
      ),
    },
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      width: 160,
      render: (ip) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{ip}</span>
      ),
    },
    {
      title: '端口',
      dataIndex: 'port',
      width: 100,
      render: (port) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{port}</span>
      ),
    },
    {
      title: 'SSH 用户',
      dataIndex: 'ssh_user',
      width: 140,
      render: (user) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{user}</span>
      ),
    },
    {
      title: '操作',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<IconPlayArrow />}
            size="small"
            onClick={() => onTestConnection(record.id)}
            className="action-btn"
          >
            测试连接
          </Button>
          <Button
            type="text"
            icon={<IconCommand />}
            size="small"
            onClick={() => onOpenTerminal(record)}
            className="action-btn"
          >
            终端
          </Button>
          <Button
            type="text"
            icon={<IconEdit />}
            size="small"
            onClick={() => onEdit(record)}
            className="action-btn"
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除这个服务器吗？"
            onOk={() => onDelete(record.id)}
          >
            <Button
              type="text"
              status="danger"
              icon={<IconDelete />}
              size="small"
              className="action-btn danger"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="server-table-wrapper">
      <Table
        columns={columns}
        data={data}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
          showTotal: true,
          sizeCanChange: true,
          sizeOptions: [10, 20, 50, 100],
        }}
        border={true}
        stripe={true}
        hover={true}
        size={APP_CONFIG.TABLE_CONFIG.size}
        className="modern-server-table"
      />
    </div>
  );
};

export default ServerTable;
