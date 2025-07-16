'use client'

import { useState, useMemo } from 'react'
import { Project } from '@/types/project'
import { ProjectCard } from '@/components/features/ProjectCard'
import LazyLoad from '@/components/ui/LazyLoad'
import { PageContainer } from '@/components/ui/Container'

type SortOption = 'date-desc' | 'date-asc' | 'status' | 'featured' | 'complexity' | 'scale'

interface ProjectsClientProps {
  projects: Project[]
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
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
  }, [projects])
  
  // 过滤项目
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') {
      return projects
    }
    return projects.filter(project => project.category === selectedCategory)
  }, [selectedCategory, projects])
  
  // 排序函数
  const sortProjects = (projectList: Project[]) => {
    const projectsCopy = [...projectList]
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
  
  // 对过滤后的项目进行排序
  const sortedProjects = useMemo(() => {
    return sortProjects(filteredProjects)
  }, [filteredProjects, sortBy])
  
  const categoryNames = {
    website: '网站应用',
    opensource: '开源项目',
    design: '设计作品',
    other: '其他'
  }
  
  const categoryIcons = {
    website: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    opensource: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    design: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    other: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  }
  
  return (
    <PageContainer size="xl">
      {/* 页面标题 */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">项目作品</h1>
        <p className="text-lg text-gray-600">我参与和创建的各类项目</p>
      </div>
      
      {/* 筛选和排序 */}
      <div className="mb-12 space-y-6">
        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部项目 ({projects.length})
          </button>
          {Object.entries(groupedProjects).map(([category, categoryProjects]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {categoryIcons[category as keyof typeof categoryIcons]}
              {categoryNames[category as keyof typeof categoryNames]} ({categoryProjects.length})
            </button>
          ))}
        </div>
        
        {/* 排序选项 */}
        <div className="flex items-center gap-4">
          <span className="text-gray-600">排序方式：</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-desc">最新发布</option>
            <option value="date-asc">最早发布</option>
            <option value="status">项目状态</option>
            <option value="featured">精选项目</option>
            <option value="complexity">技术复杂度</option>
            <option value="scale">项目规模</option>
          </select>
        </div>
      </div>
      
      {/* 项目列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedProjects.map((project, index) => (
          <LazyLoad
            key={project.id}
            height={400}
            offset={100}
            placeholder={
              <div className="bg-gray-100 animate-pulse rounded-lg h-96" />
            }
          >
            <ProjectCard project={project} />
          </LazyLoad>
        ))}
      </div>
      
      {/* 空状态 */}
      {sortedProjects.length === 0 && (
        <div className="text-center py-16">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <p className="mt-4 text-lg text-gray-600">暂无相关项目</p>
        </div>
      )}
    </PageContainer>
  )
}