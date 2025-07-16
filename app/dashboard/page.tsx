/** * 数据仪表板页面 * @module app/dashboard/page * @description 展示博客内容表现和数据分析 */
import { Metadata }
from 'next' 
import { getBlogStatistics }
from '@/lib/statistics' 
import ContentDashboard from '@/components/dashboard/ContentDashboard' 

export const metadata: Metadata = {
  title: '数据仪表板 - 无题之墨',
  description: '实时追踪博客内容表现和增长趋势'
}

export default async function DashboardPage() {
  const statistics = await getBlogStatistics()
  
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ContentDashboard statistics={statistics} />
      </div>
    </div>
  )
}