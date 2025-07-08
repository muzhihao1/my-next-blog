/**
 * 性能监控类型定义
 * 定义所有性能监控相关的TypeScript类型
 */

/**
 * 监控指标类型
 */
export enum MetricType {
  // Web Vitals
  FCP = 'first_contentful_paint',
  LCP = 'largest_contentful_paint',
  FID = 'first_input_delay',
  CLS = 'cumulative_layout_shift',
  TTFB = 'time_to_first_byte',
  INP = 'interaction_to_next_paint',
  
  // 自定义性能指标
  API_LATENCY = 'api_latency',
  API_ERROR_RATE = 'api_error_rate',
  PAGE_LOAD_TIME = 'page_load_time',
  CACHE_HIT_RATE = 'cache_hit_rate',
  DB_QUERY_TIME = 'db_query_time',
  
  // 资源指标
  MEMORY_USAGE = 'memory_usage',
  CPU_USAGE = 'cpu_usage',
  BANDWIDTH_USAGE = 'bandwidth_usage',
  
  // 业务指标
  USER_SESSION_DURATION = 'user_session_duration',
  PAGE_VIEWS_PER_SESSION = 'page_views_per_session',
  ERROR_COUNT = 'error_count',
  CRASH_RATE = 'crash_rate',
}

/**
 * 性能评级
 */
export enum PerformanceRating {
  GOOD = 'good',
  NEEDS_IMPROVEMENT = 'needs-improvement',
  POOR = 'poor',
}

/**
 * 监控数据点
 */
export interface MetricDataPoint {
  id?: string
  metric_type: MetricType
  value: number
  unit: string
  rating?: PerformanceRating
  timestamp: Date | string
  
  // 上下文信息
  context: {
    page?: string
    api_endpoint?: string
    user_id?: string
    session_id?: string
    device_type?: string
    browser?: string
    connection_type?: string
    country?: string
  }
  
  // 元数据
  metadata?: Record<string, any>
}

/**
 * Web Vitals 指标
 */
export interface WebVitalsMetric {
  id: string
  name: string
  value: number
  rating: PerformanceRating
  delta: number
  entries: PerformanceEntry[]
}

/**
 * API 性能指标
 */
export interface APIMetric {
  endpoint: string
  method: string
  status_code: number
  duration: number
  timestamp: Date
  
  // 详细信息
  request_size?: number
  response_size?: number
  error?: string
  trace_id?: string
}

/**
 * 资源使用指标
 */
export interface ResourceMetric {
  timestamp: Date
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    usage: number
    cores: number
  }
  bandwidth: {
    incoming: number
    outgoing: number
  }
}

/**
 * 错误指标
 */
export interface ErrorMetric {
  id: string
  type: 'javascript' | 'network' | 'resource' | 'api'
  message: string
  stack?: string
  source?: string
  line?: number
  column?: number
  timestamp: Date
  
  // 上下文
  url: string
  user_agent: string
  user_id?: string
  session_id?: string
  
  // 影响
  affected_users: number
  occurrence_count: number
}

/**
 * 监控配置
 */
export interface MonitoringConfig {
  // 采集配置
  collection: {
    enabled: boolean
    sample_rate: number
    endpoints: string[]
    excluded_paths: string[]
  }
  
  // 性能阈值
  thresholds: {
    [MetricType.FCP]: { good: number; poor: number }
    [MetricType.LCP]: { good: number; poor: number }
    [MetricType.FID]: { good: number; poor: number }
    [MetricType.CLS]: { good: number; poor: number }
    [MetricType.TTFB]: { good: number; poor: number }
    [MetricType.INP]: { good: number; poor: number }
    [MetricType.API_LATENCY]: { good: number; poor: number }
    [MetricType.API_ERROR_RATE]: { good: number; poor: number }
  }
  
  // 告警配置
  alerting: {
    enabled: boolean
    channels: AlertChannel[]
    rules: AlertRule[]
  }
  
  // 报告配置
  reporting: {
    enabled: boolean
    schedule: 'hourly' | 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    include_metrics: MetricType[]
  }
}

/**
 * 告警通道
 */
export interface AlertChannel {
  id: string
  type: 'email' | 'webhook' | 'slack' | 'pagerduty'
  config: Record<string, any>
  enabled: boolean
}

/**
 * 告警规则
 */
export interface AlertRule {
  id: string
  name: string
  description?: string
  metric_type: MetricType
  condition: {
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq'
    threshold: number
    duration?: number // 持续时间（秒）
    occurrence?: number // 发生次数
  }
  severity: 'info' | 'warning' | 'error' | 'critical'
  channels: string[] // 告警通道ID
  enabled: boolean
}

/**
 * 告警事件
 */
export interface Alert {
  id: string
  rule_id: string
  rule_name: string
  metric_type: MetricType
  severity: 'info' | 'warning' | 'error' | 'critical'
  status: 'open' | 'acknowledged' | 'resolved'
  
  // 触发信息
  triggered_at: Date
  triggered_value: number
  threshold_value: number
  
  // 解决信息
  acknowledged_at?: Date
  acknowledged_by?: string
  resolved_at?: Date
  resolved_by?: string
  
  // 上下文
  context: Record<string, any>
  
  // 通知历史
  notifications: Array<{
    channel: string
    sent_at: Date
    status: 'success' | 'failed'
    error?: string
  }>
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  id: string
  period: {
    start: Date
    end: Date
    type: 'hourly' | 'daily' | 'weekly' | 'monthly'
  }
  
  // 概览
  summary: {
    overall_score: number
    rating: PerformanceRating
    key_insights: string[]
  }
  
  // Web Vitals
  web_vitals: {
    fcp: MetricSummary
    lcp: MetricSummary
    fid: MetricSummary
    cls: MetricSummary
    ttfb: MetricSummary
    inp: MetricSummary
  }
  
  // API 性能
  api_performance: {
    average_latency: number
    p95_latency: number
    p99_latency: number
    error_rate: number
    total_requests: number
    top_slow_endpoints: Array<{
      endpoint: string
      avg_duration: number
      count: number
    }>
  }
  
  // 错误分析
  error_analysis: {
    total_errors: number
    error_rate: number
    top_errors: Array<{
      message: string
      count: number
      affected_users: number
    }>
    error_trend: 'increasing' | 'stable' | 'decreasing'
  }
  
  // 用户体验
  user_experience: {
    average_session_duration: number
    bounce_rate: number
    pages_per_session: number
    slowest_pages: Array<{
      path: string
      avg_load_time: number
      views: number
    }>
  }
  
  // 资源使用
  resource_usage: {
    memory: ResourceSummary
    cpu: ResourceSummary
    bandwidth: ResourceSummary
  }
  
  // 建议
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    category: string
    issue: string
    suggestion: string
    potential_impact: string
  }>
  
  generated_at: Date
}

/**
 * 指标摘要
 */
export interface MetricSummary {
  average: number
  median: number
  p75: number
  p90: number
  p95: number
  p99: number
  min: number
  max: number
  count: number
  rating_distribution: {
    good: number
    needs_improvement: number
    poor: number
  }
}

/**
 * 资源摘要
 */
export interface ResourceSummary {
  average: number
  peak: number
  percentile_95: number
  trend: 'increasing' | 'stable' | 'decreasing'
}

/**
 * 实时监控仪表板数据
 */
export interface RealtimeDashboard {
  // 当前状态
  status: {
    overall_health: 'healthy' | 'degraded' | 'unhealthy'
    active_alerts: number
    uptime_percentage: number
  }
  
  // 实时指标
  current_metrics: {
    active_users: number
    requests_per_second: number
    average_response_time: number
    error_rate: number
  }
  
  // 最近事件
  recent_events: Array<{
    type: 'metric' | 'alert' | 'error'
    message: string
    timestamp: Date
    severity?: string
  }>
  
  // 趋势图表数据
  charts: {
    response_time: TimeSeriesData[]
    error_rate: TimeSeriesData[]
    active_users: TimeSeriesData[]
    request_volume: TimeSeriesData[]
  }
}

/**
 * 时间序列数据
 */
export interface TimeSeriesData {
  timestamp: Date
  value: number
  label?: string
}

/**
 * 监控会话
 */
export interface MonitoringSession {
  id: string
  start_time: Date
  end_time?: Date
  metrics_collected: number
  errors_captured: number
  alerts_triggered: number
}

/**
 * 性能预算
 */
export interface PerformanceBudget {
  metric: MetricType
  budget: number
  unit: string
  current_value: number
  remaining: number
  percentage_used: number
  status: 'under' | 'near' | 'over'
}