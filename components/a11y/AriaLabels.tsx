/**
 * ARIA标签优化组件
 * 提供可访问性增强的UI组件
 */
import React from 'react'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
}

/**
 * 跳转到主内容链接
 */
export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a 
      href={href}
      className="absolute left-0 top-0 block -translate-y-full rounded-b bg-blue-600 px-4 py-2 text-white transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </a>
  )
}

interface ScreenReaderOnlyProps {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
}

/**
 * 仅屏幕阅读器可见内容
 */
export function ScreenReaderOnly({ children, as: Component = 'span' }: ScreenReaderOnlyProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  )
}

interface AriaLiveProps {
  children: React.ReactNode
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all'
}

/**
 * ARIA实时区域
 */
export function AriaLive({ 
  children, 
  politeness = 'polite', 
  atomic = false, 
  relevant = 'additions text' 
}: AriaLiveProps) {
  return (
    <div 
      role="status" 
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
    >
      {children}
    </div>
  )
}

interface LandmarkProps {
  children: React.ReactNode
  label: string
  className?: string
}

/**
 * 导航区域
 */
export function Nav({ children, label, className }: LandmarkProps) {
  return (
    <nav role="navigation" aria-label={label} className={className}>
      {children}
    </nav>
  )
}

/**
 * 主要内容区域
 */
export function Main({ children, label, className }: LandmarkProps) {
  return (
    <main role="main" aria-label={label} className={className}>
      {children}
    </main>
  )
}

/**
 * 补充内容区域
 */
export function Aside({ children, label, className }: LandmarkProps) {
  return (
    <aside role="complementary" aria-label={label} className={className}>
      {children}
    </aside>
  )
}

/**
 * 页脚区域
 */
export function Footer({ children, label, className }: LandmarkProps) {
  return (
    <footer role="contentinfo" aria-label={label} className={className}>
      {children}
    </footer>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

/**
 * 可访问的加载指示器
 */
export function LoadingSpinner({ size = 'md', label = '加载中...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div role="status" aria-label={label}>
      <svg
        className={`animate-spin ${sizeClasses[size]} text-blue-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  label: string
  showValue?: boolean
}

/**
 * 可访问的进度条
 */
export function ProgressBar({ value, max = 100, label, showValue = true }: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100)
  
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>
        {showValue && (
          <span className="text-sm font-medium text-gray-700">
            {percentage}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${percentage}%`}
        />
      </div>
    </div>
  )
}

interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
  onEscape?: () => void
}

/**
 * 焦点陷阱组件
 */
export function FocusTrap({ children, active, onEscape }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (!active || !containerRef.current) return
    
    const focusableElements = containerRef.current.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    )
    
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape()
        return
      }
      
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault()
            lastFocusable?.focus()
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault()
            firstFocusable?.focus()
          }
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    firstFocusable?.focus()
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active, onEscape])
  
  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}