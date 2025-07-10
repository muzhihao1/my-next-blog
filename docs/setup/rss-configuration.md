# RSS 订阅配置指南

本文档说明博客的RSS订阅功能配置和使用方法。

## 📡 功能概述

博客支持三种订阅格式：

- **RSS 2.0** - 最广泛支持的标准格式 (`/rss.xml`)
- **Atom 1.0** - 现代化的XML订阅格式 (`/atom.xml`)
- **JSON Feed 1.1** - 面向开发者的JSON格式 (`/feed.json`)

## 🔧 配置说明

### 1. 环境变量配置

在 `.env.local` 中设置基础URL：

```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. RSS配置参数

在 `/lib/rss.ts` 中的 `getRSSConfig()` 函数配置：

```typescript
{
  title: '无题之墨',              // 博客标题
  description: '分享技术见解...',   // 博客描述
  siteUrl: baseUrl,               // 网站URL
  feedUrl: `${baseUrl}/rss.xml`,  // Feed URL
  language: 'zh-CN',              // 语言
  copyright: '© 2025 ...',        // 版权信息
  author: {
    name: 'Zhihao Mu',           // 作者名称
    email: 'your-email@example.com' // 作者邮箱
  }
}
```

## 🚀 实现细节

### 文件结构

```
/lib/rss.ts                 # RSS生成器核心逻辑
/app/rss.xml/route.ts      # RSS 2.0 动态路由
/app/atom.xml/route.ts     # Atom 1.0 动态路由
/app/feed.json/route.ts    # JSON Feed 动态路由
```

### 功能特性

1. **动态生成**：使用Next.js Route Handlers动态生成，确保内容最新
2. **静态缓存**：设置了缓存头，提高性能
3. **错误处理**：API失败时返回空但有效的Feed
4. **内容限制**：默认只包含最新20篇文章
5. **XML转义**：正确处理特殊字符，避免XML解析错误

### 数据来源

所有Feed数据来自 `getAllPosts()` 函数，包含：

- 文章标题
- 文章链接
- 发布日期
- 作者信息
- 文章摘要
- 分类和标签

## 📖 使用方法

### 订阅地址

- RSS 2.0: `https://yourdomain.com/rss.xml`
- Atom 1.0: `https://yourdomain.com/atom.xml`
- JSON Feed: `https://yourdomain.com/feed.json`

### 在页面中显示

订阅链接已集成在：

- `/app/subscribe/page.tsx` - 专门的订阅页面
- 页面头部的 `<link>` 标签（自动发现）

### 推荐的RSS阅读器

1. **Feedly** - 流行的在线RSS阅读器
2. **Inoreader** - 功能强大的RSS服务
3. **NetNewsWire** - Mac和iOS原生应用
4. **Reeder** - 优雅的阅读体验

## 🛠️ 自定义扩展

### 添加自定义字段

在对应的route文件中修改item生成逻辑：

```typescript
// 例如添加封面图片
<enclosure url="${post.coverImage}" type="image/jpeg" />
```

### 修改文章数量

修改 `.slice(0, 20)` 中的数字：

```typescript
posts.slice(0, 50); // 包含最新50篇文章
```

### 添加全文内容

将 `post.excerpt` 替换为 `post.content`：

```typescript
<description>${escapeXml(post.content)}</description>
```

## 🔍 验证和测试

### 验证Feed格式

使用在线验证工具：

- RSS/Atom: https://validator.w3.org/feed/
- JSON Feed: https://validator.jsonfeed.org/

### 本地测试

```bash
# 启动开发服务器
npm run dev

# 访问Feed
curl http://localhost:3000/rss.xml
curl http://localhost:3000/atom.xml
curl http://localhost:3000/feed.json
```

## 📝 注意事项

1. **时区处理**：所有日期使用ISO 8601格式，确保跨时区兼容
2. **字符编码**：所有Feed使用UTF-8编码
3. **缓存策略**：设置了1小时的缓存，平衡性能和实时性
4. **SEO优化**：在页面head中添加了自动发现标签

## 🚨 故障排除

### Feed为空

检查：

1. Notion API配置是否正确
2. 是否有已发布的文章
3. 查看服务器日志中的错误信息

### 编码问题

确保：

1. 所有内容正确转义XML特殊字符
2. 响应头设置正确的charset=utf-8

### 更新延迟

由于缓存设置，更新可能延迟最多1小时。可以：

1. 清除CDN缓存
2. 使用查询参数绕过缓存：`/rss.xml?t=时间戳`

---

_更新日期：2025-01-07_
