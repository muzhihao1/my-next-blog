import { NextResponse } from 'next/server'
import { getBooks } from '@/lib/notion/books'
import { fallbackBooks } from '@/lib/fallback-books'

export async function GET() {
  try {
    // 尝试从 Notion 获取书籍
    const books = await getBooks()
    
    // 如果没有获取到书籍，使用 fallback 数据
    if (!books || books.length === 0) {
      return NextResponse.json({ 
        books: fallbackBooks 
      })
    }
    
    return NextResponse.json({ books })
  } catch (error) {
    console.error('Error fetching books:', error)
    
    // 发生错误时返回 fallback 数据
    return NextResponse.json({ 
      books: fallbackBooks 
    })
  }
}