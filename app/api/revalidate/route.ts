import { revalidatePath, revalidateTag }
from 'next/cache' 

import { NextRequest, NextResponse }
from 'next/server' 

export const runtime = 'nodejs' 

// 保护API的密钥 
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'my-secret-token' 

export async function POST(request: NextRequest) { 
  try { 
    // 验证密钥 
    const authHeader = request.headers.get('authorization') 
    const token = authHeader?.replace('Bearer ', '') 
    
    if (token !== REVALIDATE_SECRET) { 
      return NextResponse.json( 
        { error: 'Unauthorized' }, 
        { status: 401 } 
      ) 
    }
// 获取请求体 
    const body = await request.json().catch(() => ({}))

    const { path, tag, type = 'all' } = body 
    
    // 记录重新验证请求 
    console.log('Revalidation request:', { type, path, tag }) 
    
    // 根据类型执行重新验证 
    switch (type) { 
      case 'path': 
        if (!path) { 
          return NextResponse.json( 
            { error: 'Path is required for path revalidation' }, 
            { status: 400 } 
          ) 
        }
        revalidatePath(path) 
        break
        
      case 'tag': 
        if (!tag) { 
          return NextResponse.json( 
            { error: 'Tag is required for tag revalidation' }, 
            { status: 400 } 
          ) 
        }
        revalidateTag(tag) 
        break
        
      case 'all': 
      default: 
        // 重新验证主要页面 
        revalidatePath('/', 'layout') 
        revalidatePath('/blog') 
        revalidatePath('/projects') 
        revalidatePath('/bookshelf') 
        revalidatePath('/tools') 
        revalidatePath('/tags') 
        
        // 重新验证常用标签 
        revalidateTag('posts') 
        revalidateTag('projects') 
        revalidateTag('books') 
        revalidateTag('tools') 
        break 
    }
return NextResponse.json({ 
      revalidated: true, 
      timestamp: new Date().toISOString(), 
      type, 
      path, 
      tag 
    }) 
  }
  catch (error) { 
    console.error('Revalidation error:', error) 
    return NextResponse.json( 
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 } 
    ) 
  }
}
// GET方法用于手动触发（开发测试用） export async function GET(request: NextRequest) { // 在生产环境中禁用GET方法 if (process.env.NODE_ENV === 'production') { return NextResponse.json( { error: 'Method not allowed in production' }, { status: 405 } ) }
// 开发环境允许GET请求 const searchParams = request.nextUrl.searchParams const secret = searchParams.get('secret') if (secret !== REVALIDATE_SECRET) { return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } ) }
// 执行全站重新验证 revalidatePath('/', 'layout') revalidateTag('posts') revalidateTag('projects') revalidateTag('books') revalidateTag('tools') return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString(), message: 'All paths and tags revalidated' }) }