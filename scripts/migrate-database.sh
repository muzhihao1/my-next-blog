#!/bin/bash

# 数据库迁移脚本
# 按正确顺序执行所有 Supabase 迁移

set -e

echo "🗄️  开始执行数据库迁移..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查环境变量
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${YELLOW}⚠️  未设置 SUPABASE_DB_URL 环境变量${NC}"
    echo "请设置数据库连接字符串："
    echo "export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres'"
    exit 1
fi

# 迁移文件列表（按执行顺序）
MIGRATIONS=(
    "supabase-migration.sql:用户系统和基础表"
    "supabase-realtime-setup.sql:实时功能配置"
    "supabase-migration-analytics.sql:数据分析系统"
    "supabase-migration-monitoring.sql:性能监控系统"
    "supabase-migration-recommendation.sql:推荐系统"
)

# 询问执行模式
echo "请选择执行模式："
echo "1) 全部迁移（推荐首次部署）"
echo "2) 选择性迁移"
echo "3) 仅查看迁移状态"
read -p "选择 (1-3): " MODE

case $MODE in
    1)
        echo -e "${YELLOW}将执行所有迁移...${NC}"
        ;;
    2)
        echo -e "${YELLOW}选择要执行的迁移：${NC}"
        ;;
    3)
        echo -e "${BLUE}检查迁移状态...${NC}"
        # 这里可以添加检查已执行迁移的逻辑
        echo "功能开发中..."
        exit 0
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

# 创建迁移日志目录
mkdir -p logs/migrations
LOG_FILE="logs/migrations/migration-$(date +%Y%m%d-%H%M%S).log"

echo -e "${YELLOW}📋 迁移日志将保存到: $LOG_FILE${NC}"

# 执行迁移函数
execute_migration() {
    local file=$1
    local description=$2
    local script_path="scripts/$file"
    
    if [ ! -f "$script_path" ]; then
        echo -e "${RED}❌ 错误：未找到迁移文件 $script_path${NC}"
        return 1
    fi
    
    echo -e "${BLUE}执行: $description${NC}"
    echo "文件: $file"
    
    # 使用 psql 执行迁移
    if command -v psql &> /dev/null; then
        psql "$SUPABASE_DB_URL" -f "$script_path" >> "$LOG_FILE" 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 成功${NC}"
            return 0
        else
            echo -e "${RED}❌ 失败${NC}"
            echo "查看日志: $LOG_FILE"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  未安装 psql，显示 SQL 内容供手动执行：${NC}"
        echo "----------------------------------------"
        cat "$script_path"
        echo "----------------------------------------"
        read -p "是否已手动执行？(y/n): " MANUAL
        if [ "$MANUAL" = "y" ]; then
            return 0
        else
            return 1
        fi
    fi
}

# 执行前确认
echo -e "${YELLOW}⚠️  警告：迁移将修改数据库结构${NC}"
echo "数据库: $SUPABASE_DB_URL"
read -p "确认继续？(y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "迁移已取消"
    exit 0
fi

# 开始执行迁移
echo -e "${YELLOW}🚀 开始执行迁移...${NC}"

SUCCESS_COUNT=0
FAIL_COUNT=0

if [ "$MODE" = "1" ]; then
    # 执行所有迁移
    for migration in "${MIGRATIONS[@]}"; do
        IFS=':' read -r file description <<< "$migration"
        
        if execute_migration "$file" "$description"; then
            ((SUCCESS_COUNT++))
        else
            ((FAIL_COUNT++))
            echo -e "${RED}⚠️  迁移失败，是否继续？${NC}"
            read -p "(y/n): " CONTINUE
            if [ "$CONTINUE" != "y" ]; then
                break
            fi
        fi
        
        echo ""
    done
else
    # 选择性执行
    for i in "${!MIGRATIONS[@]}"; do
        IFS=':' read -r file description <<< "${MIGRATIONS[$i]}"
        echo "$((i+1))) $description ($file)"
    done
    
    read -p "输入要执行的迁移编号（用空格分隔）: " -a SELECTED
    
    for index in "${SELECTED[@]}"; do
        if [ "$index" -ge 1 ] && [ "$index" -le "${#MIGRATIONS[@]}" ]; then
            IFS=':' read -r file description <<< "${MIGRATIONS[$((index-1))]}"
            
            if execute_migration "$file" "$description"; then
                ((SUCCESS_COUNT++))
            else
                ((FAIL_COUNT++))
            fi
            
            echo ""
        fi
    done
fi

# 显示结果
echo -e "${YELLOW}📊 迁移完成${NC}"
echo -e "成功: ${GREEN}$SUCCESS_COUNT${NC}"
echo -e "失败: ${RED}$FAIL_COUNT${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ 所有迁移执行成功！${NC}"
    
    echo -e "${YELLOW}📋 后续步骤：${NC}"
    echo "1. 在 Supabase Dashboard 中启用 Realtime"
    echo "2. 检查 RLS 策略是否正确"
    echo "3. 测试数据库连接"
    echo "4. 验证表结构和索引"
else
    echo -e "${RED}⚠️  部分迁移失败，请检查日志${NC}"
    echo "日志文件: $LOG_FILE"
fi

# 保存迁移记录
echo "$(date): 执行了 $SUCCESS_COUNT 个迁移，失败 $FAIL_COUNT 个" >> logs/migrations/history.log