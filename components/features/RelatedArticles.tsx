/**
 * 相关文章推荐组件
 * 基于标签和分类推荐相似文章
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/notion'
import type { BlogPost } from '@/types/notion'

interface RelatedArticlesProps {
  currentPostId: string
  currentPostTags?: string[]
  currentPostCategory?: string
  limit?: number
}

export function RelatedArticles({
  currentPostId,
  currentPostTags = [],
  currentPostCategory,
  limit = 3
}: RelatedArticlesProps) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        setLoading(true)
        
        // 获取所有文章
        const response = await fetch('/api/posts')
        if (!response.ok) throw new Error('Failed to fetch posts')
        
        const data = await response.json()
        const allPosts: BlogPost[] = data.posts || []
        
        // 过滤掉当前文章
        const otherPosts = allPosts.filter(post => post.id !== currentPostId)
        
        // 计算相关性分数
        const scoredPosts = otherPosts.map(post => {
          let score = 0
          
          // 相同分类 +3 分
          if (post.category === currentPostCategory) {
            score += 3
          }
          
          // 共同标签，每个 +1 分
          if (post.tags && currentPostTags.length > 0) {
            const commonTags = post.tags.filter(tag => 
              currentPostTags.includes(tag)
            )
            score += commonTags.length
          }
          
          return { post, score }
        })
        
        // 按分数排序并取前几个
        const topRelated = scoredPosts
          .filter(item => item.score > 0) // 只要有相关性的
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(item => item.post)
        
        setRelatedPosts(topRelated)
      } catch (error) {
        console.error('Error fetching related posts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRelatedPosts()
  }, [currentPostId, currentPostTags, currentPostCategory, limit])
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          相关文章
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (relatedPosts.length === 0) {
    return null
  }
  
  return (
    <div className="mt-16 pt-16 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        相关文章
      </h3>
      
      <div className="grid gap-8 md:grid-cols-3">
        {relatedPosts.map((post) => (
          <article
            key={post.id}
            className="group"
          >
            <Link href={`/posts/${post.slug}`} className="block">
              {/* 封面图片 */}
              {post.cover ? (
                <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="h-48 mb-4 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
                    />
                  </svg>
                </div>
              )}
              
              {/* 文章信息 */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h4>
                
                {post.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <time dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                  
                  {post.readTime && (
                    <>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </>
                  )}
                </div>
                
                {/* 标签 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </article>
        ))}
      </div>
      
      {/* 查看更多 */}
      <div className="text-center mt-10">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
        >
          查看更多文章
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  )
}