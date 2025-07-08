-- 性能监控系统数据库迁移
-- 创建监控相关的表和功能

-- 创建监控指标表
CREATE TABLE IF NOT EXISTS monitoring_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(20, 6) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  rating VARCHAR(20),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 上下文信息
  context JSONB DEFAULT '{}',
  
  -- 元数据
  metadata JSONB DEFAULT '{}',
  
  -- 索引字段
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_monitoring_metrics_type ON monitoring_metrics(metric_type);
CREATE INDEX idx_monitoring_metrics_timestamp ON monitoring_metrics(timestamp DESC);
CREATE INDEX idx_monitoring_metrics_context_page ON monitoring_metrics((context->>'page'));
CREATE INDEX idx_monitoring_metrics_context_api ON monitoring_metrics((context->>'api_endpoint'));
CREATE INDEX idx_monitoring_metrics_context_user ON monitoring_metrics((context->>'user_id'));
CREATE INDEX idx_monitoring_metrics_rating ON monitoring_metrics(rating);

-- 创建实时统计表
CREATE TABLE IF NOT EXISTS monitoring_realtime_stats (
  metric_type VARCHAR(50) PRIMARY KEY,
  current_value DECIMAL(20, 6) NOT NULL,
  min_value DECIMAL(20, 6) NOT NULL,
  max_value DECIMAL(20, 6) NOT NULL,
  sample_count INTEGER NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_monitoring_realtime_expires ON monitoring_realtime_stats(expires_at);

-- 创建告警规则表
CREATE TABLE IF NOT EXISTS monitoring_alert_rules (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  metric_type VARCHAR(50) NOT NULL,
  condition JSONB NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  channels TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alert_rules_enabled ON monitoring_alert_rules(enabled);
CREATE INDEX idx_alert_rules_metric ON monitoring_alert_rules(metric_type);

-- 创建告警表
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id VARCHAR(100) NOT NULL REFERENCES monitoring_alert_rules(id),
  rule_name VARCHAR(255) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'acknowledged', 'resolved')),
  
  -- 触发信息
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  triggered_value DECIMAL(20, 6) NOT NULL,
  threshold_value DECIMAL(20, 6) NOT NULL,
  
  -- 解决信息
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by VARCHAR(255),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by VARCHAR(255),
  
  -- 上下文
  context JSONB DEFAULT '{}',
  
  -- 通知历史
  notifications JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_monitoring_alerts_status ON monitoring_alerts(status);
CREATE INDEX idx_monitoring_alerts_rule ON monitoring_alerts(rule_id);
CREATE INDEX idx_monitoring_alerts_triggered ON monitoring_alerts(triggered_at DESC);
CREATE INDEX idx_monitoring_alerts_severity ON monitoring_alerts(severity);

-- 创建性能报告表
CREATE TABLE IF NOT EXISTS performance_reports (
  id VARCHAR(100) PRIMARY KEY,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
  report_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_performance_reports_period ON performance_reports(period_start DESC);
CREATE INDEX idx_performance_reports_type ON performance_reports(period_type);

-- 创建定期报告任务表
CREATE TABLE IF NOT EXISTS monitoring_scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule VARCHAR(20) NOT NULL CHECK (schedule IN ('hourly', 'daily', 'weekly', 'monthly')),
  recipients TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 唯一约束（每种周期只能有一个任务）
CREATE UNIQUE INDEX idx_scheduled_reports_schedule ON monitoring_scheduled_reports(schedule);
CREATE INDEX idx_scheduled_reports_next_run ON monitoring_scheduled_reports(next_run);
CREATE INDEX idx_scheduled_reports_enabled ON monitoring_scheduled_reports(enabled);

-- 创建页面性能统计函数
CREATE OR REPLACE FUNCTION update_page_performance_stats(
  p_page TEXT,
  p_metrics JSONB
)
RETURNS VOID AS $$
BEGIN
  -- 这里可以实现更复杂的页面性能统计逻辑
  -- 比如更新页面性能趋势表等
  NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建清理过期数据的函数
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data(
  p_days_to_keep INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- 删除过期的监控指标
  DELETE FROM monitoring_metrics
  WHERE timestamp < NOW() - INTERVAL '1 day' * p_days_to_keep;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- 删除过期的实时统计
  DELETE FROM monitoring_realtime_stats
  WHERE expires_at < NOW();
  
  -- 删除过期的已解决告警
  DELETE FROM monitoring_alerts
  WHERE status = 'resolved' 
    AND resolved_at < NOW() - INTERVAL '1 day' * p_days_to_keep;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建告警聚合视图
CREATE OR REPLACE VIEW monitoring_alert_summary AS
SELECT 
  rule_id,
  rule_name,
  metric_type,
  severity,
  COUNT(*) FILTER (WHERE status = 'open') as open_count,
  COUNT(*) FILTER (WHERE status = 'acknowledged') as acknowledged_count,
  COUNT(*) FILTER (WHERE status = 'resolved' AND resolved_at > NOW() - INTERVAL '24 hours') as recently_resolved,
  MAX(triggered_at) as last_triggered_at
FROM monitoring_alerts
GROUP BY rule_id, rule_name, metric_type, severity;

-- 创建性能趋势视图
CREATE OR REPLACE VIEW monitoring_performance_trends AS
WITH hourly_stats AS (
  SELECT 
    metric_type,
    DATE_TRUNC('hour', timestamp) as hour,
    AVG(value) as avg_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median_value,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value,
    COUNT(*) as sample_count
  FROM monitoring_metrics
  WHERE timestamp > NOW() - INTERVAL '7 days'
  GROUP BY metric_type, hour
)
SELECT 
  metric_type,
  hour,
  avg_value,
  median_value,
  p95_value,
  sample_count,
  LAG(avg_value) OVER (PARTITION BY metric_type ORDER BY hour) as prev_avg_value,
  (avg_value - LAG(avg_value) OVER (PARTITION BY metric_type ORDER BY hour)) / 
    NULLIF(LAG(avg_value) OVER (PARTITION BY metric_type ORDER BY hour), 0) * 100 as change_percentage
FROM hourly_stats
ORDER BY metric_type, hour DESC;

-- 创建RLS策略
ALTER TABLE monitoring_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;

-- 监控数据只能通过服务端插入和查看
CREATE POLICY "Service role can manage monitoring data"
  ON monitoring_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view monitoring data"
  ON monitoring_metrics
  FOR SELECT
  TO authenticated
  USING (true);

-- 告警可以被认证用户查看和确认
CREATE POLICY "Authenticated users can view alerts"
  ON monitoring_alerts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can acknowledge alerts"
  ON monitoring_alerts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (status IN ('acknowledged', 'resolved'));

-- 报告可以被认证用户查看
CREATE POLICY "Authenticated users can view reports"
  ON performance_reports
  FOR SELECT
  TO authenticated
  USING (true);

-- 插入默认告警规则
INSERT INTO monitoring_alert_rules (id, name, description, metric_type, condition, severity, channels, enabled)
VALUES 
  ('lcp-poor', 'LCP 性能差', '最大内容绘制时间超过 4 秒', 'largest_contentful_paint', 
   '{"operator": "gt", "threshold": 4000, "duration": 300, "occurrence": 3}', 
   'error', ARRAY['email', 'slack'], true),
   
  ('api-error-high', 'API 错误率过高', 'API 错误率超过 5%', 'api_error_rate',
   '{"operator": "gt", "threshold": 0.05, "duration": 180}',
   'critical', ARRAY['email', 'slack', 'pagerduty'], true),
   
  ('api-latency-high', 'API 响应时间过长', 'API 平均响应时间超过 1 秒', 'api_latency',
   '{"operator": "gt", "threshold": 1000, "duration": 300}',
   'warning', ARRAY['slack'], true),
   
  ('memory-usage-high', '内存使用率过高', '内存使用率超过 85%', 'memory_usage',
   '{"operator": "gt", "threshold": 0.85, "duration": 600}',
   'warning', ARRAY['email'], true),
   
  ('crash-rate-high', '崩溃率过高', '应用崩溃率超过 1%', 'crash_rate',
   '{"operator": "gt", "threshold": 0.01, "duration": 300}',
   'critical', ARRAY['email', 'slack', 'pagerduty'], true)
ON CONFLICT (id) DO NOTHING;

-- 创建定时任务触发器（需要在 Supabase Dashboard 中配置）
-- 每小时执行：SELECT cleanup_old_monitoring_data(30);
-- 每小时生成报告：根据 monitoring_scheduled_reports 表执行报告生成

-- 授予权限
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON monitoring_metrics TO anon, authenticated;
GRANT UPDATE ON monitoring_alerts TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;