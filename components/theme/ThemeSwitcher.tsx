/**
 * 主题切换器组件
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/lib/theme/ThemeContext'
import { presetThemes } from '@/lib/theme/presets'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'

export function ThemeSwitcher() {
  const { theme, setTheme, preferences } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-background-secondary border border-border rounded-lg hover:border-border-hover transition-colors"
        aria-label="切换主题"
      >
        <span className="text-sm font-medium">{theme.name}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 - 添加背景色确保可见 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* 主题选择面板 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-72 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50"
            >
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">选择主题</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {presetThemes.map((presetTheme) => (
                    <button
                      key={presetTheme.id}
                      onClick={() => {
                        setTheme(presetTheme.id)
                        setIsOpen(false)
                      }}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all
                        ${preferences.currentTheme === presetTheme.id 
                          ? 'border-primary' 
                          : 'border-border hover:border-border-hover'
                        }
                      `}
                    >
                      {/* 主题预览 */}
                      <div 
                        className="h-16 rounded-md mb-2 flex items-center justify-center text-xs font-medium"
                        style={{
                          background: presetTheme.colors.background,
                          color: presetTheme.colors.foreground,
                          border: `1px solid ${presetTheme.colors.border}`,
                        }}
                      >
                        Aa
                      </div>
                      
                      {/* 主题名称 */}
                      <div className="text-sm font-medium">{presetTheme.name}</div>
                      <div className="text-xs text-foreground-tertiary">{presetTheme.description}</div>
                      
                      {/* 选中标记 */}
                      {preferences.currentTheme === presetTheme.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}