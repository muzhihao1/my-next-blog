'use client' import { useEffect, useState }
from 'react' 

import { LineChart }
from './charts/LineChart' 

import { BarChart }
from './charts/BarChart' 

import { PieChart }
from './charts/PieChart' 

import { Card }
from '@/components/ui/Card' 

import { LoadingSpinner }
from '@/components/ui/LoadingSpinner' 

import { formatDistance }
from 'date-fns' 

import { zhCN }
from 'date-fns/locale' 

import { AggregatedStats, RealtimeStats, TimeGranularity }
from '@/lib/analytics/types' interface AnalyticsDashboardProps { timeRange?: { start: Date end: Date }
granularity?: TimeGranularity className?: string }
export function AnalyticsDashboard({ timeRange = { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 默认7天 end: new Date() }, granularity = TimeGranularity.DAY, className = '' }: AnalyticsDashboardProps) { const [loading, setLoading] = useState(true) const [stats, setStats] = useState<AggregatedStats | null>(null) const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null) const [error, setError] = useState<string | null>(null) // 获取统计数据 useEffect(() => { const fetchStats = async () => { try { setLoading(true) // 获取聚合统计 const statsResponse = await fetch('/api/analytics/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ timeRange, granularity }) }) if (!statsResponse.ok) throw new Error('获取统计数据失败') const statsData = await statsResponse.json() setStats(statsData) // 获取实时统计 const realtimeResponse = await fetch('/api/analytics/realtime') if (!realtimeResponse.ok) throw new Error('获取实时数据失败') const realtimeData = await realtimeResponse.json() setRealtimeStats(realtimeData) }
catch (err) { setError(err instanceof Error ? err.message : '未知错误') }
finally { setLoading(false) }
}
fetchStats() const interval = setInterval(fetchStats, 60000) // 每分钟更新 return () => clearInterval(interval) }, [timeRange, granularity]) if (loading) { return ( <div className="flex items-center justify-center h-96">
<LoadingSpinner size="lg" /> </div> ) }
if (error) { return ( <div className="text-center py-8">
<p className="text-red-500">加载失败：{error}</p> </div> ) }
if (!stats || !realtimeStats) { return null }
// 准备图表数据 const pageViewsData = stats.daily_views?.map((item, index) => ({ x: new Date(timeRange.start.getTime() + index * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }), y: item.views, label: `${item.views} 次浏览` })) || []
const deviceData = Object.entries(stats.device_breakdown || {}).map(([device, count]) => ({ label: device === 'mobile' ? '移动设备' : device === 'desktop' ? '桌面设备' : '平板', value: count }))

const topPostsData = stats.top_posts?.slice(0, 5).map(post => ({ label: post.title || post.post_id, value: post.views })) || []
const browserData = Object.entries(stats.browser_breakdown || {}) .sort((a, b) => b[1] - a[1]) .slice(0, 6) .map(([browser, count]) => ({ label: browser, value: count })) return ( <div className={`space-y-6 ${className}`}> {/* 实时统计卡片 */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<Card className="p-6">
<h3 className="text-sm font-medium text-gray-500">当前在线</h3>
<p className="text-3xl font-bold mt-2">{realtimeStats.current_active_users}</p>
<p className="text-sm text-gray-500 mt-1">活跃用户</p> </Card>
<Card className="p-6">
<h3 className="text-sm font-medium text-gray-500">总浏览量</h3>
<p className="text-3xl font-bold mt-2">{stats.total_views.toLocaleString()}</p>
<p className="text-sm text-gray-500 mt-1"> 过去{formatDistance(timeRange.start, timeRange.end, { locale: zhCN })} </p> </Card>
<Card className="p-6">
<h3 className="text-sm font-medium text-gray-500">独立访客</h3>
<p className="text-3xl font-bold mt-2">{stats.unique_visitors.toLocaleString()}</p>
<p className="text-sm text-gray-500 mt-1"> 跳出率 {(stats.bounce_rate * 100).toFixed(1)}% </p> </Card>
<Card className="p-6">
<h3 className="text-sm font-medium text-gray-500">平均阅读时长</h3>
<p className="text-3xl font-bold mt-2"> {Math.floor(stats.avg_read_time / 60)}:{(stats.avg_read_time % 60).toString().padStart(2, '0')} </p>
<p className="text-sm text-gray-500 mt-1"> 参与率 {(stats.engagement_rate * 100).toFixed(1)}% </p> </Card> </div> {/* 页面浏览趋势 */}
<Card className="p-6">
<h2 className="text-lg font-semibold mb-4">页面浏览趋势</h2>
<LineChart data={pageViewsData}
xLabel="日期" yLabel="浏览量" height={300}
color="#3B82F6" /> </Card> {/* 设备和热门文章 */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* 设备分布 */}
<Card className="p-6">
<h2 className="text-lg font-semibold mb-4">设备分布</h2>
<PieChart data={deviceData}
size={280}
donut={true}
/> </Card> {/* 热门文章 */}
<Card className="p-6">
<h2 className="text-lg font-semibold mb-4">热门文章</h2>
<BarChart data={topPostsData}
orientation="horizontal" height={280}
xLabel="浏览量" /> </Card> </div> {/* 浏览器分布和实时页面 */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* 浏览器分布 */}
<Card className="p-6">
<h2 className="text-lg font-semibold mb-4">浏览器分布</h2>
<BarChart data={browserData}
height={250}
yLabel="用户数" /> </Card> {/* 实时页面活动 */}
<Card className="p-6">
<h2 className="text-lg font-semibold mb-4">实时页面活动</h2>
<div className="space-y-3"> {realtimeStats.current_page_views.slice(0, 8).map((page, index) => ( <div key={index}
className="flex items-center justify-between">
<span className="text-sm text-gray-600 truncate max-w-[60%]"> {page.path} </span>
<div className="flex items-center gap-2">
<div className="flex -space-x-1"> {[...Array(Math.min(page.count, 5))].map((_, i) => ( <div key={i}
className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}
s` }
}
/> ))} </div>
<span className="text-sm font-medium">{page.count} 人</span> </div> </div> ))} </div> </Card> </div> {/* 用户分析 */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<Card className="p-6">
<h3 className="text-sm font-medium text-gray-500">新用户</h3>
<p className="text-2xl font-bold mt-2">{stats.new_users.toLocaleString()}</p>
<p className="text-sm text-green-600 mt-1"> 占比 {((stats.new_users / stats.unique_visitors) * 100).toFixed(1)}% </p> </Card>
<Card className="p-6">
<h3 className="text-sm font-medium text-gray-500">回访用户</h3>
<p className="text-2xl font-bold mt-2">{stats.returning_users.toLocaleString()}</p>
<p className="text-sm text-blue-600 mt-1"> 占比 {((stats.returning_users / stats.unique_visitors) * 100).toFixed(1)}% </p> </Card>
<Card className="p-6">
<h3 className="text-sm font-medium text-gray-500">用户留存率</h3>
<p className="text-2xl font-bold mt-2">{(stats.user_retention_rate * 100).toFixed(1)}%</p>
<p className="text-sm text-gray-500 mt-1"> 平均会话 {Math.floor(stats.avg_session_duration / 60)} 分钟 </p> </Card> </div> {/* 热门搜索 */} {stats.top_searches && stats.top_searches.length > 0 && ( <Card className="p-6">
<h2 className="text-lg font-semibold mb-4">热门搜索</h2>
<div className="space-y-2"> {stats.top_searches.slice(0, 10).map((search, index) => ( <div key={index}
className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
<span className="text-sm">{search.query}</span>
<div className="flex items-center gap-4">
<span className="text-sm text-gray-500">{search.count} 次</span>
<span className="text-sm text-gray-500"> CTR {(search.click_through_rate * 100).toFixed(1)}% </span> </div> </div> ))} </div> </Card> )} </div> ) }