/**
 * Algolia 搜索 Hook
 * 提供搜索功能和状态管理
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { AlgoliaRecord, SearchResult } from '@/lib/algolia/client'
import { useDebounce } from './useDebounce'

interface UseAlgoliaSearchOptions {
  hitsPerPage?: number
  debounceDelay?: number
  initialQuery?: string
  fallbackSearch?: (query: string) => Promise<any[]>
}

interface UseAlgoliaSearchReturn {
  query: string
  setQuery: (query: string) => void
  results: AlgoliaRecord[]
  loading: boolean
  error: Error | null
  totalHits: number
  currentPage: number
  totalPages: number
  facets: Record<string, Record<string, number>>
  hasMore: boolean
  isAlgoliaEnabled: boolean
  search: (query: string, filters?: SearchFilters) => Promise<void>
  loadMore: () => Promise<void>
  reset: () => void
}

interface SearchFilters {
  type?: string
  tags?: string[]
  author?: string
}

export function useAlgoliaSearch(options: UseAlgoliaSearchOptions = {}): UseAlgoliaSearchReturn {
  const {
    hitsPerPage = 20,
    debounceDelay = 300,
    initialQuery = '',
    fallbackSearch
  } = options

  // 状态管理
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<AlgoliaRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [totalHits, setTotalHits] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})
  const [isAlgoliaEnabled, setIsAlgoliaEnabled] = useState(true)
  
  // 当前过滤器
  const currentFilters = useRef<SearchFilters>({})
  
  // 防抖搜索查询
  const debouncedQuery = useDebounce(query, debounceDelay)
  
  /**
   * 执行搜索
   */
  const performSearch = useCallback(async (
    searchQuery: string,
    page: number = 0,
    filters: SearchFilters = {}
  ) => {
    if (!searchQuery && Object.keys(filters).length === 0) {
      // 清空搜索
      setResults([])
      setTotalHits(0)
      setTotalPages(0)
      setCurrentPage(0)
      setFacets({})
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // 构建查询参数
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        limit: hitsPerPage.toString()
      })
      
      if (filters.type) {
        params.append('type', filters.type)
      }
      
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','))
      }
      
      if (filters.author) {
        params.append('author', filters.author)
      }
      
      // 调用 API
      const response = await fetch(`/api/search/algolia?${params}`)
      const data: SearchResult & { algoliaEnabled?: boolean } = await response.json()
      
      // 检查是否启用了 Algolia
      setIsAlgoliaEnabled(data.algoliaEnabled !== false)
      
      if (data.algoliaEnabled === false && fallbackSearch) {
        // 使用降级搜索
        const fallbackResults = await fallbackSearch(searchQuery)
        setResults(fallbackResults)
        setTotalHits(fallbackResults.length)
        setTotalPages(1)
        setCurrentPage(0)
        setFacets({})
      } else {
        // 使用 Algolia 结果
        if (page === 0) {
          setResults(data.hits)
        } else {
          // 追加结果（用于加载更多）
          setResults(prev => [...prev, ...data.hits])
        }
        
        setTotalHits(data.nbHits)
        setCurrentPage(data.page)
        setTotalPages(data.nbPages)
        setFacets(data.facets || {})
      }
    } catch (err) {
      console.error('Search error:', err)
      setError(err as Error)
      
      // 尝试降级搜索
      if (fallbackSearch) {
        try {
          const fallbackResults = await fallbackSearch(searchQuery)
          setResults(fallbackResults)
          setTotalHits(fallbackResults.length)
          setTotalPages(1)
          setCurrentPage(0)
          setIsAlgoliaEnabled(false)
        } catch (fallbackErr) {
          console.error('Fallback search error:', fallbackErr)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [hitsPerPage, fallbackSearch])
  
  /**
   * 搜索函数（带过滤器）
   */
  const search = useCallback(async (searchQuery: string, filters?: SearchFilters) => {
    currentFilters.current = filters || {}
    setCurrentPage(0)
    await performSearch(searchQuery, 0, filters)
  }, [performSearch])
  
  /**
   * 加载更多结果
   */
  const loadMore = useCallback(async () => {
    if (currentPage >= totalPages - 1) return
    
    const nextPage = currentPage + 1
    await performSearch(query, nextPage, currentFilters.current)
  }, [currentPage, totalPages, query, performSearch])
  
  /**
   * 重置搜索
   */
  const reset = useCallback(() => {
    setQuery('')
    setResults([])
    setTotalHits(0)
    setCurrentPage(0)
    setTotalPages(0)
    setFacets({})
    setError(null)
    currentFilters.current = {}
  }, [])
  
  // 自动搜索（当查询变化时）
  useEffect(() => {
    if (debouncedQuery || Object.keys(currentFilters.current).length > 0) {
      performSearch(debouncedQuery, 0, currentFilters.current)
    } else {
      reset()
    }
  }, [debouncedQuery, performSearch, reset])
  
  // 计算是否有更多结果
  const hasMore = currentPage < totalPages - 1
  
  return {
    query,
    setQuery,
    results,
    loading,
    error,
    totalHits,
    currentPage,
    totalPages,
    facets,
    hasMore,
    isAlgoliaEnabled,
    search,
    loadMore,
    reset
  }
}

/**
 * 搜索建议 Hook
 */
export function useSearchSuggestions(query: string, limit: number = 5) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  
  const debouncedQuery = useDebounce(query, 200)
  
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([])
      return
    }
    
    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search/algolia?q=${debouncedQuery}&limit=${limit}`)
        const data: SearchResult = await response.json()
        
        // 从结果中提取建议
        const uniqueSuggestions = new Set<string>()
        data.hits.forEach(hit => {
          uniqueSuggestions.add(hit.title)
          if (hit.tags) {
            hit.tags.forEach(tag => uniqueSuggestions.add(tag))
          }
        })
        
        setSuggestions(Array.from(uniqueSuggestions).slice(0, limit))
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchSuggestions()
  }, [debouncedQuery, limit])
  
  return { suggestions, loading }
}