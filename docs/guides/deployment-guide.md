# 部署指南

本指南介绍如何将博客项目部署到 Vercel。

## 🚀 部署信息

- **GitHub 仓库**：https://github.com/muzhihao1/my-next-blog
- **部署平台**：Vercel
- **生产环境**：https://my-next-blog-cjh9.vercel.app
- **部署分支**：main

## 📋 前置要求

1. GitHub 账号
2. Vercel 账号（可使用 GitHub 登录）
3. Notion Integration Token（用于获取博客内容）

## 🔧 部署步骤

### 1. Fork 或克隆仓库

```bash
git clone https://github.com/muzhihao1/my-next-blog.git
cd my-next-blog
```

### 2. 本地开发环境配置

1. 安装依赖

```bash
npm install
```

2. 配置环境变量
   复制 `.env.example` 文件为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入你的 Notion 配置：

```env
# Notion Configuration
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_database_id
NOTION_PROJECTS_DB=your_projects_database_id
NOTION_TOOLS_DB=your_tools_database_id
NOTION_BOOKS_DB=your_books_database_id

# Optional: Cache TTL (默认 1 小时)
CACHE_TTL=3600000

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_GISCUS_REPO=your-username/your-repo
NEXT_PUBLIC_GISCUS_REPO_ID=your_repo_id
NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
NEXT_PUBLIC_GISCUS_CATEGORY_ID=your_category_id
```

3. 启动开发服务器

```bash
npm run dev
```

### 3. 部署到 Vercel

#### 方式一：通过 Vercel 网站（推荐）

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Import Git Repository"
3. 授权并选择你的 GitHub 仓库
4. 配置环境变量（重要！）
   - 在 "Environment Variables" 部分添加所有必需的环境变量
   - 确保添加所有 `NOTION_*` 相关的变量
5. 点击 "Deploy"

#### 方式二：使用 Vercel CLI

1. 安装 Vercel CLI

```bash
npm i -g vercel
```

2. 登录 Vercel

```bash
vercel login
```

3. 部署项目

```bash
vercel
```

### 4. 配置环境变量

在 Vercel Dashboard 中：

1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加以下环境变量：

| 变量名             | 说明                     | 必需 |
| ------------------ | ------------------------ | ---- |
| NOTION_TOKEN       | Notion Integration Token | ✅   |
| NOTION_DATABASE_ID | 主数据库 ID              | ✅   |
| NOTION_PROJECTS_DB | 项目数据库 ID            | ❌   |
| NOTION_TOOLS_DB    | 工具数据库 ID            | ❌   |
| NOTION_BOOKS_DB    | 书籍数据库 ID            | ❌   |
| CACHE_TTL          | 缓存时间（毫秒）         | ❌   |

### 5. 自定义域名（可选）

1. 在 Vercel Dashboard 中选择 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS

## 🔄 更新部署

### 自动部署

- 每次推送到 `main` 分支时，Vercel 会自动触发部署
- 可以在 Vercel Dashboard 中查看部署状态

### 手动部署

在 Vercel Dashboard 中点击 "Redeploy" 按钮

## 🐛 故障排查

### 常见问题

1. **构建失败**
   - 检查环境变量是否正确配置
   - 查看构建日志中的错误信息
   - 确保所有依赖都已正确安装

2. **Notion API 错误**
   - 验证 NOTION_TOKEN 是否有效
   - 确认数据库 ID 是否正确
   - 检查 Notion Integration 权限设置

3. **页面 404**
   - 确认数据库中有内容
   - 检查 slug 生成是否正确
   - 查看后备数据是否工作

## 📊 监控和分析

### Vercel Analytics

- 在 Vercel Dashboard 中启用 Analytics
- 可查看访问量、性能指标等

### Google Analytics

配置 `NEXT_PUBLIC_GA_ID` 环境变量后自动启用

### 错误监控

配置 Sentry 相关环境变量后自动启用错误追踪

## 🔒 安全注意事项

1. **环境变量安全**
   - 不要在代码中硬编码敏感信息
   - 使用 Vercel 的环境变量管理
   - 不要将 `.env.local` 提交到 Git

2. **API 限流**
   - Notion API 有请求限制
   - 使用缓存减少 API 调用
   - 考虑使用 ISR（增量静态再生）

## 📚 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Notion API 文档](https://developers.notion.com)

---

_最后更新：2025-01-07_
