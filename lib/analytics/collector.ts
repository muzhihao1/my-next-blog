/**
 * 数据采集器
 * 负责收集、批处理和发送分析事件
 */
import {
  AnalyticsEvent,
  EventType,
  DeviceInfo,
  PageInfo,
  AnalyticsConfig,
  PageViewEvent,
  PostViewEvent,
  SearchEvent,
  PerformanceEvent,
  ErrorEvent
} from './types'

import { v4 as uuidv4 } from 'uuid'

/**
 * 默认配置
 */
const DEFAULT_CONFIG: AnalyticsConfig = {
  collection: {
    enabled: true,
    sample_rate: 1.0,
    excluded_paths: ['/admin', '/api'],
    custom_dimensions: {},
  },
  privacy: {
    anonymize_ip: true,
    respect_dnt: true,
    cookie_consent_required: false,
  },
  performance: {
    batch_size: 10,
    flush_interval: 5000,
    max_queue_size: 100,
    retry_attempts: 3,
  },
}
/**
 * 数据采集器类
 */
export class AnalyticsCollector {
  private config: AnalyticsConfig
  private queue: AnalyticsEvent[] = []
  private sessionId: string
  private anonymousId: string
  private userId?: string
  private flushTimer?: NodeJS.Timeout
  private retryCount = 0
  private isOnline = true
  
  constructor(config?: Partial<AnalyticsConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.getOrCreateSessionId()
    this.anonymousId = this.getOrCreateAnonymousId()
    
    // 初始化
    this.initialize()
  }
  /**
   * 初始化采集器
   */
  private initialize() {
    // 监听网络状态
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true
        this.flush()
      })
      
      window.addEventListener('offline', () => {
        this.isOnline = false
      })
      
      // 页面卸载时发送数据
      window.addEventListener('beforeunload', () => {
        this.flush(true)
      })
      
      // 自动页面浏览跟踪
      if (this.config.collection.enabled) {
        this.trackPageView()
        
        // 监听路由变化（Next.js）
        if (window.next?.router) {
          window.next.router.events.on('routeChangeComplete', (url: string) => {
            this.trackPageView()
          })
        }
      }
    }
    
    // 启动定时刷新
    this.startFlushTimer()
  }
  /**
   * 设置用户ID
   */
  public setUserId(userId: string | null) {
    this.userId = userId || undefined
    
    // 更新会话信息
    if (typeof window !== 'undefined') {
      if (userId) {
        sessionStorage.setItem('analytics_user_id', userId)
      }
      else {
        sessionStorage.removeItem('analytics_user_id')
      }
    }
  }
  /**
   * 跟踪事件
   */
  public track(eventType: EventType, properties: Record<string, any> = {}) {
    if (!this.shouldTrack()) {
      return
    }
    const event: AnalyticsEvent = {
      id: uuidv4(),
      event_type: eventType,
      timestamp: new Date(),
      session_id: this.sessionId,
      user_id: this.userId,
      anonymous_id: this.anonymousId,
      device: this.getDeviceInfo(),
      location: {}, // 服务端填充
      page: this.getPageInfo(),
      referrer: this.getReferrerInfo(),
      properties: {
        ...this.config.collection.custom_dimensions,
        ...properties,
      },
    }
    this.addToQueue(event)
  }
  /**
   * 跟踪页面浏览
   */
  public trackPageView(properties?: Record<string, any>) {
    const startTime = Date.now()
    
    // 创建页面浏览事件
    this.track(EventType.PAGE_VIEW, {
      ...properties,
      page_load_time: performance?.timing?.loadEventEnd - performance?.timing?.navigationStart,
    })
    
    // 跟踪页面退出
    if (typeof window !== 'undefined') {
      const handlePageExit = () => {
        const duration = Date.now() - startTime
        const scrollDepth = this.getScrollDepth()
        
        this.track(EventType.PAGE_EXIT, {
          duration,
          scroll_depth: scrollDepth,
        })
      }
      // 多种退出检测
      window.addEventListener('beforeunload', handlePageExit, { once: true })
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          handlePageExit()
        }
      }, { once: true })
    }
  }
  
  /**
   * 跟踪文章浏览
   */
  public trackPostView(post: {
    id: string
    title: string
    slug: string
    author_id?: string
    tags?: string[]
    word_count?: number
  }) {
    const readingStartTime = Date.now()
    let maxScrollDepth = 0
    
    this.track(EventType.POST_VIEW, {
      post_id: post.id,
      post_title: post.title,
      post_slug: post.slug,
      author_id: post.author_id,
      tags: post.tags,
      word_count: post.word_count,
      estimated_read_time: post.word_count ? Math.ceil(post.word_count / 200) : undefined,
    })
    
    // 跟踪阅读进度
    if (typeof window !== 'undefined') {
      const trackReadProgress = () => {
        const currentScrollDepth = this.getScrollDepth()
        maxScrollDepth = Math.max(maxScrollDepth, currentScrollDepth)
        
        // 阅读完成判定（滚动超过80%且停留超过30秒）
        if (currentScrollDepth > 0.8 && Date.now() - readingStartTime > 30000) {
          this.track(EventType.POST_READ, {
            post_id: post.id,
            read_time: Math.round((Date.now() - readingStartTime) / 1000),
            scroll_depth: maxScrollDepth,
            engagement_score: this.calculateEngagementScore(maxScrollDepth, Date.now() - readingStartTime),
          })
          
          // 移除监听器
          window.removeEventListener('scroll', trackReadProgress)
        }
      }
      
      window.addEventListener('scroll', trackReadProgress, { passive: true })
    }
  }
  
  /**
   * 跟踪搜索
   */
  public trackSearch(query: string, resultsCount: number, filters?: Record<string, any>) {
    this.track(EventType.SEARCH, {
      query: query.substring(0, 100), // 限制长度
      results_count: resultsCount,
      filters,
      search_type: query.length < 3 ? 'instant' : 'full',
    })
  }
  /**
   * 跟踪性能指标
   */
  public trackPerformance() {
    if (typeof window === 'undefined' || !window.performance) {
      return
    }
    // Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          this.track(EventType.PERFORMANCE, {
            metric_type: 'LCP',
            value: entry.startTime,
            rating: this.getPerformanceRating('LCP', entry.startTime),
          })
        }
      }
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
    
    // First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    if (fcp) {
      this.track(EventType.PERFORMANCE, {
        metric_type: 'FCP',
        value: fcp.startTime,
        rating: this.getPerformanceRating('FCP', fcp.startTime),
      })
    }
  }
  
  /**
   * 跟踪错误
   */
  public trackError(error: Error, context?: Record<string, any>) {
    this.track(EventType.ERROR, {
      error_type: 'javascript',
      message: error.message,
      stack: error.stack,
      ...context,
    })
  }
  /**
   * 获取或创建会话ID
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
      return uuidv4()
    }
    const stored = sessionStorage.getItem('analytics_session_id')
    if (stored) {
      return stored
    }
    
    const newId = uuidv4()
    sessionStorage.setItem('analytics_session_id', newId)
    return newId
  }
  /**
   * 获取或创建匿名ID
   */
  private getOrCreateAnonymousId(): string {
    if (typeof window === 'undefined') {
      return uuidv4()
    }
    const stored = localStorage.getItem('analytics_anonymous_id')
    if (stored) {
      return stored
    }
    
    const newId = uuidv4()
    localStorage.setItem('analytics_anonymous_id', newId)
    return newId
  }
  /**
   * 获取设备信息
   */
  private getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        os: 'unknown',
        os_version: 'unknown',
        browser: 'unknown',
        browser_version: 'unknown',
        screen_width: 0,
        screen_height: 0,
        viewport_width: 0,
        viewport_height: 0,
        language: 'en',
        timezone: 'UTC',
      }
    }
    
    const ua = navigator.userAgent
    const mobile = /Mobile|Android|iPhone|iPad/i.test(ua)
    const tablet = /iPad|Android.*Tablet/i.test(ua)
    
    return {
      type: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop',
      os: this.detectOS(ua),
      os_version: 'unknown',
      browser: this.detectBrowser(ua),
      browser_version: 'unknown',
      screen_width: screen.width,
      screen_height: screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }
  
  /**
   * 获取页面信息
   */
  private getPageInfo(): PageInfo {
    if (typeof window === 'undefined') {
      return {
        url: '',
        path: '',
        title: '',
        host: '',
      }
    }
    
    return {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      host: window.location.host,
      search: window.location.search || undefined,
      hash: window.location.hash || undefined,
    }
  }
  
  /**
   * 获取引荐信息
   */
  private getReferrerInfo() {
    if (typeof document === 'undefined' || !document.referrer) {
      return undefined
    }
    
    try {
      const url = new URL(document.referrer)
      
      // 解析来源
      let source = 'direct'
      let medium = 'none'
      
      if (url.hostname.includes('google')) {
        source = 'google'
        medium = 'organic'
      }
      else if (url.hostname.includes('facebook')) {
        source = 'facebook'
        medium = 'social'
      }
      else if (url.hostname !== window.location.hostname) {
        source = url.hostname
        medium = 'referral'
      }
      return {
        url: document.referrer,
        source,
        medium,
      }
    }
    catch {
      return { url: document.referrer }
    }
  }
  /**
   * 检测操作系统
   */
  private detectOS(ua: string): string {
    if (/Windows/i.test(ua)) return 'Windows'
    if (/Mac/i.test(ua)) return 'macOS'
    if (/Linux/i.test(ua)) return 'Linux'
    if (/Android/i.test(ua)) return 'Android'
    if (/iOS|iPhone|iPad/i.test(ua)) return 'iOS'
    return 'unknown'
  }
  /**
   * 检测浏览器
   */
  private detectBrowser(ua: string): string {
    if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) return 'Chrome'
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari'
    if (/Firefox/i.test(ua)) return 'Firefox'
    if (/Edge/i.test(ua)) return 'Edge'
    return 'unknown'
  }
  /**
   * 获取滚动深度
   */
  private getScrollDepth(): number {
    if (typeof window === 'undefined') return 0
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    
    return Math.min(1, (scrollTop + clientHeight) / scrollHeight)
  }
  /**
   * 计算参与度分数
   */
  private calculateEngagementScore(scrollDepth: number, timeSpent: number): number {
    // 基于滚动深度和停留时间的简单算法
    const scrollScore = scrollDepth * 50
    const timeScore = Math.min(50, timeSpent / 1000)
    return Math.round(scrollScore + timeScore)
  }
  /**
   * 获取性能评级
   */
  private getPerformanceRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      FCP: [1800, 3000],
      LCP: [2500, 4000],
      FID: [100, 300],
      CLS: [0.1, 0.25],
      TTFB: [800, 1800],
    }
    const [good, poor] = thresholds[metric] || [0, Infinity]
    
    if (value <= good) return 'good'
    if (value <= poor) return 'needs-improvement'
    return 'poor'
  }
  /**
   * 是否应该跟踪
   */
  private shouldTrack(): boolean {
    // 检查是否启用
    if (!this.config.collection.enabled) {
      return false
    }
    // 检查采样率
    if (Math.random() > this.config.collection.sample_rate) {
      return false
    }
    
    // 检查DNT
    if (this.config.privacy.respect_dnt && navigator.doNotTrack === '1') {
      return false
    }
    // 检查排除路径
    const currentPath = window.location.pathname
    if (this.config.collection.excluded_paths.some(path => currentPath.startsWith(path))) {
      return false
    }
    
    return true
  }
  /**
   * 添加到队列
   */
  private addToQueue(event: AnalyticsEvent) {
    // 检查队列大小
    if (this.queue.length >= this.config.performance.max_queue_size) {
      // 移除最旧的事件
      this.queue.shift()
    }
    this.queue.push(event)
    
    // 检查是否需要立即发送
    if (this.queue.length >= this.config.performance.batch_size) {
      this.flush()
    }
  }
  
  /**
   * 启动定时刷新
   */
  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush()
      }
    }, this.config.performance.flush_interval)
  }
  /**
   * 发送数据
   */
  public async flush(useBeacon = false) {
    if (this.queue.length === 0 || !this.isOnline) {
      return
    }
    const events = [...this.queue]
    this.queue = []
    try {
      if (useBeacon && navigator.sendBeacon) {
        // 使用 sendBeacon 在页面卸载时发送
        const blob = new Blob([JSON.stringify({ events })], { type: 'application/json' })
        navigator.sendBeacon('/api/analytics/collect', blob)
      }
      else {
        // 正常发送
        const response = await fetch('/api/analytics/collect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events }),
        })
        
        if (!response.ok) {
          throw new Error(`Analytics API error: ${response.status}`)
        }
      }
      
      // 重置重试计数
      this.retryCount = 0
    }
    catch (error) {
      console.error('Failed to send analytics:', error)
      
      // 重试逻辑
      if (this.retryCount < this.config.performance.retry_attempts) {
        this.retryCount++
        // 将事件放回队列
        this.queue.unshift(...events)
        // 指数退避重试
        setTimeout(() => this.flush(), Math.pow(2, this.retryCount) * 1000)
      }
    }
  }
  /**
   * 销毁采集器
   */
  public destroy() {
    // 发送剩余数据
    this.flush(true)
    
    // 清理定时器
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    // 清理事件监听器
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', () => {})
      window.removeEventListener('offline', () => {})
      window.removeEventListener('beforeunload', () => {})
    }
  }
}
// 导出单例
let collector: AnalyticsCollector | null = null

export function getAnalyticsCollector(config?: Partial<AnalyticsConfig>): AnalyticsCollector {
  if (!collector) {
    collector = new AnalyticsCollector(config)
  }
  return collector
}
export function destroyAnalyticsCollector() {
  if (collector) {
    collector.destroy()
    collector = null
  }
}