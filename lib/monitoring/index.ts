/** * 性能监控系统主入口 * 导出所有监控功能模块 */ // 导出类型 export * from './types' // 导出配置 export * from './config' // 导出收集器 export { MonitoringCollector, getMonitoringCollector, destroyMonitoringCollector, useMonitoring, withAPIMonitoring, }
from './collector' // 导出告警管理 export { AlertManager, }
from './alerts' // 导出报告生成 export { PerformanceReporter, }
from './reporter' // 导出验证器 export { validateMetrics, validateMetric, validateAPIMetric, validateErrorMetric, sanitizeMetric, }
from './validator' // 便捷方法 import { getMonitoringCollector }
from './collector' 

import { MetricType, APIMetric }
from './types' /** * 记录页面浏览 */
export function trackPageView(properties?: Record<string, any>) { const collector = getMonitoringCollector() collector?.recordMetric(MetricType.PAGE_LOAD_TIME, performance.timing.loadEventEnd - performance.timing.navigationStart, { ...properties, page: window.location.pathname, }) }
/** * 记录 API 调用 */
export function trackAPICall(metric: APIMetric) { const collector = getMonitoringCollector() collector?.recordAPIMetric(metric) }
/** * 记录自定义指标 */
export function trackMetric( metricType: MetricType, value: number, metadata?: Record<string, any> ) { const collector = getMonitoringCollector() collector?.recordMetric(metricType, value, metadata) }
/** * 记录错误 */
export function trackError(error: Error, context?: Record<string, any>) { const collector = getMonitoringCollector() collector?.recordMetric(MetricType.ERROR_COUNT, 1, { error_type: 'javascript', message: error.message, stack: error.stack, ...context, }) }
/** * Next.js 中间件：自动监控 API 路由 */
export { withAPIMonitoring }
from './collector' /** * React Hook：使用监控 */
export { useMonitoring }
from './collector' /** * 初始化监控系统 */
export function initializeMonitoring(userId?: string) { if (typeof window === 'undefined') return const collector = getMonitoringCollector() if (userId) { collector.setUserId(userId) }
// 自动跟踪页面浏览 if (document.readyState === 'complete') { trackPageView() }
else { window.addEventListener('load', () => trackPageView()) }
// 全局错误处理 window.addEventListener('error', (event) => { trackError(new Error(event.message), { source: event.filename, line: event.lineno, column: event.colno, }) }) window.addEventListener('unhandledrejection', (event) => { trackError(new Error(`Unhandled Promise Rejection: ${event.reason}`), { type: 'unhandledrejection', }) }) return collector }