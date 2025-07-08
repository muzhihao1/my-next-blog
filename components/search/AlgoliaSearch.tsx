/**
 * Algolia 搜索组件
 * 提供增强的搜索功能和更好的用户体验
 */

'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { Dialog, Transition, Combobox } from '@headlessui/react'
import { useAlgoliaSearch, useSearchSuggestions } from '@/hooks/useAlgoliaSearch'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'

interface AlgoliaSearchProps {
  isOpen: boolean
  onClose: () => void
  fallbackToLocal?: boolean
}

export function AlgoliaSearch({ isOpen, onClose, fallbackToLocal = true }: AlgoliaSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState<string>('')
  
  // 使用 Algolia 搜索 Hook
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    totalHits,
    facets,
    isAlgoliaEnabled,
    search,
    reset
  } = useAlgoliaSearch({
    debounceDelay: 300,
    fallbackSearch: fallbackToLocal ? localFallbackSearch : undefined
  })
  
  // 搜索建议
  const { suggestions } = useSearchSuggestions(query, 5)
  
  // 类型图标映射
  const typeIcons = {
    post: '📝',
    project: '🚀',
    book: '📚',
    tool: '🛠️'
  }
  
  // 类型名称映射
  const typeNames = {
    post: '文章',
    project: '项目',
    book: '书籍',
    tool: '工具'
  }
  
  // 处理选择
  const handleSelect = (item: any) => {
    if (item.url) {
      router.push(item.url)
      onClose()
      reset()
    }
  }
  
  // 处理类型过滤
  const handleTypeFilter = (type: string) => {
    if (selectedType === type) {
      setSelectedType('')
      search(query, {})
    } else {
      setSelectedType(type)
      search(query, { type })
    }
  }
  
  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])
  
  // 获取高亮文本
  const getHighlightedText = (text: string, highlight?: any) => {
    if (!highlight || !highlight.value) return text
    
    // 使用 Algolia 的高亮结果
    return <span dangerouslySetInnerHTML={{ __html: highlight.value }} />
  }
  
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox onChange={handleSelect}>
                <div className="relative">
                  {/* 搜索头部 */}
                  <div className="border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-gray-400 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <Combobox.Input
                        ref={inputRef}
                        className="flex-1 border-0 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                        placeholder="搜索文章、项目、书籍或工具..."
                        onChange={(event) => setQuery(event.target.value)}
                        value={query}
                      />
                      {query && (
                        <button
                          onClick={() => {
                            setQuery('')
                            inputRef.current?.focus()
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* 搜索状态 */}
                    {!isAlgoliaEnabled && (
                      <div className="mt-2 text-xs text-yellow-600">
                        正在使用本地搜索（Algolia 未配置）
                      </div>
                    )}
                  </div>
                  
                  {/* 类型过滤器 */}
                  {facets.type && Object.keys(facets.type).length > 0 && (
                    <div className="border-b border-gray-200 px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(facets.type).map(([type, count]) => (
                          <button
                            key={type}
                            onClick={() => handleTypeFilter(type)}
                            className={clsx(
                              'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors',
                              selectedType === type
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                          >
                            <span className="mr-1">{typeIcons[type as keyof typeof typeIcons]}</span>
                            {typeNames[type as keyof typeof typeNames]} ({count})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 搜索建议 */}
                  {suggestions.length > 0 && query.length > 1 && results.length === 0 && (
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">搜索建议：</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setQuery(suggestion)}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 搜索结果 */}
                  <Combobox.Options
                    static
                    className="max-h-96 scroll-py-2 overflow-y-auto"
                  >
                    {loading && (
                      <div className="py-14 px-4 text-center">
                        <div className="inline-flex items-center">
                          <svg className="animate-spin h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          搜索中...
                        </div>
                      </div>
                    )}
                    
                    {!loading && query && results.length === 0 && (
                      <div className="py-14 px-4 text-center text-gray-500">
                        没有找到相关内容
                      </div>
                    )}
                    
                    {!loading && results.length > 0 && (
                      <div className="divide-y divide-gray-200">
                        {results.map((item) => (
                          <Combobox.Option
                            key={item.objectID}
                            value={item}
                            className={({ active }) =>
                              clsx(
                                'px-4 py-3 cursor-pointer transition-colors',
                                active ? 'bg-gray-50' : ''
                              )
                            }
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-2xl flex-shrink-0 mt-0.5">
                                {typeIcons[item.type]}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {item._highlightResult?.title ? (
                                    getHighlightedText(item.title, item._highlightResult.title)
                                  ) : (
                                    item.title
                                  )}
                                </h4>
                                {item.description && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {item._highlightResult?.description ? (
                                      getHighlightedText(item.description, item._highlightResult.description)
                                    ) : (
                                      item.description
                                    )}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-gray-400">
                                    {typeNames[item.type]}
                                  </span>
                                  {item.date && (
                                    <span className="text-xs text-gray-400">
                                      {new Date(item.date).toLocaleDateString('zh-CN')}
                                    </span>
                                  )}
                                  {item.tags && item.tags.length > 0 && (
                                    <div className="flex gap-1">
                                      {item.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                          key={index}
                                          className="text-xs text-gray-400"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Combobox.Option>
                        ))}
                      </div>
                    )}
                    
                    {!loading && totalHits > results.length && (
                      <div className="px-4 py-2 text-center border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          显示 {results.length} / {totalHits} 个结果
                        </p>
                      </div>
                    )}
                  </Combobox.Options>
                  
                  {/* 搜索快捷键提示 */}
                  <div className="border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600">↑↓</kbd>
                        导航
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600">↵</kbd>
                        选择
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600">esc</kbd>
                        关闭
                      </span>
                    </div>
                    {isAlgoliaEnabled && (
                      <div className="flex items-center gap-1">
                        <span>搜索由</span>
                        <svg className="h-4 w-auto" viewBox="0 0 130 18" fill="none">
                          <path d="M58.2 1.6h6.5l6.3 15.4h-5.5l-1-2.7h-6.5l-1 2.7h-5.2l6.4-15.4zm-.3 9h4.2l-2.1-5.6-2.1 5.6zm16.3-9h5v15.5h-5V1.6zm8.8 11.1c0-1.4.5-2.5 1.4-3.3.9-.8 2.3-1.4 4.1-1.7l3.8-.7v-.3c0-.8-.6-1.2-1.9-1.2-1.3 0-2.8.3-4.5.9l-1.5-3c2.2-1 4.5-1.5 6.8-1.5 2.1 0 3.7.4 4.7 1.3 1.1.9 1.6 2.2 1.6 4v9.2c-1.2.3-2.5.5-3.9.7-1.4.2-2.7.3-3.8.3-1.8 0-3.2-.4-4.1-1.1-.9-.8-1.3-1.9-1.3-3.3l-.4-1.3zm8.7.4v-2l-2.2.4c-1.2.2-1.8.7-1.8 1.5 0 .4.1.7.4.9.3.2.7.3 1.3.3.7-.1 1.5-.3 2.3-.6v-.5zm7.7-.4c0-2 .6-3.6 1.9-4.8 1.3-1.2 3.1-1.8 5.5-1.8 2.3 0 4.1.6 5.4 1.8 1.3 1.2 1.9 2.8 1.9 4.8v.8c0 2-.6 3.6-1.9 4.8-1.3 1.2-3.1 1.8-5.5 1.8s-4.2-.6-5.4-1.8c-1.3-1.2-1.9-2.8-1.9-4.8v-.8zm5.1.7c0 1.6.7 2.3 2.2 2.3s2.2-.8 2.2-2.3v-.7c0-1.6-.7-2.3-2.2-2.3s-2.2.8-2.2 2.3v.7zm13.6-11.8h5v15.5h-5V1.6zm8.2 0h5.2v2.2h-5.2V1.6zm0 4.3h5.2v11.2h-5.2V5.9zm8.9 5.6c0-1.9.6-3.5 1.7-4.6 1.1-1.2 2.7-1.7 4.7-1.7.9 0 1.7.1 2.4.2.7.1 1.4.3 2.1.5v10.6c-1.4.5-3 .8-4.8.8-2 0-3.5-.5-4.5-1.5-1-.9-1.5-2.4-1.5-4.3h-.1zm5.1-2.2c-1.3 0-2 .8-2 2.3 0 .8.2 1.3.5 1.7.3.3.8.5 1.5.5.5 0 1-.1 1.5-.2V9.7c-.5-.3-1-.4-1.5-.4z" fill="#003DFF"/>
                          <path d="M26.4 13.8H13.2l-2.1 3.6c-.1.1-.2.2-.4.2H6.5c-.1 0-.2 0-.2-.1-.1-.1-.1-.2 0-.3l9.9-16.9c.1-.1.2-.2.4-.2h4.2c.1 0 .3.1.4.2l9.9 16.9c.1.1.1.2 0 .3-.1.1-.2.1-.2.1h-4.2c-.2 0-.3-.1-.4-.2l-2.1-3.6h.2zm-2.3-3.9l-4.3-7.4-4.3 7.4h8.6z" fill="#003DFF"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

/**
 * 本地降级搜索函数
 */
async function localFallbackSearch(query: string) {
  try {
    // 调用现有的本地搜索 API
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await response.json()
    
    // 转换为 Algolia 格式
    return data.results.map((item: any) => ({
      objectID: item.id || `${item.type}_${Date.now()}`,
      type: item.type,
      title: item.title,
      description: item.description || item.content?.substring(0, 200),
      url: item.url || '#',
      date: item.date,
      tags: item.tags || [],
      author: item.author
    }))
  } catch (error) {
    console.error('Fallback search error:', error)
    return []
  }
}