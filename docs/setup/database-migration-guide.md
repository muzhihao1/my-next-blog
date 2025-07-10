# 数据库迁移执行指南

## 评论系统迁移（2025年1月10日）

### 迁移目的

为评论系统添加软删除功能，保持评论线程的完整性。

### 执行步骤

1. **登录 Supabase Dashboard**

   ```
   https://supabase.com/dashboard/project/xelyobfvfjqeuysfzpcf
   ```

2. **进入 SQL Editor**
   - 在左侧菜单中选择 "SQL Editor"
   - 点击 "New query"

3. **执行迁移脚本**
   - 复制 `scripts/supabase-migration-comments.sql` 的全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 执行

### 迁移内容说明

1. **添加 is_deleted 字段**
   - 类型：BOOLEAN
   - 默认值：FALSE
   - 用途：标记已删除的评论

2. **创建索引**
   - 名称：idx_comments_is_deleted
   - 优化已删除评论的查询性能

3. **创建 active_comments 视图**
   - 只显示未删除的评论
   - 简化查询逻辑

4. **创建 soft_delete_comment 函数**
   - 软删除评论
   - 将内容替换为 "[此评论已删除]"
   - 更新 updated_at 时间戳

### 验证迁移

执行以下查询验证迁移成功：

```sql
-- 检查字段是否添加
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'comments' AND column_name = 'is_deleted';

-- 检查视图是否创建
SELECT * FROM information_schema.views
WHERE table_name = 'active_comments';

-- 检查函数是否创建
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'soft_delete_comment';
```

### 回滚方案

如需回滚：

```sql
-- 删除函数
DROP FUNCTION IF EXISTS soft_delete_comment;

-- 删除视图
DROP VIEW IF EXISTS active_comments;

-- 删除索引
DROP INDEX IF EXISTS idx_comments_is_deleted;

-- 删除字段（谨慎：会丢失数据）
ALTER TABLE comments DROP COLUMN IF EXISTS is_deleted;
```

### 注意事项

1. 在生产环境执行前，建议先在开发环境测试
2. 确保有数据库备份
3. 迁移不会影响现有评论数据
4. 所有现有评论的 is_deleted 将默认为 FALSE

### 完成确认

✅ 迁移脚本已准备好
⏳ 等待用户在 Supabase Dashboard 执行
⏳ 执行后需要验证迁移成功
