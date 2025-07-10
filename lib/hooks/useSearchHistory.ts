'use client' import { useState, useEffect, useCallback }
from 'react' export interface SearchHistoryItem { id: string query: string timestamp: number resultCount: number type?: 'all' | 'post' | 'project' | 'book' | 'tool' }
const STORAGE_KEY = 'search-history' const MAX_HISTORY_ITEMS = 10 /** * Hook for managing search history * - Stores search queries in localStorage * - Limits history to MAX_HISTORY_ITEMS * - Provides methods to add, remove, and clear history */
export function useSearchHistory() { const [history, setHistory] = useState<SearchHistoryItem[]>([]) // Load history from localStorage on mount useEffect(() => { try { const stored = localStorage.getItem(STORAGE_KEY) if (stored) { const parsed = JSON.parse(stored) as SearchHistoryItem[]
setHistory(parsed) }
}
catch (error) { console.error('Failed to load search history:', error) }
}, []) // Save history to localStorage whenever it changes useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)) }
catch (error) { console.error('Failed to save search history:', error) }
}, [history]) /** * Add a search query to history */
const addToHistory = useCallback((query: string, resultCount: number, type?: SearchHistoryItem['type']) => { if (!query || query.trim().length < 2) return const newItem: SearchHistoryItem = { id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, query: query.trim(), timestamp: Date.now(), resultCount, type }
setHistory((prev) => { // Remove duplicate queries const filtered = prev.filter(item => item.query.toLowerCase() !== query.toLowerCase()) // Add new item at the beginning and limit size const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS) return updated }) }, []) /** * Remove a specific history item */
const removeFromHistory = useCallback((id: string) => { setHistory((prev) => prev.filter(item => item.id !== id)) }, []) /** * Clear all history */
const clearHistory = useCallback(() => { setHistory([]) try { localStorage.removeItem(STORAGE_KEY) }
catch (error) { console.error('Failed to clear search history:', error) }
}, []) /** * Get recent unique queries (for suggestions) */
const getRecentQueries = useCallback((limit: number = 5) => { const uniqueQueries = new Set<string>() const recent: string[] = []
for (const item of history) { const lowerQuery = item.query.toLowerCase() if (!uniqueQueries.has(lowerQuery)) { uniqueQueries.add(lowerQuery) recent.push(item.query) if (recent.length >= limit) break }
}
return recent }, [history]) /** * Get popular queries (queries with most results) */
const getPopularQueries = useCallback((limit: number = 5) => { const queryMap = new Map<string, { query: string, totalResults: number, count: number }>() history.forEach(item => { const key = item.query.toLowerCase() const existing = queryMap.get(key) || { query: item.query, totalResults: 0, count: 0 }
queryMap.set(key, { query: existing.query, totalResults: existing.totalResults + item.resultCount, count: existing.count + 1 }) }) return Array.from(queryMap.values()) .sort((a, b) => b.totalResults - a.totalResults) .slice(0, limit) .map(item => item.query) }, [history]) return { history, addToHistory, removeFromHistory, clearHistory, getRecentQueries, getPopularQueries } }