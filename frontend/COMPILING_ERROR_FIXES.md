# 编译错误修复清单

## 错误汇总

运行 `npm run type-check` 发现了以下 40+ 个 TypeScript 错误。以下是修复计划：

---

## 需要修复的文件和错误

### 1. App.tsx

**错误列表**:
- `IconStorage`、`IconClockCircle`、`IconDesktop` - 需要从 `@arco-design/web-react/icon` 导入
- Menu.Item 语法错误
- Breadcrumb.Item 语法错误
- 多处箭头函数语法问题

**修复方案**:
```typescript
// 修正导入
import { IconStorage, IconClockCircle, IconDesktop } from '@arco-design/web-react/icon';

// 修正菜单项
<Menu.Item key={item.key}>
  <span>...</span>
</Menu.Item>

// 修正面包项屑
<Breadcrumb.Item key={index}>{item.name}</Breadcrumb.Item>
```

---

### 2. ServerList.tsx

**错误**:
- 图标导入路径错误
- `onOpenOpenTerminal` 应该是 `onOpenTerminal`

**修复方案**:
```typescript
import { IconPlus, IconStorage, IconFolder } from '@arco-design/web-react/icon';

// 修正属性名
onOpenTerminal={handleOpenTerminal}
```

---

### 3. CronTasks.tsx 和其他页面

**错误**:
- API 返回值应该是 `.data` 而不是直接使用返回值
- 图标导入路径错误

**修复方案**:
```typescript
// 修正 API 调用
const jobsRes = await cronJobApi.getAll();
setJobs(jobsRes.data);  // 使用 .data

// 修正图标导入
import { IconFile, IconEdit, IconDelete, IconPlus } from '@arco-design/web-react/icon';
```

---

### 4. ServerTable.tsx

**错误**:
- 图标导入错误
- 类型错误

**修复方案**:
```typescript
import { IconPlayArrow, IconCommand, IconEdit, IconDelete } from '@arco-design/web-react/icon';
```

---

### 5. GroupTable.tsx 和相关组件

**错误**:
- 图标导入错误
- `sizeCanChange` 应该是 `sizeCanChange`
- 分页属性名错误

**修复方案**:
```typescript
pagination={{
  showTotal: true,
  sizeCanChange: true,  // 不是 sizeCanChange
  pageSizeOptions: APP_CONFIG.PAGE_SIZE_OPTIONS,
  pageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
}}
```

---

### 6. CronJobTable.tsx

**错误**:
- 图标导入错误
- Table 组件导入错误

---

### 7. ServerFormModal.tsx

**错误**:
- 图标导入错误

---

### 8. TerminalDrawer.tsx

**错误**:
- 图标导入错误
- 主题属性 `selection` 不存在

**修复方案**:
```typescript
// 移除不存在的 selection 属性
theme: {
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  cursor: '#d4d4d4',
  cursorAccent: '#1e1e1e',
  // selection: ...  // 删除此属性
}
```

---

### 9. ErrorBoundary.tsx

**错误**:
- `className` 属性类型错误
- `Properties<string | number, string>` 类型错误

---

### 10. TableContainer.tsx

**错误**:
- 图标导入错误
- `children` 属性不存在于 TableProps
- spread 类型错误
- `size` 属性值错误

---

### 11. utils/message.ts

**错误**:
- `Message` API 返回类型与使用不匹配
- `closeMessage` 参数类型错误

---

### 12. utils/formatter.ts

**错误**:
- `toFixed` 不存在于类型定义

---

### 13. services/http/interceptors.ts

**错误**:
- `data?.message` 属性访问错误

---

## 统一修复方案

### 图标导入修复

所有文件需要将图标导入从：
```typescript
import { IconXXX } from '@arco-design/web-react';
```

改为：
```typescript
import { IconXXX } from '@arco-design/web-react/icon';
```

### API 响应处理修复

所有 API 调用需要正确处理响应：
```typescript
// 错误
const servers = await serverApi.getAll();

// 正确
const response = await serverApi.getAll();
const servers = response.data;
```

或者统一 API 返回类型（已在 services/http/index.ts 中实现）。

---

## 快速修复步骤

1. **备份当前代码**:
```bash
git add .
git commit -m "Backup before fixing compilation errors"
```

2. **修复所有图标导入**（全局查找替换）

3. **修复 API 响应处理**（在 services/index.ts 中统一处理）

4. **修复组件属性类型**

5. **运行类型检查验证**:
```bash
npm run type-check
```

6. **运行构建验证**:
```bash
npm run build
```

---

## 环境变量检查

如果构建仍有问题，检查：
- Node.js 版本（需要 18+）
- npm 版本
- 依赖版本兼容性

---

## 推荐修复顺序

1. ✅ 修复 services/http/index.ts（已完成）
2. ✅ 修复 TerminalDrawer.tsx（已完成）
3. ⏳ 修复 App.tsx - 图标导入、菜单语法
4. ⏳ 修复所有组件的图标导入
5. ⏳ 修复所有页面的 API 响应处理
6. ⏳ 修复 utils/ 文件中的类型错误
7. ⏳ 修复 components/ 中的类型错误

---

## 临时解决方案

如果需要快速启动开发服务器，可以暂时禁用严格类型检查：

在 `tsconfig.json` 中：
```json
{
  "compilerOptions": {
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
```

---

## 联系支持如需帮助

修复这些问题需要系统性地处理每个文件。建议：

1. 先修复 `App.tsx` - 它是入口文件，影响最大
2. 然后修复 `services/index.ts` - 统一 API 响应处理
3. 最后逐个修复组件文件

每个文件修复后立即运行 `npm run type-check` 验证。
