'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/notion'
import type { BlogPost } from '@/types/notion'
import { PageContainer } from '@/components/ui/Container'

// 分类配置
const categoryConfig = {
  all: { name: '全部文章' },
  Technology: { name: '技术开发' },
  AI: { name: 'AI与创新' },
  Design: { name: '产品设计' },
  Productivity: { name: '效率方法' },
  Growth: { name: '个人成长' },
  Life: { name: '生活随笔' }
}

// 排序选项
type SortOption = 'date-desc' | 'date-asc' | 'popular' | 'reading-time'

// 分类图标组件
const CategoryIcon = ({ category, className = "" }: { category: string; className?: string }) => {
  const iconPath = {
    all: "M12 2L2 7v10c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V7l-10-5zM12 13L3.68 7.44 12 3.24l8.32 4.2L12 13z",
    Technology: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    AI: "M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z",
    Design: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    Productivity: "M13 3v9h9a9 9 0 0 0-9-9zM11 13V4.07c-4.06.5-7.5 3.94-8 8.93h8zM4.26 14C5.08 17.61 8.16 20.25 12 20.91V22a10 10 0 0 1-7.74-8H4.26zM13 14.91c3.84-.66 6.92-3.3 7.74-6.91H22A10 10 0 0 1 13 22v-7.09z",
    Growth: "M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z",
    Life: "M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM2 21h18v-2H2v2z"
  }
  
  const path = iconPath[category as keyof typeof iconPath] || iconPath.all
  
  return (
    <svg 
      className={`w-5 h-5 ${className}`} 
      fill="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

// 获取分类样式
function getCategoryClass(category: string) {
  const categoryMap: { [key: string]: string } = {
    'Technology': 'bg-blue-100 text-blue-700',
    'AI': 'bg-purple-100 text-purple-700',
    'Design': 'bg-pink-100 text-pink-700',
    'Productivity': 'bg-green-100 text-green-700',
    'Growth': 'bg-yellow-100 text-yellow-700',
    'Life': 'bg-orange-100 text-orange-700'
  }
  return categoryMap[category] || 'bg-gray-100 text-gray-700'
}

interface BlogClientProps {
  posts: BlogPost[]
}

export default function BlogClient({ posts }: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [searchQuery, setSearchQuery] = useState('')

  // 统计各分类文章数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: posts.length }
    posts.forEach(post => {
      const category = post.category || 'Technology'
      counts[category] = (counts[category] || 0) + 1
    })
    return counts
  }, [posts])

  // 过滤文章
  const filteredPosts = useMemo(() => {
    let filtered = posts

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [posts, selectedCategory, searchQuery])

  // 排序文章
  const sortedPosts = useMemo(() => {
    const sorted = [...filteredPosts]
    
    switch (sortBy) {
      case 'date-desc':
        return sorted.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      case 'date-asc':
        return sorted.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      case 'popular':
        // 模拟按热度排序（实际应该基于真实数据）
        return sorted.sort((a, b) => 
          (b.tags?.length || 0) - (a.tags?.length || 0)
        )
      case 'reading-time':
        return sorted.sort((a, b) => {
          const aTime = parseInt(a.readTime) || 0
          const bTime = parseInt(b.readTime) || 0
          return aTime - bTime
        })
      default:
        return sorted
    }
  }, [filteredPosts, sortBy])

  return (
    <PageContainer size="xl">
      {/* 页面标题 */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">博客文章</h1>
        <p className="text-lg text-gray-600">分享技术见解、设计思考和生活感悟</p>
      </div>

      {/* 搜索栏 */}
      <div className="mb-8">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="搜索文章标题、内容或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = categoryCounts[key] || 0
            if (key !== 'all' && count === 0) return null
            
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === key
                    ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <CategoryIcon category={key} />
                <span>{config.name}</span>
                <span className="ml-1 text-sm opacity-75">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 排序选项 */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <span className="text-gray-600">排序方式：</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date-desc">最新发布</option>
          <option value="date-asc">最早发布</option>
          <option value="popular">最受欢迎</option>
          <option value="reading-time">阅读时长</option>
        </select>
      </div>

      {/* 文章列表 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="block group"
          >
            <article className="h-full bg-white rounded-lg border border-gray-200 p-6 transition-all hover:shadow-xl hover:-translate-y-1">
              {/* 分类标签 */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getCategoryClass(post.category)}`}>
                  <CategoryIcon category={post.category} className="w-4 h-4" />
                  {categoryConfig[post.category as keyof typeof categoryConfig]?.name || post.category}
                </span>
              </div>

              {/* 标题 */}
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {post.title}
              </h2>

              {/* 摘要 */}
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 元信息 */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                <time>{formatDate(post.date)}</time>
                <span>{post.readTime}</span>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* 空状态 */}
      {sortedPosts.length === 0 && (
        <div className="text-center py-16">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-xl text-gray-600 mb-2">未找到相关文章</p>
          <p className="text-gray-500">
            {searchQuery ? '尝试使用其他关键词搜索' : '请选择其他分类查看'}
          </p>
        </div>
      )}
    </PageContainer>
  )
}