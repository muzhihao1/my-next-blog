/** * 年度总结页面 * @module app/year-in-review/page * @description 展示博客年度数据总结和回顾 */
import { Metadata }
from 'next' 
import { getYearStatistics }
from '@/lib/statistics/year-statistics' 
import YearInReviewClient from './YearInReviewClient'

export const metadata: Metadata = {
  title: '年度总结 - 无题之墨',
  description: '回顾这一年的创作历程和成就'
}

// 对于静态导出，我们只生成当前年份的页面
// 如果需要其他年份，可以通过客户端导航实现
export default async function YearInReviewPage() {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  
  const yearStats = await getYearStatistics(year)
  
  return (
    <YearInReviewClient 
      yearStats={yearStats}
      year={year}
    />
  )
}