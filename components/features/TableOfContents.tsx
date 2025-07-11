/**
 * Table of Contents component for article navigation
 * Automatically extracts headings and provides sticky navigation
 */
'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content?: string // Optional content prop for server-side extraction
  selector?: string // CSS selector for content container
}

/**
 * Article table of contents navigation component
 */
export default function TableOfContents({
  content,
  selector = '.prose'
}: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const observerRef = useRef<IntersectionObserver | null>(null)
  
  // Extract headings from content or DOM
  useEffect(() => {
    const extractHeadings = () => {
      let headings: TOCItem[] = []
      
      if (content) {
        // Extract from content string (server-side)
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = content
        const elements = tempDiv.querySelectorAll('h2, h3, h4')
        
        headings = Array.from(elements).map((element) => {
          const id = element.id || element.textContent?.toLowerCase().replace(/\s+/g, '-') || ''
          return {
            id,
            text: element.textContent || '',
            level: parseInt(element.tagName.charAt(1))
          }
        })
      } else {
        // Extract from DOM (client-side)
        const contentElement = document.querySelector(selector)
        if (!contentElement) return
        
        const elements = contentElement.querySelectorAll('h2, h3, h4')
        headings = Array.from(elements).map((element) => {
          // Ensure each heading has an ID
          if (!element.id) {
            element.id = element.textContent?.toLowerCase().replace(/\s+/g, '-') || ''
          }
          
          return {
            id: element.id,
            text: element.textContent || '',
            level: parseInt(element.tagName.charAt(1))
          }
        })
      }
      
      setTocItems(headings)
    }
    
    // Delay to ensure content is rendered
    const timer = setTimeout(extractHeadings, 100)
    return () => clearTimeout(timer)
  }, [content, selector, pathname])
  
  // Set up intersection observer for active heading
  useEffect(() => {
    if (tocItems.length === 0) return
    
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    
    const observerOptions = {
      rootMargin: '-20% 0% -70% 0%',
      threshold: 0
    }
    
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }, observerOptions)
    
    // Observe all headings
    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element && observerRef.current) {
        observerRef.current.observe(element)
      }
    })
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [tocItems])
  
  // Handle click navigation
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
      setActiveId(id)
    }
  }
  
  if (tocItems.length === 0) {
    return null
  }
  
  return (
    <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="bg-card border border-border rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            目录
          </h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden p-1 hover:bg-muted rounded transition-colors"
            aria-label={isCollapsed ? '展开目录' : '收起目录'}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        
        {/* TOC Items */}
        <ul className={`space-y-2 text-sm ${isCollapsed ? 'hidden lg:block' : 'block'}`}>
          {tocItems.map((item) => {
            const isActive = activeId === item.id
            const paddingLeft = (item.level - 2) * 16
            
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`
                    block py-1.5 px-3 rounded transition-all duration-200
                    ${isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                  style={{ paddingLeft: `${paddingLeft + 12}px` }}
                >
                  <span className="line-clamp-2">{item.text}</span>
                </a>
              </li>
            )
          })}
        </ul>
        
        {/* Progress indicator */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>阅读进度</span>
            <span>
              {Math.round((tocItems.findIndex(item => item.id === activeId) + 1) / tocItems.length * 100)}%
            </span>
          </div>
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${((tocItems.findIndex(item => item.id === activeId) + 1) / tocItems.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}