'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 这个组件会覆盖所有 Next.js Link 的行为
export default function LinkOverride() {
  const router = useRouter()
  
  useEffect(() => {
    console.log('🔧 Link Override 激活')
    
    // 创建一个 MutationObserver 来监视新添加的链接
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element
            // 查找所有的 a 标签
            const links = element.tagName === 'A' ? [element] : element.querySelectorAll('a')
            links.forEach(attachClickHandler)
          }
        })
      })
    })
    
    // 处理点击的函数
    const handleClick = function(this: HTMLAnchorElement, e: MouseEvent) {
      const href = this.getAttribute('href')
      
      if (!href) return
      
      // 只处理内部链接
      const isInternal = href.startsWith('/') && !href.startsWith('//')
      const isSpecialFile = href.match(/\.(xml|json|html|txt)$/)
      const isAnchor = href.startsWith('#')
      const isModifiedClick = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
      
      if (isInternal && !isSpecialFile && !isAnchor && !isModifiedClick) {
        console.log('🎯 Override: 拦截链接点击', href)
        e.preventDefault()
        e.stopImmediatePropagation() // 阻止其他监听器
        
        // 直接使用 router.push
        router.push(href)
      }
    }
    
    // 为链接附加处理器
    const attachClickHandler = (link: Element) => {
      if (link.tagName === 'A') {
        const anchor = link as HTMLAnchorElement
        // 移除可能存在的旧监听器
        anchor.removeEventListener('click', handleClick as any)
        // 添加新监听器（在捕获阶段，确保最先执行）
        anchor.addEventListener('click', handleClick as any, true)
      }
    }
    
    // 处理所有现有链接
    document.querySelectorAll('a').forEach(attachClickHandler)
    
    // 开始观察 DOM 变化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // 清理函数
    return () => {
      observer.disconnect()
      // 移除所有监听器
      document.querySelectorAll('a').forEach((link) => {
        link.removeEventListener('click', handleClick as any, true)
      })
    }
  }, [router])
  
  return null
}