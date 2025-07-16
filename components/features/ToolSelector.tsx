/**
 * 工具选择器组件
 * @module components/features/ToolSelector
 */
'use client'

import { useState } from 'react'
import { Tool } from '@/types/tool'
import Image from 'next/image'

/**
 * 工具选择器组件的属性
 * @interface ToolSelectorProps
 * @property {Tool[]} tools - 可选择的工具列表
 * @property {Tool[]} selectedTools - 已选中的工具列表
 * @property {(tool: Tool) => void} onSelectTool - 选择工具的回调函数
 * @property {number} maxSelection - 最大可选择数量
 */
interface ToolSelectorProps {
  tools: Tool[]
  selectedTools: Tool[]
  onSelectTool: (tool: Tool) => void
  maxSelection: number
}

/**
 * 工具分类标签映射
 * @constant
 * @type {Record<string, string>}
 * @description 将英文分类标识映射为中文显示名称
 */
const categoryLabels: Record<string, string> = {
  development: '开发工具',
  design: '设计工具',
  productivity: '效率工具',
  hardware: '硬件设备',
  service: '在线服务'
}

/**
 * 工具选择器组件
 * @component
 * @param {ToolSelectorProps} props - 组件属性
 * @returns {JSX.Element} 渲染的工具选择器
 * @description 提供工具搜索、分类筛选和多选功能的交互式选择器。
 * 支持最大选择数量限制，包含搜索框、分类筛选按钮和工具卡片网格。
 * 当达到最大选择数时，未选中的工具会被禁用。
 * @example
 * <ToolSelector
 *   tools={allTools}
 *   selectedTools={selected}
 *   onSelectTool={handleSelect}
 *   maxSelection={3}
 * />
 */
export default function ToolSelector({ tools, selectedTools, onSelectTool, maxSelection }: ToolSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  /**
   * 获取所有工具分类
   * @constant {string[]}
   */
  const categories = ['all', ...Array.from(new Set(tools.map(tool => tool.category)))]
  
  /**
   * 根据分类和搜索条件过滤工具
   * @constant {Tool[]}
   * @description 根据选中的分类和搜索关键词过滤工具列表
   */
  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })
  
  /**
   * 检查工具是否已选中
   * @function isToolSelected
   * @param {string} toolId - 工具ID
   * @returns {boolean} 是否已选中
   */
  const isToolSelected = (toolId: string) => {
    return selectedTools.some(t => t.id === toolId)
  }
  
  /**
   * 检查是否达到最大选择数
   * @function isMaxSelectionReached
   * @returns {boolean} 是否达到最大选择数
   */
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  ? 'border-blue-500 bg-blue-50'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 bg-white hover:border-gray-300'
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
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                      clipRule="evenodd" 
                    />
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
              <h3 className="font-semibold text-gray-900 mb-1">
                {tool.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {tool.description}
              </p>
              
              {/* 分类标签 */}
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {categoryLabels[tool.category] || tool.category}
                </span>
                {tool.pricing && (
                  <span className="text-xs text-gray-500">
                    {tool.pricing}
                  </span>
                )}
              </div>
              
              {/* 已达到最大选择数的提示 */}
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <p className="text-sm text-gray-600 text-center px-4">
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
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <p className="text-gray-600">
            没有找到匹配的工具
          </p>
        </div>
      )}
    </div>
  )
}