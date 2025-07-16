/**
 * 年度统计数据模块
 * @module lib/statistics/year-statistics
 * @description 计算和生成年度总结所需的统计数据
 */
import { getAllPosts } from '../notion'
import { getProjects } from '../notion/projects'
import { getBooks } from '../notion/books'
import { calculateWordCount } from '../utils/content'

/**
 * 年度统计数据接口
 * @interface YearStatistics
 */
export interface YearStatistics {
  posts: {
    total: number
    totalWords: number
    averageWords: number
    monthlyDistribution: Record<string, number>
    topPosts: Array<{
      title: string
      slug: string
      date: string
      readingTime: number
    }>
    categories: Record<string, number>
    tags: Array<{ name: string; count: number }>
    writingStreak: {
      longest: number
      current: number
    }
  }
  projects: {
    total: number
    completed: number
    technologies: Array<{ name: string; count: number }>
  }
  books: {
    total: number
    completed: number
    totalPages: number
    topCategories: Array<{ name: string; count: number }>
  }
  highlights: {
    mostProductiveMonth: string
    totalCreations: number
    favoriteCategory: string
    milestone?: string
  }
}

/**
 * 获取指定年份的统计数据
 * @async
 * @param {number}
 year - 年份
 * @returns {Promise<YearStatistics>} 年度统计数据
 */
export async function getYearStatistics(year: number): Promise<YearStatistics> {
  const [posts, projects, books] = await Promise.all([
    getAllPosts(),
    getProjects(),
    getBooks()
  ])
  
  // 过滤当年的内容
  const yearPosts = posts.filter(post => 
    new Date(post.date).getFullYear() === year
  )
  const yearProjects = projects.filter(project => 
    new Date(project.startDate).getFullYear() === year
  )
  const yearBooks = books.filter(book => 
    book.finishDate && new Date(book.finishDate).getFullYear() === year
  )
  
  // 计算文章统计
  const postStats = calculatePostStatistics(yearPosts)
  
  // 计算项目统计
  const projectStats = calculateProjectStatistics(yearProjects)
  
  // 计算书籍统计
  const bookStats = calculateBookStatistics(yearBooks)
  
  // 计算亮点数据
  const highlights = calculateHighlights(postStats, projectStats, bookStats, year)
  
  return {
    posts: postStats,
    projects: projectStats,
    books: bookStats,
    highlights
  }
}

/**
 * 计算文章统计数据
 * @param {Array}
 posts - 文章列表
 * @returns {YearStatistics['posts']} 文章统计数据
 */
function calculatePostStatistics(posts: any[]): YearStatistics['posts'] {
  // 月度分布
  const monthlyDistribution: Record<string, number> = {}
  for (let i = 1; i <= 12; i++) {
    monthlyDistribution[i.toString()] = 0
  }
  
  // 分类统计
  const categories: Record<string, number> = {}
  
  // 标签统计
  const tagCounts: Record<string, number> = {}
  
  // 总字数和阅读时间
  let totalWords = 0
  const postDetails = posts.map(post => {
    const month = new Date(post.date).getMonth() + 1
    monthlyDistribution[month.toString()]++
    
    if (post.category) {
      categories[post.category] = (categories[post.category] || 0) + 1
    }
    
    if (post.tags) {
      post.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
    
    const wordCount = post.content ? calculateWordCount(post.content) : 0
    totalWords += wordCount
    
    const readingTime = Math.ceil(wordCount / 200)
    
    return {
      title: post.title,
      slug: post.slug,
      date: post.date,
      readingTime
    }
  })   
  // 按阅读时间排序获取热门文章
  const topPosts = postDetails
    .sort((a, b) => b.readingTime - a.readingTime)
    .slice(0, 5)
    
  // 计算写作连续性
  const writingStreak = calculateWritingStreak(posts)
  
  // 整理标签数据
  const tags = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    
  return {
    total: posts.length,
    totalWords,
    averageWords: posts.length > 0 ? Math.round(totalWords / posts.length) : 0,
    monthlyDistribution,
    topPosts,
    categories,
    tags,
    writingStreak
  }
}

/**
 * 计算项目统计数据
 * @param {Array}
 projects - 项目列表
 * @returns {YearStatistics['projects']} 项目统计数据
 */
function calculateProjectStatistics(projects: any[]): YearStatistics['projects'] {
  const techCounts: Record<string, number> = {}
  let completed = 0
  
  projects.forEach(project => {
    if (project.status === 'completed') {
      completed++
    }
    
    project.techStack?.forEach((tech: string) => {
      techCounts[tech] = (techCounts[tech] || 0) + 1
    })
  })
  
  const technologies = Object.entries(techCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    
  return {
    total: projects.length,
    completed,
    technologies
  }
}

/**
 * 计算书籍统计数据
 * @param {Array}
 books - 书籍列表
 * @returns {YearStatistics['books']} 书籍统计数据
 */
function calculateBookStatistics(books: any[]): YearStatistics['books'] {
  const categoryCounts: Record<string, number> = {}
  let totalPages = 0
  let completed = 0
  
  books.forEach(book => {
    if (book.status === 'read') {
      completed++
    }
    
    if (book.category) {
      categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1
    }
    
    if (book.pages) {
      totalPages += book.pages
    }
  })
  
  const topCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    
  return {
    total: books.length,
    completed,
    totalPages,
    topCategories
  }
}

/**
 * 计算写作连续性
 * @param {Array}
 posts - 文章列表
 * @returns {{ longest: number, current: number }} 连续写作天数
 */
function calculateWritingStreak(posts: any[]): { longest: number; current: number } {
  if (posts.length === 0) {
    return { longest: 0, current: 0 }
  }
  
  // 获取所有发布日期并排序
  const dates = posts
    .map(post => new Date(post.date).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    
  let longest = 1
  let current = 1
  let tempStreak = 1
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1])
    const currDate = new Date(dates[i])
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      tempStreak++
      longest = Math.max(longest, tempStreak)
    } else {
      tempStreak = 1
    }
  }
  
  // 检查当前连续性
  const today = new Date()
  const lastPostDate = new Date(dates[dates.length - 1])
  const daysSinceLastPost = Math.floor((today.getTime() - lastPostDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysSinceLastPost <= 1) {
    current = tempStreak
  } else {
    current = 0
  }
  
  return { longest, current }
}

/**
 * 计算年度亮点数据
 * @param {YearStatistics['posts']} postStats - 文章统计
 * @param {YearStatistics['projects']} projectStats - 项目统计
 * @param {YearStatistics['books']} bookStats - 书籍统计
 * @param {number} year - 年份
 * @returns {YearStatistics['highlights']} 亮点数据
 */
function calculateHighlights(
  postStats: YearStatistics['posts'],
  projectStats: YearStatistics['projects'],
  bookStats: YearStatistics['books'],
  year: number
): YearStatistics['highlights'] {
  // 找出最高产的月份
  let mostProductiveMonth = '1'
  let maxPosts = 0
  
  Object.entries(postStats.monthlyDistribution).forEach(([month, count]) => {
    if (count > maxPosts) {
      maxPosts = count
      mostProductiveMonth = month
    }
  })
  
  // 总创作数
  const totalCreations = postStats.total + projectStats.total + bookStats.total
  
  // 最喜欢的分类
  const favoriteCategory = Object.entries(postStats.categories)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '无'
    
  // 里程碑
  let milestone: string | undefined
  if (postStats.total >= 100) {
    milestone = `🎉 突破 ${postStats.total} 篇文章大关！`
  }
  else if (postStats.totalWords >= 100000) {
    milestone = `✍️ 累计创作超过 ${Math.floor(postStats.totalWords / 10000)} 万字！`
  }
  else if (bookStats.completed >= 50) {
    milestone = `📚 今年读完了 ${bookStats.completed} 本书！`
  }
  else if (projectStats.completed >= 10) {
    milestone = `🚀 完成了 ${projectStats.completed} 个项目！`
  }
  
  return {
    mostProductiveMonth,
    totalCreations,
    favoriteCategory,
    milestone
  }
}