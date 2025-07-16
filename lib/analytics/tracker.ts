import type { ActionType, ContentType }
from '@/types/supabase' interface TrackActionOptions { userId: string actionType: ActionType contentId: string contentType: ContentType metadata?: Record<string, any> }
interface BatchedAction extends TrackActionOptions { timestamp: string }
class ActionTracker { private batchQueue: BatchedAction[] = []
private batchTimer: NodeJS.Timeout | null = null private readonly batchSize = 10 private readonly batchDelay = 5000 // 5秒 /** * 追踪用户行为 * 使用批量发送来优化性能 */
async trackAction(options: TrackActionOptions): Promise<void> { const action: BatchedAction = { ...options, timestamp: new Date().toISOString() }
this.batchQueue.push(action) // 如果达到批量大小，立即发送 if (this.batchQueue.length >= this.batchSize) { await this.flush() }
else { // 否则设置延迟发送 this.scheduleBatch() }
}/** * 追踪页面浏览 */
async trackPageView(options: Omit<TrackActionOptions, 'actionType'>): Promise<void> { return this.trackAction({ ...options, actionType: 'view' }) }
/** * 追踪滚动深度 */
trackScrollDepth(contentId: string, contentType: ContentType, depth: number): void { // 只在特定深度记录（25%, 50%, 75%, 100%） const thresholds = [25, 50, 75, 100]
if (!thresholds.includes(depth)) return // 避免重复记录 const key = `scroll_${contentId}
_${depth}` if (sessionStorage.getItem(key)) return sessionStorage.setItem(key, '1') // 延迟发送，避免频繁请求 if ('requestIdleCallback' in window) { requestIdleCallback(() => { this.trackAction({ userId: '', // 将在服务端获取 actionType: 'view', contentId, contentType, metadata: { scrollDepth: depth }
}) }) }
else { setTimeout(() => { this.trackAction({ userId: '', actionType: 'view', contentId, contentType, metadata: { scrollDepth: depth }
}) }, 1000) }
}/** * 计算阅读时长 */
startReadingTimer(contentId: string): () => number { const startTime = Date.now() return () => { const endTime = Date.now() const duration = Math.floor((endTime - startTime) / 1000) // 秒 return duration }
}/** * 设置批量发送定时器 */
private scheduleBatch(): void { if (this.batchTimer) return this.batchTimer = setTimeout(() => { this.flush() }, this.batchDelay) }
/** * 立即发送批量数据 */
async flush(): Promise<void> { if (this.batchQueue.length === 0) return const actions = [...this.batchQueue]
this.batchQueue = []
if (this.batchTimer) { clearTimeout(this.batchTimer) this.batchTimer = null }
try { const response = await fetch('/api/analytics/actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actions }) }) if (!response.ok) { throw new Error('Failed to track actions') }
}
catch (error) { console.error('Error tracking actions:', error) // 失败时保存到本地存储 const stored = localStorage.getItem('pending_actions') const pending = stored ? JSON.parse(stored) : []
localStorage.setItem('pending_actions', JSON.stringify([...pending, ...actions])) }
}/** * 重试发送失败的行为数据 */
async retryPendingActions(): Promise<void> { const stored = localStorage.getItem('pending_actions') if (!stored) return const pending = JSON.parse(stored) if (pending.length === 0) return localStorage.removeItem('pending_actions') for (const action of pending) { this.batchQueue.push(action) }
await this.flush() }
/** * 清理资源 */
destroy(): void { if (this.batchTimer) { clearTimeout(this.batchTimer) this.batchTimer = null }
    // 发送剩余的数据
    this.flush()
  }
}

// 导出单例实例
export const tracker = new ActionTracker()

// 页面卸载时发送剩余数据
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    tracker.flush()
  })
  
  // 页面加载时重试失败的请求
  window.addEventListener('load', () => {
    tracker.retryPendingActions()
  })
}