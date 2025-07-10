/** * 实时在线状态功能 * 管理用户在线状态、活动追踪和在线用户列表 */
import { createClient }
from '@/lib/supabase/client' 

import { getEventManager }
from '../event-manager' 

import { getRealtimeClient }
from '../client' 

import { REALTIME_CHANNELS, REALTIME_EVENTS, UserPresence, }
from '../config' /** * 在线状态管理器配置 */
interface PresenceConfig { updateInterval: number // 状态更新间隔（毫秒） inactiveTimeout: number // 不活动超时时间（毫秒） awayTimeout: number // 离开超时时间（毫秒） }
/** * 默认配置 */
const DEFAULT_PRESENCE_CONFIG: PresenceConfig = { updateInterval: 30000, // 30秒 inactiveTimeout: 300000, // 5分钟 awayTimeout: 600000, // 10分钟 }
/** * 实时在线状态管理器 */
export class RealtimePresence { private client = getRealtimeClient() private eventManager = getEventManager() private supabase = createClient() private config: PresenceConfig private updateTimer?: NodeJS.Timeout private activityTimer?: NodeJS.Timeout private lastActivity = Date.now() private currentStatus: UserPresence['status'] = 'online' private currentPage?: string constructor(config?: Partial<PresenceConfig>) { this.config = { ...DEFAULT_PRESENCE_CONFIG, ...config }
this.setupActivityTracking() }
/** * 初始化在线状态 */
async initialize(page?: string) { this.currentPage = page // 加入在线频道 await this.client.subscribe(REALTIME_CHANNELS.PRESENCE, { onConnect: () => { this.startPresenceUpdates() }, onDisconnect: () => { this.stopPresenceUpdates() }, }) // 更新初始状态 await this.updatePresence('online') // 监听窗口事件 this.setupWindowEventListeners() }
/** * 更新用户在线状态 */
async updatePresence(status?: UserPresence['status']) { const { data: { user }
}= await this.supabase.auth.getUser() if (!user) return const newStatus = status || this.calculateStatus() this.currentStatus = newStatus const presence: UserPresence = { userId: user.id, username: user.user_metadata.name || user.email || 'Anonymous', avatar: user.user_metadata.avatar_url, status: newStatus, lastSeen: Date.now(), currentPage: this.currentPage, }
await this.client.updatePresence(REALTIME_CHANNELS.PRESENCE, presence) // 触发状态更新事件 if (newStatus === 'online') { await this.eventManager.publish( REALTIME_CHANNELS.PRESENCE, REALTIME_EVENTS.USER_ONLINE, presence ) }
else if (newStatus === 'offline') { await this.eventManager.publish( REALTIME_CHANNELS.PRESENCE, REALTIME_EVENTS.USER_OFFLINE, presence ) }
}/** * 获取在线用户列表 */
async getOnlineUsers(): Promise<UserPresence[]> { const users = await this.client.getPresence(REALTIME_CHANNELS.PRESENCE) // 过滤掉离线和过期的用户 const now = Date.now() return users.filter(user => { if (user.status === 'offline') return false // 检查最后活动时间 const timeSinceLastSeen = now - user.lastSeen return timeSinceLastSeen < this.config.awayTimeout }) }
/** * 获取特定页面的在线用户 */
async getPageUsers(page: string): Promise<UserPresence[]> { const allUsers = await this.getOnlineUsers() return allUsers.filter(user => user.currentPage === page) }
/** * 更新当前页面 */
async updateCurrentPage(page: string) { this.currentPage = page await this.updatePresence() }
/** * 记录用户活动 */
recordActivity() { this.lastActivity = Date.now() // 如果状态不是在线，更新为在线 if (this.currentStatus !== 'online') { this.updatePresence('online') }
}/** * 断开连接 */
async disconnect() { // 更新为离线状态 await this.updatePresence('offline') // 停止更新 this.stopPresenceUpdates() // 移除事件监听 this.removeWindowEventListeners() // 取消订阅 await this.client.unsubscribe(REALTIME_CHANNELS.PRESENCE) }
// === 私有方法 === /** * 设置活动追踪 */
private setupActivityTracking() { if (typeof window === 'undefined') return // 追踪用户活动的事件 const activityEvents = [ 'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', ]
const handleActivity = this.throttle(() => { this.recordActivity() }, 5000) // 5秒内最多记录一次 activityEvents.forEach(event => { window.addEventListener(event, handleActivity) }) }
/** * 设置窗口事件监听 */
private setupWindowEventListeners() { if (typeof window === 'undefined') return // 页面可见性变化 document.addEventListener('visibilitychange', this.handleVisibilityChange) // 窗口焦点变化 window.addEventListener('focus', this.handleWindowFocus) window.addEventListener('blur', this.handleWindowBlur) // 页面卸载 window.addEventListener('beforeunload', this.handleBeforeUnload) }
/** * 移除窗口事件监听 */
private removeWindowEventListeners() { if (typeof window === 'undefined') return document.removeEventListener('visibilitychange', this.handleVisibilityChange) window.removeEventListener('focus', this.handleWindowFocus) window.removeEventListener('blur', this.handleWindowBlur) window.removeEventListener('beforeunload', this.handleBeforeUnload) }
/** * 处理可见性变化 */
private handleVisibilityChange = () => { if (document.hidden) { // 页面隐藏，更新为离开状态 this.updatePresence('away') }
else { // 页面可见，更新为在线状态 this.recordActivity() }
}/** * 处理窗口获得焦点 */
private handleWindowFocus = () => { this.recordActivity() }
/** * 处理窗口失去焦点 */
private handleWindowBlur = () => { // 延迟更新状态，避免频繁切换 setTimeout(() => { if (!document.hasFocus()) { this.updatePresence('away') }
}, 60000) // 1分钟后 }
/** * 处理页面卸载 */
private handleBeforeUnload = () => { // 同步更新为离线状态 navigator.sendBeacon('/api/presence/offline', JSON.stringify({ userId: this.getCurrentUserId(), })) }
/** * 开始定期更新在线状态 */
private startPresenceUpdates() { // 定期更新状态 this.updateTimer = setInterval(() => { this.updatePresence() }, this.config.updateInterval) // 定期检查活动状态 this.activityTimer = setInterval(() => { const newStatus = this.calculateStatus() if (newStatus !== this.currentStatus) { this.updatePresence(newStatus) }
}, 10000) // 每10秒检查一次 }
/** * 停止定期更新 */
private stopPresenceUpdates() { if (this.updateTimer) { clearInterval(this.updateTimer) this.updateTimer = undefined }
if (this.activityTimer) { clearInterval(this.activityTimer) this.activityTimer = undefined }
}/** * 计算当前状态 */
private calculateStatus(): UserPresence['status'] { const now = Date.now() const timeSinceActivity = now - this.lastActivity if (timeSinceActivity < this.config.inactiveTimeout) { return 'online' }
else if (timeSinceActivity < this.config.awayTimeout) { return 'away' }
else { return 'offline' }
}/** * 获取当前用户ID */
private async getCurrentUserId(): Promise<string | undefined> { const { data: { user }
}= await this.supabase.auth.getUser() return user?.id }
/** * 节流函数 */
private throttle(func: Function, delay: number) { let lastCall = 0 return (...args: any[]) => { const now = Date.now() if (now - lastCall >= delay) { lastCall = now func(...args) }
} }
}
// 导出单例实例 let presenceManager: RealtimePresence | null = null export function getPresenceManager(config?: Partial<PresenceConfig>): RealtimePresence { if (!presenceManager) { presenceManager = new RealtimePresence(config) }
return presenceManager }
export function disconnectPresenceManager(): Promise<void> { if (presenceManager) { return presenceManager.disconnect().then(() => { presenceManager = null }) }
return Promise.resolve() }
/** * React Hook: 使用在线状态 */
export function useOnlinePresence(page?: string) { const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]) const [isInitialized, setIsInitialized] = useState(false) const [currentUserStatus, setCurrentUserStatus] = useState<UserPresence['status']>('online') useEffect(() => { const presence = getPresenceManager() const initialize = async () => { await presence.initialize(page) setIsInitialized(true) // 获取初始在线用户列表 const users = await presence.getOnlineUsers() setOnlineUsers(users) }
// 监听用户上线事件 const unsubOnline = getEventManager().subscribe( REALTIME_EVENTS.USER_ONLINE, async () => { const users = await presence.getOnlineUsers() setOnlineUsers(users) } ) // 监听用户下线事件 const unsubOffline = getEventManager().subscribe( REALTIME_EVENTS.USER_OFFLINE, async () => { const users = await presence.getOnlineUsers() setOnlineUsers(users) } ) // 定期刷新在线列表 const refreshInterval = setInterval(async () => { const users = await presence.getOnlineUsers() setOnlineUsers(users) }, 30000) // 30秒刷新一次 initialize() return () => { unsubOnline() unsubOffline() clearInterval(refreshInterval) presence.disconnect() setIsInitialized(false) }
}, [page]) return { onlineUsers, isInitialized, currentUserStatus, totalOnline: onlineUsers.length, updatePage: (newPage: string) => { getPresenceManager().updateCurrentPage(newPage) }, }
}
// 导入React hooks import { useState, useEffect }
from 'react'