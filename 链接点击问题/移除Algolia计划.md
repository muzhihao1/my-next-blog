# 移除 Algolia 搜索 - 实施计划

## 🎯 目标

完全移除 Algolia 搜索功能，使用本地搜索替代，解决链接点击问题的根本原因。

## 📋 影响分析

### 需要移除的文件
1. `/components/search/AlgoliaSearch.tsx` - 主搜索组件
2. `/lib/algolia/client.ts` - Algolia 客户端配置
3. `/lib/algolia/migration.ts` - 迁移相关代码
4. `/lib/algolia/transform.ts` - 数据转换逻辑
5. `/hooks/useAlgoliaSearch.ts` - 搜索 Hook
6. `/app/api/search/algolia/route.ts` - API 路由
7. `/app/api/search/algolia/__tests__/route.test.ts` - 测试文件
8. `/app/admin/search-migration/page.tsx` - 管理页面
9. `/scripts/sync-algolia.ts` - 同步脚本
10. `/scripts/build-search-index*.js` - 所有搜索索引构建脚本

### 需要修改的文件
1. `/components/layout/Header.tsx` - 移除 AlgoliaSearch 组件引用
2. `/package.json` - 移除 algoliasearch 依赖和相关脚本
3. `/lib/hooks/useDebounce.ts` - 检查是否还有其他地方使用

### 需要移除的依赖
- `algoliasearch`

### 需要移除的环境变量
- `ALGOLIA_APP_ID`
- `ALGOLIA_API_KEY`
- `ALGOLIA_SEARCH_KEY`
- `ALGOLIA_INDEX_NAME`

## 🛠️ 实施步骤

### 第一步：创建本地搜索组件

```typescript
// components/search/LocalSearch.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SearchResult {
  id: string
  title: string
  description: string
  url: string
  date: string
  author: string
  tags: string[]
}

export function LocalSearch({ className = '', placeholder = '搜索文章...' }: { className?: string; placeholder?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchIndex, setSearchIndex] = useState<SearchResult[]>([])
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // 加载搜索索引
  useEffect(() => {
    fetch('/search-index.json')
      .then(res => res.json())
      .then(data => setSearchIndex(data))
      .catch(err => console.error('Failed to load search index:', err))
  }, [])

  // 执行本地搜索
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchTerm = query.toLowerCase()
    const filtered = searchIndex.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
    
    setResults(filtered.slice(0, 10))
  }, [query, searchIndex])

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    router.push(result.url)
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* 搜索按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-secondary hover:text-foreground bg-background-secondary hover:bg-background-tertiary rounded-lg transition-colors"
        aria-label="搜索"
      >
        <MagnifyingGlassIcon className="w-4 h-4" />
        <span className="hidden sm:inline">搜索</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-foreground-tertiary bg-background border border-border rounded">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* 搜索弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-overlay z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* 搜索面板 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-background border border-border rounded-lg shadow-lg z-50"
            >
              {/* 搜索输入 */}
              <div className="flex items-center p-4 border-b border-border">
                <MagnifyingGlassIcon className="w-5 h-5 text-foreground-secondary mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground-tertiary"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 hover:bg-background-secondary rounded transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-foreground-secondary" />
                  </button>
                )}
              </div>

              {/* 搜索结果 */}
              <div className="max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-3 hover:bg-background-secondary transition-colors text-left"
                      >
                        <h4 className="font-medium text-foreground mb-1">
                          {result.title}
                        </h4>
                        {result.description && (
                          <p className="text-sm text-foreground-secondary line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-foreground-tertiary">
                          {result.date && (
                            <span>{new Date(result.date).toLocaleDateString('zh-CN')}</span>
                          )}
                          {result.author && <span>{result.author}</span>}
                          {result.tags && result.tags.length > 0 && (
                            <span>{result.tags.slice(0, 3).join(', ')}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query ? (
                  <div className="p-8 text-center text-foreground-secondary">
                    没有找到相关结果
                  </div>
                ) : (
                  <div className="p-8 text-center text-foreground-secondary">
                    输入关键词开始搜索
                  </div>
                )}
              </div>

              {/* 搜索提示 */}
              <div className="px-4 py-2 border-t border-border text-xs text-foreground-tertiary">
                <span>按 ESC 关闭</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### 第二步：创建搜索索引生成脚本

```javascript
// scripts/build-local-search-index.js
const { NotionAPI } = require('@notionhq/client')
const fs = require('fs').promises
const path = require('path')

const notion = new NotionAPI({
  auth: process.env.NOTION_TOKEN
})

async function buildSearchIndex() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID
    const results = []
    
    // 获取所有文章
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Status',
        select: {
          equals: 'Published'
        }
      }
    })
    
    for (const page of response.results) {
      const id = page.id
      const properties = page.properties
      
      results.push({
        id,
        title: properties.Title?.title[0]?.plain_text || '',
        description: properties.Description?.rich_text[0]?.plain_text || '',
        url: `/posts/${id}`,
        date: properties.Date?.date?.start || '',
        author: properties.Author?.select?.name || '',
        tags: properties.Tags?.multi_select?.map(tag => tag.name) || []
      })
    }
    
    // 保存到 public 目录
    const indexPath = path.join(process.cwd(), 'public', 'search-index.json')
    await fs.writeFile(indexPath, JSON.stringify(results, null, 2))
    
    console.log(`✅ 搜索索引已生成，包含 ${results.length} 篇文章`)
  } catch (error) {
    console.error('❌ 生成搜索索引失败:', error)
    process.exit(1)
  }
}

buildSearchIndex()
```

### 第三步：更新 Header 组件

```typescript
// components/layout/Header.tsx
import { LocalSearch } from '@/components/search/LocalSearch'

// 替换 AlgoliaSearch 为 LocalSearch
```

### 第四步：更新构建流程

```json
// package.json
{
  "scripts": {
    "build": "npm run build:search && next build",
    "build:search": "node scripts/build-local-search-index.js"
  }
}
```

### 第五步：清理工作

1. 删除所有 Algolia 相关文件
2. 移除 algoliasearch 依赖
3. 清理环境变量
4. 更新 .gitignore

## 🔧 实施命令

```bash
# 1. 创建本地搜索组件
mkdir -p components/search
touch components/search/LocalSearch.tsx

# 2. 创建搜索索引生成脚本
touch scripts/build-local-search-index.js

# 3. 移除 Algolia 相关文件
rm -rf components/search/AlgoliaSearch.tsx
rm -rf lib/algolia/
rm -rf hooks/useAlgoliaSearch.ts
rm -rf app/api/search/algolia/
rm -rf app/admin/search-migration/
rm -f scripts/sync-algolia.ts
rm -f scripts/build-search-index*.js

# 4. 卸载依赖
npm uninstall algoliasearch

# 5. 构建搜索索引
npm run build:search
```

## 📊 预期效果

1. **解决链接点击问题**：移除了可能干扰事件委托的 Algolia 组件
2. **提升性能**：无需网络请求，搜索速度更快
3. **减少依赖**：移除了外部服务依赖
4. **降低成本**：无需 Algolia 服务费用
5. **更好的控制**：完全掌控搜索逻辑

## ⚠️ 注意事项

1. 搜索索引需要在构建时生成
2. 搜索功能仅限于已发布的文章
3. 不支持实时搜索建议
4. 搜索精度可能不如 Algolia

## 🚀 后续优化

1. 实现更智能的搜索算法（模糊匹配、拼音搜索）
2. 添加搜索历史记录
3. 支持搜索结果高亮
4. 实现搜索结果排序优化