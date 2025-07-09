import { getAllPostSlugs, getPostBySlug, withFallback, formatDate } from '@/lib/notion'
import { getFallbackPostBySlug } from '@/lib/fallback-posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { SEO, generateArticleStructuredData } from '@/components/seo/SEO'
import { calculateWordCount } from '@/lib/utils/content'

// Ghost风格的简化文章页面
export default async function GhostStylePost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const post = await withFallback(
    () => getPostBySlug(slug),
    getFallbackPostBySlug(slug)
  )

  if (!post) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  const wordCount = post.content ? calculateWordCount(post.content) : 0
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <article className="ghost-smooth-scroll bg-white dark:bg-gray-900 min-h-screen">
      {/* 简化的导航栏 */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 border-b border-gray-100 dark:border-gray-800">
        <div className="ghost-content-width flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-white hover:opacity-70 transition-opacity">
            无题之墨
          </Link>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {readingTime} 分钟阅读
          </span>
        </div>
      </nav>

      {/* 文章内容 */}
      <div className="pt-24 pb-20">
        <div className="ghost-content-width">
          {/* 文章头部 */}
          <header className="ghost-article-header mb-12">
            {/* 简化的元数据 */}
            <div className="ghost-meta mb-6">
              <time dateTime={post.date}>
                {formatDate(post.date)}
              </time>
              {post.tags && post.tags.length > 0 && (
                <>
                  <span className="mx-2">·</span>
                  <span>{post.tags.slice(0, 2).join(', ')}</span>
                </>
              )}
            </div>
            
            {/* 文章标题 */}
            <h1 className="ghost-article-title">
              {post.title}
            </h1>
            
            {/* 文章摘要 */}
            {post.excerpt && (
              <p className="ghost-article-excerpt">
                {post.excerpt}
              </p>
            )}
            
            {/* 作者信息 - 简化版 */}
            <div className="mt-8 flex items-center justify-center">
              <Image 
                src={post.author.avatar} 
                alt={post.author.name}
                width={48}
                height={48}
                className="rounded-full mr-3"
              />
              <div className="text-left">
                <p className="ghost-author">{post.author.name}</p>
                <p className="ghost-meta text-sm">作者</p>
              </div>
            </div>
          </header>

          {/* 封面图片 */}
          {post.cover && (
            <figure className="mb-12">
              <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg">
                <Image 
                  src={post.cover} 
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </figure>
          )}

          {/* 文章正文 */}
          <div 
            className="ghost-article"
            dangerouslySetInnerHTML={{ __html: post.content || '<p>内容加载中...</p>' }}
          />

          {/* 文章尾部 - 极简设计 */}
          <footer className="mt-20 pt-12 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <Link 
                href="/" 
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回首页
              </Link>
            </div>

            {/* 极简的订阅提示 */}
            <div className="mt-16 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                如果你喜欢这篇文章，欢迎订阅获取更新
              </p>
              <Link 
                href="/subscribe" 
                className="inline-block px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:opacity-80 transition-opacity"
              >
                订阅博客
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </article>
  )
}