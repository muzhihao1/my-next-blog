# Algolia 搜索配置指南

本指南将帮助您完成 Algolia 搜索服务的配置，让博客拥有强大的中文搜索功能。

## 目录

1. [注册 Algolia 账号](#1-注册-algolia-账号)
2. [创建应用和索引](#2-创建应用和索引)
3. [获取 API 密钥](#3-获取-api-密钥)
4. [配置环境变量](#4-配置环境变量)
5. [初始化搜索索引](#5-初始化搜索索引)
6. [测试搜索功能](#6-测试搜索功能)

## 1. 注册 Algolia 账号

### 步骤 1.1：访问 Algolia 官网
访问 [https://www.algolia.com](https://www.algolia.com)

### 步骤 1.2：选择免费套餐
1. 点击 "Start Free" 或 "Get Started"
2. 选择 "Community" 免费套餐（每月 10,000 次搜索请求）
3. 对于个人博客来说，免费额度完全够用

### 步骤 1.3：完成注册
1. 使用 Google/GitHub 账号快速注册
2. 或使用邮箱注册
3. 验证邮箱地址

## 2. 创建应用和索引

### 步骤 2.1：创建新应用
登录后，在 Dashboard 中：

1. 点击 "Create Application"
2. 填写应用信息：
   - **Application Name**: `my-blog` (或您喜欢的名称)
   - **Subscription**: 选择 "Free"
   - **Region**: 选择 "Asia-Pacific" (靠近中国，延迟更低)

### 步骤 2.2：创建搜索索引
1. 进入应用后，点击 "Create Index"
2. **Index name**: `posts` (必须使用这个名称，代码中已配置)
3. 点击 "Create"

## 3. 获取 API 密钥

### 步骤 3.1：访问 API Keys 页面
在应用 Dashboard 中，点击左侧菜单的 "API Keys"

### 步骤 3.2：复制所需密钥
您需要复制以下三个密钥：

1. **Application ID**
   - 位于页面顶部
   - 格式类似：`ABCDEF1234`

2. **Search-Only API Key** 
   - 在 "Public API keys" 部分
   - 用于前端搜索，安全公开
   - 格式类似：`1234567890abcdef1234567890abcdef`

3. **Admin API Key**
   - 在 "Admin API keys" 部分
   - ⚠️ 保密！仅用于服务端
   - 用于创建、更新、删除索引数据

## 4. 配置环境变量

### 步骤 4.1：本地开发环境
编辑 `.env.local` 文件，添加以下配置：

```env
# Algolia 配置
NEXT_PUBLIC_ALGOLIA_APP_ID=你的_Application_ID
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=你的_Search_Only_API_Key
ALGOLIA_ADMIN_API_KEY=你的_Admin_API_Key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=posts
```

### 步骤 4.2：Vercel 生产环境
1. 登录 Vercel Dashboard
2. 进入您的项目
3. 点击 "Settings" → "Environment Variables"
4. 添加相同的环境变量：
   - 添加时选择环境：Production, Preview, Development
   - 确保名称和值正确

## 5. 初始化搜索索引

### 步骤 5.1：运行索引脚本
我们已经为您准备了索引初始化脚本：

```bash
# 确保环境变量已配置
npm run build-search-index
```

如果脚本不存在，请手动创建：

```bash
# 创建脚本文件
touch scripts/build-search-index.js
```

### 步骤 5.2：脚本内容
```javascript
// scripts/build-search-index.js
require('dotenv').config({ path: '.env.local' })
const algoliasearch = require('algoliasearch')

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
)

const index = client.initIndex('posts')

async function buildSearchIndex() {
  try {
    console.log('开始构建搜索索引...')
    
    // 从您的数据源获取文章
    // 这里需要连接到 Notion 或 Supabase
    const posts = await fetchAllPosts()
    
    // 转换为 Algolia 格式
    const objects = posts.map(post => ({
      objectID: post.id,
      title: post.title,
      content: post.content.substring(0, 5000), // 限制内容长度
      excerpt: post.excerpt,
      author: post.author,
      tags: post.tags,
      date: post.date,
      slug: post.slug,
      readingTime: post.readingTime,
      _tags: post.tags, // 用于 faceting
    }))
    
    // 配置索引设置
    await index.setSettings({
      searchableAttributes: [
        'title',
        'content',
        'excerpt',
        'tags',
        'author'
      ],
      attributesToRetrieve: [
        'objectID',
        'title',
        'excerpt',
        'author',
        'date',
        'tags',
        'slug',
        'readingTime'
      ],
      customRanking: ['desc(date)'],
      attributesForFaceting: ['tags', 'author'],
      // 中文分词优化
      queryLanguages: ['zh'],
      indexLanguages: ['zh'],
      // 高亮设置
      attributesToHighlight: ['title', 'content', 'excerpt'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    })
    
    // 批量上传数据
    await index.saveObjects(objects)
    
    console.log(`成功索引 ${objects.length} 篇文章`)
  } catch (error) {
    console.error('索引构建失败:', error)
    process.exit(1)
  }
}

buildSearchIndex()
```

### 步骤 5.3：添加 npm 脚本
在 `package.json` 中添加：

```json
{
  "scripts": {
    "build-search-index": "node scripts/build-search-index.js"
  }
}
```

## 6. 测试搜索功能

### 步骤 6.1：本地测试
1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 访问搜索页面或使用搜索框
3. 输入关键词测试搜索功能

### 步骤 6.2：检查 Algolia Dashboard
1. 在 Algolia Dashboard 查看索引数据
2. 使用 "Browse" 功能查看索引内容
3. 使用 "Search" 测试搜索查询

### 步骤 6.3：监控使用情况
- 在 Dashboard 查看搜索请求统计
- 监控搜索性能和热门搜索词
- 根据数据优化搜索配置

## 常见问题

### Q1: 搜索中文效果不好？
**解决方案**：
1. 确保索引设置中包含中文语言配置
2. 考虑使用自定义分词
3. 优化 searchableAttributes 权重

### Q2: 搜索结果不准确？
**解决方案**：
1. 调整 customRanking 规则
2. 优化 searchableAttributes 顺序
3. 使用 typoTolerance 设置

### Q3: 如何实现搜索建议？
**解决方案**：
```javascript
// 使用 Query Suggestions
index.search('', {
  query: userInput,
  hitsPerPage: 5,
  attributesToRetrieve: ['title'],
})
```

### Q4: 如何优化搜索性能？
**建议**：
1. 使用 `attributesToRetrieve` 限制返回字段
2. 实现搜索结果缓存
3. 使用防抖减少请求频率

## 高级配置

### 同义词设置
```javascript
index.saveSynonyms([
  {
    objectID: 'react-synonym',
    type: 'synonym',
    synonyms: ['react', 'reactjs', 'react.js']
  }
])
```

### 搜索规则
```javascript
index.saveRules([
  {
    objectID: 'promote-latest',
    condition: {
      pattern: 'latest',
      anchoring: 'contains'
    },
    consequence: {
      params: {
        customRanking: ['desc(date)']
      }
    }
  }
])
```

### 个性化设置
- 启用 Personalization 功能
- 配置用户偏好追踪
- 实现个性化搜索结果

## 安全建议

1. **永远不要在前端暴露 Admin API Key**
2. **使用 API Key 限制**：
   - 限制 referrer
   - 设置 IP 白名单
   - 配置请求速率限制

3. **定期轮换 API Keys**
4. **监控异常使用模式**

## 下一步

配置完成后：

1. ✅ 环境变量已配置
2. ✅ 索引数据已上传
3. ✅ 搜索功能已测试

您可以：
- 在前端启用搜索组件
- 自定义搜索 UI
- 添加搜索分析
- 优化搜索体验

---

**需要帮助？**
- [Algolia 官方文档](https://www.algolia.com/doc/)
- [Algolia 中文社区](https://github.com/algolia/algoliasearch-client-javascript)
- [React InstantSearch 文档](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/)

祝您配置顺利！🎉