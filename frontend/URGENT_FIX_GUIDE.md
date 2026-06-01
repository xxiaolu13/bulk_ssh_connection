# 索急修复指南

## 问题说明

之前的自动修复脚本错误地将所有组件的导入都改成了：
\`\`\`typescript
import { IconXXX } from '@arco-design/web-react/icon';
\`\`\`

这是**错误的**！正确的导入应该是：
\`\`\`typescript
import { IconXXX } from '@arco-design/web-react';
\`\`\`

---

## 需要手动修复的文件

### 1. src/components/ServerList/ServerTable.tsx

**错误导入**:
\`\`\`typescript
import { IconPlayArrow, IconCommand, IconEdit, IconDelete, Tooltip } from '@arco-design/web-react/icon';
\`\`\`

**正确导入**:
\`\`\`typescript
import { IconPlayArrow, IconCommand, IconEdit, IconDelete, Tooltip } from '@arco-design/web-react';
\`\`\`

---

### 2. src/components/ServerList/GroupTable.tsx

**修复命令**:
\`\`\`bash
sed -i "s/from '@arco-design\/web-react\/icon'/from '@arco-design\/web-react'/g" src/components/ServerList/GroupTable.tsx
\`\`\`

---

### 3. src/components/ServerList/ServerFormModal.tsx

**修复命令**:
\`\`\`bash
sed -i "s/from '@arco-design\/web-react\/icon'/from '@arco-design\/web-react'/g" src/components/ServerList/ServerFormModal.tsx
\`\`\`

---

### 4. src/components/ServerList/TerminalDrawer.tsx

**修复命令**:
\`\`\`bash
sed -i "s/from '@arco-design\/web-react\/icon'/from '@arco-design\/web-react'/g" src/components/ServerList/TerminalDrawer.tsx
\`\`\`

---

### 5. src/components/CronTasks/CronJobTable.tsx

**修复命令**:
\`\`\`bash
sed -i "s/from '@arco-design\/web-react\/icon'/from '@arco-design\/web-react'/g" src/components/CronTasks/CronJobTable.tsx
\`\`\`

---

### 6. src/components/common/ErrorBoundary.tsx

**修复命令**:
\`\`\`bash
sed -i "s/from '@arco-design\/web-react\/icon'/from '@arco-design\/web-react'/g" src/components/common/ErrorBoundary.tsx
\`\`\`

---

### 7. src/components/common/TableContainer.tsx

**修复命令**:
\`\`\`bash
sed -i "s/from '@arco-design\/web-react\/icon'/from '@arco-design\/web-react'/g" src/components/common/TableContainer.tsx
\`\`\`

---

### 8. src/pages/BatchTerminal.tsx

**修复命令**:
\`\`\`bash
sed -i "s/from '@arco-design\/web-react\/icon'/from '@arco-design\/web-react'/g" src/pages/BatchTerminal.tsx
\`\`\`

---

### 9. src/pages/CronLogs.tsx

**修复命令**:
\`\`\`bash
sed -i "s/from '@arco-design\/web-react\/icon'/from '@arco-design\/web-react'/g" src/pages/CronLogs.tsx
\`\`\`

---

### 10. src/pages/CronTasks.tsx

**修复命令**:
\`\`\`bash
sed -i "s/from '@arco-design\/web-react\/icon'/from '@arco-design\/web-react'/g" src/pages/CronTasks.tsx
\`\`\`

---

## 一键修复所有文件

运行以下命令批量修复所有文件的导入：

\`\`\`bash
cd frontend

# 修复所有组件文件中的错误导入
find src -name "*.tsx" -type f -exec sed -i "s/from '\\''@arco-design\\/web-react\\/icon'\\''/from '\\''@arco-design\\/web-react'\\''/g" {} \;

# 验证修复
npm run type-check
\`\`\`

---

## 其他需要修复的错误

除了导入错误，还有以下错误需要手动修复：

### 1. ServerTable.tsx 第 143 行
**错误**: Cannot find name 'Table'
**原因**: Table 组件没有被正确导入或使用

### 2. CronJobTable.tsx
**错误**: 类似的导入和

组件使用问题

### 3. ServerList.tsx 和其他页面文件
**错误**: API 返回值应该是 \`.data\` 而不是直接使用返回值

### 4. utils/message.ts
**错误**: Message API 返回类型不匹配

---

## 临时解决方案

如果需要快速启动开发服务器，可以暂时禁用严格类型检查：

在 \`tsconfig.json\` 中添加：
\`\`\`json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
\`\`\`

或使用命令行参数：
\`\`\`bash
npm run dev -- --mode development
\`\`\`

---

## 验证步骤

修复后运行以下命令验证：

\`\`\`bash
# 1. TypeScript 类型检查
npm run type-check

# 2. 构建验证
npm run build

# 3. 启动开发服务器
npm run dev
\`\`\`

---

## 总结

自动修复脚本创建了更多问题而不是解决问题。建议：

1. **手动恢复 Git 版本**: 如果有 Git 仓库，可以恢复到修复前的版本
2. **手动逐个修复**: 根据上面的指南逐个修复每个文件
3. **使用 IDE 的类型提示**: 让 IDE 帮助识别和修复类型错误

---

## 如果继续使用修复后的代码

需要做以下修复：

1. ✅ App.tsx - 已修复
2. ✅ services/http/index.ts - 已修复
3. ⏳ ServerList.tsx - 图标导入错误，需要修复
4. ⏳ TerminalDrawer.tsx - 图标导入错误，需要修复
5. ⏳ 所有其他组件 - 图标导入错误，需要修复

---

## 常见问题

- 大量的类型错误（40+ 个）是由于批量错误的导入导致的
- 原始错误只有 3-5 个，被不正确的自动修复扩大了
- 需要系统地而不是批量地修复问题

---

## 推荐的工作流程

1. 使用 \`git status\` 查看所有修改的文件
2. 使用 \`git diff\` 查看具体修改内容
3. 选择性恢复或修复文件
4. 使用 TypeScript 严格模式验证修复

---

