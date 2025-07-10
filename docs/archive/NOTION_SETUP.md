# Notion 数据库配置指南

本指南将帮助你在 Notion 中设置博客内容管理数据库。

## 📋 第一步：创建 Notion 集成

1. 访问 [Notion 集成页面](https://www.notion.so/my-integrations)
2. 点击 "新建集成" (New integration)
3. 填写集成信息：
   - **名称**: 无题之墨博客 (或任何你喜欢的名称)
   - **关联工作区**: 选择你的工作区
   - **类型**: 内部集成
4. 点击 "提交" 创建集成
5. **复制集成令牌** (以 `secret_` 开头)，稍后需要用到

## 🗃️ 第二步：创建博客数据库

1. 在 Notion 中创建一个新页面
2. 添加一个 "表格-内联" 数据库
3. 将数据库标题设置为 "博客文章" 或 "Blog Posts"

## ⚙️ 第三步：配置数据库属性

删除默认属性，添加以下属性（**属性名称必须与下面完全一致**）：

| 属性名称         | 属性类型            | 说明                                   | 是否必需 |
| ---------------- | ------------------- | -------------------------------------- | -------- |
| **Title**        | 标题 (Title)        | 文章标题                               | ✅ 必需  |
| **Slug**         | 文本 (Text)         | URL 友好的文章标识，如 `my-first-post` | ✅ 必需  |
| **Category**     | 选择 (Select)       | 文章分类                               | ✅ 必需  |
| **Excerpt**      | 文本 (Text)         | 文章摘要，1-2 句话简介                 | ✅ 必需  |
| **Date**         | 日期 (Date)         | 发布日期                               | ✅ 必需  |
| **ReadTime**     | 文本 (Text)         | 阅读时间，如 "5 min read"              | ✅ 必需  |
| **AuthorName**   | 文本 (Text)         | 作者姓名                               | ⚠️ 可选  |
| **AuthorAvatar** | URL                 | 作者头像链接                           | ⚠️ 可选  |
| **Published**    | 复选框 (Checkbox)   | 是否发布                               | ✅ 必需  |
| **Tags**         | 多选 (Multi-select) | 文章标签                               | ⚠️ 可选  |

### Category 选项配置

为 **Category** 属性添加以下选项：

- `Technology` (技术)
- `Design` (设计)
- `Productivity` (效率)
- `Life` (生活)

## 📝 第四步：添加示例文章

在数据库中添加一条示例记录：

| 字段             | 示例值                                                                          |
| ---------------- | ------------------------------------------------------------------------------- |
| **Title**        | 我的第一篇博客文章                                                              |
| **Slug**         | my-first-blog-post                                                              |
| **Category**     | Technology                                                                      |
| **Excerpt**      | 这是我的第一篇使用 Notion 管理的博客文章，展示了如何将 Notion 与 Next.js 集成。 |
| **Date**         | 2024-12-27                                                                      |
| **ReadTime**     | 3 min read                                                                      |
| **AuthorName**   | Zhihao Mu                                                                       |
| **AuthorAvatar** | https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80         |
| **Published**    | ✅ 选中                                                                         |
| **Tags**         | Notion, Next.js, 博客                                                           |

在页面内容区域写入文章正文：

```markdown
# 欢迎使用 Notion 博客

这是我的第一篇使用 Notion 管理的博客文章！

## 为什么选择 Notion？

Notion 提供了强大的内容管理功能：

- 📝 所见即所得编辑器
- 🔗 丰富的内容类型支持
- 📊 数据库管理功能
- 🤝 团队协作功能

## 下一步

现在我可以在 Notion 中轻松地：

1. 创建新文章
2. 管理文章状态
3. 组织内容分类
4. 预览发布效果

让我们开始这个激动人心的旅程吧！
```

## 🔗 第五步：获取数据库 ID

1. 打开你刚创建的数据库页面
2. 复制页面 URL，格式类似：
   ```
   https://www.notion.so/your-workspace/DATABASE_ID?v=VIEW_ID
   ```
3. **DATABASE_ID** 就是你需要的数据库 ID（32 位字符串）

## 🔐 第六步：配置权限

1. 在数据库页面右上角点击 "共享" (Share)
2. 点击 "邀请"
3. 在搜索框中输入你的集成名称（如 "无题之墨博客"）
4. 选择集成并点击 "邀请"
5. 确保集成有 "可以编辑" 权限

## 🚀 第七步：配置环境变量

1. 复制 `.env.local.example` 文件为 `.env.local`：

   ```bash
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local` 文件，填入你的值：
   ```env
   NOTION_TOKEN=secret_your_integration_token_here
   NOTION_DATABASE_ID=your_32_character_database_id_here
   CACHE_TTL=300000
   ```

## ✅ 第八步：测试连接

运行博客项目并测试 Notion 连接：

```bash
npm run dev
```

如果配置正确，你应该能够看到从 Notion 数据库加载的文章。

## 📖 文章编写最佳实践

### Slug 命名规范

- 使用英文和连字符
- 全小写
- 简洁明确
- 示例：`notion-blog-setup`、`react-performance-tips`

### 摘要写作技巧

- 控制在 1-2 句话
- 概括文章主要内容
- 吸引读者点击阅读

### 阅读时间估算

- 按中文 300-400 字/分钟计算
- 英文按 200-250 词/分钟计算
- 包含代码和图片需要额外时间

### 内容结构建议

```markdown
# 主标题

简介段落...

## 大标题 1

内容...

### 小标题 1.1

具体内容...

## 大标题 2

内容...

## 总结

总结内容...
```

## 🔧 常见问题

### Q: 集成令牌在哪里找？

A: 访问 [Notion 集成页面](https://www.notion.so/my-integrations)，选择你的集成，在 "Secrets" 部分复制令牌。

### Q: 数据库 ID 格式不对？

A: 确保复制的是 32 位字符的数据库 ID，不包含连字符或其他字符。

### Q: 文章没有显示？

A: 检查以下项目：

- ✅ 文章的 "Published" 复选框是否选中
- ✅ 集成是否有数据库访问权限
- ✅ 环境变量是否正确配置

### Q: 图片无法显示？

A: Notion 图片链接可能需要特殊处理，建议使用外部图床（如 Unsplash、Cloudinary）。

## 🎯 下一步

- 查看 `MIGRATION.md` 了解如何迁移现有文章
- 阅读 `CLAUDE.md` 了解项目整体架构
- 开始在 Notion 中创建你的第一篇文章！
