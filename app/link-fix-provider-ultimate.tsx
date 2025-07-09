'use client'

import { useEffect } from 'react'

/**
 * 终极链接修复提供者
 * 
 * 这是最彻底的解决方案，完全接管所有链接点击事件
 * 确保在任何情况下链接都能正常工作
 */
export function LinkFixProviderUltimate() {
  useEffect(() => {
    console.log('🚀 终极链接修复提供者已启动')
    
    // 保存原始的 addEventListener
    const originalAddEventListener = EventTarget.prototype.addEventListener
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener
    
    // 存储所有的事件监听器
    const eventListeners = new WeakMap<EventTarget, Map<string, Set<EventListener>>>()
    
    // 重写 addEventListener
    EventTarget.prototype.addEventListener = function(
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions
    ) {
      // 如果是点击事件且目标是链接，记录下来
      if (type === 'click' && this instanceof HTMLElement) {
        const element = this as HTMLElement
        const isLink = element.tagName === 'A' || element.closest('a')
        
        if (isLink) {
          console.log('🔍 检测到链接点击监听器注册:', {
            element: element.tagName,
            href: (element as HTMLAnchorElement).href || element.closest('a')?.href,
            capture: typeof options === 'object' ? options.capture : options,
            listener: listener?.toString()?.substring(0, 100) + '...'
          })
        }
      }
      
      // 调用原始方法
      return originalAddEventListener.call(this, type, listener, options)
    }
    
    // 全局点击事件拦截器 - 最高优先级
    const globalClickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (!link) return
      
      const href = link.getAttribute('href')
      if (!href) return
      
      // 检查是否是内部链接
      if (href.startsWith('/') && !href.startsWith('//')) {
        // 检查特殊键
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
          return
        }
        
        console.log('🎯 终极修复：拦截链接点击', href)
        
        // 立即阻止所有传播
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        
        // 强制导航
        window.location.href = href
        
        // 返回 false 进一步阻止事件
        return false
      }
    }
    
    // 在捕获阶段最早拦截
    document.addEventListener('click', globalClickHandler, true)
    
    // 备用方案：mousedown 事件
    const mousedownHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && e.button === 0) {
        // 确保链接元素可以接收后续的点击事件
        link.style.pointerEvents = 'auto'
        link.style.cursor = 'pointer'
        
        // 移除可能的遮挡
        const parent = link.parentElement
        if (parent) {
          const computedStyle = window.getComputedStyle(parent)
          if (computedStyle.pointerEvents === 'none') {
            parent.style.pointerEvents = 'auto'
          }
        }
      }
    }
    
    document.addEventListener('mousedown', mousedownHandler, true)
    
    // 触摸设备支持
    const touchendHandler = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (!link) return
      
      const href = link.getAttribute('href')
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        e.preventDefault()
        e.stopPropagation()
        window.location.href = href
      }
    }
    
    document.addEventListener('touchend', touchendHandler, true)
    
    // CSS 修复 - 最激进的版本
    const style = document.createElement('style')
    style.textContent = `
      /* 终极链接修复 CSS */
      * {
        pointer-events: auto !important;
      }
      
      a[href] {
        cursor: pointer !important;
        pointer-events: auto !important;
        position: relative !important;
        z-index: 9999 !important;
        display: inline-block !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
        -webkit-touch-callout: none !important;
        touch-action: manipulation !important;
      }
      
      /* 确保链接容器不会阻止点击 */
      a[href] * {
        pointer-events: none !important;
      }
      
      /* Next.js 特定修复 */
      nextjs-portal,
      [id^="__next-build-error"],
      [class*="nextjs-"],
      [data-nextjs-scroll-focus-boundary] {
        pointer-events: none !important;
        z-index: -1 !important;
      }
      
      /* 移除所有可能的遮挡层 */
      div[style*="z-index: 9999"],
      div[style*="z-index: 2147483647"] {
        pointer-events: none !important;
      }
      
      /* 确保body和html不会阻止事件 */
      html, body {
        pointer-events: auto !important;
      }
      
      /* 调试模式 - 高亮所有链接 */
      @media (prefers-color-scheme: debug) {
        a[href] {
          outline: 2px solid red !important;
          outline-offset: 2px !important;
        }
      }
    `
    document.head.appendChild(style)
    
    // 定期扫描并修复链接
    const fixAllLinks = () => {
      const links = document.querySelectorAll('a[href]')
      links.forEach(link => {
        const anchor = link as HTMLAnchorElement
        
        // 确保链接样式正确
        anchor.style.cursor = 'pointer'
        anchor.style.pointerEvents = 'auto'
        anchor.style.position = 'relative'
        anchor.style.zIndex = '9999'
        
        // 添加标记
        if (!anchor.dataset.ultimateFixed) {
          anchor.dataset.ultimateFixed = 'true'
          
          // 为每个链接添加直接的点击处理
          anchor.onclick = (e: MouseEvent) => {
            const href = anchor.getAttribute('href')
            if (href && href.startsWith('/') && !href.startsWith('//')) {
              if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                e.preventDefault()
                window.location.href = href
                return false
              }
            }
          }
        }
      })
      
      // 修复 Next.js Portal
      const portals = document.querySelectorAll('nextjs-portal, [id^="__next"]')
      portals.forEach(portal => {
        if (portal instanceof HTMLElement) {
          portal.style.pointerEvents = 'none'
          portal.style.zIndex = '-1'
        }
      })
    }
    
    // 立即修复
    fixAllLinks()
    
    // 定期修复（每秒一次）
    const interval = setInterval(fixAllLinks, 1000)
    
    // DOM 变化监听
    const observer = new MutationObserver(() => {
      requestAnimationFrame(fixAllLinks)
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'href']
    })
    
    // 调试信息
    console.log('✅ 终极链接修复已部署，特性：')
    console.log('- 全局点击事件拦截')
    console.log('- CSS pointer-events 强制修复')
    console.log('- 定期链接扫描和修复')
    console.log('- Next.js Portal 禁用')
    console.log('- 触摸设备支持')
    
    // 清理函数
    return () => {
      // 恢复原始方法
      EventTarget.prototype.addEventListener = originalAddEventListener
      EventTarget.prototype.removeEventListener = originalRemoveEventListener
      
      // 移除事件监听器
      document.removeEventListener('click', globalClickHandler, true)
      document.removeEventListener('mousedown', mousedownHandler, true)
      document.removeEventListener('touchend', touchendHandler, true)
      
      // 清理其他资源
      clearInterval(interval)
      observer.disconnect()
      style.remove()
    }
  }, [])
  
  return null
}