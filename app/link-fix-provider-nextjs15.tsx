'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Next.js 15 专用链接修复提供者
 * 
 * 利用 Next.js 15.3.0 引入的 onNavigate 事件处理机制
 * 解决链接点击被阻止的问题
 */
export function LinkFixProviderNextJS15() {
  const router = useRouter()
  
  useEffect(() => {
    console.log('🔧 Next.js 15 链接修复提供者已启动')
    
    // 创建自定义 Link 组件的包装器
    const wrapLinks = () => {
      const links = document.querySelectorAll('a[href]:not([data-nextjs15-fixed])')
      
      links.forEach(link => {
        const anchor = link as HTMLAnchorElement
        anchor.dataset.nextjs15Fixed = 'true'
        
        // 为每个链接添加多层事件处理
        const handleNavigation = (e: Event) => {
          const href = anchor.getAttribute('href')
          if (!href) return
          
          // 检查是否是内部链接
          if (href.startsWith('/') && !href.startsWith('//')) {
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()
            
            console.log('🔗 使用 router.push 导航到:', href)
            
            // 使用 Next.js router 进行导航
            // 添加额外的选项以确保导航成功
            router.push(href, {
              scroll: true,
            })
          }
        }
        
        // 在捕获阶段拦截所有相关事件
        anchor.addEventListener('click', handleNavigation, true)
        anchor.addEventListener('auxclick', handleNavigation, true)
        anchor.addEventListener('mousedown', (e) => {
          if (e.button === 0) {
            // 确保链接可以接收点击事件
            anchor.style.pointerEvents = 'auto'
            anchor.style.cursor = 'pointer'
          }
        }, true)
        
        // 添加触摸事件支持（移动设备）
        anchor.addEventListener('touchend', handleNavigation, true)
      })
    }
    
    // 修复 Next.js Portal（如果存在）
    const fixPortal = () => {
      const portal = document.querySelector('nextjs-portal') as HTMLElement
      if (portal) {
        portal.style.pointerEvents = 'none'
        console.log('✅ 修复了 Next.js Portal')
      }
    }
    
    // 添加全局 CSS 修复
    const style = document.createElement('style')
    style.textContent = `
      /* Next.js 15 链接修复 */
      a[href] {
        cursor: pointer !important;
        pointer-events: auto !important;
        position: relative !important;
        z-index: 1 !important;
        -webkit-tap-highlight-color: transparent !important;
        -webkit-touch-callout: none !important;
        user-select: none !important;
      }
      
      /* 确保链接在所有容器中都可点击 */
      * {
        pointer-events: inherit !important;
      }
      
      /* 修复可能的遮挡元素 */
      div[style*="pointer-events: none"] a[href] {
        pointer-events: auto !important;
      }
      
      /* Next.js Portal 修复 */
      nextjs-portal {
        pointer-events: none !important;
      }
      
      /* 移动设备优化 */
      @media (hover: none) and (pointer: coarse) {
        a[href] {
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1) !important;
          touch-action: manipulation !important;
        }
      }
    `
    document.head.appendChild(style)
    
    // 初始修复
    fixPortal()
    wrapLinks()
    
    // 监听 DOM 变化
    const observer = new MutationObserver(() => {
      fixPortal()
      wrapLinks()
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })
    
    // 监听路由变化
    const handleRouteChange = () => {
      setTimeout(() => {
        fixPortal()
        wrapLinks()
      }, 100)
    }
    
    // 添加路由变化监听
    window.addEventListener('popstate', handleRouteChange)
    
    // 清理函数
    return () => {
      observer.disconnect()
      style.remove()
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [router])
  
  return null
}