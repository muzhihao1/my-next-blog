'use client'

import { useState } from 'react'
import { Tool } from '@/types/tool'
import Image from 'next/image'

interface ToolSelectorProps {
  tools: Tool[]
  selectedTools: Tool[]
  onSelectTool: (tool: Tool) => void
  maxSelection: number
}

const categoryLabels: Record<string, string> = {
  development: '开发工具',
  design: '设计工具',
  productivity: '效率工具',
  hardware: '硬件设备',
  service: '在线服务'
}

export default function ToolSelector({
  tools,
  selectedTools,
  onSelectTool,
  maxSelection
}: ToolSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 获取所有分类
  const categories = ['all', ...Array.from(new Set(tools.map(tool => tool.category)))]

  // 过滤工具
  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  // 检查工具是否已选中
  const isToolSelected = (toolId: string) => {
    return selectedTools.some(t => t.id === toolId)
  }

  // 检查是否达到最大选择数
  const isMaxSelectionReached = () => {
    return selectedTools.length >= maxSelection
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? '全部' : categoryLabels[category] || category}
            </button>
          ))}
        </div>
      </div>

      {/* 工具网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map(tool => {
          const isSelected = isToolSelected(tool.id)
          const isDisabled = !isSelected && isMaxSelectionReached()
          
          return (
            <div
              key={tool.id}
              className={`relative border rounded-lg p-4 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : isDisabled
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => {
                if (!isDisabled && !isSelected) {
                  onSelectTool(tool)
                }
              }}
            >
              {/* 选中标记 */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* 工具图标 */}
              {tool.icon && (
                <div className="mb-3 relative w-12 h-12">
                  <Image
                    src={tool.icon}
                    alt={tool.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              {/* 工具信息 */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {tool.name}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {tool.description}
              </p>

              {/* 分类标签 */}
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                  {categoryLabels[tool.category] || tool.category}
                </span>
                
                {tool.pricing && (
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {tool.pricing}
                  </span>
                )}
              </div>

              {/* 已达到最大选择数的提示 */}
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                    最多选择 {maxSelection} 个工具
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 空状态 */}
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            没有找到匹配的工具
          </p>
        </div>
      )}
    </div>
  )
}