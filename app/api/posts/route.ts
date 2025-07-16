import { NextResponse } from 'next/server'
import { getPublishedPosts } from '@/lib/notion'
import { getFallbackPosts } from '@/lib/fallback-posts'

export async function GET() {
  try {
    // 尝试从 Notion 获取文章
    const posts = await getPublishedPosts()
    
    // 如果没有获取到文章，使用 fallback 数据
    if (!posts || posts.length === 0) {
      return NextResponse.json({ 
        posts: getFallbackPosts() 
      })
    }
    
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    
    // 发生错误时返回 fallback 数据
    return NextResponse.json({ 
      posts: getFallbackPosts() 
    })
  }
}