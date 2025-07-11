/**
 * 性能报告生成器
 * 生成定期的性能分析报告
 */
import { createClient }
from '@/lib/supabase/server' 

import { PerformanceReport, MetricType, MetricSummary, ResourceSummary, TimeSeriesData, PerformanceRating }
from './types' 

import { getMetricDisplayName, getMetricUnit }
from './config' 

import { Statistics }
from '@/lib/analytics/algorithms'

/**
 * 报告生成器
 */
export class PerformanceReporter {
  private supabase: any
  
  constructor() {
    this.initializeSupabase()
  }
  
  private async initializeSupabase() {
    this.supabase = await createClient()
  }
  
  /**
   * 生成性能报告
   */
  async generateReport(
    startDate: Date,
    endDate: Date,
    type: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<PerformanceReport> {
    // 获取指标数据
    const metrics = await this.fetchMetrics(startDate, endDate)
    
    // 计算 Web Vitals 统计
    const webVitals = await this.calculateWebVitals(metrics)
    
    // 计算 API 性能
    const apiPerformance = await this.calculateAPIPerformance(metrics)
    
    // 错误分析
    const errorAnalysis = await this.analyzeErrors(startDate, endDate)
    
    // 用户体验分析
    const userExperience = await this.analyzeUserExperience(startDate, endDate)
    
    // 资源使用分析
    const resourceUsage = await this.analyzeResourceUsage(metrics)
    
    // 生成建议
    const recommendations = this.generateRecommendations({
      webVitals,
      apiPerformance,
      errorAnalysis,
      userExperience,
    })
    
    // 计算总体评分
    const overallScore = this.calculateOverallScore({
      webVitals,
      apiPerformance,
      errorAnalysis,
    })
    
    // 生成关键洞察
    const keyInsights = this.generateKeyInsights({
      webVitals,
      apiPerformance,
      errorAnalysis,
      userExperience,
    })
    
    const report: PerformanceReport = {
      id: `report-${Date.now()}`,
      period: {
        start: startDate,
        end: endDate,
        type,
      },
      summary: {
        overall_score: overallScore,
        rating: this.getOverallRating(overallScore),
        key_insights: keyInsights,
      },
      web_vitals: webVitals,
      api_performance: apiPerformance,
      error_analysis: errorAnalysis,
      user_experience: userExperience,
      resource_usage: resourceUsage,
      recommendations,
      generated_at: new Date(),
    }
    
    // 保存报告
    await this.saveReport(report)
    
    return report
  }
  
  /**
   * 获取指标数据
   */
  private async fetchMetrics(startDate: Date, endDate: Date) {
    const { data: metrics } = await this.supabase
      .from('monitoring_metrics')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true })
      
    return metrics || []
  }
  
  /**
   * 计算 Web Vitals 统计
   */
private async calculateWebVitals(metrics: any[]) { const vitals = { fcp: this.calculateMetricSummary(metrics, MetricType.FCP), lcp: this.calculateMetricSummary(metrics, MetricType.LCP), fid: this.calculateMetricSummary(metrics, MetricType.FID), cls: this.calculateMetricSummary(metrics, MetricType.CLS), ttfb: this.calculateMetricSummary(metrics, MetricType.TTFB), inp: this.calculateMetricSummary(metrics, MetricType.INP), }
return vitals }
/** * 计算指标摘要 */
private calculateMetricSummary( metrics: any[], metricType: MetricType ): MetricSummary { const typeMetrics = metrics.filter(m => m.metric_type === metricType) if (typeMetrics.length === 0) { return { average: 0, median: 0, p75: 0, p90: 0, p95: 0, p99: 0, min: 0, max: 0, count: 0, rating_distribution: { good: 0, needs_improvement: 0, poor: 0, }, }
}
const values = typeMetrics.map(m => m.value) const stats = Statistics.summary(values) // 计算评级分布 const ratingCounts = typeMetrics.reduce((acc, m) => { const rating = m.rating || PerformanceRating.GOOD acc[rating] = (acc[rating] || 0) + 1 return acc }, {}
as Record<PerformanceRating, number>) return { average: stats.mean, median: stats.median, p75: stats.percentiles.p75, p90: stats.percentiles.p90, p95: stats.percentiles.p95, p99: stats.percentiles.p99, min: stats.min, max: stats.max, count: stats.count, rating_distribution: { good: ratingCounts[PerformanceRating.GOOD] || 0, needs_improvement: ratingCounts[PerformanceRating.NEEDS_IMPROVEMENT] || 0, poor: ratingCounts[PerformanceRating.POOR] || 0, }, }
}/** * 计算 API 性能 */
private async calculateAPIPerformance(metrics: any[]) { const apiMetrics = metrics.filter(m => m.metric_type === MetricType.API_LATENCY) if (apiMetrics.length === 0) { return { average_latency: 0, p95_latency: 0, p99_latency: 0, error_rate: 0, total_requests: 0, top_slow_endpoints: [], }
}
const latencies = apiMetrics.map(m => m.value) const stats = Statistics.summary(latencies) // 计算错误率 const errorMetrics = metrics.filter(m => m.metric_type === MetricType.API_ERROR_RATE) const errorRate = errorMetrics.length > 0 ? Statistics.mean(errorMetrics.map(m => m.value)) : 0 // 找出最慢的端点 const endpointLatencies = new Map<string, number[]>() apiMetrics.forEach(m => { const endpoint = m.context?.api_endpoint if (endpoint) { if (!endpointLatencies.has(endpoint)) { endpointLatencies.set(endpoint, []) }
endpointLatencies.get(endpoint)!.push(m.value) }
}) const topSlowEndpoints = Array.from(endpointLatencies.entries()) .map(([endpoint, values]) => ({ endpoint, avg_duration: Statistics.mean(values), count: values.length, })) .sort((a, b) => b.avg_duration - a.avg_duration) .slice(0, 10) return { average_latency: stats.mean, p95_latency: stats.percentiles.p95, p99_latency: stats.percentiles.p99, error_rate: errorRate, total_requests: apiMetrics.length, top_slow_endpoints: topSlowEndpoints, }
}/** * 分析错误 */
private async analyzeErrors(startDate: Date, endDate: Date) { const { data: errors } = await this.supabase .from('monitoring_metrics') .select('*') .eq('metric_type', MetricType.ERROR_COUNT) .gte('timestamp', startDate.toISOString()) .lte('timestamp', endDate.toISOString()) if (!errors || errors.length === 0) { return { total_errors: 0, error_rate: 0, top_errors: [], error_trend: 'stable' as const, }
}
// 统计错误信息 const errorMessages = new Map<string, { count: number; users: Set<string> }>() errors.forEach(error => { const message = error.metadata?.message || 'Unknown error' if (!errorMessages.has(message)) { errorMessages.set(message, { count: 0, users: new Set() }) }
const stats = errorMessages.get(message)! stats.count++ if (error.context?.user_id) { stats.users.add(error.context.user_id) }
}) const topErrors = Array.from(errorMessages.entries()) .map(([message, stats]) => ({ message, count: stats.count, affected_users: stats.users.size, })) .sort((a, b) => b.count - a.count) .slice(0, 10) // 分析错误趋势 const errorTrend = await this.analyzeErrorTrend(errors) // 计算错误率（错误数/总请求数） const { count: totalRequests } = await this.supabase .from('monitoring_metrics') .select('id', { count: 'exact', head: true }) .in('metric_type', [MetricType.API_LATENCY, MetricType.PAGE_LOAD_TIME]) .gte('timestamp', startDate.toISOString()) .lte('timestamp', endDate.toISOString()) const errorRate = totalRequests > 0 ? errors.length / totalRequests : 0 return { total_errors: errors.length, error_rate: errorRate, top_errors: topErrors, error_trend: errorTrend, }
}/** * 分析错误趋势 */
private async analyzeErrorTrend(errors: any[]): Promise<'increasing' | 'stable' | 'decreasing'> { if (errors.length < 10) return 'stable' // 按时间排序 errors.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // 将时间段分成两半 const midPoint = Math.floor(errors.length / 2) const firstHalf = errors.slice(0, midPoint) const secondHalf = errors.slice(midPoint) // 比较两半的错误率 const firstHalfRate = firstHalf.length / (firstHalf.length + secondHalf.length) const secondHalfRate = secondHalf.length / (firstHalf.length + secondHalf.length) const threshold = 0.1 // 10% 变化阈值 if (secondHalfRate > firstHalfRate + threshold) { return 'increasing' }
else if (secondHalfRate < firstHalfRate - threshold) { return 'decreasing' }
else { return 'stable' }
}/** * 分析用户体验 */
private async analyzeUserExperience(startDate: Date, endDate: Date) { // 获取会话数据 const { data: sessions } = await this.supabase .from('analytics_sessions') .select('*') .gte('started_at', startDate.toISOString()) .lte('started_at', endDate.toISOString()) if (!sessions || sessions.length === 0) { return { average_session_duration: 0, bounce_rate: 0, pages_per_session: 0, slowest_pages: [], }
}
// 计算平均会话时长 const sessionDurations = sessions .filter(s => s.last_activity_at && s.started_at) .map(s => { const duration = new Date(s.last_activity_at).getTime() - new Date(s.started_at).getTime() return duration / 1000 // 转换为秒 }) const avgSessionDuration = Statistics.mean(sessionDurations) // 计算跳出率 const bouncedSessions = sessions.filter(s => s.page_views === 1).length const bounceRate = sessions.length > 0 ? bouncedSessions / sessions.length : 0 // 计算每会话页面浏览量 const pagesPerSession = Statistics.mean(sessions.map(s => s.page_views || 0)) // 找出最慢的页面 const { data: pageMetrics } = await this.supabase .from('monitoring_metrics') .select('*') .eq('metric_type', MetricType.PAGE_LOAD_TIME) .gte('timestamp', startDate.toISOString()) .lte('timestamp', endDate.toISOString()) const pageLoadTimes = new Map<string, { times: number[]; views: number }>() if (pageMetrics) { pageMetrics.forEach(m => { const page = m.context?.page if (page) { if (!pageLoadTimes.has(page)) { pageLoadTimes.set(page, { times: [], views: 0 }) }
const stats = pageLoadTimes.get(page)! stats.times.push(m.value) stats.views++ }
}) }
const slowestPages = Array.from(pageLoadTimes.entries()) .map(([path, stats]) => ({ path, avg_load_time: Statistics.mean(stats.times), views: stats.views, })) .sort((a, b) => b.avg_load_time - a.avg_load_time) .slice(0, 10) return { average_session_duration: avgSessionDuration, bounce_rate: bounceRate, pages_per_session: pagesPerSession, slowest_pages: slowestPages, }
}/** * 分析资源使用 */
private async analyzeResourceUsage(metrics: any[]) { const memoryMetrics = metrics.filter(m => m.metric_type === MetricType.MEMORY_USAGE) const cpuMetrics = metrics.filter(m => m.metric_type === MetricType.CPU_USAGE) const bandwidthMetrics = metrics.filter(m => m.metric_type === MetricType.BANDWIDTH_USAGE) return { memory: this.calculateResourceSummary(memoryMetrics), cpu: this.calculateResourceSummary(cpuMetrics), bandwidth: this.calculateResourceSummary(bandwidthMetrics), }
}/** * 计算资源摘要 */
private calculateResourceSummary(metrics: any[]): ResourceSummary { if (metrics.length === 0) { return { average: 0, peak: 0, percentile_95: 0, trend: 'stable', }
}
const values = metrics.map(m => m.value) const stats = Statistics.summary(values) // 分析趋势 const trend = this.analyzeTrend(metrics) return { average: stats.mean, peak: stats.max, percentile_95: stats.percentiles.p95, trend, }
}/** * 分析趋势 */
private analyzeTrend(metrics: any[]): 'increasing' | 'stable' | 'decreasing' { if (metrics.length < 10) return 'stable' // 按时间排序 metrics.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // 计算移动平均 const windowSize = Math.min(5, Math.floor(metrics.length / 3)) const values = metrics.map(m => m.value) const earlyAvg = Statistics.mean(values.slice(0, windowSize)) const lateAvg = Statistics.mean(values.slice(-windowSize)) const changeRatio = (lateAvg - earlyAvg) / earlyAvg if (changeRatio > 0.1) return 'increasing' if (changeRatio < -0.1) return 'decreasing' return 'stable' }
/** * 生成建议 */
private generateRecommendations(data: any) { const recommendations = [] // Web Vitals 建议 if (data.webVitals.lcp.p75 > 2500) { recommendations.push({ priority: 'high' as const, category: 'Web Vitals', issue: 'LCP (最大内容绘制) 较慢', suggestion: '优化图片加载、减少阻塞资源、使用预加载', potential_impact: '改善用户感知的页面加载速度', }) }
if (data.webVitals.cls.p75 > 0.1) { recommendations.push({ priority: 'medium' as const, category: 'Web Vitals', issue: 'CLS (累积布局偏移) 较高', suggestion: '为图片和视频设置尺寸、避免动态插入内容', potential_impact: '减少页面跳动，提升用户体验', }) }
// API 性能建议 if (data.apiPerformance.p95_latency > 1000) { recommendations.push({ priority: 'high' as const, category: 'API 性能', issue: 'API 响应时间过长', suggestion: '优化数据库查询、添加缓存、考虑分页', potential_impact: '显著提升应用响应速度', }) }
if (data.apiPerformance.error_rate > 0.01) { recommendations.push({ priority: 'high' as const, category: 'API 可靠性', issue: 'API 错误率偏高', suggestion: '检查错误日志、添加重试机制、改进错误处理', potential_impact: '提高系统可靠性，减少用户投诉', }) }
// 错误相关建议 if (data.errorAnalysis.error_trend === 'increasing') { recommendations.push({ priority: 'high' as const, category: '错误监控', issue: '错误数量呈上升趋势', suggestion: '立即调查最近的代码变更、检查依赖更新', potential_impact: '防止问题恶化，保护用户体验', }) }
// 用户体验建议 if (data.userExperience.bounce_rate > 0.5) { recommendations.push({ priority: 'medium' as const, category: '用户体验', issue: '跳出率较高', suggestion: '优化首屏内容、提升页面加载速度、改进内容相关性', potential_impact: '提高用户参与度和留存率', }) }
return recommendations.sort((a, b) => { const priorityOrder = { high: 0, medium: 1, low: 2 }
return priorityOrder[a.priority] - priorityOrder[b.priority]
}) }
/** * 计算总体评分 */
private calculateOverallScore(data: any): number { const weights = { webVitals: 0.4, apiPerformance: 0.3, errors: 0.3, }
// Web Vitals 分数 const webVitalsScore = this.calculateWebVitalsScore(data.webVitals) // API 性能分数 const apiScore = this.calculateAPIScore(data.apiPerformance) // 错误分数 const errorScore = this.calculateErrorScore(data.errorAnalysis) const overallScore = webVitalsScore * weights.webVitals + apiScore * weights.apiPerformance + errorScore * weights.errors return Math.round(overallScore) }
/** * 计算 Web Vitals 分数 */
private calculateWebVitalsScore(webVitals: any): number { const scores = { fcp: this.getMetricScore(webVitals.fcp, { good: 1800, poor: 3000 }), lcp: this.getMetricScore(webVitals.lcp, { good: 2500, poor: 4000 }), fid: this.getMetricScore(webVitals.fid, { good: 100, poor: 300 }), cls: this.getMetricScore(webVitals.cls, { good: 0.1, poor: 0.25 }, true), ttfb: this.getMetricScore(webVitals.ttfb, { good: 800, poor: 1800 }), }
return Statistics.mean(Object.values(scores)) }
/** * 计算指标分数 */
private getMetricScore( summary: MetricSummary, thresholds: { good: number; poor: number }, inverse = false ): number { if (summary.count === 0) return 100 const value = summary.p75 // 使用第75百分位数 if (inverse) { // 对于 CLS 等越小越好的指标 if (value <= thresholds.good) return 100 if (value >= thresholds.poor) return 0 return 100 - ((value - thresholds.good) / (thresholds.poor - thresholds.good)) * 100 }
else { // 对于时间等越小越好的指标 if (value <= thresholds.good) return 100 if (value >= thresholds.poor) return 0 return 100 - ((value - thresholds.good) / (thresholds.poor - thresholds.good)) * 100 }
}/** * 计算 API 分数 */
private calculateAPIScore(apiPerformance: any): number { const latencyScore = this.getLatencyScore(apiPerformance.p95_latency) const errorScore = 100 - (apiPerformance.error_rate * 100 * 10) // 每1%错误率扣10分 return (latencyScore + errorScore) / 2 }
/** * 计算延迟分数 */
private getLatencyScore(latency: number): number { if (latency <= 200) return 100 if (latency <= 500) return 80 if (latency <= 1000) return 60 if (latency <= 2000) return 40 return 20 }
/** * 计算错误分数 */
private calculateErrorScore(errorAnalysis: any): number { const baseScore = 100 const errorPenalty = Math.min(errorAnalysis.error_rate * 1000, 50) // 最多扣50分 const trendPenalty = errorAnalysis.error_trend === 'increasing' ? 20 : 0 return Math.max(baseScore - errorPenalty - trendPenalty, 0) }
/** * 获取总体评级 */
private getOverallRating(score: number): PerformanceRating { if (score >= 80) return PerformanceRating.GOOD if (score >= 50) return PerformanceRating.NEEDS_IMPROVEMENT return PerformanceRating.POOR }
/** * 生成关键洞察 */
private generateKeyInsights(data: any): string[] { const insights = [] // 性能洞察 if (data.webVitals.lcp.p75 > 4000) { insights.push('页面加载速度严重影响用户体验，需要立即优化') }
else if (data.webVitals.lcp.p75 > 2500) { insights.push('页面加载速度有改进空间') }
// API 洞察 if (data.apiPerformance.error_rate > 0.05) { insights.push('API 错误率异常高，影响系统可用性') }
if (data.apiPerformance.top_slow_endpoints.length > 0) { const slowest = data.apiPerformance.top_slow_endpoints[0]
insights.push(`最慢的 API 端点是 ${slowest.endpoint}，平均响应时间 ${Math.round(slowest.avg_duration)}
ms`) }
// 错误洞察 if (data.errorAnalysis.error_trend === 'increasing') { insights.push('错误数量呈上升趋势，需要关注系统稳定性') }
if (data.errorAnalysis.top_errors.length > 0) { const topError = data.errorAnalysis.top_errors[0]
insights.push(`最常见的错误是"${topError.message}"，发生了 ${topError.count} 次`) }
// 用户体验洞察 if (data.userExperience.bounce_rate > 0.5) { insights.push(`跳出率高达 ${(data.userExperience.bounce_rate * 100).toFixed(1)}%，用户参与度较低`) }
if (data.userExperience.average_session_duration < 60) { insights.push('平均会话时长不足1分钟，内容吸引力需要提升') }
// 如果没有明显问题 if (insights.length === 0) { insights.push('系统整体性能表现良好') }
return insights.slice(0, 5) // 最多返回5条洞察 }
/** * 保存报告 */
private async saveReport(report: PerformanceReport) { await this.supabase .from('performance_reports') .insert({ id: report.id, period_start: report.period.start, period_end: report.period.end, period_type: report.period.type, report_data: report, created_at: report.generated_at, }) }
/** * 发送报告 */
async sendReport(report: PerformanceReport, recipients: string[]) { // 生成 HTML 报告 const htmlReport = this.generateHTMLReport(report) // 发送邮件 await fetch('/api/notifications/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: recipients, subject: `性能报告 - ${new Date(report.period.start).toLocaleDateString()} 至 ${new Date(report.period.end).toLocaleDateString()}`, html: htmlReport, attachments: [ { filename: `performance-report-${report.id}.json`, content: JSON.stringify(report, null, 2), contentType: 'application/json', }, ], }), }) }
/** * 生成 HTML 报告 */
private generateHTMLReport(report: PerformanceReport): string { const ratingEmoji = { [PerformanceRating.GOOD]: '🟢', [PerformanceRating.NEEDS_IMPROVEMENT]: '🟡', [PerformanceRating.POOR]: '🔴', }
return ` <!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>性能报告</title>
<style> body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
h1, h2, h3 { color: #2c3e50; } .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; } .metric { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; } .score { font-size: 48px; font-weight: bold; color: ${report.summary.overall_score >= 80 ? '#28a745' : report.summary.overall_score >= 50 ? '#ffc107' : '#dc3545'}; } .insights { background: #e9ecef; padding: 15px; border-radius: 8px; margin: 10px 0; } .insights li { margin: 5px 0; }
table { width: 100%; border-collapse: collapse; margin: 20px 0; }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
th { background: #f8f9fa; font-weight: 600; } .recommendation { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #ffc107; } .high { border-left-color: #dc3545; background: #f8d7da; } .medium { border-left-color: #ffc107; background: #fff3cd; } .low { border-left-color: #28a745; background: #d4edda; } </style> </head>
<body>
<h1>性能报告</h1>
<p>
<strong>报告周期：</strong>${new Date(report.period.start).toLocaleString()} - ${new Date(report.period.end).toLocaleString()}</p>
<div class="summary">
<h2>总体评分</h2>
<div class="score">${report.summary.overall_score}</div>
<p>
<strong>评级：</strong>${ratingEmoji[report.summary.rating]
}
${report.summary.rating}</p>
<h3>关键洞察</h3>
<ul class="insights"> ${report.summary.key_insights.map(insight => `<li>${insight}</li>`).join('')} </ul> </div>
<h2>Web Vitals</h2>
<table>
<tr>
<th>指标</th>
<th>P75</th>
<th>P95</th>
<th>评级分布</th> </tr> ${Object.entries(report.web_vitals).map(([key, value]) => ` <tr>
<td>${getMetricDisplayName(key.toUpperCase() as MetricType)}</td>
<td>${value.p75.toFixed(2)}
${getMetricUnit(key.toUpperCase() as MetricType)}</td>
<td>${value.p95.toFixed(2)}
${getMetricUnit(key.toUpperCase() as MetricType)}</td>
<td> 🟢 ${value.rating_distribution.good} 🟡 ${value.rating_distribution.needs_improvement} 🔴 ${value.rating_distribution.poor} </td> </tr> `).join('')} </table>
<h2>API 性能</h2>
<div class="metric">
<span>平均延迟</span>
<span>${report.api_performance.average_latency.toFixed(2)}
ms</span> </div>
<div class="metric">
<span>P95 延迟</span>
<span>${report.api_performance.p95_latency.toFixed(2)}
ms</span> </div>
<div class="metric">
<span>错误率</span>
<span>${(report.api_performance.error_rate * 100).toFixed(2)}%</span> </div>
<div class="metric">
<span>总请求数</span>
<span>${report.api_performance.total_requests}</span> </div>
<h2>建议</h2> ${report.recommendations.map(rec => ` <div class="recommendation ${rec.priority}">
<h3>${rec.category} - ${rec.issue}</h3>
<p>
<strong>建议：</strong>${rec.suggestion}</p>
<p>
<strong>潜在影响：</strong>${rec.potential_impact}</p> </div> `).join('')}
<hr>
<p style="text-align: center; color: #6c757d;"> 生成时间：${new Date(report.generated_at).toLocaleString()} </p> </body> </html> ` } }