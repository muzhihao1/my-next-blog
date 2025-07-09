#!/bin/bash

# 添加 Supabase 环境变量到 .env.local

cat >> .env.local << 'EOF'

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://xelyobfvfjqeuysfzpcf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=替换为您的anon_key
SUPABASE_SERVICE_ROLE_KEY=替换为您的service_role_key

# 功能开关
NEXT_PUBLIC_REALTIME_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_MONITORING_ENABLED=true

# 实时配置
NEXT_PUBLIC_REALTIME_HEARTBEAT_INTERVAL=30000
NEXT_PUBLIC_REALTIME_RECONNECT_DELAY=5000

# 分析配置
NEXT_PUBLIC_ANALYTICS_BATCH_SIZE=10
NEXT_PUBLIC_ANALYTICS_FLUSH_INTERVAL=10000

# 监控配置
NEXT_PUBLIC_MONITORING_SAMPLE_RATE=1.0
NEXT_PUBLIC_MONITORING_REPORT_INTERVAL=60000

# 缓存配置
CACHE_TTL=3600000
EOF

echo "✅ 配置已添加到 .env.local"
echo ""
echo "📝 请编辑 .env.local 文件，替换以下内容："
echo "   1. NEXT_PUBLIC_SUPABASE_ANON_KEY=替换为您的anon_key"
echo "   2. SUPABASE_SERVICE_ROLE_KEY=替换为您的service_role_key"
echo ""
echo "🔍 在 Supabase Dashboard → Settings → API 中找到这些密钥"