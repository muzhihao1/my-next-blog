/** * 书籍详情页面 * @module app/bookshelf/[id]/page */
import { getBookById, getBooks }
from '@/lib/notion/books' 

import { notFound }
from 'next/navigation' 

import Link from 'next/link' 

import { OptimizedImage } from '@/components/ui/OptimizedImage' 

import { remark }
from 'remark' 

import html from 'remark-html' 

import { StructuredData, generateBookStructuredData }
from '@/components/seo/StructuredData' 

import type { Metadata }
from 'next' 

// ISR配置：每小时重新验证一次 
export const revalidate = 3600 

/** * 生成静态路径 * @async * @function generateStaticParams * @returns {Promise<Array<{id: string}>>} 返回所有书籍 ID 的数组 * @description 为静态生成提供所有可能的书籍 ID 路径 */
export async function generateStaticParams() { 
  try { 
    // 从 Notion 获取所有书籍 
    const books = await getBooks() 
    return books.map((book) => ({ 
      id: book.id, 
    })) 
  }
  catch (error) { 
    console.error('Error generating static params for books:', error) 
    // 返回空数组，让页面在请求时动态生成 
    return []
}
}

/** * 将 Markdown 转换为 HTML * @async * @function markdownToHtml * @param {string}
markdown - Markdown 格式的文本 * @returns {Promise<string>} 返回转换后的 HTML 字符串 * @description 使用 remark 处理器将 Markdown 内容转换为 HTML 格式 */
async function markdownToHtml(markdown: string) {
  try {
    if (!markdown || typeof markdown !== 'string') {
      return ''
    }
    const result = await remark().use(html).process(markdown)
    return result.toString()
  }
  catch (error) {
    console.error('Error converting markdown to HTML:', error)
    // 返回原始文本作为后备方案
    return `<p>${markdown.replace(/\n/g, '<br>')}</p>`
  }
}

/** * 生成页面元数据 * @async * @function generateMetadata * @param {Object}
props - 属性对象 * @param {Promise<{id: string}>}
props.params - 包含书籍 ID 的参数 * @returns {Promise<Metadata>} 返回页面的元数据 * @description 为书籍详情页面生成 SEO 优化的元数据，包括标题、描述和 Open Graph 标签 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const book = await getBookById(id)
  
  if (!book) {
    return {
      title: '书籍不存在',
      description: '抱歉，找不到这本书。'
    }
  }
  
  return {
    title: `${book.title} - ${book.author}`,
    description: `阅读笔记：${book.title}，作者：${book.author}`,
    openGraph: {
      title: book.title,
      description: `阅读笔记：${book.title}，作者：${book.author}`,
      type: 'book',
    },
  }
}

/** * 书籍详情页面组件 * @async * @function BookDetailPage * @param {Object}
props - 组件属性 * @param {Promise<{id: string}>}
props.params - 包含书籍 ID 的参数 * @returns {Promise<JSX.Element>} 渲染的书籍详情页面 * @description 展示单本书籍的详细信息，包括封面、基本信息、评分、阅读笔记等。 * 支持 Markdown 格式的读书笔记，包含结构化数据以优化 SEO。 * @example * // 访问路由 /bookshelf/[id] */
export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // 从 Notion 获取书籍数据
  const book = await getBookById(id)
  
  if (!book) {
    notFound()
  }
  
  const notesHtml = book.notes ? await markdownToHtml(book.notes) : ''
  
  const statusColors = {
    'reading': 'bg-yellow-100 text-yellow-700',
    'read': 'bg-green-100 text-green-700',
    'want-to-read': 'bg-blue-100 text-blue-700'
  }
  
  const statusText = {
    'reading': '在读',
    'read': '已读',
    'want-to-read': '想读'
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  const bookStructuredData = generateBookStructuredData({
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    description: book.notes || book.takeaways || '',
    datePublished: book.publishYear ? `${book.publishYear}-01-01` : undefined,
    url: `${baseUrl}/bookshelf/${id}`
  })
  
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
<div className="max-w-4xl mx-auto">
<StructuredData type="Book" data={bookStructuredData}
/> {/* 返回按钮 */}
<Link href="/bookshelf" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors" >
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M15 19l-7-7 7-7" /> </svg> 返回书架 </Link>
<div className="grid md:grid-cols-3 gap-8"> {/* 左侧：书籍封面和基本信息 */}
<div className="md:col-span-1">
<div className="aspect-[3/4]
relative overflow-hidden rounded-lg bg-gray-100 mb-6">
<OptimizedImage src={book.cover}
alt={book.title}
fill className="object-cover" 
sizes="(max-width: 768px) 100vw, 33vw" /> </div>
<div className="space-y-4">
<div>
<span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusColors[book.status]
}`}> {statusText[book.status]
}</span> </div>
<div>
<h3 className="text-sm font-medium text-gray-500 mb-1">评分</h3>
<div className="flex items-center gap-1"> {[...Array(5)].map((_, i) => ( <svg key={i}
className={`w-5 h-5 ${i < book.rating ? 'text-yellow-400' : 'text-gray-300'}`}
fill="currentColor" viewBox="0 0 20 20" >
<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /> </svg> ))} </div> </div> {book.startDate && ( <div>
<h3 className="text-sm font-medium text-gray-500 mb-1">阅读时间</h3>
<p className="text-sm text-gray-900"> {new Date(book.startDate).toLocaleDateString('zh-CN')} {book.finishDate && ` - ${new Date(book.finishDate).toLocaleDateString('zh-CN')}`} </p> </div> )} {book.pages && ( <div>
<h3 className="text-sm font-medium text-gray-500 mb-1">页数</h3>
<p className="text-sm text-gray-900">{book.pages} 页</p> </div> )} {book.isbn && ( <div>
<h3 className="text-sm font-medium text-gray-500 mb-1">ISBN</h3>
<p className="text-sm text-gray-900">{book.isbn}</p> </div> )} {book.tags && book.tags.length > 0 && ( <div>
<h3 className="text-sm font-medium text-gray-500 mb-2">标签</h3>
<div className="flex flex-wrap gap-2"> {book.tags.map((tag) => ( <span key={tag}
className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded" > {tag} </span> ))} </div> </div> )} </div> </div> {/* 右侧：书籍详情 */}
<div className="md:col-span-2">
<header className="mb-8">
<h1 className="text-3xl font-bold text-gray-900 mb-2"> {book.title} </h1>
<p className="text-xl text-gray-600 mb-4"> {book.author} </p>
<div className="flex items-center gap-4 text-sm text-gray-500">
<span>{book.category}</span> {book.publishYear && ( <>
<span>·</span>
<span>{book.publishYear}年出版</span> </> )} {book.language && ( <>
<span>·</span>
<span>{book.language}</span> </> )} </div> </header> {book.takeaways && ( <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
<h2 className="text-lg font-semibold text-gray-900 mb-3"> 核心收获 </h2>
<p className="text-gray-700"> {book.takeaways} </p> </div> )} {notesHtml && ( <div>
<h2 className="text-2xl font-bold text-gray-900 mb-6"> 读书笔记 </h2>
<div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: notesHtml }
}
/> </div> )} </div> </div> </div> </div> ) }