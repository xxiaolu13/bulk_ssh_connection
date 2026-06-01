import React from 'react';
import {
  Table,
  Button,
  Popconfirm,
  Space,
} from '@arco-design/web-react';
import {
  IconEdit,
  IconDelete,
} from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import type { Group } from '../../types';
import { APP_CONFIG } from '../../config/constants';

/**
 * 分组表格组件属性
 */
interface GroupTableProps {
  data: Group[];
  loading: boolean;
  onEdit: (group: Group) => void;
  onDelete: (id: number) => void;
}

/**
 * 分组表格组件
 */
export const GroupTable: React.FC<GroupTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnProps<Group>[] = [
    {
      title: '分组ID',
      dataIndex: 'group_id',
      width: 120,
      fixed: 'left',
    },
    {
      title: '分组名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      render: (desc) => desc || '-',
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<IconEdit />}
            size="small"
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除这个分组吗？"
            onOk={() => onDelete(record.group_id)}
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
      rowKey="group_id"
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

export default GroupTable;
