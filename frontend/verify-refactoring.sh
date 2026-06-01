#!/bin/bash

# 前端重构验证脚本

echo "🔍 开始验证前端重构..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success_count=0
error_count=0

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((success_count++))
    else
        echo -e "${RED}✗${NC} $1 (文件不存在)"
        ((error_count++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((success_count++))
    else
        echo -e "${RED}✗${NC} $1 (目录不存在)"
        ((error_count++))
    fi
}

check_no_file() {
    if [ ! -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 (已删除)"
        ((success_count++))
    else
        echo -e "${RED}✗${NC} $1 (应该被删除)"
        ((error_count++))
    fi
}

echo "📁 检查目录结构..."
check_dir "src/components/common"
check_dir "src/components/ServerList"
check_dir "src/pages"
check_dir "src/services"
check_dir "src/services/http"
check_dir "src/styles"
check_dir "src/types"
check_dir "src/utils"
check_dir "src/config"
echo ""

echo "📄 检查新增文件..."
check_file "src/styles/theme.css"
check_file "src/components/common/ErrorBoundary.tsx"
check_file "src/components/common/TableContainer.tsx"
check_file "src/utils/validation.ts"
check_file "src/utils/api-test.ts"
check_file "DEVELOPMENT_GUIDE.md"
check_file "REFACTORING_SUMMARY.md"
echo ""

echo "🗑️  检查删除的文件..."
check_no_file "src/index.css"
check_no_file "src/services/api.ts"
echo ""

echo "📝 检查配置文件..."
check_file "vite.config.ts"
check_file "tsconfig.json"
check_file ".eslintrc.json"
check_file ".prettierrc"
check_file "package.json"
echo ""

echo "🔍 检查关键文件内容..."
echo ""

# 检查 main.tsx 中的样式导入
if grep -q "import './styles/theme.css'" src/main.tsx; then
    echo -e "${GREEN}✓${NC} main.tsx 使用了新的主题样式"
    ((success_count++))
else
    echo -e "${RED}✗${NC} main.tsx 未导入主题样式"
    ((error_count++))
fi

# 检查 App.tsx 中的 ErrorBoundary
if grep -q "import.*ErrorBoundary" src/App.tsx; then
    echo -e "${GREEN}✓${NC} App.tsx 已集成 ErrorBoundary"
    ((success_count++))
else
    echo -e "${RED}✗${NC} App.tsx 未集成 ErrorBoundary"
    ((error_count++))
fi

# 检查 interceptors.ts 中的修复
if grep -q "HTTP_STATUS.BAD_REQUEST" src/services/http/interceptors.ts; then
    echo -e "${GREEN}✓${NC} interceptors.ts 状态码已修复"
    ((success_count++))
else
    echo -e "${RED}✗${NC} interceptors.ts 状态码未修复"
    ((error_count++))
fi

# 检查 ServerTable.tsx 中的修复
if ! grep -q 'Button"' src/components/ServerList/ServerTable.tsx; then
    echo -e "${GREEN}✓${NC} ServerTable.tsx 语法错误已修复"
    ((success_count++))
else
    echo -e "${RED}✗${NC} ServerTable.tsx 仍存在语法错误"
    ((error_count++))
fi

echo ""
echo "📦 检查依赖..."

# 检查 package.json 中的依赖
if grep -q "\"@types/node\"" package.json; then
    echo -e "${GREEN}✓${NC} @types/node 已添加"
    ((success_count++))
else
    echo -e "${YELLOW}⚠${NC} @types/node 未添加"
fi

if grep -q "\"eslint\"" package.json; then
    echo -e "${GREEN}✓${NC} ESLint 已添加"
    ((success_count++))
else
    echo -e "${YELLOW}⚠${NC} ESLint 未添加"
fi

if grep -q "\"prettier\"" package.json; then
    echo -e "${GREEN}✓${NC} Prettier 已添加"
    ((success_count++))
else
    echo -e "${YELLOW}⚠${NC} Prettier 未添加"
fi

echo ""
echo "📊 统计结果"
echo "─────────────────────"
echo -e "成功: ${GREEN}$success_count${NC}"
echo -e "失败: ${RED}$error_count${NC}"
echo ""

if [ $error_count -eq 0 ]; then
    echo -e "${GREEN}🎉 所有检查通过！重构已完成。${NC}"
    echo ""
    echo "下一步："
    echo "1. 运行 'npm install' 安装新依赖"
    echo "2. 运行 'npm run dev' 启动开发服务器"
    echo "3. 运行 'npm run lint' 检查代码质量"
    echo "4. 访问 http://localhost:3000 测试应用"
    echo ""
    echo "如需验证 API 连接，确保后端服务在 http://localhost:8080 运行"
    exit 0
else
    echo -e "${RED}❌ 发现 $error_count 个问题，请检查并修复${NC}"
    exit 1
fi
