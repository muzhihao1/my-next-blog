import { NextRequest, NextResponse }
from 'next/server' 

import { createClient }
from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await context.params
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('contentType') || 'post'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    
    const supabase = await createClient()
    
    // 获取评论列表（包含用户信息和回复）
    const { data: comments, error, count } = await supabase
      .from('comments')
      .select(`
        *,
        user_profiles!inner (
          id,
          username,
          display_name,
          avatar_url
        ),
        replies:comments!parent_id (
          *,
          user_profiles!inner (
            id,
            username,
            display_name,
            avatar_url
          )
        )
      `, { count: 'exact' })
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .is('parent_id', null) // 只获取顶级评论
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
      
    if (error) {
      console.error('获取评论失败:', error)
      return NextResponse.json(
        { error: '获取评论失败' },
        { status: 500 }
      )
    }
    
    // 构建评论树结构
    const commentsWithReplies = comments?.map(comment => ({
      ...comment,
      replies: comment.replies || []
    })) || []
    
    return NextResponse.json({
      comments: commentsWithReplies,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit
    })
  } catch (error) {
    console.error('评论API错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}