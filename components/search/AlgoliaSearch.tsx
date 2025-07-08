/**
 * Algolia 搜索组件
 * 集成 Algolia 实时搜索功能
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSearchClient, isAlgoliaConfigured, type AlgoliaRecord } from '@/lib/algolia/client'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface AlgoliaSearchProps {
  className?: string
  placeholder?: string
}

interface HighlightResult {
  value: string
  matchLevel: string
  matchedWords: string[]
}

interface AlgoliaHit extends AlgoliaRecord {
  _highlightResult?: {
    title?: HighlightResult
    content?: HighlightResult
  }
}

export function AlgoliaSearch({ className = '', placeholder = '搜索文章...' }: AlgoliaSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AlgoliaHit[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)
  const searchClient = getSearchClient()

  // 检查 Algolia 是否配置
  useEffect(() => {
    if (!isAlgoliaConfigured()) {
      console.warn('Algolia search is not configured')
    }
  }, [])

  // 执行搜索
  const performSearch = useCallback(async () => {
    if (!debouncedQuery.trim() || !searchClient) {
      setResults([])
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const searchResults = await searchClient.search({
        requests: [{
          indexName: 'posts',
          query: debouncedQuery,
          params: {
            hitsPerPage: 10,
            attributesToRetrieve: ['objectID', 'title', 'content', 'description', 'author', 'date', 'tags', 'url'],
            attributesToHighlight: ['title', 'content'],
            highlightPreTag: '<mark>',
            highlightPostTag: '</mark>',
          }
        }]
      })

      const hits = searchResults.results[0]?.hits || []
      setResults(hits as AlgoliaHit[])
    } catch (err) {
      console.error('Search error:', err)
      setError('搜索出错，请稍后重试')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [debouncedQuery, searchClient])

  // 监听搜索查询变化
  useEffect(() => {
    performSearch()
  }, [performSearch])

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // 处理结果点击
  const handleResultClick = (result: AlgoliaRecord) => {
    setIsOpen(false)
    setQuery('')
    router.push(result.url)
  }

  // 高亮搜索结果
  const highlightText = (text: string) => {
    if (!text) return ''
    return { __html: text }
  }

  if (!isAlgoliaConfigured()) {
    return null
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* 搜索按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-secondary hover:text-foreground bg-background-secondary hover:bg-background-tertiary rounded-lg transition-colors"
        aria-label="搜索"
      >
        <MagnifyingGlassIcon className="w-4 h-4" />
        <span className="hidden sm:inline">搜索</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-foreground-tertiary bg-background border border-border rounded">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* 搜索弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-overlay z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* 搜索面板 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-background border border-border rounded-lg shadow-lg z-50"
            >
              {/* 搜索输入 */}
              <div className="flex items-center p-4 border-b border-border">
                <MagnifyingGlassIcon className="w-5 h-5 text-foreground-secondary mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground-tertiary"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 hover:bg-background-secondary rounded transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-foreground-secondary" />
                  </button>
                )}
              </div>

              {/* 搜索结果 */}
              <div className="max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-8 text-center text-foreground-secondary">
                    搜索中...
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-error">
                    {error}
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result) => (
                      <button
                        key={result.objectID}
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-3 hover:bg-background-secondary transition-colors text-left"
                      >
                        <h4 
                          className="font-medium text-foreground mb-1"
                          dangerouslySetInnerHTML={highlightText(result._highlightResult?.title?.value || result.title)}
                        />
                        {result.description && (
                          <p 
                            className="text-sm text-foreground-secondary line-clamp-2"
                            dangerouslySetInnerHTML={highlightText(result._highlightResult?.content?.value || result.description)}
                          />
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-foreground-tertiary">
                          {result.date && (
                            <span>{new Date(result.date).toLocaleDateString('zh-CN')}</span>
                          )}
                          {result.author && <span>{result.author}</span>}
                          {result.tags && result.tags.length > 0 && (
                            <span>{result.tags.slice(0, 3).join(', ')}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query ? (
                  <div className="p-8 text-center text-foreground-secondary">
                    没有找到相关结果
                  </div>
                ) : (
                  <div className="p-8 text-center text-foreground-secondary">
                    输入关键词开始搜索
                  </div>
                )}
              </div>

              {/* 搜索提示 */}
              <div className="px-4 py-2 border-t border-border text-xs text-foreground-tertiary flex items-center justify-between">
                <span>按 ESC 关闭</span>
                <span>由 Algolia 提供搜索支持</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}