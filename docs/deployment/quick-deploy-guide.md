# 快速部署指南

> 最后更新：2025年1月11日  
> 项目状态：✅ 100%完成，可立即部署

## 🚀 30秒部署概览

```bash
# 1. 克隆项目
git clone [your-repo-url]
cd my-blog

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的配置

# 4. 部署到Vercel
vercel --prod
```

## 📋 必需的环境变量

创建 `.env.local` 文件并填入以下内容：

```bash
# Notion（必需）
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxx

# Supabase（必需）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Algolia（可选，搜索功能）
NEXT_PUBLIC_ALGOLIA_APP_ID=XXXXXXXXXX
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
ALGOLIA_ADMIN_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

# 监控（可选）
SENTRY_DSN=https://xxxxx@xxx.ingest.sentry.io/xxxxx
```

## 🛠️ 部署前检查

### 1. Notion设置

- [ ] 创建Notion Integration
- [ ] 获取Integration Token
- [ ] 共享数据库给Integration
- [ ] 复制数据库ID

### 2. Supabase设置

- [ ] 创建Supabase项目
- [ ] 运行数据库迁移脚本：
  ```sql
  -- 在Supabase SQL编辑器中运行
  -- 文件位置：scripts/supabase-migrations.sql
  ```
- [ ] 启用Realtime功能
- [ ] 配置RLS策略

### 3. Algolia设置（可选）

- [ ] 创建Algolia应用
- [ ] 创建索引：`posts`
- [ ] 配置搜索属性

## 📦 Vercel部署步骤

### 方法一：Vercel CLI（推荐）

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel

# 生产部署
vercel --prod
```

### 方法二：GitHub集成

1. 推送代码到GitHub
2. 访问 [vercel.com/new](https://vercel.com/new)
3. 导入GitHub仓库
4. 配置环境变量
5. 点击Deploy

## ✅ 部署后验证

### 1. 功能检查

- [ ] 访问首页：`https://your-domain.vercel.app`
- [ ] 检查文章列表加载
- [ ] 测试深色模式切换
- [ ] 验证搜索功能（如已配置）

### 2. API健康检查

```bash
# 健康检查
curl https://your-domain.vercel.app/api/health

# 监控状态
curl https://your-domain.vercel.app/api/monitor/status
```

### 3. 性能验证

- 使用Lighthouse测试性能分数
- 检查Core Web Vitals指标
- 验证图片优化效果

## 🔧 常见问题

### Q: Notion文章不显示？

A: 检查以下几点：

1. Notion Token是否正确
2. 数据库是否已共享给Integration
3. 数据库ID是否正确
4. 查看Vercel函数日志

### Q: Supabase连接失败？

A: 验证：

1. Supabase URL和密钥是否正确
2. 是否运行了数据库迁移
3. RLS策略是否正确配置

### Q: 构建失败？

A: 常见原因：

1. 环境变量未设置
2. TypeScript类型错误
3. 依赖安装失败

### Q: 搜索功能不工作？

A: Algolia配置步骤：

1. 确认API密钥正确
2. 手动触发索引：访问 `/api/search/index`
3. 检查Algolia控制台

## 📞 需要帮助？

- 查看详细文档：`/docs` 目录
- 检查部署日志：Vercel Dashboard
- 报告问题：GitHub Issues

## 🎉 恭喜！

项目部署成功后，你将拥有一个功能完整的现代化博客系统，包括：

- ✅ 服务端渲染和静态生成
- ✅ 用户认证和评论系统
- ✅ 实时交互功能
- ✅ 数据分析和可视化
- ✅ 个性化主题系统
- ✅ 高性能搜索
- ✅ 完整的监控体系

**享受你的新博客！**
