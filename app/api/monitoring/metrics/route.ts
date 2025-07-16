/** * 监控指标收集API * 接收并处理性能监控数据 */
import { NextRequest, NextResponse }
from 'next/server' 

import { createClient }
from '@/lib/supabase/server' 

import { MetricDataPoint, MetricType }
from '@/lib/monitoring/types' 

import { validateMetrics }
from '@/lib/monitoring/validator' 

import { AlertManager }
from '@/lib/monitoring/alerts' 

/** * 批量插入优化 */
const BATCH_INSERT_SIZE = 100 

/** * POST - 接收监控指标 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json()
    const { metrics } = body
    
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      )
    }
    // 限制批量大小
    if (metrics.length > 1000) {
      return NextResponse.json(
        { error: 'Too many metrics in batch (max 1000)' },
        { status: 400 }
      )
    }
    // 验证指标数据
    const validationErrors = validateMetrics(metrics)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid metrics', details: validationErrors },
        { status: 400 }
      )
    }
    // 创建 Supabase 客户端
    const supabase = await createClient()
    
    // 处理指标数据
    const processedMetrics = metrics.map((metric: MetricDataPoint) => ({
      ...metric,
      timestamp: new Date(metric.timestamp).toISOString(),
      server_timestamp: new Date().toISOString(),
    }))
    
    // 批量插入指标
    const insertPromises = []
    
    for (let i = 0; i < processedMetrics.length; i += BATCH_INSERT_SIZE) {
      const batch = processedMetrics.slice(i, i + BATCH_INSERT_SIZE)
      insertPromises.push(
        supabase
          .from('monitoring_metrics')
          .insert(batch)
      )
    }

    const results = await Promise.all(insertPromises)
    const hasError = results.some(result => result.error)

    if (hasError) {
      console.error('Failed to insert monitoring metrics:', results)
      return NextResponse.json(
        { error: 'Failed to save metrics' },
        { status: 500 }
      )
    }
// 更新实时统计 
    await updateRealtimeStats(processedMetrics) 
    
    // 检查告警条件 
    const alertManager = new AlertManager() 
    await alertManager.checkAlerts(processedMetrics) 
    
    // 返回成功响应 
    return NextResponse.json({ 
      success: true, 
      processed: processedMetrics.length, 
    }) 
  }
catch (error) { 
    console.error('Monitoring metrics error:', error) 
    return NextResponse.json( 
      { error: 'Internal server error' }, 
      { status: 500 } 
    ) 
  }
}

/** * GET - 查询监控指标 */
export async function GET(request: NextRequest) { 
  try { 
    const { searchParams } = new URL(request.url) 
    
    // 解析查询参数 
    const metricType = searchParams.get('metric_type') 
    const startTime = searchParams.get('start_time') 
    const endTime = searchParams.get('end_time') 
    const page = parseInt(searchParams.get('page') || '1') 
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000) 
    
    // 创建 Supabase 客户端 
    const supabase = await createClient() 
    
    // 构建查询 
    let query = supabase 
      .from('monitoring_metrics') 
      .select('*', { count: 'exact' }) 
      
    // 应用过滤条件 
    if (metricType) { 
      query = query.eq('metric_type', metricType) 
    }
    if (startTime) {
      query = query.gte('timestamp', new Date(startTime).toISOString())
    }
    if (endTime) {
      query = query.lte('timestamp', new Date(endTime).toISOString())
    }
    // 分页
    const offset = (page - 1) * limit 
    query = query 
      .order('timestamp', { ascending: false }) 
      .range(offset, offset + limit - 1) 
      
    const { data, error, count } = await query 
    
    if (error) { 
      console.error('Failed to fetch metrics:', error) 
      return NextResponse.json( 
        { error: 'Failed to fetch metrics' }, 
        { status: 500 } 
      ) 
    }
    // 计算聚合统计
    const aggregates = await calculateAggregates(data || []) 
    
    return NextResponse.json({ 
      metrics: data || [], 
      pagination: { 
        page, 
        limit, 
        total: count || 0, 
        pages: Math.ceil((count || 0) / limit), 
      }, 
      aggregates, 
    }) 
  }
  catch (error) {
    console.error('Query metrics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/** * 更新实时统计 */
async function updateRealtimeStats(metrics: MetricDataPoint[]) { 
  const supabase = await createClient() 
  const now = new Date() 
  
  // 按指标类型分组 
  const metricsByType = new Map<MetricType, MetricDataPoint[]>() 
  
  metrics.forEach(metric => { 
    if (!metricsByType.has(metric.metric_type)) { 
      metricsByType.set(metric.metric_type, []) 
    }
    metricsByType.get(metric.metric_type)!.push(metric)
  })
  
  // 更新每种指标的统计
  for (const [metricType, typeMetrics] of metricsByType) { 
    const values = typeMetrics.map(m => m.value) 
    const average = values.reduce((a, b) => a + b, 0) / values.length 
    const min = Math.min(...values) 
    const max = Math.max(...values) 
    
    // 更新或插入实时统计 
    await supabase 
      .from('monitoring_realtime_stats') 
      .upsert({ 
        metric_type: metricType, 
        current_value: average, 
        min_value: min, 
        max_value: max, 
        sample_count: typeMetrics.length, 
        last_updated: now.toISOString(), 
        expires_at: new Date(now.getTime() + 5 * 60 * 1000).toISOString(), // 5分钟过期 
      }) 
  }
  
  // 更新页面性能统计 
  const pageMetrics = metrics.filter(m => m.context.page) 
  const pageGroups = new Map<string, MetricDataPoint[]>() 
  
  pageMetrics.forEach(metric => { 
    const page = metric.context.page! 
    if (!pageGroups.has(page)) { 
      pageGroups.set(page, []) 
    }
    pageGroups.get(page)!.push(metric)
  })
  
  // 更新每个页面的统计
  for (const [page, pageMetrics] of pageGroups) { 
    const webVitals = pageMetrics.filter(m => 
      [MetricType.FCP, MetricType.LCP, MetricType.FID, MetricType.CLS, MetricType.TTFB].includes(m.metric_type) 
    ) 
    
    if (webVitals.length > 0) { 
      await supabase.rpc('update_page_performance_stats', { 
        p_page: page, 
        p_metrics: webVitals.map(m => ({ 
          metric_type: m.metric_type, 
          value: m.value, 
          rating: m.rating, 
        })), 
      })
    }
  }
}

/** * 计算聚合统计 */
function calculateAggregates(metrics: MetricDataPoint[]) { 
  if (metrics.length === 0) { 
    return { 
      count: 0, 
      average: 0, 
      median: 0, 
      p75: 0, 
      p90: 0, 
      p95: 0, 
      p99: 0, 
      min: 0, 
      max: 0,
    }
  }
  
  const values = metrics.map(m => m.value).sort((a, b) => a - b) 
  const count = values.length 
  
  // 计算百分位数 
  const percentile = (p: number) => { 
    const index = Math.ceil((p / 100) * count) - 1 
    return values[Math.max(0, Math.min(index, count - 1))]
  }
  
  return { 
    count, 
    average: values.reduce((a, b) => a + b, 0) / count, 
    median: percentile(50), 
    p75: percentile(75), 
    p90: percentile(90), 
    p95: percentile(95), 
    p99: percentile(99), 
    min: values[0], 
    max: values[count - 1], 
  }
}

/** * OPTIONS - CORS 支持 */
export async function OPTIONS(request: NextRequest) { 
  return new NextResponse(null, { 
    status: 200, 
    headers: { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type', 
    }, 
  }) 
}