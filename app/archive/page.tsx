import { getPublishedPosts }
from '@/lib/notion' 

import { fallbackPosts }
from '@/lib/fallback-posts' 

import Link from 'next/link' 

import type { BlogPost }
from '@/types/notion' 

export default async function ArchivePage() { 
  let posts = []
  
  try { 
    posts = await getPublishedPosts() 
  } catch (error) { 
    console.error('Failed to fetch posts:', error) 
    posts = fallbackPosts 
  }
  
  // 按年份分组文章 
  const postsByYear = posts.reduce((acc: Record<string, BlogPost[]>, post: BlogPost) => { 
    const year = new Date(post.date).getFullYear() 
    if (!acc[year]) { 
      acc[year] = []
    }
    acc[year].push(post) 
    return acc 
  }, {} as Record<string, BlogPost[]>)
  
  // 按年份倒序排列
  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a))
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          文章归档
        </h1>
        <p className="text-lg text-gray-600">
          所有文章按时间排序
        </p>
      </div>
      
      <div className="space-y-12">
        {years.map((year: string) => (
          <div key={year}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-blue-600 mr-3">{year}</span>
              <span className="text-sm font-normal text-gray-500">
                ({postsByYear[year].length} 篇)
              </span>
            </h2>
            <div className="space-y-4">
              {postsByYear[year].map((post: BlogPost) => (
                <article key={post.id} className="group">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex items-start justify-between hover:bg-gray-50:bg-gray-800/50 rounded-lg p-4 -mx-4 transition-colors"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600:text-blue-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                    <time className="flex-shrink-0 ml-4 text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </time>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无文章</p>
        </div>
      )}
    </div>
  )
}