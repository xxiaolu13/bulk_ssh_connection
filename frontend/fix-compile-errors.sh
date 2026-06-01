#!/bin/bash

# 编译错误修复脚本

echo "🔍 开始修复编译错误..."

# 检查并修复所有组件中的图标导入
echo "📝 检查组件文件中的图标导入..."

COMPONENT_FILES=(
  "src/components/ServerList/ServerTable.tsx"
  "src/components/ServerList/GroupTable.tsx"
  "src/components/ServerList/ServerFormModal.tsx"
  "src/components/CronTasks/CronJobTable.tsx"
  "src/pages/ServerList.tsx"
  "src/pages/CronTasks.tsx"
  "src/pages/CronLogs.tsx"
  "src/pages/BatchTerminal.tsx"
  "src/components/ServerList/TerminalDrawer.tsx"
  "src/components/common/TableContainer.tsx"
  "src/components/common/ErrorBoundary.tsx"
)

for file in "${COMPONENT_FILES[@]}"; do
  if [ -f "$file" ]; then
    # 修复图标导入：从 '@arco-design/web-react' 改为从 '@arco-design/web-react/icon'
    sed -i "s/from '@arco-design\/web-react'/from '@arco-design\/web-react\/icon'/g" "$file"
    echo "  ✅ 修复图标导入: $file"
  fi
done

# 修复 App.tsx 中的图标导入
if [ -f "src/App.tsx" ]; then
  sed -i "s/import { IconStorage, IconClockCircle, IconDesktop } from '@arco-design\/web-react';/import { IconStorage, IconClockCircle, IconDesktop } from '@arco-design\/web-react\/icon';/g" "src/App.tsx"
  echo "  ✅ 修复 App.tsx 图标导入"
fi

echo ""
echo "✅ 图标导入修复完成！"
echo ""
echo "下一步："
echo "1. 运行 'npm run type-check' 验证类型检查"
echo "2. 运行 'npm run build' 验证构建"
echo ""
