#!/bin/bash

# Vercel 部署脚本
# 使用前请确保已安装 Vercel CLI: npm i -g vercel

set -e

echo "🚀 开始部署到 Vercel..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ 错误：未找到 Vercel CLI${NC}"
    echo "请先安装: npm i -g vercel"
    exit 1
fi

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 询问部署环境
echo "请选择部署环境："
echo "1) Production (生产环境)"
echo "2) Preview (预览环境)"
echo "3) Development (开发环境)"
read -p "选择 (1-3): " ENV_CHOICE

case $ENV_CHOICE in
    1)
        ENV="production"
        ENV_FLAG="--prod"
        ;;
    2)
        ENV="preview"
        ENV_FLAG=""
        ;;
    3)
        ENV="development"
        ENV_FLAG=""
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

echo -e "${YELLOW}📋 部署前检查...${NC}"

# 检查环境变量文件
if [ "$ENV" = "production" ]; then
    if [ ! -f ".env.production.local" ]; then
        echo -e "${YELLOW}⚠️  警告：未找到 .env.production.local 文件${NC}"
        echo "请确保已在 Vercel Dashboard 中配置环境变量"
        read -p "是否继续？(y/n): " CONTINUE
        if [ "$CONTINUE" != "y" ]; then
            exit 1
        fi
    fi
fi

# 运行构建测试
echo -e "${YELLOW}🔨 运行本地构建测试...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 构建失败，请修复错误后重试${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建成功${NC}"

# 类型检查
echo -e "${YELLOW}🔍 运行类型检查...${NC}"
npm run type-check || true

# 询问是否运行测试
read -p "是否运行测试？(y/n): " RUN_TESTS
if [ "$RUN_TESTS" = "y" ]; then
    echo -e "${YELLOW}🧪 运行测试...${NC}"
    npm test || true
fi

# 显示将要部署的信息
echo -e "${YELLOW}📦 准备部署...${NC}"
echo "环境: $ENV"
echo "分支: $(git branch --show-current)"
echo "最新提交: $(git log -1 --oneline)"

# 确认部署
read -p "确认部署？(y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "部署已取消"
    exit 0
fi

# 执行部署
echo -e "${YELLOW}🚀 开始部署...${NC}"

if [ "$ENV" = "production" ]; then
    # 生产环境部署
    vercel --prod
else
    # 预览环境部署
    vercel
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 部署成功！${NC}"
    
    # 获取部署URL
    echo -e "${YELLOW}🔗 获取部署信息...${NC}"
    vercel ls --output json | jq -r '.[] | select(.state=="READY") | .url' | head -1
    
    # 部署后任务
    echo -e "${YELLOW}📋 部署后任务提醒：${NC}"
    echo "1. 检查部署的网站是否正常工作"
    echo "2. 测试关键功能（登录、评论、搜索等）"
    echo "3. 检查性能监控数据"
    echo "4. 验证环境变量是否正确"
    
    if [ "$ENV" = "production" ]; then
        echo -e "${YELLOW}⚠️  生产环境额外检查：${NC}"
        echo "- 检查 SSL 证书"
        echo "- 验证自定义域名"
        echo "- 测试告警通知"
        echo "- 监控错误日志"
    fi
else
    echo -e "${RED}❌ 部署失败${NC}"
    echo "请检查错误信息并重试"
    exit 1
fi