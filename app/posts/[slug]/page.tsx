import { getAllPostSlugs, getPostBySlug, withFallback, formatDate } from '@/lib/notion'
import { getFallbackPostBySlug } from '@/lib/fallback-posts'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  // Use fallback slugs for static export when Notion API may not be available
  const fallbackSlugs = [
    'overcome-procrastination', 
    'react-18-concurrent-features', 
    'personal-knowledge-management', 
    'design-system-thinking'
  ]
  
  try {
    // Try to get slugs from Notion if environment is configured
    if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID) {
      const slugs = await getAllPostSlugs()
      if (slugs.length > 0) {
        return slugs.map((slug) => ({ slug }))
      }
    }
  } catch (error) {
    console.warn('Failed to fetch slugs from Notion, using fallback:', error)
  }
  
  // Return fallback slugs
  return fallbackSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [post.cover] : [],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [post.cover] : [],
    },
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

  function getCategoryClass(category: string) {
    const categoryMap: { [key: string]: string } = {
      'Technology': 'category-technology',
      'Design': 'category-design', 
      'Productivity': 'category-productivity',
      'Life': 'category-life'
    }
    return `category-badge ${categoryMap[category] || 'category-technology'}`
  }

  return (
    <article className="py-16 bg-white">
      <div className="container-narrow">
        {/* 文章头部 */}
        <header className="mb-16">
          {/* 分类标签 */}
          <div className="mb-8 text-center">
            <span className={getCategoryClass(post.category)}>
              {post.category}
            </span>
          </div>
          
          {/* 文章标题 */}
          <h1 className="text-4xl md:text-6xl font-light leading-tight mb-8 text-center text-gray-900 tracking-tight">
            {post.title}
          </h1>
          
          {/* 文章摘要 */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed text-center mb-12 max-w-3xl mx-auto">
              {post.excerpt}
            </p>
          )}
          
          {/* 作者信息和元数据 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <div className="flex items-center">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="author-avatar mr-4"
              />
              <div className="text-center sm:text-left">
                <div className="font-medium text-gray-900">{post.author.name}</div>
                <div className="text-sm text-gray-500">作者</div>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">发布时间</div>
              <time dateTime={post.date} className="text-gray-700 font-medium">
                {formatDate(post.date)}
              </time>
            </div>
            
            <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">阅读时间</div>
              <span className="text-gray-700 font-medium">{post.readTime}</span>
            </div>
          </div>
          
          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 封面图片 */}
          {post.cover && (
            <div className="mb-12">
              <img 
                src={post.cover} 
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div>
          )}

          {/* 分割线 */}
          <div className="divider"></div>
        </header>

        {/* 文章内容 */}
        <div className="max-w-3xl mx-auto">
          <div 
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.content || '<p>内容加载中...</p>' }}
          />
        </div>

        {/* 文章底部 */}
        <footer className="mt-20">
          {/* 分割线 */}
          <div className="divider"></div>
          
          {/* 操作区域 */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-6">
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-lg font-medium transition-all group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回首页
            </a>
            
            <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                title="点赞"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm">喜欢</span>
              </button>
              
              <button 
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="分享"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 10-15.432 0m15.432 0a9.001 9.001 0 01-15.432 0m15.432 0A8.961 8.961 0 0112 21a8.961 8.961 0 01-5.716-2.026" />
                </svg>
                <span className="text-sm">分享</span>
              </button>
            </div>
          </div>

          {/* 订阅区域 */}
          <div className="subscribe-section">
            <h3 className="text-2xl font-light mb-4 text-gray-900">喜欢这篇文章？</h3>
            <div className="divider"></div>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              订阅我的博客，获取更多关于技术、设计和生活的深度思考
            </p>
            <form className="flex max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder="输入您的邮箱地址"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
              />
              <button 
                type="submit"
                className="btn-subscribe"
              >
                订阅
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">
              每周最多一封邮件，随时可以取消订阅
            </p>
          </div>
        </footer>
      </div>
    </article>
  )
}