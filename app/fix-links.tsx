'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FixLinks() {
  const router = useRouter()

  useEffect(() => {
    console.log('🔧 Initializing link fix...')
    console.log('🔧 Router available:', !!router)

    // 修复 Next.js Link 组件的点击问题
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      
      if (anchor && !e.defaultPrevented) {
        const href = anchor.getAttribute('href')
        
        // 检查是否是内部链接
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          // 检查是否是特殊文件（如 .xml）
          if (!href.endsWith('.xml') && !href.endsWith('.json')) {
            console.log('🔗 Intercepting internal link:', href)
            
            // 阻止默认行为
            e.preventDefault()
            e.stopPropagation()
            
            // 使用 Next.js router 进行导航
            try {
              console.log('🚀 Attempting navigation to:', href)
              router.push(href)
              console.log('✅ Navigation command sent')
            } catch (error) {
              console.error('❌ Navigation failed:', error)
              // 如果 router.push 失败，使用 window.location 作为后备
              console.log('🔄 Falling back to window.location')
              window.location.href = href
            }
          }
        }
      }
    }

    // 添加全局点击监听器（捕获阶段）
    document.addEventListener('click', handleClick, true)

    // 修复所有可能被 CSS 影响的链接
    const fixLinkStyles = () => {
      const links = document.querySelectorAll('a')
      links.forEach(link => {
        const styles = window.getComputedStyle(link)
        
        // 如果链接被设置为 pointer-events: none，修复它
        if (styles.pointerEvents === 'none') {
          link.style.pointerEvents = 'auto'
          console.log('🔧 Fixed pointer-events for:', link.href)
        }
        
        // 确保链接有正确的 cursor
        if (styles.cursor !== 'pointer') {
          link.style.cursor = 'pointer'
        }
        
        // 确保链接不被其他元素遮挡
        const rect = link.getBoundingClientRect()
        const elementsAtPoint = document.elementsFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        )
        
        if (elementsAtPoint[0] !== link && !link.contains(elementsAtPoint[0])) {
          link.style.position = 'relative'
          link.style.zIndex = '10'
          console.log('🔧 Fixed z-index for:', link.href)
        }
      })
    }

    // 立即修复
    fixLinkStyles()

    // 延迟再次修复（等待所有组件加载）
    setTimeout(fixLinkStyles, 1000)

    // 监听 DOM 变化，持续修复新添加的链接
    const observer = new MutationObserver(() => {
      fixLinkStyles()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      document.removeEventListener('click', handleClick, true)
      observer.disconnect()
    }
  }, [router])

  return null
}