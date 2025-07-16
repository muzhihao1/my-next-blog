/**
 * 书架系统类型定义汇总
 * @module types/bookshelf
 * @description 提供书架系统所有类型的统一导出，简化导入路径和类型管理
 */

// 从基础类型文件导出
export type { Book } from './book'

// 书架系统特定类型定义
/**
 * 书籍筛选选项
 * @interface BookFilterOptions
 * @property {Book['status']} [status] - 阅读状态筛选
 * @property {string} [category] - 分类筛选
 * @property {number} [minRating] - 最低评分筛选
 * @property {string[]} [tags] - 标签筛选
 */
export interface BookFilterOptions {
  status?: 'reading' | 'read' | 'want-to-read'
  category?: string
  minRating?: number
  tags?: string[]
}

/**
 * 书籍排序选项
 * @type {BookSortOption}
 */
export type BookSortOption = 'date' | 'rating' | 'title' | 'author'

/**
 * 书籍统计信息
 * @interface BookStats
 * @property {number} total - 总书籍数
 * @property {number} read - 已读数量
 * @property {number} reading - 在读数量
 * @property {number} wantToRead - 想读数量
 * @property {number} avgRating - 平均评分
 */
export interface BookStats {
  total: number
  read: number
  reading: number
  wantToRead: number
  avgRating: number
}

/**
 * 书架视图模式
 * @type {BookshelfView}
 */
export type BookshelfView = 'grid' | 'list'

/**
 * 书籍分页参数
 * @interface BookPaginationParams
 * @property {number} page - 当前页码
 * @property {number} limit - 每页数量
 * @property {number} total - 总数量
 */
export interface BookPaginationParams {
  page: number
  limit: number
  total: number
}

/**
 * Notion 书籍属性原始类型
 * @interface NotionBookProperties
 * @description Notion API 返回的原始书籍属性类型
 */
export interface NotionBookProperties {
  Title?: { title: Array<{ plain_text: string }> }
  Author?: { rich_text: Array<{ plain_text: string }> }
  ISBN?: { rich_text: Array<{ plain_text: string }> }
  Category?: { select: { name: string } | null }
  Status?: { select: { name: string } | null }
  Rating?: { number: number | null }
  StartDate?: { date: { start: string } | null }
  FinishDate?: { date: { start: string } | null }
  Cover?: { 
    files: Array<{ 
      type: 'external' | 'file'
      external?: { url: string }
      file?: { url: string }
    }> 
  }
  Takeaways?: { rich_text: Array<{ plain_text: string }> }
  Tags?: { multi_select: Array<{ name: string }> }
  PublishYear?: { number: number | null }
  Pages?: { number: number | null }
  Language?: { select: { name: string } | null }
}

// 书架系统错误类型导出
export { 
  BookshelfError, 
  NotionAPIError, 
  DataValidationError, 
  ResourceNotFoundError, 
  ConfigurationError, 
  handleBookshelfError, 
  validateBookData 
} from '@/lib/errors/bookshelf-errors'

// 类型守卫函数
/**
 * 检查对象是否为有效的 Book 类型
 * @function isValidBook
 * @param {any} obj - 待检查的对象
 * @returns {obj is Book} 返回类型守卫结果
 */
export function isValidBook(obj: any): obj is import('./book').Book {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.author === 'string' &&
    ['reading', 'read', 'want-to-read'].includes(obj.status) &&
    [1, 2, 3, 4, 5].includes(obj.rating)
  )
}

/**
 * 检查字符串是否为有效的书籍状态
 * @function isValidBookStatus
 * @param {string} status - 待检查的状态字符串
 * @returns {status is Book['status']} 返回类型守卫结果
 */
export function isValidBookStatus(status: string): status is import('./book').Book['status'] {
  return ['reading', 'read', 'want-to-read'].includes(status)
}

/**
 * 检查数字是否为有效的书籍评分
 * @function isValidRating
 * @param {any} rating - 待检查的评分值
 * @returns {rating is number} 返回类型守卫结果
 * @description 有效的评分范围是 1-5 的整数
 */
export function isValidRating(rating: any): rating is number {
  return typeof rating === 'number' && [1, 2, 3, 4, 5].includes(rating)
}