import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { Project } from '@/types/project'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const n2m = new NotionToMarkdown({ notionClient: notion })

const projectsDatabaseId = process.env.NOTION_PROJECTS_DB || ''

export async function getProjects(): Promise<Project[]> {
  if (!projectsDatabaseId) {
    console.warn('NOTION_PROJECTS_DB is not configured')
    return []
  }

  try {
    const response = await notion.databases.query({
      database_id: projectsDatabaseId,
      filter: {
        property: 'Status',
        select: {
          does_not_equal: 'Draft'
        }
      },
      sorts: [{
        property: 'Featured',
        direction: 'descending'
      }, {
        property: 'StartDate',
        direction: 'descending'
      }]
    })

    const projects = await Promise.all(
      response.results.map(async (page: any) => {
        const mdblocks = await n2m.pageToMarkdown(page.id)
        const mdString = n2m.toMarkdownString(mdblocks)
        
        return formatProject(page, mdString.parent)
      })
    )

    return projects
  } catch (error) {
    console.error('Failed to fetch projects from Notion:', error)
    return []
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects()
  return projects.find(project => project.slug === slug) || null
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getProjects()
  return projects.filter(project => project.featured).slice(0, 3)
}

function formatProject(page: any, content: string): Project {
  const properties = page.properties

  // 处理技术栈
  const techStack = properties.TechStack?.multi_select?.map((tag: any) => tag.name) || []
  
  // 处理截图
  const screenshots = properties.Screenshots?.files?.map((file: any) => 
    file.type === 'external' ? file.external.url : file.file.url
  ) || []

  // 处理缩略图
  const thumbnail = properties.Thumbnail?.files?.[0]?.type === 'external' 
    ? properties.Thumbnail.files[0].external.url 
    : properties.Thumbnail?.files?.[0]?.file?.url || '/images/project-placeholder.jpg'

  // 处理metrics
  const metrics: Project['metrics'] = {}
  if (properties.Users?.number) {
    metrics.users = properties.Users.number
  }
  if (properties.Performance?.rich_text?.[0]?.plain_text) {
    metrics.performance = properties.Performance.rich_text[0].plain_text
  }
  if (properties.Achievement?.rich_text?.[0]?.plain_text) {
    metrics.achievement = properties.Achievement.rich_text[0].plain_text
  }

  return {
    id: page.id,
    title: properties.Title?.title?.[0]?.plain_text || 'Untitled',
    slug: properties.Slug?.rich_text?.[0]?.plain_text || page.id,
    description: properties.Description?.rich_text?.[0]?.plain_text || '',
    category: properties.Category?.select?.name?.toLowerCase() || 'other',
    status: properties.Status?.select?.name?.toLowerCase() || 'active',
    featured: properties.Featured?.checkbox || false,
    techStack,
    thumbnail,
    screenshots,
    demoUrl: properties.DemoUrl?.url,
    githubUrl: properties.GithubUrl?.url,
    content,
    startDate: properties.StartDate?.date?.start || new Date().toISOString(),
    endDate: properties.EndDate?.date?.start,
    lastUpdated: page.last_edited_time,
    metrics: Object.keys(metrics).length > 0 ? metrics : undefined
  }
}