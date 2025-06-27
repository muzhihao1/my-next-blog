# 无题之墨 - My Next Blog

一个基于 Next.js 和 Notion API 构建的现代化个人博客系统。

## 🌟 特性

- 📝 **Notion CMS**: 使用 Notion 作为内容管理系统
- 🎨 **现代化设计**: 响应式布局，精美的视觉效果
- ⚡ **高性能**: 静态生成，快速加载
- 🔍 **SEO 优化**: 完整的元数据和结构化数据支持
- 📱 **移动端优化**: 完美适配各种设备
- 🌈 **主题定制**: 灵活的样式系统

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/muzhihao1/my-next-blog.git
cd my-next-blog
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 文件并重命名为 `.env.local`：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，添加你的 Notion 集成信息：

```env
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id
CACHE_TTL=300000
```

### 4. 配置 Notion

参考 `NOTION_SETUP.md` 文档配置你的 Notion 数据库。

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看你的博客。

## 📝 内容管理

### 在 Notion 中添加新文章

1. 在你的 Notion 数据库中创建新页面
2. 填写所有必需字段（Title、Slug、Category 等）
3. 在页面内容区域编写文章
4. 将 Published 复选框设为选中
5. 文章将自动同步到博客

### 文章属性

- **Title**: 文章标题
- **Slug**: URL 友好的标识符
- **Category**: 分类（Technology/Design/Productivity/Life）
- **Excerpt**: 文章摘要
- **Date**: 发布日期
- **ReadTime**: 预计阅读时间
- **Published**: 是否发布
- **Tags**: 文章标签（可选）

## 🛠️ 技术栈

- **框架**: Next.js 15
- **样式**: Tailwind CSS
- **CMS**: Notion API
- **语言**: TypeScript
- **部署**: Vercel/Netlify

## 📁 项目结构

```
my-next-blog/
├── app/                    # Next.js 应用目录
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── posts/[slug]/      # 文章详情页
├── lib/                   # 工具函数
│   ├── notion.ts         # Notion API 集成
│   └── fallback-posts.ts # 后备内容
├── types/                # TypeScript 类型定义
├── public/               # 静态资源
└── styles/              # 全局样式
```

## 🚀 部署

### Vercel 部署

1. 将项目推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 静态导出

```bash
npm run build
```

构建的静态文件位于 `out` 目录。

## 📚 文档

- [Notion 配置指南](./NOTION_SETUP.md)
- [内容迁移指南](./MIGRATION.md)
- [Claude 使用指南](./CLAUDE.md)
- [博客维护指南](./BLOG_GUIDE.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License