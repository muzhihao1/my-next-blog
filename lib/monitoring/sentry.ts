/** * Sentry 错误监控配置 * 简化版本，避免构建错误 */
import { ErrorInfo }
from 'react' /** * 报告错误到监控系统 */
export function reportError(error: Error, errorInfo?: ErrorInfo) { // 在生产环境中，这里会发送错误到 Sentry // 现在只是简单地记录到控制台 console.error('Error reported:', error, errorInfo) // TODO: 集成真实的 Sentry SDK // if (typeof window !== 'undefined' && window.Sentry) { // window.Sentry.captureException(error, { // contexts: { // react: { // componentStack: errorInfo?.componentStack // }
// }
// }) // }
}/** * 初始化 Sentry */
export function initSentry() { // TODO: 初始化 Sentry SDK console.log('Sentry monitoring would be initialized here') }