# SSH Manager 前端美化指南

## 概述

本项目基于 Arco Design React 组件库，采用现代化的企业级管理后台设计风格。

## 主题配置

### 主色调系

- **主色**: `#165dff` (科技蓝)
- **成功色**: `#00b42a` (翡翠绿)
- **警告色**: `#ff7d00` (橙色)
- **危险色**: `#f53f3f` (玫瑰红)
- **信息色**: `#0fc6c2` (天蓝)

### 颜色变量

```css
/* 主色调 */
--primary-color: #165dff;
--primary-hover: #0e42d2;
--primary-active: #0027b3;

/* 状态色 */
--success-color: #00b42a;
--warning-color: #ff7d00;
--danger-color: #f53f3f;
--info-color: #0fc6c2;
```

### 背景色系

```css
--bg-page: #f7f8fa;      /* 页面背景 */
--bg-card: #ffffff;       /* 卡片背景 */
--bg-secondary: #f2f3f5; /* 次要背景 */
--bg-tertiary: #e5e6eb;   /* 三级背景 */
```

### 文字颜色系

```css
--text-primary: #1d2129;     /* 主要文字 */
--text-secondary: #4e5969;   /* 次要文字 */
--text-tertiary: #86909c;    /* 三级文字 */
--text-placeholder: #c9cdd4;  /* 占位符 */
```

### 阴影体系

```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
```

### 圆角体系

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
```

## 组件样式

### 1. 导航菜单

**样式文件**: `src/styles/components/Navigation.css`

特性：
- 渐变背景侧边栏
- 悬停时菜单项轻微上移
- 选中状态带左侧指示条和阴影
- Logo 悬浮动画
- 平滑的过渡效果

### 2. 页面头部

**样式文件**: `src/styles/components/PageHeader.css`

特性：
- 卡片式容器
- 渐变装饰线条
- 响应式布局
- 面包屑导航

### 3. 统计卡片

**样式文件**: `src/styles/components/Cards.css`

特性：
- 悬浮上移效果
- 顶部进度条动画
- 图标缩放动画
- 响应式网格布局

### 4. 数据表格

**样式文件**: `src/styles/components/Tables.css`

特性：
- 斑马纹行
- 悬停高亮
- 状态标签带指示点
- 固定列阴影效果
- 自定义分页样式

### 5. 表单组件

**样式文件**: `src/styles/components/Forms.css`

特性：
- 输入框聚焦时的光晕效果
- 按钮悬浮上移
- 开关平滑过渡
- 复选框和单选框自定义样式

## 动画效果

### 内置动画类

- `animate-fadeIn` - 淡入
- `animate-slideUp` - 向上滑入
- `animate-slideDown` - 向下滑入
- `animate-scaleIn` - 缩放进入
- `animate-pulse` - 脉冲

### 使用示例

```html
<div className="animate-fadeIn">内容</div>
<div className="animate-slideUp">内容</div>
```

## 响应式设计

### 断点

- `768px` - 移动端
- `480px` - 小屏移动端

### 响应式策略

1. 卡片网格自动调整列数
2. 表格在小屏幕下横向滚动
3. 导航栏在小屏幕下折叠
4. 表单在小屏幕下单列显示

## 深色模式

### 切换方式

通过 `data-theme='dark'` 属性切换：

```html
<html data-theme="dark">
```

### 深色模式样式

所有组件都包含深色模式样式，通过 CSS 变量自动适配：

```css
[data-theme='dark'] {
  --bg-page: #0f172a;
  --bg-card: #1e293b;
  --text-primary: #f1f5f9;
  /* ... */
}
```

## 最佳实践

### 1. 使用 CSS 变量

优先使用定义好的 CSS 变量，确保主题一致性：

```css
.error-text {
  color: var(--danger-color);
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
}
```

### 2. 组件隔离

每个组件的样式应独立管理，避免全局污染：

```css
/* ✅ 好的做法 */
.component-name .child {
  /* 样式 */
}

/* ❌ 避免 */
.child {
  /* 样式 */
}
```

### 3. 过渡效果

为交互元素添加平滑过渡：

```css
.element {
  transition: all var(--transition-normal) ease;
}
```

### 4. 悬停反馈

为可交互元素提供悬停反馈：


```css
.button {
  transform: translateY(0);
  transition: transform var(--transition-fast) ease;
}

.button:hover {
  transform: translateY(-2px);
}
```.button:active {
  transform: translateY(0);
}

```

### 5. 阴影使用

根据层级合理使用阴影：

```css
/* 小元素 */
.card {
  box-shadow: var(--shadow-sm);
}

/* 悬浮元素 */
.card:hover {
  box-shadow: var(--shadow-md);
}

/* 模态框/抽屉 */
.modal {
  box-shadow: var(--shadow-lg);
}
```

## 新增文件清单

### 样式文件

1. `src/styles/theme-modern.css` - 主题变量和全局样式
2. `src/styles/components/Navigation.css` - 导航菜单样式
3. `src/styles/components/Cards.css` - 卡片组件样式
4. `src/styles/components/Tables.css` - 表格组件样式
5. `src/styles/components/Forms.css` - 表单组件样式
6. `src/styles/components/Layout.css` - 布局样式

### 文档

- `STYLING_GUIDE.md` - 本文档

## 运行项目

```bash
cd frontend
npm run dev
```

## 注意事项

1. 确保所有样式文件已在 `App.tsx` 中导入
2. 使用 Arco Design 组件时遵循官方规范
3. 保持样式文件与组件文件目录结构一致
4. 添加新样式时优先使用 CSS 变量
5. 测试浅色和深色模式下的显示效果

## 扩展主题

如需自定义主题颜色，修改 `theme-modern.css` 中的 CSS 变量：

```css
:root {
  --primary-color: #your-color;
  /* ... */
}
```

深色模式颜色在 `[data-theme='dark']` 选择器中定义。

## 参考资料

- [Arco Design 官方文档](https://arco.design/)
- [Arco Design React](https://react.arco.design/)
- [CSS 变量最佳实践](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
