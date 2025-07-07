/**
 * 书架系统 Notion 数据获取模块
 * @module lib/notion/books
 * @description 负责从 Notion 数据库获取书籍数据，包含缓存机制和后备数据支持
 */

import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { 
  Book, 
  NotionBookProperties,
  isValidBookStatus,
  isValidRating,
  NotionAPIError, 
  ConfigurationError, 
  ResourceNotFoundError, 
  handleBookshelfError,
  validateBookData 
} from '@/types/bookshelf'
import { fallbackBooks } from '@/lib/fallback-books'

/**
 * Notion 客户端实例
 */
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

/**
 * Notion 转 Markdown 工具实例
 */
const n2m = new NotionToMarkdown({ notionClient: notion })

/**
 * 书籍数据库 ID
 */
const booksDatabaseId = process.env.NOTION_BOOKS_DB || ''

/**
 * 内存缓存存储
 */
let booksCache: Book[] | null = null

/**
 * 缓存时间戳
 */
let cacheTime: number | null = null

/**
 * 缓存生存时间（毫秒）
 * @default 3600000 (1小时)
 */
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '3600000', 10)

/**
 * 获取所有书籍数据
 * @async
 * @returns {Promise<Book[]>} 返回书籍数组
 * @description 从 Notion 数据库获取所有书籍数据，按完成日期降序排列。
 * 包含缓存机制，当 Notion 不可用时使用后备数据。
 * @throws {Error} 当 Notion API 调用失败时，不会抛出错误，而是返回后备数据
 */
export async function getBooks(): Promise<Book[]> {
  try {
    // 检查缓存
    if (booksCache && cacheTime && Date.now() - cacheTime < CACHE_TTL) {
      return booksCache
    }

    if (!booksDatabaseId) {
      throw new ConfigurationError('NOTION_BOOKS_DB environment variable is not configured')
    }
    const response = await notion.databases.query({
      database_id: booksDatabaseId,
      sorts: [{
        property: 'FinishDate',
        direction: 'descending'
      }]
    })

    const books = await Promise.all(
      response.results.map(async (page: any) => {
        try {
          const mdblocks = await n2m.pageToMarkdown(page.id)
          const mdString = n2m.toMarkdownString(mdblocks)
          
          return formatBook(page, mdString.parent)
        } catch (error) {
          console.error(`Failed to process book with ID ${page.id}:`, error)
          // 返回一个基本的书籍对象作为备用
          return formatBook(page, '')
        }
      })
    )

    // 更新缓存
    booksCache = books
    cacheTime = Date.now()

    return books
  } catch (error) {
    handleBookshelfError(error, 'getBooks')
    return fallbackBooks
  }
}

/**
 * 根据 ID 获取单本书籍
 * @async
 * @param {string} id - 书籍 ID
 * @returns {Promise<Book | null>} 返回匹配的书籍或 null
 * @description 从书籍列表中查找指定 ID 的书籍
 */
export async function getBookById(id: string): Promise<Book | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new ResourceNotFoundError(
        'Invalid book ID provided',
        'Book',
        String(id)
      )
    }
    
    const books = await getBooks()
    const book = books.find(book => book.id === id)
    
    if (!book) {
      console.warn(`Book with ID ${id} not found`)
    }
    
    return book || null
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      throw error
    }
    handleBookshelfError(error, `getBookById(${id})`, false)
    return null
  }
}

/**
 * 根据阅读状态获取书籍
 * @async
 * @param {Book['status']} status - 阅读状态（'reading' | 'read' | 'want-to-read'）
 * @returns {Promise<Book[]>} 返回指定状态的书籍数组
 * @description 筛选出特定阅读状态的所有书籍
 */
export async function getBooksByStatus(status: Book['status']): Promise<Book[]> {
  try {
    if (!isValidBookStatus(status)) {
      console.warn(`Invalid status: ${status}. Using empty array.`)
      return []
    }
    
    const books = await getBooks()
    return books.filter(book => book.status === status)
  } catch (error) {
    handleBookshelfError(error, `getBooksByStatus(${status})`)
    return []
  }
}

/**
 * 获取推荐书籍
 * @async
 * @param {number} [limit=6] - 返回数量限制
 * @returns {Promise<Book[]>} 返回高评分书籍数组
 * @description 获取评分 4 分及以上的书籍作为推荐
 * @example
 * const featuredBooks = await getFeaturedBooks(3) // 获取 3 本推荐书籍
 */
export async function getFeaturedBooks(limit: number = 6): Promise<Book[]> {
  try {
    if (limit < 0 || !Number.isInteger(limit)) {
      console.warn(`Invalid limit: ${limit}. Using default value 6.`)
      limit = 6
    }
    
    const books = await getBooks()
    return books
      .filter(book => book.rating >= 4)
      .slice(0, limit)
  } catch (error) {
    handleBookshelfError(error, `getFeaturedBooks(${limit})`)
    return []
  }
}

/**
 * 格式化 Notion 页面数据为 Book 类型
 * @private
 * @param {any} page - Notion 页面对象
 * @param {string} notes - 书籍笔记内容（Markdown 格式）
 * @returns {Book} 返回格式化后的书籍对象
 * @description 将 Notion 数据库的原始数据转换为应用所需的 Book 类型。
 * 处理默认值、类型转换和数据清洗。
 */
function formatBook(page: any, notes: string): Book {
  try {
    const properties = page.properties as NotionBookProperties
    
    // 验证必填字段
    validateBookData(page.id, 'page.id')
    validateBookData(properties, 'page.properties')

  // 处理标签
  const tags = properties.Tags?.multi_select?.map((tag: any) => tag.name) || []
  
  // 处理封面
  const cover = properties.Cover?.files?.[0]?.type === 'external' 
    ? properties.Cover.files[0].external.url 
    : properties.Cover?.files?.[0]?.file?.url || '/images/book-placeholder.jpg'

  // 处理评分
  const ratingValue = properties.Rating?.select?.name ? parseInt(properties.Rating.select.name) : 3
  const rating = isValidRating(ratingValue) ? ratingValue : 3

  return {
    id: page.id,
    title: properties.Title?.title?.[0]?.plain_text || 'Untitled',
    author: properties.Author?.rich_text?.[0]?.plain_text || 'Unknown',
    isbn: properties.ISBN?.rich_text?.[0]?.plain_text,
    category: properties.Category?.select?.name || '其他',
    status: (() => {
      const statusValue = properties.Status?.select?.name?.toLowerCase()
      return isValidBookStatus(statusValue) ? statusValue : 'want-to-read'
    })() as Book['status'],
    rating: rating as 1 | 2 | 3 | 4 | 5,
    startDate: properties.StartDate?.date?.start,
    finishDate: properties.FinishDate?.date?.start,
    cover,
    notes,
    takeaways: properties.Takeaways?.rich_text?.[0]?.plain_text,
    tags,
    publishYear: properties.PublishYear?.number,
    pages: properties.Pages?.number,
    language: properties.Language?.select?.name || '中文'
  }
  } catch (error) {
    console.error('Error formatting book data:', error)
    // 返回一个最小可用的书籍对象
    return {
      id: page?.id || 'unknown',
      title: properties?.Title?.title?.[0]?.plain_text || 'Unknown Book',
      author: properties?.Author?.rich_text?.[0]?.plain_text || 'Unknown Author',
      category: '其他',
      status: 'want-to-read',
      rating: 3,
      cover: '/images/book-placeholder.jpg',
      notes: notes || '',
      tags: [],
      language: '中文'
    }
  }
}