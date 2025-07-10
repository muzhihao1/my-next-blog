'use client' import { useState, useEffect }
from 'react' 

import Link from 'next/link' 

import { formatDistanceToNow }
from 'date-fns' 

import { zhCN }
from 'date-fns/locale' // 定义活动类型 interface Activity { id: string type: 'post' | 'project' | 'book' | 'tool' title: string description: string date: string url: string icon: React.ReactElement color: string }
// 模拟获取最新活动数据（实际使用时从各个数据源获取） async function getRecentActivities(): Promise<Activity[]> { // 这里应该从实际的数据源获取 const activities: Activity[] = [ { id: '1', type: 'post', title: '如何克服拖延症：实用技巧分享', description: '分享一些我在克服拖延症过程中的实用技巧和心得体会', date: '2024-01-06T10:00:00Z', url: '/posts/overcome-procrastination', icon: ( <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> </svg> ), color: 'from-blue-500 to-blue-600' }, { id: '2', type: 'project', title: '个人博客网站', description: '使用 Next.js 14 和 Tailwind CSS 构建的现代化个人博客', date: '2024-01-05T14:30:00Z', url: '/projects/personal-blog', icon: ( <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /> </svg> ), color: 'from-green-500 to-green-600' }, { id: '3', type: 'book', title: '深入浅出 TypeScript', description: '开始阅读这本关于 TypeScript 高级特性的书籍', date: '2024-01-04T09:00:00Z', url: '/bookshelf/1', icon: ( <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> </svg> ), color: 'from-purple-500 to-purple-600' }, { id: '4', type: 'tool', title: 'Visual Studio Code', description: '更新了我最喜欢的代码编辑器的配置和插件推荐', date: '2024-01-03T16:00:00Z', url: '/tools/visual-studio-code', icon: ( <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> </svg> ), color: 'from-orange-500 to-orange-600' }, { id: '5', type: 'post', title: 'React 18 并发特性深度解析', description: '深入探讨 React 18 的并发渲染、Suspense 和新的 Hooks', date: '2024-01-02T11:00:00Z', url: '/posts/react-18-concurrent-features', icon: ( <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> </svg> ), color: 'from-blue-500 to-blue-600' }
]// 按日期排序 return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }
const typeLabels = { post: '文章', project: '项目', book: '书籍', tool: '工具' }
/** * 动态时间线组件 */
export default function ActivityTimeline() { const [activities, setActivities] = useState<Activity[]>([]) const [selectedType, setSelectedType] = useState<keyof typeof typeLabels | 'all'>('all') const [isLoading, setIsLoading] = useState(true) useEffect(() => { const loadActivities = async () => { setIsLoading(true) try { const data = await getRecentActivities() setActivities(data) }
catch (error) { console.error('Failed to load activities:', error) }
finally { setIsLoading(false) }
}
loadActivities() }, []) const filteredActivities = selectedType === 'all' ? activities : activities.filter(activity => activity.type === selectedType) if (isLoading) { return ( <section className="py-16">
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="animate-pulse">
<div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
<div className="space-y-6"> {[1, 2, 3].map(i => ( <div key={i}
className="flex gap-4">
<div className="w-12 h-12 bg-gray-200 rounded-full"></div>
<div className="flex-1">
<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
<div className="h-3 bg-gray-200 rounded w-1/2"></div> </div> </div> ))} </div> </div> </div> </section> ) }
return ( <section className="py-16 bg-gray-50/50">
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="text-center mb-12">
<h2 className="text-3xl font-bold text-gray-900 mb-4"> 最新动态 </h2>
<p className="text-lg text-gray-600"> 查看我最近的文章、项目、阅读和工具更新 </p> </div> {/* 类型筛选 */}
<div className="flex flex-wrap justify-center gap-2 mb-12">
<button onClick={() => setSelectedType('all')}
className={`px-4 py-2 rounded-lg transition-all ${ selectedType === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100:bg-gray-700' }`} > 全部 </button> {Object.entries(typeLabels).map(([key, label]) => ( <button key={key}
onClick={() => setSelectedType(key as keyof typeof typeLabels)}
className={`px-4 py-2 rounded-lg transition-all ${ selectedType === key ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100:bg-gray-700' }`} > {label} </button> ))} </div> {/* 时间线 */}
<div className="relative"> {/* 垂直线 */}
<div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div> {/* 活动列表 */}
<div className="space-y-8"> {filteredActivities.map((activity, index) => ( <div key={activity.id}
className="relative"> {/* 时间线节点 */}
<div className={`absolute left-6 w-12 h-12 rounded-full bg-gradient-to-r ${activity.color}
flex items-center justify-center text-white transform -translate-x-1/2`}> {activity.icon} </div> {/* 内容卡片 */}
<div className="ml-20">
<Link href={activity.url}
className="block bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all group" >
<div className="flex items-start justify-between mb-2">
<div>
<span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 mb-2"> {typeLabels[activity.type]
}</span>
<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600:text-blue-400 transition-colors"> {activity.title} </h3> </div> </div>
<p className="text-gray-600 mb-3"> {activity.description} </p>
<time className="text-sm text-gray-500"> {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: zhCN })} </time> </Link> </div> </div> ))} </div> {/* 查看更多 */}
<div className="text-center mt-12">
<Link href="/archive" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50:bg-gray-700 transition-colors" > 查看所有动态 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M17 8l4 4m0 0l-4 4m4-4H3" /> </svg> </Link> </div> </div> </div> </section> ) }