/**
 * 主题设置面板组件
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/lib/theme/ThemeContext'
import { ThemeSwitcher } from './ThemeSwitcher'
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  AdjustmentsHorizontalIcon,
  SwatchIcon,
  DocumentTextIcon,
  SparklesIcon,
  Square2StackIcon,
} from '@heroicons/react/24/outline'

interface SettingsSectionProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}

function SettingsSection({ title, icon: Icon, children }: SettingsSectionProps) {
  return (
    <div className="border-b border-border last:border-0 pb-6 last:pb-0">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-foreground-secondary" />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

export function ThemeSettings() {
  const { preferences, setMode, updatePreferences } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* 设置按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
        aria-label="主题设置"
      >
        <AdjustmentsHorizontalIcon className="w-5 h-5" />
      </button>

      {/* 设置面板 - 使用 AnimatePresence 确保动画正确清理 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-overlay z-40"
              onClick={() => setIsOpen(false)}
            />

          {/* 设置抽屉 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-background border-l border-border shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">个性化设置</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                  aria-label="关闭"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* 主题选择 */}
                <SettingsSection title="主题" icon={SwatchIcon}>
                  <ThemeSwitcher />
                  
                  {/* 主题模式 */}
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary mb-2 block">
                      主题模式
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'light', label: '浅色', icon: SunIcon },
                        { value: 'dark', label: '深色', icon: MoonIcon },
                        { value: 'system', label: '跟随系统', icon: ComputerDesktopIcon },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setMode(value as any)}
                          className={`
                            flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all
                            ${preferences.mode === value 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-border-hover'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </SettingsSection>

                {/* 字体设置 */}
                <SettingsSection title="字体" icon={DocumentTextIcon}>
                  {/* 字体大小 */}
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary mb-2 block">
                      字体大小
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: 'small', label: '小' },
                        { value: 'medium', label: '中' },
                        { value: 'large', label: '大' },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => updatePreferences({ fontSize: value as any })}
                          className={`
                            flex-1 py-2 px-4 rounded-lg border-2 transition-all
                            ${preferences.fontSize === value 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-border-hover'
                            }
                          `}
                        >
                          <span className={`
                            ${value === 'small' ? 'text-sm' : ''}
                            ${value === 'medium' ? 'text-base' : ''}
                            ${value === 'large' ? 'text-lg' : ''}
                          `}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 字体类型 */}
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary mb-2 block">
                      字体类型
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'system', label: '系统默认', sample: 'Aa 你好世界' },
                        { value: 'sans', label: '无衬线', sample: 'Aa 你好世界', style: 'font-sans' },
                        { value: 'serif', label: '衬线', sample: 'Aa 你好世界', style: 'font-serif' },
                      ].map(({ value, label, sample, style }) => (
                        <button
                          key={value}
                          onClick={() => updatePreferences({ fontFamily: value as any })}
                          className={`
                            w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all
                            ${preferences.fontFamily === value 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-border-hover'
                            }
                          `}
                        >
                          <span className="text-sm font-medium">{label}</span>
                          <span className={`text-foreground-secondary ${style || ''}`}>{sample}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </SettingsSection>

                {/* 布局设置 */}
                <SettingsSection title="布局" icon={Square2StackIcon}>
                  {/* 布局密度 */}
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary mb-2 block">
                      布局密度
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: 'compact', label: '紧凑' },
                        { value: 'comfortable', label: '舒适' },
                        { value: 'spacious', label: '宽松' },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => updatePreferences({ density: value as any })}
                          className={`
                            flex-1 py-2 px-4 rounded-lg border-2 transition-all
                            ${preferences.density === value 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-border-hover'
                            }
                          `}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 圆角设置 */}
                  <div>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground-secondary">圆角边框</span>
                      <button
                        onClick={() => updatePreferences({ roundedCorners: !preferences.roundedCorners })}
                        className={`
                          relative w-12 h-6 rounded-full transition-colors
                          ${preferences.roundedCorners ? 'bg-primary' : 'bg-border'}
                        `}
                      >
                        <span className={`
                          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                          ${preferences.roundedCorners ? 'translate-x-6' : ''}
                        `} />
                      </button>
                    </label>
                  </div>
                </SettingsSection>

                {/* 辅助功能 */}
                <SettingsSection title="辅助功能" icon={SparklesIcon}>
                  {/* 减少动画 */}
                  <div>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground-secondary">减少动画</span>
                      <button
                        onClick={() => updatePreferences({ reduceMotion: !preferences.reduceMotion })}
                        className={`
                          relative w-12 h-6 rounded-full transition-colors
                          ${preferences.reduceMotion ? 'bg-primary' : 'bg-border'}
                        `}
                      >
                        <span className={`
                          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                          ${preferences.reduceMotion ? 'translate-x-6' : ''}
                        `} />
                      </button>
                    </label>
                    <p className="text-xs text-foreground-tertiary mt-1">
                      减少界面中的动画效果，适合对动画敏感的用户
                    </p>
                  </div>

                  {/* 高对比度 */}
                  <div>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground-secondary">高对比度</span>
                      <button
                        onClick={() => updatePreferences({ highContrast: !preferences.highContrast })}
                        className={`
                          relative w-12 h-6 rounded-full transition-colors
                          ${preferences.highContrast ? 'bg-primary' : 'bg-border'}
                        `}
                      >
                        <span className={`
                          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                          ${preferences.highContrast ? 'translate-x-6' : ''}
                        `} />
                      </button>
                    </label>
                    <p className="text-xs text-foreground-tertiary mt-1">
                      增强文字和背景的对比度，提高可读性
                    </p>
                  </div>
                </SettingsSection>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}