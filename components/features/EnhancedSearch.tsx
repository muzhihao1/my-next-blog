'use client' import { useState, useEffect, useRef, useCallback, useMemo }
from 'react' 

import { useRouter }
from 'next/navigation' 

import { useDebounce }
from '@/lib/hooks/useDebounce' 

import { useSearchHistory }
from '@/lib/hooks/useSearchHistory' 

import { AdvancedSearch, EnhancedSearchItem }
from '@/lib/search/advancedSearch' 

import { SearchFilters, POST_CATEGORIES, PROJECT_CATEGORIES, BOOK_CATEGORIES, TOOL_CATEGORIES }
from '@/lib/search/searchTypes' interface EnhancedSearchProps { className?: string }
export function EnhancedSearch({ className }: EnhancedSearchProps) { const [isOpen, setIsOpen] = useState(false) const [query, setQuery] = useState('') const [results, setResults] = useState<EnhancedSearchItem[]>([]) const [filters, setFilters] = useState<SearchFilters>({ type: 'all', dateRange: { preset: 'all' }
}) const [showFilters, setShowFilters] = useState(false) const [showHistory, setShowHistory] = useState(false) const [isSearching, setIsSearching] = useState(false) const [suggestions, setSuggestions] = useState<string[]>([]) const searchRef = useRef<HTMLDivElement>(null) const inputRef = useRef<HTMLInputElement>(null) const router = useRouter() const debouncedQuery = useDebounce(query, 300) const searchEngine = useMemo(() => new AdvancedSearch(), []) const { history, addToHistory, removeFromHistory, clearHistory, getRecentQueries } = useSearchHistory() // 搜索函数 const performSearch = useCallback(async () => { if (!debouncedQuery && filters.type === 'all' && !filters.category && !filters.tags?.length) { setResults([]) return }
setIsSearching(true) try { const { results: searchResults, stats } = searchEngine.search({ query: debouncedQuery, filters, sortBy: 'relevance', limit: 50 }) setResults(searchResults) // 添加到搜索历史 if (debouncedQuery && searchResults.length > 0) { addToHistory(debouncedQuery, searchResults.length, filters.type) }
}
finally { setIsSearching(false) }
}, [debouncedQuery, filters, searchEngine, addToHistory]) // 获取搜索建议 const updateSuggestions = useCallback(() => { if (query.length >= 2) { const engineSuggestions = searchEngine.getSuggestions(query, 3) const historySuggestions = getRecentQueries(2).filter( q => q.toLowerCase().includes(query.toLowerCase()) ) setSuggestions([...new Set([...engineSuggestions, ...historySuggestions])].slice(0, 5)) }
else { setSuggestions([]) }
}, [query, searchEngine, getRecentQueries]) // 监听搜索查询变化 useEffect(() => { performSearch() }, [performSearch]) // 更新搜索建议 useEffect(() => { updateSuggestions() }, [updateSuggestions]) // 点击外部关闭 useEffect(() => { function handleClickOutside(event: MouseEvent) { if (searchRef.current && !searchRef.current.contains(event.target as Node)) { setIsOpen(false) }
}
document.addEventListener('mousedown', handleClickOutside) return () => document.removeEventListener('mousedown', handleClickOutside) }, []) // 键盘快捷键 useEffect(() => { function handleKeyDown(event: KeyboardEvent) { if ((event.metaKey || event.ctrlKey) && event.key === 'k') { event.preventDefault() setIsOpen(true) setTimeout(() => inputRef.current?.focus(), 100) }
if (event.key === 'Escape') { setIsOpen(false) }
}
document.addEventListener('keydown', handleKeyDown) return () => document.removeEventListener('keydown', handleKeyDown) }, []) const handleResultClick = (url: string) => { setIsOpen(false) setQuery('') router.push(url) }
const handleSuggestionClick = (suggestion: string) => { setQuery(suggestion) setShowHistory(false) }
const handleFilterChange = (newFilters: Partial<SearchFilters>) => { setFilters(prev => ({ ...prev, ...newFilters })) }
const getCategoryOptions = () => { if (!filters.type || filters.type === 'all') { return searchEngine.getCategories() }
switch (filters.type) { case 'post': return POST_CATEGORIES case 'project': return PROJECT_CATEGORIES case 'book': return BOOK_CATEGORIES case 'tool': return TOOL_CATEGORIES default: return []
}
}
const getTypeIcon = (type: string) => { const icons = { post: '📝', project: '📁', book: '📚', tool: '🔧' }
return icons[type as keyof typeof icons] || '📄' }
const getTypeLabel = (type: string) => { const labels = { post: '文章', project: '项目', book: '书籍', tool: '工具' }
return labels[type as keyof typeof labels] || type }
return ( <div ref={searchRef}
className={`relative ${className || ''}`}> {/* 搜索按钮 */}
<button onClick={() => { setIsOpen(true) setTimeout(() => inputRef.current?.focus(), 100) }
}
className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900:text-white bg-gray-100 rounded-lg transition-colors" >
<span className="text-lg">🔍</span>
<span className="hidden sm:inline">搜索</span>
<kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-gray-200 rounded">
<span className="text-base">⌘</span>K </kbd> </button> {/* 搜索弹窗 */} {isOpen && ( <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}
/>
<div className="relative mx-auto max-w-3xl transform divide-y divide-gray-200 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all"> {/* 搜索输入框 */}
<div className="relative">
<span className="pointer-events-none absolute top-3.5 left-4 text-lg">🔍</span>
<input ref={inputRef}
type="text" value={query}
onChange={(e) => setQuery(e.target.value)}
onFocus={() => setShowHistory(true)}
className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none sm:text-sm" placeholder="搜索文章、项目、书籍、工具..." /> {isSearching && ( <span className="absolute right-4 top-3.5 text-sm text-gray-400">搜索中...</span> )} </div> {/* 过滤器栏 */}
<div className="flex items-center justify-between px-4 py-2 border-b border-gray-200"> {/* 类型选择 */}
<div className="flex items-center gap-2"> {(['all', 'post', 'project', 'book', 'tool']
as const).map(type => ( <button key={type}
onClick={() => handleFilterChange({ type })}
className={`px-3 py-1 text-xs rounded-full transition-colors ${ filters.type === type ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700' }`} > {type === 'all' ? '全部' : getTypeLabel(type)} </button> ))} </div> {/* 高级过滤器切换 */}
<button onClick={() => setShowFilters(!showFilters)}
className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-900:text-white transition-colors" >
<span>⚙️</span> 高级筛选 </button> </div> {/* 高级过滤器面板 */} {showFilters && ( <div className="px-4 py-3 border-b border-gray-200 space-y-3"> {/* 分类选择 */}
<div className="flex items-center gap-3">
<span className="text-sm text-gray-600">分类：</span>
<select value={filters.category || ''}
onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
className="text-sm px-3 py-1 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary" >
<option value="">全部分类</option> {getCategoryOptions().map(cat => ( <option key={cat}
value={cat}>{cat}</option> ))} </select> </div> {/* 时间范围 */}
<div className="flex items-center gap-3">
<span className="text-sm text-gray-600">时间：</span>
<div className="flex gap-2"> {(['all', 'today', 'week', 'month', 'year']
as const).map(preset => ( <button key={preset}
onClick={() => handleFilterChange({ dateRange: { preset }
})}
className={`px-3 py-1 text-xs rounded-lg transition-colors ${ filters.dateRange?.preset === preset ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700' }`} > {preset === 'all' ? '全部' : preset === 'today' ? '今天' : preset === 'week' ? '本周' : preset === 'month' ? '本月' : '今年'} </button> ))} </div> </div> </div> )} {/* 搜索建议和历史 */} {showHistory && !query && history.length > 0 && ( <div className="max-h-60 overflow-y-auto py-2">
<div className="px-4 py-1 flex items-center justify-between">
<span className="text-xs text-gray-500">搜索历史</span>
<button onClick={clearHistory}
className="text-xs text-gray-500 hover:text-gray-700:text-gray-200" > 清除 </button> </div> {history.slice(0, 5).map(item => ( <button key={item.id}
onClick={() => handleSuggestionClick(item.query)}
className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100:bg-gray-800 flex items-center justify-between group" >
<span className="flex items-center gap-2">
<span>🕐</span>
<span>{item.query}</span>
<span className="text-xs text-gray-400">({item.resultCount} 结果)</span> </span>
<button onClick={(e) => { e.stopPropagation() removeFromHistory(item.id) }
}
className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600" > ✕ </button> </button> ))} </div> )} {/* 搜索建议 */} {suggestions.length > 0 && query && ( <div className="border-b border-gray-200">
<div className="px-4 py-1">
<span className="text-xs text-gray-500">搜索建议</span> </div> {suggestions.map((suggestion, index) => ( <button key={index}
onClick={() => handleSuggestionClick(suggestion)}
className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100:bg-gray-800 flex items-center gap-2" >
<span>💡</span>
<span>{suggestion}</span> </button> ))} </div> )} {/* 搜索结果 */} {results.length > 0 && ( <ul className="max-h-96 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800"> {results.map((result) => ( <li key={result.id}>
<button onClick={() => handleResultClick(result.url)}
className="group flex w-full items-start gap-3 px-4 py-3 hover:bg-gray-100:bg-gray-800 transition-colors" >
<div className="flex-shrink-0 text-2xl"> {getTypeIcon(result.type)} </div>
<div className="flex-grow text-left">
<div className="font-medium text-gray-900 group-hover:text-blue-600:text-blue-400"> {result.title} </div>
<div className="text-gray-600 line-clamp-2 text-sm mt-1"> {result.content} </div>
<div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
<span>{getTypeLabel(result.type)}</span> {result.category && <span>• {result.category}</span>} {result.date && ( <span>• {new Date(result.date).toLocaleDateString('zh-CN')}</span> )} {result.rating && <span>• ⭐ {result.rating}</span>} </div> </div> </button> </li> ))} </ul> )} {/* 无结果提示 */} {query.length >= 2 && results.length === 0 && !isSearching && ( <div className="py-14 px-4 text-center text-sm text-gray-500"> 没有找到相关内容 </div> )} {/* 快捷键提示 */}
<div className="flex items-center justify-between px-4 py-2.5 text-xs text-gray-500">
<div className="flex items-center gap-4">
<div className="flex items-center gap-1">
<kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑↓</kbd>
<span>导航</span> </div>
<div className="flex items-center gap-1">
<kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↵</kbd>
<span>选择</span> </div>
<div className="flex items-center gap-1">
<kbd className="px-1.5 py-0.5 bg-gray-100 rounded">esc</kbd>
<span>关闭</span> </div> </div> {results.length > 0 && ( <span className="text-gray-400"> 共 {results.length} 个结果 </span> )} </div> </div> </div> )} </div> ) }