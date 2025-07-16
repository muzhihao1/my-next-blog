/**
 * 搜索钩子
 * 提供全站搜索功能
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import { BlogPost } from '@/types/notion'
import { Book } from '@/types/bookshelf'
import { Project } from '@/types/project'
import { Tool } from '@/types/tool'

// 搜索结果类型
export interface SearchResult {
  item: BlogPost | Book | Project | Tool
  type: 'post' | 'book' | 'project' | 'tool'
  score?: number
  matches?: any[]
}

// 搜索选项
interface SearchOptions {
  types?: ('post' | 'book' | 'project' | 'tool')[]
  limit?: number
  threshold?: number
}

// Fuse.js配置
const fuseOptions: Fuse.IFuseOptions<any> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'excerpt', weight: 0.3 },
    { name: 'description', weight: 0.3 },
    { name: 'content', weight: 0.2 },
    { name: 'tags', weight: 0.2 },
    { name: 'author.name', weight: 0.1 },
    { name: 'category', weight: 0.1 }
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: false,
  location: 0,
  distance: 100,
  useExtendedSearch: false,
  ignoreLocation: false,
  ignoreFieldNorm: false,
  fieldNormWeight: 1
}

export function useSearch(options: SearchOptions = {}) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [allData, setAllData] = useState<{
    posts: BlogPost[]
    books: Book[]
    projects: Project[]
    tools: Tool[]
  }>({
    posts: [],
    books: [],
    projects: [],
    tools: []
  })

  // 加载所有数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // 并行加载所有数据
        const [postsRes, booksRes, projectsRes, toolsRes] = await Promise.all([
          fetch('/api/posts').then(res => res.ok ? res.json() : []),
          fetch('/api/books').then(res => res.ok ? res.json() : []),
          fetch('/api/projects').then(res => res.ok ? res.json() : []),
          fetch('/api/tools').then(res => res.ok ? res.json() : [])
        ])

        setAllData({
          posts: postsRes.posts || [],
          books: booksRes.books || [],
          projects: projectsRes.projects || [],
          tools: toolsRes.tools || []
        })
      } catch (error) {
        console.error('Error loading search data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 创建Fuse实例
  const fuseInstances = useMemo(() => {
    const types = options.types || ['post', 'book', 'project', 'tool']
    const instances: Record<string, Fuse<any>> = {}

    if (types.includes('post') && allData.posts.length > 0) {
      instances.posts = new Fuse(allData.posts, fuseOptions)
    }
    if (types.includes('book') && allData.books.length > 0) {
      instances.books = new Fuse(allData.books, fuseOptions)
    }
    if (types.includes('project') && allData.projects.length > 0) {
      instances.projects = new Fuse(allData.projects, fuseOptions)
    }
    if (types.includes('tool') && allData.tools.length > 0) {
      instances.tools = new Fuse(allData.tools, fuseOptions)
    }

    return instances
  }, [allData, options.types])

  // 执行搜索
  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery)

    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const searchResults: SearchResult[] = []
    const limit = options.limit || 20

    // 在每个类型中搜索
    Object.entries(fuseInstances).forEach(([type, fuse]) => {
      const fuseResults = fuse.search(searchQuery)
      
      fuseResults.forEach(result => {
        searchResults.push({
          item: result.item,
          type: type.replace('s', '') as any, // posts -> post
          score: result.score,
          matches: result.matches
        })
      })
    })

    // 按分数排序并限制结果数量
    const sortedResults = searchResults
      .sort((a, b) => (a.score || 1) - (b.score || 1))
      .slice(0, limit)

    setResults(sortedResults)
  }, [fuseInstances, options.limit])

  // 清除搜索
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  // 高亮匹配文本
  const highlightMatch = useCallback((text: string, matches?: any[]) => {
    if (!matches || matches.length === 0) return text

    let highlightedText = text
    const indices: [number, number][] = []

    // 收集所有匹配位置
    matches.forEach(match => {
      if (match.indices) {
        indices.push(...match.indices)
      }
    })

    // 按位置倒序排序，避免索引偏移
    indices.sort((a, b) => b[0] - a[0])

    // 应用高亮
    indices.forEach(([start, end]) => {
      highlightedText = 
        highlightedText.slice(0, start) +
        '<mark>' +
        highlightedText.slice(start, end + 1) +
        '</mark>' +
        highlightedText.slice(end + 1)
    })

    return highlightedText
  }, [])

  return {
    query,
    setQuery,
    search,
    clearSearch,
    results,
    isLoading,
    highlightMatch
  }
}