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
    // 生产环境直接返回
    if (process.env.NODE_ENV === 'production') {
      return
    }
    
    console.log('🔧 链接修复提供者已启动 (仅开发环境)')
    
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
      const links = document.querySelectorAll('a[href]:not([data-link-fixed])')
      
      links.forEach(link => {
        const anchor = link as HTMLAnchorElement
        anchor.dataset.linkFixed = 'true'
        
        // 捕获阶段处理点击
        anchor.addEventListener('click', (e) => {
          // 特殊键或外部链接正常处理
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
            return
          }
          
          const href = anchor.getAttribute('href')
          if (!href || href.match(/^(https?:|mailto:|#)/)) {
            return
          }
          
          // 阻止默认行为并导航
          e.preventDefault()
          e.stopImmediatePropagation()
          window.location.href = href
        }, true)
      })
    }
    
    // CSS 修复
    const style = document.createElement('style')
    style.textContent = `
      /* 开发环境链接修复 */
      nextjs-portal { pointer-events: none !important; }
      nextjs-portal button,
      nextjs-portal [role="button"],
      nextjs-portal .nextjs-error-overlay,
      nextjs-portal [class*="error"],
      nextjs-portal [class*="overlay"] {
        pointer-events: auto !important;
        position: relative !important;
        z-index: 10001 !important;
      }
      
      a[href] {
        position: relative !important;
        z-index: 9999 !important;
        pointer-events: auto !important;
        cursor: pointer !important;
      }
      
      nav a[href], header a[href] {
        z-index: 10000 !important;
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