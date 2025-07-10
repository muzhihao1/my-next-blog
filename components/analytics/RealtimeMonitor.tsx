'use client' import { useEffect, useState, useRef }
from 'react' 

import { Card }
from '@/components/ui/Card' 

import { Activity, Users, Globe, TrendingUp, Eye, MousePointer }
from 'lucide-react' 

import { createClient }
from '@supabase/supabase-js' interface RealtimeEvent { id: string type: string path: string user_id?: string timestamp: Date metadata?: any }
interface ActiveUser { id: string path: string lastActivity: Date device: string location?: string }
interface RealtimeMonitorProps { maxEvents?: number className?: string }
export function RealtimeMonitor({ maxEvents = 20, className = '' }: RealtimeMonitorProps) { const [events, setEvents] = useState<RealtimeEvent[]>([]) const [activeUsers, setActiveUsers] = useState<Map<string, ActiveUser>>(new Map()) const [stats, setStats] = useState({ activeUsers: 0, pageViews: 0, clickEvents: 0, scrollEvents: 0 }) const eventsContainerRef = useRef<HTMLDivElement>(null) useEffect(() => { // 初始化 Supabase 客户端 const supabase = createClient( process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ) // 订阅实时事件 const channel = supabase .channel('realtime-monitor') .on('broadcast', { event: 'analytics_event' }, (payload) => { const event: RealtimeEvent = { id: payload.payload.id || Math.random().toString(36), type: payload.payload.type, path: payload.payload.path, user_id: payload.payload.user_id, timestamp: new Date(payload.payload.timestamp), metadata: payload.payload.metadata }
// 更新事件列表 setEvents(prev => [event, ...prev].slice(0, maxEvents)) // 更新统计 setStats(prev => { const newStats = { ...prev }
if (event.type === 'page_view') newStats.pageViews++ if (event.type === 'click') newStats.clickEvents++ if (event.type === 'scroll') newStats.scrollEvents++ return newStats }) // 更新活跃用户 if (event.user_id) { setActiveUsers(prev => { const updated = new Map(prev) updated.set(event.user_id!, { id: event.user_id!, path: event.path, lastActivity: event.timestamp, device: event.metadata?.device || 'unknown', location: event.metadata?.location }) return updated }) }
}) .subscribe() // 定期清理不活跃用户（5分钟无活动） const cleanupInterval = setInterval(() => { const now = Date.now() setActiveUsers(prev => { const updated = new Map() prev.forEach((user, id) => { if (now - user.lastActivity.getTime() < 5 * 60 * 1000) { updated.set(id, user) }
}) return updated }) }, 30000) // 每30秒清理一次 // 更新活跃用户数 const updateInterval = setInterval(() => { setStats(prev => ({ ...prev, activeUsers: activeUsers.size })) }, 1000) return () => { channel.unsubscribe() clearInterval(cleanupInterval) clearInterval(updateInterval) }
}, [maxEvents]) // 自动滚动到最新事件 useEffect(() => { if (eventsContainerRef.current) { eventsContainerRef.current.scrollTop = 0 }
}, [events]) // 格式化时间 const formatTime = (date: Date) => { return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
// 获取事件图标 const getEventIcon = (type: string) => { switch (type) { case 'page_view': return <Eye className="w-4 h-4 text-blue-500" /> case 'click': return <MousePointer className="w-4 h-4 text-green-500" /> case 'scroll': return <Activity className="w-4 h-4 text-purple-500" /> default: return <Globe className="w-4 h-4 text-gray-500" /> }
}
// 获取事件描述 const getEventDescription = (event: RealtimeEvent) => { switch (event.type) { case 'page_view': return `访问了 ${event.path}` case 'click': return `点击了 ${event.metadata?.element || '元素'}` case 'scroll': return `滚动到 ${event.metadata?.depth || 0}%` default: return event.type }
}
return ( <div className={`space-y-6 ${className}`}> {/* 实时统计卡片 */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
<Card className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-500">在线用户</p>
<p className="text-2xl font-bold">{stats.activeUsers}</p> </div>
<Users className="w-8 h-8 text-green-500" /> </div> </Card>
<Card className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-500">页面浏览</p>
<p className="text-2xl font-bold">{stats.pageViews}</p> </div>
<Eye className="w-8 h-8 text-blue-500" /> </div> </Card>
<Card className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-500">点击事件</p>
<p className="text-2xl font-bold">{stats.clickEvents}</p> </div>
<MousePointer className="w-8 h-8 text-purple-500" /> </div> </Card>
<Card className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-500">活跃度</p>
<p className="text-2xl font-bold"> {events.length > 0 ? ( <span className="flex items-center gap-1"> 高 <Activity className="w-5 h-5 text-orange-500 animate-pulse" /> </span> ) : ( '低' )} </p> </div>
<TrendingUp className="w-8 h-8 text-orange-500" /> </div> </Card> </div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* 实时事件流 */}
<Card className="p-6">
<h3 className="text-lg font-semibold mb-4">实时事件流</h3>
<div ref={eventsContainerRef}
className="space-y-2 max-h-96 overflow-y-auto" > {events.length === 0 ? ( <p className="text-center text-gray-500 py-8">等待事件...</p> ) : ( events.map((event) => ( <div key={event.id}
className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg animate-slide-in" > {getEventIcon(event.type)}
<div className="flex-1 min-w-0">
<p className="text-sm">{getEventDescription(event)}</p>
<p className="text-xs text-gray-500"> {formatTime(event.timestamp)} {event.user_id && ` · 用户 ${event.user_id.slice(0, 8)}`} </p> </div> </div> )) )} </div> </Card> {/* 活跃用户地图/列表 */}
<Card className="p-6">
<h3 className="text-lg font-semibold mb-4">当前活跃用户</h3>
<div className="space-y-2 max-h-96 overflow-y-auto"> {activeUsers.size === 0 ? ( <p className="text-center text-gray-500 py-8">暂无活跃用户</p> ) : ( Array.from(activeUsers.values()).map((user) => ( <div key={user.id}
className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" >
<div className="flex items-center gap-3">
<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
<div>
<p className="text-sm font-medium"> {user.path} </p>
<p className="text-xs text-gray-500"> {user.device} · {user.location || '未知位置'} </p> </div> </div>
<span className="text-xs text-gray-500"> {formatTime(user.lastActivity)} </span> </div> )) )} </div> </Card> </div> {/* 实时热力图预览 */}
<Card className="p-6">
<h3 className="text-lg font-semibold mb-4">页面活跃度热力图</h3>
<div className="grid grid-cols-4 md:grid-cols-8 gap-2"> {[...Array(32)].map((_, i) => { const intensity = Math.random() // 实际应该基于真实数据 return ( <div key={i}
className="aspect-square rounded transition-all duration-500" style={{ backgroundColor: `rgba(59, 130, 246, ${intensity})`, transform: `scale(${0.9 + intensity * 0.1})` }
}
title={`区域 ${i + 1}: ${Math.round(intensity * 100)}% 活跃度`}
/> ) })} </div> </Card> </div> ) }
// 添加滑入动画 const slideInStyle = ` @keyframes slide-in { from { opacity: 0; transform: translateY(-10px); }
to { opacity: 1; transform: translateY(0); }
}.animate-slide-in { animation: slide-in 0.3s ease-out; } ` if (typeof document !== 'undefined') { const style = document.createElement('style') style.textContent = slideInStyle document.head.appendChild(style) }