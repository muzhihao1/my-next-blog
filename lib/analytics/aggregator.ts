/**
 * 数据聚合服务
 * 定期聚合分析数据，生成统计报告
 */
import { createClient }
from '@/lib/supabase/server' 

import { AggregatedStats, TimeGranularity, RealtimeStats, EventType, AnalyticsEvent }
from './types' 

import { Statistics, TimeSeries, UserBehaviorAnalysis, ContentAnalysis, FunnelAnalysis, AnomalyDetection }
from './algorithms'

/**
 * 数据聚合器
 */
export class AnalyticsAggregator {
  private supabase: any
  
  constructor() {
    this.initializeSupabase()
  }
  
  private async initializeSupabase() {
    this.supabase = await createClient()
  }
  
  /**
   * 聚合统计数据
   */
  async aggregateStats(
    startDate: Date,
    endDate: Date,
    granularity: TimeGranularity
  ): Promise<AggregatedStats> {
    // 获取时间范围内的所有事件
    const { data: events, error } = await this.supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true })
      
    if (error) {
      console.error('Failed to fetch analytics events:', error)
      throw error
    }
    
    // 基础指标
    const pageViews = events.filter((e: AnalyticsEvent) => e.event_type === EventType.PAGE_VIEW)
    const uniqueVisitors = new Set(events.map((e: AnalyticsEvent) => e.anonymous_id))
    const sessions = new Set(events.map((e: AnalyticsEvent) => e.session_id))
    
    // 计算会话时长
    const sessionDurations = await this.calculateSessionDurations(Array.from(sessions))
    const avgSessionDuration = Statistics.mean(sessionDurations)
    
    // 计算跳出率
    const bounceRate = await this.calculateBounceRate(Array.from(sessions))
    
    // 内容指标
    const postViews = events.filter((e: AnalyticsEvent) => e.event_type === EventType.POST_VIEW)
    const postReads = events.filter((e: AnalyticsEvent) => e.event_type === EventType.POST_READ)
    const readTimes = postReads.map((e: AnalyticsEvent) => e.properties.read_time || 0)
    const avgReadTime = Statistics.mean(readTimes)
    
    // 计算参与度
    const engagementRate = await this.calculateEngagementRate(events)
    
    // 用户指标
    const { newUsers, returningUsers } = await this.calculateUserMetrics(events, startDate)
    const retentionRate = await this.calculateRetentionRate(startDate, endDate)
    
    // 设备和浏览器分布
    const deviceBreakdown = this.calculateBreakdown(events, 'device.type')
    const browserBreakdown = this.calculateBreakdown(events, 'device.browser')
    const osBreakdown = this.calculateBreakdown(events, 'device.os')
    
    // 地理分布
    const countryBreakdown = this.calculateBreakdown(events, 'location.country')
    
    // 热门内容
    const topPosts = await this.calculateTopPosts(postViews, postReads)
    
    // 热门搜索
    const topSearches = await this.calculateTopSearches(events)
    
    return {
      time_period: {
        start: startDate,
        end: endDate,
        granularity,
      },
      total_views: pageViews.length,
      unique_visitors: uniqueVisitors.size,
      total_sessions: sessions.size,
      avg_session_duration: avgSessionDuration,
      bounce_rate: bounceRate,
      total_post_views: postViews.length,
      total_post_reads: postReads.length,
      avg_read_time: avgReadTime,
      engagement_rate: engagementRate,
      new_users: newUsers,
      returning_users: returningUsers,
      user_retention_rate: retentionRate,
      device_breakdown: deviceBreakdown,
      browser_breakdown: browserBreakdown,
      os_breakdown: osBreakdown,
      country_breakdown: countryBreakdown,
      top_posts: topPosts,
      top_searches: topSearches,
    }
  }
  
  /**
   * 获取实时统计
   */
  async getRealtimeStats(): Promise<RealtimeStats> {
    const now = new Date()
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
    
    // 获取活跃会话
    const { data: activeSessions } = await this.supabase
      .from('realtime_active_sessions')
      .select('*')
      .gte('expires_at', now.toISOString())
      
    const currentActiveUsers = activeSessions?.length || 0
    
    // 获取当前页面浏览
    const { data: recentPageViews } = await this.supabase
      .from('analytics_events')
      .select('page')
      .eq('event_type', EventType.PAGE_VIEW)
      .gte('timestamp', thirtyMinutesAgo.toISOString())
      
    const currentPageViews = this.aggregatePageViews(recentPageViews || [])
    
    // 获取最近事件
    const { data: recentEvents } = await this.supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', thirtyMinutesAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(100)
      
    // 获取趋势内容
    const { data: trendingData } = await this.supabase
      .from('content_trending_scores')
      .select('post_id, score')
      .order('score', { ascending: false })
      .limit(10)
      
    const trendingPosts = (trendingData || []).map((item: any) => ({
      post_id: item.post_id,
      trend_score: item.score,
    }))
    
    return {
      current_active_users: currentActiveUsers,
      current_page_views: currentPageViews,
      recent_events: recentEvents || [],
      trending_posts: trendingPosts,
    }
  }
  
  /**
   * 执行定时聚合任务
   */
  async runScheduledAggregation(granularity: TimeGranularity) {
    const now = new Date()
    let startDate: Date
    let tableName: string
    
    switch (granularity) {
      case TimeGranularity.HOUR:
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        tableName = 'analytics_hourly'
        break
      case TimeGranularity.DAY:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        tableName = 'analytics_daily'
        break
      case TimeGranularity.WEEK:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        tableName = 'analytics_weekly'
        break
      case TimeGranularity.MONTH:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        tableName = 'analytics_monthly'
        break
      default:
        throw new Error(`Unsupported granularity: ${granularity}`)
    }
    
    // 聚合数据
    const stats = await this.aggregateStats(startDate, now, granularity)
    
    // 保存到数据库
    const { error } = await this.supabase
      .from(tableName)
      .insert({
        period_start: startDate.toISOString(),
        period_end: now.toISOString(),
        stats: stats,
        created_at: now.toISOString(),
      })
      
    if (error) {
      console.error(`Failed to save ${granularity}
 aggregation:`, error)
      throw error
    }
    
    // 执行异常检测
    await this.detectAnomalies(stats, granularity)
    
    // 更新内容分数
    await this.updateContentScores(stats)
    
    return stats
  }
  
  /**
   * 计算会话时长
   */
  private async calculateSessionDurations(sessionIds: string[]): Promise<number[]> {
    const durations: number[] = []
    
    for (const sessionId of sessionIds) {
      const { data } = await this.supabase
        .from('analytics_events')
        .select('timestamp')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })
        
      if (data && data.length > 0) {
        const start = new Date(data[0].timestamp).getTime()
        const end = new Date(data[data.length - 1].timestamp).getTime()
        durations.push((end - start) / 1000) // 转换为秒
      }
    }
    
    return durations
  }
  
  /**
   * 计算跳出率
   */
  private async calculateBounceRate(sessionIds: string[]): Promise<number> {
    let bounces = 0
    
    for (const sessionId of sessionIds) {
      const { count } = await this.supabase
        .from('analytics_events')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('event_type', EventType.PAGE_VIEW)
        
      if (count === 1) {
        bounces++
      }
    }
    
    return sessionIds.length > 0 ? bounces / sessionIds.length : 0
  }
  
  /**
   * 计算参与度
   */
  private async calculateEngagementRate(events: AnalyticsEvent[]): Promise<number> {
    const engagementEvents = events.filter(e => 
      [EventType.POST_READ, EventType.COMMENT_CREATE, EventType.LIKE, EventType.SHARE]
        .includes(e.event_type)
    )
    
    const sessions = new Set(events.map(e => e.session_id))
    const engagedSessions = new Set(engagementEvents.map(e => e.session_id))
    
    return sessions.size > 0 ? engagedSessions.size / sessions.size : 0
  }
  
  /**
   * 计算用户指标
   */
  private async calculateUserMetrics(events: AnalyticsEvent[], periodStart: Date) {
    const userIds = new Set(events.map(e => e.user_id || e.anonymous_id))
    let newUsers = 0
    let returningUsers = 0
    
    for (const userId of userIds) {
      const { count } = await this.supabase
        .from('analytics_events')
        .select('id', { count: 'exact', head: true })
        .eq('anonymous_id', userId)
        .lt('timestamp', periodStart.toISOString())
        
      if (count === 0) {
        newUsers++
      }
      else {
        returningUsers++
      }
    }
    
    return { newUsers, returningUsers }
  }
  
  /**
   * 计算留存率
   */
  private async calculateRetentionRate(startDate: Date, endDate: Date): Promise<number> {
    // 获取上一期间的用户
    const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))
    
    const { data: previousUsers } = await this.supabase
      .from('analytics_events')
      .select('anonymous_id')
      .gte('timestamp', previousPeriodStart.toISOString())
      .lt('timestamp', startDate.toISOString())
      
    const { data: currentUsers } = await this.supabase
      .from('analytics_events')
      .select('anonymous_id')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      
    if (!previousUsers || previousUsers.length === 0) return 0
    
    const previousSet = new Set(previousUsers.map(u => u.anonymous_id))
    const currentSet = new Set(currentUsers?.map(u => u.anonymous_id) || [])
    
    return UserBehaviorAnalysis.calculateRetention(previousSet, currentSet)
  }
  
  /**
   * 计算分布
   */
  private calculateBreakdown(events: AnalyticsEvent[], field: string): Record<string, number> {
    const breakdown: Record<string, number> = {}
    
    events.forEach(event => {
      const value = this.getNestedValue(event, field) || 'unknown'
      breakdown[value] = (breakdown[value] || 0) + 1
    })
    
    return breakdown
  }
  
  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj)
  }
  
  /**
   * 计算热门文章
   */
  private async calculateTopPosts(postViews: AnalyticsEvent[], postReads: AnalyticsEvent[]) {
    const postStats = new Map<string, {
      views: number
      reads: number
      totalReadTime: number
    }>()
    
    // 统计浏览量
    postViews.forEach(event => {
      const postId = event.properties.post_id
      if (!postStats.has(postId)) {
        postStats.set(postId, { views: 0, reads: 0, totalReadTime: 0 })
      }
      postStats.get(postId)!.views++
    })
    
    // 统计阅读量和阅读时间
    postReads.forEach(event => {
      const postId = event.properties.post_id
      const readTime = event.properties.read_time || 0
      
      if (postStats.has(postId)) {
        const stats = postStats.get(postId)!
        stats.reads++
        stats.totalReadTime += readTime
      }
    })
    
    // 转换并排序
    const topPosts = Array.from(postStats.entries())
      .map(([postId, stats]) => ({
        post_id: postId,
        views: stats.views,
        reads: stats.reads,
        avg_read_time: stats.reads > 0 ? stats.totalReadTime / stats.reads : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      
    return topPosts
  }
  
  /**
   * 计算热门搜索
   */
  private async calculateTopSearches(events: AnalyticsEvent[]) {
    const searchEvents = events.filter(e => e.event_type === EventType.SEARCH)
    const searchStats = new Map<string, {
      count: number
      clicks: number
    }>()
    
    // 统计搜索次数
    searchEvents.forEach(event => {
      const query = event.properties.query?.toLowerCase()
      if (!query) return
      
      if (!searchStats.has(query)) {
        searchStats.set(query, { count: 0, clicks: 0 })
      }
      searchStats.get(query)!.count++
    })
    
    // 统计点击次数
    const searchClickEvents = events.filter(e => e.event_type === EventType.SEARCH_RESULT_CLICK)
    
    searchClickEvents.forEach(event => {
      const query = event.properties.search_query?.toLowerCase()
      if (query && searchStats.has(query)) {
        searchStats.get(query)!.clicks++
      }
    })
    
    // 转换并排序
    const topSearches = Array.from(searchStats.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        click_through_rate: stats.count > 0 ? stats.clicks / stats.count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      
    return topSearches
  }
  
  /**
   * 聚合页面浏览数据
   */
  private aggregatePageViews(pageViews: any[]): Array<{ path: string; count: number }> {
    const pathCounts = new Map<string, number>()
    
    pageViews.forEach(pv => {
      const path = pv.page?.path || '/'
      pathCounts.set(path, (pathCounts.get(path) || 0) + 1)
    })
    
    return Array.from(pathCounts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
  
  /**
   * 异常检测
   */
  private async detectAnomalies(stats: AggregatedStats, granularity: TimeGranularity) {
    // 获取历史数据进行比较
    const { data: historicalData } = await this.supabase
      .from(`analytics_${granularity}`)
      .select('stats')
      .order('period_start', { ascending: false })
      .limit(30)
      
    if (!historicalData || historicalData.length < 10) return
    
    // 提取关键指标的时间序列
    const metrics = {
      views: historicalData.map(d => d.stats.total_views),
      visitors: historicalData.map(d => d.stats.unique_visitors),
      sessions: historicalData.map(d => d.stats.total_sessions),
      bounceRate: historicalData.map(d => d.stats.bounce_rate),
    }
    
    // 检测异常
    const anomalies: any[] = []
    
    Object.entries(metrics).forEach(([metric, values]) => {
      const anomalyIndices = AnomalyDetection.detectAnomaliesZScore(values, 2.5)
      
      if (anomalyIndices.includes(0)) { // 最新数据是异常的
        anomalies.push({
          metric,
          current_value: values[0],
          expected_range: {
            min: Statistics.percentile(values.slice(1), 10),
            max: Statistics.percentile(values.slice(1), 90),
          },
          severity: 'medium',
        })
      }
    })
    
    // 如果发现异常，记录到数据库
    if (anomalies.length > 0) {
      await this.supabase
        .from('analytics_anomalies')
        .insert({
          detected_at: new Date().toISOString(),
          granularity,
          anomalies,
        })
    }
  }
  
  /**
   * 更新内容分数
   */
  private async updateContentScores(stats: AggregatedStats) {
    for (const post of stats.top_posts) {
      // 获取额外指标
      const { data: interactions } = await this.supabase
        .from('analytics_events')
        .select('event_type')
        .eq('properties->>post_id', post.post_id)
        .in('event_type', [EventType.LIKE, EventType.SHARE, EventType.COMMENT_CREATE])
        
      const shares = interactions?.filter(i => i.event_type === EventType.SHARE).length || 0
      const comments = interactions?.filter(i => i.event_type === EventType.COMMENT_CREATE).length || 0
      
      // 计算内容分数
      const score = ContentAnalysis.calculateContentScore({
        views: post.views,
        reads: post.reads,
        avgReadTime: post.avg_read_time,
        shares,
        comments,
      })
      
      // 更新分数
      await this.supabase
        .from('content_scores')
        .upsert({
          post_id: post.post_id,
          score,
          metrics: {
            views: post.views,
            reads: post.reads,
            avg_read_time: post.avg_read_time,
            shares,
            comments,
          },
          updated_at: new Date().toISOString(),
        })
    }
  }
  
  /**
   * 生成分析报告
   */
  async generateAnalyticsReport(
    startDate: Date,
    endDate: Date,
    options: {
      includeFunnels?: boolean
      includeUserPaths?: boolean
      includeSegmentation?: boolean
    } = {}
  ) {
    // 获取基础统计
    const stats = await this.aggregateStats(startDate, endDate, TimeGranularity.DAY)
    
    const report: any = {
      summary: stats,
      generated_at: new Date().toISOString(),
    }
    
    // 获取事件数据用于高级分析
    const { data: events } = await this.supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      
    if (!events) return report
    
    // 漏斗分析
    if (options.includeFunnels) {
      report.funnels = {
        signup: FunnelAnalysis.calculateFunnel(events, [
          { name: '访问首页', eventType: EventType.PAGE_VIEW, filter: e => e.page.path === '/' },
          { name: '查看文章', eventType: EventType.POST_VIEW },
          { name: '注册', eventType: EventType.USER_SIGNUP },
        ]),
        engagement: FunnelAnalysis.calculateFunnel(events, [
          { name: '查看文章', eventType: EventType.POST_VIEW },
          { name: '阅读完成', eventType: EventType.POST_READ },
          { name: '互动', eventType: EventType.COMMENT_CREATE },
        ]),
      }
    }
    
    // 用户路径分析
    if (options.includeUserPaths) {
      report.user_paths = UserBehaviorAnalysis.calculateUserPaths(events)
    }
    
    // 用户分群
    if (options.includeSegmentation) {
      const segments = UserBehaviorAnalysis.segmentUsers(events)
      report.user_segments = {
        high_activity: Array.from(segments.entries()).filter(([_, seg]) => seg.activityLevel === 'high').length,
        medium_activity: Array.from(segments.entries()).filter(([_, seg]) => seg.activityLevel === 'medium').length,
        low_activity: Array.from(segments.entries()).filter(([_, seg]) => seg.activityLevel === 'low').length,
      }
    }
    
    return report
  }
}

// 导出单例
let aggregator: AnalyticsAggregator | null = null

export function getAnalyticsAggregator(): AnalyticsAggregator {
  if (!aggregator) {
    aggregator = new AnalyticsAggregator()
  }
  return aggregator
}