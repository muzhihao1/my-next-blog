import { NextRequest, NextResponse }
from 'next/server' 

import { createClient }
from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 检查用户认证
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录后再评论' },
        { status: 401 }
      )
    }
    
    // 获取请求数据
    const body = await request.json()
    const { content, contentId, contentType, parentId } = body
    
    // 验证必填字段
    if (!content || !contentId || !contentType) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }
    
    // 验证评论内容长度
    if (content.length > 500) {
      return NextResponse.json(
        { error: '评论内容不能超过500字' },
        { status: 400 }
      )
    }
    
    // 如果是回复，验证父评论是否存在
    if (parentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', parentId)
        .single()
        
      if (parentError || !parentComment) {
        return NextResponse.json(
          { error: '回复的评论不存在' },
          { status: 400 }
        )
      }
    }
    
    // 创建评论
    const { data: newComment, error: insertError } = await supabase
      .from('comments')
      .insert({
        content,
        content_id: contentId,
        content_type: contentType,
        user_id: user.id,
        parent_id: parentId || null
      })
      .select(`
        *,
        user_profiles!inner (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()
      
    if (insertError) {
      console.error('创建评论失败:', insertError)
      return NextResponse.json(
        { error: '发布评论失败' },
        { status: 500 }
      )
    }
    
    // 记录用户行为
    await supabase.from('user_actions').insert({
      user_id: user.id,
      action_type: 'comment',
      target_type: contentType,
      target_id: contentId,
      metadata: {
        comment_id: newComment.id
      }
    })
    
    return NextResponse.json({
      comment: newComment,
      message: '评论发布成功'
    })
  } catch (error) {
    console.error('评论API错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}