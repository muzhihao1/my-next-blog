/** * 实时功能主入口 * 导出所有实时功能模块和便捷方法 */ // 导出配置 export * from './config' // 导出核心客户端 export { RealtimeClient, getRealtimeClient, disconnectRealtimeClient, }
from './client' // 导出事件管理器 export { RealtimeEventManager, getEventManager, disconnectEventManager, onRealtimeEvent, emitRealtimeEvent, }
from './event-manager' // 导出功能模块 export { RealtimeComments, getRealtimeComments, useRealtimeComments, type CommentRealtimeData, type CommentTypingData, }
from './features/comments' export { RealtimePresence, getPresenceManager, disconnectPresenceManager, useOnlinePresence, }
from './features/presence' export { RealtimeNotifications, getNotificationManager, useRealtimeNotifications, NotificationPriority, type NotificationOptions, type NotificationAction, }
from './features/notifications' // 导出便捷初始化函数 import { getRealtimeClient }
from './client' 

import { getEventManager }
from './event-manager' 

import { getPresenceManager }
from './features/presence' 

import { getNotificationManager }
from './features/notifications' 

import { RealtimeConfig }
from './config' /** * 初始化所有实时功能 */
export async function initializeRealtime(config?: Partial<RealtimeConfig>) { // 初始化客户端 const client = getRealtimeClient(config) // 初始化事件管理器 const eventManager = getEventManager() // 初始化在线状态 const presenceManager = getPresenceManager() await presenceManager.initialize() // 初始化通知 const notificationManager = getNotificationManager() await notificationManager.initialize() return { client, eventManager, presenceManager, notificationManager, }
}/** * 断开所有实时连接 */
export async function disconnectRealtime() { await Promise.all([ disconnectRealtimeClient(), disconnectEventManager(), disconnectPresenceManager(), ]) }
/** * React Hook: 使用实时功能 */
import { useEffect, useState }
from 'react' export function useRealtime(config?: Partial<RealtimeConfig>) { const [isInitialized, setIsInitialized] = useState(false) const [error, setError] = useState<Error | null>(null) useEffect(() => { let mounted = true const initialize = async () => { try { await initializeRealtime(config) if (mounted) { setIsInitialized(true) }
}
catch (err) { if (mounted) { setError(err as Error) console.error('Failed to initialize realtime:', err) }
} }
initialize() return () => { mounted = false disconnectRealtime() }
}, []) return { isInitialized, error } }