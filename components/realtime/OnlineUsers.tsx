'use client' import { useState, useEffect }
from 'react' 

import { usePathname }
from 'next/navigation' 

import { useAuth }
from '@/contexts/AuthContext' 

import { REALTIME_CHANNELS, UserPresence }
from '@/lib/realtime/config' 

import { getRealtimeClient }
from '@/lib/realtime/client' interface OnlineUsersProps { channelName?: string showDetails?: boolean maxDisplay?: number className?: string }
export function OnlineUsers({ channelName, showDetails = false, maxDisplay = 5, className = '' }: OnlineUsersProps) { const { user } = useAuth() const pathname = usePathname() const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]) const [isConnected, setIsConnected] = useState(false) const [showTooltip, setShowTooltip] = useState(false) // 使用页面路径作为默认频道名 const channel = channelName || REALTIME_CHANNELS.PRESENCE useEffect(() => { const client = getRealtimeClient() let unsubscribe: (() => Promise<void>) | null = null const connectToChannel = async () => { try { // 订阅在线状态频道 await client.subscribe(channel, { onConnect: () => { console.log('Connected to presence channel') setIsConnected(true) updateUserPresence() }, onDisconnect: () => { console.log('Disconnected from presence channel') setIsConnected(false) }, onError: (error) => { console.error('Presence channel error:', error) setIsConnected(false) }
}) // 监听在线用户变化 const intervalId = setInterval(async () => { const users = await client.getPresence(channel) setOnlineUsers(users) }, 5000) // 每5秒更新一次 // 立即获取一次在线用户 const users = await client.getPresence(channel) setOnlineUsers(users) // 清理函数 unsubscribe = async () => { clearInterval(intervalId) await client.unsubscribe(channel) }
}
catch (error) { console.error('Failed to connect to presence channel:', error) }
}
// 更新当前用户的在线状态 const updateUserPresence = async () => { if (!user) return try { await client.updatePresence(channel, { userId: user.id, username: user.user_metadata?.display_name || user.email?.split('@')[0] || '访客', avatar: user.user_metadata?.avatar_url, status: 'online', currentPage: pathname, lastSeen: Date.now() }) }
catch (error) { console.error('Failed to update presence:', error) }
}
// 页面可见性变化时更新状态 const handleVisibilityChange = () => { if (document.visibilityState === 'visible' && isConnected) { updateUserPresence() }
}
// 定期更新在线状态（心跳） const heartbeatInterval = setInterval(() => { if (isConnected && user) { updateUserPresence() }
}, 30000) // 每30秒更新一次 document.addEventListener('visibilitychange', handleVisibilityChange) connectToChannel() return () => { document.removeEventListener('visibilitychange', handleVisibilityChange) clearInterval(heartbeatInterval) if (unsubscribe) { unsubscribe() }
} }, [channel, pathname, user, isConnected]) // 过滤掉离线太久的用户 const activeUsers = onlineUsers.filter(u => { const lastSeenTime = u.lastSeen || 0 const now = Date.now() return now - lastSeenTime < 60000 // 1分钟内活跃 }) // 获取显示的用户和剩余数量 const displayUsers = activeUsers.slice(0, maxDisplay) const remainingCount = Math.max(0, activeUsers.length - maxDisplay) if (!isConnected || activeUsers.length === 0) { return null }
// 简单模式：只显示数量 if (!showDetails) { return ( <div className={`flex items-center gap-2 text-sm ${className}`}>
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span> </span>
<span className="text-gray-600"> {activeUsers.length} 人在线 </span> </div> ) }
// 详细模式：显示用户头像 return ( <div className={`flex items-center gap-3 ${className}`}>
<div className="flex items-center">
<span className="relative flex h-2 w-2 mr-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span> </span>
<span className="text-sm text-gray-600 mr-3"> {activeUsers.length} 人在线 </span> </div>
<div className="relative flex -space-x-2" onMouseEnter={() => setShowTooltip(true)}
onMouseLeave={() => setShowTooltip(false)} > {displayUsers.map((user, index) => ( <div key={user.userId}
className="relative" style={{ zIndex: displayUsers.length - index }
}>
<img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
alt={user.username}
className="w-8 h-8 rounded-full border-2 border-white hover:z-10 transition-all hover:scale-110" title={user.username}
/> {user.status === 'online' && ( <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" /> )} </div> ))} {remainingCount > 0 && ( <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 border-2 border-white text-xs font-medium text-gray-600"> +{remainingCount} </div> )} {/* 用户列表悬浮提示 */} {showTooltip && ( <div className="absolute top-full mt-2 left-0 z-50 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
<div className="text-sm font-medium text-gray-900 mb-2"> 在线用户 </div>
<div className="space-y-2 max-h-64 overflow-y-auto"> {activeUsers.map(user => ( <div key={user.userId}
className="flex items-center gap-2">
<img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
alt={user.username}
className="w-6 h-6 rounded-full" />
<div className="flex-1 min-w-0">
<div className="text-sm font-medium text-gray-900 truncate"> {user.username} </div> {user.currentPage && ( <div className="text-xs text-gray-500 truncate"> 正在浏览: {user.currentPage} </div> )} </div>
<span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full" /> </div> ))} </div> </div> )} </div> </div> ) }