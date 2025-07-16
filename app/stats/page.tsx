/** * 数据统计页面 * @module app/stats/page * @description 展示博客各项数据统计 */
import { Metadata } from 'next'
import { getBlogStatistics } from '@/lib/statistics'
import StatsClient from './StatsClient'

export const metadata: Metadata = {
  title: '数据统计 - 无题之墨',
  description: '博客内容数据统计和分析'
}

export default async function StatsPage() {
  const statistics = await getBlogStatistics()
  
  return <StatsClient initialStats={statistics} />
}