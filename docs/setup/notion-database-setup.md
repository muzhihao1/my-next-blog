# Notion 数据库配置指南

本文档详细说明了博客系统使用的 Notion 数据库结构，包括字段定义、数据类型和配置建议。

## 一、数据库概览

博客系统集成了 4 个主要的 Notion 数据库：

1. **博客文章数据库** - 存储所有博客文章
2. **书籍管理数据库** - 管理阅读清单和读书笔记
3. **工具推荐数据库** - 收集和分享实用工具
4. **项目展示数据库** - 展示个人项目和作品

## 二、数据库详细配置

### 2.1 博客文章数据库 (Blog Posts)

**环境变量**: `NOTION_DATABASE_ID`

| 字段名       | 属性类型     | 必填 | 说明                  | 示例                           |
| ------------ | ------------ | ---- | --------------------- | ------------------------------ |
| Title        | Title        | ✅   | 文章标题              | "使用 Next.js 15 构建现代博客" |
| Slug         | Rich Text    | ✅   | URL 路径标识          | "build-modern-blog-nextjs-15"  |
| Category     | Select       | ✅   | 文章分类              | 技术分享 / 产品思考 / 生活随笔 |
| Excerpt      | Rich Text    | ✅   | 文章摘要（150字以内） | "探索 Next.js 15 的新特性..."  |
| Date         | Date         | ✅   | 发布日期              | 2025-01-08                     |
| ReadTime     | Number       | ❌   | 预计阅读时间（分钟）  | 5                              |
| AuthorName   | Rich Text    | ✅   | 作者姓名              | "Siloam Liao"                  |
| AuthorAvatar | Files        | ❌   | 作者头像              | avatar.jpg                     |
| Published    | Checkbox     | ✅   | 是否发布              | ✅                             |
| Tags         | Multi-select | ❌   | 文章标签              | Next.js, React, TypeScript     |
| Cover        | Files        | ❌   | 封面图片              | cover.jpg                      |

**页面内容**: 使用 Notion 页面内容区域编写文章正文，支持 Markdown 格式。

### 2.2 书籍管理数据库 (Books)

**环境变量**: `NOTION_BOOKS_DB`

| 字段名      | 属性类型     | 必填 | 说明                 | 示例                            |
| ----------- | ------------ | ---- | -------------------- | ------------------------------- |
| Title       | Title        | ✅   | 书名                 | "深入浅出 TypeScript"           |
| Author      | Rich Text    | ✅   | 作者                 | "张三"                          |
| ISBN        | Rich Text    | ❌   | ISBN 编号            | "978-7-111-12345-6"             |
| Category    | Select       | ✅   | 图书分类             | 技术 / 管理 / 心理 / 文学       |
| Status      | Select       | ✅   | 阅读状态             | 已读 / 在读 / 想读              |
| Rating      | Number       | ❌   | 评分（1-5）          | 4.5                             |
| StartDate   | Date         | ❌   | 开始阅读日期         | 2024-12-01                      |
| FinishDate  | Date         | ❌   | 完成阅读日期         | 2024-12-20                      |
| Cover       | Files        | ❌   | 封面图片             | book-cover.jpg                  |
| Takeaways   | Rich Text    | ❌   | 核心收获（简短总结） | "学会了 TypeScript 高级类型..." |
| Tags        | Multi-select | ❌   | 标签                 | TypeScript, 前端开发            |
| PublishYear | Number       | ❌   | 出版年份             | 2024                            |
| Pages       | Number       | ❌   | 页数                 | 380                             |
| Language    | Select       | ❌   | 语言                 | 中文 / English                  |

**页面内容**: 使用 Notion 页面内容区域记录详细的读书笔记。

### 2.3 工具推荐数据库 (Tools)

**环境变量**: `NOTION_TOOLS_DB`

| 字段名       | 属性类型     | 必填 | 说明         | 示例                                    |
| ------------ | ------------ | ---- | ------------ | --------------------------------------- |
| Name         | Title        | ✅   | 工具名称     | "VS Code"                               |
| Slug         | Rich Text    | ✅   | URL 路径标识 | "vs-code"                               |
| Category     | Select       | ✅   | 工具分类     | 开发工具 / 设计工具 / 效率工具 / AI工具 |
| Description  | Rich Text    | ✅   | 简短描述     | "微软开发的免费代码编辑器"              |
| Rating       | Number       | ✅   | 评分（1-5）  | 5                                       |
| Price        | Select       | ✅   | 价格类型     | 免费 / 付费 / 免费增值 / 订阅制         |
| Website      | URL          | ✅   | 官网链接     | https://code.visualstudio.com           |
| Pros         | Rich Text    | ❌   | 优点（多行） | "插件生态丰富\n性能优秀\n跨平台"        |
| Cons         | Rich Text    | ❌   | 缺点（多行） | "占用内存较大\n启动速度一般"            |
| UseCases     | Rich Text    | ❌   | 使用场景     | "前端开发、后端开发、文档编写"          |
| Alternatives | Rich Text    | ❌   | 替代方案     | "Sublime Text, Atom, WebStorm"          |
| Tags         | Multi-select | ❌   | 标签         | 编辑器, Microsoft, 开源                 |
| Featured     | Checkbox     | ❌   | 是否精选     | ✅                                      |
| Published    | Checkbox     | ✅   | 是否发布     | ✅                                      |

**页面内容**: 使用 Notion 页面内容区域编写详细的工具评测。

### 2.4 项目展示数据库 (Projects)

**环境变量**: `NOTION_PROJECTS_DB`

| 字段名      | 属性类型     | 必填 | 说明             | 示例                                   |
| ----------- | ------------ | ---- | ---------------- | -------------------------------------- |
| Title       | Title        | ✅   | 项目名称         | "个人博客系统 v2.0"                    |
| Slug        | Rich Text    | ✅   | URL 路径标识     | "personal-blog-v2"                     |
| Description | Rich Text    | ✅   | 项目简介         | "基于 Next.js 15 的现代化博客"         |
| Category    | Select       | ✅   | 项目类型         | Web应用 / 移动应用 / 开源项目 / 工具库 |
| Status      | Select       | ✅   | 项目状态         | 已完成 / 开发中 / 维护中 / 已归档      |
| Featured    | Checkbox     | ❌   | 是否精选         | ✅                                     |
| TechStack   | Multi-select | ✅   | 技术栈           | Next.js, TypeScript, Tailwind          |
| Tags        | Multi-select | ❌   | 项目标签         | 全栈, React, 个人项目                  |
| Thumbnail   | Files        | ❌   | 项目缩略图       | thumbnail.png                          |
| Screenshots | Files        | ❌   | 项目截图（多张） | [screen1.png, screen2.png]             |
| DemoUrl     | URL          | ❌   | 演示链接         | https://blog.example.com               |
| GithubUrl   | URL          | ❌   | GitHub 链接      | https://github.com/user/repo           |
| StartDate   | Date         | ❌   | 开始日期         | 2024-10-01                             |
| EndDate     | Date         | ❌   | 结束日期         | 2024-12-31                             |
| Users       | Number       | ❌   | 用户数量         | 1000                                   |
| Performance | Number       | ❌   | 性能评分         | 95                                     |
| Achievement | Rich Text    | ❌   | 主要成就         | "获得 1000+ GitHub Stars"              |

**页面内容**: 使用 Notion 页面内容区域编写详细的项目介绍、技术架构、开发心得等。

## 三、数据库创建步骤

### 3.1 创建数据库

1. 在 Notion 中创建新页面
2. 选择 "Table - Full page" 模板
3. 根据上述字段配置添加属性
4. 设置正确的属性类型

### 3.2 获取数据库 ID

1. 打开数据库页面
2. 点击右上角的 "Share" 按钮
3. 复制链接，格式如：`https://www.notion.so/xxxxx?v=yyyyy`
4. `xxxxx` 部分即为数据库 ID

### 3.3 配置集成

1. 创建 Notion Integration：
   - 访问 https://www.notion.so/my-integrations
   - 创建新的 Integration
   - 复制 Integration Token

2. 授权数据库访问：
   - 在每个数据库页面点击 "Share"
   - 邀请创建的 Integration
   - 确保有 "Read" 权限

3. 配置环境变量：

```bash
# .env.local
NOTION_TOKEN=your_integration_token
NOTION_DATABASE_ID=blog_database_id
NOTION_PROJECTS_DB=projects_database_id
NOTION_BOOKS_DB=books_database_id
NOTION_TOOLS_DB=tools_database_id
```

## 四、示例数据

### 4.1 博客文章示例

```
Title: 使用 Next.js 15 构建现代博客系统
Slug: build-modern-blog-nextjs-15
Category: 技术分享
Excerpt: 探索 Next.js 15 的新特性，包括 App Router、Server Components 和 ISR，构建高性能的个人博客。
Date: 2025-01-08
ReadTime: 8
AuthorName: Your Name
Published: ✅
Tags: Next.js, React, TypeScript, 博客开发
```

### 4.2 书籍示例

```
Title: 深入浅出 TypeScript
Author: 张三
Category: 技术
Status: 已读
Rating: 4.5
StartDate: 2024-12-01
FinishDate: 2024-12-20
Takeaways: 掌握了 TypeScript 的高级类型系统，学会了如何在大型项目中应用 TypeScript。
Tags: TypeScript, 前端开发, 编程语言
Pages: 380
Language: 中文
```

### 4.3 工具示例

```
Name: VS Code
Slug: vs-code
Category: 开发工具
Description: 微软开发的免费开源代码编辑器，支持多种编程语言和丰富的插件生态。
Rating: 5
Price: 免费
Website: https://code.visualstudio.com
Pros: 插件生态丰富\n性能优秀\n跨平台支持
Cons: 占用内存较大\n启动速度一般
UseCases: 前端开发、后端开发、文档编写、脚本编写
Alternatives: Sublime Text, Atom, WebStorm, Vim
Tags: 编辑器, Microsoft, 开源
Featured: ✅
Published: ✅
```

### 4.4 项目示例

```
Title: 个人博客系统 v2.0
Slug: personal-blog-v2
Description: 基于 Next.js 15 构建的现代化个人博客，支持 Notion CMS、ISR 更新、深色模式等功能。
Category: Web应用
Status: 开发中
Featured: ✅
TechStack: Next.js, TypeScript, Tailwind CSS, Notion API
Tags: 全栈, React, 个人项目, 开源
DemoUrl: https://blog.example.com
GithubUrl: https://github.com/username/blog
StartDate: 2024-10-01
Performance: 95
Achievement: Lighthouse 性能评分 95+，支持 ISR 自动更新
```

## 五、优化建议

### 5.1 数据规范化

1. **统一必填字段**：
   - 所有数据库都应包含 `Published` 字段控制发布状态
   - 建议添加 `CreatedAt` 和 `UpdatedAt` 字段跟踪时间
   - 统一使用 `Slug` 字段作为 URL 标识

2. **SEO 优化字段**：
   - 添加 `MetaDescription` 字段（150-160字符）
   - 添加 `OgImage` 字段用于社交分享
   - 添加 `Keywords` 字段优化搜索

3. **分类标准化**：
   - 预定义分类选项，避免拼写错误
   - 使用一致的分类命名规范
   - 考虑建立分类层级结构

### 5.2 数据质量保证

1. **必填字段验证**：
   - 在 Notion 中设置必填属性
   - 在代码端增加数据验证
   - 提供默认值处理

2. **数据格式规范**：
   - Slug 格式：小写字母、数字、连字符
   - 日期格式：统一使用 ISO 8601 格式
   - URL 格式：确保以 https:// 开头

3. **内容质量检查**：
   - 摘要长度限制（150字以内）
   - 标题长度建议（30-60字符）
   - 图片尺寸和格式要求

### 5.3 性能优化

1. **查询优化**：
   - 使用筛选条件减少数据传输
   - 只查询需要的字段
   - 实现分页加载

2. **缓存策略**：
   - 热门内容增加缓存时间
   - 实现增量更新机制
   - 考虑使用 Redis 持久化缓存

3. **批量操作**：
   - 实现批量数据导入
   - 支持批量状态更新
   - 优化关联查询

## 六、维护指南

### 6.1 定期维护

- 每月检查未发布的草稿
- 清理过期或无效的链接
- 更新项目状态和进度
- 整理和合并重复标签

### 6.2 数据备份

- 使用 Notion 的导出功能定期备份
- 保存数据库模板便于恢复
- 记录重要的配置变更

### 6.3 监控和分析

- 跟踪内容的访问量和互动
- 分析热门标签和分类
- 收集用户反馈优化内容

---

**更新日期**: 2025-01-08  
**维护者**: 终端B
