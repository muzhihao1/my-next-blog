import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function checkNotionConnection(): Promise<{
  status: 'ok' | 'error'
  message: string
  responseTime?: number
}> {
  if (!process.env.NOTION_TOKEN) {
    return {
      status: 'error',
      message: 'Notion token not configured'
    }
  }

  const startTime = Date.now()
  
  try {
    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    })

    // 尝试获取用户信息来验证连接
    await notion.users.me({})
    
    const responseTime = Date.now() - startTime

    return {
      status: 'ok',
      message: 'Notion API connected successfully',
      responseTime
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    }
  }
}

export async function GET() {
  const startTime = Date.now()
  
  // 检查各项服务状态
  const notionCheck = await checkNotionConnection()
  
  // 收集环境信息
  const envCheck = {
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    hasNotionToken: !!process.env.NOTION_TOKEN,
    hasNotionDatabaseId: !!process.env.NOTION_DATABASE_ID,
    hasProjectsDb: !!process.env.NOTION_PROJECTS_DB,
    hasBooksDb: !!process.env.NOTION_BOOKS_DB,
    hasToolsDb: !!process.env.NOTION_TOOLS_DB,
  }

  // 计算整体状态
  const isHealthy = notionCheck.status === 'ok' && envCheck.hasNotionToken && envCheck.hasNotionDatabaseId
  const totalResponseTime = Date.now() - startTime

  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    responseTime: totalResponseTime,
    checks: {
      notion: notionCheck,
      environment: envCheck,
    }
  }

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Check': isHealthy ? 'pass' : 'fail'
    }
  })
}