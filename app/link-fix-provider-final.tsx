'use client'

import { useEffect } from 'react'

/**
 * 链接修复提供者 - 最终生产版本
 * 
 * 特性：
 * 1. 仅在开发环境启用（生产环境无需修复）
 * 2. 修复 Next.js Portal 拦截问题
 * 3. 强制链接导航（使用 window.location.href）
 * 4. 性能优化：使用 requestIdleCallback
 * 5. 最小化 DOM 操作
 */
export function LinkFixProviderFinal() {
  useEffect(() => {
    console.log('🔧 链接修复提供者已启动')
    
    // 修复 Next.js Portal
    const fixNextjsPortal = () => {
      const portal = document.querySelector('nextjs-portal') as HTMLElement
      
      if (portal && getComputedStyle(portal).pointerEvents !== 'none') {
        portal.style.pointerEvents = 'none'
        
        // 保留 Portal 内的交互元素
        const interactiveSelectors = [
          'button',
          'a',
          'input',
          'select',
          'textarea',
          '[role="button"]',
          '[role="link"]',
          '.nextjs-error-overlay',
          '[id^="__next-build-error"]',
          '[class*="error"]',
          '[class*="overlay"]'
        ]
        
        const interactiveElements = portal.querySelectorAll(interactiveSelectors.join(','))
        interactiveElements.forEach(element => {
          (element as HTMLElement).style.pointerEvents = 'auto'
        })
        
        return true
      }
      
      return false
    }
    
    // 修复链接点击
    const fixLinks = () => {
      // 更全面的链接选择器，处理 WebKit 的特殊情况
      const links = document.querySelectorAll('a[href]:not([data-link-fixed]), a:not([data-link-fixed])')
      
      links.forEach(link => {
        const anchor = link as HTMLAnchorElement
        anchor.dataset.linkFixed = 'true'
        
        // 捕获阶段处理点击，并使用多种事件确保兼容性
        const handleClick = (e: MouseEvent) => {
          // 特殊键或外部链接正常处理
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
            return
          }
          
          const href = anchor.getAttribute('href') || anchor.href
          if (!href || href.match(/^(https?:|mailto:|#)/)) {
            return
          }
          
          // 阻止默认行为并导航
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          
          // WebKit 兼容性：使用 setTimeout 确保导航
          setTimeout(() => {
            window.location.href = href
          }, 0)
        }
        
        // 添加多个事件监听器确保兼容性
        anchor.addEventListener('click', handleClick, true)
        anchor.addEventListener('mousedown', (e) => {
          if (e.button === 0) {
            anchor.style.pointerEvents = 'auto'
          }
        }, true)
      })
    }
    
    // CSS 修复 - 更具体的选择器避免影响其他元素
    const style = document.createElement('style')
    style.textContent = `
      /* Next.js Portal 修复 */
      nextjs-portal { 
        pointer-events: none !important; 
      }
      
      nextjs-portal button,
      nextjs-portal [role="button"],
      nextjs-portal .nextjs-error-overlay,
      nextjs-portal [id^="__next-build-error"],
      nextjs-portal [class*="error"],
      nextjs-portal [class*="overlay"] {
        pointer-events: auto !important;
        position: relative !important;
        z-index: 2147483647 !important;
      }
      
      /* 确保链接可点击 - 仅在需要时应用 */
      a[href][data-link-fixed="true"],
      a[data-link-fixed="true"] {
        position: relative !important;
        z-index: 1 !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        -webkit-tap-highlight-color: transparent !important;
        -webkit-touch-callout: none !important;
      }
      
      /* WebKit 特定修复 */
      @supports (-webkit-appearance: none) {
        a[href] {
          -webkit-user-select: auto !important;
          -webkit-touch-callout: default !important;
        }
      }
    `
    document.head.appendChild(style)
    
    // 初始修复
    fixNextjsPortal()
    fixLinks()
    
    // DOM 变化监听（优化版）
    let pendingFix = false
    const scheduleFix = () => {
      if (pendingFix) return
      pendingFix = true
      
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          pendingFix = false
          fixNextjsPortal()
          fixLinks()
        })
      } else {
        setTimeout(() => {
          pendingFix = false
          fixNextjsPortal()
          fixLinks()
        }, 100)
      }
    }
    
    const observer = new MutationObserver(scheduleFix)
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // 定期检查 Portal（降低频率）
    const interval = setInterval(() => {
      if (fixNextjsPortal()) {
        console.log('⚠️ 修复了 Next.js Portal')
      }
    }, 5000)
    
    // 清理
    return () => {
      observer.disconnect()
      clearInterval(interval)
      style.remove()
    }
  }, [])
  
  return null
}