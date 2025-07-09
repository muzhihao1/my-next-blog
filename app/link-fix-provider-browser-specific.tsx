'use client'

import { useEffect } from 'react'

/**
 * 浏览器特定链接修复提供者
 * 
 * 检测不同浏览器并提供针对性的修复方案
 * 特别针对 Dia/Arc 等基于 Chromium 的浏览器
 */
export function LinkFixProviderBrowserSpecific() {
  useEffect(() => {
    // 浏览器检测
    const detectBrowser = () => {
      const ua = navigator.userAgent.toLowerCase()
      const vendor = navigator.vendor?.toLowerCase() || ''
      
      // 检测各种浏览器
      const isChrome = /chrome/.test(ua) && /google inc/.test(vendor)
      const isArc = /arc/.test(ua) || window.navigator.userAgent.includes('Arc')
      const isDia = /dia/.test(ua) // Dia 浏览器检测
      const isSafari = /safari/.test(ua) && /apple/.test(vendor) && !/chrome/.test(ua)
      const isFirefox = /firefox/.test(ua)
      const isEdge = /edg/.test(ua)
      
      // 检测基于 Chromium 但非 Chrome 的浏览器
      const isChromiumBased = /chrome/.test(ua) && !isChrome
      
      return {
        isChrome,
        isArc,
        isDia,
        isSafari,
        isFirefox,
        isEdge,
        isChromiumBased,
        userAgent: navigator.userAgent,
        vendor: navigator.vendor
      }
    }
    
    const browserInfo = detectBrowser()
    console.log('🌐 浏览器检测结果:', browserInfo)
    
    // 如果是 Chrome，可能不需要修复
    if (browserInfo.isChrome && !browserInfo.isArc && !browserInfo.isDia) {
      console.log('✅ Chrome 浏览器检测到，链接应该正常工作')
      // 但仍然添加基础修复以防万一
    }
    
    // Dia/Arc 浏览器特定修复
    if (browserInfo.isDia || browserInfo.isArc || browserInfo.isChromiumBased) {
      console.log('⚠️ 检测到 Dia/Arc/Chromium 浏览器，应用特定修复')
      
      // 更激进的事件处理
      const handleLinkClick = (e: Event) => {
        const target = e.target as HTMLElement
        const link = target.closest('a[href]') as HTMLAnchorElement
        
        if (!link) return
        
        const href = link.getAttribute('href')
        if (!href || !href.startsWith('/') || href.startsWith('//')) return
        
        // 特殊键检查
        const mouseEvent = e as MouseEvent
        if (mouseEvent.ctrlKey || mouseEvent.metaKey || mouseEvent.shiftKey || mouseEvent.button !== 0) {
          return
        }
        
        console.log('🔗 Dia/Arc 浏览器：强制导航到', href)
        
        // 立即阻止所有事件传播
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        
        // 使用多种方法尝试导航
        try {
          // 方法1：直接修改 location
          window.location.href = href
        } catch (error) {
          console.error('导航失败，尝试备用方法:', error)
          // 方法2：使用 location.assign
          try {
            window.location.assign(href)
          } catch (error2) {
            console.error('备用方法也失败:', error2)
            // 方法3：创建并点击新链接
            const tempLink = document.createElement('a')
            tempLink.href = href
            tempLink.style.display = 'none'
            document.body.appendChild(tempLink)
            tempLink.click()
            document.body.removeChild(tempLink)
          }
        }
        
        return false
      }
      
      // 使用多个事件监听器确保捕获点击
      const events = ['click', 'auxclick', 'mouseup', 'pointerup']
      events.forEach(event => {
        document.addEventListener(event, handleLinkClick, true)
      })
      
      // 添加触摸事件处理（针对 WebKit 触摸设备）
      const handleTouchEnd = (e: TouchEvent) => {
        const target = e.target as HTMLElement
        const link = target.closest('a[href]') as HTMLAnchorElement
        
        if (!link) return
        
        const href = link.getAttribute('href')
        if (!href || !href.startsWith('/') || href.startsWith('//')) return
        
        console.log('📱 触摸事件：导航到', href)
        
        e.preventDefault()
        e.stopPropagation()
        window.location.href = href
      }
      
      // 添加触摸事件监听（WebKit 特定）
      document.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true })
      
      // 处理可能阻止事件的元素
      const preventBlockingElements = () => {
        // 查找所有可能阻止点击的元素
        const blockingSelectors = [
          'nextjs-portal',
          '[id^="__next-build-error"]',
          '[class*="nextjs-"]',
          '[data-nextjs-scroll-focus-boundary]',
          'arc-boost-element',
          'dia-element',
          '[class*="arc-"]',
          '[class*="dia-"]'
        ]
        
        blockingSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector)
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.pointerEvents = 'none'
              // WebKit 特定：同时设置 touch-action
              el.style.touchAction = 'none'
              el.style.webkitTouchCallout = 'none'
              el.style.zIndex = '-1'
            }
          })
        })
      }
      
      // 立即执行一次
      preventBlockingElements()
      
      // 定期执行（每 500ms）
      const blockingInterval = setInterval(preventBlockingElements, 500)
      
      // Dia/Arc 特定的 CSS 修复
      const style = document.createElement('style')
      style.textContent = `
        /* Dia/Arc 浏览器特定修复 */
        * {
          -webkit-user-select: auto !important;
          user-select: auto !important;
        }
        
        a[href] {
          cursor: pointer !important;
          pointer-events: auto !important;
          position: relative !important;
          z-index: 9999 !important;
          display: inline-block !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none !important;
          touch-action: manipulation !important;
          /* Dia/Arc 特定 */
          -webkit-user-drag: none !important;
          -webkit-app-region: no-drag !important;
        }
        
        /* 确保链接内容不干扰 */
        a[href] * {
          pointer-events: none !important;
        }
        
        /* 移除可能的覆盖层 */
        [style*="pointer-events: none"] {
          pointer-events: auto !important;
        }
        
        /* Dia/Arc 可能的特定元素 */
        arc-boost-element,
        dia-element,
        [class*="arc-"],
        [class*="dia-"] {
          pointer-events: none !important;
          z-index: -1 !important;
        }
        
        /* WebKit 特定修复 - 修复 pointer-events: none 不生效的问题 */
        @supports (-webkit-appearance: none) {
          nextjs-portal,
          [id^="__next-build-error"],
          [class*="nextjs-"],
          [data-nextjs-scroll-focus-boundary] {
            pointer-events: none !important;
            touch-action: none !important; /* WebKit 需要这个 */
            -webkit-touch-callout: none !important;
            z-index: -1 !important;
          }
          
          /* 确保阻止元素的触摸事件 */
          .pointer-events-none {
            pointer-events: none !important;
            touch-action: none !important;
            -webkit-touch-callout: none !important;
          }
        }
      `
      document.head.appendChild(style)
      
      // 清理函数
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleLinkClick, true)
        })
        document.removeEventListener('touchend', handleTouchEnd, { capture: true } as any)
        clearInterval(blockingInterval)
        style.remove()
      }
    }
    
    // 通用修复（适用于所有浏览器）
    const genericFix = () => {
      // 修复 Next.js Portal
      const fixPortal = () => {
        const portal = document.querySelector('nextjs-portal') as HTMLElement
        if (portal) {
          portal.style.pointerEvents = 'none'
        }
      }
      
      // 为所有链接添加备用点击处理
      const addFallbackHandlers = () => {
        const links = document.querySelectorAll('a[href]:not([data-browser-fixed])')
        links.forEach(link => {
          const anchor = link as HTMLAnchorElement
          anchor.dataset.browserFixed = 'true'
          
          // 鼠标按下时确保链接可点击
          anchor.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
              anchor.style.pointerEvents = 'auto'
              anchor.style.cursor = 'pointer'
            }
          }, true)
        })
      }
      
      // 初始修复
      fixPortal()
      addFallbackHandlers()
      
      // DOM 监听
      const observer = new MutationObserver(() => {
        fixPortal()
        addFallbackHandlers()
      })
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
      
      return () => {
        observer.disconnect()
      }
    }
    
    // 应用通用修复
    const cleanupGeneric = genericFix()
    
    // 调试：输出所有链接的状态
    const debugLinks = () => {
      const links = document.querySelectorAll('a[href]')
      console.log(`🔍 找到 ${links.length} 个链接`)
      links.forEach((link, index) => {
        const anchor = link as HTMLAnchorElement
        const computed = window.getComputedStyle(anchor)
        if (computed.pointerEvents === 'none' || computed.cursor !== 'pointer') {
          console.warn(`⚠️ 链接 ${index} 可能有问题:`, {
            href: anchor.href,
            pointerEvents: computed.pointerEvents,
            cursor: computed.cursor,
            zIndex: computed.zIndex
          })
        }
      })
    }
    
    // 延迟执行调试
    setTimeout(debugLinks, 2000)
    
    return () => {
      cleanupGeneric?.()
    }
  }, [])
  
  return null
}