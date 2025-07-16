import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/notion/projects'
import { fallbackProjects } from '@/lib/fallback-projects'

export async function GET() {
  try {
    // 尝试从 Notion 获取项目
    const projects = await getProjects()
    
    // 如果没有获取到项目，使用 fallback 数据
    if (!projects || projects.length === 0) {
      return NextResponse.json({ 
        projects: fallbackProjects 
      })
    }
    
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    
    // 发生错误时返回 fallback 数据
    return NextResponse.json({ 
      projects: fallbackProjects 
    })
  }
}