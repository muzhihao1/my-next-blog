/** * 性能数据收集器 * 负责收集客户端和服务端的性能指标 */
import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP, Metric } from 'web-vitals' 

import {
  MetricType,
  MetricDataPoint,
  WebVitalsMetric,
  APIMetric,
  ErrorMetric,
  PerformanceRating
} from './types' 

import { getPerformanceRating, getMetricUnit } from './config'

/**
 * 监控数据收集器
 */
export class MonitoringCollector {
  private queue: MetricDataPoint[] = []
  private sessionId: string
  private userId?: string
  private flushTimer?: NodeJS.Timeout
  private config = {
    batchSize: 20,
    flushInterval: 10000, // 10 秒
    maxQueueSize: 100,
    endpoint: '/api/monitoring/metrics',
  }
  // 性能观察器
  private observers: Map<string, PerformanceObserver> = new Map()
  
  constructor() {
    this.sessionId = this.generateSessionId()
    this.initialize()
  }
  /**
   * 初始化收集器
   */
  private initialize() {
    if (typeof window === 'undefined') return
    
    // 收集 Web Vitals
    this.collectWebVitals()
    
    // 收集资源加载性能
    this.collectResourceTiming()
    
    // 收集导航性能
    this.collectNavigationTiming()
    
    // 监听错误
    this.setupErrorTracking()
    
    // 启动定时刷新
    this.startFlushTimer()
    
    // 页面卸载时发送数据
    window.addEventListener('beforeunload', () => {
      this.flush(true)
    })
  }
  /**
   * 设置用户 ID
   */
  public setUserId(userId: string | null) {
    this.userId = userId || undefined
  }
  /**
   * 收集 Web Vitals
   */
  private collectWebVitals() {
    // First Contentful Paint
    onFCP((metric) => {
      this.recordWebVital(MetricType.FCP, metric)
    })
    
    // Largest Contentful Paint
    onLCP((metric) => {
      this.recordWebVital(MetricType.LCP, metric)
    })
    
    // First Input Delay
    onFID((metric) => {
      this.recordWebVital(MetricType.FID, metric)
    })
    
    // Cumulative Layout Shift
    onCLS((metric) => {
      this.recordWebVital(MetricType.CLS, metric)
    })
    
    // Time to First Byte
    onTTFB((metric) => {
      this.recordWebVital(MetricType.TTFB, metric)
    })
    
    // Interaction to Next Paint
    onINP((metric) => {
      this.recordWebVital(MetricType.INP, metric)
    })
  }
/** * 记录 Web Vital 指标 */
private recordWebVital(metricType: MetricType, metric: Metric) { const dataPoint: MetricDataPoint = { metric_type: metricType, value: metric.value, unit: getMetricUnit(metricType), rating: metric.rating as PerformanceRating, timestamp: new Date(), context: { page: window.location.pathname, user_id: this.userId, session_id: this.sessionId, device_type: this.getDeviceType(), browser: this.getBrowserInfo(), connection_type: this.getConnectionType(), }, metadata: { id: metric.id, delta: metric.delta, entries_count: metric.entries.length, }, }
this.addToQueue(dataPoint) }
/** * 收集资源加载性能 */
private collectResourceTiming() { const observer = new PerformanceObserver((list) => { for (const entry of list.getEntries()) { if (entry.entryType === 'resource') { const resourceEntry = entry as PerformanceResourceTiming // 只关注重要资源 if (this.isImportantResource(resourceEntry.name)) { this.recordResourceMetric(resourceEntry) }
} }
}) observer.observe({ entryTypes: ['resource']
}) this.observers.set('resource', observer) }
/** * 收集导航性能 */
private collectNavigationTiming() { const observer = new PerformanceObserver((list) => { for (const entry of list.getEntries()) { if (entry.entryType === 'navigation') { const navEntry = entry as PerformanceNavigationTiming // 页面加载时间 const loadTime = navEntry.loadEventEnd - navEntry.fetchStart this.recordMetric(MetricType.PAGE_LOAD_TIME, loadTime, { dns_time: navEntry.domainLookupEnd - navEntry.domainLookupStart, tcp_time: navEntry.connectEnd - navEntry.connectStart, request_time: navEntry.responseStart - navEntry.requestStart, response_time: navEntry.responseEnd - navEntry.responseStart, dom_processing: navEntry.domComplete - navEntry.domInteractive, }) }
} }) observer.observe({ entryTypes: ['navigation']
}) this.observers.set('navigation', observer) }
/** * 设置错误跟踪 */
private setupErrorTracking() { // JavaScript 错误 window.addEventListener('error', (event) => { this.recordError({ type: 'javascript', message: event.message, source: event.filename, line: event.lineno, column: event.colno, stack: event.error?.stack, }) }) // Promise 拒绝 window.addEventListener('unhandledrejection', (event) => { this.recordError({ type: 'javascript', message: `Unhandled Promise Rejection: ${event.reason}`, stack: event.reason?.stack, }) }) }
/** * 记录 API 性能 */
public recordAPIMetric(metric: APIMetric) { const dataPoint: MetricDataPoint = { metric_type: MetricType.API_LATENCY, value: metric.duration, unit: 'ms', rating: getPerformanceRating(MetricType.API_LATENCY, metric.duration), timestamp: metric.timestamp, context: { api_endpoint: metric.endpoint, user_id: this.userId, session_id: this.sessionId, }, metadata: { method: metric.method, status_code: metric.status_code, request_size: metric.request_size, response_size: metric.response_size, trace_id: metric.trace_id, }, }
this.addToQueue(dataPoint) // 如果是错误，记录错误率 if (metric.status_code >= 400) { this.recordMetric(MetricType.API_ERROR_RATE, 1, { endpoint: metric.endpoint, status_code: metric.status_code, error: metric.error, }) }
  }
  
  /**
   * 记录通用指标
   */
  public recordMetric(
    metricType: MetricType,
    value: number,
    metadata?: Record<string, any>
  ) {
    const dataPoint: MetricDataPoint = {
      metric_type: metricType,
      value,
      unit: getMetricUnit(metricType),
      rating: getPerformanceRating(metricType, value),
      timestamp: new Date(),
      context: {
        page: window?.location?.pathname,
        user_id: this.userId,
        session_id: this.sessionId,
      },
      metadata,
    }
    this.addToQueue(dataPoint)
  }
  
  /**
   * 记录错误
   */
  private recordError(error: Partial<ErrorMetric>) {
    this.recordMetric(MetricType.ERROR_COUNT, 1, {
      error_type: error.type,
      message: error.message,
      source: error.source,
      line: error.line,
      column: error.column,
      stack: error.stack,
      url: window.location.href,
      user_agent: navigator.userAgent,
    })
  }
  /**
   * 记录资源指标
   */
  private recordResourceMetric(entry: PerformanceResourceTiming) {
    const duration = entry.responseEnd - entry.fetchStart
    const resourceType = this.getResourceType(entry.name)
    
    this.recordMetric(MetricType.PAGE_LOAD_TIME, duration, {
      resource_type: resourceType,
      resource_url: entry.name,
      transfer_size: entry.transferSize,
      encoded_size: entry.encodedBodySize,
      decoded_size: entry.decodedBodySize,
      cache_hit: entry.transferSize === 0,
    })
  }
  /**
   * 判断是否是重要资源
   */
  private isImportantResource(url: string): boolean {
    // 排除监控和分析脚本
    if (url.includes('/monitoring/') || url.includes('/analytics/')) {
      return false
    }
    // 只关注主要资源
    const importantTypes = ['.js', '.css', '.json', '/api/']
    return importantTypes.some(type => url.includes(type))
  }
  /**
   * 获取资源类型
   */
  private getResourceType(url: string): string {
    if (url.endsWith('.js')) return 'script'
    if (url.endsWith('.css')) return 'stylesheet'
    if (url.endsWith('.json')) return 'json'
    if (url.includes('/api/')) return 'api'
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font'
    return 'other'
  }
  /**
   * 生成会话 ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  /**
   * 获取设备类型
   */
  private getDeviceType(): string {
    const ua = navigator.userAgent
    if (/mobile/i.test(ua)) return 'mobile'
    if (/tablet/i.test(ua)) return 'tablet'
    return 'desktop'
  }
  /**
   * 获取浏览器信息
   */
  private getBrowserInfo(): string {
    const ua = navigator.userAgent
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    return 'Other'
  }
  /**
   * 获取网络连接类型
   */
  private getConnectionType(): string {
    const connection = (navigator as any).connection
    if (!connection) return 'unknown'
    return connection.effectiveType || 'unknown'
  }
  /**
   * 添加到队列
   */
  private addToQueue(dataPoint: MetricDataPoint) {
    // 检查队列大小
    if (this.queue.length >= this.config.maxQueueSize) {
      this.queue.shift() // 移除最旧的数据
    }
    this.queue.push(dataPoint)
    
    // 检查是否需要立即发送
    if (this.queue.length >= this.config.batchSize) {
      this.flush()
    }
  }
  
  /**
   * 启动定时刷新
   */
  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush()
      }
    }, this.config.flushInterval)
  }
  /**
   * 发送数据
   */
  public async flush(useBeacon = false) {
    if (this.queue.length === 0) return
    
    const metrics = [...this.queue]
    this.queue = []
    try {
      if (useBeacon && navigator.sendBeacon) {
        const blob = new Blob(
          [JSON.stringify({ metrics })],
          { type: 'application/json' }
        )
        navigator.sendBeacon(this.config.endpoint, blob)
      }
      else {
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics }),
        })
        
        if (!response.ok) {
          throw new Error(`Monitoring API error: ${response.status}`)
        }
      }
    }
    catch (error) {
      console.error('Failed to send monitoring data:', error)
      
      // 将数据放回队列（有限重试）
      if (metrics.length < this.config.maxQueueSize) {
        this.queue.unshift(...metrics.slice(0, 10)) // 只重试部分数据
      }
    }
  }
  
  /**
   * 销毁收集器
   */
  public destroy() {
    // 发送剩余数据
    this.flush(true)
    
    // 清理定时器
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    // 清理观察器
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    
    // 清理事件监听
    window.removeEventListener('beforeunload', () => {})
    window.removeEventListener('error', () => {})
    window.removeEventListener('unhandledrejection', () => {})
  }
}
// 导出单例
let collector: MonitoringCollector | null = null

export function getMonitoringCollector(): MonitoringCollector {
  if (!collector && typeof window !== 'undefined') {
    collector = new MonitoringCollector()
  }
  return collector!
}
export function destroyMonitoringCollector() {
  if (collector) {
    collector.destroy()
    collector = null
  }
}

/**
 * React Hook: 使用监控收集器
 */
import { useEffect } from 'react'

export function useMonitoring(userId?: string) {
  useEffect(() => {
    const collector = getMonitoringCollector()
    
    if (userId) {
      collector.setUserId(userId)
    }
    return () => {
      // 组件卸载时不销毁收集器（保持全局单例）
    }
  }, [userId])
}
/**
 * API 性能中间件（用于 Next.js API 路由）
 */
export function withAPIMonitoring(
  handler: (req: any, res: any) => Promise<void>
) {
  return async (req: any, res: any) => {
    const start = Date.now()
    const originalJson = res.json
    const originalStatus = res.status
    let statusCode = 200
    
    // 拦截 status 方法
    res.status = function(code: number) {
      statusCode = code
      return originalStatus.call(this, code)
    }
    // 拦截 json 方法
    res.json = function(body: any) {
      const duration = Date.now() - start
      
      // 记录 API 性能
      const metric: APIMetric = {
        endpoint: req.url,
        method: req.method,
        status_code: statusCode,
        duration,
        timestamp: new Date(),
        request_size: JSON.stringify(req.body || {}).length,
        response_size: JSON.stringify(body).length,
      }
      // 发送到监控端点（服务端）
      if (process.env.NODE_ENV === 'production') {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/monitoring/metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: [{
              metric_type: MetricType.API_LATENCY,
              value: duration,
              unit: 'ms',
              timestamp: new Date(),
              context: {
                api_endpoint: req.url,
              },
              metadata: metric,
            }
            ],
          }),
        }).catch(err => console.error('Failed to send API metrics:', err))
      }
      
      return originalJson.call(this, body)
    }
    try {
      await handler(req, res)
    }
    catch (error) {
      // 记录错误
      const duration = Date.now() - start
      
      if (process.env.NODE_ENV === 'production') {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/monitoring/metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: [{
              metric_type: MetricType.API_ERROR_RATE,
              value: 1,
              unit: 'count',
              timestamp: new Date(),
              context: {
                api_endpoint: req.url,
              },
              metadata: {
                error: error instanceof Error ? error.message : 'Unknown error',
                duration,
              },
            }
            ],
          }),
        }).catch(err => console.error('Failed to send error metrics:', err))
      }
      
      throw error
    }
  }
}