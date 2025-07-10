'use client' import { useEffect, useState }
from 'react' 

import { HeatMap }
from './charts/HeatMap' 

import { Card }
from '@/components/ui/Card' 

import { LoadingSpinner }
from '@/components/ui/LoadingSpinner' interface ActivityData { hourly_activity: number[][] // 24 hours x 7 days peak_hours: { hour: number; count: number }[]
peak_days: { day: string; count: number }[]
timezone: string }
interface UserActivityMapProps { userId?: string className?: string }
export function UserActivityMap({ userId, className = '' }: UserActivityMapProps) { const [loading, setLoading] = useState(true) const [data, setData] = useState<ActivityData | null>(null) const [error, setError] = useState<string | null>(null) useEffect(() => { const fetchActivityData = async () => { try { setLoading(true) const endpoint = userId ? `/api/analytics/users/${userId}/activity` : '/api/analytics/activity' const response = await fetch(endpoint) if (!response.ok) throw new Error('获取活动数据失败') const activityData = await response.json() setData(activityData) }
catch (err) { setError(err instanceof Error ? err.message : '未知错误') }
finally { setLoading(false) }
}
fetchActivityData() }, [userId]) if (loading) { return ( <div className="flex items-center justify-center h-64">
<LoadingSpinner size="lg" /> </div> ) }
if (error || !data) { return ( <div className="text-center py-8">
<p className="text-red-500">{error || '无法加载数据'}</p> </div> ) }
// 准备热力图数据 const heatMapData = data.hourly_activity.flatMap((dayData, dayIndex) => dayData.map((value, hourIndex) => ({ x: hourIndex, y: dayIndex, value })) ) const hours = Array.from({ length: 24 }, (_, i) => i === 0 ? '12am' : i < 12 ? `${i}
am` : i === 12 ? '12pm' : `${i - 12}
pm` ) const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] // 计算最活跃时段 const maxActivity = Math.max(...data.hourly_activity.flat()) const mostActiveTime = data.hourly_activity.reduce((acc, dayData, dayIndex) => { const maxHour = dayData.indexOf(Math.max(...dayData)) const maxValue = dayData[maxHour]
if (maxValue > acc.value) { return { day: dayIndex, hour: maxHour, value: maxValue }
}
return acc }, { day: 0, hour: 0, value: 0 }) return ( <div className={`space-y-6 ${className}`}>
<Card className="p-6">
<h2 className="text-lg font-semibold mb-4"> {userId ? '用户活动热力图' : '整体活动热力图'} </h2> {/* 活动热力图 */}
<div className="mb-6 overflow-x-auto">
<HeatMap data={heatMapData}
xLabels={hours}
yLabels={days}
width={Math.max(800, hours.length * 35)}
height={300}
cellSize={30}
colorScale={{ min: '#F3F4F6', mid: '#60A5FA', max: '#1E40AF' }
}
formatValue={(v) => v.toString()}
/> </div> {/* 活动统计 */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="bg-gray-50 rounded-lg p-4">
<h3 className="text-sm font-medium text-gray-500 mb-2"> 最活跃时段 </h3>
<p className="text-xl font-semibold"> {days[mostActiveTime.day]
}{hours[mostActiveTime.hour]
}</p>
<p className="text-sm text-gray-500 mt-1"> {mostActiveTime.value} 次活动 </p> </div>
<div className="bg-gray-50 rounded-lg p-4">
<h3 className="text-sm font-medium text-gray-500 mb-2"> 高峰时段 </h3>
<div className="space-y-1 mt-2"> {data.peak_hours.slice(0, 3).map((peak, i) => ( <div key={i}
className="flex justify-between text-sm">
<span>{hours[peak.hour]
}</span>
<span className="text-gray-500">{peak.count} 次</span> </div> ))} </div> </div>
<div className="bg-gray-50 rounded-lg p-4">
<h3 className="text-sm font-medium text-gray-500 mb-2"> 活跃天数 </h3>
<div className="space-y-1 mt-2"> {data.peak_days.slice(0, 3).map((peak, i) => ( <div key={i}
className="flex justify-between text-sm">
<span>{peak.day}</span>
<span className="text-gray-500">{peak.count} 次</span> </div> ))} </div> </div> </div> {/* 活动模式分析 */}
<div className="mt-6 pt-6 border-t border-gray-200">
<h3 className="text-sm font-medium mb-3">活动模式分析</h3>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
<div>
<span className="text-gray-500">工作日活跃度</span>
<p className="font-medium"> {calculateWeekdayActivity(data.hourly_activity)}% </p> </div>
<div>
<span className="text-gray-500">周末活跃度</span>
<p className="font-medium"> {calculateWeekendActivity(data.hourly_activity)}% </p> </div>
<div>
<span className="text-gray-500">上午活跃度</span>
<p className="font-medium"> {calculateMorningActivity(data.hourly_activity)}% </p> </div>
<div>
<span className="text-gray-500">夜间活跃度</span>
<p className="font-medium"> {calculateNightActivity(data.hourly_activity)}% </p> </div> </div> </div> </Card> </div> ) }
// 计算工作日活跃度百分比 function calculateWeekdayActivity(data: number[][]): number { const weekdayTotal = data.slice(0, 5).reduce((sum, day) => sum + day.reduce((a, b) => a + b, 0), 0 ) const total = data.reduce((sum, day) => sum + day.reduce((a, b) => a + b, 0), 0 ) return Math.round((weekdayTotal / total) * 100) }
// 计算周末活跃度百分比 function calculateWeekendActivity(data: number[][]): number { const weekendTotal = data.slice(5).reduce((sum, day) => sum + day.reduce((a, b) => a + b, 0), 0 ) const total = data.reduce((sum, day) => sum + day.reduce((a, b) => a + b, 0), 0 ) return Math.round((weekendTotal / total) * 100) }
// 计算上午活跃度百分比（6-12点） function calculateMorningActivity(data: number[][]): number { const morningTotal = data.reduce((sum, day) => sum + day.slice(6, 12).reduce((a, b) => a + b, 0), 0 ) const total = data.reduce((sum, day) => sum + day.reduce((a, b) => a + b, 0), 0 ) return Math.round((morningTotal / total) * 100) }
// 计算夜间活跃度百分比（20-24点 + 0-6点） function calculateNightActivity(data: number[][]): number { const nightTotal = data.reduce((sum, day) => sum + day.slice(20).reduce((a, b) => a + b, 0) + day.slice(0, 6).reduce((a, b) => a + b, 0), 0 ) const total = data.reduce((sum, day) => sum + day.reduce((a, b) => a + b, 0), 0 ) return Math.round((nightTotal / total) * 100) }