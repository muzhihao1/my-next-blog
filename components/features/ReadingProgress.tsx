/**
 * Reading progress indicator component
 * Shows a progress bar at the top of the page that fills as the user scrolls
 */
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface ReadingProgressProps {
  // Height of the progress bar in pixels
  height?: number
  // CSS classes for custom styling
  className?: string
  // Whether to show percentage text
  showPercentage?: boolean
  // Offset from top (e.g., to account for fixed header)
  offset?: number
}

/**
 * Reading progress indicator component
 */
export default function ReadingProgress({
  height = 4,
  className = '',
  showPercentage = false,
  offset = 0
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()
  
  useEffect(() => {
    // Only show on article pages
    const isArticlePage = pathname.startsWith('/posts/')
    setIsVisible(isArticlePage)
    
    if (!isArticlePage) return
    
    const calculateProgress = () => {
      // Get the full document height
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      // Get current scroll position
      const scrolled = window.scrollY
      // Calculate percentage, accounting for offset
      const actualScrolled = Math.max(0, scrolled - offset)
      const actualHeight = Math.max(1, documentHeight - offset)
      const percentage = Math.min(100, Math.max(0, (actualScrolled / actualHeight) * 100))
      
      setProgress(percentage)
    }
    
    // Initial calculation
    calculateProgress()
    
    // Throttled scroll handler
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateProgress()
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', calculateProgress)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', calculateProgress)
    }
  }, [pathname, offset])
  
  if (!isVisible) return null
  
  return (
    <>
      {/* Progress bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-muted/20 ${className}`}
        style={{ height: `${height}px` }}
      >
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Optional percentage display */}
      {showPercentage && (
        <div className="fixed top-4 right-4 z-50 bg-background/90 backdrop-blur-sm border border-border rounded-full px-3 py-1 text-xs font-medium">
          {Math.round(progress)}%
        </div>
      )}
      
      {/* Optional floating indicator */}
      <div
        className="fixed top-16 right-4 z-40 hidden lg:block"
        style={{
          opacity: progress > 5 ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
      >
        <div className="relative w-12 h-12">
          {/* Background circle */}
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
              className="text-primary transition-all duration-150"
            />
          </svg>
          
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </>
  )
}