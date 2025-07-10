/** * 健康检查端点 * 用于监控应用和依赖服务的状态 */
import { NextRequest, NextResponse }
from 'next/server' 

import { createClient }
from '@/lib/supabase/server'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  services: {
    app: ServiceStatus
    database: ServiceStatus
    cache?: ServiceStatus
    realtime?: ServiceStatus
  }
  metrics?: {
    memory: NodeJS.MemoryUsage
    cpu?: number
  }
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded'
  latency?: number
  error?: string
  details?: any
}

// 应用启动时间
const startTime = Date.now()

/**
 * GET - 健康检查
 */
export async function GET(request: NextRequest) {
  const start = Date.now()
  
  try {
    // 基础健康状态
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Date.now() - startTime,
      services: {
        app: { status: 'up' },
        database: { status: 'down' },
      },
    }
    // 检查数据库连接
    const dbStart = Date.now()
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('posts')
        .select('id')
        .limit(1)
        .single()
        
      if (!error || error.code === 'PGRST116') { // PGRST116 = no rows
        health.services.database = {
          status: 'up',
          latency: Date.now() - dbStart,
        }
      } else {
        health.services.database = {
          status: 'down',
          error: error.message,
          latency: Date.now() - dbStart,
        }
        health.status = 'degraded'
      }
    } catch (error) {
      health.services.database = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: Date.now() - dbStart,
      }
      health.status = 'unhealthy'
    }
    
    // 检查实时功能（如果启用）
    if (process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true') {
      const realtimeStart = Date.now()
      try {
        const supabase = await createClient()
        
        // 简单检查实时连接是否可用
        const channel = supabase.channel('health-check')
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            channel.unsubscribe()
            reject(new Error('Realtime connection timeout'))
          }, 3000)
          
          channel
            .on('system', { event: '*' }, () => {
              clearTimeout(timeout)
              channel.unsubscribe()
              resolve()
            })
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                clearTimeout(timeout)
                channel.unsubscribe()
                resolve()
              } else if (status === 'CHANNEL_ERROR') {
                clearTimeout(timeout)
                channel.unsubscribe()
                reject(new Error('Channel error'))
              }
            })
        })
        
        health.services.realtime = {
          status: 'up',
          latency: Date.now() - realtimeStart,
        }
      } catch (error) {
        health.services.realtime = {
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error',
          latency: Date.now() - realtimeStart,
        }
        
        // 实时功能降级不影响整体健康状态
        if (health.status === 'healthy') {
          health.status = 'degraded'
        }
      }
    }
    
    // 添加系统指标（仅在开发环境）
    if (process.env.NODE_ENV !== 'production') {
      health.metrics = {
        memory: process.memoryUsage(),
      }
    }
    
    // 根据服务状态确定HTTP状态码
    const statusCode =
      health.status === 'healthy' ? 200 :
      health.status === 'degraded' ? 200 : 503
      
    // 添加总延迟
    const totalLatency = Date.now() - start
    
    return NextResponse.json({
      ...health,
      latency: totalLatency,
    }, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Date.now() - startTime,
      services: {
        app: {
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        database: { status: 'down' },
      },
      latency: Date.now() - start,
    }, {
      status: 503
    })
  }
}

/**
 * HEAD - 简单健康检查（用于负载均衡器）
 */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    }
  })
}