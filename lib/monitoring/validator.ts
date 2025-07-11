/**
 * 监控数据验证器
 * 验证监控指标数据的有效性
 */
import { MetricDataPoint, MetricType } from './types'

/**
 * 验证错误
 */
export interface ValidationError {
  field: string
  message: string
  value?: any
}

/**
 * 验证监控指标数组
 */
export function validateMetrics(metrics: any[]): ValidationError[] {
  const errors: ValidationError[] = []
  
  metrics.forEach((metric, index) => {
    const metricErrors = validateMetric(metric)
    errors.push(...metricErrors.map(err => ({
      ...err,
      field: `metrics[${index}
}].${err.field}`,
    })))
  })
  
  return errors
}

/**
 * 验证单个监控指标
 */
export function validateMetric(metric: any): ValidationError[] {
  const errors: ValidationError[] = []
  
  // 验证必需字段
  if (!metric.metric_type) {
    errors.push({
      field: 'metric_type',
      message: '指标类型不能为空',
    })
  }
  else if (!Object.values(MetricType).includes(metric.metric_type)) {
    errors.push({
      field: 'metric_type',
      message: '无效的指标类型',
      value: metric.metric_type,
    })
  }
  
  if (metric.value === undefined || metric.value === null) {
    errors.push({
      field: 'value',
      message: '指标值不能为空',
    })
  }
  else if (typeof metric.value !== 'number') {
    errors.push({
      field: 'value',
      message: '指标值必须是数字',
      value: metric.value,
    })
  }
  else if (!isFinite(metric.value)) {
    errors.push({
      field: 'value',
      message: '指标值必须是有限数字',
      value: metric.value,
    })
  }
  
  if (!metric.timestamp) {
    errors.push({
      field: 'timestamp',
      message: '时间戳不能为空',
    })
  }
  else {
    const timestamp = new Date(metric.timestamp)
    if (isNaN(timestamp.getTime())) {
      errors.push({
        field: 'timestamp',
        message: '无效的时间戳格式',
        value: metric.timestamp,
      })
    }
    else {
      // 检查时间戳是否在合理范围内（不能是未来时间，不能太旧）
      const now = Date.now()
      const timestampMs = timestamp.getTime()
      const oneHourAgo = now - 60 * 60 * 1000
      const oneHourLater = now + 60 * 60 * 1000 // 允许1小时的时钟偏差
      
      if (timestampMs > oneHourLater) {
        errors.push({
          field: 'timestamp',
          message: '时间戳不能是未来时间',
          value: metric.timestamp,
        })
      }
      else if (timestampMs < oneHourAgo) {
        errors.push({
          field: 'timestamp',
          message: '时间戳太旧（超过1小时）',
          value: metric.timestamp,
        })
      }
    }
  }
  
  // 验证上下文
  if (metric.context && typeof metric.context !== 'object') {
    errors.push({
      field: 'context',
      message: '上下文必须是对象',
      value: metric.context,
    })
  }
  
  // 验证特定指标类型的值范围
  if (metric.metric_type && metric.value !== undefined) {
    const rangeError = validateMetricValueRange(metric.metric_type, metric.value)
    if (rangeError) {
      errors.push({
        field: 'value',
        message: rangeError,
        value: metric.value,
      })
    }
  }
  
  return errors
}

/**
 * 验证指标值范围
 */
function validateMetricValueRange(metricType: MetricType, value: number): string | null {
  switch (metricType) {
    case MetricType.CLS:
      // CLS 通常在 0-1 之间，但可能更高
      if (value < 0) {
        return 'CLS 值不能为负数'
      }
      if (value > 10) {
        return 'CLS 值异常高，请检查数据'
      }
      break
    case MetricType.API_ERROR_RATE:
    case MetricType.CACHE_HIT_RATE:
    case MetricType.CRASH_RATE:
    case MetricType.MEMORY_USAGE:
    case MetricType.CPU_USAGE:
      // 百分比值应该在 0-1 之间
      if (value < 0 || value > 1) {
        return '百分比值必须在 0-1 之间'
      }
      break
    case MetricType.FCP:
    case MetricType.LCP:
    case MetricType.FID:
    case MetricType.TTFB:
    case MetricType.INP:
    case MetricType.API_LATENCY:
    case MetricType.PAGE_LOAD_TIME:
    case MetricType.DB_QUERY_TIME:
      // 时间值应该为正数，且有合理上限
      if (value < 0) {
        return '时间值不能为负数'
      }
      if (value > 60000) { // 60秒
        return '时间值异常高（超过60秒），请检查数据'
      }
      break
    case MetricType.ERROR_COUNT:
    case MetricType.PAGE_VIEWS_PER_SESSION:
      // 计数值应该为非负整数
      if (value < 0) {
        return '计数值不能为负数'
      }
      if (!Number.isInteger(value)) {
        return '计数值必须是整数'
      }
      break
    case MetricType.USER_SESSION_DURATION:
      // 会话时长应该为正数
      if (value < 0) {
        return '会话时长不能为负数'
      }
      if (value > 86400) { // 24小时
        return '会话时长异常高（超过24小时），请检查数据'
      }
      break
    case MetricType.BANDWIDTH_USAGE:
      // 带宽使用应该为非负数
      if (value < 0) {
        return '带宽使用量不能为负数'
      }
      break
  }
  
  return null
}

/**
 * 验证 API 指标
 */
export function validateAPIMetric(metric: any): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!metric.endpoint) {
    errors.push({
      field: 'endpoint',
      message: 'API 端点不能为空',
    })
  }
  
  if (!metric.method) {
    errors.push({
      field: 'method',
      message: 'HTTP 方法不能为空',
    })
  }
  else if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].includes(metric.method)) {
    errors.push({
      field: 'method',
      message: '无效的 HTTP 方法',
      value: metric.method,
    })
  }
  
  if (metric.status_code === undefined) {
    errors.push({
      field: 'status_code',
      message: '状态码不能为空',
    })
  }
  else if (!Number.isInteger(metric.status_code) || metric.status_code < 100 || metric.status_code > 599) {
    errors.push({
      field: 'status_code',
      message: '无效的 HTTP 状态码',
      value: metric.status_code,
    })
  }
  
  if (metric.duration !== undefined && metric.duration < 0) {
    errors.push({
      field: 'duration',
      message: '请求时长不能为负数',
      value: metric.duration,
    })
  }
  
  return errors
}

/**
 * 验证错误指标
 */
export function validateErrorMetric(metric: any): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!metric.type) {
    errors.push({
      field: 'type',
      message: '错误类型不能为空',
    })
  }
  else if (!['javascript', 'network', 'resource', 'api'].includes(metric.type)) {
    errors.push({
      field: 'type',
      message: '无效的错误类型',
      value: metric.type,
    })
  }
  
  if (!metric.message) {
    errors.push({
      field: 'message',
      message: '错误信息不能为空',
    })
  }
  
  return errors
}

/**
 * 清理和规范化指标数据
 */
export function sanitizeMetric(metric: any): MetricDataPoint {
  return {
    metric_type: metric.metric_type,
    value: Number(metric.value),
    unit: metric.unit || 'unit',
    rating: metric.rating,
    timestamp: new Date(metric.timestamp),
    context: {
      page: metric.context?.page,
      api_endpoint: metric.context?.api_endpoint,
      user_id: metric.context?.user_id,
      session_id: metric.context?.session_id,
      device_type: metric.context?.device_type,
      browser: metric.context?.browser,
      connection_type: metric.context?.connection_type,
      country: metric.context?.country,
    },
    metadata: metric.metadata || {},
  }
}