/**
 * Notion API integration for tools content management
 */

import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import type { Tool } from '../../types/tool'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// Initialize notion-to-markdown converter
const n2m = new NotionToMarkdown({ notionClient: notion })

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

/**
 * Validate required environment variables for Notion integration
 * @private
 * @returns {void}
 * @description Checks if necessary environment variables are set and logs warnings if missing
 */
function validateEnv(): void {
  if (!process.env.NOTION_TOKEN) {
    console.warn('NOTION_TOKEN environment variable is not set')
  }
  
  if (!process.env.NOTION_TOOLS_DB) {
    console.warn('NOTION_TOOLS_DB environment variable is not set')
  }
}

/**
 * Get all tools from Notion database
 * @async
 * @returns {Promise<Tool[]>} Array of published tools sorted by featured status and rating
 * @description Fetches all published tools from Notion database with caching support.
 * Falls back to empty array if environment variables are missing or if an error occurs.
 * @example
 * const tools = await getTools();
 * console.log(`Found ${tools.length} tools`);
 */
export async function getTools(): Promise<Tool[]> {
  validateEnv()
  
  const cacheKey = 'all_tools'
  const cached = cache.get(cacheKey)
  const ttl = parseInt(process.env.CACHE_TTL || '3600000') // 1 hour default
  
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }

  if (!process.env.NOTION_TOKEN || !process.env.NOTION_TOOLS_DB) {
    console.warn('Using fallback tools data due to missing environment variables')
    return []
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_TOOLS_DB,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'Featured',
          direction: 'descending',
        },
        {
          property: 'Rating',
          direction: 'descending',
        },
      ],
    })

    const tools = response.results.map(page => parseNotionTool(page as any))
    cache.set(cacheKey, { data: tools, timestamp: Date.now(), ttl })
    
    return tools
  } catch (error) {
    console.error('Error fetching tools:', error)
    return []
  }
}

/**
 * Get tools filtered by category
 * @async
 * @param {Tool['category']} category - The tool category to filter by ('development' | 'design' | 'productivity' | 'hardware' | 'service')
 * @returns {Promise<Tool[]>} Array of tools matching the specified category
 * @description Fetches all tools and filters them by the specified category
 * @example
 * const devTools = await getToolsByCategory('development');
 * console.log(`Found ${devTools.length} development tools`);
 */
export async function getToolsByCategory(category: Tool['category']): Promise<Tool[]> {
  const tools = await getTools()
  return tools.filter(tool => tool.category === category)
}

/**
 * Get a single tool by its URL slug
 * @async
 * @param {string} slug - The URL-friendly slug of the tool
 * @returns {Promise<Tool | null>} The tool object if found, null otherwise
 * @description Fetches a single tool from Notion by its slug, including full review content.
 * Uses caching to improve performance.
 * @example
 * const tool = await getToolBySlug('visual-studio-code');
 * if (tool) {
 *   console.log(`Found tool: ${tool.name}`);
 * }
 */
export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const cacheKey = `tool_${slug}`
  const cached = cache.get(cacheKey)
  const ttl = parseInt(process.env.CACHE_TTL || '3600000')
  
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }

  if (!process.env.NOTION_TOKEN || !process.env.NOTION_TOOLS_DB) {
    console.warn('Using fallback tool data due to missing environment variables')
    return null
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_TOOLS_DB,
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
    const tool = parseNotionTool(page)
    
    // Get page content for detailed review
    const mdblocks = await n2m.pageToMarkdown(page.id)
    const mdString = n2m.toMarkdownString(mdblocks)
    const review = await markdownToHtml(mdString.parent)
    
    const fullTool = {
      ...tool,
      review,
    }
    
    cache.set(cacheKey, { data: fullTool, timestamp: Date.now(), ttl })
    return fullTool
  } catch (error) {
    console.error(`Error fetching tool with slug ${slug}:`, error)
    return null
  }
}

/**
 * Get all tool slugs for static page generation
 * @async
 * @returns {Promise<string[]>} Array of tool slugs
 * @description Fetches all tool slugs for Next.js static generation (generateStaticParams).
 * Returns empty array on error.
 * @example
 * const slugs = await getAllToolSlugs();
 * // ['visual-studio-code', 'github-copilot', 'docker', ...]
 */
export async function getAllToolSlugs(): Promise<string[]> {
  try {
    const tools = await getTools()
    return tools.map(tool => tool.slug).filter(slug => slug && slug.length > 0)
  } catch (error) {
    console.error('Error fetching tool slugs:', error)
    return []
  }
}

/**
 * Parse a Notion page into a Tool object
 * @private
 * @param {any} page - The raw Notion page object
 * @returns {Tool} Parsed tool object
 * @description Converts Notion page properties into a structured Tool object.
 * Handles missing properties gracefully with default values.
 */
function parseNotionTool(page: any): Tool {
  const properties = page.properties
  
  return {
    id: page.id,
    name: getTextFromRichText(properties.Name?.title) || 'Untitled Tool',
    slug: getTextFromRichText(properties.Slug?.rich_text) || '',
    category: properties.Category?.select?.name?.toLowerCase() || 'development',
    description: getTextFromRichText(properties.Description?.rich_text) || '',
    rating: properties.Rating?.number || 3,
    price: properties.Price?.select?.name?.toLowerCase() || 'free',
    website: properties.Website?.url || '',
    pros: properties.Pros?.rich_text?.map((item: any) => item.text.content).filter(Boolean) || [],
    cons: properties.Cons?.rich_text?.map((item: any) => item.text.content).filter(Boolean) || [],
    useCases: properties.UseCases?.rich_text?.map((item: any) => item.text.content).filter(Boolean) || [],
    review: '', // Will be populated when fetching individual tool
    alternatives: properties.Alternatives?.rich_text?.map((item: any) => item.text.content).filter(Boolean) || [],
    tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
    featured: properties.Featured?.checkbox || false,
    lastUpdated: page.last_edited_time,
  }
}

/**
 * Extract text content from Notion rich text array
 * @private
 * @param {Array<{ text: { content: string } }> | undefined} richText - Notion rich text array
 * @returns {string} Concatenated text content
 * @description Safely extracts and concatenates text from Notion's rich text format.
 * Returns empty string if input is undefined or empty.
 */
function getTextFromRichText(richText: Array<{ text: { content: string } }> | undefined): string {
  if (!richText || richText.length === 0) return ''
  return richText.map(item => item.text.content).join('')
}

/**
 * Convert markdown content to HTML
 * @private
 * @async
 * @param {string} markdown - Markdown string to convert
 * @returns {Promise<string>} HTML string
 * @description Converts markdown to HTML using remark processor.
 * Returns error message HTML on conversion failure.
 * @example
 * const html = await markdownToHtml('# Hello World');
 * // '<h1>Hello World</h1>'
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
 * Clear all cached tools data
 * @returns {void}
 * @description Clears the in-memory cache for all tools data.
 * Useful for forcing fresh data fetch from Notion.
 * @example
 * // Clear cache before fetching updated data
 * clearToolsCache();
 * const freshTools = await getTools();
 */
export function clearToolsCache(): void {
  cache.clear()
}