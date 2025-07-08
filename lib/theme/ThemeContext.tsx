/**
 * 主题上下文和提供者
 */

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, ThemeMode, UserThemePreferences } from './types'
import { defaultTheme, darkTheme, getThemeById } from './presets'
import { applyTheme } from './utils'

interface ThemeContextValue {
  // 当前主题
  theme: Theme
  
  // 用户偏好
  preferences: UserThemePreferences
  
  // 主题操作
  setTheme: (themeId: string) => void
  setMode: (mode: ThemeMode) => void
  updatePreferences: (preferences: Partial<UserThemePreferences>) => void
  resetTheme: () => void
  
  // 主题列表
  availableThemes: string[]
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// 默认偏好设置
const defaultPreferences: UserThemePreferences = {
  currentTheme: 'default',
  mode: 'system',
  fontSize: 'medium',
  fontFamily: 'system',
  reduceMotion: false,
  density: 'comfortable',
  roundedCorners: true,
  highContrast: false,
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: string
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme: initialTheme = 'default',
  storageKey = 'blog-theme-preferences',
}: ThemeProviderProps) {
  const [preferences, setPreferences] = useState<UserThemePreferences>(defaultPreferences)
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // 从本地存储加载偏好
  useEffect(() => {
    setMounted(true)
    
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const savedPreferences = JSON.parse(stored) as UserThemePreferences
        setPreferences(savedPreferences)
        
        // 加载保存的主题
        const savedTheme = getThemeById(savedPreferences.currentTheme)
        if (savedTheme) {
          setThemeState(savedTheme)
        }
      } catch (error) {
        console.error('Failed to load theme preferences:', error)
      }
    }
  }, [storageKey])

  // 监听系统主题变化
  useEffect(() => {
    if (preferences.mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? darkTheme : defaultTheme
      setThemeState(newTheme)
      applyTheme(newTheme, preferences)
    }

    // 初始设置
    if (mediaQuery.matches) {
      setThemeState(darkTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [preferences.mode, preferences])

  // 应用主题
  useEffect(() => {
    if (!mounted) return
    
    applyTheme(theme, preferences)
    
    // 保存到本地存储
    localStorage.setItem(storageKey, JSON.stringify(preferences))
  }, [theme, preferences, mounted, storageKey])

  // 设置主题
  const setTheme = (themeId: string) => {
    const newTheme = getThemeById(themeId)
    if (newTheme) {
      setThemeState(newTheme)
      setPreferences(prev => ({
        ...prev,
        currentTheme: themeId,
        mode: newTheme.mode,
      }))
    }
  }

  // 设置模式
  const setMode = (mode: ThemeMode) => {
    setPreferences(prev => ({ ...prev, mode }))
    
    if (mode === 'dark') {
      setThemeState(darkTheme)
    } else if (mode === 'light') {
      setThemeState(defaultTheme)
    }
    // system mode 会在 useEffect 中处理
  }

  // 更新偏好设置
  const updatePreferences = (newPreferences: Partial<UserThemePreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }))
  }

  // 重置主题
  const resetTheme = () => {
    setPreferences(defaultPreferences)
    setThemeState(defaultTheme)
    localStorage.removeItem(storageKey)
  }

  // 获取可用主题列表
  const availableThemes = ['default', 'dark', 'eyecare', 'highcontrast', 'purple', 'blue']

  const value: ThemeContextValue = {
    theme,
    preferences,
    setTheme,
    setMode,
    updatePreferences,
    resetTheme,
    availableThemes,
  }

  // 避免服务端渲染时的主题闪烁
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// 使用主题的 Hook
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    // 在服务端渲染时返回默认值
    if (typeof window === 'undefined') {
      return {
        theme: defaultTheme,
        preferences: defaultPreferences,
        setTheme: () => {},
        setMode: () => {},
        updatePreferences: () => {},
        resetTheme: () => {},
        availableThemes: ['default'],
      }
    }
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}