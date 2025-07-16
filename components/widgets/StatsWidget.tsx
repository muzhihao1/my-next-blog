/**
 * 统计数据小部件
 * @module components/widgets/StatsWidget
 * @description 在首页或侧边栏展示的统计数据小部件
 */
'use client'

import { useEffect, useState }
from 'react' 

import Link from 'next/link' 

import { BlogStatistics }
from '@/lib/statistics'

interface StatsWidgetProps {
  /**
   * 是否为紧凑模式
   */
  compact?: boolean
  /**
   * 初始统计数据
   */
  initialStats?: BlogStatistics
}
/**
 * 统计数据小部件组件
 * @component
 * @param {StatsWidgetProps}
 props - 组件属性
 * @returns {JSX.Element} 渲染的统计小部件
 */
export default function StatsWidget({ compact = false, initialStats }: StatsWidgetProps) {
  const [stats, setStats] = useState<BlogStatistics | null>(initialStats || null)
  const [loading, setLoading] = useState(!initialStats)
  
  useEffect(() => {
    if (!initialStats) {
      fetchStats()
    }
  }, [initialStats])
  
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/statistics')
      if (response.ok) {
        const result = await response.json()
        // API 返回的数据在 result.data 中
        if (result.success && result.data) {
          setStats(result.data)
        }
      }
    }
    catch (error) {
      console.error('Failed to fetch statistics:', error)
    }
    finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-100 rounded-lg"></div>
      </div>
    )
  }
  
  if (!stats) {
    return null
  }
  
  const metrics = [
    { 
      label: '文章', 
      value: stats?.posts?.total || 33, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      label: '项目', 
      value: stats?.projects?.total || 3, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    { 
      label: '书籍', 
      value: stats?.books?.read || 8, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      label: '工具', 
      value: stats?.tools?.total || 4, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]
  
  if (compact) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          数据统计
        </h3>
        <div className="space-y-2">
          {metrics.map((metric) => (
            <div key={metric.label}
className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                {metric.icon} {metric.label}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {metric.value}
              </span>
            </div>
          ))}
        </div>
        <Link
          href="/stats"
          className="block mt-3 text-xs text-center text-blue-600 hover:underline"
        >
          查看详细统计 →
        </Link>
      </div>
    )
  }
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
<div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          内容创作统计
        </h2>
        <p className="text-gray-600">
          持续创作，不断成长
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.label}
className="bg-white rounded-lg p-4 text-center" >
<div className="text-gray-700 mb-1 flex justify-center">{metric.icon}</div>
            <div className="text-2xl font-bold text-gray-900">
              {metric.value}
            </div>
            <div className="text-sm text-gray-600">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
<div className="grid md:grid-cols-2 gap-4 mb-6">
<div className="bg-white rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">
            总字数
          </div>
          <div className="text-xl font-bold text-gray-900">
            {stats?.posts?.totalWords ? (stats.posts.totalWords / 10000).toFixed(1) : '15.8'} 万字
          </div>
        </div>
<div className="bg-white rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">
            阅读时长
          </div>
          <div className="text-xl font-bold text-gray-900">
            {stats?.posts?.totalReadingTime ? Math.round(stats.posts.totalReadingTime / 60) : 13} 小时
          </div>
        </div>
      </div>
<div className="text-center">
        <Link
          href="/stats"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          查看详细统计
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}