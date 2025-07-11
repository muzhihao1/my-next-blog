/**
 * 统计页面客户端组件
 * @module app/stats/StatsClient
 */
'use client'

import { useState, useEffect } from 'react' 

import Link from 'next/link' 

import { BlogStatistics } from '@/lib/statistics'

interface StatsClientProps {
  initialStats: BlogStatistics
}
export default function StatsClient({ initialStats }: StatsClientProps) {
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(false)
  
  // 刷新统计数据
  const refreshStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/statistics')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to refresh statistics:', error)
    }
    setLoading(false)
  }
// 格式化数字 const formatNumber = (num: number) => { return num.toLocaleString('zh-CN') }
// 计算百分比 const getPercentage = (value: number, total: number) => { if (total === 0) return 0 return Math.round((value / total) * 100) }
// 获取前N项 const getTopItems = (items: Record<string, number>, limit = 5) => { return Object.entries(items) .sort(([, a], [, b]) => b - a) .slice(0, limit) }
return ( <div className="py-16 px-4 sm:px-6 lg:px-8">
<div className="max-w-7xl mx-auto"> {/* 页面标题 */}
<div className="text-center mb-12">
<h1 className="text-4xl font-bold text-gray-900 mb-4"> 数据统计 </h1>
<p className="text-lg text-gray-600 mb-4"> 博客内容数据概览和分析 </p>
<button onClick={refreshStats}
disabled={loading}
className="text-sm text-blue-600 hover:underline disabled:opacity-50" > {loading ? '刷新中...' : '刷新数据'} </button> </div> {/* 总览卡片 */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
<div className="bg-white rounded-lg p-6 text-center border border-gray-200">
<div className="text-3xl font-bold text-gray-900 mb-2"> {formatNumber(stats.posts.total)} </div>
<div className="text-sm text-gray-600">文章总数</div> </div>
<div className="bg-white rounded-lg p-6 text-center border border-gray-200">
<div className="text-3xl font-bold text-gray-900 mb-2"> {formatNumber(stats.projects.total)} </div>
<div className="text-sm text-gray-600">项目总数</div> </div>
<div className="bg-white rounded-lg p-6 text-center border border-gray-200">
<div className="text-3xl font-bold text-gray-900 mb-2"> {formatNumber(stats.books.total)} </div>
<div className="text-sm text-gray-600">书籍总数</div> </div>
<div className="bg-white rounded-lg p-6 text-center border border-gray-200">
<div className="text-3xl font-bold text-gray-900 mb-2"> {formatNumber(stats.tools.total)} </div>
<div className="text-sm text-gray-600">工具总数</div> </div> </div> {/* 文章统计 */}
<section className="mb-12">
<h2 className="text-2xl font-semibold text-gray-900 mb-6"> 📝 文章统计 </h2>
<div className="grid md:grid-cols-2 gap-6"> {/* 基础数据 */}
<div className="bg-white rounded-lg p-6 border border-gray-200">
<h3 className="text-lg font-medium text-gray-900 mb-4"> 基础数据 </h3>
<div className="space-y-3">
<div className="flex justify-between">
<span className="text-gray-600">总字数</span>
<span className="font-medium text-gray-900"> {formatNumber(stats.posts.totalWords)} 字 </span> </div>
<div className="flex justify-between">
<span className="text-gray-600">平均字数</span>
<span className="font-medium text-gray-900"> {formatNumber(stats.posts.averageWords)} 字/篇 </span> </div>
<div className="flex justify-between">
<span className="text-gray-600">总阅读时间</span>
<span className="font-medium text-gray-900"> {formatNumber(stats.posts.totalReadingTime)} 分钟 </span> </div> {stats.posts.latestPost && ( <div className="pt-3 border-t border-gray-200">
<div className="text-sm text-gray-600 mb-1"> 最新文章 </div>
<Link href={`/posts/${stats.posts.latestPost.slug}`}
className="text-blue-600 hover:underline" > {stats.posts.latestPost.title} </Link>
<div className="text-xs text-gray-500 mt-1"> {new Date(stats.posts.latestPost.date).toLocaleDateString('zh-CN')} </div> </div> )} </div> </div> {/* 分类分布 */}
<div className="bg-white rounded-lg p-6 border border-gray-200">
<h3 className="text-lg font-medium text-gray-900 mb-4"> 分类分布 </h3>
<div className="space-y-3"> {getTopItems(stats.posts.categories).map(([category, count]) => ( <div key={category}>
<div className="flex justify-between mb-1">
<span className="text-sm text-gray-600"> {category} </span>
<span className="text-sm font-medium text-gray-900"> {count} 篇 </span> </div>
<div className="w-full bg-gray-200 rounded-full h-2">
<div className="bg-blue-600 h-2 rounded-full" style={{ width: `${getPercentage(count, stats.posts.total)}%` }
}
/> </div> </div> ))} </div> </div> {/* 热门标签 */}
<div className="bg-white rounded-lg p-6 border border-gray-200 md:col-span-2">
<h3 className="text-lg font-medium text-gray-900 mb-4"> 热门标签 </h3>
<div className="flex flex-wrap gap-2"> {getTopItems(stats.posts.tags, 20).map(([tag, count]) => ( <span key={tag}
className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm" > {tag} ({count}) </span> ))} </div> </div> </div> </section> {/* 项目统计 */}
<section className="mb-12">
<h2 className="text-2xl font-semibold text-gray-900 mb-6"> 🚀 项目统计 </h2>
<div className="grid md:grid-cols-3 gap-6"> {/* 项目状态 */}
<div className="bg-white rounded-lg p-6 border border-gray-200">
<h3 className="text-lg font-medium text-gray-900 mb-4"> 项目状态 </h3>
<div className="space-y-3">
<div className="flex justify-between">
<span className="text-gray-600">进行中</span>
<span className="font-medium text-green-600"> {stats.projects.active} </span> </div>
<div className="flex justify-between">
<span className="text-gray-600">已完成</span>
<span className="font-medium text-blue-600"> {stats.projects.completed} </span> </div>
<div className="flex justify-between">
<span className="text-gray-600">其他</span>
<span className="font-medium text-gray-600"> {stats.projects.total - stats.projects.active - stats.projects.completed} </span> </div> </div> </div> {/* 技术栈 */}
<div className="bg-white rounded-lg p-6 border border-gray-200 md:col-span-2">
<h3 className="text-lg font-medium text-gray-900 mb-4"> 技术栈使用 </h3>
<div className="flex flex-wrap gap-2"> {getTopItems(stats.projects.technologies, 15).map(([tech, count]) => ( <span key={tech}
className="px-3 py-1 bg-blue-100/30 text-blue-700 rounded-full text-sm" > {tech} ({count}) </span> ))} </div> </div> </div> </section> {/* 阅读统计 */}
<section className="mb-12">
<h2 className="text-2xl font-semibold text-gray-900 mb-6"> 📚 阅读统计 </h2>
<div className="grid md:grid-cols-3 gap-6"> {/* 阅读进度 */}
<div className="bg-white rounded-lg p-6 border border-gray-200">
<h3 className="text-lg font-medium text-gray-900 mb-4"> 阅读进度 </h3>
<div className="space-y-3">
<div className="flex justify-between">
<span className="text-gray-600">已读</span>
<span className="font-medium text-green-600"> {stats.books.read} 本 </span> </div>
<div className="flex justify-between">
<span className="text-gray-600">在读</span>
<span className="font-medium text-yellow-600"> {stats.books.reading} 本 </span> </div>
<div className="flex justify-between">
<span className="text-gray-600">想读</span>
<span className="font-medium text-blue-600"> {stats.books.wantToRead} 本 </span> </div> </div> </div> {/* 阅读数据 */}
<div className="bg-white rounded-lg p-6 border border-gray-200">
<h3 className="text-lg font-medium text-gray-900 mb-4"> 阅读数据 </h3>
<div className="space-y-3">
<div className="flex justify-between">
<span className="text-gray-600">平均评分</span>
<span className="font-medium text-gray-900"> ⭐ {stats.books.averageRating} </span> </div>
<div className="flex justify-between">
<span className="text-gray-600">总页数</span>
<span className="font-medium text-gray-900"> {formatNumber(stats.books.totalPages)} 页 </span> </div> </div> </div> {/* 书籍分类 */}
<div className="bg-white rounded-lg p-6 border border-gray-200">
<h3 className="text-lg font-medium text-gray-900 mb-4"> 书籍分类 </h3>
<div className="space-y-2"> {getTopItems(stats.books.categories, 5).map(([category, count]) => ( <div key={category}
className="flex justify-between">
<span className="text-sm text-gray-600"> {category} </span>
<span className="text-sm font-medium text-gray-900"> {count} 本 </span> </div> ))} </div> </div> </div> </section> {/* 工具统计 */}
<section className="mb-12">
<h2 className="text-2xl font-semibold text-gray-900 mb-6"> 🛠️ 工具统计 </h2>
<div className="grid md:grid-cols-2 gap-6">
<div className="bg-white rounded-lg p-6 border border-gray-200">
<h3 className="text-lg font-medium text-gray-900 mb-4"> 工具概览 </h3>
<div className="space-y-3">
<div className="flex justify-between">
<span className="text-gray-600">精选工具</span>
<span className="font-medium text-yellow-600"> {stats.tools.featured} 个 </span> </div>
<div className="flex justify-between">
<span className="text-gray-600">平均评分</span>
<span className="font-medium text-gray-900"> ⭐ {stats.tools.averageRating} </span> </div> </div> </div>
<div className="bg-white rounded-lg p-6 border border-gray-200">
<h3 className="text-lg font-medium text-gray-900 mb-4"> 工具分类 </h3>
<div className="space-y-2"> {getTopItems(stats.tools.categories).map(([category, count]) => ( <div key={category}
className="flex justify-between">
<span className="text-sm text-gray-600"> {category} </span>
<span className="text-sm font-medium text-gray-900"> {count} 个 </span> </div> ))} </div> </div> </div> </section> {/* 总体数据 */}
<section className="text-center py-8 border-t border-gray-200">
<div className="text-3xl font-bold text-gray-900 mb-2"> {formatNumber(stats.overall.totalContent)} </div>
<div className="text-gray-600"> 总内容数 </div>
<div className="text-xs text-gray-500 mt-2"> 最后更新: {new Date(stats.overall.lastUpdated).toLocaleString('zh-CN')} </div> </section> </div> </div> ) }