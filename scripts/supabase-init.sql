-- Supabase 数据库初始化脚本
-- 执行顺序很重要，请按照顺序执行

-- =============================================
-- 1. 创建函数
-- =============================================

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- 2. 创建表结构
-- =============================================

-- 2.1 用户扩展信息表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  website VARCHAR(255),
  github_username VARCHAR(50),
  twitter_username VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2.2 评论表
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id VARCHAR(255) NOT NULL, -- Notion页面ID
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'project', 'book', 'tool')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 支持回复
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2.3 点赞表
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'project', 'book', 'tool', 'comment')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, content_id, content_type)
);

-- 2.4 收藏表
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'project', 'book', 'tool')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, content_id, content_type)
);

-- 2.5 用户行为表
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('view', 'like', 'unlike', 'comment', 'share', 'bookmark', 'unbookmark', 'scroll')),
  content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'project', 'book', 'tool')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =============================================
-- 3. 创建触发器
-- =============================================

-- 用户配置表更新触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 评论表更新触发器
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON comments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. 创建索引
-- =============================================

-- 评论表索引
CREATE INDEX IF NOT EXISTS idx_comments_content ON comments(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- 点赞表索引
CREATE INDEX IF NOT EXISTS idx_likes_content ON likes(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);

-- 收藏表索引
CREATE INDEX IF NOT EXISTS idx_bookmarks_content ON bookmarks(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created ON bookmarks(created_at DESC);

-- 用户行为表索引
CREATE INDEX IF NOT EXISTS idx_user_actions_user ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_content ON user_actions(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_created ON user_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(action_type);

-- =============================================
-- 5. 启用RLS（Row Level Security）
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. 创建RLS策略
-- =============================================

-- 6.1 用户配置策略
-- 所有人可以查看用户配置
CREATE POLICY "Public profiles are viewable by everyone" 
  ON user_profiles FOR SELECT 
  USING (true);

-- 用户只能更新自己的配置
CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 用户创建自己的配置
CREATE POLICY "Users can create own profile" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 6.2 评论策略
-- 所有人可以查看已批准的评论
CREATE POLICY "Anyone can view approved comments" 
  ON comments FOR SELECT 
  USING (is_approved = true);

-- 登录用户可以创建评论
CREATE POLICY "Authenticated users can create comments" 
  ON comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的评论
CREATE POLICY "Users can update own comments" 
  ON comments FOR UPDATE 
  USING (auth.uid() = user_id);

-- 用户可以删除自己的评论
CREATE POLICY "Users can delete own comments" 
  ON comments FOR DELETE 
  USING (auth.uid() = user_id);

-- 6.3 点赞策略
-- 所有人可以查看点赞数（聚合查询）
CREATE POLICY "Anyone can view likes" 
  ON likes FOR SELECT 
  USING (true);

-- 登录用户可以管理自己的点赞
CREATE POLICY "Users can insert own likes" 
  ON likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" 
  ON likes FOR DELETE 
  USING (auth.uid() = user_id);

-- 6.4 收藏策略
-- 用户只能查看自己的收藏
CREATE POLICY "Users can view own bookmarks" 
  ON bookmarks FOR SELECT 
  USING (auth.uid() = user_id);

-- 用户可以创建自己的收藏
CREATE POLICY "Users can create own bookmarks" 
  ON bookmarks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的收藏
CREATE POLICY "Users can delete own bookmarks" 
  ON bookmarks FOR DELETE 
  USING (auth.uid() = user_id);

-- 6.5 用户行为策略
-- 用户只能查看自己的行为（管理员可以查看所有）
CREATE POLICY "Users can view own actions" 
  ON user_actions FOR SELECT 
  USING (auth.uid() = user_id);

-- 用户可以创建自己的行为记录
CREATE POLICY "Users can create own actions" 
  ON user_actions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 7. 创建视图（可选，用于简化查询）
-- =============================================

-- 创建评论统计视图
CREATE OR REPLACE VIEW comment_stats AS
SELECT 
  content_id,
  content_type,
  COUNT(*) as comment_count,
  MAX(created_at) as last_comment_at
FROM comments
WHERE is_approved = true
GROUP BY content_id, content_type;

-- 创建点赞统计视图
CREATE OR REPLACE VIEW like_stats AS
SELECT 
  content_id,
  content_type,
  COUNT(*) as like_count
FROM likes
GROUP BY content_id, content_type;

-- 创建收藏统计视图
CREATE OR REPLACE VIEW bookmark_stats AS
SELECT 
  content_id,
  content_type,
  COUNT(*) as bookmark_count
FROM bookmarks
GROUP BY content_id, content_type;

-- =============================================
-- 8. 创建函数用于获取内容的交互统计
-- =============================================

CREATE OR REPLACE FUNCTION get_content_stats(p_content_id VARCHAR, p_content_type VARCHAR)
RETURNS TABLE (
  like_count BIGINT,
  bookmark_count BIGINT,
  comment_count BIGINT,
  view_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM likes WHERE content_id = p_content_id AND content_type = p_content_type)::BIGINT,
    (SELECT COUNT(*) FROM bookmarks WHERE content_id = p_content_id AND content_type = p_content_type)::BIGINT,
    (SELECT COUNT(*) FROM comments WHERE content_id = p_content_id AND content_type = p_content_type AND is_approved = true)::BIGINT,
    (SELECT COUNT(*) FROM user_actions WHERE content_id = p_content_id AND content_type = p_content_type AND action_type = 'view')::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. 创建用户注册后自动创建profile的函数
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器，在新用户注册时自动创建profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 10. 授权设置
-- =============================================

-- 确保anon用户可以读取必要的数据
GRANT SELECT ON comment_stats TO anon;
GRANT SELECT ON like_stats TO anon;
GRANT SELECT ON bookmark_stats TO anon;
GRANT EXECUTE ON FUNCTION get_content_stats TO anon;

-- 确保authenticated用户有必要的权限
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON comments TO authenticated;
GRANT ALL ON likes TO authenticated;
GRANT ALL ON bookmarks TO authenticated;
GRANT ALL ON user_actions TO authenticated;

-- =============================================
-- 完成提示
-- =============================================
-- 数据库初始化完成！
-- 请确保在Supabase Dashboard中：
-- 1. 启用GitHub OAuth
-- 2. 配置正确的回调URL
-- 3. 设置环境变量