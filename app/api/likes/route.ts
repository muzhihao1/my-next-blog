import { NextRequest, NextResponse }
from 'next/server' 

import { createClient }
from '@/lib/supabase/server' 

import { createAdminClient }
from '@/lib/supabase/admin' 

import type { ContentType } from '@/types/supabase'

/**
 * GET /api/likes - 获取点赞状态和数量
 * 查询参数:
 * - contentId: 内容ID
 * - contentType: 内容类型 (post|project|book|tool)
 * - userId?: 用户ID (可选，获取特定用户的点赞状态)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const contentId = searchParams.get('contentId')
    const contentType = searchParams.get('contentType') as ContentType
    const userId = searchParams.get('userId')
    
    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // 获取点赞总数
    const { count, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      
    if (countError) {
      console.error('获取点赞数失败:', countError)
      return NextResponse.json(
        { error: '获取点赞数失败' },
        { status: 500 }
      )
    }
    
    // 如果提供了userId，检查用户是否已点赞
    let isLiked = false
    if (userId) {
      const { data: userLike } = await supabase
        .from('likes')
        .select('id')
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .eq('user_id', userId)
        .single()
        
      isLiked = !!userLike
    }
    
    return NextResponse.json({
      count: count || 0,
      isLiked
    })
  } catch (error) {
    console.error('获取点赞状态失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/likes - 添加点赞
 * 请求体:
 * - contentId: 内容ID
 * - contentType: 内容类型
 */
export async function POST(request: NextRequest) {
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
    
    const body = await request.json()
    const { contentId, contentType } = body
    
    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .eq('user_id', user.id)
      .single()
      
    if (existingLike) {
      return NextResponse.json(
        { error: '已经点赞过了' },
        { status: 400 }
      )
    }
    
    // 添加点赞记录
    const { data: newLike, error: insertError } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        content_id: contentId,
        content_type: contentType
      })
      .select()
      .single()
      
    if (insertError) {
      console.error('添加点赞失败:', insertError)
      return NextResponse.json(
        { error: '添加点赞失败' },
        { status: 500 }
      )
    }
    
    // 记录用户行为
    const adminClient = createAdminClient()
    await adminClient
      .from('user_actions')
      .insert({
        user_id: user.id,
        action_type: 'like',
        content_id: contentId,
        content_type: contentType
      })
      
    // 获取更新后的点赞数
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      
    return NextResponse.json({
      success: true,
      count: count || 0,
      like: newLike
    })
  } catch (error) {
    console.error('添加点赞失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/likes - 取消点赞
 * 查询参数:
 * - contentId: 内容ID
 * - contentType: 内容类型
 */
export async function DELETE(request: NextRequest) {
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
    
    const searchParams = request.nextUrl.searchParams
    const contentId = searchParams.get('contentId')
    const contentType = searchParams.get('contentType') as ContentType
    
    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    // 删除点赞记录
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .eq('user_id', user.id)
      
    if (deleteError) {
      console.error('取消点赞失败:', deleteError)
      return NextResponse.json(
        { error: '取消点赞失败' },
        { status: 500 }
      )
    }
    
    // 记录用户行为
    const adminClient = createAdminClient()
    await adminClient
      .from('user_actions')
      .insert({
        user_id: user.id,
        action_type: 'unlike',
        content_id: contentId,
        content_type: contentType
      })
      
    // 获取更新后的点赞数
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      
    return NextResponse.json({
      success: true,
      count: count || 0
    })
  } catch (error) {
    console.error('取消点赞失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}