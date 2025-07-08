-- 数据分析系统数据库迁移
-- 创建分析相关的表和功能

-- 创建分析事件表
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  anonymous_id VARCHAR(100) NOT NULL,
  
  -- 设备信息
  device JSONB NOT NULL DEFAULT '{}',
  
  -- 位置信息
  location JSONB DEFAULT '{}',
  
  -- 页面信息
  page JSONB NOT NULL DEFAULT '{}',
  
  -- 引荐信息
  referrer JSONB,
  
  -- 事件属性
  properties JSONB DEFAULT '{}',
  
  -- 索引字段
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_anonymous ON analytics_events(anonymous_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_page_path ON analytics_events((page->>'path'));
CREATE INDEX idx_analytics_events_properties ON analytics_events USING GIN(properties);

-- 创建会话表
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  anonymous_id VARCHAR(100) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  country VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_analytics_sessions_user ON analytics_sessions(user_id);
CREATE INDEX idx_analytics_sessions_anonymous ON analytics_sessions(anonymous_id);
CREATE INDEX idx_analytics_sessions_started ON analytics_sessions(started_at DESC);

-- 创建实时活跃会话表
CREATE TABLE IF NOT EXISTS realtime_active_sessions (
  session_id VARCHAR(100) PRIMARY KEY,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 创建索引
CREATE INDEX idx_realtime_sessions_expires ON realtime_active_sessions(expires_at);

-- 创建聚合统计表（按小时）
CREATE TABLE IF NOT EXISTS analytics_hourly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  stats JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_hourly_period ON analytics_hourly(period_start DESC);

-- 创建聚合统计表（按天）
CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  stats JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_daily_period ON analytics_daily(period_start DESC);

-- 创建聚合统计表（按周）
CREATE TABLE IF NOT EXISTS analytics_weekly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  stats JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_weekly_period ON analytics_weekly(period_start DESC);

-- 创建聚合统计表（按月）
CREATE TABLE IF NOT EXISTS analytics_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  stats JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_monthly_period ON analytics_monthly(period_start DESC);

-- 创建内容分数表
CREATE TABLE IF NOT EXISTS content_scores (
  post_id VARCHAR(100) PRIMARY KEY,
  score INTEGER NOT NULL,
  metrics JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_scores_score ON content_scores(score DESC);
CREATE INDEX idx_content_scores_updated ON content_scores(updated_at DESC);

-- 创建趋势分数表
CREATE TABLE IF NOT EXISTS content_trending_scores (
  post_id VARCHAR(100) PRIMARY KEY,
  score DECIMAL(10, 2) NOT NULL,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trending_scores_score ON content_trending_scores(score DESC);

-- 创建异常检测记录表
CREATE TABLE IF NOT EXISTS analytics_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granularity VARCHAR(20) NOT NULL,
  anomalies JSONB NOT NULL
);

CREATE INDEX idx_anomalies_detected ON analytics_anomalies(detected_at DESC);

-- 创建定期报告任务表
CREATE TABLE IF NOT EXISTS analytics_scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule VARCHAR(20) NOT NULL CHECK (schedule IN ('daily', 'weekly', 'monthly')),
  recipients TEXT[] NOT NULL,
  metrics TEXT[] NOT NULL,
  format VARCHAR(10) NOT NULL CHECK (format IN ('json', 'csv', 'excel')),
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scheduled_reports_next_run ON analytics_scheduled_reports(next_run);
CREATE INDEX idx_scheduled_reports_active ON analytics_scheduled_reports(is_active);

-- 创建用户行为日志表
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL,
  action_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_actions_user ON user_actions(user_id);
CREATE INDEX idx_user_actions_type ON user_actions(action_type);
CREATE INDEX idx_user_actions_created ON user_actions(created_at DESC);

-- 创建页面浏览计数函数
CREATE OR REPLACE FUNCTION increment_page_view_count(
  p_path TEXT,
  p_count INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO page_view_counts (path, count, last_updated)
  VALUES (p_path, p_count, NOW())
  ON CONFLICT (path) DO UPDATE
  SET count = page_view_counts.count + p_count,
      last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- 创建页面浏览计数表
CREATE TABLE IF NOT EXISTS page_view_counts (
  path TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建趋势分数更新函数
CREATE OR REPLACE FUNCTION update_trending_score(
  p_post_id TEXT,
  p_view_weight DECIMAL DEFAULT 1.0,
  p_time_decay DECIMAL DEFAULT 0.95
)
RETURNS VOID AS $$
DECLARE
  v_current_score DECIMAL;
  v_hours_since_update DECIMAL;
BEGIN
  -- 获取当前分数和更新时间
  SELECT score, EXTRACT(EPOCH FROM NOW() - last_calculated) / 3600
  INTO v_current_score, v_hours_since_update
  FROM content_trending_scores
  WHERE post_id = p_post_id;
  
  IF NOT FOUND THEN
    -- 新文章
    INSERT INTO content_trending_scores (post_id, score, last_calculated)
    VALUES (p_post_id, p_view_weight, NOW());
  ELSE
    -- 更新分数（考虑时间衰减）
    UPDATE content_trending_scores
    SET score = (v_current_score * POWER(p_time_decay, v_hours_since_update)) + p_view_weight,
        last_calculated = NOW()
    WHERE post_id = p_post_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建清理过期数据的函数
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data(
  p_days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- 删除过期的原始事件
  DELETE FROM analytics_events
  WHERE timestamp < NOW() - INTERVAL '1 day' * p_days_to_keep;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- 删除过期的活跃会话
  DELETE FROM realtime_active_sessions
  WHERE expires_at < NOW();
  
  -- 更新趋势分数（移除过期的）
  DELETE FROM content_trending_scores
  WHERE last_calculated < NOW() - INTERVAL '7 days';
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建RLS策略
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- 分析事件只能通过服务端插入
CREATE POLICY "Service role can insert analytics events"
  ON analytics_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 用户可以查看自己的会话
CREATE POLICY "Users can view own sessions"
  ON analytics_sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- 用户可以查看自己的行为日志
CREATE POLICY "Users can view own actions"
  ON user_actions FOR SELECT
  USING (auth.uid() = user_id);

-- 创建定时任务（需要在Supabase Dashboard中配置）
-- 每小时聚合：SELECT run_analytics_aggregation('hour');
-- 每天聚合：SELECT run_analytics_aggregation('day');
-- 每周聚合：SELECT run_analytics_aggregation('week');
-- 每月聚合：SELECT run_analytics_aggregation('month');
-- 每天清理：SELECT cleanup_old_analytics_data(90);

-- 授予权限
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON analytics_events TO anon, authenticated;
GRANT INSERT, UPDATE ON analytics_sessions TO anon, authenticated;
GRANT INSERT ON user_actions TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;