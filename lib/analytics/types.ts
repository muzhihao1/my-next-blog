/**
 * 数据分析类型定义
 * 定义所有分析相关的TypeScript类型
 */

/**
 * 事件类型枚举
 */
export enum EventType {
  // 页面事件
  PAGE_VIEW = 'page_view',
  PAGE_EXIT = 'page_exit',
  
  // 用户交互
  CLICK = 'click',
  SCROLL = 'scroll',
  FORM_SUBMIT = 'form_submit',
  
  // 内容交互
  POST_VIEW = 'post_view',
  POST_READ = 'post_read',
  COMMENT_CREATE = 'comment_create',
  LIKE = 'like',
  SHARE = 'share',
  
  // 搜索事件
  SEARCH = 'search',
  SEARCH_RESULT_CLICK = 'search_result_click',
  
  // 用户行为
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  
  // 性能事件
  PERFORMANCE = 'performance',
  ERROR = 'error',
}

/**
 * 基础事件数据结构
 */
export interface AnalyticsEvent {
  // 基础字段
  id?: string
  event_type: EventType
  timestamp: Date | string
  session_id: string
  user_id?: string
  anonymous_id: string
  
  // 设备和环境信息
  device: DeviceInfo
  location: LocationInfo
  
  // 事件特定数据
  properties: Record<string, any>
  
  // 页面信息
  page: PageInfo
  
  // 引荐信息
  referrer?: ReferrerInfo
}

/**
 * 设备信息
 */
export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet'
  os: string
  os_version: string
  browser: string
  browser_version: string
  screen_width: number
  screen_height: number
  viewport_width: number
  viewport_height: number
  language: string
  timezone: string
}

/**
 * 位置信息
 */
export interface LocationInfo {
  country?: string
  region?: string
  city?: string
  ip?: string
}

/**
 * 页面信息
 */
export interface PageInfo {
  url: string
  path: string
  title: string
  host: string
  search?: string
  hash?: string
}

/**
 * 引荐信息
 */
export interface ReferrerInfo {
  url: string
  source?: string
  medium?: string
  campaign?: string
}

/**
 * 会话信息
 */
export interface SessionInfo {
  id: string
  user_id?: string
  anonymous_id: string
  started_at: Date
  last_activity_at: Date
  page_views: number
  events_count: number
  duration: number
  is_bounce: boolean
}

/**
 * 页面浏览事件
 */
export interface PageViewEvent extends AnalyticsEvent {
  event_type: EventType.PAGE_VIEW
  properties: {
    duration?: number
    scroll_depth?: number
    exit_page?: boolean
  }
}

/**
 * 文章浏览事件
 */
export interface PostViewEvent extends AnalyticsEvent {
  event_type: EventType.POST_VIEW
  properties: {
    post_id: string
    post_title: string
    post_slug: string
    author_id?: string
    tags?: string[]
    word_count?: number
    estimated_read_time?: number
  }
}

/**
 * 文章阅读完成事件
 */
export interface PostReadEvent extends AnalyticsEvent {
  event_type: EventType.POST_READ
  properties: {
    post_id: string
    read_time: number
    scroll_depth: number
    engagement_score: number
  }
}

/**
 * 搜索事件
 */
export interface SearchEvent extends AnalyticsEvent {
  event_type: EventType.SEARCH
  properties: {
    query: string
    results_count: number
    filters?: Record<string, any>
    search_type?: 'instant' | 'full'
  }
}

/**
 * 性能事件
 */
export interface PerformanceEvent extends AnalyticsEvent {
  event_type: EventType.PERFORMANCE
  properties: {
    metric_type: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB'
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
  }
}

/**
 * 错误事件
 */
export interface ErrorEvent extends AnalyticsEvent {
  event_type: EventType.ERROR
  properties: {
    error_type: 'javascript' | 'network' | 'resource'
    message: string
    stack?: string
    source?: string
    line?: number
    column?: number
  }
}

/**
 * 聚合数据时间粒度
 */
export enum TimeGranularity {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

/**
 * 聚合统计数据
 */
export interface AggregatedStats {
  time_period: {
    start: Date
    end: Date
    granularity: TimeGranularity
  }
  
  // 基础指标
  total_views: number
  unique_visitors: number
  total_sessions: number
  avg_session_duration: number
  bounce_rate: number
  
  // 内容指标
  total_post_views: number
  total_post_reads: number
  avg_read_time: number
  engagement_rate: number
  
  // 用户指标
  new_users: number
  returning_users: number
  user_retention_rate: number
  
  // 设备分布
  device_breakdown: Record<string, number>
  browser_breakdown: Record<string, number>
  os_breakdown: Record<string, number>
  
  // 地理分布
  country_breakdown: Record<string, number>
  
  // 热门内容
  top_posts: Array<{
    post_id: string
    views: number
    reads: number
    avg_read_time: number
  }>
  
  // 搜索分析
  top_searches: Array<{
    query: string
    count: number
    click_through_rate: number
  }>
}

/**
 * 实时统计数据
 */
export interface RealtimeStats {
  current_active_users: number
  current_page_views: Array<{
    path: string
    count: number
  }>
  recent_events: AnalyticsEvent[]
  trending_posts: Array<{
    post_id: string
    trend_score: number
  }>
}

/**
 * 导出配置
 */
export interface ExportConfig {
  format: 'json' | 'csv' | 'excel'
  time_range: {
    start: Date
    end: Date
  }
  metrics: string[]
  filters?: Record<string, any>
  include_raw_data?: boolean
}

/**
 * 分析配置
 */
export interface AnalyticsConfig {
  // 采集配置
  collection: {
    enabled: boolean
    sample_rate: number
    excluded_paths: string[]
    custom_dimensions: Record<string, any>
  }
  
  // 隐私配置
  privacy: {
    anonymize_ip: boolean
    respect_dnt: boolean
    cookie_consent_required: boolean
  }
  
  // 性能配置
  performance: {
    batch_size: number
    flush_interval: number
    max_queue_size: number
    retry_attempts: number
  }
}