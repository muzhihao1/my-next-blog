/**
 * Category navigation component for filtering tools
 * @module components/features/CategoryNav
 */
'use client'

import { useState } from 'react' 
import type { Tool } from '@/types/tool'

/**
 * Props for the CategoryNav component
 * @interface CategoryNavProps
 * @property {Record<Tool['category'], string>} categories - Category key-label mapping
 * @property {Tool['category'] | 'all'} [currentCategory='all'] - Currently selected category
 * @property {Function} onCategoryChange - Callback when category selection changes
 * @property {Record<Tool['category'] | 'all', number>} [counts] - Optional count for each category
 */
interface CategoryNavProps {
  categories: Record<Tool['category'], string>
  currentCategory?: Tool['category'] | 'all'
  onCategoryChange: (category: Tool['category'] | 'all') => void
  counts?: Record<Tool['category'] | 'all', number>
}
/**
 * Category navigation component for tool filtering
 * @component
 * @param {CategoryNavProps} props - Component props
 * @returns {JSX.Element} Rendered category navigation
 * @description Provides category-based navigation for filtering tools.
 * Features responsive design with dropdown on mobile and tabs on desktop.
 * Displays category counts and descriptions.
 * @example
 * <CategoryNav
 *   categories={categoryMap}
 *   currentCategory="development"
 *   onCategoryChange={handleCategoryChange}
 *   counts={categoryCounts}
 * />
 */
export default function CategoryNav({
  categories,
  currentCategory = 'all',
  onCategoryChange,
  counts
}: CategoryNavProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const categoryIcons: Record<Tool['category'], string> = {
    development: '💻',
    design: '🎨',
    productivity: '⚡',
    hardware: '🖥️',
    service: '☁️'
  }
  const allCategories = [
    { key: 'all' as const, label: '全部工具', icon: '🔧' },
    ...Object.entries(categories).map(([key, label]) => ({
      key: key as Tool['category'],
      label,
      icon: categoryIcons[key as Tool['category']]
    }))
  ]
  return (
    <nav className="mb-8">
      {/* Mobile dropdown */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 border rounded-lg bg-card hover:bg-muted transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">
              {currentCategory === 'all' ? '🔧' : categoryIcons[currentCategory as Tool['category']]}
            </span>
            <span className="font-medium">
              {currentCategory === 'all' ? '全部工具' : categories[currentCategory as Tool['category']]}
            </span>
            {counts && counts[currentCategory] && (
              <span className="text-sm text-muted-foreground">
                ({counts[currentCategory]})
              </span>
            )}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="mt-2 py-2 border rounded-lg bg-card shadow-lg">
            {allCategories.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => {
                  onCategoryChange(key)
                  setIsExpanded(false)
                }}
                className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors ${
                  currentCategory === key ? 'bg-muted font-medium' : ''
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
                {counts && counts[key] && (
                  <span className="text-sm text-muted-foreground ml-auto">
                    ({counts[key]})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Desktop tabs */}
      <div className="hidden md:flex items-center gap-2 p-1 bg-muted rounded-lg">
        {allCategories.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              currentCategory === key
                ? 'bg-background shadow-sm font-medium'
                : 'hover:bg-background/50'
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
            {counts && counts[key] && (
              <span className={`text-sm ${
                currentCategory === key
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/70'
              }`}>
                ({counts[key]})
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Category description */}
      {currentCategory !== 'all' && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {getCategoryDescription(currentCategory as Tool['category'])}
          </p>
        </div>
      )}
    </nav>
  )
}
/**
 * Get descriptive text for a tool category
 * @private
 * @param {Tool['category']} category - The category identifier
 * @returns {string} Description text for the category
 * @description Returns a Chinese description explaining what types of tools
 * are included in each category.
 */
function getCategoryDescription(category: Tool['category']): string {
  const descriptions = {
    development: '编程开发相关的工具，包括编辑器、IDE、版本控制、调试工具等',
    design: '设计创作相关的工具，包括UI/UX设计、原型制作、图像编辑等',
    productivity: '提高工作效率的工具，包括笔记、任务管理、自动化工具等',
    hardware: '硬件设备推荐，包括显示器、键盘、耳机等办公设备',
    service: '在线服务和平台，包括云服务、API、托管平台等'
  }
  
  return descriptions[category] || ''
}