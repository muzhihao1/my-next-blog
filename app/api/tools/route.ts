import { NextResponse } from 'next/server'
import { getTools } from '@/lib/notion/tools'
import { fallbackTools } from '@/lib/fallback-tools'

export async function GET() {
  try {
    // 尝试从 Notion 获取工具
    const tools = await getTools()
    
    // 如果没有获取到工具，使用 fallback 数据
    if (!tools || tools.length === 0) {
      return NextResponse.json({ 
        tools: fallbackTools 
      })
    }
    
    return NextResponse.json({ tools })
  } catch (error) {
    console.error('Error fetching tools:', error)
    
    // 发生错误时返回 fallback 数据
    return NextResponse.json({ 
      tools: fallbackTools 
    })
  }
}