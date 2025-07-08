-- 启用表的实时功能（不需要 Replication）
-- 在 Supabase SQL Editor 中执行

-- 为评论表启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- 为通知表启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 为分析事件表启用实时功能（可选，用于实时仪表板）
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_events;

-- 验证已启用的表
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';