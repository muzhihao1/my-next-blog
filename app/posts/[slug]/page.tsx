import { getAllPostSlugs, getPostBySlug, withFallback, formatDate } from '@/lib/notion'
import { getFallbackPostBySlug } from '@/lib/fallback-posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReadingProgress from '@/components/features/ReadingProgress'
import TableOfContents from '@/components/features/TableOfContents'
import './article.css'

// ISR配置：每小时重新验证一次
export const revalidate = 3600

export async function generateStaticParams() {
  const fallbackSlugs = [
    'overcome-procrastination',
    'react-18-concurrent-features',
    'personal-knowledge-management',
    'design-system-thinking'
  ]

  try {
    if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID) {
      const slugs = await getAllPostSlugs()
      if (slugs.length > 0) {
        return slugs.map((slug: string) => ({ slug }))
      }
    }
  } catch (error) {
    console.warn('Failed to fetch slugs from Notion, using fallback:', error)
  }

  return fallbackSlugs.map((slug: string) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await withFallback(
    () => getPostBySlug(slug),
    getFallbackPostBySlug(slug)
  )

  if (!post) {
    return {
      title: '文章不存在 - 无题之墨',
      description: '抱歉，找不到这篇文章。'
    }
  }

  return {
    title: `${post.title} - 无题之墨`,
    description: post.excerpt,
  }
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await withFallback(
    () => getPostBySlug(slug),
    getFallbackPostBySlug(slug)
  )

  if (!post) {
    notFound()
  }

  return (
    <article className="article-container">
      <ReadingProgress height={3} />
      <div className="article-wrapper">
        <header className="article-header">
          <h1 className="article-title">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="article-excerpt">
              {post.excerpt}
            </p>
          )}
          
          <div className="article-meta">
            <div className="article-meta-item">
              <time dateTime={post.date}>
                {formatDate(post.date)}
              </time>
            </div>
            <span className="article-meta-divider" />
            <div className="article-meta-item">
              <span>{Math.ceil(post.content.length / 500)} 分钟阅读</span>
            </div>
          </div>
        </header>
        
        <div className="article-layout">
          <div className="article-content">
            <div 
              className="prose-optimized" 
              dangerouslySetInnerHTML={{ __html: post.content || '<p>内容加载中...</p>' }} 
            />
          </div>
          <TableOfContents selector=".prose-optimized" />
        </div>
        
        <footer className="article-content mt-20">
          {/* Share Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-12">
            <h3 className="text-lg font-semibold mb-4 text-center">分享这篇文章</h3>
            <div className="flex justify-center gap-4">
              <button className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all transform hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </button>
              <button className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all transform hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </button>
              <button 
                className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all transform hover:scale-110"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mb-16">
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 rounded-lg font-medium transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回首页
            </Link>
            <Link 
              href="/posts" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
            >
              查看更多文章
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </footer>
      </div>
    </article>
  )
}