import { NextRequest, NextResponse }
from 'next/server' 

import { createClient }
from '@/lib/supabase/server' 

import { createAdminClient }
from '@/lib/supabase/admin' 

import type { ContentType } from '@/types/supabase'

/** 
 * GET /api/bookmarks - 获取收藏状态和数量 
 * 查询参数: 
 * - contentId: 内容ID 
 * - contentType: 内容类型 (post|project|book|tool) 
 * - userId?: 用户ID (可选，获取特定用户的收藏状态) 
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
    
    // 获取收藏总数
    const { count, error: countError } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      
    if (countError) {
      console.error('获取收藏数失败:', countError)
      return NextResponse.json(
        { error: '获取收藏数失败' },
        { status: 500 }
      )
    }
    
    // 如果提供了userId，检查用户是否已收藏
    let isBookmarked = false
    if (userId) {
      const { data: userBookmark } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .eq('user_id', userId)
        .single()
        
      isBookmarked = !!userBookmark
    }
    
    return NextResponse.json({ count: count || 0, isBookmarked })
  } catch (error) {
    console.error('获取收藏状态失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bookmarks - 添加收藏
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
    
    // 检查是否已经收藏
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .eq('user_id', user.id)
      .single()
      
    if (existingBookmark) {
      return NextResponse.json(
        { error: '已经收藏过了' },
        { status: 400 }
      )
    }
    
    // 添加收藏记录
    const { data: newBookmark, error: insertError } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        content_id: contentId,
        content_type: contentType
      })
      .select()
      .single()
      
    if (insertError) {
      console.error('添加收藏失败:', insertError)
      return NextResponse.json(
        { error: '添加收藏失败' },
        { status: 500 }
      )
    }
    
    // 记录用户行为
    const adminClient = createAdminClient()
    await adminClient
      .from('user_actions')
      .insert({
        user_id: user.id,
        action_type: 'bookmark',
        content_id: contentId,
        content_type: contentType
      })
      
    // 获取更新后的收藏数
    const { count } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      
    return NextResponse.json({
      success: true,
      count: count || 0,
      bookmark: newBookmark
    })
  } catch (error) {
    console.error('添加收藏失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bookmarks - 取消收藏
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
    
    // 删除收藏记录
    const { error: deleteError } = await supabase
      .from('bookmarks')
      .delete()
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .eq('user_id', user.id)
      
    if (deleteError) {
      console.error('取消收藏失败:', deleteError)
      return NextResponse.json(
        { error: '取消收藏失败' },
        { status: 500 }
      )
    }
    
    // 记录用户行为
    const adminClient = createAdminClient()
    await adminClient
      .from('user_actions')
      .insert({
        user_id: user.id,
        action_type: 'unbookmark',
        content_id: contentId,
        content_type: contentType
      })
      
    // 获取更新后的收藏数
    const { count } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      
    return NextResponse.json({
      success: true,
      count: count || 0
    })
  } catch (error) {
    console.error('取消收藏失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 获取用户的收藏列表 - 内部辅助函数
 * 查询参数:
 * - page?: 页码 (默认1)
 * - limit?: 每页数量 (默认10)
 * - contentType?: 筛选内容类型
 */
async function getUserBookmarks(request: NextRequest) {
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const contentType = searchParams.get('contentType') as ContentType | null
    const offset = (page - 1) * limit
    
    // 构建查询
    let query = supabase
      .from('bookmarks')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
      
    if (contentType) {
      query = query.eq('content_type', contentType)
    }
    
    const { data: bookmarks, count, error: queryError } = await query
    
    if (queryError) {
      console.error('获取收藏列表失败:', queryError)
      return NextResponse.json(
        { error: '获取收藏列表失败' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      bookmarks: bookmarks || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('获取用户收藏失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}