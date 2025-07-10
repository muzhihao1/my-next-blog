# 数据库 ID 修复指南

## 📋 问题概述

构建过程中发现代码使用的 Notion 数据库 ID 与实际创建的数据库 ID 不匹配，需要更新以下配置。

## 🔧 需要更新的数据库 ID

### 正确的数据库 ID（已通过 Notion MCP 创建）

```bash
# 博客文章数据库
NOTION_DATABASE_ID=21f1b640-00a7-808c-8b4f-c4ef924cfb64

# 书架数据库
NOTION_BOOKSHELF_DATABASE_ID=2291b640-00a7-81fa-88f4-f255c0f58e1a

# 项目展示数据库
NOTION_PROJECTS_DATABASE_ID=2291b640-00a7-8173-a212-e31b954226fc

# 工具推荐数据库
NOTION_TOOLS_DATABASE_ID=2291b640-00a7-8125-b4fa-c42b466d80bd
```

## 📁 需要更新的文件

### 1. 环境变量文件

- **文件**: `.env.local`
- **操作**: 更新所有数据库 ID 为上述正确值

### 2. 代码文件（根据构建错误）

#### `/lib/notion/bookshelf.ts`

- **错误 ID**: `2291b640-00a7-8092-b25a-e5e78b975dac`
- **正确 ID**: `2291b640-00a7-81fa-88f4-f255c0f58e1a`

#### `/lib/notion/projects.ts`

- **错误**: 字段名 "Featured" 应为 "featured"（小写）
- **错误**: 字段名 "StartDate" 应为 "startDate"（驼峰命名）

#### `/lib/notion/tools.ts`

- **错误**: 字段名 "Featured" 应为 "featured"（小写）

## 🚀 修复步骤

### 步骤 1：更新环境变量

```bash
# 1. 复制环境变量模板
cp .env.example .env.local

# 2. 编辑 .env.local，填入正确的数据库 ID
```

### 步骤 2：修复字段名称

在以下文件中将字段名更新为正确的格式：

- `Featured` → `featured`
- `StartDate` → `startDate`

### 步骤 3：验证修复

```bash
# 1. 测试 Notion 连接
npm run test:notion

# 2. 重新构建项目
npm run build

# 3. 本地测试
npm run dev
```

## ⚠️ 注意事项

1. **大小写敏感**: Notion API 对字段名大小写敏感，确保与数据库中的字段名完全匹配
2. **环境变量**: 确保 `.env.local` 文件包含所有必需的数据库 ID
3. **缓存清理**: 如果修改后仍有问题，可能需要清理缓存

## 📝 检查清单

- [ ] 更新 `.env.local` 中的所有数据库 ID
- [ ] 修复 `bookshelf.ts` 中的数据库 ID
- [ ] 修复 `projects.ts` 中的字段名
- [ ] 修复 `tools.ts` 中的字段名
- [ ] 运行构建命令验证修复
- [ ] 测试所有页面功能正常

## 🔍 验证方法

修复完成后，访问以下页面确认功能正常：

- `/` - 首页（博客文章列表）
- `/bookshelf` - 书架页面
- `/projects` - 项目展示页面
- `/tools` - 工具推荐页面
- `/year-in-review` - 年度总结页面

---

_创建时间：2025-01-08_
_终端 C 质量保证_
