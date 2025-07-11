/** * JSON Feed Route Handler * @module app/feed.json/route * @description 动态生成 JSON Feed 1.1 订阅源 */
import { getAllPosts }
from '@/lib/notion' 

import { NextResponse }
from 'next/server' 

import type { BlogPost } from '@/types/notion' 

export const dynamic = 'force-static' 

/** * 生成 JSON Feed * @returns {Response} JSON Feed 响应 */
export async function GET() {
  try {
    const posts = await getAllPosts()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
    
    const jsonFeed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: '无题之墨',
      home_page_url: baseUrl,
      feed_url: `${baseUrl}/feed.json`,
      description: '分享技术见解、展示项目成果、记录学习历程',
      language: 'zh-CN',
      icon: `${baseUrl}/favicon.ico`,
      favicon: `${baseUrl}/favicon.ico`,
      authors: [{
        name: 'Zhihao Mu',
        url: baseUrl
      }
      ],
      items: posts.slice(0, 20).map((post: BlogPost) => ({
        id: `${baseUrl}/posts/${post.slug}`,
        url: `${baseUrl}/posts/${post.slug}`,
        title: post.title,
        summary: post.excerpt || post.title,
        content_text: post.excerpt || post.title,
        date_published: new Date(post.date).toISOString(),
        date_modified: post.lastEditedTime 
          ? new Date(post.lastEditedTime).toISOString() 
          : new Date(post.date).toISOString(),
        authors: [{
          name: post.author.name,
          avatar: post.author.avatar
        }],
        tags: post.tags || [],
        _meta: {
          category: post.category
        }
      }))
    }
    
    return NextResponse.json(jsonFeed, {
      headers: {
        'Content-Type': 'application/feed+json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  }
  catch (error) {
    console.error('Error generating JSON feed:', error)
    
    const emptyFeed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: '无题之墨',
      home_page_url: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com',
      feed_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/feed.json`,
      description: 'JSON feed temporarily unavailable',
      items: []
    }
    
    return NextResponse.json(emptyFeed, {
      headers: {
        'Content-Type': 'application/feed+json; charset=utf-8'
      }
    })
  }
}