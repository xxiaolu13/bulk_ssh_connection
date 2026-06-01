# 前端开发指南

## 项目概述

这是一个基于 React 18 + Arco Design 的批量 SSH 连接管理系统前端项目。

## 技术栈

- **框架：** React 18.2.0
- **UI 库：** Arco Design 2.62.0
- **路由：** React Router 6.22.3
- **HTTP 客户端：** Axios 1.6.8
- **类型检查：** TypeScript 5.4.2
- **构建工具：** Vite 5.2.0
- **终端模拟：** xterm.js 5.3.0

## 目录结构

```
frontend/
├── src/
│   ├── components/          # 组件目录
│   │   ├── common/          # 公共组件
│   │   │   ├── ErrorBoundary.tsx      # 错误边界
│   │   │   ├── PageHeader.tsx          # 页面头部
│   │   │   ├── FilterBar.tsx           # 过滤栏
│   │   │   ├── StatusTag.tsx           # 状态标签
│   │   │   ├── EmptyState.tsx          # 空状态
│   │   │   ├── CodeBlock.tsx           # 代码块
│   │   │   └── TableContainer.tsx      # 表格容器
│   │   ├── CronTasks/          # Cron 任务相关组件
│   │   │   └── CronJobTable.tsx       # Cron 任务表格
│   │   └── ServerList/         # 服务器列表相关组件
│   │       ├── ServerTable.tsx          # 服务器表格
│   │       ├── GroupTable.tsx           # 分组表格
│   │       ├── ServerFormModal.tsx      # 服务器表单
│   │       ├── GroupFormModal.tsx       # 分组表单
│   │       └── TerminalDrawer.tsx       # 终端抽屉
│   ├── pages/              # 页面组件
│   │   ├── ServerList.tsx             # 服务器列表页
│   │   ├── CronTasks.tsx              # 计划任务页
│   │   ├── CronLogs.tsx               # 任务日志页
│   │   └── BatchTerminal.tsx           # 批量终端页
│   ├── services/            # API 服务
│   │   ├── http/                       # HTTP 客户端配置
│   │   │   ├── index.ts                # HTTP 方法封装
│   │   │   ├── config.ts               # HTTP 配置
│   │   │   └── interceptors.ts         # 请求/响应拦截器
│   │   ├── serverApi.ts                # 服务器 API
│   │   ├── groupApi.ts                 # 分组 API
│   │   ├── cronJobApi.ts              # Cron 任务 API
│   │   ├── cronLogApi.ts               # 日志 API
│   │   ├── sshApi.ts                  # SSH API
│   │   └── index.ts                   # 统一导出
│   ├── styles/              # 样式文件
│   │   └── theme.css                 # 全局主题样式
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── index.ts                   # 工具导出
│   │   ├── message.ts                 # 消息提示
│   │   ├── formatter.ts               # 格式化工具
│   │   ├── status.ts                  # 状态处理
│   │   ├── validation.ts              # 表单验证
│   │   └── api-test.ts               # API 测试工具
│   ├── config/              # 配置文件
│   │   └── constants.ts               # 常量配置
│   ├── App.tsx             # 根组件
│   ├── App.css             # App 组件样式
│   └── main.tsx            # 应用入口
├── public/                # 静态资源
├── dist/                  # 构建输出目录
├── node_modules/           # 依赖包
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
├── .eslintrc.json        # ESLint 配置
├── .prettierrc           # Prettier 配置
└── index.html             # HTML 模板
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 代码规范

### 代码检查

```bash
npm run lint
```

### 自动修复

```bash
npm run lint:fix
```

### 代码格式化

```bash
npm run format
```

### 类型检查

```bash
npm run type-check
```

## 组件开发规范

### 1. 组件命名

- 使用 PascalCase 命名组件文件和组件本身
- 文件名与导出的组件名保持一致

### 2. 类型定义

- 使用 TypeScript 定义接口
- Props 接口命名使用 `ComponentNameProps`

```typescript
interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  // ...
};
```

### 3. 样式规范

- 使用 Arco Design 的 Design Tokens
- 优先使用 `src/styles/theme.css` 中定义的 CSS 变量
- 组件特定样式使用 CSS Modules 或 styled-components

### 4. 错误处理

使用错误边界捕获组件错误：

```typescript
import { ErrorBoundary } from './components/common';

<ErrorBoundary onError={handleError}>
  <YourComponent />
</ErrorBoundary>
```

使用消息提示工具：

```typescript
import { showSuccess, showError, showLoading } from './utils';

const loadingId = showLoading('处理中...');
try {
  await apiCall();
  showSuccess('操作成功');
} catch (error) {
  showError(error);
} finally {
  closeMessage(loadingId);
}
```

## API 调用规范

### API 服务结构

所有 API 服务位于 `src/services/` 目录：

```typescript
// serverApi.ts
import { get, post, put, del } from './http';
import type { Server } from '../types';

export const serverApi = {
  getAll: (): Promise<Server[]> =>
    get<Server[]>('/server').then((res) => res.data),

  create: (data: CreateServer): Promise<Server> =>
    post<Server>('/server', data).then((res) => res.data),

  // ...
};
```

### 使用 API

```typescript
import { serverApi } from './services';

// 获取数据
const servers = await serverApi.getAll();

// 创建数据
const newServer = await serverApi.create({ ip: '192.168.1.1', ... });

// 错误处理
try {
  const server = await serverApi.getById(1);
  // ...
} catch (error) {
  showError(error);
}
```

## 样式定制

### 主题变量

在 `src/styles/theme.css` 中定义的主题变量：

```css
:root {
  /* 颜色 */
  --primary-color: rgb(var(--arcoblue-6));
  --success-color: rgb(var(--green-6));
  --warning-color: rgb(var(--orange-6));
  --danger-color: rgb(var(--red-6));

  /* 间距 */
  --spacing-small: 8px;
  --spacing-medium: 16px;
  --spacing-large: 24px;

  /* 圆角 */
  --radius-medium: 4px;
  --radius-large: 8px;

  /* 阴影 */
  --shadow-light: 0 0 10px rgba(0, 0, 0, 0.05);
}
```

### 自定义组件样式

使用 CSS 变量：

```css
.my-component {
  background: var(--bg-color);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-light);
  padding: var(--spacing-medium);
}
```

## 测试

### API 测试

在浏览器控制台运行：

```javascript
testAPI()
```

这将测试所有主要的 API 端点并显示结果。

### 表单验证

使用验证工具：

```typescript
import { getFormFieldRules, validateIP, validatePort } from './utils/validation';

// 获取表单规则
const rules = getFormFieldRules('ip');

// 手动验证
const isValid = validateIP('192.168.1.1');
```

## 常见问题

### 1. 端口已被占用

修改 `vite.config.ts` 中的端口：

```typescript
server: {
  port: 3001, // 修改为其他端口
}
```

### 2. API 请求失败

检查后端服务是否运行，端口是否正确配置：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080', // 确保后端端口正确
    }
  }
}
```

### 3. 类型错误

确保已安装类型定义：

```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

## 性能优化建议

1. **路由懒加载**

```typescript
const ServerList = lazy(() => import('./pages/ServerList'));
```

2. **使用 useMemo 和 useCallback**

```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

const handleClick = useCallback(() => {
  // ...
}, [dependency]);
```

3. **表格虚拟滚动**

对于大数据量表格，使用虚拟滚动：

```typescript
<Table
  scroll={{ x: true, y: 500 }}
  pagination={false}
  border={false}
  virtualListProps={{ height: 500 }}
/>
```

## 部署

### 构建生产版本

```bash
npm run build
```

构建产物将在 `dist/` 目录。

### 使用 Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

### Docker 部署

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 相关资源

- [Arco Design 文档](https://arco.design/react/docs/start)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Vite 文档](https://vitejs.dev/)
