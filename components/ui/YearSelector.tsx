/**
 * 年份选择器组件
 * @module components/ui/YearSelector
 * @description 用于选择不同年份查看年度总结
 */
'use client'

import { useRouter } from 'next/navigation'

interface YearSelectorProps {
  currentYear: number
  availableYears?: number[]
}

/**
 * 年份选择器
 * @param {YearSelectorProps} props - 组件属性
 * @returns {JSX.Element} 年份选择器组件
 */
export default function YearSelector({ currentYear, availableYears }: YearSelectorProps) {
  const router = useRouter()
  const startYear = 2023 // 博客开始年份
  const currentDate = new Date()
  const thisYear = currentDate.getFullYear()
  
  // 生成可用年份列表
  const years = availableYears || Array.from(
    { length: thisYear - startYear + 1 },
    (_, i) => thisYear - i
  )
  
  const handleYearChange = (year: number) => {
    if (year !== currentYear) {
      router.push(`/year-in-review?year=${year}`)
    }
  }
  
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <button
        onClick={() => handleYearChange(currentYear - 1)}
        disabled={currentYear <= startYear}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="上一年"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      
      <select
        value={currentYear}
        onChange={(e) => handleYearChange(Number(e.target.value))}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year} 年
          </option>
        ))}
      </select>
      
      <button
        onClick={() => handleYearChange(currentYear + 1)}
        disabled={currentYear >= thisYear}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="下一年"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  )
}