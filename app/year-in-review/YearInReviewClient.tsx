/** * 年度总结客户端组件 * @module app/year-in-review/YearInReviewClient * @description 展示年度数据的交互式组件 */ 'use client' import { useState }
from 'react' 

import Link from 'next/link' 

import { YearStatistics }
from '@/lib/statistics/year-statistics' 

import YearSelector from '@/components/ui/YearSelector' interface YearInReviewClientProps { yearStats: YearStatistics year: number }
export default function YearInReviewClient({ yearStats, year }: YearInReviewClientProps) { const [selectedMonth, setSelectedMonth] = useState<string | null>(null) const monthNames = [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ] // 获取月度最大值用于图表缩放 const maxMonthlyPosts = Math.max(...Object.values(yearStats.posts.monthlyDistribution)) // 格式化数字 const formatNumber = (num: number) => { return num.toLocaleString('zh-CN') }
return ( <div className="py-16 px-4 sm:px-6 lg:px-8">
<div className="max-w-7xl mx-auto"> {/* 页面标题 */}
<div className="text-center mb-16">
<h1 className="text-5xl font-bold text-gray-900 mb-4"> {year} 年度总结 </h1>
<p className="text-xl text-gray-600 mb-6"> 回顾这一年的创作历程 </p>
<YearSelector currentYear={year}
/> </div> {/* 核心数据卡片 */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-transform">
<div className="text-4xl font-bold mb-2"> {formatNumber(yearStats.posts.total)} </div>
<div className="text-blue-100">篇文章</div> </div>
<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-transform">
<div className="text-4xl font-bold mb-2"> {formatNumber(yearStats.posts.totalWords)} </div>
<div className="text-green-100">字创作</div> </div>
<div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-transform">
<div className="text-4xl font-bold mb-2"> {formatNumber(yearStats.projects.total)} </div>
<div className="text-purple-100">个项目</div> </div>
<div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-transform">
<div className="text-4xl font-bold mb-2"> {formatNumber(yearStats.books.completed)} </div>
<div className="text-orange-100">本书籍</div> </div> </div> {/* 月度分布图表 */}
<section className="mb-16">
<h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center"> 📊 月度创作分布 </h2>
<div className="bg-white rounded-2xl p-8 shadow-lg">
<div className="flex items-end justify-between h-64 mb-4"> {Object.entries(yearStats.posts.monthlyDistribution).map(([month, count]) => { const height = maxMonthlyPosts > 0 ? (count / maxMonthlyPosts) * 100 : 0 const isSelected = selectedMonth === month return ( <div key={month}
className="flex-1 flex flex-col items-center cursor-pointer" onClick={() => setSelectedMonth(isSelected ? null : month)} >
<div className="text-sm font-medium text-gray-700 mb-2"> {count > 0 && count} </div>
<div className={`w-full max-w-[40px]
transition-all duration-300 rounded-t-lg ${ isSelected ? 'bg-blue-600 ' : 'bg-blue-400 hover:bg-blue-500' }`}
style={{ height: `${height}%`, minHeight: count > 0 ? '10px' : '0' }
}
/> </div> ) })} </div>
<div className="flex justify-between text-xs text-gray-600"> {monthNames.map((name, index) => ( <div key={index}
className="flex-1 text-center"> {name.slice(0, 2)} </div> ))} </div> {selectedMonth && ( <div className="mt-6 p-4 bg-blue-50 rounded-lg">
<p className="text-center text-gray-700"> {monthNames[parseInt(selectedMonth) - 1]
}发布了 <span className="font-semibold text-blue-600"> {yearStats.posts.monthlyDistribution[selectedMonth]
}</span> 篇文章 </p> </div> )} </div> </section> {/* 年度亮点 */} {yearStats.highlights.milestone && ( <section className="mb-16">
<div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white text-center">
<h3 className="text-2xl font-semibold mb-4">🏆 年度里程碑</h3>
<p className="text-3xl font-bold">{yearStats.highlights.milestone}</p> </div> </section> )} {/* 热门文章 */}
<section className="mb-16">
<h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center"> 🔥 年度热门文章 </h2>
<div className="grid md:grid-cols-2 gap-6"> {yearStats.posts.topPosts.map((post, index) => ( <div key={post.slug}
className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow" >
<div className="flex items-start justify-between mb-2">
<span className="text-4xl font-bold text-gray-200"> #{index + 1} </span>
<span className="text-sm text-gray-500"> {post.readingTime} 分钟阅读 </span> </div>
<h3 className="text-lg font-semibold mb-2">
<Link href={`/posts/${post.slug}`}
className="text-gray-900 hover:text-blue-600 transition-colors" > {post.title} </Link> </h3>
<p className="text-sm text-gray-600"> {new Date(post.date).toLocaleDateString('zh-CN')} </p> </div> ))} </div> </section> {/* 标签云 */}
<section className="mb-16">
<h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center"> 🏷️ 年度标签云 </h2>
<div className="bg-white rounded-2xl p-8 shadow-lg">
<div className="flex flex-wrap gap-3 justify-center"> {yearStats.posts.tags.map((tag) => { const size = Math.max(0.8, Math.min(2, tag.count / 5)) return ( <span key={tag.name}
className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 transition-colors cursor-pointer" style={{ fontSize: `${size}
rem` }
}> {tag.name} </span> ) })} </div> </div> </section> {/* 技术栈统计 */} {yearStats.projects.technologies.length > 0 && ( <section className="mb-16">
<h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center"> 💻 技术栈使用 </h2>
<div className="bg-white rounded-2xl p-8 shadow-lg">
<div className="space-y-4"> {yearStats.projects.technologies.slice(0, 8).map((tech) => { const percentage = (tech.count / yearStats.projects.technologies[0].count) * 100 return ( <div key={tech.name}>
<div className="flex justify-between mb-2">
<span className="text-gray-700">{tech.name}</span>
<span className="text-gray-600">{tech.count} 个项目</span> </div>
<div className="w-full bg-gray-200 rounded-full h-3">
<div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }
}
/> </div> </div> ) })} </div> </div> </section> )} {/* 写作习惯 */}
<section className="mb-16">
<h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center"> ✍️ 写作习惯 </h2>
<div className="grid md:grid-cols-3 gap-6">
<div className="bg-white rounded-xl p-6 text-center shadow-lg">
<div className="text-3xl mb-4">📅</div>
<div className="text-2xl font-bold text-gray-900 mb-2"> {monthNames[parseInt(yearStats.highlights.mostProductiveMonth) - 1]
}</div>
<div className="text-gray-600">最高产月份</div> </div>
<div className="bg-white rounded-xl p-6 text-center shadow-lg">
<div className="text-3xl mb-4">🔥</div>
<div className="text-2xl font-bold text-gray-900 mb-2"> {yearStats.posts.writingStreak.longest} 天 </div>
<div className="text-gray-600">最长连续创作</div> </div>
<div className="bg-white rounded-xl p-6 text-center shadow-lg">
<div className="text-3xl mb-4">📝</div>
<div className="text-2xl font-bold text-gray-900 mb-2"> {formatNumber(yearStats.posts.averageWords)} 字 </div>
<div className="text-gray-600">平均每篇字数</div> </div> </div> </section> {/* 年度总结 */}
<section className="text-center">
<div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
<h3 className="text-3xl font-bold mb-6">🎊 {year} 年度成就</h3>
<div className="text-xl space-y-2">
<p>创作了 <span className="font-bold text-yellow-400">{formatNumber(yearStats.highlights.totalCreations)}</span> 件作品</p>
<p>累计写作 <span className="font-bold text-yellow-400">{formatNumber(yearStats.posts.totalWords)}</span> 字</p>
<p>最爱写 <span className="font-bold text-yellow-400">{yearStats.highlights.favoriteCategory}</span> 相关内容</p> </div>
<div className="mt-8">
<Link href="/blog" className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors" > 查看所有文章 </Link> </div> </div> </section> </div> </div> ) }