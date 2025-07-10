# Notion 完整配置指南

本文档整合了所有 Notion 相关的配置说明，包括初始设置、数据库配置和实际配置值。

## 📋 目录

1. [前置准备](#前置准备)
2. [创建 Notion 集成](#创建-notion-集成)
3. [数据库配置](#数据库配置)
4. [环境变量设置](#环境变量设置)
5. [测试连接](#测试连接)
6. [实际配置参考](#实际配置参考)
7. [常见问题](#常见问题)

## 前置准备

- Notion 账号
- Node.js 环境（用于运行测试脚本）
- 博客项目代码

## 创建 Notion 集成

1. 访问 [Notion Developers](https://www.notion.so/my-integrations)
2. 点击 "New integration" 创建新集成
3. 配置集成信息：
   - **Name**: `My Blog Integration`（或自定义名称）
   - **Associated workspace**: 选择你的工作空间
   - **Capabilities**:
     - ✅ Read content
     - ✅ Update content（如需更新功能）
     - ✅ Insert content（如需创建功能）

4. 创建后复制 **Internal Integration Token**

## 数据库配置

### 1. 博客文章数据库

**数据库名称**：博客文章

**必需字段**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| Title | 标题 | 文章标题 |
| Author | 人员 | 作者信息 |
| Date | 日期 | 发布日期 |
| Tags | 多选 | 文章标签 |
| Category | 选择 | 文章分类 |
| Status | 选择 | 发布状态（Published/Draft） |

**可选字段**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| Excerpt | 文本 | 文章摘要 |
| Featured | 复选框 | 是否精选 |
| RelatedPosts | 关系 | 相关文章 |

### 2. 书架数据库

**数据库名称**：书架

**必需字段**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| Title | 标题 | 书名 |
| Author | 文本 | 作者 |
| Status | 选择 | 阅读状态（已读/在读/想读） |
| Category | 选择 | 图书分类 |

**可选字段**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| Rating | 选择 | 评分（1-5星） |
| Review | 文本 | 书评 |
| StartDate | 日期 | 开始阅读日期 |
| FinishDate | 日期 | 完成阅读日期 |
| ISBN | 文本 | ISBN号 |
| Pages | 数字 | 页数 |
| Publisher | 文本 | 出版社 |
| PublishYear | 数字 | 出版年份 |
| Link | URL | 购买链接 |
| Notes | 文本 | 读书笔记 |
| Cover | 文件 | 封面图片 |

### 3. 项目展示数据库

**数据库名称**：项目展示

**必需字段**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| Title | 标题 | 项目名称 |
| Description | 文本 | 项目描述 |
| Status | 选择 | 项目状态 |
| Category | 选择 | 项目分类 |
| TechStack | 多选 | 技术栈 |

**可选字段**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| StartDate | 日期 | 开始日期 |
| EndDate | 日期 | 完成日期 |
| DemoUrl | URL | 演示链接 |
| SourceUrl | URL | 源码链接 |
| Featured | 复选框 | 是否精选 |
| Thumbnail | 文件 | 项目缩略图 |
| Images | 文件 | 项目截图 |
| Team | 多选 | 团队成员 |
| Client | 文本 | 客户名称 |

### 4. 工具推荐数据库

**数据库名称**：工具推荐

**必需字段**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| Name | 标题 | 工具名称 |
| Description | 文本 | 工具描述 |
| Category | 选择 | 工具分类 |
| Rating | 选择 | 评分（1-5） |

**可选字段**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| Website | URL | 官网链接 |
| Price | 选择 | 价格类型 |
| Platform | 多选 | 支持平台 |
| Features | 文本 | 主要功能 |
| Pros | 文本 | 优点 |
| Cons | 文本 | 缺点 |
| Alternative | 文本 | 替代工具 |
| Tags | 多选 | 标签 |
| Icon | 文件 | 工具图标 |
| Featured | 复选框 | 是否推荐 |

## 环境变量设置

在项目根目录创建或编辑 `.env.local` 文件：

```env
# Notion API 配置
NOTION_TOKEN=your_integration_token_here
NOTION_DATABASE_ID=your_blog_database_id_here

# 其他数据库 ID（如果需要）
NOTION_BOOKS_DATABASE_ID=your_books_database_id_here
NOTION_PROJECTS_DATABASE_ID=your_projects_database_id_here
NOTION_TOOLS_DATABASE_ID=your_tools_database_id_here

# 可选：缓存配置
CACHE_TTL=3600000  # 1小时
```

## 测试连接

运行项目提供的测试脚本验证配置：

```bash
npm run test:notion
```

成功输出示例：

```
✓ Notion API 令牌已配置
✓ 成功连接到 Notion API
✓ 博客数据库连接成功
✓ 找到 5 篇已发布的文章
```

## 实际配置参考

以下是实际创建的数据库 ID 示例（请替换为你自己的 ID）：

```env
# 实际数据库 ID 示例
NOTION_DATABASE_ID=b8a5c3d2e1f6...              # 博客文章
NOTION_BOOKS_DATABASE_ID=2291b640-00a7-81fa...  # 书架
NOTION_PROJECTS_DATABASE_ID=2291b640-00a7-8173... # 项目展示
NOTION_TOOLS_DATABASE_ID=2291b640-00a7-8125...   # 工具推荐
```

### 获取数据库 ID 的方法

1. 在 Notion 中打开数据库页面
2. 点击右上角 "Share" 按钮
3. 点击 "Copy link"
4. 链接格式：`https://www.notion.so/xxxxx?v=yyyy`
5. 其中 `xxxxx` 部分就是数据库 ID

## 常见问题

### 1. 如何授权集成访问数据库？

在每个数据库页面：

1. 点击右上角 "..." 菜单
2. 选择 "Connections"
3. 搜索并添加你创建的集成

### 2. 为什么看不到数据？

检查：

- 文章的 Status 字段是否设置为 "Published"
- 集成是否已授权访问数据库
- 环境变量是否正确配置

### 3. 如何添加新字段？

1. 在 Notion 数据库中添加新属性
2. 更新对应的 TypeScript 类型定义
3. 在数据获取函数中处理新字段

### 4. 性能优化建议

- 使用内置的缓存机制（通过 CACHE_TTL 配置）
- 考虑使用静态生成（SSG）而非服务端渲染（SSR）
- 定期清理和归档旧数据

## 相关文档

- [Notion API 官方文档](https://developers.notion.com/)
- [博主使用指南](/docs/blogger-guide.md)
- [故障排除指南](/docs/troubleshooting.md)

---

_最后更新：2025-01-07_
