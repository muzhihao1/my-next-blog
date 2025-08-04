import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    
    // 1. 首先获取顶级评论
    const { data: comments, error: commentsError, count } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
      
    if (commentsError) {
      console.error('获取评论失败:', commentsError)
      return NextResponse.json(
        { error: '获取评论失败', details: commentsError.message },
        { status: 500 }
      )
    }
    
    // 如果没有评论，直接返回空结果
    if (!comments || comments.length === 0) {
      return NextResponse.json({
        comments: [],
        total: 0,
        page,
        limit,
        hasMore: false
      })
    }
    
    // 2. 获取所有相关用户的ID
    const userIds = comments.map(c => c.user_id).filter(Boolean)
    
    // 3. 批量获取用户信息
    let userProfiles = {}
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds)
      
      if (!profilesError && profiles) {
        profiles.forEach(profile => {
          userProfiles[profile.id] = profile
        })
      }
    }
    
    // 4. 获取所有评论的回复
    const commentIds = comments.map(c => c.id)
    const { data: allReplies, error: repliesError } = await supabase
      .from('comments')
      .select('*')
      .in('parent_id', commentIds)
      .order('created_at', { ascending: true })
    
    // 5. 获取回复的用户信息
    if (allReplies && allReplies.length > 0) {
      const replyUserIds = allReplies.map(r => r.user_id).filter(Boolean)
      if (replyUserIds.length > 0) {
        const { data: replyProfiles } = await supabase
          .from('user_profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', replyUserIds)
        
        if (replyProfiles) {
          replyProfiles.forEach(profile => {
            userProfiles[profile.id] = profile
          })
        }
      }
    }
    
    // 6. 组装最终数据结构
    const commentsWithUserInfo = comments.map(comment => {
      const replies = allReplies?.filter(r => r.parent_id === comment.id) || []
      
      return {
        ...comment,
        user_profiles: comment.user_id ? userProfiles[comment.user_id] : null,
        replies: replies.map(reply => ({
          ...reply,
          user_profiles: reply.user_id ? userProfiles[reply.user_id] : null
        }))
      }
    })
    
    return NextResponse.json({
      comments: commentsWithUserInfo,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit
    })
  } catch (error) {
    console.error('评论API错误:', error)
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}