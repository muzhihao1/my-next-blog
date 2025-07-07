/**
 * Notion API integration for blog content management
 */

import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import type { 
  BlogPost, 
  NotionPage, 
  CacheItem 
} from '../types/notion'
import { NotionError } from '../types/notion'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// Initialize notion-to-markdown converter
const n2m = new NotionToMarkdown({ notionClient: notion })

// Simple in-memory cache
class NotionCache {
  private cache = new Map<string, CacheItem<any>>()
  
  set<T>(key: string, data: T, ttl = parseInt(process.env.CACHE_TTL || '300000')) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear() {
    this.cache.clear()
  }
}

const cache = new NotionCache()

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
 * Get all published blog posts from Notion
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
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
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
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
    })

    const posts = response.results.map(page => parseNotionPage(page as any))
    cache.set(cacheKey, posts)
    
    return posts
  } catch (error) {
    console.error('Error fetching published posts:', error)
    throw new NotionError('Failed to fetch published posts', 'FETCH_POSTS_ERROR')
  }
}

/**
 * Get a single blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
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
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
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
    })

    if (response.results.length === 0) {
      return null
    }

    const page = response.results[0] as any
    const post = parseNotionPage(page)
    
    // Get page content
    const mdblocks = await n2m.pageToMarkdown(page.id)
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
 * Get all post slugs for static generation
 */
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const posts = await getPublishedPosts()
    return posts.map(post => post.slug).filter(slug => slug && slug.length > 0)
  } catch (error) {
    console.error('Error fetching post slugs:', error)
    return []
  }
}

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
      avatar: properties.AuthorAvatar?.url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
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