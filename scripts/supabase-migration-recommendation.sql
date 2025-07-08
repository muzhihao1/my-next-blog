-- 推荐系统数据库迁移
-- 创建推荐系统相关的表和功能

-- 创建用户行为表
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  target_type VARCHAR(50) NOT NULL DEFAULT 'post',
  value DECIMAL(20, 6),
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT valid_action_type CHECK (action_type IN ('view', 'like', 'collect', 'comment', 'share', 'read_time', 'click'))
);

-- 创建索引
CREATE INDEX idx_user_actions_user ON user_actions(user_id);
CREATE INDEX idx_user_actions_target ON user_actions(target_id);
CREATE INDEX idx_user_actions_type ON user_actions(action_type);
CREATE INDEX idx_user_actions_created ON user_actions(created_at DESC);
CREATE INDEX idx_user_actions_user_target ON user_actions(user_id, target_id);

-- 创建用户画像表
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  interests JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  segments TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_profiles_updated ON user_profiles(updated_at DESC);
CREATE INDEX idx_user_profiles_segments ON user_profiles USING GIN(segments);

-- 创建推荐日志表
CREATE TABLE IF NOT EXISTS recommendation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request JSONB NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_recommendation_logs_session ON recommendation_logs(session_id);
CREATE INDEX idx_recommendation_logs_user ON recommendation_logs(user_id);
CREATE INDEX idx_recommendation_logs_created ON recommendation_logs(created_at DESC);

-- 创建推荐效果表
CREATE TABLE IF NOT EXISTS recommendation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5, 4) DEFAULT 0,
  avg_read_ratio DECIMAL(5, 4) DEFAULT 0,
  engagement_rate DECIMAL(5, 4) DEFAULT 0,
  category_diversity DECIMAL(5, 4) DEFAULT 0,
  author_diversity DECIMAL(5, 4) DEFAULT 0,
  user_coverage DECIMAL(5, 4) DEFAULT 0,
  item_coverage DECIMAL(5, 4) DEFAULT 0,
  metrics_by_source JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束
  CONSTRAINT unique_date UNIQUE (date)
);

-- 创建索引
CREATE INDEX idx_recommendation_metrics_date ON recommendation_metrics(date DESC);

-- 添加文章统计字段（如果不存在）
DO $$ 
BEGIN
  -- 检查并添加 views 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'views'
  ) THEN
    ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0;
  END IF;
  
  -- 检查并添加 likes 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'likes'
  ) THEN
    ALTER TABLE posts ADD COLUMN likes INTEGER DEFAULT 0;
  END IF;
  
  -- 检查并添加 collects 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'collects'
  ) THEN
    ALTER TABLE posts ADD COLUMN collects INTEGER DEFAULT 0;
  END IF;
  
  -- 检查并添加 comments 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'comments'
  ) THEN
    ALTER TABLE posts ADD COLUMN comments INTEGER DEFAULT 0;
  END IF;
  
  -- 检查并添加 quality_score 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'quality_score'
  ) THEN
    ALTER TABLE posts ADD COLUMN quality_score DECIMAL(3, 2) DEFAULT 0.5;
  END IF;
  
  -- 检查并添加 word_count 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'word_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN word_count INTEGER DEFAULT 0;
  END IF;
  
  -- 检查并添加 read_time 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'read_time'
  ) THEN
    ALTER TABLE posts ADD COLUMN read_time INTEGER DEFAULT 5;
  END IF;
END $$;

-- 创建文章统计索引
CREATE INDEX IF NOT EXISTS idx_posts_views ON posts(views DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes DESC);
CREATE INDEX IF NOT EXISTS idx_posts_quality ON posts(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published_views ON posts(published_at DESC, views DESC);

-- 创建增加浏览量的函数
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET views = COALESCE(views, 0) + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建增加点赞数的函数
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET likes = COALESCE(likes, 0) + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建增加收藏数的函数
CREATE OR REPLACE FUNCTION increment_post_collects(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET collects = COALESCE(collects, 0) + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建计算内容质量分的函数
CREATE OR REPLACE FUNCTION calculate_content_quality_score(
  p_views INTEGER,
  p_likes INTEGER,
  p_collects INTEGER,
  p_comments INTEGER,
  p_word_count INTEGER
)
RETURNS DECIMAL(3, 2) AS $$
DECLARE
  v_interaction_rate DECIMAL(5, 4);
  v_content_richness DECIMAL(3, 2);
  v_quality_score DECIMAL(3, 2);
BEGIN
  -- 计算互动率
  IF p_views > 0 THEN
    v_interaction_rate = (p_likes + p_collects + p_comments)::DECIMAL / p_views;
  ELSE
    v_interaction_rate = 0;
  END IF;
  
  -- 计算内容丰富度
  v_content_richness = LEAST(p_word_count::DECIMAL / 2000, 1);
  
  -- 综合质量分
  v_quality_score = (v_interaction_rate * 0.6 + v_content_richness * 0.4);
  
  -- 归一化到0-1
  RETURN LEAST(v_quality_score, 1);
END;
$$ LANGUAGE plpgsql;

-- 创建更新文章质量分的触发器函数
CREATE OR REPLACE FUNCTION update_post_quality_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quality_score = calculate_content_quality_score(
    NEW.views,
    NEW.likes,
    NEW.collects,
    NEW.comments,
    NEW.word_count
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_post_quality ON posts;
CREATE TRIGGER trigger_update_post_quality
  BEFORE UPDATE OF views, likes, collects, comments ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_quality_score();

-- 创建用户行为统计视图
CREATE OR REPLACE VIEW user_action_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE action_type = 'view') as total_views,
  COUNT(*) FILTER (WHERE action_type = 'like') as total_likes,
  COUNT(*) FILTER (WHERE action_type = 'collect') as total_collects,
  COUNT(*) FILTER (WHERE action_type = 'comment') as total_comments,
  COUNT(DISTINCT target_id) as unique_posts_interacted,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  MAX(created_at) as last_active
FROM user_actions
GROUP BY user_id;

-- 创建热门内容视图
CREATE OR REPLACE VIEW trending_posts AS
WITH recent_actions AS (
  SELECT 
    target_id,
    COUNT(*) as action_count,
    COUNT(*) FILTER (WHERE action_type = 'view') as view_count,
    COUNT(*) FILTER (WHERE action_type = 'like') as like_count,
    COUNT(*) FILTER (WHERE action_type = 'collect') as collect_count
  FROM user_actions
  WHERE created_at > NOW() - INTERVAL '7 days'
    AND target_type = 'post'
  GROUP BY target_id
)
SELECT 
  p.*,
  ra.action_count,
  ra.view_count as recent_views,
  ra.like_count as recent_likes,
  ra.collect_count as recent_collects,
  (ra.action_count::DECIMAL / EXTRACT(EPOCH FROM (NOW() - p.published_at)) * 3600) as heat_score
FROM posts p
JOIN recent_actions ra ON p.id = ra.target_id
WHERE p.status = 'published'
ORDER BY heat_score DESC;

-- 创建相似用户视图（协同过滤用）
CREATE OR REPLACE VIEW similar_users AS
WITH user_pairs AS (
  SELECT 
    a1.user_id as user1,
    a2.user_id as user2,
    COUNT(DISTINCT a1.target_id) as common_items,
    COUNT(DISTINCT a1.target_id)::DECIMAL / 
      LEAST(
        (SELECT COUNT(DISTINCT target_id) FROM user_actions WHERE user_id = a1.user_id),
        (SELECT COUNT(DISTINCT target_id) FROM user_actions WHERE user_id = a2.user_id)
      ) as jaccard_similarity
  FROM user_actions a1
  JOIN user_actions a2 ON a1.target_id = a2.target_id AND a1.user_id < a2.user_id
  WHERE a1.action_type IN ('view', 'like', 'collect')
    AND a2.action_type IN ('view', 'like', 'collect')
  GROUP BY a1.user_id, a2.user_id
  HAVING COUNT(DISTINCT a1.target_id) >= 3
)
SELECT * FROM user_pairs
WHERE jaccard_similarity > 0.1;

-- 创建RLS策略
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_logs ENABLE ROW LEVEL SECURITY;

-- 用户行为：用户只能查看和创建自己的行为
CREATE POLICY "Users can view own actions"
  ON user_actions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions"
  ON user_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 用户画像：用户只能查看和更新自己的画像
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 推荐日志：服务端角色可以插入，用户可以查看自己的
CREATE POLICY "Service can insert logs"
  ON recommendation_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can view own logs"
  ON recommendation_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 授予权限
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON user_actions, user_profiles, recommendation_logs TO authenticated;
GRANT UPDATE ON user_profiles TO authenticated;
GRANT DELETE ON user_profiles TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 初始化一些测试数据的质量分
UPDATE posts 
SET quality_score = calculate_content_quality_score(
  COALESCE(views, 0),
  COALESCE(likes, 0),
  COALESCE(collects, 0),
  COALESCE(comments, 0),
  COALESCE(word_count, 1000)
)
WHERE quality_score IS NULL OR quality_score = 0;