import React from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
} from '@arco-design/web-react';
import {
  IconFile,
  IconEdit,
  IconDelete,
} from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import type { CronJob, Group, Server } from '../../types';
import { APP_CONFIG } from '../../config/constants';
import { formatDate, getStatusColor } from '../../utils';

/**
 * Cron 任务表格组件属性
 */
interface CronJobTableProps {
  data: CronJob[];
  groups: Group[];
  servers: Server[];
  loading: boolean;
  onViewLogs: (job: CronJob) => void;
  onEdit: (job: CronJob) => void;
  onDelete: (id: number) => void;
}

/**
 * Cron 任务表格组件
 */
export const CronJobTable: React.FC<CronJobTableProps> = ({
  data,
  groups,
  servers,
  loading,
  onViewLogs,
  onEdit,
  onDelete,
}) => {
  const getServerName = (serverId?: number): string => {
    if (!serverId) return '-';
    const server = servers.find((s) => s.id === serverId);
    return server?.name || server?.ip || '-';
  };

  const getGroupName = (groupId?: number): string => {
    if (!groupId) return '-';
    const group = groups.find((g) => g.group_id === groupId);
    return group?.name || '-';
  };

  const columns: ColumnProps<CronJob>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 150,
      render: (name) => name || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
      render: (status, record) => (
        <Space size="small">
          <Tag color={record.enabled ? 'green' : 'gray'}>
            {record.enabled ? '启用' : '禁用'}
          </Tag>
          <Tag color={getStatusColor(status)}>{status}</Tag>
        </Space>
      ),
    },
    {
      title: 'Cron 表达式',
      dataIndex: 'cron_expression',
      width: 160,
    },
    {
      title: '目标',
      width: 150,
      render: (_, record) => (
        <Space size="small" wrap>
          {record.server_id && (
            <Tag color="arcoblue">服务器: {getServerName(record.server_id)}</Tag>
          )}
          {record.group_id && (
            <Tag color="purple">分组: {getGroupName(record.group_id)}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '命令',
      dataIndex: 'command',
      width: 200,
      ellipsis: true,
      render: (cmd) => (
        <code style={{
          background: '#f7f8fa',
          padding: '2px 6px',
          borderRadius: 2,
          fontSize: 12,
        }}>
          {cmd.length > 30 ? cmd.slice(0, 30) + '...' : cmd}
        </code>
      ),
    },
    {
      title: '上次执行',
      dataIndex: 'last_executed_at',
      width: 180,
      render: (date) => formatDate(date, 'short'),
    },
    {
      title: '下次执行',
      dataIndex: 'next_execute_at',
      width: 180,
      render: (date) => formatDate(date, 'short'),
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<IconFile />}
            size="small"
            onClick={() => onViewLogs(record)}
          >
            日志
          </Button>
          <Button
            type="text"
            icon={<IconEdit />}
            size="small"
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除这个任务吗？"
            onOk={() => onDelete(record.id)}
          >
            <Button
              type="text"
              status="danger"
              icon={<IconDelete />}
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      rowKey="id"
      scroll={{ x: 1400 }}
      pagination={{
        pageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
        showTotal: true,
        sizeCanChange: true,
        sizeOptions: [10, 20, 50, 100],
      }}
      border={true}
      stripe={true}
      hover={true}
    />
  );
};

export default CronJobTable;
