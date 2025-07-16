/**
 * 书架系统错误类
 * @module lib/errors/bookshelf-errors
 */

/**
 * 书架系统基础错误类
 * @class BookshelfError
 * @extends Error
 * @description 书架系统中所有错误的基类
 */
export class BookshelfError extends Error {
  /**
   * @param {string} message - 错误消息
   * @param {string} [code] - 错误代码
   * @param {unknown} [cause] - 原始错误
   */
  constructor(
    message: string,
    public readonly code?: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'BookshelfError'
    Object.setPrototypeOf(this, BookshelfError.prototype)
  }
}

/**
 * Notion API 错误
 * @class NotionAPIError
 * @extends BookshelfError
 * @description Notion API 调用失败时抛出的错误
 */
export class NotionAPIError extends BookshelfError {
  constructor(message: string, cause?: unknown) {
    super(message, 'NOTION_API_ERROR', cause)
    this.name = 'NotionAPIError'
  }
}

/**
 * 数据验证错误
 * @class DataValidationError
 * @extends BookshelfError
 * @description 数据格式或内容不符合预期时抛出的错误
 */
export class DataValidationError extends BookshelfError {
  constructor(message: string, cause?: unknown) {
    super(message, 'DATA_VALIDATION_ERROR', cause)
    this.name = 'DataValidationError'
  }
}

/**
 * 资源未找到错误
 * @class ResourceNotFoundError
 * @extends BookshelfError
 * @description 请求的资源（如书籍）不存在时抛出的错误
 */
export class ResourceNotFoundError extends BookshelfError {
  constructor(
    message: string,
    public readonly resourceType: string,
    public readonly resourceId: string
  ) {
    super(message, 'RESOURCE_NOT_FOUND')
    this.name = 'ResourceNotFoundError'
  }
}

/**
 * 配置错误
 * @class ConfigurationError
 * @extends BookshelfError
 * @description 环境变量或配置缺失时抛出的错误
 */
export class ConfigurationError extends BookshelfError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR')
    this.name = 'ConfigurationError'
  }
}

/**
 * 错误处理工具函数
 * @function handleBookshelfError
 * @param {unknown} error - 捕获的错误
 * @param {string} context - 错误发生的上下文
 * @param {boolean} [useFallback=true] - 是否使用后备数据
 * @returns {never | void} 根据 useFallback 参数决定是否抛出错误
 * @description 统一处理书架系统中的错误，提供日志记录和错误转换功能
 */
export function handleBookshelfError(
  error: unknown,
  context: string,
  useFallback: boolean = true
): never | void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorDetails = {
    context,
    timestamp: new Date().toISOString(),
    error: error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : error
  }

  // 记录详细错误信息
  console.error(`[Bookshelf Error] ${context}:`, errorDetails)

  // 如果不使用后备数据，则抛出格式化的错误
  if (!useFallback) {
    if (error instanceof BookshelfError) {
      throw error
    }
    throw new BookshelfError(
      `Error in ${context}: ${errorMessage}`,
      'UNKNOWN_ERROR',
      error
    )
  }

  // 使用后备数据时，仅记录日志
  console.warn(`[Bookshelf] Using fallback data due to error in ${context}`)
}

/**
 * 数据验证辅助函数
 * @function validateBookData
 * @param {any} data - 需要验证的数据
 * @param {string} field - 字段名称
 * @returns {void}
 * @throws {DataValidationError} 当数据验证失败时
 * @description 验证书籍数据的必填字段
 */
export function validateBookData(data: any, field: string): void {
  if (!data || (typeof data === 'string' && data.trim() === '')) {
    throw new DataValidationError(`Missing required field: ${field}`)
  }
}