/**
 * Client component for tools list with filtering
 * @module components/features/ToolsList
 */
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import ToolCard from './ToolCard'
import CategoryNav from './CategoryNav'
import type { Tool } from '@/types/tool'

/**
 * Props for the ToolsList component
 * @interface ToolsListProps
 * @property {Tool[]} tools - Array of tool objects to display
 */
interface ToolsListProps {
  tools: Tool[]
}

/**
 * Tools list component with category filtering and featured tools section
 * @component
 * @param {ToolsListProps} props - Component props
 * @returns {JSX.Element} Rendered tools list with filtering
 * @description Displays a filterable list of tools organized by category.
 * Features include category navigation, featured tools section, tool counts,
 * and a link to the tool comparison page.
 * @example
 * <ToolsList tools={toolsArray} />
 */
export default function ToolsList({ tools }: ToolsListProps) {
  const [currentCategory, setCurrentCategory] = useState<Tool['category'] | 'all'>('all')
  
  const categories: Record<Tool['category'], string> = {
    development: '开发工具',
    design: '设计工具',
    productivity: '效率工具',
    hardware: '硬件设备',
    service: '在线服务'
  }
  
  // Filter tools by category
  const filteredTools = useMemo(() => {
    if (currentCategory === 'all') return tools
    return tools.filter(tool => tool.category === currentCategory)
  }, [tools, currentCategory])
  
  // Group tools by category for display
  const toolsByCategory = useMemo(() => {
    return filteredTools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = []
      }
      acc[tool.category].push(tool)
      return acc
    }, {} as Record<Tool['category'], Tool[]>)
  }, [filteredTools])
  
  // Calculate counts for each category
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
  const regularTools = filteredTools.filter(tool => !tool.featured)
  
  return (
    <>
      <CategoryNav
        categories={categories}
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
        counts={categoryCounts}
      />
      
      {/* 操作栏 */}
      <div className="flex justify-between items-center mb-8">
        <p className="text-gray-600">
          共 {filteredTools.length} 个{currentCategory !== 'all' && categories[currentCategory]}工具
        </p>
        <Link
          href="/tools/compare"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          对比工具
        </Link>
      </div>
      
      <div className="space-y-12">
        {/* Featured Tools */}
        {featuredTools.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">精选工具</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} featured />
              ))}
            </div>
          </section>
        )}
        
        {/* Regular Tools */}
        {currentCategory === 'all' ? (
          // Show tools grouped by category
          Object.entries(categories).map(([category, label]) => {
            const categoryTools = toolsByCategory[category as Tool['category']]
            if (!categoryTools || categoryTools.length === 0) return null
            
            return (
              <section key={category}>
                <h2 className="text-2xl font-bold mb-6">{label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTools
                    .filter(tool => !tool.featured)
                    .map(tool => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
              </section>
            )
          })
        ) : (
          // Show all tools in selected category
          regularTools.length > 0 && (
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )
        )}
        
        {/* Empty state */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              暂无{currentCategory !== 'all' && categories[currentCategory]}工具
            </p>
          </div>
        )}
      </div>
    </>
  )
}