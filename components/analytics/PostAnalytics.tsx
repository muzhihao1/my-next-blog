'use client' import { useEffect, useState }
from 'react' 

import { LineChart }
from './charts/LineChart' 

import { BarChart }
from './charts/BarChart' 

import { Card }
from '@/components/ui/Card' 

import { LoadingSpinner }
from '@/components/ui/LoadingSpinner' 

import { Calendar, Eye, Clock, TrendingUp, Users, MessageSquare }
from 'lucide-react' interface PostAnalyticsData { post_id: string title: string views_over_time: Array<{ date: string views: number unique_visitors: number }> total_views: number unique_visitors: number avg_read_time: number completion_rate: number engagement_score: number referrer_breakdown: Record<string, number> device_breakdown: Record<string, number> geographic_breakdown: Record<string, number> related_posts: Array<{ post_id: string title: string correlation_score: number }> }
interface PostAnalyticsProps { postId: string className?: string }
export function PostAnalytics({ postId, className = '' }: PostAnalyticsProps) { const [loading, setLoading] = useState(true) const [data, setData] = useState<PostAnalyticsData | null>(null) const [error, setError] = useState<string | null>(null) useEffect(() => { const fetchAnalytics = async () => { try { setLoading(true) const response = await fetch(`/api/analytics/posts/${postId}`) if (!response.ok) throw new Error('获取文章分析数据失败') const analyticsData = await response.json() setData(analyticsData) }
catch (err) { setError(err instanceof Error ? err.message : '未知错误') }
finally { setLoading(false) }
}
fetchAnalytics() }, [postId]) if (loading) { return ( <div className="flex items-center justify-center h-64">
<LoadingSpinner size="lg" /> </div> ) }
if (error || !data) { return ( <div className="text-center py-8">
<p className="text-red-500">{error || '无法加载数据'}</p> </div> ) }
// 准备图表数据 const viewsChartData = data.views_over_time.map(item => ({ x: new Date(item.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }), y: item.views, label: `${item.views} 次浏览` }))

const referrerData = Object.entries(data.referrer_breakdown) .sort((a, b) => b[1] - a[1]) .slice(0, 5) .map(([source, count]) => ({ label: source === 'direct' ? '直接访问' : source === 'search' ? '搜索引擎' : source === 'social' ? '社交媒体' : source, value: count }))

const geoData = Object.entries(data.geographic_breakdown) .sort((a, b) => b[1] - a[1]) .slice(0, 8) .map(([country, count]) => ({ label: country, value: count })) return ( <div className={`space-y-6 ${className}`}> {/* 标题 */}
<div className="mb-6">
<h2 className="text-2xl font-bold mb-2">{data.title}</h2>
<p className="text-gray-500">文章数据分析</p> </div> {/* 核心指标 */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
<Card className="p-4">
<div className="flex items-center gap-3">
<Eye className="w-8 h-8 text-blue-500" />
<div>
<p className="text-2xl font-bold">{data.total_views.toLocaleString()}</p>
<p className="text-sm text-gray-500">总浏览量</p> </div> </div> </Card>
<Card className="p-4">
<div className="flex items-center gap-3">
<Users className="w-8 h-8 text-green-500" />
<div>
<p className="text-2xl font-bold">{data.unique_visitors.toLocaleString()}</p>
<p className="text-sm text-gray-500">独立访客</p> </div> </div> </Card>
<Card className="p-4">
<div className="flex items-center gap-3">
<Clock className="w-8 h-8 text-purple-500" />
<div>
<p className="text-2xl font-bold"> {Math.floor(data.avg_read_time / 60)}:{(data.avg_read_time % 60).toString().padStart(2, '0')} </p>
<p className="text-sm text-gray-500">平均阅读时长</p> </div> </div> </Card>
<Card className="p-4">
<div className="flex items-center gap-3">
<TrendingUp className="w-8 h-8 text-orange-500" />
<div>
<p className="text-2xl font-bold">{(data.completion_rate * 100).toFixed(1)}%</p>
<p className="text-sm text-gray-500">完读率</p> </div> </div> </Card> </div> {/* 浏览趋势 */}
<Card className="p-6">
<h3 className="text-lg font-semibold mb-4">浏览趋势</h3>
<LineChart data={viewsChartData}
xLabel="日期" yLabel="浏览量" height={300}
color="#3B82F6" /> </Card> {/* 流量来源和地理分布 */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<Card className="p-6">
<h3 className="text-lg font-semibold mb-4">流量来源</h3>
<BarChart data={referrerData}
orientation="horizontal" height={250}
xLabel="访问量" /> </Card>
<Card className="p-6">
<h3 className="text-lg font-semibold mb-4">地理分布</h3>
<BarChart data={geoData}
height={250}
yLabel="访问量" /> </Card> </div> {/* 参与度分析 */}
<Card className="p-6">
<h3 className="text-lg font-semibold mb-4">参与度分析</h3>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="text-center">
<div className="relative inline-flex items-center justify-center w-32 h-32">
<svg className="w-32 h-32 transform -rotate-90">
<circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
<circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 56}`}
strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.engagement_score)}`}
className="text-blue-500 transition-all duration-1000" /> </svg>
<span className="absolute text-2xl font-bold"> {(data.engagement_score * 100).toFixed(0)}% </span> </div>
<p className="mt-2 text-sm text-gray-600">参与度评分</p> </div>
<div className="space-y-4">
<div>
<div className="flex justify-between mb-1">
<span className="text-sm">滚动深度</span>
<span className="text-sm font-medium">85%</span> </div>
<div className="w-full bg-gray-200 rounded-full h-2">
<div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }
}
/> </div> </div>
<div>
<div className="flex justify-between mb-1">
<span className="text-sm">互动率</span>
<span className="text-sm font-medium">42%</span> </div>
<div className="w-full bg-gray-200 rounded-full h-2">
<div className="bg-green-500 h-2 rounded-full" style={{ width: '42%' }
}
/> </div> </div>
<div>
<div className="flex justify-between mb-1">
<span className="text-sm">分享率</span>
<span className="text-sm font-medium">18%</span> </div>
<div className="w-full bg-gray-200 rounded-full h-2">
<div className="bg-purple-500 h-2 rounded-full" style={{ width: '18%' }
}
/> </div> </div> </div>
<div className="space-y-3">
<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
<span className="text-sm">平均停留时间</span>
<span className="font-medium">3:45</span> </div>
<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
<span className="text-sm">跳出率</span>
<span className="font-medium">23%</span> </div>
<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
<span className="text-sm">返回率</span>
<span className="font-medium">31%</span> </div> </div> </div> </Card> {/* 相关文章 */} {data.related_posts && data.related_posts.length > 0 && ( <Card className="p-6">
<h3 className="text-lg font-semibold mb-4">读者还在看</h3>
<div className="space-y-3"> {data.related_posts.map((post, index) => ( <div key={post.post_id}
className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
<div>
<p className="font-medium">{post.title}</p>
<p className="text-sm text-gray-500">相关度 {(post.correlation_score * 100).toFixed(0)}%</p> </div>
<button className="text-blue-500 hover:text-blue-600 text-sm"> 查看分析 </button> </div> ))} </div> </Card> )} </div> ) }