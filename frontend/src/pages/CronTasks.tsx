import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Tag,
  Tooltip,
  Card,
  Statistic,
  Grid,
  Popconfirm,
} from '@arco-design/web-react';

const { Row, Col } = Grid;
import {
  IconFile,
  IconEdit,
  IconDelete,
  IconPlus,
  IconPlayArrow,
  IconPauseCircle,
} from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { cronJobApi, groupApi, serverApi } from '../services';
import type { CronJob, CreateCronJob, UpdateCronJob, Group, Server } from '../types';
import { PageHeader, EmptyState } from '../components/common';
import { CronExpressionHelper } from '../components/CronTasks/CronExpressionHelper';
import '../styles/components/CronTasks.css';

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

export default function CronTasks() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentJob, setCurrentJob] = useState<CronJob | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [cronExpression, setCronExpression] = useState('0 0 * * *');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, groupsRes, serversRes] = await Promise.all([
        cronJobApi.getAll().catch(() => []),
        groupApi.getAll().catch(() => []),
        serverApi.getAll().catch(() => []),
      ]);
      setJobs(jobsRes || []);
      setGroups(groupsRes || []);
      setServers(serversRes || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Modal.error({ title: '获取数据失败', content: (error as Error).message });
      setJobs([]);
      setGroups([]);
      setServers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    try {
      const values = await createForm.validate();
      const data: CreateCronJob = {
        ...values,
        job_type: values.job_type || 'SSH',
        cron_expression: cronExpression,
        job_config: values.job_config ? JSON.parse(values.job_config) : {},
      };
      await cronJobApi.create(data);
      Modal.success({ title: '创建成功', content: '计划任务已创建' });
      setCreateModalVisible(false);
      createForm.resetFields();
      setCronExpression('0 0 * * *');
      fetchData();
    } catch (error) {
      Modal.error({ title: '创建失败', content: (error as Error).message });
    }
  };

  const handleEdit = (record: CronJob) => {
    setCurrentJob(record);
    editForm.setFieldsValue({
      ...record,
      job_config: record.job_config ? JSON.stringify(record.job_config, null, 2) : '',
    });
    setCronExpression(record.cron_expression);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!currentJob) return;
    try {
      const values = await editForm.validate();
      const data: UpdateCronJob = {
        ...values,
        cron_expression: cronExpression,
        job_config: values.job_config ? JSON.parse(values.job_config) : undefined,
      };
      await cronJobApi.update(currentJob.id, data);
      Modal.success({ title: '更新成功', content: '计划任务已更新' });
      setEditModalVisible(false);
      fetchData();
    } catch (error) {
      Modal.error({ title: '更新失败', content: (error as Error).message });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await cronJobApi.delete(id);
      Modal.success({ title: '删除成功', content: '计划任务已删除' });
      fetchData();
    } catch (error) {
      Modal.error({ title: '删除失败', content: (error as Error).message });
    }
  };

  const handleToggleEnable = async (job: CronJob) => {
    try {
      const data: UpdateCronJob = { enabled: !job.enabled };
      await cronJobApi.update(job.id, data);
      Modal.success({
        title: job.enabled ? '已禁用' : '已启用',
        content: `任务 "${job.name || `任务 #${job.id}`}" 已${job.enabled ? '禁用' : '启用'}`,
      });
      fetchData();
    } catch (error) {
      Modal.error({ title: '操作失败', content: (error as Error).message });
    }
  };

  const handleViewLogs = (job: CronJob) => {
    navigate(`/cron-logs/${job.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'blue';
      case 'failed': return 'red';
      case 'pending': return 'orange';
      default: return 'green';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getServerName = (serverId?: number) => {
    if (!serverId) return '-';
    const server = servers.find((s) => s.id === serverId);
    return server?.name || server?.ip || '-';
  };

  const getGroupName = (groupId?: number) => {
    if (!groupId) return '-';
    const group = groups.find((g) => g.group_id === groupId);
    return group?.name || '-';
  };

  const totalJobs = jobs.length;
  const enabledJobs = jobs.filter(j => j.enabled).length;
  const disabledJobs = totalJobs - enabledJobs;
  const runningJobs = jobs.filter(j => j.status === 'running').length;

  const columns: ColumnProps<CronJob>[] = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    {
      title: '名称',
      dataIndex: 'name',
      width: 150,
      render: (name, record) => (
        <Tooltip content={name || `任务 #${record.id}`}>
          <span style={{ fontWeight: 500 }}>{name || `任务 #${record.id}`}</span>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={record.enabled ? <IconPauseCircle /> : <IconPlayArrow />}
            onClick={() => handleToggleEnable(record)}
          />
          <Tag color={record.enabled ? 'green' : 'gray'}>
            {record.enabled ? '启用' : '禁用'}
          </Tag>
        </Space>
      ),
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Cron 表达式',
      dataIndex: 'cron_expression',
      width: 160,
      render: (expr) => <Tag color="blue" style={{ fontFamily: 'monospace' }}>{expr}</Tag>,
    },
    {
      title: '命令',
      dataIndex: 'command',
      width: 200,
      render: (cmd) => (
        <Tooltip content={cmd}>
          <code style={{ background: 'var(--bg-fill)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
            {cmd.length > 30 ? cmd.slice(0, 30) + '...' : cmd}
          </code>
        </Tooltip>
      ),
    },
    {
      title: '下次执行',
      dataIndex: 'next_execute_at',
      width: 180,
      render: (date) => formatDate(date),
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<IconFile />} size="small" onClick={() => handleViewLogs(record)}>日志</Button>
          <Button type="text" icon={<IconEdit />} size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确认删除"
            content={`确认删除这个任务吗？\n${record.name || `任务 #${record.id}`}`}
            onOk={() => handleDelete(record.id)}
          >
            <Button type="text" status="danger" icon={<IconDelete />} size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="cron-tasks-page">
      <PageHeader
        title="计划任务"
        description="管理定时任务和自动化脚本"
        breadcrumb={[{ label: '首页', href: '/' }, { label: '计划任务' }]}
        extra={<Button type="primary" icon={<IconPlus />} onClick={() => { setCreateModalVisible(true); createForm.setFieldsValue({ enabled: true, job_type: 'SSH', timeout_secs: 300, retry_count: 0 }); setCronExpression('0 0 * * *'); }}>添加任务</Button>}
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card><Statistic title="任务总数" value={totalJobs} suffix="个" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="已启用" value={enabledJobs} suffix="个" valueStyle={{ color: '#00b42a' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="已禁用" value={disabledJobs} suffix="个" valueStyle={{ color: '#86909c' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="执行中" value={runningJobs} suffix="个" valueStyle={{ color: '#165dff' }} /></Card>
        </Col>
      </Row>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>加载中...</div>
        ) : jobs.length === 0 ? (
          <EmptyState type="TABLE" description="暂无计划任务，请点击右上角添加任务" />
        ) : (
          <Table columns={columns} data={jobs} rowKey="id" scroll={{ x: 1400 }} pagination={{ pageSize: 20, showTotal: true, sizeCanChange: true, sizeOptions: [10, 20, 50, 100] }} border stripe hover />
        )}
      </Card>

      <Modal title="添加计划任务" visible={createModalVisible} onOk={handleCreate} onCancel={() => { setCreateModalVisible(false); createForm.resetFields(); setCronExpression('0 0 * * *'); }} okText="确定" cancelText="取消" style={{ width: 800 }} top="5%">
        <Form form={createForm} layout="vertical" initialValues={{ enabled: true, job_type: 'SSH', timeout_secs: 300, retry_count: 0 }}>
          <FormItem label="任务名称" field="name"><Input placeholder="任务名称（可选）" /></FormItem>
          <FormItem label="Cron 表达式" required><CronExpressionHelper value={cronExpression} onChange={setCronExpression} /></FormItem>
          <FormItem label="目标服务器" field="server_id"><Select placeholder="选择服务器（可选）" allowClear showSearch>{servers.map(s => <Option key={s.id} value={s.id}>{s.name || s.ip}</Option>)}</Select></FormItem>
          <FormItem label="执行命令" field="command" required rules={[{ required: true, message: '请输入命令' }]}><TextArea rows={3} style={{ fontFamily: 'monospace' }} /></FormItem>
          <FormItem label="启用" field="enabled" triggerPropName="checked"><Switch /></FormItem>
        </Form>
      </Modal>

      <Modal title="编辑计划任务" visible={editModalVisible} onOk={handleEditSubmit} onCancel={() => { setEditModalVisible(false); }} okText="确定" cancelText="取消" style={{ width: 800 }} top="5%">
        <Form form={editForm} layout="vertical">
          <FormItem label="任务名称" field="name"><Input placeholder="任务名称（可选）" /></FormItem>
          <FormItem label="Cron 表达式" required><CronExpressionHelper value={cronExpression} onChange={setCronExpression} /></FormItem>
          <FormItem label="目标服务器" field="server_id"><Select placeholder="选择服务器（可选）" allowClear showSearch>{servers.map(s => <Option key={s.id} value={s.id}>{s.name || s.ip}</Option>)}</Select></FormItem>
          <FormItem label="执行命令" field="command" required rules={[{ required: true, message: '请输入命令' }]}><TextArea rows={3} style={{ fontFamily: 'monospace' }} /></FormItem>
          <FormItem label="启用" field="enabled" triggerPropName="checked"><Switch /></FormItem>
        </Form>
      </Modal>
    </div>
  );
}
