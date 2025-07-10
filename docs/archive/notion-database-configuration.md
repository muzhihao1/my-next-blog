# Notion 数据库配置详细指南

本文档提供了完整的 Notion 数据库配置指南，包括数据库结构、字段定义、API 集成和最佳实践。

## 📊 数据库架构概览

本博客系统使用 4 个主要的 Notion 数据库：

1. **博客文章数据库** - 存储所有博客内容
2. **书籍数据库** - 管理书架功能
3. **项目数据库** - 展示个人项目
4. **工具数据库** - 推荐工具集合

## 🗂️ 数据库详细配置

### 1. 博客文章数据库 (Blog Posts Database)

#### 必需字段

| 字段名称 | Notion 属性类型 | 属性名（英文） | 说明         | 示例                  |
| -------- | --------------- | -------------- | ------------ | --------------------- |
| 标题     | Title           | Title          | 文章标题     | "Next.js 15 深度解析" |
| 发布状态 | Checkbox        | Published      | 是否发布     | ✓                     |
| 发布日期 | Date            | Date           | 文章发布日期 | 2025-01-07            |
| 作者姓名 | Text            | AuthorName     | 作者名称     | "Zhihao Mu"           |
| 分类     | Select          | Category       | 文章分类     | "Technology"          |
| 标签     | Multi-select    | Tags           | 文章标签     | ["React", "Web开发"]  |

#### 可选字段

| 字段名称 | Notion 属性类型 | 属性名（英文） | 说明          | 示例                              |
| -------- | --------------- | -------------- | ------------- | --------------------------------- |
| URL别名  | Text            | Slug           | 自定义URL路径 | "nextjs-15-deep-dive"             |
| 摘要     | Text            | Excerpt        | 文章摘要      | "深入探讨 Next.js 15 的新特性..." |
| 阅读时间 | Text            | ReadTime       | 预计阅读时间  | "8 min read"                      |
| 作者头像 | URL             | AuthorAvatar   | 作者头像URL   | https://example.com/avatar.jpg    |
| 封面图   | Files & media   | Cover          | 文章封面图    | 上传图片                          |

#### 分类选项配置

在 Category 字段中创建以下选项：

- Technology（技术）
- Design（设计）
- Product（产品）
- Life（生活）
- Learning（学习）

### 2. 书籍数据库 (Books Database)

#### 必需字段

| 字段名称 | Notion 属性类型 | 属性名（英文） | 说明        | 示例                 |
| -------- | --------------- | -------------- | ----------- | -------------------- |
| 书名     | Title           | Title          | 书籍标题    | "深入理解计算机系统" |
| 作者     | Text            | Author         | 书籍作者    | "Randal E. Bryant"   |
| 状态     | Select          | Status         | 阅读状态    | "已读"               |
| 评分     | Number          | Rating         | 评分（1-5） | 5                    |
| 发布状态 | Checkbox        | Published      | 是否显示    | ✓                    |

#### 可选字段

| 字段名称 | Notion 属性类型 | 属性名（英文） | 说明         | 示例                 |
| -------- | --------------- | -------------- | ------------ | -------------------- |
| 封面     | Files & media   | Cover          | 书籍封面     | 上传图片             |
| 标签     | Multi-select    | Tags           | 书籍标签     | ["计算机", "系统"]   |
| 阅读日期 | Date            | ReadDate       | 完成阅读日期 | 2025-01-01           |
| 笔记     | Text            | Notes          | 读书笔记     | "这本书深入浅出..."  |
| 购买链接 | URL             | PurchaseLink   | 购买链接     | https://book.com/xxx |

#### 状态选项配置

在 Status 字段中创建以下选项：

- 想读 (Want to Read)
- 在读 (Reading)
- 已读 (Read)
- 未完成 (Did Not Finish)

### 3. 项目数据库 (Projects Database)

#### 必需字段

| 字段名称 | Notion 属性类型 | 属性名（英文） | 说明     | 示例                      |
| -------- | --------------- | -------------- | -------- | ------------------------- |
| 项目名称 | Title           | Title          | 项目标题 | "个人博客系统"            |
| 描述     | Text            | Description    | 项目描述 | "基于 Next.js 的现代博客" |
| 状态     | Select          | Status         | 项目状态 | "已完成"                  |
| 发布状态 | Checkbox        | Published      | 是否展示 | ✓                         |

#### 可选字段

| 字段名称 | Notion 属性类型 | 属性名（英文） | 说明       | 示例                      |
| -------- | --------------- | -------------- | ---------- | ------------------------- |
| 技术栈   | Multi-select    | TechStack      | 使用的技术 | ["Next.js", "TypeScript"] |
| 链接     | URL             | Link           | 项目链接   | https://github.com/xxx    |
| 演示链接 | URL             | DemoLink       | 在线演示   | https://demo.com          |
| 封面图   | Files & media   | Cover          | 项目截图   | 上传图片                  |
| 开始日期 | Date            | StartDate      | 开始时间   | 2024-12-01                |
| 完成日期 | Date            | EndDate        | 完成时间   | 2025-01-07                |
| URL别名  | Text            | Slug           | 自定义URL  | "personal-blog"           |

### 4. 工具数据库 (Tools Database)

#### 必需字段

| 字段名称 | Notion 属性类型 | 属性名（英文） | 说明     | 示例                 |
| -------- | --------------- | -------------- | -------- | -------------------- |
| 工具名称 | Title           | Title          | 工具名称 | "Visual Studio Code" |
| 分类     | Select          | Category       | 工具分类 | "开发工具"           |
| 描述     | Text            | Description    | 工具描述 | "强大的代码编辑器"   |
| 发布状态 | Checkbox        | Published      | 是否展示 | ✓                    |

#### 可选字段

| 字段名称 | Notion 属性类型 | 属性名（英文） | 说明      | 示例                          |
| -------- | --------------- | -------------- | --------- | ----------------------------- |
| 链接     | URL             | Link           | 官网链接  | https://code.visualstudio.com |
| 价格     | Select          | Pricing        | 价格类型  | "免费"                        |
| 图标     | Files & media   | Icon           | 工具图标  | 上传图片                      |
| 标签     | Multi-select    | Tags           | 工具标签  | ["编辑器", "开源"]            |
| 平台     | Multi-select    | Platforms      | 支持平台  | ["macOS", "Windows", "Linux"] |
| URL别名  | Text            | Slug           | 自定义URL | "visual-studio-code"          |

#### 分类选项配置

在 Category 字段中创建以下选项：

- 开发工具 (Development)
- 设计工具 (Design)
- 生产力工具 (Productivity)
- 硬件设备 (Hardware)
- 云服务 (Cloud Services)

## 🔐 API 集成配置

### 1. 创建 Notion 集成

```javascript
// 访问 https://www.notion.so/my-integrations
// 创建新集成，获取 API Token
```

### 2. 数据库权限设置

对每个数据库执行以下操作：

1. 打开数据库页面
2. 点击右上角 "Share" 按钮
3. 搜索并添加你的集成
4. 设置权限为 "Can read"（只读）或 "Can edit"（读写）

### 3. 获取数据库 ID

数据库 URL 格式：

```
https://www.notion.so/workspace/[DATABASE_ID]?v=[VIEW_ID]
```

提取 DATABASE_ID（32位字符串）

### 4. 环境变量配置

创建 `.env.local` 文件：

```bash
# 核心配置
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 其他数据库
NOTION_BOOKS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PROJECTS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_TOOLS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 缓存配置
CACHE_TTL=3600000  # 1小时

# 站点配置
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 🧪 API 连接测试

### 使用代码测试连接

```javascript
// test-notion-connection.js
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function testConnection() {
  try {
    // 测试获取用户信息
    const users = await notion.users.list({});
    console.log("✅ API 连接成功！");
    console.log(`找到 ${users.results.length} 个用户`);

    // 测试查询数据库
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID,
    });
    console.log("✅ 数据库连接成功！");
    console.log(`数据库名称: ${database.title[0]?.plain_text}`);
  } catch (error) {
    console.error("❌ 连接失败:", error.message);
  }
}

testConnection();
```

### 使用 cURL 测试

```bash
# 测试 API Token
curl -X GET 'https://api.notion.com/v1/users' \
  -H 'Authorization: Bearer YOUR_NOTION_TOKEN' \
  -H 'Notion-Version: 2022-06-28'

# 测试数据库访问
curl -X GET 'https://api.notion.com/v1/databases/YOUR_DATABASE_ID' \
  -H 'Authorization: Bearer YOUR_NOTION_TOKEN' \
  -H 'Notion-Version: 2022-06-28'
```

## 📝 数据填充最佳实践

### 1. 文章内容格式

- 使用 Notion 的富文本编辑器编写内容
- 支持的格式：标题、段落、列表、代码块、引用、图片等
- 代码块请指定语言以获得语法高亮

### 2. 图片处理

- **封面图推荐尺寸**: 1200x630px（社交分享优化）
- **支持格式**: JPG, PNG, WebP
- **存储方式**:
  - 直接上传到 Notion（推荐）
  - 使用外部图床链接

### 3. URL 别名（Slug）规范

- 使用小写字母和连字符
- 避免中文和特殊字符
- 示例: `nextjs-15-new-features`

### 4. 标签管理

- 保持标签简洁（2-3个词）
- 使用统一的命名规范
- 定期整理合并相似标签

## 🚨 常见问题解决

### 1. "未找到数据库" 错误

**原因**: 集成未被邀请到数据库
**解决**: 在数据库设置中添加集成

### 2. "权限不足" 错误

**原因**: 集成权限设置不正确
**解决**: 确保集成有 "Can read" 权限

### 3. 字段类型不匹配

**原因**: Notion 属性类型与代码期望不符
**解决**: 检查并更正属性类型

### 4. 数据未显示

**检查清单**:

- [ ] Published 字段是否勾选
- [ ] 日期字段是否正确填写
- [ ] 必需字段是否都已填写

## 🔄 数据同步策略

### 1. 增量更新

- 使用 `last_edited_time` 字段追踪更改
- 只同步最近修改的内容

### 2. 缓存策略

```javascript
// 缓存配置
const CACHE_TTL = process.env.CACHE_TTL || 3600000; // 1小时
```

### 3. Webhook 集成（高级）

可以配置 Notion Webhook 实现实时更新：

- 内容更改时自动触发构建
- 减少 API 调用次数

## 📋 迁移清单

从其他 CMS 迁移到 Notion 时：

1. **准备数据**
   - [ ] 导出现有内容
   - [ ] 整理分类和标签
   - [ ] 准备图片资源

2. **创建数据库**
   - [ ] 按照上述结构创建数据库
   - [ ] 设置所有必需字段
   - [ ] 配置选项值

3. **导入数据**
   - [ ] 使用 Notion API 批量导入
   - [ ] 或手动创建页面
   - [ ] 验证数据完整性

4. **测试集成**
   - [ ] 配置环境变量
   - [ ] 测试 API 连接
   - [ ] 验证前端显示

## 🎯 性能优化建议

1. **合理使用缓存**: 设置适当的 TTL 值
2. **限制查询字段**: 只请求需要的属性
3. **分页加载**: 大量数据时使用分页
4. **静态生成**: 利用 Next.js 的 SSG 特性

## 📚 相关资源

- [Notion API 官方文档](https://developers.notion.com/)
- [Notion SDK for JavaScript](https://github.com/makenotion/notion-sdk-js)
- [项目 GitHub 仓库](https://github.com/your-repo)

---

_最后更新: 2025-01-07_
