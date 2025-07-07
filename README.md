# 个人数字花园 - Personal Digital Garden

一个基于 Next.js 15 构建的现代化个人博客系统，集成了项目展示、书架系统、工具推荐等功能，支持深色模式和全站搜索。

🔗 **在线演示**: [https://my-next-blog-cjh9.vercel.app](https://my-next-blog-cjh9.vercel.app)  
📦 **GitHub**: [https://github.com/muzhihao1/my-next-blog](https://github.com/muzhihao1/my-next-blog)

## ✨ 功能预览

- 📱 移动端适配
- 🌓 深色模式支持  
- 🔍 全站搜索（Cmd/Ctrl + K）
- 📊 访问统计（Google Analytics）
- 💬 评论系统（Giscus）
- 📧 邮件订阅（ConvertKit）
- 🎯 SEO 优化
- ⚡ 极速访问体验

## 🌟 核心特性

### 内容管理
- 📝 **博客系统**: 支持 Markdown 渲染、文章分类和归档
- 🚀 **项目展示**: 展示个人项目作品，支持分类筛选和技术栈标签
- 📚 **书架系统**: 管理阅读书籍，支持阅读状态、多视图展示和阅读统计
- 🛠️ **工具推荐**: 分享常用工具，支持分类浏览和详细评测
- 🔍 **全站搜索**: 基于 Fuse.js 的模糊搜索，支持快捷键（Cmd/Ctrl + K）

### 用户体验
- 🌓 **深色模式**: 自动检测系统主题，支持手动切换
- 📱 **响应式设计**: 完美适配移动端、平板和桌面设备  
- ⚡ **性能优化**: 图片懒加载、组件按需加载、静态页面生成
- 🎨 **现代化设计**: 简洁优雅的界面，流畅的动画效果

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Notion 账号（可选）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/muzhihao1/my-next-blog.git
cd my-next-blog
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
复制环境变量模板：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件（如不配置将使用后备数据）：
```env
# Notion API 配置
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_posts_database_id
NOTION_PROJECTS_DB=your_projects_database_id
NOTION_BOOKS_DB=your_books_database_id
NOTION_TOOLS_DB=your_tools_database_id
```

4. **启动开发服务器**
```bash
npm run dev
```

5. 访问 http://localhost:3000

## 📁 项目结构

```
my-blog/
├── app/                    # Next.js 页面和路由
│   ├── (routes)/          # 各功能页面
│   │   ├── blog/          # 博客列表
│   │   ├── posts/         # 文章详情
│   │   ├── projects/      # 项目展示
│   │   ├── bookshelf/     # 书架系统
│   │   ├── tools/         # 工具推荐
│   │   ├── about/         # 关于页面
│   │   └── archive/       # 文章归档
│   ├── api/               # API 路由
│   │   └── search/        # 搜索 API
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── features/          # 功能组件
│   │   ├── BookCard.tsx   # 书籍卡片
│   │   ├── ProjectCard.tsx # 项目卡片
│   │   ├── ToolCard.tsx   # 工具卡片
│   │   └── Search.tsx     # 搜索组件
│   ├── layout/            # 布局组件
│   │   ├── Header.tsx     # 导航栏
│   │   └── Footer.tsx     # 页脚
│   ├── sections/          # 页面区块
│   └── ui/                # UI 基础组件
│       ├── OptimizedImage.tsx # 优化图片
│       ├── LazyLoad.tsx   # 懒加载
│       └── ThemeToggle.tsx # 主题切换
├── lib/                   # 工具函数和配置
│   ├── hooks/             # 自定义 Hooks
│   │   ├── useTheme.ts    # 主题管理
│   │   └── useDebounce.ts # 防抖处理
│   ├── notion/            # Notion API 集成
│   └── fallback-*.ts      # 后备数据
├── types/                 # TypeScript 类型定义
├── docs/                  # 项目文档
└── public/               # 静态资源
```

## 📝 功能详解

### 博客系统
- Markdown 内容渲染
- 文章分类（Technology、Design、Productivity、Life）
- 按年份归档
- 阅读时间估算
- 文章标签系统

### 项目展示
- 项目分类（网站应用、开源项目、设计作品等）
- 技术栈标签展示
- 项目详情页
- 演示链接和 GitHub 链接
- 项目截图展示

### 书架系统
- 阅读状态管理（在读、已读、想读）
- 多种视图切换（网格视图/列表视图）
- 筛选功能（按状态、分类）
- 排序功能（按日期、评分、书名）
- 阅读统计（总数、已读、在读、想读、平均评分）
- 读书笔记（Markdown 格式）
- 书籍元数据（作者、出版年份、页数、ISBN等）

### 工具推荐
- 工具分类（开发、设计、效率、硬件、服务）
- 详细使用评测
- 使用场景说明
- 官网链接
- 评分系统
- 标签系统

### 搜索功能
- 全站内容搜索（文章、项目、书籍、工具）
- 实时搜索建议
- 模糊匹配
- 搜索结果分类展示
- 键盘快捷键支持

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据源**: Notion API + 后备数据
- **搜索**: Fuse.js
- **图标**: Heroicons
- **部署**: 静态导出

## 🚀 部署指南

### 构建项目
```bash
npm run build
```

### 部署到 Vercel（推荐）

最简单的部署方式是使用 [Vercel](https://vercel.com)：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/muzhihao1/my-next-blog)

或查看详细 [部署指南](./docs/deployment-guide.md)

### 其他部署选项

#### 1. Vercel（推荐）
```bash
npx vercel
```

#### 2. Netlify
- 构建命令: `npm run build`
- 发布目录: `out`

#### 3. GitHub Pages
```bash
npm run build
# 将 out 目录内容推送到 gh-pages 分支
```

#### 4. 自托管
- 运行 `npm run build`
- 将 `out` 目录部署到任何静态文件服务器

## ⚙️ 配置说明

### Notion 数据库配置
参考 `docs/notion-setup.md` 配置你的 Notion 数据库：
- 文章数据库
- 项目数据库
- 书籍数据库
- 工具数据库

### 主题定制
编辑 `app/globals.css` 中的 CSS 变量：
```css
:root {
  --color-primary: #2563eb;
  --color-background: #ffffff;
  --color-text: #111827;
  /* 更多颜色变量 */
}
```

### 导航菜单
编辑 `components/layout/Header.tsx` 中的 navigation 数组

## 🎯 性能优化

- **图片优化**: 使用 Next.js Image 组件，支持懒加载和响应式图片
- **代码分割**: 使用动态导入减少首屏加载时间
- **静态生成**: 所有页面预渲染为静态 HTML
- **搜索优化**: 使用防抖减少搜索请求
- **组件懒加载**: 非关键组件延迟加载

## 📱 响应式断点

- 移动端: < 640px
- 平板: 640px - 1024px  
- 桌面: > 1024px

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

## 📚 项目文档

- [部署指南](./docs/deployment-guide.md) - 详细的 Vercel 部署步骤
- [Notion 配置指南](./docs/notion-setup.md) - Notion 数据库设置说明
- [代码审查标准](./docs/code-review-standards.md) - 项目代码规范
- [API 设计规范](./docs/api-standards.md) - API 接口设计准则
- [项目治理](./docs/project-governance.md) - 项目管理和规范体系

## 🙏 致谢

- 设计灵感来自 [Alex Hsu](https://alexhsu.com)
- 基于 [Next.js](https://nextjs.org) 框架
- 样式使用 [Tailwind CSS](https://tailwindcss.com)
- 搜索功能使用 [Fuse.js](https://fusejs.io)
- 图标来自 [Heroicons](https://heroicons.com)