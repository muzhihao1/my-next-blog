import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
// import { cache } from 'react' // React 19 cache API 可能有兼容性问题
import { Project } from '@/types/project'
import { withRetry } from '@/lib/utils/retry'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const n2m = new NotionToMarkdown({ notionClient: notion })

const projectsDatabaseId = process.env.NOTION_PROJECTS_DB || ''

async function _getProjects(): Promise<Project[]> {
  if (!projectsDatabaseId) {
    console.warn('NOTION_PROJECTS_DB is not configured')
    return []
  }

  try {
    // 首先尝试获取数据库架构以确定可用字段
    let sortOptions: any[] = []
    
    try {
      // 尝试使用 Featured 字段排序
      sortOptions = [
        { property: 'Featured', direction: 'descending' },
        { property: 'StartDate', direction: 'descending' }
      ]
    }
    catch (sortError) {
      console.warn('Featured field not available, using fallback sorting')
      // 如果 Featured 字段不存在，使用 StartDate 排序
      sortOptions = [
        { property: 'StartDate', direction: 'descending' }
      ]
    }

    let response
    try {
      response = await withRetry(
        () => notion.databases.query({
          database_id: projectsDatabaseId,
          filter: {
            property: 'Status',
            select: {
              does_not_equal: 'Draft'
            }
          },
          sorts: sortOptions
        }),
        {
          maxRetries: 3,
          retryableErrors: (error) => {
            return error.status === 429 || error.status >= 500 || error.code === 'ECONNRESET'
          }
        }
      )
    }
    catch (error: any) {
      // 如果包含 Featured 字段的排序失败，尝试不使用 Featured 字段
      if (error.message?.includes('Featured') || error.code === 'validation_error') {
        console.warn('Featured property not found, using simplified sorting')
        response = await withRetry(
          () => notion.databases.query({
            database_id: projectsDatabaseId,
            filter: {
              property: 'Status',
              select: {
                does_not_equal: 'Draft'
              }
            },
            sorts: [
              { property: 'StartDate', direction: 'descending' }
            ]
          }),
          { maxRetries: 3 }
        )
      }
      else {
        throw error
      }
    }

    const projects = await Promise.all(
      response.results.map(async (page: any) => {
        const mdblocks = await withRetry(
          () => n2m.pageToMarkdown(page.id),
          { maxRetries: 2 }
        )
        const mdString = n2m.toMarkdownString(mdblocks)
        return formatProject(page, mdString.parent)
      })
    )

    // 如果有 featured 字段，在客户端进行排序以确保正确性
    return projects.sort((a, b) => {
      // 首先按 featured 状态排序
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      // 然后按开始日期排序
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    })
  }
  catch (error) {
    console.error('Failed to fetch projects from Notion:', error)
    return []
  }
}

export const getProjects = _getProjects // TODO: 重新启用 cache

async function _getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects()
  return projects.find(project => project.slug === slug) || null
}

export const getProjectBySlug = _getProjectBySlug // TODO: 重新启用 cache

async function _getFeaturedProjects(): Promise<Project[]> {
  const projects = await getProjects()
  return projects.filter(project => project.featured).slice(0, 3)
}

export const getFeaturedProjects = _getFeaturedProjects // TODO: 重新启用 cache

function formatProject(page: any, content: string): Project {
  const properties = page.properties

  // 安全获取属性的辅助函数
  const getTextProperty = (prop: any): string => {
    if (!prop) return ''
    if (prop.title?.[0]?.plain_text) return prop.title[0].plain_text
    if (prop.rich_text?.[0]?.plain_text) return prop.rich_text[0].plain_text
    return ''
  }

  const getSelectProperty = (prop: any): string => {
    return prop?.select?.name || ''
  }

  const getCategoryProperty = (prop: any): 'website' | 'opensource' | 'design' | 'other' => {
    const value = prop?.select?.name?.toLowerCase()
    if (value === 'website' || value === 'opensource' || value === 'design') {
      return value
    }
    return 'other'
  }

  const getStatusProperty = (prop: any): 'active' | 'completed' | 'archived' => {
    const value = prop?.select?.name?.toLowerCase()
    if (value === 'active' || value === 'completed' || value === 'archived') {
      return value
    }
    return 'active'
  }

  const getCheckboxProperty = (prop: any): boolean => {
    return prop?.checkbox || false
  }

  const getMultiSelectProperty = (prop: any): string[] => {
    return prop?.multi_select?.map((tag: any) => tag.name) || []
  }

  const getUrlProperty = (prop: any): string | undefined => {
    return prop?.url || undefined
  }

  const getDateProperty = (prop: any): string => {
    return prop?.date?.start || new Date().toISOString()
  }

  const getNumberProperty = (prop: any): number | undefined => {
    return prop?.number || undefined
  }

  const getFilesProperty = (prop: any): string[] => {
    if (!prop?.files) return []
    return prop.files.map((file: any) => 
      file.type === 'external' ? file.external.url : file.file.url
    ).filter(Boolean)
  }

  // 处理技术栈
  const techStack = getMultiSelectProperty(properties.TechStack)
  
  // 处理标签
  const tags = getMultiSelectProperty(properties.Tags)
  
  // 处理截图
  const screenshots = getFilesProperty(properties.Screenshots)
  
  // 处理缩略图 - 使用动态生成的SVG作为占位图
  const thumbnailFiles = getFilesProperty(properties.Thumbnail)
  const projectTitle = getTextProperty(properties.Title) || 'Project'
  const categoryColor = {
    website: '#3B82F6',
    opensource: '#10B981',
    design: '#8B5CF6',
    other: '#6B7280'
  }
  const color = categoryColor[getCategoryProperty(properties.Category)] || categoryColor.other
  
  // 生成动态SVG占位图
  const defaultThumbnail = `data:image/svg+xml,${encodeURIComponent(`
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="${color}"/>
      <text x="400" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${projectTitle}</text>
      <text x="400" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="white" opacity="0.8" text-anchor="middle" dominant-baseline="middle">项目图片</text>
    </svg>
  `)}`
  
  const thumbnail = thumbnailFiles[0] || defaultThumbnail
  
  // 处理metrics - 更安全的方式
  const metrics: Project['metrics'] = {}
  const usersNumber = getNumberProperty(properties.Users)
  if (usersNumber !== undefined) {
    metrics.users = usersNumber
  }
  const performanceText = getTextProperty(properties.Performance)
  if (performanceText) {
    metrics.performance = performanceText
  }
  const achievementText = getTextProperty(properties.Achievement)
  if (achievementText) {
    metrics.achievement = achievementText
  }

  return {
    id: page.id,
    title: getTextProperty(properties.Title) || 'Untitled',
    slug: getTextProperty(properties.Slug) || page.id,
    description: getTextProperty(properties.Description) || '',
    category: getCategoryProperty(properties.Category),
    status: getStatusProperty(properties.Status),
    featured: getCheckboxProperty(properties.Featured),
    techStack,
    tags,
    thumbnail,
    screenshots,
    demoUrl: getUrlProperty(properties.DemoUrl),
    githubUrl: getUrlProperty(properties.GithubUrl),
    content,
    startDate: getDateProperty(properties.StartDate),
    endDate: properties.EndDate?.date?.start,
    lastUpdated: page.last_edited_time,
    metrics: Object.keys(metrics).length > 0 ? metrics : undefined
  }
}