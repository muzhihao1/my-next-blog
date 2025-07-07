# 紧急修复清单

> 终端 C 代码审核后的紧急修复事项

## 🚨 紧急修复（必须立即处理）

### 0. ConvertKit API密钥安全漏洞（新发现）

**位置：** `/components/features/SubscribeForm.tsx` 第68行

**问题描述：**
- API密钥直接暴露在客户端代码中
- 使用环境变量 `NEXT_PUBLIC_CONVERTKIT_API_KEY` 仍会暴露密钥
- 任何人都可以通过浏览器开发工具查看API密钥

**修复方案：**

由于项目使用静态导出（output: 'export'），不能使用API路由。建议以下方案：

方案一：使用ConvertKit的公开表单提交（推荐）
```typescript
// 更新 SubscribeForm.tsx
// 使用ConvertKit的表单HTML嵌入方式，不需要API密钥
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  
  // 使用ConvertKit的表单提交端点（不需要API密钥）
  const response = await fetch(
    `https://app.convertkit.com/forms/${formId}/subscriptions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_address: email,
        fields: {},
        tags: []
      })
    }
  )
}
```

方案二：使用嵌入式ConvertKit表单
```typescript
// 直接嵌入ConvertKit提供的HTML表单代码
// 这是最安全的方式，不暴露任何API密钥
<div dangerouslySetInnerHTML={{
  __html: `<!-- ConvertKit Form -->`
}} />
```

方案三：暂时禁用订阅功能
```typescript
// 显示提示信息
<div className="text-center text-gray-600">
  订阅功能正在升级中，请稍后再试
</div>
```

**重要提示：** 
- 绝对不要在客户端代码中使用API密钥
- 移除所有 `NEXT_PUBLIC_CONVERTKIT_API_KEY` 相关的环境变量
- 如需服务端功能，考虑使用Vercel Functions或其他无服务器方案

### 1. 搜索功能失效问题

**问题描述：**
- `/components/features/Search.tsx` 调用了不存在的 `/api/search` 端点
- 终端 B 已移除所有 API 路由以支持静态导出
- 当前搜索功能完全无法使用

**修复方案：**

方案一：实现客户端搜索（推荐）
```typescript
// 在 Search.tsx 中直接导入数据并在客户端搜索
import { fallbackPosts } from '@/lib/fallback-posts'
import { fallbackProjects } from '@/lib/fallback-projects'
import { fallbackBooks } from '@/lib/fallback-books'
import { fallbackTools } from '@/lib/fallback-tools'
import Fuse from 'fuse.js'

// 在组件内部实现搜索逻辑
const searchData = useMemo(() => {
  // 合并所有数据
  const allData = [
    ...fallbackPosts.map(post => ({...})),
    ...fallbackProjects.map(project => ({...})),
    // ...
  ]
  
  return new Fuse(allData, {
    keys: ['title', 'content'],
    threshold: 0.3
  })
}, [])
```

方案二：暂时禁用搜索功能
```typescript
// 在 Header.tsx 中注释掉 Search 组件
// import { Search } from '@/components/features/Search'
// <Search />
```

### 2. ToolCard.tsx 缺少客户端指令

**位置：** `/components/features/ToolCard.tsx`

**修复：** 在文件顶部添加
```typescript
'use client'
```

### 3. 书架页面未使用 Notion 数据

**位置：** `/app/bookshelf/page.tsx`

**当前代码：**
```typescript
const books = fallbackBooks
```

**修复为：**
```typescript
try {
  const books = await getBooks()
  // ...
} catch (error) {
  console.error('Failed to fetch books:', error)
  const books = fallbackBooks
  // ...
}
```

## ⚠️ 重要修复（构建后处理）

### 1. 主页项目图片属性错误

**位置：** `/app/page.tsx` 第 58 行

**修复：**
```typescript
// 将 project.image 改为 project.thumbnail
src={project.thumbnail || '/placeholder.jpg'}
```

### 2. 统一代码风格

**书架系统需要补充：**

1. 添加 JSDoc 注释
```typescript
/**
 * 获取所有书籍数据
 * @returns {Promise<Book[]>} 书籍列表
 */
export async function getBooks(): Promise<Book[]> {
  // ...
}
```

2. 添加缓存机制（参考 tools.ts）
```typescript
const BOOKS_CACHE_KEY = 'books_cache'
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '3600000')

let booksCache: { data: Book[], timestamp: number } | null = null

export async function getBooks(): Promise<Book[]> {
  // 检查缓存
  if (booksCache && Date.now() - booksCache.timestamp < CACHE_TTL) {
    return booksCache.data
  }
  
  // ... 获取数据逻辑
  
  // 更新缓存
  booksCache = { data: books, timestamp: Date.now() }
  return books
}
```

### 3. 添加错误用户提示

在 Search.tsx 中添加用户友好的错误提示：
```typescript
catch (error) {
  console.error('Search error:', error)
  setResults([])
  // 添加错误提示
  setError('搜索时出现错误，请稍后重试')
}
```

## 📝 代码规范建议

### 1. TypeScript 类型

- 避免使用 `any` 类型
- 为所有函数参数和返回值添加类型
- 使用接口定义复杂对象类型

### 2. 组件规范

- 客户端组件必须添加 `'use client'` 指令
- 服务器组件不应包含客户端逻辑
- 使用 Suspense 处理加载状态

### 3. 错误处理

- 所有异步操作必须有 try-catch
- 提供用户友好的错误消息
- 记录详细的错误日志

### 4. 性能优化

- 使用缓存减少 API 调用
- 实现图片懒加载
- 使用代码分割优化包大小

## 🔧 修复优先级

1. **立即修复**（影响功能/安全）
   - [ ] **ConvertKit API密钥安全漏洞**（新发现 - 严重）
   - [x] 搜索功能失效（已由终端A修复）
   - [x] ToolCard.tsx 缺少指令（已修复）
   - [x] 书架页面数据获取（已修复）

2. **尽快修复**（影响质量）
   - [ ] 主页项目图片属性
   - [ ] 添加缺失的 JSDoc 注释
   - [ ] 统一错误处理

3. **计划修复**（改进体验）
   - [ ] 为书架系统添加缓存
   - [ ] 优化搜索体验
   - [ ] 完善加载状态

## 📋 验证清单

修复完成后，请验证：

- [x] `npm run build` 构建成功（38个静态页面）
- [x] `npm run lint` 无错误
- [x] 搜索功能正常工作
- [x] 所有页面正确加载数据
- [ ] 深色模式切换正常
- [ ] 移动端响应式正常
- [ ] 订阅功能安全性修复

---

*由终端 C 创建于 2025-01-07*
*更新于 2025-01-07 - 发现API密钥安全漏洞*