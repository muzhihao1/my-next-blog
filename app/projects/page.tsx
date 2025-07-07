'use client'

import { useState, useMemo } from 'react'
import { getProjects } from '@/lib/notion/projects'
import { fallbackProjects } from '@/lib/fallback-projects'
import { ProjectCard } from '@/components/features/ProjectCard'
import { LazyLoad } from '@/components/ui/LazyLoad'

// 使用后备数据，因为还没有配置 Notion
const projects = fallbackProjects

type SortOption = 'date-desc' | 'date-asc' | 'status' | 'featured' | 'complexity' | 'scale'

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')

  // 按类别分组项目
  const groupedProjects = useMemo(() => {
    return projects.reduce((acc, project) => {
      if (!acc[project.category]) {
        acc[project.category] = []
      }
      acc[project.category].push(project)
      return acc
    }, {} as Record<string, typeof projects>)
  }, [])

  // 筛选项目
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') {
      return projects
    }
    return groupedProjects[selectedCategory] || []
  }, [selectedCategory, groupedProjects])

  // 排序项目
  const sortedProjects = useMemo(() => {
    const projectsCopy = [...filteredProjects]
    
    switch (sortBy) {
      case 'date-desc':
        return projectsCopy.sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
      case 'date-asc':
        return projectsCopy.sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
      case 'status':
        const statusOrder = { active: 0, completed: 1, archived: 2 }
        return projectsCopy.sort((a, b) => 
          statusOrder[a.status] - statusOrder[b.status]
        )
      case 'featured':
        return projectsCopy.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
      case 'complexity':
        // 按技术栈数量排序（越多越复杂）
        return projectsCopy.sort((a, b) => 
          b.techStack.length - a.techStack.length
        )
      case 'scale':
        // 按用户数排序（如果有的话）
        return projectsCopy.sort((a, b) => {
          const aUsers = a.metrics?.users || 0
          const bUsers = b.metrics?.users || 0
          return bUsers - aUsers
        })
      default:
        return projectsCopy
    }
  }, [filteredProjects, sortBy])

  // 对分组项目进行排序
  const sortProjects = (projects: typeof fallbackProjects) => {
    const projectsCopy = [...projects]
    
    switch (sortBy) {
      case 'date-desc':
        return projectsCopy.sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
      case 'date-asc':
        return projectsCopy.sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
      case 'status':
        const statusOrder = { active: 0, completed: 1, archived: 2 }
        return projectsCopy.sort((a, b) => 
          statusOrder[a.status] - statusOrder[b.status]
        )
      case 'featured':
        return projectsCopy.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
      case 'complexity':
        // 按技术栈数量排序（越多越复杂）
        return projectsCopy.sort((a, b) => 
          b.techStack.length - a.techStack.length
        )
      case 'scale':
        // 按用户数排序（如果有的话）
        return projectsCopy.sort((a, b) => {
          const aUsers = a.metrics?.users || 0
          const bUsers = b.metrics?.users || 0
          return bUsers - aUsers
        })
      default:
        return projectsCopy
    }
  }

  const categoryNames = {
    website: '网站应用',
    opensource: '开源项目',
    design: '设计作品',
    other: '其他'
  }

  const categoryIcons = {
    website: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    opensource: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    design: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    other: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            项目作品
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            我参与和创建的各类项目
          </p>
        </div>

        {/* 筛选和排序 */}
        <div className="mb-12 space-y-6">
          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              全部项目 ({projects.length})
            </button>
            {Object.entries(groupedProjects).map(([category, items]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {categoryNames[category as keyof typeof categoryNames] || category} ({items.length})
              </button>
            ))}
          </div>
          
          {/* 排序选项 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              排序方式：
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">最新项目</option>
              <option value="date-asc">最早项目</option>
              <option value="status">按状态</option>
              <option value="featured">精选优先</option>
              <option value="complexity">按复杂度</option>
              <option value="scale">按规模</option>
            </select>
          </div>
        </div>

        {/* 项目网格 */}
        {selectedCategory === 'all' ? (
          // 显示所有项目，按分类分组
          Object.entries(groupedProjects).map(([category, categoryProjects]) => (
            <div key={category} className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="text-blue-600 dark:text-blue-400">
                  {categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.other}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categoryNames[category as keyof typeof categoryNames] || category}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortProjects(categoryProjects).map((project, index) => (
                  <LazyLoad
                    key={project.id}
                    threshold={0.1}
                    rootMargin="200px"
                    placeholder={
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                    }
                  >
                    <ProjectCard project={project} />
                  </LazyLoad>
                ))}
              </div>
            </div>
          ))
        ) : (
          // 显示筛选后的项目
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProjects.map((project, index) => (
              <LazyLoad
                key={project.id}
                threshold={0.1}
                rootMargin="200px"
                placeholder={
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                }
              >
                <ProjectCard project={project} />
              </LazyLoad>
            ))}
          </div>
        )}

        {sortedProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">该分类下暂无项目</p>
          </div>
        )}
      </div>
    </div>
  )
}