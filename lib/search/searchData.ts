import { Post }
from '@/types/post' 

import { Project }
from '@/types/project' 

import { Book }
from '@/types/book' 

import { Tool }
from '@/types/tool' 

import { fallbackPosts }
from '@/lib/fallback-posts' 

import { fallbackProjects }
from '@/lib/fallback-projects' 

import { fallbackBooks }
from '@/lib/fallback-books' 

import { fallbackTools }
from '@/lib/fallback-tools' export interface SearchItem { id: string title: string content: string type: 'post' | 'project' | 'book' | 'tool' url: string category?: string author?: string tags?: string[]
}
// 构建搜索索引数据 export function buildSearchIndex(): SearchItem[] { const searchItems: SearchItem[] = [] // 添加文章 fallbackPosts.forEach(post => { searchItems.push({ id: post.id, title: post.title, content: post.excerpt, type: 'post', url: `/posts/${post.slug}`, category: post.category, author: post.author.name, tags: post.tags }) }) // 添加项目 fallbackProjects.forEach(project => { searchItems.push({ id: project.id, title: project.title, content: project.description, type: 'project', url: `/projects/${project.slug}`, category: project.category, tags: project.techStack }) }) // 添加书籍 fallbackBooks.forEach(book => { searchItems.push({ id: book.id, title: book.title, content: book.notes || book.takeaways || '', type: 'book', url: `/bookshelf/${book.id}`, author: book.author, category: book.category, tags: book.tags }) }) // 添加工具 fallbackTools.forEach(tool => { searchItems.push({ id: tool.id, title: tool.name, content: tool.description, type: 'tool', url: `/tools/${tool.slug}`, category: tool.category, tags: tool.tags }) }) return searchItems }
// 获取搜索数据（可以在客户端使用） export async function getSearchData(): Promise<SearchItem[]> { // 在实际应用中，这里可以从 Notion API 获取最新数据 // 现在先使用 fallback 数据 return buildSearchIndex() }
/** * 高亮搜索关键词 * @param text 原始文本 * @param query 搜索关键词 * @returns 带有高亮标记的文本 */
export function highlightText(text: string, query: string): string { if (!query || query.length < 2) return text // 转义特殊字符 const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') const regex = new RegExp(`(${escapedQuery})`, 'gi') return text.replace(regex, '<mark class="bg-yellow-200 text-black rounded px-0.5">$1</mark>') }