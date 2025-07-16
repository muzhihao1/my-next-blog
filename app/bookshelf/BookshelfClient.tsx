/** * 书架客户端组件 * @module app/bookshelf/BookshelfClient */
'use client'

import { useState, useMemo } from 'react' 

import BookCard from '@/components/features/BookCard' 

import ViewToggle from '@/components/features/ViewToggle' 

import LazyLoad from '@/components/ui/LazyLoad' 

import { Book, BookStats, BookshelfView, BookSortOption }
from '@/types/bookshelf' 

import { PageContainer } from '@/components/ui/Container' 

/** * 书架客户端组件的属性 * @interface BookshelfClientProps * @property {Book[]} books - 书籍数据数组 */
interface BookshelfClientProps {
  books: Book[]
}

/** * 书架客户端组件 * @component * @param {BookshelfClientProps}
props - 组件属性 * @returns {JSX.Element} 渲染的书架页面 * @description 提供书籍的展示、筛选、排序功能。支持网格和列表两种视图模式， * 可按阅读状态、分类筛选，支持按日期、评分、书名排序。 * 包含阅读统计信息展示和懒加载优化。 * @example * <BookshelfClient books={booksData} /> */
export default function BookshelfClient({ books }: BookshelfClientProps) {
  const [view, setView] = useState<BookshelfView>('grid')
  const [selectedStatus, setSelectedStatus] = useState<Book['status'] | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<BookSortOption>('date')
  
  // 获取所有分类
  const categories = useMemo(() => {
    const cats = new Set(books.map(book => book.category))
    return Array.from(cats).sort()
  }, [books])
  
  // 筛选和排序书籍
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = [...books]
    
    // 按状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(book => book.status === selectedStatus)
    }
    
    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => book.category === selectedCategory)
    }
    
    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateA = a.finishDate || a.startDate || ''
          const dateB = b.finishDate || b.startDate || ''
          return dateB.localeCompare(dateA)
        case 'rating':
          return b.rating - a.rating
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })
    
    return filtered
  }, [books, selectedStatus, selectedCategory, sortBy])
  
  // 统计数据
  const stats = useMemo<BookStats>(() => {
    const total = books.length
    const read = books.filter(b => b.status === 'read').length
    const reading = books.filter(b => b.status === 'reading').length
    const wantToRead = books.filter(b => b.status === 'want-to-read').length
    const avgRating = books
      .filter(b => b.status === 'read' && b.rating)
      .reduce((sum, b) => sum + b.rating, 0) / read || 0
    
    return { total, read, reading, wantToRead, avgRating }
  }, [books])
  
  return (
    <PageContainer size="xl">
      {/* 页面标题 */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          我的书架
        </h1>
        <p className="text-lg text-gray-600">
          记录阅读历程，分享知识收获
        </p>
      </div>
      
      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">总数</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.read}</div>
          <div className="text-sm text-gray-600">已读</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.reading}</div>
          <div className="text-sm text-gray-600">在读</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.wantToRead}</div>
          <div className="text-sm text-gray-600">想读</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</div>
          <div className="text-sm text-gray-600">平均评分</div>
        </div>
      </div>
      
      {/* 筛选和排序控件 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-4">
          {/* 状态筛选 */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Book['status'] | 'all')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="read">已读</option>
            <option value="reading">在读</option>
            <option value="want-to-read">想读</option>
          </select>
          
          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部分类</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          {/* 排序 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as BookSortOption)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">按日期排序</option>
            <option value="rating">按评分排序</option>
            <option value="title">按书名排序</option>
          </select>
        </div>
        
        {/* 视图切换 */}
        <ViewToggle view={view} onViewChange={setView} />
      </div>
      
      {/* 书籍列表 */}
      <div className={view === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6' 
        : 'space-y-4'
      }>
        {filteredAndSortedBooks.map((book) => (
          <LazyLoad
            key={book.id}
            threshold={0.1}
            rootMargin="100px"
            placeholder={
              <div className={view === 'grid' 
                ? 'aspect-[3/4] bg-gray-100 rounded-lg animate-pulse' 
                : 'h-28 bg-gray-100 rounded-lg animate-pulse'
              } />
            }
          >
            <BookCard book={book} view={view} />
          </LazyLoad>
        ))}
      </div>
      
      {filteredAndSortedBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">没有找到符合条件的书籍</p>
        </div>
      )}
    </PageContainer>
  )
}