/**
 * 主题系统类型定义
 */

// 主题模式
export type ThemeMode = 'light' | 'dark' | 'system'

// 主题配色方案
export interface ThemeColors {
  // 主色调
  primary: string
  primaryHover: string
  primaryForeground: string
  
  // 次要色调
  secondary: string
  secondaryHover: string
  secondaryForeground: string
  
  // 背景色
  background: string
  backgroundSecondary: string
  backgroundTertiary: string
  
  // 前景色
  foreground: string
  foregroundSecondary: string
  foregroundTertiary: string
  
  // 边框色
  border: string
  borderHover: string
  
  // 状态色
  success: string
  warning: string
  error: string
  info: string
  
  // 其他
  overlay: string
  shadow: string
}

// 字体配置
export interface ThemeFonts {
  // 字体家族
  sans: string
  serif: string
  mono: string
  
  // 字体大小
  sizes: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
  }
  
  // 行高
  lineHeights: {
    tight: number
    normal: number
    relaxed: number
    loose: number
  }
  
  // 字重
  weights: {
    thin: number
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
    extrabold: number
  }
}

// 间距配置
export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
}

// 圆角配置
export interface ThemeBorderRadius {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

// 动画配置
export interface ThemeAnimations {
  duration: {
    fast: number
    normal: number
    slow: number
  }
  easing: {
    linear: string
    easeIn: string
    easeOut: string
    easeInOut: string
  }
}

// 完整主题配置
export interface Theme {
  name: string
  mode: ThemeMode
  colors: ThemeColors
  fonts: ThemeFonts
  spacing: ThemeSpacing
  borderRadius: ThemeBorderRadius
  animations: ThemeAnimations
}

// 预设主题
export interface PresetTheme extends Theme {
  id: string
  description?: string
  preview?: string
}

// 用户主题偏好
export interface UserThemePreferences {
  // 当前主题
  currentTheme: string
  
  // 主题模式
  mode: ThemeMode
  
  // 自定义颜色
  customColors?: Partial<ThemeColors>
  
  // 字体设置
  fontSize: 'small' | 'medium' | 'large'
  fontFamily: 'system' | 'sans' | 'serif'
  
  // 动画偏好
  reduceMotion: boolean
  
  // 布局密度
  density: 'compact' | 'comfortable' | 'spacious'
  
  // 其他偏好
  roundedCorners: boolean
  highContrast: boolean
}