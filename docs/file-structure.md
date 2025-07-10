# 项目文件结构说明

本文档说明博客项目的文件结构组织，帮助开发者快速理解项目布局。

## 📁 项目根目录结构

```
my-blog/
├── app/                    # Next.js App Router 页面
├── components/             # React 组件库
├── lib/                    # 工具函数和业务逻辑
├── types/                  # TypeScript 类型定义
├── public/                 # 静态资源
├── docs/                   # 项目文档
├── scripts/                # 构建和部署脚本
├── out/                    # 构建输出目录
└── 配置文件                # package.json, tsconfig.json 等
```

## 🗂️ 详细目录说明

### `/app` - 页面和路由

采用 Next.js 15 App Router 结构：

```
app/
├── (routes)/              # 功能页面组
│   ├── blog/             # 博客列表页
│   ├── posts/[slug]/     # 文章详情页
│   ├── projects/         # 项目展示
│   ├── bookshelf/        # 书架系统
│   ├── tools/            # 工具推荐
│   ├── about/            # 关于页面
│   └── archive/          # 文章归档
├── api/                   # API 路由
│   └── statistics/       # 统计数据 API
├── layout.tsx            # 根布局
├── page.tsx              # 首页
├── globals.css           # 全局样式
└── not-found.tsx         # 404 页面
```

### `/components` - 组件库

按功能分类组织：

```
components/
├── features/             # 功能组件
│   ├── Search.tsx       # 搜索功能
│   ├── BookCard.tsx     # 书籍卡片
│   ├── ProjectCard.tsx  # 项目卡片
│   ├── ToolCard.tsx     # 工具卡片
│   ├── Comments.tsx     # 评论系统
│   └── ...             # 其他功能组件
├── layout/              # 布局组件
│   ├── Header.tsx      # 导航栏
│   └── Footer.tsx      # 页脚
├── sections/            # 页面区块
│   └── StatsSection.tsx # 统计区块
├── ui/                  # 基础 UI 组件
│   ├── ThemeToggle.tsx  # 主题切换
│   ├── LazyLoad.tsx     # 懒加载容器
│   └── OptimizedImage.tsx # 优化图片
└── seo/                 # SEO 相关组件
    ├── SEO.tsx          # Meta 标签管理
    └── StructuredData.tsx # 结构化数据
```

### `/lib` - 核心逻辑

业务逻辑和工具函数：

```
lib/
├── notion/              # Notion API 集成
│   ├── notion.ts       # 主 API 客户端
│   ├── books.ts        # 书籍数据获取
│   ├── projects.ts     # 项目数据获取
│   └── tools.ts        # 工具数据获取
├── fallback-*.ts        # 后备数据（离线支持）
├── hooks/               # 自定义 React Hooks
│   ├── useTheme.ts     # 主题管理
│   ├── useDebounce.ts  # 防抖处理
│   └── usePerformanceMonitor.ts # 性能监控
├── search/              # 搜索功能
│   └── searchData.ts   # 搜索数据处理
├── tags/                # 标签系统
│   └── tag-manager.ts  # 标签管理
├── errors/              # 错误处理
│   └── bookshelf-errors.ts # 书架错误类
├── monitoring/          # 监控集成
│   └── sentry.ts       # Sentry 配置
├── utils/               # 通用工具
│   └── content.ts      # 内容处理工具
├── rss.ts              # RSS 生成
├── statistics.ts       # 统计功能
└── utils.ts            # 通用工具函数
```

### `/types` - 类型定义

TypeScript 类型定义：

```
types/
├── notion.ts           # Notion API 类型
├── post.ts             # 文章类型
├── project.ts          # 项目类型
├── book.ts             # 书籍类型
├── bookshelf.ts        # 书架类型
├── tool.ts             # 工具类型
└── tag.ts              # 标签类型
```

### `/docs` - 项目文档

完整的文档体系：

```
docs/
├── README.md               # 文档索引
├── blogger-guide.md        # 博主使用指南 ⭐
├── deployment-guide.md     # 部署指南
├── maintenance-guide.md    # 维护指南
├── project-handover.md     # 项目交付文档
├── notion-setup.md         # Notion 配置指南
├── code-review-standards.md # 代码规范
├── api-standards.md        # API 规范
├── project-governance.md   # 项目治理
├── monitoring-setup.md     # 监控设置
├── giscus-setup.md        # 评论系统设置
├── subscription-setup.md   # 订阅功能设置
├── feature-improvement-plan.md # 功能改进计划
├── urgent-fixes.md         # 紧急修复记录
├── project-status-report.md # 项目状态报告
├── file-structure.md       # 本文档
└── archive/                # 归档文档
    ├── NOTION_SETUP.md     # 旧版 Notion 指南
    ├── MIGRATION.md        # 迁移指南
    ├── BLOG_GUIDE.md       # 旧版博客指南
    ├── 功能实现对比报告.md  # 功能对比
    └── 并行开发任务分配.md  # 任务分配记录
```

## 🔧 配置文件

### 根目录配置文件

- **package.json** - 项目依赖和脚本
- **package-lock.json** - 依赖锁定文件
- **tsconfig.json** - TypeScript 配置
- **next.config.js** - Next.js 配置
- **tailwind.config.js** - Tailwind CSS 配置
- **postcss.config.js** - PostCSS 配置
- **.env.example** - 环境变量模板
- **.env.local** - 本地环境变量（不提交）

## 📦 构建输出

### `/out` 目录

静态导出的生产文件：

```
out/
├── index.html           # 首页
├── posts/               # 文章页面
├── projects/            # 项目页面
├── bookshelf/           # 书架页面
├── tools/               # 工具页面
├── _next/               # Next.js 资源
│   ├── static/         # 静态资源
│   │   ├── chunks/     # JS 代码块
│   │   └── css/        # CSS 文件
└── 其他静态页面
```

## 🎯 文件命名规范

### 组件文件

- **PascalCase**：`BookCard.tsx`, `ThemeToggle.tsx`
- 一个文件一个组件

### 工具函数

- **camelCase**：`searchData.ts`, `useTheme.ts`
- 功能相关的函数放在同一文件

### 页面文件

- **小写字母 + 连字符**：`page.tsx`, `not-found.tsx`
- 动态路由使用方括号：`[slug]`

### 样式文件

- **小写字母 + 连字符**：`globals.css`
- 组件样式使用 Tailwind CSS 类名

## 💡 最佳实践

### 组件组织

1. 功能相关的组件放在 `features/` 目录
2. 通用 UI 组件放在 `ui/` 目录
3. 布局组件放在 `layout/` 目录

### 业务逻辑

1. Notion API 相关代码放在 `lib/notion/`
2. 自定义 Hooks 放在 `lib/hooks/`
3. 工具函数放在 `lib/utils/`

### 类型定义

1. 每个功能模块有独立的类型文件
2. 共享类型放在对应的类型文件中
3. 避免在组件中定义复杂类型

### 文档管理

1. 用户指南类文档放在 `docs/` 根目录
2. 技术规范类文档放在 `docs/` 根目录
3. 历史文档放在 `docs/archive/`

## 🔄 文件结构维护

### 添加新功能时

1. 在相应的目录创建文件
2. 遵循现有的命名规范
3. 更新相关文档

### 重构时

1. 保持文件结构的一致性
2. 及时更新导入路径
3. 清理无用文件

---

_最后更新：2025-01-07_  
_维护者：终端 C_
