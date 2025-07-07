/**
 * 统计数据 API 路由
 * @module app/api/statistics/route
 * @description 提供博客统计数据的 API 端点
 */

import { NextResponse } from 'next/server'
import { getCachedStatistics } from '@/lib/statistics'

/**
 * 获取统计数据
 * @returns {Response} JSON 格式的统计数据
 */
export async function GET() {
  try {
    const statistics = await getCachedStatistics()
    
    return NextResponse.json(statistics, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}