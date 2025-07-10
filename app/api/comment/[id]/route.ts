import { NextRequest, NextResponse }
from 'next/server' 

import { createClient }
from '@/lib/supabase/server'

// 更新评论
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // 检查用户认证
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }
    const { id } = await context.params
    const body = await request.json()
    const { content } = body
    
    // 验证内容
    if (!content) {
      return NextResponse.json(
        { error: '评论内容不能为空' },
        { status: 400 }
      )
    }
    
    if (content.length > 500) {
      return NextResponse.json(
        { error: '评论内容不能超过500字' },
        { status: 400 }
      )
    }
    
    // 检查评论是否存在且属于当前用户
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single()
      
    if (fetchError || !existingComment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      )
    }
    
    if (existingComment.user_id !== user.id) {
      return NextResponse.json(
        { error: '无权编辑此评论' },
        { status: 403 }
      )
    }
    
    // 更新评论
    const { data: updatedComment, error: updateError } = await supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        user_profiles!comments_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()
      
    if (updateError) {
      console.error('更新评论失败:', updateError)
      return NextResponse.json(
        { error: '更新评论失败' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      comment: updatedComment,
      message: '评论更新成功'
    })
  } catch (error) {
    console.error('评论API错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除评论
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // 检查用户认证
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }
    
    const { id } = await context.params
    
    // 检查评论是否存在且属于当前用户
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single()
      
    if (fetchError || !existingComment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      )
    }
    
    if (existingComment.user_id !== user.id) {
      return NextResponse.json(
        { error: '无权删除此评论' },
        { status: 403 }
      )
    }
    
    // 软删除评论（将内容替换为"此评论已删除"）
    const { error: deleteError } = await supabase
      .from('comments')
      .update({
        content: '[此评论已删除]',
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      
    if (deleteError) {
      console.error('删除评论失败:', deleteError)
      return NextResponse.json(
        { error: '删除评论失败' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: '评论删除成功'
    })
  } catch (error) {
    console.error('评论API错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}