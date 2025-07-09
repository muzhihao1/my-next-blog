# Vercel 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

## Notion 相关（已配置）
- ✅ `NOTION_TOKEN` - ntn_S73526150797bgCeqUOXSUW5i...
- ✅ `NOTION_DATABASE_ID` - 21f1b64000a7808c8b4fc4ef924cf...
- ✅ `NOTION_PROJECTS_DB` - 2291b64000a78173a212e31b95422...
- ✅ `NOTION_BOOKS_DB` - 2291b64000a781fa88f4f255c0f58...
- ✅ `NOTION_TOOLS_DB` - 2291b64000a78125b4fac42b466d8...
- ✅ `CACHE_TTL` - 3600000

## Supabase 相关（需要添加）
从你的 `.env.local` 文件复制以下值：

- `NEXT_PUBLIC_SUPABASE_URL` - https://xelyobfvfjqeuysfzpcf.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbHlvYmZ2ZmpxZXV5c2Z6cGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzI2NjksImV4cCI6MjA2NzUwODY2OX0.9qTL4yliYJgcq8gRWOz0uOFMFFcIWfMukOYGqHWOpPw
- `SUPABASE_SERVICE_ROLE_KEY` - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbHlvYmZ2ZmpxZXV5c2Z6cGNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkzMjY2OSwiZXhwIjoyMDY3NTA4NjY5fQ.OXzwliV3w4xCfUxBL8AgaNLpHJRbVaZFZp-fqZXw3bk

## Algolia 相关（搜索功能）
- `NEXT_PUBLIC_ALGOLIA_APP_ID` - XOXMNX38GJ
- `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY` - 42590dd8b12630b137b8bf8ce7b54e5d
- `ALGOLIA_ADMIN_API_KEY` - dc752596a6a64bf8aa486b429a7fd174
- `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` - posts

## 添加环境变量的步骤：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 "Settings" 标签
4. 在左侧菜单选择 "Environment Variables"
5. 逐个添加上述环境变量：
   - Name: 变量名（如 `NEXT_PUBLIC_SUPABASE_URL`）
   - Value: 变量值
   - Environment: 选择所有环境（Production, Preview, Development）
6. 点击 "Save" 保存每个变量

## 重要提示

1. **不要在前端代码中使用** `SUPABASE_SERVICE_ROLE_KEY`，这是服务端专用的密钥
2. 所有以 `NEXT_PUBLIC_` 开头的变量会暴露给客户端，请确保不包含敏感信息
3. 添加完环境变量后，需要重新部署才能生效

## 验证部署

部署完成后，访问以下页面验证功能：

- 首页：`/`
- 博客列表：`/blog`
- 项目展示：`/projects`
- 书架：`/bookshelf`
- 工具推荐：`/tools`
- 数据分析：`/stats`（需要登录）
- 管理面板：`/dashboard`（需要登录）

## 故障排查

如果遇到问题：

1. 检查 Vercel 的 Functions 日志
2. 确认所有环境变量都已正确配置
3. 检查 Supabase 项目是否正常运行
4. 确认数据库表已创建（运行迁移脚本）