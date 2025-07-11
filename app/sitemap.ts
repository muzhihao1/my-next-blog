import { MetadataRoute }
from 'next' 

import { getAllPostSlugs }
from '@/lib/notion' 

import { getProjects }
from '@/lib/notion/projects' 

import { getBooks }
from '@/lib/notion/books' 

import { getTools }
from '@/lib/notion/tools' 

import { fallbackPosts }
from '@/lib/fallback-posts' 

import { fallbackProjects }
from '@/lib/fallback-projects' 

import { fallbackBooks }
from '@/lib/fallback-books' 

import { fallbackTools } from '@/lib/fallback-tools'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  
  // Get all dynamic paths with fallback
  let postSlugs: string[] = []
  let projects = await getProjects()
  let books = await getBooks()
  let tools = await getTools()
  
  // Use fallback data if Notion data is not available
  try {
    postSlugs = await getAllPostSlugs()
  } catch {
    postSlugs = fallbackPosts.map(post => post.slug)
  }
  if (projects.length === 0) {
    projects = fallbackProjects
  }
  if (books.length === 0) {
    books = fallbackBooks
  }
  if (tools.length === 0) {
    tools = fallbackTools
  }
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bookshelf`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]
  
  // Dynamic pages - Posts
  const postPages = postSlugs.map((slug) => ({
    url: `${baseUrl}/posts/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  
  // Dynamic pages - Projects
  const projectPages = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  
  // Dynamic pages - Books
  const bookPages = books.map((book) => ({
    url: `${baseUrl}/bookshelf/${book.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))
  
  // Dynamic pages - Tools
  const toolPages = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))
  
  return [...staticPages, ...postPages, ...projectPages, ...bookPages, ...toolPages]
}