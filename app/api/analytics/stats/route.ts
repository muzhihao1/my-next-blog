import { NextRequest, NextResponse }
from 'next/server' 

import { createAdminClient }
from '@/lib/supabase/admin' 

import type { ContentType } from '@/types/supabase'

/** 
 * GET /api/analytics/stats - 获取内容统计数据 
 * 查询参数: 
 * - contentId: 内容ID 
 * - contentType: 内容类型 
 * - period?: 时间范围 (day|week|month|all) 
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const contentId = searchParams.get('contentId')
    const contentType = searchParams.get('contentType') as ContentType
    const period = searchParams.get('period') || 'all'
    
    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()
    
    // 计算时间范围
    let startDate: Date | null = null
    const now = new Date()
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        // 'all' - 不限制时间
        break
    }

    // 构建查询
    let query = adminClient
      .from('user_actions')
      .select('action_type, metadata, created_at', { count: 'exact' })
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    const { data: actions, count, error } = await query
    
    if (error) {
      console.error('获取统计数据失败:', error)
      return NextResponse.json(
        { error: '获取统计数据失败' },
        { status: 500 }
      )
    }

    // 计算统计数据
    const stats = {
      totalViews: 0,
      uniqueViews: new Set<string>(),
      scrollDepth: {
        25: 0,
        50: 0,
        75: 0,
        100: 0
      },
      totalReadingTime: 0,
      averageReadingTime: 0,
      shares: 0
    }

    // 处理每个行为
    actions?.forEach(action => {
      switch (action.action_type) {
        case 'view':
          stats.totalViews++
          
          // 滚动深度
          if (action.metadata?.scrollDepth) {
            const depth = action.metadata.scrollDepth as number
            if (depth in stats.scrollDepth) {
              stats.scrollDepth[depth as keyof typeof stats.scrollDepth]++
            }
          }
          
          // 阅读时长
          if (action.metadata?.readingTime) {
            stats.totalReadingTime += action.metadata.readingTime
          }
          break
          
        case 'share':
          stats.shares++
          break
      }
    })
    
    // 计算平均阅读时长
    const readingTimeSessions = actions?.filter(
      a => a.action_type === 'view' && a.metadata?.readingTime
    ).length || 0
    
    if (readingTimeSessions > 0) {
      stats.averageReadingTime = Math.round(stats.totalReadingTime / readingTimeSessions)
    }

    // 获取点赞和收藏数（从专门的表获取最新数据）
    const [likesResult, bookmarksResult] = await Promise.all([
      adminClient
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('content_id', contentId)
        .eq('content_type', contentType),
      adminClient
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('content_id', contentId)
        .eq('content_type', contentType)
    ])
    
    return NextResponse.json({
      contentId,
      contentType,
      period,
      stats: {
        views: stats.totalViews,
        likes: likesResult.count || 0,
        bookmarks: bookmarksResult.count || 0,
        shares: stats.shares,
        scrollDepth: stats.scrollDepth,
        averageReadingTime: stats.averageReadingTime
      }
    })
  } catch (error) {
    console.error('获取分析数据失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}