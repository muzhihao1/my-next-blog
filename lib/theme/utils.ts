/**
 * 主题系统工具函数
 */

import { Theme, UserThemePreferences } from './types'

/**
 * 应用主题到 DOM
 */
export function applyTheme(theme: Theme, preferences: UserThemePreferences) {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement

  // 应用颜色变量
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    root.style.setProperty(`--color-${cssKey}`, value)
  })

  // 应用字体设置
  root.style.setProperty('--font-sans', theme.fonts.sans)
  root.style.setProperty('--font-serif', theme.fonts.serif)
  root.style.setProperty('--font-mono', theme.fonts.mono)

  // 应用字体大小基于用户偏好
  const fontSizeScale = {
    small: 0.875,
    medium: 1,
    large: 1.125,
  }
  const scale = fontSizeScale[preferences.fontSize]
  
  Object.entries(theme.fonts.sizes).forEach(([key, value]) => {
    const scaledValue = `calc(${value} * ${scale})`
    root.style.setProperty(`--font-size-${key}`, scaledValue)
  })

  // 应用间距
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value)
  })

  // 应用圆角
  if (preferences.roundedCorners) {
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value)
    })
  } else {
    // 禁用圆角
    Object.keys(theme.borderRadius).forEach(key => {
      root.style.setProperty(`--radius-${key}`, '0')
    })
  }

  // 应用动画持续时间
  if (preferences.reduceMotion) {
    root.style.setProperty('--animation-duration-fast', '0ms')
    root.style.setProperty('--animation-duration-normal', '0ms')
    root.style.setProperty('--animation-duration-slow', '0ms')
  } else {
    Object.entries(theme.animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--animation-duration-${key}`, `${value}ms`)
    })
  }

  // 应用布局密度
  const densityScale = {
    compact: 0.75,
    comfortable: 1,
    spacious: 1.25,
  }
  root.style.setProperty('--density-scale', String(densityScale[preferences.density]))

  // 应用高对比度
  if (preferences.highContrast) {
    root.classList.add('high-contrast')
  } else {
    root.classList.remove('high-contrast')
  }

  // 应用主题模式
  root.setAttribute('data-theme', theme.mode)
  root.setAttribute('data-theme-id', theme.name)

  // 更新字体家族类
  root.classList.remove('font-system', 'font-sans', 'font-serif')
  root.classList.add(`font-${preferences.fontFamily}`)
}

/**
 * 获取系统主题偏好
 */
export function getSystemThemePreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * 获取对比度增强的颜色
 */
export function getHighContrastColor(color: string, isDark: boolean): string {
  // 简单的对比度增强逻辑
  if (isDark) {
    // 在暗色模式下，使颜色更亮
    return color.replace(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i, (_, r, g, b) => {
      const newR = Math.min(255, parseInt(r, 16) + 50).toString(16).padStart(2, '0')
      const newG = Math.min(255, parseInt(g, 16) + 50).toString(16).padStart(2, '0')
      const newB = Math.min(255, parseInt(b, 16) + 50).toString(16).padStart(2, '0')
      return `#${newR}${newG}${newB}`
    })
  } else {
    // 在亮色模式下，使颜色更暗
    return color.replace(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i, (_, r, g, b) => {
      const newR = Math.max(0, parseInt(r, 16) - 50).toString(16).padStart(2, '0')
      const newG = Math.max(0, parseInt(g, 16) - 50).toString(16).padStart(2, '0')
      const newB = Math.max(0, parseInt(b, 16) - 50).toString(16).padStart(2, '0')
      return `#${newR}${newG}${newB}`
    })
  }
}

/**
 * 生成主题预览样式
 */
export function generateThemePreview(theme: Theme): string {
  return `
    background: ${theme.colors.background};
    color: ${theme.colors.foreground};
    border: 2px solid ${theme.colors.border};
    font-family: ${theme.fonts.sans};
  `
}

/**
 * 验证主题对象的完整性
 */
export function validateTheme(theme: any): theme is Theme {
  if (!theme || typeof theme !== 'object') return false
  
  const requiredFields = ['name', 'mode', 'colors', 'fonts', 'spacing', 'borderRadius', 'animations']
  const hasAllFields = requiredFields.every(field => field in theme)
  
  if (!hasAllFields) return false
  
  // 验证颜色字段
  const requiredColors = [
    'primary', 'primaryHover', 'primaryForeground',
    'secondary', 'secondaryHover', 'secondaryForeground',
    'background', 'backgroundSecondary', 'backgroundTertiary',
    'foreground', 'foregroundSecondary', 'foregroundTertiary',
    'border', 'borderHover',
    'success', 'warning', 'error', 'info',
    'overlay', 'shadow'
  ]
  
  return requiredColors.every(color => color in theme.colors)
}

/**
 * 混合两个主题
 */
export function mergeThemes(baseTheme: Theme, overrides: Partial<Theme>): Theme {
  return {
    ...baseTheme,
    ...overrides,
    colors: { ...baseTheme.colors, ...(overrides.colors || {}) },
    fonts: { 
      ...baseTheme.fonts, 
      ...(overrides.fonts || {}),
      sizes: { ...baseTheme.fonts.sizes, ...(overrides.fonts?.sizes || {}) },
      lineHeights: { ...baseTheme.fonts.lineHeights, ...(overrides.fonts?.lineHeights || {}) },
      weights: { ...baseTheme.fonts.weights, ...(overrides.fonts?.weights || {}) },
    },
    spacing: { ...baseTheme.spacing, ...(overrides.spacing || {}) },
    borderRadius: { ...baseTheme.borderRadius, ...(overrides.borderRadius || {}) },
    animations: {
      ...baseTheme.animations,
      ...(overrides.animations || {}),
      duration: { ...baseTheme.animations.duration, ...(overrides.animations?.duration || {}) },
      easing: { ...baseTheme.animations.easing, ...(overrides.animations?.easing || {}) },
    },
  }
}

/**
 * 导出主题为 JSON
 */
export function exportTheme(theme: Theme): string {
  return JSON.stringify(theme, null, 2)
}

/**
 * 导入主题从 JSON
 */
export function importTheme(json: string): Theme | null {
  try {
    const theme = JSON.parse(json)
    if (validateTheme(theme)) {
      return theme
    }
    return null
  } catch {
    return null
  }
}