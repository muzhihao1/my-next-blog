-- 配置定时任务
-- 需要先启用 pg_cron 扩展

-- 启用扩展（如果尚未启用）
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 每小时清理过期的分析数据
SELECT cron.schedule(
  'cleanup-analytics',
  '0 * * * *',
  'SELECT cleanup_old_analytics_data(90);'
);

-- 每天清理过期的监控数据
SELECT cron.schedule(
  'cleanup-monitoring',
  '0 0 * * *',
  'SELECT cleanup_old_monitoring_data(30);'
);

-- 每天清理已读通知（保留30天）
SELECT cron.schedule(
  'cleanup-notifications',
  '0 2 * * *',
  'SELECT cleanup_old_notifications(30);'
);

-- 查看已配置的定时任务
SELECT * FROM cron.job;