/**
 * 书架系统 Notion 数据获取模块
 * @module lib/notion/books
 * @description 负责从 Notion 数据库获取书籍数据，包含缓存机制和后备数据支持
 */
import { Client } from '@notionhq/client'

import { NotionToMarkdown } from 'notion-to-md'
// import { cache } from 'react' // React 19 cache API 可能有兼容性问题
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

import { withRetry } from '@/lib/utils/retry'
import { getNotionEnvId } from '@/lib/utils/notion-helpers'
import { getCloudinaryUrl } from '@/lib/cloudinary-mapping'

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
const booksDatabaseId = getNotionEnvId('NOTION_BOOKS_DB')

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
 * Internal function to get all books with retry logic
 * @private
 */
async function _getBooks(): Promise<Book[]> {
  try {
    // 检查缓存
    if (booksCache && cacheTime && Date.now() - cacheTime < CACHE_TTL) {
      return booksCache
    }
    
    if (!booksDatabaseId) {
      throw new ConfigurationError('NOTION_BOOKS_DB environment variable is not configured')
    }
    
    const response = await withRetry(
      () => notion.databases.query({
        database_id: booksDatabaseId,
        sorts: [{
          property: 'FinishDate',
          direction: 'descending'
        }]
      }),
      {
        maxRetries: 3,
        retryableErrors: (error) => {
          return error.status === 429 || error.status >= 500 || error.code === 'ECONNRESET'
        }
      }
    )
    
    const books = await Promise.all(
      response.results.map(async (page: any) => {
        try {
          const mdblocks = await withRetry(
            () => n2m.pageToMarkdown(page.id),
            { maxRetries: 2 }
          )
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
 * 获取所有书籍数据 with React cache
 * @async
 * @returns {Promise<Book[]>} 返回书籍数组
 * @description 从 Notion 数据库获取所有书籍数据，按完成日期降序排列。
 * 包含缓存机制，当 Notion 不可用时使用后备数据。
 * @throws {Error} 当 Notion API 调用失败时，不会抛出错误，而是返回后备数据
 */
export const getBooks = _getBooks // TODO: 重新启用 cache

/**
 * Internal function to get book by ID
 * @private
 */
async function _getBookById(id: string): Promise<Book | null> {
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
 * 根据 ID 获取单本书籍 with React cache
 * @async
 * @param {string} id - 书籍 ID
 * @returns {Promise<Book | null>} 返回匹配的书籍或 null
 * @description 从书籍列表中查找指定 ID 的书籍
 */
export const getBookById = _getBookById // TODO: 重新启用 cache

/**
 * Internal function to get books by status
 * @private
 */
async function _getBooksByStatus(status: Book['status']): Promise<Book[]> {
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
 * 根据阅读状态获取书籍 with React cache
 * @async
 * @param {Book['status']} status - 阅读状态（'reading' | 'read' | 'want-to-read'）
 * @returns {Promise<Book[]>} 返回指定状态的书籍数组
 * @description 筛选出特定阅读状态的所有书籍
 */
export const getBooksByStatus = _getBooksByStatus // TODO: 重新启用 cache

/**
 * Internal function to get featured books
 * @private
 */
async function _getFeaturedBooks(limit: number = 6): Promise<Book[]> {
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
 * 获取推荐书籍 with React cache
 * @async
 * @param {number} [limit=6] - 返回数量限制
 * @returns {Promise<Book[]>} 返回高评分书籍数组
 * @description 获取评分 4 分及以上的书籍作为推荐
 * @example
 * const featuredBooks = await getFeaturedBooks(3) // 获取 3 本推荐书籍
 */
export const getFeaturedBooks = _getFeaturedBooks // TODO: 重新启用 cache

/**
 * 中文状态到英文状态的映射
 * @private
 */
const statusMapping: Record<string, Book['status']> = {
  '已读': 'read',
  '想读': 'want-to-read',
  '在读': 'reading'
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
    
    // 处理封面 - Notion 的封面存储在页面的 cover 属性中
    const cover = (() => {
      // 首先检查页面级别的 cover 属性
      if (page.cover) {
        if (page.cover.type === 'external') {
          const url = page.cover.external?.url
          // 如果是本地路径（/book-covers/），使用 Cloudinary 映射
          if (url && url.startsWith('/book-covers/')) {
            return getCloudinaryUrl(url)
          }
          return url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuaaguaXoOWbvueJhzwvdGV4dD4KPC9zdmc+'
        }
        if (page.cover.type === 'file') {
          return page.cover.file?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuaaguaXoOWbvueJhzwvdGV4dD4KPC9zdmc+'
        }
      }
      
      // 然后检查 properties.Cover（向后兼容）
      const firstFile = properties.Cover?.files?.[0]
      if (firstFile?.type === 'external') {
        const url = firstFile.external?.url
        // 如果是本地路径（/book-covers/），使用 Cloudinary 映射
        if (url && url.startsWith('/book-covers/')) {
          return getCloudinaryUrl(url)
        }
        return url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuaaguaXoOWbvueJhzwvdGV4dD4KPC9zdmc+'
      }
      if (firstFile?.type === 'file') {
        return firstFile.file?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuaaguaXoOWbvueJhzwvdGV4dD4KPC9zdmc+'
      }
      
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuaaguaXoOWbvueJhzwvdGV4dD4KPC9zdmc+'
    })()
    
    // 处理评分
    const ratingValue = properties.Rating?.number || 3
    const rating = isValidRating(ratingValue) ? ratingValue : 3
    
    return {
      id: page.id,
      title: properties.Title?.title?.[0]?.plain_text || 'Untitled',
      author: properties.Author?.rich_text?.[0]?.plain_text || 'Unknown',
      isbn: properties.ISBN?.rich_text?.[0]?.plain_text || undefined,
      category: properties.Category?.select?.name || '其他',
      status: (() => {
        const statusValue = properties.Status?.select?.name
        if (statusValue && statusMapping[statusValue]) {
          return statusMapping[statusValue]
        }
        // 如果是英文状态值，尝试直接使用
        const lowerStatus = statusValue?.toLowerCase()
        return lowerStatus && isValidBookStatus(lowerStatus) ? lowerStatus : 'want-to-read'
      })() as Book['status'],
      rating: rating as 1 | 2 | 3 | 4 | 5,
      startDate: properties.StartDate?.date?.start || undefined,
      finishDate: properties.FinishDate?.date?.start || undefined,
      cover,
      notes,
      takeaways: properties.Takeaways?.rich_text?.[0]?.plain_text || undefined,
      tags,
      publishYear: properties.PublishYear?.number || undefined,
      pages: properties.Pages?.number || undefined,
      language: properties.Language?.select?.name || '中文'
    }
  } catch (error) {
    console.error('Error formatting book data:', error)
    
    // 返回一个最小可用的书籍对象
    return {
      id: page?.id || 'unknown',
      title: page?.properties?.Title?.title?.[0]?.plain_text || 'Unknown Book',
      author: page?.properties?.Author?.rich_text?.[0]?.plain_text || 'Unknown Author',
      category: '其他',
      status: 'want-to-read',
      rating: 3,
      cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuaaguaXoOWbvueJhzwvdGV4dD4KPC9zdmc+',
      notes: notes || '',
      tags: [],
      language: '中文'
    }
  }
}