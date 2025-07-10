# Algolia 搜索配置指南

本指南包含了完整的 Algolia 搜索配置步骤，从注册到集成的全过程。

## 目录

1. [快速开始](#快速开始)
2. [详细配置](#详细配置)
3. [功能特性](#功能特性)
4. [故障排除](#故障排除)

## 快速开始

### 第1步：注册 Algolia（2分钟）

1. 访问 https://www.algolia.com
2. 点击 "Start Free" 选择免费套餐
3. 使用 Google/GitHub 快速注册

### 第2步：创建应用（1分钟）

1. 登录后点击 "Create Application"
2. 名称填写：`my-blog`
3. 选择免费套餐和 Asia-Pacific 区域

### 第3步：获取密钥（1分钟）

进入应用后，点击左侧 "API Keys"，复制以下三个值：

- **Application ID**（页面顶部）
- **Search-Only API Key**（Public API keys 部分）
- **Admin API Key**（Admin API keys 部分，⚠️保密）

### 第4步：配置环境变量（1分钟）

#### 本地开发

编辑 `.env.local` 添加：

```env
# Algolia 配置
NEXT_PUBLIC_ALGOLIA_APP_ID=你复制的Application_ID
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=你复制的Search_Only_API_Key
ALGOLIA_ADMIN_API_KEY=你复制的Admin_API_Key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=posts
```

#### Vercel 生产环境

1. 进入 Vercel Dashboard → Settings → Environment Variables
2. 添加相同的4个环境变量

### 第5步：初始化搜索索引

```bash
# 构建搜索索引
npm run build-search-index
```

## 详细配置

### 索引配置

在 Algolia Dashboard 中配置索引设置：

1. **可搜索属性** (Searchable attributes)
   - title (ordered)
   - content (unordered)
   - tags (unordered)
   - author (unordered)

2. **自定义排序** (Custom Ranking)
   - searchPriority (desc)
   - date (desc)

3. **分面** (Facets)
   - type
   - tags
   - author

### 中文搜索优化

在索引设置中启用中文支持：

- Language: Chinese
- Remove stop words: Chinese
- Query languages: Chinese

## 功能特性

### 搜索功能

- 实时搜索（输入即搜）
- 搜索结果高亮
- 按类型筛选（文章、项目、书籍、工具）
- 按标签筛选
- 搜索历史记录

### 性能优化

- 防抖搜索（300ms延迟）
- 搜索结果缓存
- 智能预加载

### 用户体验

- 键盘快捷键（⌘K 或 Ctrl+K）
- ESC 关闭搜索
- 响应式设计
- 无障碍支持

## 故障排除

### 常见问题

**Q: 搜索没有结果？**
A: 检查以下几点：

1. 环境变量是否正确配置
2. 是否运行了 `npm run build-search-index`
3. Algolia Dashboard 中是否有数据

**Q: 搜索框不显示？**
A: 确保：

1. `NEXT_PUBLIC_ALGOLIA_APP_ID` 已设置
2. `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY` 已设置
3. 组件已正确导入

**Q: 中文搜索不准确？**
A: 在 Algolia Dashboard 中：

1. 设置 Language 为 Chinese
2. 启用中文分词
3. 调整 typo tolerance

### 调试技巧

```javascript
// 检查配置
console.log("Algolia配置:", {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,
  isConfigured: isAlgoliaConfigured(),
});
```

## 高级配置

### 自定义搜索逻辑

修改 `/lib/algolia/search.ts` 自定义搜索参数：

```typescript
const searchParams = {
  hitsPerPage: 20, // 每页结果数
  attributesToHighlight: ["title", "content"],
  highlightPreTag: "<mark>",
  highlightPostTag: "</mark>",
  facetFilters: filters, // 自定义筛选
};
```

### 同步策略

- 手动同步：`npm run build-search-index`
- 自动同步：在 CI/CD 中添加索引构建步骤
- 增量同步：监听内容变化，实时更新索引

---

**最后更新**：2025年1月11日  
**状态**：✅ 已配置并集成
