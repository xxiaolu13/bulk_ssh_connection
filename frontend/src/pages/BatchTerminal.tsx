import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Select,
  Input,
  Card,
  Checkbox,
  Message,
  Typography,
  Space,
  Tabs,
  Spin,
  Divider,
  Tag,
  Tooltip,
  Popconfirm,
  Modal,
} from '@arco-design/web-react';
import {
  IconRefresh,
  IconPlayArrow,
  IconCommand,
  IconDelete,
  IconClockCircle,
  IconHistory,
} from '@arco-design/web-react/icon';
import { groupApi, serverApi, sshApi } from '../services';
import type { Group, Server, SshResult, SshError } from '../types';
import { PageHeader, EmptyState } from '../components/common';
import { QUICK_COMMANDS } from '../config/constants';
import '../styles/components/BatchTerminal.css';

const { Text } = Typography;
const Option = Select.Option;
const TextArea = Input.TextArea;
const TabPane = Tabs.TabPane;

interface ServerResult {
  server: string;
  output: string;
  exit_code?: number;
  success: boolean;
  loading: boolean;
}

interface CommandHistory {
  id: string;
  command: string;
  timestamp: Date;
}

const COMMAND_HISTORY_KEY = 'batch_terminal_command_history';
const MAX_HISTORY_SIZE = 50;

/**
 * 批量终端页面组件
 */
export default function BatchTerminal() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined);
  const [selectedServerIds, setSelectedServerIds] = useState<number[]>([]);
  const [command, setCommand] = useState('');
  const [results, setResults] = useState<Record<string, ServerResult>>({});
  const [executing, setExecuting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'tabs'>('grid');
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);

  // 加载命令历史
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMMAND_HISTORY_KEY);
      if (saved) {
        const history = JSON.parse(saved);
        setCommandHistory(history.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        })));
      }
    } catch (error) {
      console.error('Failed to load command history:', error);
    }
  }, []);

  // 保存命令历史
  const saveCommandHistory = useCallback((cmd: string) => {
    if (!cmd.trim()) return;

    const newHistory: CommandHistory = {
      id: Date.now().toString(),
      command: cmd,
      timestamp: new Date(),
    };

    const updatedHistory = [newHistory, ...commandHistory].slice(0, MAX_HISTORY_SIZE);
    setCommandHistory(updatedHistory);

    try {
      localStorage.setItem(COMMAND_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save command history:', error);
    }
  }, [commandHistory]);

  // 清除命令历史
  const clearHistory = () => {
    setCommandHistory([]);
    localStorage.removeItem(COMMAND_HISTORY_KEY);
    Message.success('命令历史已清空');
  };

  const fetchData = useCallback(async () => {
    try {
      const [groupsRes, serversRes] = await Promise.all([
        groupApi.getAll().catch(() => []),
        selectedGroupId ? serverApi.getByGroupId(selectedGroupId).catch(() => []) : serverApi.getAll().catch(() => []),
      ]);
      setGroups(groupsRes || []);
      setServers(serversRes || []);
    } catch (error) {
      Message.error('获取数据失败');
      console.error(error);
      setGroups([]);
      setServers([]);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGroupChange = (groupId: number | undefined) => {
    setSelectedGroupId(groupId);
    setSelectedServerIds([]);
  };

  const handleServerToggle = (serverId: number, checked: boolean) => {
    if (checked) {
      setSelectedServerIds((prev) => [...prev, serverId]);
    } else {
      setSelectedServerIds((prev) => prev.filter((id) => id !== serverId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServerIds(servers.map((s) => s.id));
    } else {
      setSelectedServerIds([]);
    }
  };

  const handleExecute = async () => {
    if (!command.trim()) {
      Message.warning('请输入命令');
      return;
    }
    if (selectedServerIds.length === 0) {
      Message.warning('请选择至少一台服务器');
      return;
    }
    if (!selectedGroupId) {
      Message.warning('请先选择一个分组');
      return;
    }

    // 保存到历史记录
    saveCommandHistory(command);

    setExecuting(true);

    const initialResults: Record<string, ServerResult> = {};
    selectedServerIds.forEach((id) => {
      const server = servers.find((s) => s.id === id);
      if (server) {
        initialResults[server.ip] = {
          server: server.ip,
          output: '',
          success: false,
          loading: true,
        };
      }
    });
    setResults(initialResults);

    try {
      await sshApi.executeBatch(
        { group_id: selectedGroupId, command },
        (result: SshResult | SshError) => {
          const serverIp = 'server' in result ? result.server : 'unknown';
          setResults((prev) => ({
            ...prev,
            [serverIp]: {
              server: serverIp,
              output: result.output,
              exit_code: result.exit_code,
              success: 'exit_code' in result ? result.exit_code === 0 || result.exit_code === undefined : false,
              loading: false,
            },
          }));
        }
      );
      Message.success('执行完成');
    } catch (error) {
      Message.error('执行失败');
      console.error(error);
    } finally {
      setExecuting(false);
    }
  };

  const handleQuickCommand = (cmd: string) => {
    setCommand(cmd);
  };

  const handleHistorySelect = (historyItem: CommandHistory) => {
    setCommand(historyItem.command);
    setHistoryVisible(false);
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter 执行命令
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        {
          e.preventDefault();
          handleExecute();
        }
      }
      // Esc 清空命令
      if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey) {
        setCommand('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [command, selectedServerIds, selectedGroupId]);

  const getServerById = (id: number) => servers.find((s) => s.id === id);
  const selectedServers = selectedServerIds.map((id) => getServerById(id)).filter(Boolean) as Server[];

  // 统计结果
  const successCount = Object.values(results).filter(r => r.success && !r.loading).length;
  const failedCount = Object.values(results).filter(r => !r.success && !r.loading).length;
  const runningCount = Object.values(results).filter(r => r.loading).length;

  return (
    <div className="batch-terminal-page">
      {/* 页面头部 */}
      <PageHeader
        title="批量终端"
        description="在多台服务器上批量执行命令"
        breadcrumb={[
          { label: '首页', href: '/' },
          { label: '批量终端' },
        ]}
        extra={
          <Space size="small">
            <Tooltip content="命令历史 (Ctrl+H)">
              <Button
                icon={<IconHistory />}
                onClick={() => setHistoryVisible(true)}
              >
                历史
              </Button>
            </Tooltip>
          </Space>
        }
      />

      {/* 主内容 */}
      <div className="batch-terminal-content">
        <div className="batch-terminal-main">
          {/* 左侧：服务器选择 */}
          <Card
            title="选择服务器"
            className="server-selector-card"
            extra={
              <Button
                type="text"
                icon={<IconRefresh />}
                size="small"
                onClick={fetchData}
                loading={executing}
              >
                刷新
              </Button>
            }
          >
            <div className="server-selector-content">
              {/* 分组选择 */}
              <div className="group-selector">
                <label className="selector-label">选择分组：</label>
                <Select
                  placeholder="选择分组"
                  style={{ width: '100%' }}
                  allowClear
                  value={selectedGroupId}
                  onChange={handleGroupChange}
                >
                  {groups.map((group) => (
                    <Option key={group.group_id} value={group.group_id}>
                      {group.name} ({servers.filter(s => s.group_id === group.group_id).length} 台)
                    </Option>
                  ))}
                </Select>
              </div>

              {/* 服务器列表 */}
              {servers.length > 0 && (
                <>
                  <Divider style={{ margin: '12px 0' }} />

                  <div className="server-select-all">
                    <Checkbox
                      checked={selectedServerIds.length === servers.length && servers.length > 0}
                      indeterminate={selectedServerIds.length > 0 && selectedServerIds.length < servers.length}
                      onChange={handleSelectAll}
                    >
                      全选 ({selectedServerIds.length}/{servers.length})
                    </Checkbox>
                  </div>

                  <div className="server-list">
                    {servers.map((server) => (
                      <div key={server.id} className="server-item">
                        <Checkbox
                          checked={selectedServerIds.includes(server.id)}
                          onChange={(checked) => handleServerToggle(server.id, checked)}
                        >
                          <div className="server-info">
                            <div className="server-name">{server.name || server.ip}</div>
                            <div className="server-detail">
                              <Tag size="small" color="blue">{server.ip}</Tag>
                              <Tag size="small">{server.ssh_user}</Tag>
                              <Tag size="small">{server.port}</Tag>
                            </div>
                          </div>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {servers.length === 0 && selectedGroupId && (
                <EmptyState
                  type="LIST"
                  simple
                  description="该分组下暂无服务器"
                />
              )}
            </div>
          </Card>

          {/* 右侧：命令执行和结果 */}
          <div className="terminal-right-panel">
            {/* 命令输入区 */}
            <Card
              title={
                <Space>
                  <IconCommand />
                  <span>命令输入</span>
                  <Tag color="arcoblue" size="small">
                    已选 {selectedServerIds.length} 台
                  </Tag>
                </Space>
              }
              className="command-input-card"
            >
              {/* 快捷命令 */}
              <div className="quick-commands">
                <Space size="small" wrap>
                  {QUICK_COMMANDS.map((cmd) => (
                    <Button
                      key={cmd.label}
                      size="small"
                      type="outline"
                      onClick={() => handleQuickCommand(cmd.command)}
                    >
                      {cmd.label}
                    </Button>
                  ))}
                </Space>
              </div>

              {/* 命令输入框 */}
              <TextArea
                placeholder="输入要执行的命令... (Ctrl+Enter 执行, Esc 清空)"
                value={command}
                onChange={setCommand}
                rows={4}
                style={{
                  fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                  fontSize: 14,
                }}
                autoFocus
              />

              {/* 操作按钮 */}
              <div className="command-actions">
                <div className="command-tips">
                  <Space size="medium">
                    <span className="tip-item">Ctrl+Enter 执行</span>
                    <span className="tip-item">Esc 清空</span>
                  </Space>
                </div>
                <Button
                  type="primary"
                  icon={<IconPlayArrow />}
                  loading={executing}
                  disabled={!command.trim() || selectedServerIds.length === 0}
                  onClick={handleExecute}
                  size="large"
                  className="execute-btn"
                >
                  {executing ? '执行中...' : '执行命令'}
                </Button>
              </div>
            </Card>

            {/* 结果展示区 */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Space>
                    <IconCommand />
                    <span>执行结果</span>
                    <Tag color="green" size="small">{successCount} 成功</Tag>
                    <Tag color="red" size="small">{failedCount} 失败</Tag>
                    {runningCount > 0 && (
                      <Tag color="blue" size="small"><Spin size="mini" /> {runningCount} 执行中</Tag>
                    )}
                  </Space>
                  <Select
                    size="small"
                    value={viewMode}
                    onChange={(val) => setViewMode(val as 'grid' | 'tabs')}
                    style={{ width: 100 }}
                  >
                    <Option value="grid">网格</Option>
                    <Option value="tabs">标签</Option>
                  </Select>
                </div>
              }
              className="results-card"
              bodyStyle={{ padding: 0 }}
            >
              {Object.keys(results).length === 0 ? (
                <EmptyState
                  description="选择服务器并执行命令查看结果"
                  icon={<IconCommand />}
                />
              ) : viewMode === 'grid' ? (
                <div className="batch-terminal-grid">
                  {Object.values(results).map((result) => (
                    <div key={result.server} className="batch-terminal-item">
                      <div className="batch-terminal-header">
                        <Space size="medium">
                          {result.loading && <Spin size={8} />}
                          <span className="server-ip">{result.server}</span>
                          {!result.loading && (
                            result.success ? (
                              <Tag color="green" size="small">✓ 成功</Tag>
                            ) : (
                              <Tag color="red" size="small">✗ 失败</Tag>
                            )
                          )}
                        </Space>
                      </div>
                      <div className={`batch-terminal-content ${result.success ? 'success' : 'error'}`}>
                        {result.loading ? (
                          <span className="loading-text">执行中...</span>
                        ) : (
                          <pre>{result.output || '(无输出)'}</pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Tabs type="card" className="results-tabs">
                  {Object.values(results).map((result) => (
                    <TabPane
                      key={result.server}
                      title={
                        <Space size="small">
                          {result.loading && <Spin size={8} />}
                          <span>{result.server}</span>
                          {!result.loading && (
                            result.success ? (
                              <Tag color="green" size="small">✓</Tag>
                            ) : (
                              <Tag color="red" size="small">✗</Tag>
                            )
                          )}
                        </Space>
                      }
                    >
                      <div className="tab-terminal-content">
                        <pre className={result.success ? 'success' : 'error'}>
                          {result.loading ? (
                            <span className="loading-text">执行中...</span>
                          ) : (
                            result.output || '(无输出)'
                          )}
                        </pre>
                      </div>
                    </TabPane>
                  ))}
                </Tabs>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* 命令历史抽屉 */}
      <Modal
        title="命令历史"
        visible={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={
          <Button
            type="primary"
            status="danger"
            icon={<IconDelete />}
            onClick={clearHistory}
            disabled={commandHistory.length === 0}
          >
            清空历史
          </Button>
        }
        width={600}
      >
        <div className="command-history-list">
          {commandHistory.length === 0 ? (
            <EmptyState simple description="暂无命令历史" />
          ) : (
            commandHistory.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => handleHistorySelect(item)}
              >
                <div className="history-command">{item.command}</div>
                <div className="history-time">
                  {item.timestamp.toLocaleString('zh-CN')}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
