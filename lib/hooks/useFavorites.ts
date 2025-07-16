/**
 * 收藏管理 Hook
 * @module lib/hooks/useFavorites
 * @description 提供收藏功能的状态管理和操作方法
 */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * 收藏项类型
 * @enum {string}
 */
export enum FavoriteType {
  POST = 'post',
  PROJECT = 'project',
  BOOK = 'book',
  TOOL = 'tool'
}

/**
 * 收藏项接口
 * @interface FavoriteItem
 * @property {string} id - 内容ID
 * @property {FavoriteType} type - 内容类型
 * @property {string} title - 标题
 * @property {string} [description] - 描述
 * @property {string} [thumbnail] - 缩略图
 * @property {string} [slug] - URL标识
 * @property {Date} favoriteDate - 收藏时间
 */
export interface FavoriteItem {
  id: string
  type: FavoriteType
  title: string
  description?: string
  thumbnail?: string
  slug?: string
  favoriteDate: Date
}

/**
 * 收藏管理 Hook 返回值
 * @interface UseFavoritesReturn
 * @property {FavoriteItem[]} favorites - 所有收藏项
 * @property {boolean} isLoading - 加载状态
 * @property {(item: Omit<FavoriteItem, 'favoriteDate'>) => void} addFavorite - 添加收藏
 * @property {(id: string, type: FavoriteType) => void} removeFavorite - 移除收藏
 * @property {(id: string, type: FavoriteType) => boolean} isFavorite - 检查是否已收藏
 * @property {() => void} clearFavorites - 清空所有收藏
 * @property {(type?: FavoriteType) => FavoriteItem[]} getFavoritesByType - 按类型获取收藏
 * @property {number} totalCount - 收藏总数
 */
interface UseFavoritesReturn {
  favorites: FavoriteItem[]
  isLoading: boolean
  addFavorite: (item: Omit<FavoriteItem, 'favoriteDate'>) => void
  removeFavorite: (id: string, type: FavoriteType) => void
  isFavorite: (id: string, type: FavoriteType) => boolean
  clearFavorites: () => void
  getFavoritesByType: (type?: FavoriteType) => FavoriteItem[]
  totalCount: number
}

const FAVORITES_STORAGE_KEY = 'blog_favorites'
const MAX_FAVORITES = 100 // 最大收藏数量限制

/**
 * 收藏管理 Hook
 * @function useFavorites
 * @returns {UseFavoritesReturn} 收藏管理相关状态和方法
 * @description 使用本地存储持久化收藏数据，提供添加、删除、查询等操作
 * @example
 * const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites()
 *
 * // 添加收藏
 * addFavorite({
 *   id: 'post-1',
 *   type: FavoriteType.POST,
 *   title: '文章标题',
 *   description: '文章描述',
 *   slug: 'article-slug'
 * })
 *
 * // 检查是否已收藏
 * const isPostFavorited = isFavorite('post-1', FavoriteType.POST)
 *
 * // 移除收藏
 * removeFavorite('post-1', FavoriteType.POST)
 */
export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 从本地存储加载收藏数据
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          // 转换日期字符串为 Date 对象
          const favoritesWithDates = parsed.map((item: any) => ({
            ...item,
            favoriteDate: new Date(item.favoriteDate)
          }))
          setFavorites(favoritesWithDates)
        }
      } catch (error) {
        console.error('Failed to load favorites:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadFavorites()
  }, [])

  // 保存收藏数据到本地存储
  const saveFavorites = useCallback((items: FavoriteItem[]) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save favorites:', error)
    }
  }, [])

  // 添加收藏
  const addFavorite = useCallback((item: Omit<FavoriteItem, 'favoriteDate'>) => {
    setFavorites(prev => {
      // 检查是否已存在
      const exists = prev.some(f => f.id === item.id && f.type === item.type)
      if (exists) {
        console.warn(`Item ${item.id} of type ${item.type} is already favorited`)
        return prev
      }

      // 检查是否超过最大数量
      if (prev.length >= MAX_FAVORITES) {
        console.warn(`Maximum favorites limit (${MAX_FAVORITES}) reached`)
        alert(`最多只能收藏 ${MAX_FAVORITES} 个项目`)
        return prev
      }

      // 添加新收藏项
      const newFavorite: FavoriteItem = {
        ...item,
        favoriteDate: new Date()
      }
      const updated = [newFavorite, ...prev]
      saveFavorites(updated)
      return updated
    })
  }, [saveFavorites])

  // 移除收藏
  const removeFavorite = useCallback((id: string, type: FavoriteType) => {
    setFavorites(prev => {
      const updated = prev.filter(f => !(f.id === id && f.type === type))
      saveFavorites(updated)
      return updated
    })
  }, [saveFavorites])

  // 检查是否已收藏
  const isFavorite = useCallback((id: string, type: FavoriteType) => {
    return favorites.some(f => f.id === id && f.type === type)
  }, [favorites])

  // 清空所有收藏
  const clearFavorites = useCallback(() => {
    if (confirm('确定要清空所有收藏吗？此操作无法撤销。')) {
      setFavorites([])
      saveFavorites([])
    }
  }, [saveFavorites])

  // 按类型获取收藏
  const getFavoritesByType = useCallback((type?: FavoriteType) => {
    if (!type) return favorites
    return favorites.filter(f => f.type === type)
  }, [favorites])

  // 收藏总数
  const totalCount = useMemo(() => favorites.length, [favorites])

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
    getFavoritesByType,
    totalCount
  }
}

/**
 * 格式化收藏时间
 * @function formatFavoriteDate
 * @param {Date} date - 收藏时间
 * @returns {string} 格式化后的时间字符串
 * @description 将收藏时间格式化为相对时间或具体日期
 * @example
 * formatFavoriteDate(new Date()) // "刚刚"
 * formatFavoriteDate(new Date(Date.now() - 3600000)) // "1小时前"
 */
export function formatFavoriteDate(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute)
    return `${minutes}分钟前`
  } else if (diff < day) {
    const hours = Math.floor(diff / hour)
    return `${hours}小时前`
  } else if (diff < week) {
    const days = Math.floor(diff / day)
    return `${days}天前`
  } else if (diff < month) {
    const weeks = Math.floor(diff / week)
    return `${weeks}周前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

/**
 * 收藏统计信息
 * @interface FavoriteStats
 * @property {number} total - 总收藏数
 * @property {Record<FavoriteType, number>} byType - 各类型收藏数
 * @property {FavoriteItem | null} mostRecent - 最近收藏
 * @property {FavoriteItem | null} oldest - 最早收藏
 */
export interface FavoriteStats {
  total: number
  byType: Record<FavoriteType, number>
  mostRecent: FavoriteItem | null
  oldest: FavoriteItem | null
}

/**
 * 获取收藏统计信息
 * @function getFavoriteStats
 * @param {FavoriteItem[]} favorites - 收藏项数组
 * @returns {FavoriteStats} 统计信息
 * @description 计算收藏的各项统计数据
 */
export function getFavoriteStats(favorites: FavoriteItem[]): FavoriteStats {
  const byType = favorites.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {} as Record<FavoriteType, number>)
  
  // 确保所有类型都有值
  Object.values(FavoriteType).forEach(type => {
    if (!(type in byType)) {
      byType[type] = 0
    }
  })
  
  const sorted = [...favorites].sort((a, b) => 
    b.favoriteDate.getTime() - a.favoriteDate.getTime()
  )
  
  return {
    total: favorites.length,
    byType,
    mostRecent: sorted[0] || null,
    oldest: sorted[sorted.length - 1] || null
  }
}