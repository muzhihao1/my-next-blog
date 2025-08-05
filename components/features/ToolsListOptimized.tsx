/**
 * Optimized tools list component with improved UX
 */
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Tool } from '@/types/tool'

interface ToolsListOptimizedProps {
  tools: Tool[]
}

export default function ToolsListOptimized({ tools }: ToolsListOptimizedProps) {
  const [currentCategory, setCurrentCategory] = useState<Tool['category'] | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const categories: Record<Tool['category'], { name: string; icon: string; color: string }> = {
    development: { name: '开发工具', icon: '💻', color: 'blue' },
    design: { name: '设计工具', icon: '🎨', color: 'purple' },
    productivity: { name: '效率工具', icon: '⚡', color: 'green' },
    hardware: { name: '硬件设备', icon: '🖥️', color: 'orange' },
    service: { name: '在线服务', icon: '☁️', color: 'cyan' }
  }
  
  // Filter and search tools
  const filteredTools = useMemo(() => {
    let filtered = tools
    
    // Category filter
    if (currentCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === currentCategory)
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return filtered
  }, [tools, currentCategory, searchQuery])
  
  // Group tools by category
  const toolsByCategory = useMemo(() => {
    return filteredTools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = []
      }
      acc[tool.category].push(tool)
      return acc
    }, {} as Record<Tool['category'], Tool[]>)
  }, [filteredTools])
  
  // Calculate counts
  const categoryCounts = useMemo(() => {
    const counts: Record<Tool['category'] | 'all', number> = {
      all: tools.length,
      development: 0,
      design: 0,
      productivity: 0,
      hardware: 0,
      service: 0
    }
    
    tools.forEach(tool => {
      counts[tool.category]++
    })
    
    return counts
  }, [tools])
  
  const featuredTools = filteredTools.filter(tool => tool.featured)
  
  return (
    <div className="space-y-8">
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索工具名称、描述或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-3 py-2 rounded-md transition-all",
                viewMode === 'grid' 
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-3 py-2 rounded-md transition-all",
                viewMode === 'list' 
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Category Pills */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setCurrentCategory('all')}
          className={cn(
            "px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105",
            currentCategory === 'all'
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          <span className="flex items-center gap-2">
            <span>全部工具</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{categoryCounts.all}</span>
          </span>
        </button>
        
        {Object.entries(categories).map(([key, { name, icon, color }]) => {
          const categoryKey = key as Tool['category']
          const isActive = currentCategory === categoryKey
          const count = categoryCounts[categoryKey]
          
          return (
            <button
              key={key}
              onClick={() => setCurrentCategory(categoryKey)}
              className={cn(
                "px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105",
                isActive
                  ? `bg-${color}-500 text-white shadow-lg`
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
              style={isActive ? {
                backgroundColor: `var(--color-${color}-500)`,
                boxShadow: `0 10px 25px -5px var(--color-${color}-500)`
              } : {}}
            >
              <span className="flex items-center gap-2">
                <span>{icon}</span>
                <span>{name}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-sm",
                  isActive ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"
                )}>
                  {count}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      
      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">
          {searchQuery && (
            <span>搜索 "{searchQuery}" - </span>
          )}
          找到 {filteredTools.length} 个工具
        </p>
        
        <Link
          href="/tools/compare"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          对比工具
        </Link>
      </div>
      
      {/* Tools Display */}
      <div className="space-y-12">
        {/* Featured Tools */}
        {featuredTools.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-yellow-500">⭐</span>
              精选推荐
            </h2>
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}>
              {featuredTools.map(tool => (
                <ToolCardOptimized key={tool.id} tool={tool} featured viewMode={viewMode} />
              ))}
            </div>
          </section>
        )}
        
        {/* Regular Tools by Category */}
        {currentCategory === 'all' ? (
          Object.entries(categories).map(([category, { name, icon }]) => {
            const categoryTools = toolsByCategory[category as Tool['category']]?.filter(t => !t.featured)
            if (!categoryTools?.length) return null
            
            return (
              <section key={category}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span>{icon}</span>
                  {name}
                </h2>
                <div className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                )}>
                  {categoryTools.map(tool => (
                    <ToolCardOptimized key={tool.id} tool={tool} viewMode={viewMode} />
                  ))}
                </div>
              </section>
            )
          })
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}>
            {filteredTools.filter(t => !t.featured).map(tool => (
              <ToolCardOptimized key={tool.id} tool={tool} viewMode={viewMode} />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">未找到相关工具</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? `没有找到包含 "${searchQuery}" 的工具`
                : `暂无${currentCategory !== 'all' ? categories[currentCategory].name : '工具'}`
              }
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setCurrentCategory('all')
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              重置筛选
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Optimized Tool Card Component
interface ToolCardOptimizedProps {
  tool: Tool
  featured?: boolean
  viewMode: 'grid' | 'list'
}

function ToolCardOptimized({ tool, featured = false, viewMode }: ToolCardOptimizedProps) {
  const categoryColors = {
    development: 'blue',
    design: 'purple',
    productivity: 'green',
    hardware: 'orange',
    service: 'cyan'
  }
  
  const color = categoryColors[tool.category]
  
  if (viewMode === 'list') {
    return (
      <Link href={`/tools/${tool.slug}`}>
        <div className={cn(
          "flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-lg cursor-pointer",
          featured 
            ? "border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
        )}>
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center text-2xl",
            `bg-${color}-100 dark:bg-${color}-900/30`
          )}>
            {tool.icon || '🔧'}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {tool.name}
              {featured && <span className="text-yellow-500">⭐</span>}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 line-clamp-1">{tool.description}</p>
          </div>
          
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {tool.pricing && (
              <span className={cn(
                "px-2 py-1 rounded-full",
                tool.pricing === 'free' 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              )}>
                {tool.pricing === 'free' ? '免费' : tool.pricing}
              </span>
            )}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    )
  }
  
  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className={cn(
        "group relative p-6 rounded-xl border transition-all hover:shadow-xl cursor-pointer transform hover:-translate-y-1",
        featured 
          ? "border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      )}>
        {/* Featured Badge */}
        {featured && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
            精选推荐
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110",
            `bg-${color}-100 dark:bg-${color}-900/30`
          )}>
            {tool.icon || '🔧'}
          </div>
          
          {tool.pricing && (
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              tool.pricing === 'free' 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            )}>
              {tool.pricing === 'free' ? '免费' : tool.pricing}
            </span>
          )}
        </div>
        
        {/* Content */}
        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {tool.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
          {tool.description}
        </p>
        
        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tool.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md text-gray-600 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
            {tool.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{tool.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Action */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            查看详情
          </span>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  )
}