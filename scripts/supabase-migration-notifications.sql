-- 通知系统数据库迁移
-- 创建通知表和相关功能

-- 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('comment', 'like', 'mention', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- 创建RLS策略
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的通知
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 系统可以创建通知（通过service role）
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- 用户只能更新自己的通知（标记已读）
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的通知
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 创建通知统计视图
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE NOT read) as unread_count,
  COUNT(*) as total_count,
  MAX(created_at) as latest_notification_at
FROM notifications
GROUP BY user_id;

-- 创建获取用户未读通知数的函数
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND read = FALSE;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建批量标记已读的函数
CREATE OR REPLACE FUNCTION mark_notifications_as_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  IF p_notification_ids IS NULL THEN
    -- 标记所有未读通知为已读
    UPDATE notifications
    SET read = TRUE,
        read_at = NOW()
    WHERE user_id = p_user_id
      AND read = FALSE;
  ELSE
    -- 标记指定通知为已读
    UPDATE notifications
    SET read = TRUE,
        read_at = NOW()
    WHERE user_id = p_user_id
      AND id = ANY(p_notification_ids)
      AND read = FALSE;
  END IF;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建清理旧通知的函数
CREATE OR REPLACE FUNCTION cleanup_old_notifications(
  p_days_to_keep INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '1 day' * p_days_to_keep
    AND read = TRUE;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建发送系统通知的函数
CREATE OR REPLACE FUNCTION send_system_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link,
    metadata
  ) VALUES (
    p_user_id,
    'system',
    p_title,
    p_message,
    p_link,
    p_metadata
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建评论通知触发器
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_content_author_id UUID;
  v_parent_comment_author_id UUID;
  v_commenter_name TEXT;
BEGIN
  -- 获取评论者名称
  SELECT COALESCE(up.display_name, up.username, 'Someone')
  INTO v_commenter_name
  FROM user_profiles up
  WHERE up.id = NEW.user_id;
  
  -- 如果是回复评论，通知被回复的用户
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO v_parent_comment_author_id
    FROM comments
    WHERE id = NEW.parent_id;
    
    IF v_parent_comment_author_id IS NOT NULL AND v_parent_comment_author_id != NEW.user_id THEN
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        link,
        metadata
      ) VALUES (
        v_parent_comment_author_id,
        'comment',
        '新回复',
        v_commenter_name || ' 回复了你的评论',
        '/posts/' || NEW.content_id || '#comment-' || NEW.id,
        jsonb_build_object(
          'comment_id', NEW.id,
          'content_id', NEW.content_id,
          'content_type', NEW.content_type
        )
      );
    END IF;
  END IF;
  
  -- 通知内容作者（如果不是自己评论自己的内容）
  -- 这里简化处理，假设content_id对应的是post_id
  -- 实际应该根据content_type查询不同的表
  IF NEW.content_type = 'post' THEN
    -- 这里需要根据实际的文章表结构调整
    -- 假设有一个posts表或者从其他地方获取作者ID
    -- 暂时跳过这部分实现
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建评论通知触发器（在comments表上）
-- 注意：这需要在comments表存在后创建
-- CREATE TRIGGER trigger_notify_on_comment
--   AFTER INSERT ON comments
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_on_comment();

-- 添加示例数据（可选，用于测试）
-- INSERT INTO notifications (user_id, type, title, message, link) VALUES
--   ('user-uuid-here', 'system', '欢迎使用', '欢迎使用我们的博客系统！', '/welcome'),
--   ('user-uuid-here', 'comment', '新评论', '有人评论了你的文章', '/posts/post-id#comments');

-- 授予必要的权限
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON notifications TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT ON notification_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_as_read TO authenticated;