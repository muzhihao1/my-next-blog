/**
 * 标签系统类型定义
 * @module types/tag
 * @description 定义标签系统的核心类型和接口
 */

/**
 * 标签基础信息
 * @interface Tag
 * @property {string} id - 标签唯一标识符
 * @property {string} name - 标签名称
 * @property {string} slug - URL友好的标签标识
 * @property {string} [description] - 标签描述（可选）
 * @property {string} [color] - 标签颜色（可选，十六进制颜色值）
 * @property {number} count - 使用该标签的内容数量
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  count: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 标签创建输入
 * @interface TagInput
 * @property {string} name - 标签名称
 * @property {string} [description] - 标签描述（可选）
 * @property {string} [color] - 标签颜色（可选）
 */
export interface TagInput {
  name: string
  description?: string
  color?: string
}

/**
 * 标签云项目
 * @interface TagCloudItem
 * @property {string} name - 标签名称
 * @property {string} slug - 标签标识
 * @property {number} count - 使用次数
 * @property {number} weight - 权重（用于调整显示大小）
 */
export interface TagCloudItem {
  name: string
  slug: string
  count: number
  weight: number
}

/**
 * 标签关联类型
 * @enum {string}
 */
export enum TaggedContentType {
  POST = 'post',
  PROJECT = 'project',
  BOOK = 'book',
  TOOL = 'tool'
}

/**
 * 标签关联内容
 * @interface TaggedContent
 * @property {string} id - 内容ID
 * @property {TaggedContentType} type - 内容类型
 * @property {string} title - 内容标题
 * @property {string} [slug] - 内容URL标识
 * @property {Date} createdAt - 创建时间
 */
export interface TaggedContent {
  id: string
  type: TaggedContentType
  title: string
  slug?: string
  createdAt: Date
}

/**
 * 标签分组
 * @interface TagGroup
 * @property {string} name - 分组名称
 * @property {Tag[]} tags - 该分组下的标签列表
 * @property {number} totalCount - 分组内容总数
 */
export interface TagGroup {
  name: string
  tags: Tag[]
  totalCount: number
}

/**
 * 标签统计信息
 * @interface TagStats
 * @property {number} totalTags - 标签总数
 * @property {number} totalTaggedContent - 已标记内容总数
 * @property {Record<TaggedContentType, number>} contentByType - 各类型内容数量
 * @property {Tag[]} mostUsedTags - 最常用的标签
 * @property {Tag[]} recentTags - 最近创建的标签
 */
export interface TagStats {
  totalTags: number
  totalTaggedContent: number
  contentByType: Record<TaggedContentType, number>
  mostUsedTags: Tag[]
  recentTags: Tag[]
}

/**
 * 标签筛选选项
 * @interface TagFilterOptions
 * @property {TaggedContentType} [type] - 按内容类型筛选
 * @property {string} [search] - 搜索关键词
 * @property {number} [minCount] - 最小使用次数
 * @property {'name' | 'count' | 'createdAt'} [sortBy] - 排序字段
 * @property {'asc' | 'desc'} [sortOrder] - 排序方向
 */
export interface TagFilterOptions {
  type?: TaggedContentType
  search?: string
  minCount?: number
  sortBy?: 'name' | 'count' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

/**
 * 将标签名称转换为URL友好的slug
 * @function createTagSlug
 * @param {string} name - 标签名称
 * @returns {string} URL友好的标签标识
 */
export function createTagSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * 检查是否为有效的标签名称
 * @function isValidTagName
 * @param {string} name - 标签名称
 * @returns {boolean} 是否有效
 */
export function isValidTagName(name: string): boolean {
  return (
    typeof name === 'string' &&
    name.trim().length > 0 &&
    name.length <= 50 &&
    !/[<>\"'&]/.test(name)
  )
}

/**
 * 标签颜色预设
 * @constant TAG_COLORS
 */
export const TAG_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16'  // lime
] as const

/**
 * 获取标签的默认颜色
 * @function getTagColor
 * @param {string} tagId - 标签ID或名称
 * @returns {string} 颜色值
 */
export function getTagColor(tagId: string): string {
  const hash = tagId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}