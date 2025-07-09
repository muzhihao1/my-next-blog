/**
 * Algolia 客户端配置
 * 提供搜索和索引管理功能
 */

import { algoliasearch, type SearchClient } from 'algoliasearch'

// 环境变量验证
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'posts'

/**
 * 创建搜索客户端（只读）
 * 用于前端搜索功能
 */
let hasLoggedWarning = false

export function getSearchClient(): SearchClient | null {
  if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_KEY) {
    if (!hasLoggedWarning && typeof window !== 'undefined') {
      console.info('Algolia search not configured - search functionality disabled')
      hasLoggedWarning = true
    }
    return null
  }

  return algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)
}

/**
 * 创建管理客户端（读写）
 * 用于索引管理和数据同步
 */
export function getAdminClient(): SearchClient | null {
  if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
    // Admin client warnings are less important for end users
    return null
  }

  return algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)
}

/**
 * 获取索引名称
 */
export function getIndexName(): string {
  return ALGOLIA_INDEX_NAME
}

/**
 * Algolia 记录类型定义
 */
export interface AlgoliaRecord {
  objectID: string
  type: 'post' | 'project' | 'book' | 'tool'
  title: string
  content: string
  description?: string
  author?: string
  date?: string
  tags?: string[]
  url: string
  image?: string
  excerpt?: string
  // 用于分面搜索
  _tags?: string[]
  _type?: string
  // 搜索优先级
  searchPriority?: number
}

/**
 * 搜索参数类型
 */
export interface SearchParams {
  query: string
  filters?: string
  facets?: string[]
  hitsPerPage?: number
  page?: number
}

/**
 * 搜索结果类型
 */
export interface SearchResult {
  hits: AlgoliaRecord[]
  nbHits: number
  page: number
  nbPages: number
  hitsPerPage: number
  processingTimeMS: number
  query: string
  facets?: Record<string, Record<string, number>>
}

/**
 * 检查 Algolia 是否已配置
 */
export function isAlgoliaConfigured(): boolean {
  return !!(ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY)
}

/**
 * 获取 Algolia 配置信息（用于调试）
 */
export function getAlgoliaConfig() {
  return {
    appId: ALGOLIA_APP_ID,
    indexName: ALGOLIA_INDEX_NAME,
    isConfigured: isAlgoliaConfigured(),
    hasAdminKey: !!ALGOLIA_ADMIN_KEY
  }
}