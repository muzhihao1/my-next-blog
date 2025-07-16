# Peter的人生实验室 - Personal Digital Garden

一个基于 Next.js 15 构建的现代化全栈博客系统，使用 Notion 作为 CMS，集成 Supabase 实现用户交互功能，支持实时评论、点赞、阅读统计等功能。

🔗 **在线演示**: [https://petermu.com](https://petermu.com)

## ✨ 核心特性

### 内容管理
- 📝 **博客系统**: 使用 Notion 作为 CMS，支持 Markdown 渲染、文章分类和归档
- 🚀 **项目展示**: 展示个人项目作品，支持分类筛选和技术栈标签
- 📚 **书架系统**: 管理阅读书籍，支持阅读状态、多视图展示和阅读统计
- 🛠️ **工具推荐**: 分享常用工具，支持分类浏览和详细评测
- 🔍 **全站搜索**: 基于 Fuse.js 的模糊搜索，支持快捷键（Cmd/Ctrl + K）

### 用户交互
- 🔐 **身份认证**: 基于 Supabase Auth，支持 GitHub 登录
- 💬 **评论系统**: 支持嵌套评论、评论审核和实时更新
- ❤️ **点赞功能**: 文章和评论点赞，实时统计
- 📊 **数据分析**: 页面访问统计、阅读时间追踪、用户行为分析
- 🎯 **个性化推荐**: 基于阅读历史的内容推荐

### 技术特性
- 🌓 **深色模式**: 自动检测系统主题，支持手动切换
- 📱 **响应式设计**: 完美适配移动端、平板和桌面设备
- ⚡ **性能优化**: 图片懒加载、Cloudinary CDN、组件按需加载
- 🎨 **现代化设计**: 简洁优雅的界面，流畅的动画效果
- 🔄 **实时更新**: 基于 Supabase Realtime 的实时功能

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Notion 账号（必需）
- Supabase 账号（必需）
- Cloudinary 账号（可选，用于图片优化）

### 安装步骤

1. **安装依赖**
```bash
npm install
```

2. **配置环境变量**
复制环境变量模板：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```env
# Notion API 配置（必需）
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_posts_database_id
NOTION_PROJECTS_DB=your_projects_database_id
NOTION_BOOKS_DB=your_books_database_id
NOTION_TOOLS_DB=your_tools_database_id

# Supabase 配置（必需）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 可选配置
CACHE_TTL=3600000  # 缓存时间（毫秒）
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

3. **初始化数据库**
```bash
npm run db:init
```

4. **启动开发服务器**
```bash
npm run dev
```

5. 访问 http://localhost:3000

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **CMS**: Notion API
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **图片**: Cloudinary CDN
- **搜索**: Fuse.js
- **实时**: Supabase Realtime
- **部署**: Vercel

## 📁 项目结构

```
my-blog/
├── app/                    # Next.js App Router
│   ├── (routes)/          # 页面路由
│   ├── api/               # API 路由
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── features/          # 功能组件
│   ├── layout/            # 布局组件
│   ├── sections/          # 页面区块
│   └── ui/                # UI 基础组件
├── lib/                   # 核心功能
│   ├── notion/            # Notion API 集成
│   ├── supabase/          # Supabase 客户端
│   ├── analytics/         # 数据分析
│   └── fallback-*.ts      # 后备数据
├── types/                 # TypeScript 类型
├── hooks/                 # 自定义 Hooks
├── contexts/              # React Contexts
├── public/               # 静态资源
└── docs/                  # 项目文档
```

## 📝 主要功能

### 内容管理系统
- Notion 作为无头 CMS
- 自动同步内容更新
- 完善的后备机制确保高可用性
- 支持富文本、代码块、图片等

### 用户系统
- GitHub OAuth 登录
- 用户资料管理
- 阅读历史追踪
- 个性化设置

### 评论系统
- 嵌套评论支持
- 实时更新
- 评论审核
- 表情反应

### 数据分析
- 页面浏览量统计
- 阅读时间计算
- 用户行为分析
- 内容表现报告

## 🚀 部署

### Vercel 部署（推荐）

1. Fork 本项目
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 手动部署

```bash
# 构建项目
npm run build

# 启动生产服务器
npm run start
```

## 🔧 开发命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run dev:clean    # 清理缓存后启动

# 构建
npm run build        # 生产构建
npm run analyze      # 分析包大小

# 测试
npm run test         # 运行所有测试
npm run test:watch   # 监听模式
npm run test:coverage # 测试覆盖率

# 数据库
npm run db:init      # 初始化数据库
npm run db:migrate   # 运行迁移

# 代码质量
npm run lint         # 运行 ESLint
npm run type-check   # TypeScript 检查
```

## 📄 许可证

MIT License

## 🙏 致谢

- 基于 [Next.js](https://nextjs.org) 框架
- 使用 [Supabase](https://supabase.com) 后端服务
- 内容管理使用 [Notion](https://notion.so)
- 图片优化使用 [Cloudinary](https://cloudinary.com)
- 样式使用 [Tailwind CSS](https://tailwindcss.com)