/**
 * 性能监控配置
 * 定义监控阈值、告警规则等配置
 */
import { MetricType, MonitoringConfig, AlertRule, PerformanceRating } from './types'

/**
 * 默认性能阈值（毫秒）
 * 基于 Web Vitals 推荐值
 */
export const DEFAULT_THRESHOLDS = {
  [MetricType.FCP]: { good: 1800, poor: 3000 },
  [MetricType.LCP]: { good: 2500, poor: 4000 },
  [MetricType.FID]: { good: 100, poor: 300 },
  [MetricType.CLS]: { good: 0.1, poor: 0.25 },
  [MetricType.TTFB]: { good: 800, poor: 1800 },
  [MetricType.INP]: { good: 200, poor: 500 },
  [MetricType.API_LATENCY]: { good: 200, poor: 1000 },
  [MetricType.API_ERROR_RATE]: { good: 0.01, poor: 0.05 }, // 1% 和 5%
}

/**
 * 默认告警规则
 */
export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'lcp-poor',
    name: 'LCP 性能差',
    description: '最大内容绘制时间超过 4 秒',
    metric_type: MetricType.LCP,
    condition: {
      operator: 'gt',
      threshold: 4000,
      duration: 300, // 持续 5 分钟
      occurrence: 3, // 发生 3 次
    },
    severity: 'error',
    channels: ['email', 'slack'],
    enabled: true,
  },
  {
    id: 'api-error-high',
    name: 'API 错误率过高',
    description: 'API 错误率超过 5%',
    metric_type: MetricType.API_ERROR_RATE,
    condition: {
      operator: 'gt',
      threshold: 0.05,
      duration: 180, // 持续 3 分钟
    },
    severity: 'critical',
    channels: ['email', 'slack', 'pagerduty'],
    enabled: true,
  },
  {
    id: 'api-latency-high',
    name: 'API 响应时间过长',
    description: 'API 平均响应时间超过 1 秒',
    metric_type: MetricType.API_LATENCY,
    condition: {
      operator: 'gt',
      threshold: 1000,
      duration: 300, // 持续 5 分钟
    },
    severity: 'warning',
    channels: ['slack'],
    enabled: true,
  },
  {
    id: 'memory-usage-high',
    name: '内存使用率过高',
    description: '内存使用率超过 85%',
    metric_type: MetricType.MEMORY_USAGE,
    condition: {
      operator: 'gt',
      threshold: 0.85,
      duration: 600, // 持续 10 分钟
    },
    severity: 'warning',
    channels: ['email'],
    enabled: true,
  },
  {
    id: 'crash-rate-high',
    name: '崩溃率过高',
    description: '应用崩溃率超过 1%',
    metric_type: MetricType.CRASH_RATE,
    condition: {
      operator: 'gt',
      threshold: 0.01,
      duration: 300,
    },
    severity: 'critical',
    channels: ['email', 'slack', 'pagerduty'],
    enabled: true,
  },
]

/**
 * 默认监控配置
 */
export const DEFAULT_CONFIG: MonitoringConfig = {
  collection: {
    enabled: true,
    sample_rate: 1.0, // 100% 采样
    endpoints: ['/api/*'],
    excluded_paths: [
      '/api/health',
      '/api/monitoring/*',
      '/_next/*',
      '/favicon.ico',
    ],
  },
  thresholds: DEFAULT_THRESHOLDS,
  alerting: {
    enabled: true,
    channels: [
      {
        id: 'email',
        type: 'email',
        config: {
          recipients: ['admin@example.com'],
          from: 'monitoring@example.com',
        },
        enabled: true,
      },
      {
        id: 'slack',
        type: 'slack',
        config: {
          webhook_url: process.env.SLACK_WEBHOOK_URL,
          channel: '#monitoring',
        },
        enabled: !!process.env.SLACK_WEBHOOK_URL,
      },
      {
        id: 'pagerduty',
        type: 'pagerduty',
        config: {
          api_key: process.env.PAGERDUTY_API_KEY,
          service_id: process.env.PAGERDUTY_SERVICE_ID,
        },
        enabled: !!process.env.PAGERDUTY_API_KEY,
      },
    ],
    rules: DEFAULT_ALERT_RULES,
  },
  reporting: {
    enabled: true,
    schedule: 'daily',
    recipients: ['admin@example.com'],
    include_metrics: [
      MetricType.FCP,
      MetricType.LCP,
      MetricType.FID,
      MetricType.CLS,
      MetricType.TTFB,
      MetricType.API_LATENCY,
      MetricType.API_ERROR_RATE,
      MetricType.ERROR_COUNT,
    ],
  },
}

/**
 * 获取性能评级
 */
export function getPerformanceRating(
  metricType: MetricType,
  value: number
): PerformanceRating {
  const thresholds = DEFAULT_THRESHOLDS[metricType]
  
  if (!thresholds) return PerformanceRating.GOOD
  
  if (value <= thresholds.good) {
    return PerformanceRating.GOOD
  }
  else if (value <= thresholds.poor) {
    return PerformanceRating.NEEDS_IMPROVEMENT
  }
  else {
    return PerformanceRating.POOR
  }
}

/**
 * 获取指标单位
 */
export function getMetricUnit(metricType: MetricType): string {
  switch (metricType) {
    case MetricType.FCP:
    case MetricType.LCP:
    case MetricType.FID:
    case MetricType.TTFB:
    case MetricType.INP:
    case MetricType.API_LATENCY:
    case MetricType.PAGE_LOAD_TIME:
    case MetricType.DB_QUERY_TIME:
      return 'ms'
      
    case MetricType.CLS:
      return 'score'
      
    case MetricType.API_ERROR_RATE:
    case MetricType.CACHE_HIT_RATE:
    case MetricType.CRASH_RATE:
    case MetricType.MEMORY_USAGE:
    case MetricType.CPU_USAGE:
      return '%'
      
    case MetricType.BANDWIDTH_USAGE:
      return 'bytes'
      
    case MetricType.USER_SESSION_DURATION:
      return 's'
      
    case MetricType.PAGE_VIEWS_PER_SESSION:
    case MetricType.ERROR_COUNT:
      return 'count'
      
    default:
      return 'unit'
  }
}

/**
 * 获取指标显示名称
 */
export function getMetricDisplayName(metricType: MetricType): string {
  const displayNames: Record<MetricType, string> = {
    [MetricType.FCP]: '首次内容绘制',
    [MetricType.LCP]: '最大内容绘制',
    [MetricType.FID]: '首次输入延迟',
    [MetricType.CLS]: '累积布局偏移',
    [MetricType.TTFB]: '首字节时间',
    [MetricType.INP]: '交互到下一次绘制',
    [MetricType.API_LATENCY]: 'API 延迟',
    [MetricType.API_ERROR_RATE]: 'API 错误率',
    [MetricType.PAGE_LOAD_TIME]: '页面加载时间',
    [MetricType.CACHE_HIT_RATE]: '缓存命中率',
    [MetricType.DB_QUERY_TIME]: '数据库查询时间',
    [MetricType.MEMORY_USAGE]: '内存使用率',
    [MetricType.CPU_USAGE]: 'CPU 使用率',
    [MetricType.BANDWIDTH_USAGE]: '带宽使用',
    [MetricType.USER_SESSION_DURATION]: '会话时长',
    [MetricType.PAGE_VIEWS_PER_SESSION]: '每会话页面浏览量',
    [MetricType.ERROR_COUNT]: '错误数量',
    [MetricType.CRASH_RATE]: '崩溃率',
  }
  
  return displayNames[metricType] || metricType
}

/**
 * 合并配置
 */
export function mergeConfig(
  custom?: Partial<MonitoringConfig>
): MonitoringConfig {
  if (!custom) return DEFAULT_CONFIG
  
  return {
    collection: {
      ...DEFAULT_CONFIG.collection,
      ...custom.collection,
    },
    thresholds: {
      ...DEFAULT_CONFIG.thresholds,
      ...custom.thresholds,
    },
    alerting: {
      ...DEFAULT_CONFIG.alerting,
      ...custom.alerting,
      channels: custom.alerting?.channels || DEFAULT_CONFIG.alerting.channels,
      rules: custom.alerting?.rules || DEFAULT_CONFIG.alerting.rules,
    },
    reporting: {
      ...DEFAULT_CONFIG.reporting,
      ...custom.reporting,
    },
  }
}

/**
 * 验证配置
 */
export function validateConfig(config: MonitoringConfig): string[] {
  const errors: string[] = []
  
  // 验证采样率
  if (config.collection.sample_rate < 0 || config.collection.sample_rate > 1) {
    errors.push('采样率必须在 0 到 1 之间')
  }
  
  // 验证阈值
  Object.entries(config.thresholds).forEach(([metric, threshold]) => {
    if (threshold.good >= threshold.poor) {
      errors.push(`${metric} 的 good 阈值必须小于 poor 阈值`)
    }
  })
  
  // 验证告警规则
  config.alerting.rules.forEach(rule => {
    if (!Object.values(MetricType).includes(rule.metric_type)) {
      errors.push(`无效的指标类型: ${rule.metric_type}`)
    }
    
    if (rule.condition.duration && rule.condition.duration < 0) {
      errors.push(`规则 ${rule.name} 的持续时间必须大于 0`)
    }
    
    const validChannels = config.alerting.channels.map(c => c.id)
    rule.channels.forEach(channelId => {
      if (!validChannels.includes(channelId)) {
        errors.push(`规则 ${rule.name} 引用了不存在的通道: ${channelId}`)
      }
    })
  })
  
  return errors
}

/**
 * 环境特定配置
 */
export function getEnvironmentConfig(): Partial<MonitoringConfig> {
  const env = process.env.NODE_ENV
  
  switch (env) {
    case 'development':
      return {
        collection: {
          enabled: true,
          sample_rate: 1.0, // 开发环境 100% 采样
          endpoints: ['/api/*'],
          excluded_paths: ['/api/health'],
        },
        alerting: {
          enabled: false, // 开发环境不启用告警
          channels: [],
          rules: [],
        },
      }
      
    case 'test':
      return {
        collection: {
          enabled: false, // 测试环境不采集
          sample_rate: 0,
          endpoints: [],
          excluded_paths: [],
        },
      }
      
    case 'production':
      return {
        collection: {
          enabled: true,
          sample_rate: 0.1, // 生产环境 10% 采样
          endpoints: ['/api/*'],
          excluded_paths: [
            '/api/health',
            '/api/monitoring/*',
            '/_next/*',
          ],
        },
      }
      
    default:
      return {}
  }
}