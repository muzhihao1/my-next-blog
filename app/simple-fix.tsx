'use client'

import { useEffect } from 'react'

export default function SimpleFix() {
  useEffect(() => {
    console.log('🔧 Simple fix initializing...')
    
    // 方案1: 直接使用 window.location 进行所有导航
    const forceNavigation = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link) {
        const href = link.getAttribute('href')
        console.log('👆 Click detected on link:', href)
        
        // 对于内部链接，强制使用 window.location
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          if (!href.endsWith('.xml') && !href.endsWith('.json')) {
            e.preventDefault()
            e.stopPropagation()
            console.log('🚀 Force navigating to:', href)
            window.location.href = href
          }
        }
      }
    }
    
    // 使用捕获阶段确保我们先处理事件
    document.addEventListener('click', forceNavigation, true)
    
    // 方案2: 定期检查并修复所有链接
    const fixAllLinks = () => {
      const links = document.querySelectorAll('a[href^="/"]')
      links.forEach(link => {
        // 移除任何可能阻止点击的样式
        const htmlLink = link as HTMLAnchorElement
        htmlLink.style.pointerEvents = 'auto'
        htmlLink.style.cursor = 'pointer'
        htmlLink.style.position = 'relative'
        htmlLink.style.zIndex = '999'
        
        // 添加一个标记，表示已经修复过
        if (!htmlLink.dataset.fixed) {
          htmlLink.dataset.fixed = 'true'
          console.log('🔨 Fixed link:', htmlLink.href)
        }
      })
    }
    
    // 立即修复
    fixAllLinks()
    
    // 每秒检查一次新链接
    const interval = setInterval(fixAllLinks, 1000)
    
    return () => {
      document.removeEventListener('click', forceNavigation, true)
      clearInterval(interval)
    }
  }, [])
  
  return null
}