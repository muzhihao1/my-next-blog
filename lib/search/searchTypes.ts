export interface SearchFilters { type?: 'all' | 'post' | 'project' | 'book' | 'tool' category?: string tags?: string[]
dateRange?: { start?: Date end?: Date preset?: 'today' | 'week' | 'month' | 'year' | 'all' }
author?: string status?: string // For projects: 'developing' | 'completed' | 'maintenance' rating?: { min?: number max?: number }
}
export interface AdvancedSearchOptions { query: string filters: SearchFilters sortBy?: 'relevance' | 'date' | 'title' | 'rating' sortOrder?: 'asc' | 'desc' limit?: number offset?: number }
export interface SearchStats { totalResults: number resultsByType: { post: number project: number book: number tool: number }
searchTime: number // milliseconds }
// Category mappings for different content types export const POST_CATEGORIES = [ '前端开发', '后端技术', '系统架构', '数据库', '开发工具', '职业发展', '生活感悟', 'AI/机器学习' ]
as const export const PROJECT_CATEGORIES = [ '网站应用', '移动应用', '桌面应用', '开发工具', '开源项目', '实验项目' ]
as const export const BOOK_CATEGORIES = [ '技术', '管理', '设计', '心理学', '哲学', '历史', '经济', '其他' ]
as const export const TOOL_CATEGORIES = [ '编程工具', '设计工具', '生产力工具', '学习资源', '在线服务', 'AI工具' ]
as const // Date range presets export function getDateRangeFromPreset(preset: string): { start: Date; end: Date } { const now = new Date() const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) switch (preset) { case 'today': return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
case 'week': const weekAgo = new Date(today) weekAgo.setDate(weekAgo.getDate() - 7) return { start: weekAgo, end: now }
case 'month': const monthAgo = new Date(today) monthAgo.setMonth(monthAgo.getMonth() - 1) return { start: monthAgo, end: now }
case 'year': const yearAgo = new Date(today) yearAgo.setFullYear(yearAgo.getFullYear() - 1) return { start: yearAgo, end: now }
default: return { start: new Date(2020, 0, 1), // Blog start date end: now }
} }