-- 评论系统数据库迁移
-- 添加 is_deleted 字段用于软删除功能

-- 1. 为 comments 表添加 is_deleted 字段
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 2. 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted 
ON comments(is_deleted);

-- 3. 更新 RLS 策略，确保已删除的评论仍然可见（但显示为"已删除"）
-- 这样可以保持评论线程的完整性

-- 4. 创建一个视图，方便查询活跃评论
CREATE OR REPLACE VIEW active_comments AS
SELECT * FROM comments 
WHERE is_deleted = FALSE;

-- 5. 为软删除创建一个辅助函数
CREATE OR REPLACE FUNCTION soft_delete_comment(comment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE comments 
  SET 
    content = '[此评论已删除]',
    is_deleted = TRUE,
    updated_at = NOW()
  WHERE id = comment_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 授予必要的权限
GRANT SELECT ON active_comments TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_comment TO authenticated;

-- 注意：在 Supabase Dashboard 的 SQL Editor 中执行此脚本