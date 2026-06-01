import { useState, useCallback, useEffect } from 'react';
import { Button, Space, Select, message, Tabs, Badge, Card, Empty } from '@arco-design/web-react';
import { IconPlus, IconStorage, IconFolder, IconExport, IconImport, IconThunderbolt, IconList, IconCheckCircle } from '@arco-design/web-react/icon';
import { serverApi, groupApi, sshApi } from '../services';
import type { Server, Group, CreateSingleServer, UpdateServer, CreateGroup, UpdateGroup } from '../types';
import { showSuccess, showError, showLoading } from '../utils';
import { EmptyState } from '../components/common';
import {
  ServerTable,
  GroupTable,
  ServerFormModal,
  GroupFormModal,
  TerminalDrawer,
  StatsCard,
} from '../components/ServerList';
import './ServerListPage.css';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

/**
 * 服务器列表页面组件
 */
export default function ServerList() {
  // 数据状态
  const [servers, setServers] = useState<Server[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState('');

  // UI 状态
  const [activeTab, setActiveTab] = useState<'servers' | 'groups'>('servers');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  // 模态框状态
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [serverModalMode, setServerModalMode] = useState<'create' | 'edit'>('create');
  const [currentServer, setCurrentServer] = useState<Server | null>(null);

  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'create' | 'edit'>('create');
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  // 终端抽屉状态
  const [terminalVisible, setTerminalVisible] = useState(false);

  /**
   * 获取数据
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [serversRes, groupsRes] = await Promise.all([
        selectedGroupId ? serverApi.getByGroupId(selectedGroupId).catch(() => []) : serverApi.getAll().catch(() => []),
        groupApi.getAll().catch(() => []),
      ]);
      setServers(serversRes || []);
      setGroups(groupsRes || []);
    } catch (error) {
      showError(error as Error);
      setServers([]);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGroupId]);

  // 初始化加载数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 处理服务器操作
   */
  const handleCreateServer = async (values: CreateSingleServer) => {
    showLoading('创建中...');
    try {
      await serverApi.createSingle(values);
      showSuccess('创建成功');
      setServerModalVisible(false);
      fetchData();
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleUpdateServer = async (values: UpdateServer) => {
    if (!currentServer) return;

    showLoading('更新中...');
    try {
      await serverApi.update(currentServer.id, values);
      showSuccess('更新成功');
      setServerModalVisible(false);
      fetchData();
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleDeleteServer = async (id: number) => {
    showLoading('删除中...');
    try {
      await serverApi.delete(id);
      showSuccess('删除成功');
      fetchData();
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleTestConnection = async (id: number) => {
    showLoading('正在测试连接...');
    try {
      const result = await sshApi.testConnection(id);
      showSuccess(`连接成功: ${result}`);
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleOpenTerminal = (server: Server) => {
    setCurrentServer(server);
    setTerminalVisible(true);
  };

  const handleEditServer = (server: Server) => {
    setCurrentServer(server);
    setServerModalMode('edit');
    setServerModalVisible(true);
  };

  /**
   * 处理分组操作
   */
  const handleCreateGroup = async (values: CreateGroup) => {
    showLoading('创建中...');
    try {
      await groupApi.create(values);
      showSuccess('创建成功');
      setGroupModalVisible(false);
      fetchData();
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleUpdateGroup = async (values: UpdateGroup) => {
    if (!currentGroup) return;

    showLoading('更新中...');
    try {
      await groupApi.update(currentGroup.group_id, values);
      showSuccess('更新成功');
      setGroupModalVisible(false);
      fetchData();
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    showLoading('删除中...');
    try {
      await groupApi.delete(id);
      showSuccess('删除成功');
      fetchData();
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleEditGroup = (group: Group) => {
    setCurrentGroup(group);
    setGroupModalMode('edit');
    setGroupModalVisible(true);
  };

  // 计算统计数据
  const serverCount = servers.length;
  const onlineCount = servers.filter(s => s.status === 'online').length;
  const offlineCount = serverCount - onlineCount;
  const groupCount = groups.length;

  // 过滤服务器
  const filteredServers = servers.filter(server => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      (server.name && server.name.toLowerCase().includes(keyword)) ||
      server.ip.toLowerCase().includes(keyword) ||
      (server.ssh_user && server.ssh_user.toLowerCase().includes(keyword))
    );
  });

  // 获取分组名称
  const getGroupName = (groupId?: number): string => {
    if (!groupId) return '-';
    const group = groups.find((g) => g.group_id === groupId);
    return group?.name || '-';
  };

  return (
    <div className="server-list-page">
      {/* 页面头部 - 现代化设计 */}
      <div className="page-header-modern">
        <div className="header-content">
          <div className="header-left">
            <div className="page-title-wrapper">
              <span className="page-title-icon">🖥️</span>
              <h1 className="page-title">服务器管理</h1>
            </div>
            <p className="page-description">管理 SSH 服务器连接和分组</p>
          </div>
          <div className="header-right">
            <Space size="medium">
              <Select
                placeholder="选择分组"
                allowClear
                value={selectedGroupId}
                onChange={setSelectedGroupId}
                style={{ width: 160 }}
                showSearch
              >
                {groups.map(g => (
                  <Option key={g.group_id} value={g.group_id}>
                    {g.name} ({servers.filter(s => s.group_id === g.group_id).length})
                  </Option>
                ))}
              </Select>
              <Button icon={<IconExport />}>导出</Button>
              <Button icon={<IconImport />}>导入</Button>
              <Button
                type="primary"
                icon={<IconPlus />}
                onClick={() => {
                  if (activeTab === 'tabServers') {
                    setServerModalMode('create');
                    setCurrentServer(null);
                    setServerModalVisible(true);
                  } else {
                    setGroupModalMode('create');
                    setCurrentGroup(null);
                    setGroupModalVisible(true);
                  }
                }}
              >
                {activeTab === 'tabServers' ? '添加服务器' : '添加分组'}
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* 统计卡片 - 现代化设计 */}
      {activeTab === 'tabServers' && (
        <div className="stats-section">
          <StatsCard
            total={serverCount}
            online={onlineCount}
            offline={offlineCount}
            groups={groupCount}
          />
        </div>
      )}

      {/* 搜索和筛选栏 */}
      {activeTab === 'tabServers' && (
        <div className="search-section">
          <div className="search-input-wrapper">
            <Select
              placeholder="搜索服务器名称、IP地址或用户名..."
              allowClear
              showSearch
              allowCreate
              value={searchKeyword}
              onChange={setSearchKeyword}
              style={{ width: '100%' }}
              filterOption={(inputValue, option) => {
                return option.props.children?.toLowerCase().includes(inputValue.toLowerCase());
              }}
            />
          </div>
          <div className="view-mode-toggles">
            <Button
              type={viewMode === 'list' ? 'primary' : 'outline'}
              icon={<IconList />}
              onClick={() => setViewMode('list')}
              size="only-icon"
            />
            <Button
              type={viewMode === 'card' ? 'primary' : 'outline'}
              icon={<IconThunderbolt />}
              onClick={() => setViewMode('card')}
              size="only-icon"
            />
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="content-section">
        <Tabs
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'servers' | 'groups')}
          type="line"
          className="modern-tabs"
          extra={loading ? null : (
            <Badge count={activeTab === 'tabServers' ? filteredServers.length : groups.length}>
              <span className="tab-badge-count" />
            </Badge>
          )}
        >
          <TabPane
            key="tabServers"
            title={
              <span className="tab-title">
                <IconStorage />
                <span>服务器</span>
                {!loading && <Badge count={filteredServers.length} />}
              </span>
            }
          >
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner" />
                <p>加载中...</p>
              </div>
            ) : filteredServers.length === 0 ? (
              <EmptyState
                type="TABLE"
                description="暂无服务器，请点击右上角添加服务器"
                action={
                  <Button
                    type="primary"
                    icon={<IconPlus />}
                    onClick={() => {
                      setServerModalMode('create');
                      setCurrentServer(null);
                      setServerModalVisible(true);
                    }}
                  >
                    添加服务器
                  </Button>
                }
              />
            ) : (
              <ServerTable
                data={filteredServers}
                groups={groups}
                loading={loading}
                onTestConnection={handleTestConnection}
                onOpenTerminal={handleOpenTerminal}
                onEdit={handleEditServer}
                onDelete={handleDeleteServer}
                viewMode={viewMode}
              />
            )}
          </TabPane>
          <TabPane
            key="tabGroups"
            title={
              <span className="tab-title">
                <IconFolder />
                <span>分组</span>
                {!loading && <Badge count={groupCount} />}
              </span>
            }
          >
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner" />
                <p>加载中...</p>
              </div>
            ) : groups.length === 0 ? (
              <EmptyState
                type="TABLE"
                description="暂无分组，请点击右上角添加分组"
                action={
                  <Button
                    type="primary"
                    icon={<IconPlus />}
                    onClick={() => {
                      setGroupModalMode('create');
                      setCurrentGroup(null);
                      setGroupModalVisible(true);
                    }}
                  >
                    添加分组
                  </Button>
                }
              />
            ) : (
              <GroupTable
                data={groups}
                loading={loading}
                onEdit={handleEditGroup}
                onDelete={handleDeleteGroup}
              />
            )}
          </TabPane>
        </Tabs>
      </div>

      {/* 服务器表单模态框 */}
      <ServerFormModal
        visible={serverModalVisible}
        mode={serverModalMode}
        groups={groups}
        initialValues={currentServer || undefined}
        onOk={serverModalMode === 'create' ? handleCreateServer : handleUpdateServer}
        onCancel={() => setServerModalVisible(false)}
      />

      {/* 分组表单模态框 */}
      <GroupFormModal
        visible={groupModalVisible}
        mode={groupModalMode}
        initialValues={currentGroup || undefined}
        onOk={groupModalMode === 'create' ? handleCreateGroup : handleUpdateGroup}
        onCancel={() => setGroupModalVisible(false)}
      />

      {/* 终端抽屉 */}
      <TerminalDrawer
        visible={terminalVisible}
        server={currentServer}
        onClose={() => setTerminalVisible(false)}
      />
    </div>
  );
}
