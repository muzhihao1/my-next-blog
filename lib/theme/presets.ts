/**
 * 预设主题配置
 */

import { PresetTheme } from './types'

// 默认主题（亮色）
export const defaultTheme: PresetTheme = {
  id: 'default',
  name: '默认主题',
  description: '清新简洁的默认主题',
  mode: 'light',
  colors: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryForeground: '#ffffff',
    
    secondary: '#8b5cf6',
    secondaryHover: '#7c3aed',
    secondaryForeground: '#ffffff',
    
    background: '#ffffff',
    backgroundSecondary: '#f9fafb',
    backgroundTertiary: '#f3f4f6',
    
    foreground: '#111827',
    foregroundSecondary: '#4b5563',
    foregroundTertiary: '#9ca3af',
    
    border: '#e5e7eb',
    borderHover: '#d1d5db',
    
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    weights: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '2.5rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
}

// 暗色主题
export const darkTheme: PresetTheme = {
  id: 'dark',
  name: '暗夜主题',
  description: '适合夜间阅读的暗色主题',
  mode: 'dark',
  colors: {
    primary: '#60a5fa',
    primaryHover: '#3b82f6',
    primaryForeground: '#000000',
    
    secondary: '#a78bfa',
    secondaryHover: '#8b5cf6',
    secondaryForeground: '#000000',
    
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundTertiary: '#334155',
    
    foreground: '#f1f5f9',
    foregroundSecondary: '#cbd5e1',
    foregroundTertiary: '#94a3b8',
    
    border: '#334155',
    borderHover: '#475569',
    
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  fonts: defaultTheme.fonts,
  spacing: defaultTheme.spacing,
  borderRadius: defaultTheme.borderRadius,
  animations: defaultTheme.animations,
}

// 护眼主题
export const eyeCareTheme: PresetTheme = {
  id: 'eyecare',
  name: '护眼主题',
  description: '柔和的色彩，保护眼睛',
  mode: 'light',
  colors: {
    primary: '#059669',
    primaryHover: '#047857',
    primaryForeground: '#ffffff',
    
    secondary: '#0891b2',
    secondaryHover: '#0e7490',
    secondaryForeground: '#ffffff',
    
    background: '#f7fee7',
    backgroundSecondary: '#ecfccb',
    backgroundTertiary: '#d9f99d',
    
    foreground: '#1a202c',
    foregroundSecondary: '#2d3748',
    foregroundTertiary: '#4a5568',
    
    border: '#bef264',
    borderHover: '#a3e635',
    
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0891b2',
    
    overlay: 'rgba(0, 0, 0, 0.4)',
    shadow: 'rgba(0, 0, 0, 0.08)',
  },
  fonts: defaultTheme.fonts,
  spacing: defaultTheme.spacing,
  borderRadius: defaultTheme.borderRadius,
  animations: defaultTheme.animations,
}

// 高对比度主题
export const highContrastTheme: PresetTheme = {
  id: 'highcontrast',
  name: '高对比度',
  description: '增强对比度，提高可读性',
  mode: 'light',
  colors: {
    primary: '#000000',
    primaryHover: '#1a1a1a',
    primaryForeground: '#ffffff',
    
    secondary: '#404040',
    secondaryHover: '#262626',
    secondaryForeground: '#ffffff',
    
    background: '#ffffff',
    backgroundSecondary: '#fafafa',
    backgroundTertiary: '#f5f5f5',
    
    foreground: '#000000',
    foregroundSecondary: '#1a1a1a',
    foregroundTertiary: '#404040',
    
    border: '#000000',
    borderHover: '#1a1a1a',
    
    success: '#008000',
    warning: '#ff8c00',
    error: '#dc143c',
    info: '#0000ff',
    
    overlay: 'rgba(0, 0, 0, 0.9)',
    shadow: 'rgba(0, 0, 0, 0.2)',
  },
  fonts: defaultTheme.fonts,
  spacing: defaultTheme.spacing,
  borderRadius: {
    none: '0',
    sm: '0',
    md: '0',
    lg: '0',
    xl: '0',
    full: '0',
  },
  animations: {
    duration: {
      fast: 0,
      normal: 0,
      slow: 0,
    },
    easing: defaultTheme.animations.easing,
  },
}

// 紫色主题
export const purpleTheme: PresetTheme = {
  id: 'purple',
  name: '紫罗兰',
  description: '优雅的紫色调主题',
  mode: 'light',
  colors: {
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    primaryForeground: '#ffffff',
    
    secondary: '#ec4899',
    secondaryHover: '#db2777',
    secondaryForeground: '#ffffff',
    
    background: '#faf5ff',
    backgroundSecondary: '#f3e8ff',
    backgroundTertiary: '#e9d5ff',
    
    foreground: '#1e1b4b',
    foregroundSecondary: '#4c1d95',
    foregroundTertiary: '#6b21a8',
    
    border: '#e9d5ff',
    borderHover: '#d8b4fe',
    
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#7c3aed',
    
    overlay: 'rgba(139, 92, 246, 0.1)',
    shadow: 'rgba(139, 92, 246, 0.1)',
  },
  fonts: defaultTheme.fonts,
  spacing: defaultTheme.spacing,
  borderRadius: defaultTheme.borderRadius,
  animations: defaultTheme.animations,
}

// 蓝色主题
export const blueTheme: PresetTheme = {
  id: 'blue',
  name: '海洋之心',
  description: '清爽的蓝色调主题',
  mode: 'light',
  colors: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    primaryForeground: '#ffffff',
    
    secondary: '#06b6d4',
    secondaryHover: '#0891b2',
    secondaryForeground: '#ffffff',
    
    background: '#f0f9ff',
    backgroundSecondary: '#e0f2fe',
    backgroundTertiary: '#bae6fd',
    
    foreground: '#0c4a6e',
    foregroundSecondary: '#075985',
    foregroundTertiary: '#0369a1',
    
    border: '#bae6fd',
    borderHover: '#7dd3fc',
    
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7',
    
    overlay: 'rgba(14, 165, 233, 0.1)',
    shadow: 'rgba(14, 165, 233, 0.1)',
  },
  fonts: defaultTheme.fonts,
  spacing: defaultTheme.spacing,
  borderRadius: defaultTheme.borderRadius,
  animations: defaultTheme.animations,
}

// 所有预设主题
export const presetThemes: PresetTheme[] = [
  defaultTheme,
  darkTheme,
  eyeCareTheme,
  highContrastTheme,
  purpleTheme,
  blueTheme,
]

// 根据 ID 获取主题
export function getThemeById(id: string): PresetTheme | undefined {
  return presetThemes.find(theme => theme.id === id)
}

// 根据模式获取主题
export function getThemesByMode(mode: 'light' | 'dark'): PresetTheme[] {
  return presetThemes.filter(theme => theme.mode === mode)
}