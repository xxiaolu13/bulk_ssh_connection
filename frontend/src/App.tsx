import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Layout, Button, Avatar, Dropdown, Space, Tooltip } from '@arco-design/web-react';
import {
  IconStorage,
IconClockCircle,
  IconDesktop,
  IconSun,
  IconMoon,
  IconUser,
  IconSettings,
} from '@arco-design/web-react/icon';
import ServerList from './pages/ServerList';
import CronTasks from './pages/CronTasks';
import CronLogs from './pages/CronLogs';
import BatchTerminal from './pages/BatchTerminal';
import { useTheme } from './contexts/ThemeContext';
import './styles/theme-modern.css';
import './styles/components/Navigation.css';
import './styles/components/Layout.css';
import './styles/components/Cards.css';
import './styles/components/Tables.css';
import './styles/components/Forms.css';
import './styles/components/PageHeader.css';
import './styles/components/ServerTable.css';
import './styles/components/FilterBar.css';
import './styles/components/StatsCard.css';
import './pages/ServerListPage.css';

const { Header, Content, Sider } = Layout;
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

/**
 * 菜单项配置
 */
const MENU_ITEMS = [
  {
    key: 'servers',
    label: '服务器管理',
    icon: <IconStorage />,
    path: '/servers',
  },
  {
    key: 'cron',
    label: '计划任务',
    icon: <IconClockCircle />,
    path: '/cron',
  },
  {
    key: 'terminal',
    label: '批量终端',
    icon: <IconDesktop />,
    path: '/terminal',
  },
];

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { theme, toggleTheme } = useTheme();

  const handleMenuClick = (key: string) => {
    const item = MENU_ITEMS.find((item) => item.key === key);
    if (item) {
      navigate(item.path);
    }
  };

  const getMenuKey = () => {
    if (currentPath === '/' || currentPath.startsWith('/servers')) {
      return 'servers';
    }
    if (currentPath.startsWith('/cron')) {
      return 'cron';
    }
    if (currentPath.startsWith('/terminal')) {
      return 'terminal';
    }
    return 'servers';
  };

  /**
   * 用户下拉菜单
   */
  const userMenu = (
    <Menu onClick={(key) => console.log(key)}>
      <MenuItem key="profile">
        <IconUser style={{ marginRight: 8 }} />
        个人信息
      </MenuItem>
      <MenuItem key="settings">
        <IconSettings style={{ marginRight: 8 }} />
        系统设置
      </MenuItem>
    </Menu>
  );

  return (
    <Layout className="app-layout">
      <Sider className="app-sider" width={220} style={{ height: '100vh' }}>
        {/* Logo 区域 */}
        <div className="app-logo">
          <div className="logo-content">
            <span className="logo-icon">🚀</span>
            <span className="logo-text">SSH Manager</span>
          </div>
        </div>

        {/* 导航菜单 */}
        <Menu
          className="app-menu"
          mode="vertical"
          selectedKeys={[getMenuKey()]}
          onClickMenuItem={(key, event, keyPath) => handleMenuClick(key)}
        >
          {MENU_ITEMS.map((item) => (
            <MenuItem key={item.key}>
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </MenuItem>
          ))}
        </Menu>

        {/* 底部信息 */}
        <div className="app-sider-footer">
          <div className="version-info">v1.0.0</div>
        </div>
      </Sider>

      <Layout className="app-main-layout" style={{ height: '100vh' }}>
        {/* 顶部导航栏 */}
        <Header className="app-header">
          <div className="header-left">
            <div className="page-title">
              {MENU_ITEMS.find((item) => item.key === getMenuKey())?.label || 'SSH Manager'}
            </div>
          </div>

          <div className="header-right">
            <Space size="medium">
              {/* 主题切换 */}
              <Tooltip content={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}>
                <Button
                  type="text"
                  icon={theme === 'light' ? <IconMoon /> : <IconSun />}
                  onClick={toggleTheme}
                  className="theme-toggle-btn"
                />
              </Tooltip>

              {/* 用户信息 */}
              <Dropdown droplist={userMenu} position="bottomRight">
                <div className="user-info">
                  <Avatar style={{ backgroundColor: '#3b82f6' }}>A</Avatar>
                  <span className="user-name">Admin</span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/servers" replace />} />
            <Route path="/servers" element={<ServerList />} />
            <Route path="/cron" element={<CronTasks />} />
            <Route path="/cron-logs/:jobId" element={<CronLogs />} />
            <Route path="/terminal" element={<BatchTerminal />} />
            <Route path="*" element={<Navigate to="/servers" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
