/**
 * Notion API integration for blog content management
 */
import { Client } from '@notionhq/client'

import { NotionToMarkdown } from 'notion-to-md'

import { remark } from 'remark'

import remarkHtml from 'remark-html'
// import { cache } from 'react' // React 19 cache API 可能有兼容性问题
import type { BlogPost, NotionPage, CacheItem } from '../types/notion'
import { NotionError } from '../types/notion'

import { withRetry } from './utils/retry'
import { CacheManager } from './utils/cache-manager'
import { getNotionEnvId } from './utils/notion-helpers'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// Initialize notion-to-markdown converter
const n2m = new NotionToMarkdown({ notionClient: notion })

// Initialize cache manager with optimized settings
const cache = new CacheManager(
  100 * 1024 * 1024, // 100MB max size
  parseInt(process.env.CACHE_TTL || '3600000'), // 1 hour TTL
  500 // max 500 entries
)

/**
 * Validate environment variables
 */
function validateEnv() {
  if (!process.env.NOTION_TOKEN) {
    throw new Error('NOTION_TOKEN environment variable is required')
  }
  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error('NOTION_DATABASE_ID environment variable is required')
  }
}

/**
 * Internal function to fetch published posts with retry logic
 */
async function _fetchPublishedPosts(): Promise<BlogPost[]> {
  // 检查环境变量，如果缺失则返回空数组（让调用方使用 fallback）
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.warn('Notion environment variables not configured, returning empty array')
    return []
  }
  
  const cacheKey = 'published_posts'
  const cached = cache.get<BlogPost[]>(cacheKey)
  if (cached) {
    return cached
  }
  
  try {
    const databaseId = getNotionEnvId('NOTION_DATABASE_ID')
    if (!databaseId) {
      throw new NotionError('NOTION_DATABASE_ID is not configured', 'CONFIG_ERROR')
    }
    
    const response = await withRetry(
      () => notion.databases.query({
        database_id: databaseId,
        filter: {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        sorts: [
          {
            property: 'Date',
            direction: 'descending',
          },
        ],
      }),
      {
        maxRetries: 3,
        retryableErrors: (error) => {
          // Retry on rate limits or server errors
          return error.status === 429 || error.status >= 500 || error.code === 'ECONNRESET'
        }
      }
    )
    
    const posts = response.results.map(page => parseNotionPage(page as any))
    
    // 基于标题去重，保留第一次出现的文章
    const uniquePosts = posts.reduce((acc: BlogPost[], post) => {
      const isDuplicate = acc.some(existingPost => existingPost.title === post.title)
      if (!isDuplicate) {
        acc.push(post)
      }
      return acc
    }, [])
    
    cache.set(cacheKey, uniquePosts)
    return uniquePosts
  } catch (error) {
    console.error('Error fetching published posts:', error)
    throw new NotionError('Failed to fetch published posts', 'FETCH_POSTS_ERROR')
  }
}

/**
 * Get all published blog posts from Notion
 * TODO: 重新启用 React cache 当兼容性问题解决后
 */
export const getPublishedPosts = _fetchPublishedPosts

/**
 * Internal function to fetch a single blog post by slug with retry logic
 */
async function _fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  // 检查环境变量，如果缺失则返回 null（让调用方使用 fallback）
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.warn('Notion environment variables not configured, returning null')
    return null
  }
  
  const cacheKey = `post_${slug}`
  const cached = cache.get<BlogPost>(cacheKey)
  if (cached) {
    return cached
  }
  
  try {
    const databaseId = getNotionEnvId('NOTION_DATABASE_ID')
    if (!databaseId) {
      throw new NotionError('NOTION_DATABASE_ID is not configured', 'CONFIG_ERROR')
    }
    
    const response = await withRetry(
      () => notion.databases.query({
        database_id: databaseId,
        filter: {
          and: [
            {
              property: 'Slug',
              rich_text: {
                equals: slug,
              },
            },
            {
              property: 'Published',
              checkbox: {
                equals: true,
              },
            },
          ],
        },
      }),
      {
        maxRetries: 3,
        retryableErrors: (error) => {
          return error.status === 429 || error.status >= 500 || error.code === 'ECONNRESET'
        }
      }
    )
    
    if (response.results.length === 0) {
      return null
    }
    
    const page = response.results[0] as any
    const post = parseNotionPage(page)
    
    // Get page content with retry
    const mdblocks = await withRetry(
      () => n2m.pageToMarkdown(page.id),
      { maxRetries: 2 }
    )
    const mdString = n2m.toMarkdownString(mdblocks)
    const content = await markdownToHtml(mdString.parent)
    
    const fullPost = {
      ...post,
      content,
    }
    
    cache.set(cacheKey, fullPost)
    return fullPost
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error)
    throw new NotionError(`Failed to fetch post: ${slug}`, 'FETCH_POST_ERROR')
  }
}

/**
 * Get a single blog post by slug
 * TODO: 重新启用 React cache 当兼容性问题解决后
 */
export const getPostBySlug = _fetchPostBySlug

/**
 * Internal function to get all post slugs
 */
async function _getAllPostSlugs(): Promise<string[]> {
  try {
    const posts = await getPublishedPosts()
    return posts.map(post => post.slug).filter(slug => slug && slug.length > 0)
  } catch (error) {
    console.error('Error fetching post slugs:', error)
    return []
  }
}

/**
 * Get all post slugs for static generation with React cache
 */
export const getAllPostSlugs = _getAllPostSlugs

/**
 * Alias for getPublishedPosts for compatibility
 */
export const getAllPosts = getPublishedPosts

/**
 * Alias for getPublishedPosts for compatibility
 */
export const getPosts = getPublishedPosts

/**
 * Parse a Notion page into a BlogPost object
 */
function parseNotionPage(page: NotionPage): BlogPost {
  const properties = page.properties
  
  return {
    id: page.id,
    title: getTextFromRichText(properties.Title?.title) || 'Untitled',
    slug: getTextFromRichText(properties.Slug?.rich_text) || '',
    excerpt: getTextFromRichText(properties.Excerpt?.rich_text) || '',
    date: properties.Date?.date?.start || new Date().toISOString().split('T')[0],
    readTime: getTextFromRichText(properties.ReadTime?.rich_text) || '5 min read',
    category: properties.Category?.select?.name || 'Technology',
    author: {
      name: getTextFromRichText(properties.AuthorName?.rich_text) || 'Zhihao Mu',
      avatar: properties.AuthorAvatar?.url || '/images/default-avatar.svg',
    },
    cover: page.cover?.external?.url || page.cover?.file?.url,
    tags: properties.Tags?.multi_select?.map(tag => tag.name) || [],
    published: properties.Published?.checkbox || false,
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
  }
}

/**
 * Extract text content from Notion rich text array
 */
function getTextFromRichText(richText: Array<{ text: { content: string } }> | undefined): string {
  if (!richText || richText.length === 0) return ''
  return richText.map(item => item.text.content).join('')
}

/**
 * Convert markdown to HTML
 */
async function markdownToHtml(markdown: string): Promise<string> {
  try {
    const result = await remark()
      .use(remarkHtml, { sanitize: false })
      .process(markdown)
    return result.toString()
  } catch (error) {
    console.error('Error converting markdown to HTML:', error)
    return `<p>Error processing content</p>`
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Error handling with fallback
 */
export async function withFallback<T>(
  notionCall: () => Promise<T>,
  fallback: T,
  errorMessage = 'Notion API call failed'
): Promise<T> {
  try {
    return await notionCall()
  } catch (error) {
    console.error(errorMessage, error)
    return fallback
  }
}