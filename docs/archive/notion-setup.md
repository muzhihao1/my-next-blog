# Notion API 配置指南

本指南将帮助你配置 Notion API，让博客能够从 Notion 数据库中获取内容。

## 🔧 前提条件

- 有效的 Notion 账户
- 创建好的 Notion 数据库（文章、书籍、项目、工具）

## 📋 配置步骤

### 1. 创建 Notion 集成

1. **访问集成页面**
   - 打开 [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
   - 点击 "New integration" 按钮

2. **填写集成信息**
   - **Name**: 输入集成名称，如 "My Blog Integration"
   - **Associated workspace**: 选择你的工作空间
   - **Type**: 选择 "Internal"
3. **提交并获取 Token**
   - 点击 "Submit" 创建集成
   - 复制生成的 "Internal Integration Token"（以 `secret_` 开头）

### 2. 准备 Notion 数据库

#### 2.1 创建博客文章数据库

创建一个包含以下属性的数据库：

| 属性名称 | 类型          | 说明                   |
| -------- | ------------- | ---------------------- |
| Title    | Title         | 文章标题               |
| Status   | Select        | 状态：Published, Draft |
| Date     | Date          | 发布日期               |
| Tags     | Multi-select  | 标签                   |
| Summary  | Text          | 摘要                   |
| Content  | Rich text     | 文章内容               |
| Cover    | Files & media | 封面图片               |
| Slug     | Rich text     | URL路径（可选）        |

#### 2.2 其他数据库（可选）

- **书籍数据库**: 包含 Title, Author, Status, Rating, Cover 等字段
- **项目数据库**: 包含 Title, Description, Tech Stack, Status, Link 等字段
- **工具数据库**: 包含 Title, Category, Description, Link 等字段

### 3. 获取数据库 ID

对于每个数据库：

1. **打开数据库页面**
2. **复制数据库 URL**
   ```
   https://www.notion.so/workspace/DATABASE_ID?v=VIEW_ID
   ```
3. **提取数据库 ID**
   - 数据库 ID 是 URL 中的32位字符串（DATABASE_ID 部分）
   - 例如：`1234567890abcdef1234567890abcdef`

### 4. 配置数据库权限

对于每个要使用的数据库：

1. **打开数据库页面**
2. **点击右上角的 "Share" 按钮**
3. **搜索并邀请你的集成**
   - 在搜索框中输入集成名称
   - 选择你创建的集成
   - 确保权限设置为 "Can edit" 或 "Can read"

### 5. 配置环境变量

#### 5.1 本地开发环境

在项目根目录的 `.env.local` 文件中添加：

```bash
# Notion API 配置
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=你的文章数据库ID

# 可选：其他数据库
NOTION_BOOKS_DB=你的书籍数据库ID
NOTION_PROJECTS_DB=你的项目数据库ID
NOTION_TOOLS_DB=你的工具数据库ID

# 缓存配置（可选）
CACHE_TTL=3600000
```

#### 5.2 Vercel 生产环境

1. **登录 Vercel 控制台**
2. **进入项目设置**
3. **添加环境变量**：
   - 点击 Settings → Environment Variables
   - 逐个添加上述环境变量
   - 确保选择正确的环境（Production, Preview, Development）

### 6. 测试配置

#### 6.1 本地测试

```bash
# 使用测试脚本验证 Notion 连接
npm run test:notion

# 重启开发服务器
npm run dev

# 检查页面是否正常加载
curl http://localhost:3000/api/posts
```

测试脚本会检查：

- ✅ API Token 是否有效
- ✅ 数据库访问权限
- ✅ 数据库结构是否正确
- ✅ 内容获取是否正常

#### 6.2 生产环境测试

1. **触发部署**
   - 推送代码到 Git 仓库
   - 或在 Vercel 控制台手动触发部署

2. **检查构建日志**
   - 确认没有 Notion API 错误
   - 查看是否成功获取数据

## 🔍 故障排除

### 常见问题

1. **"NOTION_TOKEN environment variable is required"**
   - 检查环境变量是否正确设置
   - 确认 Token 格式正确（以 `secret_` 开头）

2. **"Notion API call failed"**
   - 确认集成已邀请到数据库
   - 检查数据库 ID 是否正确
   - 验证数据库权限设置

3. **"Database schema mismatch"**
   - 检查数据库字段名称和类型
   - 确保必需字段存在

### 调试技巧

1. **检查 API 响应**

   ```bash
   # 测试 Notion API 连接
   curl -H "Authorization: Bearer $NOTION_TOKEN" \
        -H "Notion-Version: 2022-06-28" \
        https://api.notion.com/v1/databases/$NOTION_DATABASE_ID
   ```

2. **查看服务器日志**
   - 本地：检查终端输出
   - Vercel：查看 Functions 日志

## 📚 数据库模板

为了快速开始，你可以复制以下 Notion 模板：

- [博客文章模板](https://www.notion.so/templates) - 包含完整的文章结构
- [书籍追踪模板](https://www.notion.so/templates) - 记录阅读进度
- [项目展示模板](https://www.notion.so/templates) - 展示个人项目

## 🚀 下一步

配置完成后，你的博客将能够：

- ✅ 从 Notion 数据库同步文章内容
- ✅ 自动更新文章状态和标签
- ✅ 显示实时的书籍和项目信息
- ✅ 生成动态的统计数据

如果遇到问题，请检查控制台日志或联系技术支持。
