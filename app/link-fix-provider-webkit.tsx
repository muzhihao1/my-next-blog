'use client'

import { useEffect } from 'react'

/**
 * WebKit 浏览器专用链接修复提供者
 * 
 * 专门解决 Arc/Dia 等 WebKit 浏览器的链接点击问题
 * 使用最激进的修复策略
 */
export function LinkFixProviderWebKit() {
  useEffect(() => {
    console.log('🦁 WebKit 链接修复提供者已启动')
    
    // 检测是否是 WebKit 浏览器
    const isWebKit = () => {
      const ua = navigator.userAgent.toLowerCase()
      const vendor = navigator.vendor?.toLowerCase() || ''
      
      // 检测各种 WebKit 标志
      return (
        'WebkitAppearance' in document.documentElement.style ||
        /webkit/i.test(ua) ||
        /safari/i.test(ua) ||
        /arc/i.test(ua) ||
        /dia/i.test(ua) ||
        (window.CSS && CSS.supports('-webkit-appearance', 'none'))
      )
    }
    
    if (!isWebKit()) {
      console.log('✅ 非 WebKit 浏览器，跳过特殊修复')
      return
    }
    
    console.log('⚠️ 检测到 WebKit 浏览器，应用激进修复策略')
    
    // 策略1：重写所有链接的默认行为
    const rewriteAllLinks = () => {
      const links = document.querySelectorAll('a[href]')
      links.forEach(link => {
        const anchor = link as HTMLAnchorElement
        const href = anchor.getAttribute('href')
        
        if (!href || href.startsWith('http') || href.startsWith('mailto:')) {
          return
        }
        
        // 移除所有现有的事件监听器（如果可能）
        const newAnchor = anchor.cloneNode(true) as HTMLAnchorElement
        anchor.parentNode?.replaceChild(newAnchor, anchor)
        
        // 添加新的点击处理
        newAnchor.onclick = (e: MouseEvent) => {
          if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
            e.preventDefault()
            e.stopPropagation()
            console.log('🔗 WebKit 修复：导航到', href)
            window.location.href = href
            return false
          }
        }
        
        // 标记已处理
        newAnchor.dataset.webkitFixed = 'true'
      })
    }
    
    // 策略2：全局事件捕获（最高优先级）
    const globalCapture = (e: Event) => {
      if (e.type !== 'click' && e.type !== 'touchend') return
      
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (!link) return
      
      const href = link.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return
      
      const mouseEvent = e as MouseEvent
      if (mouseEvent.ctrlKey || mouseEvent.metaKey || mouseEvent.shiftKey || 
          (mouseEvent.button !== undefined && mouseEvent.button !== 0)) {
        return
      }
      
      console.log('🎯 WebKit 全局捕获：拦截链接点击', href)
      
      // 立即停止所有事件传播
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      
      // 延迟导航以确保事件被完全阻止
      setTimeout(() => {
        window.location.href = href
      }, 0)
      
      return false
    }
    
    // 在捕获阶段监听所有可能的事件
    const captureOptions = { capture: true, passive: false }
    document.addEventListener('click', globalCapture, captureOptions)
    document.addEventListener('touchend', globalCapture, captureOptions)
    document.addEventListener('pointerup', globalCapture, captureOptions)
    document.addEventListener('mouseup', globalCapture, captureOptions)
    
    // 策略3：激进的 CSS 修复
    const style = document.createElement('style')
    style.textContent = `
      /* WebKit 激进修复 */
      @supports (-webkit-appearance: none) {
        /* 重置所有元素的 pointer-events */
        * {
          pointer-events: auto !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none !important;
        }
        
        /* 确保链接始终可点击 */
        a[href] {
          cursor: pointer !important;
          pointer-events: auto !important;
          position: relative !important;
          z-index: 999999 !important;
          display: inline-block !important;
          touch-action: manipulation !important;
          -webkit-user-drag: none !important;
          -webkit-app-region: no-drag !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }
        
        /* 阻止所有可能的覆盖层 */
        body > *:not(main):not(header):not(footer):not(nav):not([role="main"]):not([role="navigation"]) {
          pointer-events: none !important;
        }
        
        /* Next.js 特定元素 */
        nextjs-portal,
        [id^="__next"],
        [class*="nextjs-"],
        [data-nextjs-scroll-focus-boundary],
        #__next-build-error-dialog {
          display: none !important;
          pointer-events: none !important;
          z-index: -999999 !important;
        }
        
        /* Arc/Dia 特定元素 */
        arc-boost-element,
        dia-element,
        [class*="arc-"],
        [class*="dia-"],
        [id*="arc-"],
        [id*="dia-"] {
          pointer-events: none !important;
          display: none !important;
        }
        
        /* 确保主要内容区域可交互 */
        main *,
        [role="main"] *,
        article *,
        section * {
          pointer-events: auto !important;
        }
        
        /* 修复可能的 z-index 问题 */
        body {
          position: relative !important;
          z-index: 0 !important;
        }
        
        main,
        [role="main"] {
          position: relative !important;
          z-index: 1 !important;
        }
      }
      
      /* 移动设备 WebKit 特定 */
      @media (hover: none) and (pointer: coarse) {
        a[href] {
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1) !important;
          touch-action: manipulation !important;
        }
      }
    `
    document.head.appendChild(style)
    
    // 策略4：定期清理和重写
    const maintenance = () => {
      // 移除所有可能的阻塞元素
      const blockers = document.querySelectorAll(`
        nextjs-portal,
        [id^="__next-build-error"],
        [class*="arc-boost"],
        [class*="dia-element"]
      `)
      
      blockers.forEach(el => el.remove())
      
      // 重写所有链接
      rewriteAllLinks()
    }
    
    // 立即执行
    maintenance()
    
    // 定期执行（每 200ms）
    const maintenanceInterval = setInterval(maintenance, 200)
    
    // DOM 变化监听（立即处理）
    const observer = new MutationObserver((mutations) => {
      // 检查是否有新链接添加
      let hasNewLinks = false
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (node.tagName === 'A' || node.querySelector('a')) {
              hasNewLinks = true
            }
          }
        })
      })
      
      if (hasNewLinks) {
        console.log('🔄 检测到新链接，立即处理')
        rewriteAllLinks()
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // 策略5：拦截所有导航尝试
    if (window.history && window.history.pushState) {
      const originalPushState = window.history.pushState
      window.history.pushState = function(...args) {
        console.log('🚀 拦截 pushState:', args)
        return originalPushState.apply(window.history, args)
      }
    }
    
    // 调试信息
    console.log('✅ WebKit 激进修复已部署：')
    console.log('- 全局事件捕获（4 种事件类型）')
    console.log('- 链接重写和克隆')
    console.log('- 激进 CSS 覆盖')
    console.log('- 定期维护（200ms）')
    console.log('- DOM 变化即时响应')
    
    // 清理函数
    return () => {
      document.removeEventListener('click', globalCapture, captureOptions as any)
      document.removeEventListener('touchend', globalCapture, captureOptions as any)
      document.removeEventListener('pointerup', globalCapture, captureOptions as any)
      document.removeEventListener('mouseup', globalCapture, captureOptions as any)
      clearInterval(maintenanceInterval)
      observer.disconnect()
      style.remove()
    }
  }, [])
  
  return null
}