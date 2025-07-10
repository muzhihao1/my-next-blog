import Fuse from 'fuse.js' 

import { SearchItem, buildSearchIndex }
from './searchData' 

import { SearchFilters, AdvancedSearchOptions, SearchStats, getDateRangeFromPreset }
from './searchTypes' export interface EnhancedSearchItem extends SearchItem { date?: Date | string rating?: number status?: string views?: number }
/** * Enhanced search function with advanced filtering capabilities */
export class AdvancedSearch { private fuse: Fuse<EnhancedSearchItem> private searchData: EnhancedSearchItem[]
constructor() { this.searchData = this.enhanceSearchData(buildSearchIndex()) this.fuse = new Fuse(this.searchData, { keys: [ { name: 'title', weight: 0.7 }, { name: 'content', weight: 0.3 }, { name: 'tags', weight: 0.2 }, { name: 'author', weight: 0.1 }, { name: 'category', weight: 0.15 }
], threshold: 0.3, includeScore: true, ignoreLocation: true, useExtendedSearch: true, minMatchCharLength: 2 }) }
/** * Enhance search data with additional metadata */
private enhanceSearchData(data: SearchItem[]): EnhancedSearchItem[] { return data.map(item => ({ ...item, // Add mock dates for demo purposes (in real app, these would come from actual data) date: this.generateMockDate(item.id), rating: item.type === 'book' || item.type === 'tool' ? this.generateMockRating() : undefined, status: item.type === 'project' ? this.generateMockStatus() : undefined, views: Math.floor(Math.random() * 10000) })) }
private generateMockDate(id: string): Date { // Generate dates spread across the last 2 years const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) const daysAgo = hash % 730 // Last 2 years const date = new Date() date.setDate(date.getDate() - daysAgo) return date }
private generateMockRating(): number { return Math.round((Math.random() * 2 + 3) * 10) / 10 // 3.0 to 5.0 }
private generateMockStatus(): string { const statuses = ['developing', 'completed', 'maintenance']
return statuses[Math.floor(Math.random() * statuses.length)]
}/** * Perform advanced search with filters */
search(options: AdvancedSearchOptions): { results: EnhancedSearchItem[], stats: SearchStats } { const startTime = performance.now() // Step 1: Text search with Fuse.js let results: EnhancedSearchItem[] = []
if (options.query && options.query.length >= 2) { const fuseResults = this.fuse.search(options.query) results = fuseResults.map(result => ({ ...result.item, score: result.score })) }
else { // If no query, return all items for filtering results = [...this.searchData]
}
// Step 2: Apply filters results = this.applyFilters(results, options.filters) // Step 3: Sort results results = this.sortResults(results, options.sortBy || 'relevance', options.sortOrder || 'desc') // Step 4: Calculate stats before pagination const stats = this.calculateStats(results, performance.now() - startTime) // Step 5: Apply pagination const offset = options.offset || 0 const limit = options.limit || 20 results = results.slice(offset, offset + limit) return { results, stats }
}/** * Apply filters to search results */
private applyFilters(items: EnhancedSearchItem[], filters: SearchFilters): EnhancedSearchItem[] { let filtered = [...items] // Type filter if (filters.type && filters.type !== 'all') { filtered = filtered.filter(item => item.type === filters.type) }
// Category filter if (filters.category) { filtered = filtered.filter(item => item.category === filters.category) }
// Tags filter (match any) if (filters.tags && filters.tags.length > 0) { filtered = filtered.filter(item => item.tags && item.tags.some(tag => filters.tags!.includes(tag)) ) }
// Date range filter if (filters.dateRange) { let { start, end } = filters.dateRange if (filters.dateRange.preset) { const range = getDateRangeFromPreset(filters.dateRange.preset) start = range.start end = range.end }
if (start || end) { filtered = filtered.filter(item => { if (!item.date) return false const itemDate = typeof item.date === 'string' ? new Date(item.date) : item.date if (start && itemDate < start) return false if (end && itemDate > end) return false return true }) }
}
// Author filter if (filters.author) { filtered = filtered.filter(item => item.author && item.author.toLowerCase().includes(filters.author!.toLowerCase()) ) }
// Status filter (for projects) if (filters.status) { filtered = filtered.filter(item => item.status === filters.status) }
// Rating filter if (filters.rating) { filtered = filtered.filter(item => { if (!item.rating) return false if (filters.rating!.min && item.rating < filters.rating!.min) return false if (filters.rating!.max && item.rating > filters.rating!.max) return false return true }) }
return filtered }
/** * Sort search results */
private sortResults( items: EnhancedSearchItem[], sortBy: string, order: 'asc' | 'desc' ): EnhancedSearchItem[] { const sorted = [...items]
sorted.sort((a, b) => { let comparison = 0 switch (sortBy) { case 'relevance': // Use Fuse.js score if available (lower is better) const scoreA = (a as any).score || 1 const scoreB = (b as any).score || 1 comparison = scoreA - scoreB break
case 'date': const dateA = a.date ? (typeof a.date === 'string' ? new Date(a.date) : a.date).getTime() : 0 const dateB = b.date ? (typeof b.date === 'string' ? new Date(b.date) : b.date).getTime() : 0 comparison = dateB - dateA // Newer first by default break
case 'title': comparison = a.title.localeCompare(b.title, 'zh-CN') break
case 'rating': comparison = (b.rating || 0) - (a.rating || 0) // Higher first by default break
default: return 0 }
return order === 'asc' ? -comparison : comparison }) return sorted }
/** * Calculate search statistics */
private calculateStats(results: EnhancedSearchItem[], searchTime: number): SearchStats { const resultsByType = { post: 0, project: 0, book: 0, tool: 0 }
results.forEach(item => { if (item.type in resultsByType) { resultsByType[item.type as keyof typeof resultsByType]++ }
}) return { totalResults: results.length, resultsByType, searchTime: Math.round(searchTime * 100) / 100 }
}/** * Get available categories for a content type */
getCategories(type?: string): string[] { if (!type || type === 'all') { // Return all unique categories const categories = new Set<string>() this.searchData.forEach(item => { if (item.category) categories.add(item.category) }) return Array.from(categories).sort() }
return this.searchData .filter(item => item.type === type) .map(item => item.category) .filter((cat): cat is string => !!cat) .filter((cat, index, arr) => arr.indexOf(cat) === index) .sort() }
/** * Get all available tags */
getTags(): string[] { const tags = new Set<string>() this.searchData.forEach(item => { if (item.tags) { item.tags.forEach(tag => tags.add(tag)) }
}) return Array.from(tags).sort() }
/** * Get search suggestions based on partial query */
getSuggestions(partial: string, limit: number = 5): string[] { if (!partial || partial.length < 2) return []
const suggestions = new Set<string>() const lowerPartial = partial.toLowerCase() // Search in titles this.searchData.forEach(item => { if (item.title.toLowerCase().includes(lowerPartial)) { suggestions.add(item.title) }
}) // Search in tags this.searchData.forEach(item => { if (item.tags) { item.tags.forEach(tag => { if (tag.toLowerCase().includes(lowerPartial)) { suggestions.add(tag) }
}) }
}) return Array.from(suggestions) .sort((a, b) => { // Prioritize exact matches and shorter suggestions const aStarts = a.toLowerCase().startsWith(lowerPartial) const bStarts = b.toLowerCase().startsWith(lowerPartial) if (aStarts && !bStarts) return -1 if (!aStarts && bStarts) return 1 return a.length - b.length }) .slice(0, limit) } }