/**
 * 主题切换组件
 * 提供深色模式切换功能
 */

'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 避免 hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors"
        aria-label="切换主题"
      >
        <div className="w-5 h-5" />
      </button>
    )
  }

  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (theme === 'light') {
            setTheme('dark')
          } else if (theme === 'dark') {
            setTheme('system')
          } else {
            setTheme('light')
          }
        }}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
        aria-label={`当前主题: ${theme === 'system' ? '跟随系统' : theme === 'light' ? '浅色' : '深色'}`}
      >
        {currentTheme === 'light' ? (
          <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
        
        {/* 工具提示 */}
        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {theme === 'system' ? '跟随系统' : theme === 'light' ? '浅色模式' : '深色模式'}
          <div className="absolute top-full right-2 -mt-1">
            <div className="w-2 h-2 bg-gray-800 dark:bg-gray-600 rotate-45"></div>
          </div>
        </div>
      </button>
    </div>
  )
}

export function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors"
        aria-label="切换主题"
      >
        <div className="w-5 h-5" />
      </button>
    )
  }

  const themes = [
    { value: 'light', label: '浅色', icon: Sun },
    { value: 'dark', label: '深色', icon: Moon },
    { value: 'system', label: '跟随系统', icon: Monitor }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="选择主题"
        aria-expanded={isOpen}
      >
        {theme === 'light' && <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
        {theme === 'dark' && <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
        {theme === 'system' && <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                theme === value ? 'bg-gray-50 dark:bg-gray-700/50 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {theme === value && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}