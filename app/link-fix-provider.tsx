'use client'

import { useEffect } from 'react'

/**
 * 链接修复提供者
 * 
 * 这个组件解决了Next.js 15 + React 19中链接点击被阻止的问题。
 * 综合多种诊断结果，问题可能是：
 * 1. 全局的window click监听器在事件冒泡阶段调用了preventDefault
 * 2. CSS层级问题导致透明覆盖层阻止点击
 * 
 * 解决方案：
 * 1. 为所有链接添加捕获阶段的点击处理器
 * 2. 使用stopImmediatePropagation阻止其他监听器干扰
 * 3. 添加CSS修复确保链接在最上层
 * 4. 定期检测并修复被覆盖的链接
 */
export function LinkFixProvider() {
  
  useEffect(() => {
    console.log('🔧 链接修复提供者已启动')
    
    // CSS修复：确保链接始终可点击
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      a[href] {
        position: relative !important;
        z-index: 1001 !important;
        pointer-events: auto !important;
      }
      
      nav a[href], 
      header a[href] {
        z-index: 1002 !important;
      }
      
      /* 禁用可能的遮罩层点击事件 */
      .modal-backdrop, 
      .overlay, 
      [class*="backdrop"],
      [class*="overlay"],
      [class*="fixed"][class*="inset"] {
        pointer-events: none !important;
      }
      
      /* 允许特定交互元素的点击 */
      .modal-backdrop button,
      .overlay button,
      [class*="backdrop"] button,
      [class*="overlay"] button {
        pointer-events: auto !important;
      }
    `
    document.head.appendChild(styleElement)
    
    // 检测并修复被覆盖的链接
    const detectAndFixOverlays = () => {
      const links = document.querySelectorAll('a[href]')
      let blockedCount = 0
      
      links.forEach(link => {
        const rect = link.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          const elementAtPoint = document.elementFromPoint(centerX, centerY)
          
          if (elementAtPoint !== link && !link.contains(elementAtPoint)) {
            blockedCount++
            // 自动修复被覆盖的链接
            ;(link as HTMLElement).style.position = 'relative'
            ;(link as HTMLElement).style.zIndex = '1001'
            ;(link as HTMLElement).style.pointerEvents = 'auto'
          }
        }
      })
      
      if (blockedCount > 0) {
        console.warn(`检测到 ${blockedCount} 个链接被覆盖，已自动修复`)
      }
    }
    
    const fixLinks = () => {
      const links = document.querySelectorAll('a[href]')
      
      links.forEach(link => {
        const anchor = link as HTMLAnchorElement
        
        // 检查是否已经修复过
        if (anchor.dataset.linkFixed === 'true') {
          return
        }
        
        // 标记为已修复
        anchor.dataset.linkFixed = 'true'
        
        // 在捕获阶段添加点击处理器
        anchor.addEventListener('click', (e) => {
          // 检查是否应该阻止默认行为（例如，Ctrl+Click应该在新标签页打开）
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
            return
          }
          
          // 检查是否是外部链接
          const href = anchor.getAttribute('href')
          if (!href) return
          
          // 外部链接正常处理
          if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
            e.stopImmediatePropagation() // 阻止其他监听器干扰
            return
          }
          
          // 锚点链接正常处理
          if (href.startsWith('#')) {
            e.stopImmediatePropagation()
            return
          }
          
          // 对于内部链接，阻止默认行为并强制导航
          e.preventDefault()
          e.stopImmediatePropagation() // 使用stopImmediatePropagation而不是stopPropagation
          
          // 直接使用 window.location 进行导航
          // 这会触发完整的页面导航，但能确保链接工作
          window.location.href = href
        }, true) // true表示在捕获阶段执行
      })
      
      console.log(`✅ 修复了 ${links.length} 个链接`)
    }
    
    // 初始修复
    fixLinks()
    detectAndFixOverlays()
    
    // 监听DOM变化，修复新添加的链接
    const observer = new MutationObserver((mutations) => {
      let hasNewLinks = false
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element
            if (element.tagName === 'A' || element.querySelector('a')) {
              hasNewLinks = true
            }
          }
        })
      })
      
      if (hasNewLinks) {
        setTimeout(() => {
          fixLinks()
          detectAndFixOverlays()
        }, 100) // 延迟执行，确保DOM完全更新
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // 定期检测覆盖问题（每10秒）
    const overlayCheckInterval = setInterval(detectAndFixOverlays, 10000)
    
    // 清理函数
    return () => {
      observer.disconnect()
      clearInterval(overlayCheckInterval)
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement)
      }
    }
  }, [])
  
  return null
}