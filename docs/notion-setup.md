# Notion 数据库配置指南

本文档详细说明如何在 Notion 中创建和配置博客所需的数据库。

## 目录

1. [前置准备](#前置准备)
2. [文章数据库](#文章数据库)
3. [项目数据库](#项目数据库)
4. [书籍数据库](#书籍数据库)
5. [工具数据库](#工具数据库)
6. [获取 API Token](#获取-api-token)
7. [环境变量配置](#环境变量配置)

## 前置准备

1. 注册并登录 [Notion](https://www.notion.so/)
2. 创建一个新的工作空间或使用现有工作空间
3. 安装 Notion API 集成

## 文章数据库

### 创建数据库

1. 在 Notion 中创建一个新页面
2. 选择 "Table" 或 "数据库" 模板
3. 命名为 "Blog Posts" 或 "博客文章"

### 配置字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Title | Title | ✓ | 文章标题 |
| Slug | Text | ✓ | URL 路径，如 "my-first-post" |
| Excerpt | Text | ✓ | 文章摘要（150字以内） |
| Date | Date | ✓ | 发布日期 |
| Category | Select | ✓ | 文章分类 |
| Tags | Multi-select | | 文章标签 |
| AuthorName | Text | ✓ | 作者姓名 |
| AuthorAvatar | URL | | 作者头像链接 |
| Published | Checkbox | ✓ | 是否发布 |
| ReadTime | Text | | 阅读时间，如 "5 min read" |
| Cover | Files & media | | 封面图片 |

### 分类选项

- Technology（技术）
- Design（设计）
- Life（生活）
- Thinking（思考）

## 项目数据库

### 创建数据库

1. 创建新页面，选择数据库模板
2. 命名为 "Projects" 或 "项目"

### 配置字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Name | Title | ✓ | 项目名称 |
| Slug | Text | ✓ | URL 路径 |
| Description | Text | ✓ | 项目简介 |
| Category | Select | ✓ | 项目类型 |
| Status | Select | ✓ | 项目状态 |
| StartDate | Date | ✓ | 开始日期 |
| EndDate | Date | | 结束日期 |
| Technologies | Multi-select | ✓ | 使用技术 |
| GitHub | URL | | GitHub 仓库 |
| Demo | URL | | 演示链接 |
| Cover | Files & media | | 项目封面 |
| Featured | Checkbox | | 是否精选 |
| Published | Checkbox | ✓ | 是否发布 |

### 项目分类

- web（Web 应用）
- mobile（移动应用）
- tool（工具）
- opensource（开源项目）

### 项目状态

- planning（规划中）
- development（开发中）
- completed（已完成）
- maintenance（维护中）

## 书籍数据库

### 创建数据库

1. 创建新页面，选择数据库模板
2. 命名为 "Books" 或 "书架"

### 配置字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Title | Title | ✓ | 书名 |
| Author | Text | ✓ | 作者 |
| ISBN | Text | | ISBN 编号 |
| Category | Select | ✓ | 书籍分类 |
| Status | Select | ✓ | 阅读状态 |
| Rating | Number | | 评分（1-5） |
| StartDate | Date | | 开始阅读日期 |
| EndDate | Date | | 完成阅读日期 |
| Cover | Files & media | | 书籍封面 |
| Notes | Text | | 读书笔记 |
| Tags | Multi-select | | 标签 |
| Published | Checkbox | ✓ | 是否公开展示 |

### 书籍分类

- technology（技术）
- business（商业）
- philosophy（哲学）
- psychology（心理学）
- fiction（小说）
- history（历史）

### 阅读状态

- reading（在读）
- read（已读）
- want-to-read（想读）

## 工具数据库

### 创建数据库

1. 创建新页面，选择数据库模板
2. 命名为 "Tools" 或 "工具推荐"

### 配置字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Name | Title | ✓ | 工具名称 |
| Slug | Text | ✓ | URL 路径 |
| Category | Select | ✓ | 工具分类 |
| Description | Text | ✓ | 工具描述 |
| Rating | Number | ✓ | 评分（1-5） |
| Price | Select | ✓ | 价格类型 |
| Website | URL | ✓ | 官方网站 |
| Pros | Text | ✓ | 优点（多行文本） |
| Cons | Text | ✓ | 缺点（多行文本） |
| UseCases | Text | ✓ | 使用场景（多行文本） |
| Alternatives | Text | | 替代工具（多行文本） |
| Tags | Multi-select | | 标签 |
| Featured | Checkbox | | 是否精选 |
| Published | Checkbox | ✓ | 是否发布 |

### 工具分类

- development（开发工具）
- design（设计工具）
- productivity（效率工具）
- hardware（硬件设备）
- service（在线服务）

### 价格类型

- free（免费）
- freemium（免费增值）
- paid（付费）
- subscription（订阅制）

## 获取 API Token

### 创建集成

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 "New integration"
3. 填写集成信息：
   - Name: My Blog Integration
   - Associated workspace: 选择你的工作空间
   - Capabilities: 勾选 Read content
4. 提交后复制 "Internal Integration Token"

### 共享数据库

1. 打开每个创建的数据库页面
2. 点击右上角 "Share" 按钮
3. 在 "Invite" 中搜索并添加你创建的集成
4. 确保权限设置为 "Can view"

### 获取数据库 ID

1. 在浏览器中打开数据库页面
2. 查看 URL，格式如：`https://www.notion.so/xxxxx?v=yyyyy`
3. `xxxxx` 部分就是数据库 ID（32位字符串）

## 环境变量配置

在项目根目录创建 `.env.local` 文件：

```env
# Notion API Token
NOTION_TOKEN=secret_xxxxxxxxxxxxxx

# 数据库 ID
NOTION_DATABASE_ID=文章数据库ID
NOTION_PROJECTS_DB=项目数据库ID
NOTION_BOOKS_DB=书籍数据库ID
NOTION_TOOLS_DB=工具数据库ID

# 缓存设置（可选）
CACHE_TTL=3600000  # 1小时
```

## 数据库模板

### 示例文章

```
Title: 我的第一篇博客文章
Slug: my-first-blog-post
Excerpt: 这是我使用 Notion 作为 CMS 的第一篇博客文章，分享搭建过程和心得。
Date: 2024-01-15
Category: Technology
Tags: Notion, Next.js, Blog
AuthorName: Zhihao Mu
Published: ✓
ReadTime: 5 min read
```

### 示例项目

```
Name: 个人博客系统
Slug: personal-blog-system
Description: 基于 Next.js 和 Notion API 构建的个人博客系统
Category: web
Status: completed
StartDate: 2024-01-01
Technologies: Next.js, TypeScript, Tailwind CSS, Notion API
GitHub: https://github.com/username/blog
Demo: https://blog.example.com
Featured: ✓
Published: ✓
```

### 示例书籍

```
Title: 代码大全
Author: Steve McConnell
Category: technology
Status: read
Rating: 5
StartDate: 2023-10-01
EndDate: 2023-12-15
Tags: 编程, 软件工程, 经典
Published: ✓
```

### 示例工具

```
Name: Visual Studio Code
Slug: visual-studio-code
Category: development
Description: 功能强大的免费开源代码编辑器
Rating: 5
Price: free
Website: https://code.visualstudio.com/
Pros: 免费开源
丰富的扩展
性能优秀
Cons: 启动较慢
内存占用大
UseCases: Web开发
脚本编写
配置文件编辑
Tags: 编辑器, IDE, 开发工具
Featured: ✓
Published: ✓
```

## 常见问题

### 1. API 调用失败

- 检查 API Token 是否正确
- 确认数据库已共享给集成
- 验证数据库 ID 格式正确

### 2. 数据不显示

- 确保 Published 字段为勾选状态
- 检查必填字段是否都已填写
- 查看控制台是否有错误信息

### 3. 图片无法显示

- Notion 图片链接有时效性，建议使用外部图床
- 可以使用 Cloudinary、Unsplash 等服务

### 4. 性能优化

- 合理设置缓存时间（CACHE_TTL）
- 使用静态生成（SSG）减少 API 调用
- 考虑使用 ISR（增量静态再生）

## 下一步

1. 完成所有数据库创建和配置
2. 在 Notion 中添加一些测试数据
3. 运行项目验证数据是否正确显示
4. 根据需要调整字段和配置

如有问题，请参考 [Notion API 文档](https://developers.notion.com/) 或提交 Issue。