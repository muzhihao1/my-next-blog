import { renderHook, act }
from "@testing-library/react";
import {
  useFavorites,
  FavoriteType,
  formatFavoriteDate,
  getFavoriteStats,
}
from "../useFavorites";
// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    })
  }
})()

// Mock console methods
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  })
  console.error = jest.fn()
  console.warn = jest.fn()
  // Mock window.confirm
  window.confirm = jest.fn(() => true)
  // Mock window.alert
  window.alert = jest.fn()
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})
describe('useFavorites', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })
  it('initializes with empty favorites', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
    expect(result.current.totalCount).toBe(0)
    expect(result.current.isLoading).toBe(false)
  })
  it('loads favorites from localStorage', () => {
    const mockFavorites = [
      {
        id: '1',
        type: FavoriteType.POST,
        title: 'Test Post',
        favoriteDate: new Date('2024-01-01').toISOString()
      }
    ]
    
    localStorageMock.setItem('blog_favorites', JSON.stringify(mockFavorites))
    const { result } = renderHook(() => useFavorites())
    
    expect(result.current.favorites).toHaveLength(1)
    expect(result.current.favorites[0].id).toBe('1')
    expect(result.current.favorites[0].favoriteDate).toBeInstanceOf(Date)
  })
  it('handles invalid localStorage data gracefully', () => {
    localStorageMock.setItem('blog_favorites', 'invalid-json')
    const { result } = renderHook(() => useFavorites())
    
    expect(result.current.favorites).toEqual([])
    expect(console.error).toHaveBeenCalledWith('Failed to load favorites:', expect.any(Error))
  })
  it('adds a new favorite', () => {
    const { result } = renderHook(() => useFavorites())
    const newFavorite = {
      id: '1',
      type: FavoriteType.POST,
      title: 'Test Post',
      description: 'Test description',
      slug: 'test-post'
    }
    act(() => {
      result.current.addFavorite(newFavorite)
    })
    
    expect(result.current.favorites).toHaveLength(1)
    expect(result.current.favorites[0]).toMatchObject(newFavorite)
    expect(result.current.favorites[0].favoriteDate).toBeInstanceOf(Date)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'blog_favorites',
      expect.any(String)
    )
  })
  it('prevents duplicate favorites', () => {
    const { result } = renderHook(() => useFavorites())
    const favorite = {
      id: '1',
      type: FavoriteType.POST,
      title: 'Test Post'
    }
    act(() => {
      result.current.addFavorite(favorite)
      result.current.addFavorite(favorite)
    })
    
    expect(result.current.favorites).toHaveLength(1)
    expect(console.warn).toHaveBeenCalledWith(
      'Item 1 of type post is already favorited'
    )
  })
  it('enforces maximum favorites limit', () => {
    const { result } = renderHook(() => useFavorites())
    
    // Add 100 favorites (the limit)
    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.addFavorite({
          id: String(i),
          type: FavoriteType.POST,
          title: `Post ${i}`
        })
      }
    })
    
    expect(result.current.favorites).toHaveLength(100)
    
    // Try to add one more
    act(() => {
      result.current.addFavorite({
        id: '101',
        type: FavoriteType.POST,
        title: 'Post 101'
      })
    })
    
    expect(result.current.favorites).toHaveLength(100)
    expect(console.warn).toHaveBeenCalledWith(
      'Maximum favorites limit (100) reached'
    )
    expect(window.alert).toHaveBeenCalledWith('最多只能收藏 100 个项目')
  })
  it('removes a favorite', () => {
    const { result } = renderHook(() => useFavorites())
    
    // Add favorites
    act(() => {
      result.current.addFavorite({
        id: '1',
        type: FavoriteType.POST,
        title: 'Post 1'
      })
      result.current.addFavorite({
        id: '2',
        type: FavoriteType.PROJECT,
        title: 'Project 1'
      })
    })
    
    expect(result.current.favorites).toHaveLength(2)
    
    // Remove one
    act(() => {
      result.current.removeFavorite('1', FavoriteType.POST)
    })
    
    expect(result.current.favorites).toHaveLength(1)
    expect(result.current.favorites[0].id).toBe('2')
  })
  it('checks if item is favorited', () => {
    const { result } = renderHook(() => useFavorites())
    
    act(() => {
      result.current.addFavorite({
        id: '1',
        type: FavoriteType.POST,
        title: 'Post 1'
      })
    })
    
    expect(result.current.isFavorite('1', FavoriteType.POST)).toBe(true)
    expect(result.current.isFavorite('2', FavoriteType.POST)).toBe(false)
    expect(result.current.isFavorite('1', FavoriteType.PROJECT)).toBe(false)
  })
  it('clears all favorites when confirmed', () => {
    const { result } = renderHook(() => useFavorites())
    
    // Add favorites
    act(() => {
      result.current.addFavorite({
        id: '1',
        type: FavoriteType.POST,
        title: 'Post 1'
      })
      result.current.addFavorite({
        id: '2',
        type: FavoriteType.PROJECT,
        title: 'Project 1'
      })
    })
    
    expect(result.current.favorites).toHaveLength(2)
    
    // Clear all
    act(() => {
      result.current.clearFavorites()
    })
    
    expect(window.confirm).toHaveBeenCalledWith(
      '确定要清空所有收藏吗？此操作无法撤销。'
    )
    expect(result.current.favorites).toHaveLength(0)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'blog_favorites',
      '[]'
    )
  })
  it('does not clear favorites when cancelled', () => {
    window.confirm = jest.fn(() => false)
    const { result } = renderHook(() => useFavorites())
    
    act(() => {
      result.current.addFavorite({
        id: '1',
        type: FavoriteType.POST,
        title: 'Post 1'
      })
    })
    
    act(() => {
      result.current.clearFavorites()
    })
    
    expect(result.current.favorites).toHaveLength(1)
    
    // Restore confirm mock
    window.confirm = jest.fn(() => true)
  })
  it('gets favorites by type', () => {
    const { result } = renderHook(() => useFavorites())
    
    act(() => {
      result.current.addFavorite({
        id: '1',
        type: FavoriteType.POST,
        title: 'Post 1'
      })
      result.current.addFavorite({
        id: '2',
        type: FavoriteType.POST,
        title: 'Post 2'
      })
      result.current.addFavorite({
        id: '3',
        type: FavoriteType.PROJECT,
        title: 'Project 1'
      })
      result.current.addFavorite({
        id: '4',
        type: FavoriteType.BOOK,
        title: 'Book 1'
      })
    })
    
    expect(result.current.getFavoritesByType(FavoriteType.POST)).toHaveLength(2)
    expect(result.current.getFavoritesByType(FavoriteType.PROJECT)).toHaveLength(1)
    expect(result.current.getFavoritesByType(FavoriteType.BOOK)).toHaveLength(1)
    expect(result.current.getFavoritesByType(FavoriteType.TOOL)).toHaveLength(0)
    expect(result.current.getFavoritesByType()).toHaveLength(4)
  })
  it('handles localStorage errors gracefully', () => {
    const { result } = renderHook(() => useFavorites())
    
    // Mock localStorage.setItem to throw an error
    localStorageMock.setItem = jest.fn(() => {
      throw new Error('Storage quota exceeded')
    })
    
    act(() => {
      result.current.addFavorite({
        id: '1',
        type: FavoriteType.POST,
        title: 'Post 1'
      })
    })
    
    expect(console.error).toHaveBeenCalledWith(
      'Failed to save favorites:',
      expect.any(Error)
    )
    
    // The favorite should still be added to state
    expect(result.current.favorites).toHaveLength(1)
  })
  it('maintains newest-first order', () => {
    const { result } = renderHook(() => useFavorites())
    
    act(() => {
      result.current.addFavorite({
        id: '1',
        type: FavoriteType.POST,
        title: 'First Post'
      })
    })
    
    // Wait a bit to ensure different timestamps
    act(() => {
      result.current.addFavorite({
        id: '2',
        type: FavoriteType.POST,
        title: 'Second Post'
      })
    })
    
    expect(result.current.favorites[0].id).toBe('2')
    expect(result.current.favorites[1].id).toBe('1')
  })
})
describe('formatFavoriteDate', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })
  it('formats "just now" for recent times', () => {
    const now = new Date()
    jest.setSystemTime(now)
    expect(formatFavoriteDate(new Date(now.getTime() - 30 * 1000))).toBe('刚刚')
  })
  it('formats minutes ago', () => {
    const now = new Date()
    jest.setSystemTime(now)
    expect(formatFavoriteDate(new Date(now.getTime() - 5 * 60 * 1000))).toBe('5分钟前')
    expect(formatFavoriteDate(new Date(now.getTime() - 59 * 60 * 1000))).toBe('59分钟前')
  })
  it('formats hours ago', () => {
    const now = new Date()
    jest.setSystemTime(now)
    expect(formatFavoriteDate(new Date(now.getTime() - 2 * 60 * 60 * 1000))).toBe('2小时前')
    expect(formatFavoriteDate(new Date(now.getTime() - 23 * 60 * 60 * 1000))).toBe('23小时前')
  })
  it('formats days ago', () => {
    const now = new Date()
    jest.setSystemTime(now)
    expect(formatFavoriteDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000))).toBe('3天前')
    expect(formatFavoriteDate(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000))).toBe('6天前')
  })
  it('formats weeks ago', () => {
    const now = new Date()
    jest.setSystemTime(now)
    expect(formatFavoriteDate(new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000))).toBe('2周前')
    expect(formatFavoriteDate(new Date(now.getTime() - 3 * 7 * 24 * 60 * 60 * 1000))).toBe('3周前')
  })
  it('formats as date for older times', () => {
    const now = new Date()
    jest.setSystemTime(now)
    const oldDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    expect(formatFavoriteDate(oldDate)).toBe(oldDate.toLocaleDateString('zh-CN'))
  })
})
describe('getFavoriteStats', () => {
  it('returns empty stats for empty array', () => {
    const stats = getFavoriteStats([])
    expect(stats.total).toBe(0)
    expect(stats.byType).toEqual({
      [FavoriteType.POST]: 0,
      [FavoriteType.PROJECT]: 0,
      [FavoriteType.BOOK]: 0,
      [FavoriteType.TOOL]: 0
    })
    expect(stats.mostRecent).toBeNull()
    expect(stats.oldest).toBeNull()
  })
  it('calculates stats correctly', () => {
    const now = new Date()
    const favorites = [
      {
        id: '1',
        type: FavoriteType.POST,
        title: 'Post 1',
        favoriteDate: new Date(now.getTime() - 1000)
      },
      {
        id: '2',
        type: FavoriteType.POST,
        title: 'Post 2',
        favoriteDate: new Date(now.getTime() - 2000)
      },
      {
        id: '3',
        type: FavoriteType.PROJECT,
        title: 'Project 1',
        favoriteDate: new Date(now.getTime() - 3000)
      },
      {
        id: '4',
        type: FavoriteType.BOOK,
        title: 'Book 1',
        favoriteDate: new Date(now.getTime() - 4000)
      }
    ]
    
    const stats = getFavoriteStats(favorites)
    
    expect(stats.total).toBe(4)
    expect(stats.byType[FavoriteType.POST]).toBe(2)
    expect(stats.byType[FavoriteType.PROJECT]).toBe(1)
    expect(stats.byType[FavoriteType.BOOK]).toBe(1)
    expect(stats.byType[FavoriteType.TOOL]).toBe(0)
    expect(stats.mostRecent?.id).toBe('1')
    expect(stats.oldest?.id).toBe('4')
  })
})
