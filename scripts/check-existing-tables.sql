-- 检查已存在的分析系统相关表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'analytics_events',
  'analytics_sessions',
  'realtime_active_sessions',
  'analytics_hourly',
  'analytics_daily',
  'analytics_weekly',
  'analytics_monthly',
  'content_scores',
  'content_trending_scores',
  'analytics_anomalies',
  'analytics_scheduled_reports',
  'user_actions',
  'page_view_counts'
)
ORDER BY table_name;

-- 检查已存在的索引
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'analytics_events',
  'analytics_sessions',
  'user_actions'
)
ORDER BY tablename, indexname;