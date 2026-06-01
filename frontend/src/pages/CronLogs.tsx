import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Tag,
  Select,
  Card,
  Drawer,
  Statistic,
  Grid,
  Empty,
} from '@arco-design/web-react';
import {
  IconEye,
  IconLeft,
  IconRefresh,
  IconSearch,
  IconDownload,
} from '@arco-design/web-react/icon';

const { Row, Col } = Grid;
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { cronLogApi, cronJobApi } from '../services';
import type { CronLog, CronJob } from '../types';
import { PageHeader, FilterBar, EmptyState } from '../components/common';
import '../styles/components/CronLogs.css';

const Option = Select.Option;

export default function CronLogs() {
  const { jobId } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(
    jobId ? parseInt(jobId) : undefined
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<CronLog | null>(null);

  // 筛选状态
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      const res = await cronJobApi.getAll();
      setJobs(res);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!selectedJobId) {
      setLogs([]);
      return;
    }
    setLoading(true);
    try {
      const res = await cronLogApi.getByJobId(selectedJobId);
      setLogs(res);
    } catch (error) {
      console.error('获取日志失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (selectedJobId) {
      fetchLogs();
    }
  }, [selectedJobId, fetchLogs]);

  const handleViewLog = (log: CronLog) => {
    setCurrentLog(log);
    setDrawerVisible(true);
  };

  const handleBack = () => {
    navigate('/cron');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'failed':
        return 'red';
      case 'running':
        return 'blue';
      default:
        return 'orange';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '成功';
      case 'failed': return '失败';
      case 'running': return '执行中';
      default: return status;
    }
  };

  const getJobName = (jobId: number) => {
    const job = jobs.find((j) => j.id === jobId);
    return job?.name || `Job #${jobId}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  // 筛选日志
  const filteredLogs = logs.filter((log) => {
    if (statusFilter && log.status !== statusFilter) return false;
    if (searchText && !log.output?.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  // 统计数据
  const totalLogs = filteredLogs.length;
  const successLogs = filteredLogs.filter((l) => l.status === 'success').length;
  const failedLogs = filteredLogs.filter((l) => l.status === 'failed').length;
  const runningLogs = filteredLogs.filter((l) => l.status === 'running').length;

  const columns: ColumnProps<CronLog>[] = [
    {
      title: '日志ID',
      dataIndex: 'log_id',
      width: 100,
      fixed: 'left',
    },
    {
      title: '任务',
      dataIndex: 'job_id',
      width: 150,
      render: (jobId) => (
        <Tag color="arcoblue">{getJobName(jobId)}</Tag>
      ),
    },
    {
      title: '服务器IP',
      dataIndex: 'server_ip',
      width: 150,
      render: (ip) => ip || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '执行时间',
      dataIndex: 'duration_ms',
      width: 120,
      render: (ms) => ms ? `${ms}ms` : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 180,
      render: (date) => formatDate(date),
    },
    {
      title: '输出预览',
      dataIndex: 'output',
      width: 200,
      ellipsis: true,
      render: (output) => output ? (
        <span style={{ color: '#666', fontFamily: 'monospace' }}>
          {output.length > 50 ? output.slice(0, 50) + '...' : output}
        </span>
      ) : '-',
    },
    {
      title: '操作',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          icon={<IconEye />}
          size="small"
          onClick={() => handleViewLog(record)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div className="cron-logs-page">
      <PageHeader
        title="任务日志"
        description={`查看任务 ${getJobName(selectedJobId || 0)} 的执行日志`}
        showBack
        on={handleBack}
        extra={
          <Button
            icon={<IconRefresh />}
            onClick={fetchLogs}
            loading={loading}
          >
            刷新
          </Button>
        }
      />

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="日志总数" value={totalLogs} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功"
              value={successLogs}
              suffix="条"
              valueStyle={{ color: '#00b42a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="失败"
              value={failedLogs}
              suffix="条"
              valueStyle={{ color: '#f53f3f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="执行中"
              value={runningLogs}
              suffix="条"
              valueStyle={{ color: '#165dff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <FilterBar
        filters={[
          {
            key: 'job',
            label: '任务',
            type: 'select',
            value: selectedJobId,
            placeholder: '选择任务',
            options: jobs.map((j) => ({
              label: j.name || `Job #${j.id}`,
              value: j.id,
            })),
            onChange: setSelectedJobId,
          },
          {
            key: 'status',
            label: '状态',
            type: 'select',
            value: statusFilter,
            placeholder: '选择状态',
            options: [
              { label: '成功', value: 'success' },
              { label: '失败', value: 'failed' },
              { label: '执行中', value: 'running' },
            ],
            onChange: setStatusFilter,
          },
        ]}
        searchPlaceholder="搜索输出内容..."
        searchValue={searchText}
        onSearch={setSearchText}
        onRefresh={fetchLogs}
      />

      {/* 日志表格 */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            加载中...
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            type="TABLE"
            description={selectedJobId ? '该任务暂无日志' : '请先选择一个任务'}
          />
        ) : (
          <Table
            columns={columns}
            data={filteredLogs}
            rowKey="log_id"
            scroll={{ x: 1100 }}
            pagination={{
              pageSize: 20,
              showTotal: true,
              sizeCanChange: true,
              sizeOptions: [10, 20, 50, 100],
            }}
            border
            stripe
            hover
          />
        )}
      </Card>

      {/* 日志详情抽屉 */}
      <Drawer
        title="日志详情"
        width={800}
        visible={drawerVisible}
        onOk={() => setDrawerVisible(false)}
        footer={null}
      >
        {currentLog && (
          <div className="log-detail-content">
            {/* 基本信息 */}
            <div className="log-info-section">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">日志ID:</span>
                  <span className="info-value">{currentLog.log_id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">任务ID:</span>
                  <span className="info-value">{currentLog.job_id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">服务器IP:</span>
                  <span className="info-value">{currentLog.server_ip || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">状态:</span>
                  <Tag color={getStatusColor(currentLog.status)}>
                    {getStatusText(currentLog.status)}
                  </Tag>
                </div>
                <div className="info-item">
                  <span className="info-label">执行时间:</span>
                  <span className="info-value">
                    {currentLog.duration_ms ? `${currentLog.duration_ms}ms` : '-'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">创建时间:</span>
                  <span className="info-value">{formatDate(currentLog.created_at)}</span>
                </div>
              </div>
            </div>

            {/* 执行输出 */}
            <div className="log-output-section">
              <div className="section-title">执行输出：</div>
              <pre className="log-output">
                {currentLog.output || '(无输出)'}
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
