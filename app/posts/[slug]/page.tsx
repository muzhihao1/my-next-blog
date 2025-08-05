import { getAllPostSlugs, getPostBySlug, withFallback, formatDate } from '@/lib/notion'
import { getFallbackPostBySlug } from '@/lib/fallback-posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReadingProgress from '@/components/features/ReadingProgress'
import TableOfContents from '@/components/features/TableOfContents'
import ShareButtons from '@/components/features/ShareButtons'
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
          <ShareButtons />
          
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