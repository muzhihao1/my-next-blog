import { getAllPostSlugs, getPostBySlug, withFallback, formatDate } from '@/lib/notion'
import { getFallbackPostBySlug } from '@/lib/fallback-posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
          </div>
        </header>
        
        <div className="article-layout">
          <div className="article-content">
            <div 
              className="prose-optimized" 
              dangerouslySetInnerHTML={{ __html: post.content || '<p>内容加载中...</p>' }} 
            />
          </div>
        </div>
        
        <footer className="article-content mt-20">
          <div className="flex justify-center mb-16">
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 rounded-lg font-medium transition-all"
            >
              返回首页
            </Link>
          </div>
        </footer>
      </div>
    </article>
  )
}