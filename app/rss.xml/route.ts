/** * RSS Feed Route Handler * @module app/rss.xml/route * @description 动态生成 RSS 2.0 订阅源 */
import { getAllPosts }
from '@/lib/notion' 

import { NextResponse }
from 'next/server' 

import type { BlogPost } from '@/types/notion'

export const dynamic = 'force-static'

/**
 * 转义 XML 特殊字符
 * @param {string} str - 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
function escapeXml(str: string): string {
  if (!str) return ''
  
  const xmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  }
  
  return str.replace(/[&<>"']/g, (char) => xmlEscapeMap[char] || char)
}

/**
 * 生成 RSS feed
 * @returns {Response} RSS XML 响应
 */
export async function GET() {
  try {
    const posts = await getAllPosts()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
    
    const rssItems = posts
      .slice(0, 20) // 限制最新 20 篇文章
      .map((post: BlogPost) => {
        const postUrl = `${baseUrl}/posts/${post.slug}`
        const pubDate = new Date(post.date).toUTCString()
        
        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.excerpt || post.title)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(post.author.name)}</author>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
      ${post.tags?.map((tag: string) => `<category>${escapeXml(tag)}</category>`).join('') || ''}
    </item>`
      })
      .join('\n')
    
    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>无题之墨</title>
    <link>${baseUrl}</link>
    <description>分享技术见解、展示项目成果、记录学习历程</description>
    <language>zh-CN</language>
    <copyright>© ${new Date().getFullYear()} Zhihao Mu. All rights reserved.</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js Blog RSS Generator</generator>
    ${rssItems}
  </channel>
</rss>`
    
    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    
    // 返回一个空的但有效的 RSS feed
    const emptyFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>无题之墨</title>
    <link>${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}</link>
    <description>RSS feed temporarily unavailable</description>
  </channel>
</rss>`
    
    return new NextResponse(emptyFeed, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8'
      }
    })
  }
}