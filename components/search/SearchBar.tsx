/**
 * 搜索栏组件
 * 提供全站搜索功能的UI界面
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, FileText, Book, Folder, Wrench } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { useDebounce } from '@/hooks/useDebounce'
import type { SearchResult } from '@/hooks/useSearch'

interface SearchBarProps {
  className?: string
  placeholder?: string
  autoFocus?: boolean
}

const typeIcons = {
  post: FileText,
  book: Book,
  project: Folder,
  tool: Wrench
}

const typeLabels = {
  post: '文章',
  book: '书籍',
  project: '项目',
  tool: '工具'
}

export function SearchBar({ className = '', placeholder = '搜索文章、书籍、项目...', autoFocus = false }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  const { search, results, isLoading, clearSearch } = useSearch({
    types: ['post', 'book', 'project', 'tool'],
    limit: 10
  })
  
  // 防抖搜索
  const debouncedSearch = useDebounce(inputValue, 300)
  
  useEffect(() => {
    if (debouncedSearch) {
      search(debouncedSearch)
    } else {
      clearSearch()
    }
  }, [debouncedSearch, search, clearSearch])
  
  // 点击外部关闭搜索
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // 键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault()
      handleResultClick(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }, [results, selectedIndex])
  
  // 处理结果点击
  const handleResultClick = (result: SearchResult) => {
    const { item, type } = result
    let path = ''
    
    switch (type) {
      case 'post':
        path = `/posts/${item.slug}`
        break
      case 'book':
        path = `/bookshelf/${item.id}`
        break
      case 'project':
        path = `/projects/${item.slug}`
        break
      case 'tool':
        path = `/tools/${item.slug}`
        break
    }
    
    router.push(path)
    setIsOpen(false)
    setInputValue('')
    clearSearch()
  }
  
  // 获取结果摘要
  const getResultSummary = (result: SearchResult) => {
    const { item, type } = result
    
    switch (type) {
      case 'post':
        return item.excerpt || item.description || ''
      case 'book':
        return `${item.author} · ${item.status === 'read' ? '已读' : item.status === 'reading' ? '在读' : '想读'}`
      case 'project':
        return item.description || ''
      case 'tool':
        return item.description || ''
      default:
        return ''
    }
  }
  
  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        {inputValue && (
          <button
            onClick={() => {
              setInputValue('')
              clearSearch()
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* 搜索结果下拉框 */}
      {isOpen && inputValue && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span className="ml-2">搜索中...</span>
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((result, index) => {
                const Icon = typeIcons[result.type]
                return (
                  <li key={`${result.type}-${result.item.id}`}>
                    <button
                      onClick={() => handleResultClick(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                            {result.item.title}
                          </h4>
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            {typeLabels[result.type]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {getResultSummary(result)}
                        </p>
                      </div>
                      {result.score !== undefined && (
                        <div className="flex-shrink-0 text-xs text-gray-400">
                          {Math.round((1 - result.score) * 100)}%
                        </div>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              没有找到相关内容
            </div>
          )}
          
          {/* 搜索提示 */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
            <span>按 ↑↓ 导航，Enter 选择，Esc 关闭</span>
            {results.length > 0 && (
              <span>{results.length} 个结果</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}