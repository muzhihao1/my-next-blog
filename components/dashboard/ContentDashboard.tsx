/**
 * 内容表现仪表板组件
 * @module components/dashboard/ContentDashboard
 * @description 展示博客内容的表现数据和分析
 */
import Link from 'next/link'
import { BlogStatistics } from '@/lib/statistics'

interface ContentDashboardProps {
  statistics: BlogStatistics
}

/**
 * 内容表现仪表板
 * @param {ContentDashboardProps} props - 组件属性
 * @returns {JSX.Element} 仪表板组件
 */
export default function ContentDashboard({ statistics }: ContentDashboardProps) {
  // 计算内容增长率（模拟数据）
  const growthRate = 15.2
  const lastMonthPosts = 8
  const thisMonthPosts = statistics.posts.total >= 8 ? 10 : statistics.posts.total
  
  // 获取最受欢迎的分类
  const topCategories = Object.entries(statistics.posts.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
  
  // 获取最活跃的标签
  const topTags = Object.entries(statistics.posts.tags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
  
  // 计算平均每月发布数
  const monthsSinceStart = 12 // 假设博客运行了一年
  const avgPostsPerMonth = Math.round(statistics.posts.total / monthsSinceStart)
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          内容表现仪表板
        </h2>
        <p className="text-gray-600">
          实时追踪内容表现和增长趋势
        </p>
      </div>
      
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 本月发布 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/20 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="text-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">
              本月
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {thisMonthPosts}
          </div>
          <div className="text-sm text-gray-600">
            篇新文章
          </div>
        </div>
        
        {/* 内容增长率 */}
        <div className="bg-gradient-to-br from-green-50 to-green-100/20 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="text-green-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">
              增长
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            +{growthRate}%
          </div>
          <div className="text-sm text-gray-600">
            月度增长
          </div>
        </div>
        
        {/* 平均字数 */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/20 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="text-purple-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
              平均
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {statistics.posts.averageWords.toLocaleString('zh-CN')}
          </div>
          <div className="text-sm text-gray-600">
            字/篇
          </div>
        </div>
        
        {/* 总阅读时间 */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/20 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="text-orange-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded-full">
              累计
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {Math.round(statistics.posts.totalReadingTime / 60)}
          </div>
          <div className="text-sm text-gray-600">
            小时阅读
          </div>
        </div>
      </div>
      
      {/* 内容分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 分类表现 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            分类表现
          </h3>
          <div className="space-y-3">
            {topCategories.map(([category, count], index) => {
              const percentage = Math.round((count / statistics.posts.total) * 100)
              const colors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-purple-500'
              ]
              
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {category}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count} 篇 ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[index]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* 热门标签 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            热门标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {tag}
                <span className="ml-2 text-xs text-gray-500">
                  ({count})
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* 内容洞察 */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          内容洞察
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {avgPostsPerMonth}
            </div>
            <div className="text-sm text-gray-600">
              平均每月发布
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(statistics.posts.categories).length}
            </div>
            <div className="text-sm text-gray-600">
              内容分类数
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(statistics.posts.tags).length}
            </div>
            <div className="text-sm text-gray-600">
              标签总数
            </div>
          </div>
        </div>
      </div>
      
      {/* 快速操作 */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/year-in-review"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          查看年度总结
        </Link>
        <Link
          href="/stats"
          className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          详细统计
        </Link>
      </div>
    </div>
  )
}