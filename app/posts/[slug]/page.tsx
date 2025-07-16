import { getAllPostSlugs, getPostBySlug, withFallback, formatDate } from '@/lib/notion'
import { getFallbackPostBySlug } from '@/lib/fallback-posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import './article.css'
import AuthorAvatar from './AuthorAvatar' 

import type { Metadata } from 'next'
import { SEO, generateArticleStructuredData } from '@/components/seo/SEO'
import { calculateWordCount, formatUpdateTime } from '@/lib/utils/content'
import TableOfContents from '@/components/features/TableOfContents'
import ReadingProgress from '@/components/features/ReadingProgress'
import { SocialShare } from '@/components/features/SocialShare'
import ArticleReactions from '@/components/features/ArticleReactions'
import TagList from '@/components/features/TagList'
import FavoriteButton, { FloatingFavoriteButton } from '@/components/features/FavoriteButton'
import { FavoriteType } from '@/lib/hooks/useFavorites'
// import { Container } from '@/components/ui/Container' // 不再需要Container组件
import { CommentSection } from '@/components/comments/CommentSection'
import { RelatedArticles } from '@/components/features/RelatedArticles'

// ISR配置：每小时重新验证一次
export const revalidate = 3600

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
        return slugs.map((slug: string) => ({ slug }))
      }
    }
  } catch (error) {
    console.warn('Failed to fetch slugs from Notion, using fallback:', error)
  }

  // Return fallback slugs
  return fallbackSlugs.map((slug: string) => ({ slug }))
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  const articleStructuredData = generateArticleStructuredData({
    title: post.title,
    description: post.excerpt,
    publishedDate: post.date,
    modifiedDate: post.lastEditedTime || post.date,
    authorName: post.author.name,
    authorUrl: `${baseUrl}/about`,
    image: post.cover,
    keywords: post.tags,
    url: `${baseUrl}/posts/${slug}`
  })

  // Calculate word count
  const wordCount = post.content ? calculateWordCount(post.content) : 0
  const updateTime = formatUpdateTime(post.date, post.lastEditedTime)

  return (
    <article className="bg-white min-h-screen">
<SEO structuredData={articleStructuredData}
/>
<ReadingProgress showPercentage={false}
offset={80}
/>
<div className="article-center-layout py-16"> {/* 文章头部 */}
<header className="mb-16 mt-8 text-center"> {/* 分类标签 */}
<div className="mb-8">
<span className={getCategoryClass(post.category)}> {post.category} </span> </div> {/* 文章标题 */}
<h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8 text-gray-900 tracking-tight max-w-4xl mx-auto"> {post.title} </h1> {/* 文章摘要 */} {post.excerpt && ( <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto"> {post.excerpt} </p> )} {/* 作者信息和元数据 */}
<div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
<div className="flex items-center">
<div className="w-12 h-12 mr-4 overflow-hidden rounded-full bg-gray-100">
  <AuthorAvatar 
    src={post.author.avatar}
    alt={post.author.name}
  />
</div>
<div className="text-center sm:text-left">
<div className="font-medium text-gray-900">{post.author.name}</div>
<div className="text-sm text-gray-500">作者</div> </div> </div>
<div className="hidden sm:block w-px h-12 bg-gray-300"></div>
<div className="text-center">
<div className="text-sm text-gray-500 mb-1">发布时间</div>
<time dateTime={post.date}
className="text-gray-700 font-medium"> {formatDate(post.date)} </time> </div>
<div className="hidden sm:block w-px h-12 bg-gray-300"></div>
<div className="text-center">
<div className="text-sm text-gray-500 mb-1">阅读时间</div>
<span className="text-gray-700 font-medium">{post.readTime}</span> </div>
<div className="hidden sm:block w-px h-12 bg-gray-300"></div>
<div className="text-center">
<div className="text-sm text-gray-500 mb-1">字数</div>
<span className="text-gray-700 font-medium">{wordCount.toLocaleString()} 字</span> </div> {updateTime && ( <>
<div className="hidden sm:block w-px h-12 bg-gray-300"></div>
<div className="text-center">
<div className="text-sm text-gray-500 mb-1">最后更新</div>
<span className="text-gray-700 font-medium">{updateTime}</span> </div> </> )} </div> {/* 标签 */} {post.tags && post.tags.length > 0 && ( <div className="flex justify-center mb-8">
<TagList tags={post.tags}
size="medium" /> </div> )} {/* 社交分享和收藏 */}
<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
<SocialShare url={`${baseUrl}/posts/${slug}`}
title={post.title}
description={post.excerpt || ''}
tags={post.tags || []
}
/>
<FavoriteButton itemId={post.id}
itemType={FavoriteType.POST}
title={post.title}
description={post.excerpt}
thumbnail={post.cover}
slug={post.slug}
size="medium" /> </div> {/* 封面图片 */} {post.cover && ( <div className="relative w-full h-64 md:h-96 mb-12">
<Image src={post.cover}
alt={post.title}
fill 
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
className="object-cover rounded-2xl shadow-2xl" 
priority
/> </div> )} {/* 分割线 */}
<div className="divider"></div> </header> {/* 文章内容和目录容器 */}
<div className="flex gap-12">
  {/* 文章内容区域 */}
  <div className="flex-1 min-w-0">
    <div className="prose-blog mb-16" dangerouslySetInnerHTML={{ __html: post.content || '<p>内容加载中...</p>' }} />
  </div>
  
  {/* 目录导航 - 仅在大屏幕显示 */}
  <aside className="hidden xl:block w-64 flex-shrink-0">
    <TableOfContents selector=".prose-blog" />
  </aside>
</div> {/* 文章底部 */}
<footer className="mt-20"> {/* 文章反应 */}
<ArticleReactions articleId={slug}
/> {/* 分割线 */}
<div className="divider"></div> {/* 操作区域 */}
<div className="flex justify-center mb-16">
<Link href="/" className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-lg font-medium transition-all group" >
<svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M10 19l-7-7m0 0l7-7m-7 7h18" /> </svg> 返回首页 </Link> </div> {/* 相关文章推荐 */}
<RelatedArticles
  currentPostId={post.id}
  currentPostTags={post.tags}
  currentPostCategory={post.category}
/> {/* 评论区域 */}
<CommentSection contentId={post.id}
contentType="post" /> {/* 订阅区域 */}
<div className="subscribe-section mt-16">
<h3 className="text-2xl font-light mb-4 text-gray-900 text-center">喜欢这篇文章？</h3>
<div className="divider"></div>
<p className="text-gray-600 mb-8 max-w-md mx-auto text-center"> 订阅我的博客，获取更多关于技术、设计和生活的深度思考 </p>
<form className="flex max-w-md mx-auto gap-3">
<input type="email" placeholder="输入您的邮箱地址" className="flex-1 px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all" />
<button type="submit" className="btn-subscribe" > 订阅 </button> </form>
<p className="text-xs text-gray-500 mt-4 text-center"> 每周最多一封邮件，随时可以取消订阅 </p> </div> </footer> </div> {/* 浮动收藏按钮 */}
<FloatingFavoriteButton itemId={post.id}
itemType={FavoriteType.POST}
title={post.title}
description={post.excerpt}
thumbnail={post.cover}
slug={post.slug}
/> </article> ) }