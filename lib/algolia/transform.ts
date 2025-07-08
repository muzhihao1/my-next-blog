/**
 * Algolia 数据转换工具
 * 将 Notion 内容转换为 Algolia 记录格式
 */

import { Post } from '@/types/notion'
import { AlgoliaRecord } from './client'

/**
 * 截断文本内容
 * @param text 原始文本
 * @param maxLength 最大长度
 */
function truncateText(text: string, maxLength: number = 5000): string {
  if (text.length <= maxLength) return text
  
  // 在单词边界截断
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
}

/**
 * 清理和规范化文本
 * @param text 原始文本
 */
function cleanText(text: string): string {
  return text
    .replace(/\n{3,}/g, '\n\n') // 移除多余的换行
    .replace(/\s+/g, ' ') // 规范化空白字符
    .trim()
}

/**
 * 生成文章摘要
 * @param content 文章内容
 * @param maxLength 摘要最大长度
 */
function generateExcerpt(content: string, maxLength: number = 200): string {
  const cleaned = cleanText(content)
  
  // 移除 Markdown 语法
  const plainText = cleaned
    .replace(/#{1,6}\s+/g, '') // 移除标题
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接
    .replace(/[*_~`]/g, '') // 移除格式化字符
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`[^`]+`/g, '') // 移除内联代码
    
  return truncateText(plainText, maxLength)
}

/**
 * 转换博客文章为 Algolia 记录
 */
export function transformPost(post: Post): AlgoliaRecord {
  const content = post.content || ''
  const excerpt = generateExcerpt(content, 200)
  
  return {
    objectID: post.id,
    type: 'post',
    title: post.title,
    content: truncateText(cleanText(content), 5000),
    description: post.description || excerpt,
    author: post.author,
    date: post.date,
    tags: post.tags || [],
    url: `/posts/${post.slug}`,
    image: post.cover,
    excerpt,
    // 分面搜索字段
    _tags: post.tags || [],
    _type: 'post',
    // 搜索优先级（最新文章优先）
    searchPriority: post.date ? new Date(post.date).getTime() : 0
  }
}

/**
 * 转换项目为 Algolia 记录
 */
export function transformProject(project: any): AlgoliaRecord {
  return {
    objectID: `project_${project.id}`,
    type: 'project',
    title: project.title,
    content: cleanText(project.description || ''),
    description: project.summary || project.description,
    tags: project.technologies || [],
    url: `/projects/${project.id}`,
    image: project.image,
    // 分面搜索字段
    _tags: project.technologies || [],
    _type: 'project',
    searchPriority: project.featured ? 1000 : 0
  }
}

/**
 * 转换书籍为 Algolia 记录
 */
export function transformBook(book: any): AlgoliaRecord {
  const content = [
    book.title,
    book.author,
    book.description,
    book.review
  ].filter(Boolean).join(' ')
  
  return {
    objectID: `book_${book.id}`,
    type: 'book',
    title: book.title,
    content: truncateText(cleanText(content), 3000),
    description: book.description,
    author: book.author,
    tags: book.categories || [],
    url: `/books/${book.id}`,
    image: book.cover,
    // 分面搜索字段
    _tags: book.categories || [],
    _type: 'book',
    searchPriority: book.rating || 0
  }
}

/**
 * 转换工具为 Algolia 记录
 */
export function transformTool(tool: any): AlgoliaRecord {
  const content = [
    tool.name,
    tool.description,
    tool.features?.join(' ')
  ].filter(Boolean).join(' ')
  
  return {
    objectID: `tool_${tool.id}`,
    type: 'tool',
    title: tool.name,
    content: truncateText(cleanText(content), 2000),
    description: tool.description,
    tags: tool.categories || [],
    url: tool.link || `/tools/${tool.id}`,
    image: tool.icon,
    // 分面搜索字段
    _tags: tool.categories || [],
    _type: 'tool',
    searchPriority: tool.recommended ? 500 : 0
  }
}

/**
 * 批量转换记录
 */
export function batchTransform(data: {
  posts?: Post[]
  projects?: any[]
  books?: any[]
  tools?: any[]
}): AlgoliaRecord[] {
  const records: AlgoliaRecord[] = []
  
  if (data.posts) {
    records.push(...data.posts.map(transformPost))
  }
  
  if (data.projects) {
    records.push(...data.projects.map(transformProject))
  }
  
  if (data.books) {
    records.push(...data.books.map(transformBook))
  }
  
  if (data.tools) {
    records.push(...data.tools.map(transformTool))
  }
  
  return records
}

/**
 * 为记录生成搜索建议
 */
export function generateSuggestions(record: AlgoliaRecord): string[] {
  const suggestions: string[] = [record.title]
  
  // 添加标签作为建议
  if (record.tags) {
    suggestions.push(...record.tags)
  }
  
  // 为不同类型添加特定建议
  switch (record.type) {
    case 'post':
      if (record.author) suggestions.push(record.author)
      break
    case 'book':
      if (record.author) suggestions.push(record.author)
      break
    case 'tool':
      // 从标题中提取关键词
      const words = record.title.split(/\s+/).filter(w => w.length > 3)
      suggestions.push(...words)
      break
  }
  
  // 去重并限制数量
  return [...new Set(suggestions)].slice(0, 5)
}