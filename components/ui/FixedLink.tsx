'use client'

import { useRouter } from 'next/navigation'
import { AnchorHTMLAttributes, MouseEvent, forwardRef } from 'react'

interface FixedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  prefetch?: boolean
}

// 修复 Next.js 15 Link 组件的导航问题
export const FixedLink = forwardRef<HTMLAnchorElement, FixedLinkProps>(
  ({ href, onClick, children, ...props }, ref) => {
    const router = useRouter()
    
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      // 调用原始的 onClick（如果有）
      if (onClick) {
        onClick(e)
      }
      
      // 如果已经被阻止，不处理
      if (e.defaultPrevented) {
        return
      }
      
      // 只处理内部链接
      const isInternal = href && href.startsWith('/') && !href.startsWith('//')
      const isSpecialFile = href && href.match(/\.(xml|json|html|txt)$/)
      const isAnchor = href && href.startsWith('#')
      const isModifiedClick = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
      const isMiddleClick = e.button === 1
      
      if (isInternal && !isSpecialFile && !isAnchor && !isModifiedClick && !isMiddleClick) {
        e.preventDefault()
        console.log('🔗 FixedLink 导航到:', href)
        router.push(href)
      }
    }
    
    return (
      <a ref={ref} href={href} onClick={handleClick} {...props}>
        {children}
      </a>
    )
  }
)

FixedLink.displayName = 'FixedLink'