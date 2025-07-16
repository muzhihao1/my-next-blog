'use client' import { useState, useEffect, useRef, useCallback, useMemo }
from 'react' 

import { useRouter }
from 'next/navigation' 

import { useDebounce }
from '@/lib/hooks/useDebounce' 

import Fuse from 'fuse.js' 

import { buildSearchIndex, SearchItem }
from '@/lib/search/searchData' interface SearchResult extends SearchItem { score?: number }
export function Search() { const [isOpen, setIsOpen] = useState(false) const [query, setQuery] = useState('') const [results, setResults] = useState<SearchResult[]>([]) const [selectedType, setSelectedType] = useState<'all' | 'post' | 'project' | 'book' | 'tool'>('all') const searchRef = useRef<HTMLDivElement>(null) const inputRef = useRef<HTMLInputElement>(null) const router = useRouter() const debouncedQuery = useDebounce(query, 300) // 初始化 Fuse.js 搜索引擎 const fuse = useMemo(() => { const searchData = buildSearchIndex() return new Fuse(searchData, { keys: [ { name: 'title', weight: 0.7 }, { name: 'content', weight: 0.3 }, { name: 'tags', weight: 0.2 }, { name: 'author', weight: 0.1 }
], threshold: 0.3, includeScore: true, ignoreLocation: true, useExtendedSearch: true }) }, []) // 搜索函数 const performSearch = useCallback((searchQuery: string) => { if (searchQuery.length < 2) { setResults([]) return }
const searchResults = fuse.search(searchQuery) let filteredResults = searchResults.map(result => ({ ...result.item, score: result.score })) // 按类型过滤 if (selectedType !== 'all') { filteredResults = filteredResults.filter(item => item.type === selectedType) }
// 限制结果数量 setResults(filteredResults.slice(0, 20)) }, [fuse, selectedType]) // 监听搜索查询变化 useEffect(() => { if (debouncedQuery) { performSearch(debouncedQuery) }
else { setResults([]) }
}, [debouncedQuery, performSearch]) // 点击外部关闭搜索 useEffect(() => { function handleClickOutside(event: MouseEvent) { if (searchRef.current && !searchRef.current.contains(event.target as Node)) { setIsOpen(false) }
}
document.addEventListener('mousedown', handleClickOutside) return () => document.removeEventListener('mousedown', handleClickOutside) }, []) // 键盘快捷键 useEffect(() => { function handleKeyDown(event: KeyboardEvent) { if ((event.metaKey || event.ctrlKey) && event.key === 'k') { event.preventDefault() setIsOpen(true) setTimeout(() => inputRef.current?.focus(), 100) }
if (event.key === 'Escape') { setIsOpen(false) }
}
document.addEventListener('keydown', handleKeyDown) return () => document.removeEventListener('keydown', handleKeyDown) }, []) const handleResultClick = (url: string) => { setIsOpen(false) setQuery('') router.push(url) }
const getTypeIcon = (type: string) => { switch (type) { case 'post': return ( <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /> </svg> ) case 'project': return ( <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /> </svg> ) case 'book': return ( <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> </svg> ) case 'tool': return ( <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> </svg> ) default: return null }
}
const getTypeLabel = (type: string) => { switch (type) { case 'post': return '文章' case 'project': return '项目' case 'book': return '书籍' case 'tool': return '工具' default: return type }
}
// 高亮搜索关键词 const highlightText = (text: string, query: string) => { if (!query) return text const parts = text.split(new RegExp(`(${query})`, 'gi')) return parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <mark key={i}
className="bg-yellow-200 text-inherit">{part}</mark> : part ) }
return ( <div ref={searchRef}
className="relative"> {/* 搜索按钮 */}
<button onClick={() => { setIsOpen(true) setTimeout(() => inputRef.current?.focus(), 100) }
}
className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900:text-white bg-gray-100 rounded-lg transition-colors" >
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg>
<span className="hidden sm:inline">搜索</span>
<kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-gray-200 rounded">
<span className="text-base">⌘</span>K </kbd> </button> {/* 搜索弹窗 */} {isOpen && ( <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}
/>
<div className="relative mx-auto max-w-2xl transform divide-y divide-gray-200 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all"> {/* 搜索输入框 */}
<div className="relative">
<svg className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg>
<input ref={inputRef}
type="text" value={query}
onChange={(e) => setQuery(e.target.value)}
className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none sm:text-sm" placeholder="搜索文章、项目、书籍、工具..." /> </div> {/* 类型筛选 */}
<div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
<button onClick={() => setSelectedType('all')}
className={`px-3 py-1 text-xs rounded-full transition-colors ${ selectedType === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700' }`} > 全部 </button>
<button onClick={() => setSelectedType('post')}
className={`px-3 py-1 text-xs rounded-full transition-colors ${ selectedType === 'post' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700' }`} > 文章 </button>
<button onClick={() => setSelectedType('project')}
className={`px-3 py-1 text-xs rounded-full transition-colors ${ selectedType === 'project' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700' }`} > 项目 </button>
<button onClick={() => setSelectedType('book')}
className={`px-3 py-1 text-xs rounded-full transition-colors ${ selectedType === 'book' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700' }`} > 书籍 </button>
<button onClick={() => setSelectedType('tool')}
className={`px-3 py-1 text-xs rounded-full transition-colors ${ selectedType === 'tool' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700' }`} > 工具 </button> </div> {/* 搜索结果 */} {results.length > 0 && ( <ul className="max-h-80 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800"> {results.map((result) => ( <li key={result.id}>
<button onClick={() => handleResultClick(result.url)}
className="group flex w-full items-center gap-3 px-4 py-2 hover:bg-gray-100:bg-gray-800 transition-colors" >
<div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600:text-gray-400"> {getTypeIcon(result.type)} </div>
<div className="flex-grow text-left">
<div className="font-medium text-gray-900 group-hover:text-blue-600:text-blue-400"> {highlightText(result.title, query)} </div>
<div className="text-gray-600 line-clamp-1"> {highlightText(result.content, query)} </div> </div>
<div className="flex-shrink-0">
<span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600"> {getTypeLabel(result.type)} </span> </div> </button> </li> ))} </ul> )} {/* 无结果提示 */} {query.length >= 2 && results.length === 0 && ( <div className="py-14 px-4 text-center text-sm text-gray-500"> 没有找到相关内容 </div> )} {/* 快捷键提示 */}
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
<span>关闭</span> </div> </div> </div> </div> </div> )} </div> ) }