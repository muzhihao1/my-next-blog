/**
 * 统计数据小部件
 * @module components/widgets/StatsWidget
 * @description 在首页或侧边栏展示的统计数据小部件
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BlogStatistics } from '@/lib/statistics'

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
 * @param {StatsWidgetProps} props - 组件属性
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
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
      </div>
    )
  }
  
  if (!stats) {
    return null
  }
  
  const metrics = [
    { label: '文章', value: stats.posts.total, icon: '📝' },
    { label: '项目', value: stats.projects.total, icon: '🚀' },
    { label: '书籍', value: stats.books.read, icon: '📚' },
    { label: '工具', value: stats.tools.total, icon: '🛠️' }
  ]
  
  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          数据统计
        </h3>
        <div className="space-y-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {metric.icon} {metric.label}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {metric.value}
              </span>
            </div>
          ))}
        </div>
        <Link
          href="/stats"
          className="block mt-3 text-xs text-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          查看详细统计 →
        </Link>
      </div>
    )
  }
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          内容创作统计
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          持续创作，不断成长
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center"
          >
            <div className="text-2xl mb-1">{metric.icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metric.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            总字数
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {(stats.posts.totalWords / 10000).toFixed(1)} 万字
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            阅读时长
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {Math.round(stats.posts.totalReadingTime / 60)} 小时
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Link
          href="/stats"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          查看详细统计
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}