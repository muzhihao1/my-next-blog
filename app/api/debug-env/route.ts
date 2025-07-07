import { NextResponse } from 'next/server'

// 仅在开发环境下启用此端点
const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'

export async function GET() {
  if (!isDev) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const debugInfo = {
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString(),
    notionConfig: {
      hasToken: !!process.env.NOTION_TOKEN,
      tokenFormat: process.env.NOTION_TOKEN ? {
        prefix: process.env.NOTION_TOKEN.substring(0, 7),
        length: process.env.NOTION_TOKEN.length,
        hasSpaces: process.env.NOTION_TOKEN !== process.env.NOTION_TOKEN.trim(),
        isValidFormat: /^secret_[a-zA-Z0-9]{43}$/.test(process.env.NOTION_TOKEN)
      } : null,
      databases: {
        main: debugDatabaseId('NOTION_DATABASE_ID', process.env.NOTION_DATABASE_ID),
        projects: debugDatabaseId('NOTION_PROJECTS_DB', process.env.NOTION_PROJECTS_DB),
        tools: debugDatabaseId('NOTION_TOOLS_DB', process.env.NOTION_TOOLS_DB),
        books: debugDatabaseId('NOTION_BOOKS_DB', process.env.NOTION_BOOKS_DB),
      }
    }
  }

  return NextResponse.json(debugInfo, { status: 200 })
}

function debugDatabaseId(name: string, value: string | undefined) {
  if (!value) {
    return { status: 'not_set' }
  }

  const uuidPattern = /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i
  const compactPattern = /^[a-f0-9]{32}$/i
  
  return {
    status: 'set',
    value: value.substring(0, 8) + '...',
    length: value.length,
    hasSpaces: value !== value.trim(),
    containsUrl: value.includes('notion.so') || value.includes('http'),
    format: uuidPattern.test(value) ? 'uuid' : compactPattern.test(value) ? 'compact' : 'invalid'
  }
}