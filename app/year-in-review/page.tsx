/**
 * 年度总结页面
 * @module app/year-in-review/page
 * @description 展示博客年度数据总结和回顾
 */

import { Metadata } from 'next'
import { getYearStatistics } from '@/lib/statistics/year-statistics'
import YearInReviewClient from './YearInReviewClient'

export const metadata: Metadata = {
  title: '年度总结 - 无题之墨',
  description: '回顾这一年的创作历程和成就'
}

// 标记为动态页面，因为需要根据查询参数动态渲染
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ year?: string }>
}

export default async function YearInReviewPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentDate = new Date()
  const requestedYear = params.year ? parseInt(params.year) : currentDate.getFullYear()
  
  // 确保年份在合理范围内
  const startYear = 2023
  const maxYear = currentDate.getFullYear()
  const year = Math.max(startYear, Math.min(requestedYear, maxYear))
  
  const yearStats = await getYearStatistics(year)
  
  return <YearInReviewClient yearStats={yearStats} year={year} />
}