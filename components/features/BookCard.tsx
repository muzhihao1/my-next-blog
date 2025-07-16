/** * 书籍卡片组件 * @module components/features/BookCard */
'use client'

import Link from 'next/link' 

import { Book }
from '@/types/bookshelf' 

import { ExternalImage } from '@/components/ui/ExternalImage' 

/** * 书籍卡片组件的属性 * @interface BookCardProps * @property {Book} book - 书籍数据对象 * @property {'grid' | 'list'} view - 显示模式（网格或列表） */
interface BookCardProps {
  book: Book
  view: 'grid' | 'list'
}
/** * 书籍卡片组件 * @component * @param {BookCardProps}
props - 组件属性 * @returns {JSX.Element} 渲染的书籍卡片 * @description 展示单本书籍信息的卡片组件，支持网格和列表两种视图模式。 * 包含书籍封面、标题、作者、评分、阅读状态等信息。 * @example * // 网格视图 * <BookCard book={bookData}
view="grid" /> * * @example * // 列表视图 * <BookCard book={bookData}
view="list" /> */
export default function BookCard({ book, view }: BookCardProps) {
  const statusColors = {
    'reading': 'bg-yellow-100/30 text-yellow-700',
    'read': 'bg-green-100/30 text-green-700',
    'want-to-read': 'bg-blue-100/30 text-blue-700'
  }
  
  const statusText = {
    'reading': '在读',
    'read': '已读',
    'want-to-read': '想读'
  }
  
  if (view === 'list') {
    return (
      <Link href={`/bookshelf/${book.id}`}
className="block">
<article className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-500:border-blue-400 hover:bg-gray-50:bg-gray-800/50 transition-all duration-300">
<ExternalImage src={book.cover}
alt={book.title}
width={64}
height={96}
className="flex-shrink-0 w-16 h-24 rounded overflow-hidden" />
<div className="flex-grow">
<div className="flex items-start justify-between gap-4">
<div>
<h3 className="font-semibold text-gray-900 mb-1 line-clamp-1"> {book.title} </h3>
<p className="text-sm text-gray-600 mb-2"> {book.author} </p> </div>
<span className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full ${statusColors[book.status]
}`}> {statusText[book.status]
}</span> </div>
<div className="flex items-center gap-4 text-sm text-gray-500">
<div className="flex items-center gap-1"> {[...Array(5)].map((_, i) => ( <svg key={i}
className={`w-4 h-4 ${i < book.rating ? 'text-yellow-400' : 'text-gray-300'}`}
fill="currentColor" viewBox="0 0 20 20" >
<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /> </svg> ))} </div>
<span>{book.category}</span> {book.finishDate && ( <span>{new Date(book.finishDate).getFullYear()}</span> )} </div> </div> </article> </Link> ) }
return ( <Link href={`/bookshelf/${book.id}`}
className="block group">
<article className="h-full bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500:border-blue-400 transition-all duration-300 hover:shadow-xl">
<div className="aspect-[3/4]
relative overflow-hidden bg-gray-100">
<ExternalImage src={book.cover}
alt={book.title}
fill className="group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" />
<div className="absolute top-2 right-2">
<span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[book.status]
}`}> {statusText[book.status]
}</span> </div> </div>
<div className="p-4 sm:p-5">
<h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600:text-blue-400 transition-colors"> {book.title} </h3>
<p className="text-sm text-gray-600 mb-3"> {book.author} </p>
<div className="flex items-center justify-between">
<div className="flex items-center gap-1"> {[...Array(5)].map((_, i) => ( <svg key={i}
className={`w-4 h-4 ${i < book.rating ? 'text-yellow-400' : 'text-gray-300'}`}
fill="currentColor" viewBox="0 0 20 20" >
<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /> </svg> ))} </div>
<span className="text-sm text-gray-500"> {book.category} </span> </div> </div> </article> </Link> ) }