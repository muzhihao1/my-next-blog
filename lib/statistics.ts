/**
 * 数据统计模块
 * @module lib/statistics
 * @description 收集和计算博客各项数据统计
 */
import { getAllPosts } from './notion'
import { getProjects } from './notion/projects'
import { getBooks } from './notion/books'
import { getTools } from './notion/tools'
import { calculateWordCount } from './utils/content'

/**
 * 博客统计数据接口
 * @interface BlogStatistics
 */
export interface BlogStatistics {
  posts: {
    total: number
    categories: Record<string, number>
    tags: Record<string, number>
    totalWords: number
    averageWords: number
    totalReadingTime: number
    latestPost?: {
      title: string
      date: string
      slug: string
    }
  }
  projects: {
    total: number
    active: number
    completed: number
    categories: Record<string, number>
    technologies: Record<string, number>
  }
  books: {
    total: number
    read: number
    reading: number
    wantToRead: number
    categories: Record<string, number>
    averageRating: number
    totalPages: number
  }
  tools: {
    total: number
    categories: Record<string, number>
    featured: number
    averageRating: number
  }
  overall: {
    totalContent: number
    lastUpdated: string
  }
}

/**
 * 计算分钟阅读时间
 * @param {number}
 wordCount - 字数
 * @returns {number} 阅读时间（分钟）
 */
function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200 // 中文阅读速度约 200-300 字/分钟
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * 统计数组中各项出现的次数
 * @param {string[]} items - 待统计的项目数组
 * @returns {Record<string, number>} 统计结果
 */
function countOccurrences(items: string[]): Record<string, number> {
  return items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}
/**
 * 获取文章统计数据
 * @async
 * @returns {Promise<BlogStatistics['posts']>} 文章统计数据
 */
export async function getPostStatistics({
  limit = 10,
  period = 'all'
}: {
  limit?: number;
  period?: string
} = {}): Promise<BlogStatistics['posts']> {
  try {
    const posts = await getAllPosts()
    
    if (!posts || posts.length === 0) {
      return {
        total: 0,
        categories: {},
        tags: {},
        totalWords: 0,
        averageWords: 0,
        totalReadingTime: 0
      }
    }
    // 统计分类
    const categories = countOccurrences(posts.map(post => post.category).filter(Boolean))
    
    // 统计标签
    const allTags = posts.flatMap(post => post.tags || [])
    const tags = countOccurrences(allTags)
    
    // 统计字数和阅读时间
    let totalWords = 0
    let totalReadingTime = 0
    
    for (const post of posts) {
      if (post.content) {
        const wordCount = calculateWordCount(post.content)
        totalWords += wordCount
        totalReadingTime += calculateReadingTime(wordCount)
      }
    }
    const averageWords = posts.length > 0 ? Math.round(totalWords / posts.length) : 0
    
    // 获取最新文章
    const latestPost = posts[0] // 假设已按日期排序
    
    return {
      total: posts.length,
      categories,
      tags,
      totalWords,
      averageWords,
      totalReadingTime,
      latestPost: latestPost ? {
        title: latestPost.title,
        date: latestPost.date,
        slug: latestPost.slug
      } : undefined
    }
  }
  catch (error) {
    console.error('Error getting post statistics:', error)
    return {
      total: 0,
      categories: {},
      tags: {},
      totalWords: 0,
      averageWords: 0,
      totalReadingTime: 0
    }
  }
}
/**
 * 获取项目统计数据
 * @async
 * @returns {Promise<BlogStatistics['projects']>} 项目统计数据
 */
async function getProjectStatistics(): Promise<BlogStatistics['projects']> {
  try {
    const projects = await getProjects()
    
    if (!projects || projects.length === 0) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        categories: {},
        technologies: {}
      }
    }
    // 统计状态
    const active = projects.filter(p => p.status === 'active').length
    const completed = projects.filter(p => p.status === 'completed').length
    
    // 统计分类
    const categories = countOccurrences(projects.map(p => p.category))
    
    // 统计技术栈
    const allTechs = projects.flatMap(p => p.techStack)
    const technologies = countOccurrences(allTechs)
    
    return {
      total: projects.length,
      active,
      completed,
      categories,
      technologies
    }
  }
  catch (error) {
    console.error('Error getting project statistics:', error)
    return {
      total: 0,
      active: 0,
      completed: 0,
      categories: {},
      technologies: {}
    }
  }
}

/**
 * 获取书籍统计数据
 * @async
 * @returns {Promise<BlogStatistics['books']>} 书籍统计数据
 */
async function getBookStatistics(): Promise<BlogStatistics['books']> {
  try {
    const books = await getBooks()
    
    if (!books || books.length === 0) {
      return {
        total: 0,
        read: 0,
        reading: 0,
        wantToRead: 0,
        categories: {},
        averageRating: 0,
        totalPages: 0
      }
    }
    // 统计状态
    const read = books.filter(b => b.status === 'read').length
    const reading = books.filter(b => b.status === 'reading').length
    const wantToRead = books.filter(b => b.status === 'want-to-read').length
    
    // 统计分类
    const categories = countOccurrences(books.map(b => b.category))
    
    // 计算平均评分
    const readBooks = books.filter(b => b.status === 'read' && b.rating)
    const totalRating = readBooks.reduce((sum, b) => sum + b.rating, 0)
    const averageRating = readBooks.length > 0 ? totalRating / readBooks.length : 0
    
    // 统计总页数
    const totalPages = books
      .filter(b => b.pages)
      .reduce((sum, b) => sum + (b.pages || 0), 0)
      
    return {
      total: books.length,
      read,
      reading,
      wantToRead,
      categories,
      averageRating: Number(averageRating.toFixed(1)),
      totalPages
    }
  }
  catch (error) {
    console.error('Error getting book statistics:', error)
    return {
      total: 0,
      read: 0,
      reading: 0,
      wantToRead: 0,
      categories: {},
      averageRating: 0,
      totalPages: 0
    }
  }
}
/**
 * 获取工具统计数据
 * @async
 * @returns {Promise<BlogStatistics['tools']>} 工具统计数据
 */
async function getToolStatistics(): Promise<BlogStatistics['tools']> {
  try {
    const tools = await getTools()
    
    if (!tools || tools.length === 0) {
      return {
        total: 0,
        categories: {},
        featured: 0,
        averageRating: 0
      }
    }
    // 统计分类
    const categories = countOccurrences(tools.map(t => t.category))
    
    // 统计精选
    const featured = tools.filter(t => t.featured).length
    
    // 计算平均评分
    const totalRating = tools.reduce((sum, t) => sum + t.rating, 0)
    const averageRating = tools.length > 0 ? totalRating / tools.length : 0
    
    return {
      total: tools.length,
      categories,
      featured,
      averageRating: Number(averageRating.toFixed(1))
    }
  }
  catch (error) {
    console.error('Error getting tool statistics:', error)
    return {
      total: 0,
      categories: {},
      featured: 0,
      averageRating: 0
    }
  }
}
/**
 * 获取博客完整统计数据
 * @async
 * @returns {Promise<BlogStatistics>} 完整的统计数据
 */
export async function getBlogStatistics(): Promise<BlogStatistics> {
  const [posts, projects, books, tools] = await Promise.all([
    getPostStatistics(),
    getProjectStatistics(),
    getBookStatistics(),
    getToolStatistics()
  ])
  
  const totalContent = posts.total + projects.total + books.total + tools.total
  
  return {
    posts,
    projects,
    books,
    tools,
    overall: {
      totalContent,
      lastUpdated: new Date().toISOString()
    }
  }
}
/**
 * 获取缓存的统计数据
 * @async
 * @returns {Promise<BlogStatistics>} 统计数据
 * @description 带有简单内存缓存的统计数据获取
 */
let cachedStats: BlogStatistics | null = null
let cacheTime: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1小时缓存

export async function getCachedStatistics(): Promise<BlogStatistics> {
  const now = Date.now()
  if (cachedStats && (now - cacheTime) < CACHE_DURATION) {
    return cachedStats
  }
  
  cachedStats = await getBlogStatistics()
  cacheTime = now
  return cachedStats
}
/**
 * 清除统计缓存
 */
export function clearStatisticsCache(): void {
  cachedStats = null
  cacheTime = 0
}
/**
 * 获取网站统计数据（包含所有类型内容的汇总）
 * @async
 * @param {Object} options - 选项
 * @param {number} options.limit - 返回的最大项目数
 * @param {string} options.period - 时间段筛选
 * @returns {Promise<Object>} 网站统计数据
 */
export async function getSiteStatistics({ limit = 10, period = 'all' }: { limit?: number; period?: string } = {}) {
  const stats = await getCachedStatistics()
  
  // 获取最受欢迎的文章（按假定的浏览量排序）
  const posts = await getAllPosts()
  const popularPosts = posts
    .slice(0, limit)
    .map(post => ({
      title: post.title,
      slug: post.slug,
      views: Math.floor(Math.random() * 1000) + 100, // 模拟浏览量数据
      date: post.date
    }))
    
  // 标签分布
  const tagDistribution = Object.entries(stats.posts.tags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .reduce((acc, [tag, count]) => {
      acc[tag] = count
      return acc
    }, {} as Record<string, number>)
    
  // 根据时间段筛选数据
  let filteredPosts = posts
  if (period !== 'all') {
    const now = new Date()
    const startDate = new Date()
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }
    filteredPosts = posts.filter(post => new Date(post.date) >= startDate)
  }
  
  return {
    totalPosts: filteredPosts.length,
    totalViews: filteredPosts.length * 500, // 模拟总浏览量
    totalTags: Object.keys(stats.posts.tags).length,
    popularPosts,
    tagDistribution,
    viewsTrend: {
      period,
      data: generateViewsTrend(period)
    },
    ...stats
  }
}

/**
 * 生成浏览量趋势数据
 * @param {string} period - 时间段
 * @returns {Array} 趋势数据
 */
function generateViewsTrend(period: string) {
  const dataPoints = period === 'day' ? 24 : period === 'week' ? 7 : period === 'month' ? 30 : 12
  const trend = []
  
  for (let i = 0; i < dataPoints; i++) {
    trend.push({
      label: period === 'day' ? `${i}:00` : period === 'week' ? `Day ${i + 1}` : period === 'month' ? `${i + 1}` : `Month ${i + 1}`,
      views: Math.floor(Math.random() * 500) + 100
    })
  }
  
  return trend
}