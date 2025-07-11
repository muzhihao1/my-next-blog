/**
 * 统计算法实现
 * 提供各种数据分析算法
 */
import { AnalyticsEvent, EventType, TimeGranularity } from './types'

/**
 * 时间序列数据点
 */
interface TimeSeriesPoint {
  timestamp: Date
  value: number
}

/**
 * 统计摘要
 */
interface StatisticsSummary {
  count: number
  sum: number
  mean: number
  median: number
  mode: number | null
  variance: number
  stdDev: number
  min: number
  max: number
  percentiles: {
    p25: number
    p50: number
    p75: number
    p90: number
    p95: number
    p99: number
  }
}

/**
 * 基础统计计算
 */
export class Statistics {
  /**
   * 计算平均值
   */
  static mean(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }
  
  /**
   * 计算中位数
   */
  static median(values: number[]): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }
  
  /**
   * 计算众数
   */
  static mode(values: number[]): number | null {
    if (values.length === 0) return null
    
    const frequency: Record<number, number> = {}
    values.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1
    })
    
    let maxFreq = 0
    let mode: number | null = null
    
    Object.entries(frequency).forEach(([val, freq]) => {
      if (freq > maxFreq) {
        maxFreq = freq
        mode = Number(val)
      }
    })
    
    return mode
  }
  
  /**
   * 计算方差
   */
  static variance(values: number[]): number {
    if (values.length === 0) return 0
    const mean = this.mean(values)
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  }
  
  /**
   * 计算标准差
   */
  static stdDev(values: number[]): number {
    return Math.sqrt(this.variance(values))
  }
  
  /**
   * 计算百分位数
   */
  static percentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0
    
    const sorted = [...values].sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index - lower
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight
  }
  
  /**
   * 计算完整统计摘要
   */
  static summary(values: number[]): StatisticsSummary {
    if (values.length === 0) {
      return {
        count: 0,
        sum: 0,
        mean: 0,
        median: 0,
        mode: null,
        variance: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        percentiles: {
          p25: 0,
          p50: 0,
          p75: 0,
          p90: 0,
          p95: 0,
          p99: 0,
        },
      }
    }
    
    const sorted = [...values].sort((a, b) => a - b)
    
    return {
      count: values.length,
      sum: values.reduce((sum, val) => sum + val, 0),
      mean: this.mean(values),
      median: this.median(values),
      mode: this.mode(values),
      variance: this.variance(values),
      stdDev: this.stdDev(values),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      percentiles: {
        p25: this.percentile(values, 25),
        p50: this.percentile(values, 50),
        p75: this.percentile(values, 75),
        p90: this.percentile(values, 90),
        p95: this.percentile(values, 95),
        p99: this.percentile(values, 99),
      },
    }
  }
}

/**
 * 时间序列分析
 */
export class TimeSeries {
  /**
   * 移动平均
   */
  static movingAverage(data: TimeSeriesPoint[], windowSize: number): TimeSeriesPoint[] {
    if (data.length < windowSize) return data
    
    const result: TimeSeriesPoint[] = []
    
    for (let i = windowSize - 1; i < data.length; i++) {
      const window = data.slice(i - windowSize + 1, i + 1)
      const sum = window.reduce((acc, point) => acc + point.value, 0)
      result.push({
        timestamp: data[i].timestamp,
        value: sum / windowSize,
      })
    }
    
    return result
  }
  
  /**
   * 指数移动平均
   */
  static exponentialMovingAverage(data: TimeSeriesPoint[], alpha: number): TimeSeriesPoint[] {
    if (data.length === 0) return []
    
    const result: TimeSeriesPoint[] = [data[0]]
    
    for (let i = 1; i < data.length; i++) {
      const ema = alpha * data[i].value + (1 - alpha) * result[i - 1].value
      result.push({
        timestamp: data[i].timestamp,
        value: ema,
      })
    }
    
    return result
  }
  
  /**
   * 趋势检测
   */
  static detectTrend(data: TimeSeriesPoint[], threshold = 0.1): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable'
    
    // 计算线性回归
    const n = data.length
    const xValues = data.map((_, i) => i)
    const yValues = data.map(p => p.value)
    
    const sumX = xValues.reduce((sum, x) => sum + x, 0)
    const sumY = yValues.reduce((sum, y) => sum + y, 0)
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    
    if (Math.abs(slope) < threshold) return 'stable'
    return slope > 0 ? 'increasing' : 'decreasing'
  }
  
  /**
   * 季节性分解
   */
  static seasonalDecomposition(data: TimeSeriesPoint[], period: number) {
    const trend = this.movingAverage(data, period)
    const detrended = data.map((point, i) => ({
      timestamp: point.timestamp,
      value: point.value - (trend[i - Math.floor(period / 2)]?.value || point.value),
    }))
    
    // 计算季节性成分
    const seasonal: number[] = []
    
    for (let i = 0; i < period; i++) {
      const values = detrended.filter((_, index) => index % period === i).map(p => p.value)
      seasonal.push(Statistics.mean(values))
    }
    
    // 计算残差
    const residual = data.map((point, i) => ({
      timestamp: point.timestamp,
      value: point.value - (trend[i - Math.floor(period / 2)]?.value || 0) - seasonal[i % period],
    }))
    
    return { trend, seasonal, residual }
  }
}

/**
 * 用户行为分析
 */
export class UserBehaviorAnalysis {
  /**
   * 计算用户留存率
   */
  static calculateRetention(
    cohortUsers: Set<string>,
    activeUsers: Set<string>
  ): number {
    if (cohortUsers.size === 0) return 0
    const retainedUsers = [...cohortUsers].filter(user => activeUsers.has(user))
    return retainedUsers.length / cohortUsers.size
  }

  /**
   * 计算用户生命周期价值（简化版）
   */
  static calculateLTV(
    avgRevenuePerUser: number,
    avgRetentionRate: number,
    discountRate = 0.1
  ): number {
    // LTV = ARPU / (1 - 留存率 + 折扣率)
    return avgRevenuePerUser / (1 - avgRetentionRate + discountRate)
  }

  /**
   * 用户分群
   */
  static segmentUsers(events: AnalyticsEvent[]) {
    const userSegments = new Map<string, {
      activityLevel: 'high' | 'medium' | 'low'
      engagement: number
      lastActive: Date
      totalEvents: number
    }>()

    // 按用户分组事件
    const userEvents = new Map<string, AnalyticsEvent[]>()
    events.forEach(event => {
      const userId = event.user_id || event.anonymous_id
      if (!userEvents.has(userId)) {
        userEvents.set(userId, [])
      }
      userEvents.get(userId)!.push(event)
    })

    // 分析每个用户
    userEvents.forEach((events, userId) => {
      const totalEvents = events.length
      const lastActive = new Date(Math.max(...events.map(e => new Date(e.timestamp).getTime())))
      
      // 计算参与度分数
      const uniqueDays = new Set(events.map(e => 
        new Date(e.timestamp).toISOString().split('T')[0]
      )).size
      const engagement = uniqueDays / 30 // 假设分析30天数据
      
      // 确定活跃度等级
      let activityLevel: 'high' | 'medium' | 'low'
      if (totalEvents > 100 && engagement > 0.5) {
        activityLevel = 'high'
      }
      else if (totalEvents > 20 && engagement > 0.2) {
        activityLevel = 'medium'
      }
      else {
        activityLevel = 'low'
      }
      
      userSegments.set(userId, {
        activityLevel,
        engagement,
        lastActive,
        totalEvents,
      })
    })

    return userSegments
  }

  /**
   * 计算用户路径
   */
  static calculateUserPaths(events: AnalyticsEvent[], maxSteps = 5) {
    const paths = new Map<string, number>()
    
    // 按会话分组
    const sessionEvents = new Map<string, AnalyticsEvent[]>()
    events.forEach(event => {
      if (!sessionEvents.has(event.session_id)) {
        sessionEvents.set(event.session_id, [])
      }
      sessionEvents.get(event.session_id)!.push(event)
    })
    
    // 分析每个会话的路径
    sessionEvents.forEach(events => {
      // 按时间排序
      events.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      
      // 提取页面路径
      const pagePaths = events
        .filter(e => e.event_type === EventType.PAGE_VIEW)
        .map(e => e.page.path)
        .slice(0, maxSteps)
        
      if (pagePaths.length > 1) {
        const pathKey = pagePaths.join(' → ')
        paths.set(pathKey, (paths.get(pathKey) || 0) + 1)
      }
    })
    
    // 排序返回最常见路径
    return Array.from(paths.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
  }
}

/**
 * 内容分析
 */
export class ContentAnalysis {
  /**
   * 计算内容表现分数
   */
  static calculateContentScore(metrics: {
    views: number
    reads: number
    avgReadTime: number
    shares: number
    comments: number
  }): number {
    // 权重配置
    const weights = {
      views: 0.2,
      readRate: 0.3,
      readTime: 0.2,
      shares: 0.2,
      comments: 0.1,
    }
    
    // 归一化指标
    const readRate = metrics.reads / Math.max(metrics.views, 1)
    const normalizedReadTime = Math.min(metrics.avgReadTime / 300, 1) // 假设5分钟为满分
    const normalizedShares = Math.min(metrics.shares / 10, 1) // 假设10次分享为满分
    const normalizedComments = Math.min(metrics.comments / 5, 1) // 假设5条评论为满分
    const normalizedViews = Math.min(metrics.views / 1000, 1) // 假设1000次浏览为满分
    
    // 计算加权分数
    const score = 
      weights.views * normalizedViews +
      weights.readRate * readRate +
      weights.readTime * normalizedReadTime +
      weights.shares * normalizedShares +
      weights.comments * normalizedComments
      
    return Math.round(score * 100)
  }

  /**
   * 计算趋势分数（用于热门内容）
   */
  static calculateTrendScore(
    recentViews: number,
    totalViews: number,
    ageInHours: number,
    gravity = 1.8
  ): number {
    // Reddit/HackerNews 风格的趋势算法
    const score = (recentViews - 1) / Math.pow(ageInHours + 2, gravity)
    return score * 1000 // 放大便于比较
  }
  
  /**
   * 主题聚类（简化版）
   */
  static clusterContentByTopic(contents: Array<{
    id: string
    tags: string[]
    title: string
  }>) {
    const clusters = new Map<string, string[]>()
    
    // 基于标签的简单聚类
    contents.forEach(content => {
      content.tags.forEach(tag => {
        if (!clusters.has(tag)) {
          clusters.set(tag, [])
        }
        clusters.get(tag)!.push(content.id)
      })
    })
    
    // 计算标签相似度并合并相近的聚类
    const mergedClusters = new Map<string, {
      contents: string[]
      relatedTags: string[]
    }>()
    
    clusters.forEach((contentIds, tag) => {
      // 找到相关标签
      const relatedTags = new Set<string>()
      contentIds.forEach(contentId => {
        const content = contents.find(c => c.id === contentId)
        content?.tags.forEach(t => {
          if (t !== tag) relatedTags.add(t)
        })
      })
      
      mergedClusters.set(tag, {
        contents: contentIds,
        relatedTags: Array.from(relatedTags),
      })
    })
    
    return mergedClusters
  }
}

/**
 * 转化漏斗分析
 */
export class FunnelAnalysis {
  /**
   * 计算漏斗转化率
   */
  static calculateFunnel(
    events: AnalyticsEvent[],
    steps: Array<{
      name: string;
      eventType: EventType;
      filter?: (event: AnalyticsEvent) => boolean
    }>
  ) {
    const funnel = steps.map(step => ({
      ...step,
      users: new Set<string>(),
      count: 0,
    }))
    
    // 按用户和会话分组
    const userSessions = new Map<string, Map<string, AnalyticsEvent[]>>()
    events.forEach(event => {
      const userId = event.user_id || event.anonymous_id
      if (!userSessions.has(userId)) {
        userSessions.set(userId, new Map())
      }
      if (!userSessions.get(userId)!.has(event.session_id)) {
        userSessions.get(userId)!.set(event.session_id, [])
      }
      userSessions.get(userId)!.get(event.session_id)!.push(event)
    })
    
    // 分析每个用户的转化路径
    userSessions.forEach((sessions, userId) => {
      sessions.forEach(sessionEvents => {
        // 按时间排序
        sessionEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        
        let currentStep = 0
        for (const event of sessionEvents) {
          if (currentStep >= steps.length) break
          
          const step = steps[currentStep]
          if (event.event_type === step.eventType && (!step.filter || step.filter(event))) {
            funnel[currentStep].users.add(userId)
            funnel[currentStep].count++
            currentStep++
          }
        }
      })
    })
    
    // 计算转化率
    const results = funnel.map((step, index) => ({
      name: step.name,
      users: step.users.size,
      events: step.count,
      conversionRate: index === 0 ? 1 : step.users.size / Math.max(funnel[0].users.size, 1),
      dropoffRate: index === 0 ? 0 : 1 - (step.users.size / Math.max(funnel[index - 1].users.size, 1)),
    }))
    
    return results
  }
}

/**
 * 异常检测
 */
export class AnomalyDetection {
  /**
   * Z-Score 异常检测
   */
  static detectAnomaliesZScore(values: number[], threshold = 3): number[] {
    const mean = Statistics.mean(values)
    const stdDev = Statistics.stdDev(values)
    
    return values
      .map((value, index) => ({ value, index, zScore: Math.abs((value - mean) / stdDev) }))
      .filter(item => item.zScore > threshold)
      .map(item => item.index)
  }
  /**
   * 四分位数异常检测
   */
  static detectAnomaliesIQR(values: number[], factor = 1.5): number[] {
    const q1 = Statistics.percentile(values, 25)
    const q3 = Statistics.percentile(values, 75)
    const iqr = q3 - q1
    const lowerBound = q1 - factor * iqr
    const upperBound = q3 + factor * iqr
    
    return values
      .map((value, index) => ({ value, index }))
      .filter(item => item.value < lowerBound || item.value > upperBound)
      .map(item => item.index)
  }
  /**
   * 时间序列异常检测（基于移动平均）
   */
  static detectTimeSeriesAnomalies(
    data: TimeSeriesPoint[],
    windowSize = 7,
    threshold = 2
  ): number[] {
    const movingAvg = TimeSeries.movingAverage(data, windowSize)
    const anomalies: number[] = []
    
    for (let i = windowSize - 1; i < data.length; i++) {
      const expected = movingAvg[i - windowSize + 1].value
      const actual = data[i].value
      const deviation = Math.abs(actual - expected) / expected
      
      if (deviation > threshold) {
        anomalies.push(i)
      }
    }
    
    return anomalies
  }
}