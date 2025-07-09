'use client'

import { useEffect } from 'react'

export default function OverlayCleaner() {
  useEffect(() => {
    console.log('🧹 开始清理遮罩元素...')
    
    // 每秒检查并清理遮罩元素
    const cleanOverlays = () => {
      const overlays = document.querySelectorAll<HTMLElement>(`
        div[class*="fixed inset-0"]:not([class*="bg-"]),
        div[style*="position: fixed"][style*="inset: 0px"]:not([class*="bg-"])
      `)
      
      overlays.forEach((overlay) => {
        // 检查是否是透明遮罩
        const styles = window.getComputedStyle(overlay)
        const hasBackground = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                             styles.backgroundColor !== 'transparent'
        
        if (!hasBackground && styles.pointerEvents !== 'none') {
          console.warn('🔧 发现透明遮罩，正在修复:', {
            className: overlay.className,
            id: overlay.id,
            parent: overlay.parentElement?.className
          })
          
          // 设置 pointer-events: none 让它不拦截点击
          overlay.style.pointerEvents = 'none'
          
          // 如果是动画组件的遗留元素，直接移除
          if (overlay.parentElement?.style.opacity === '0' || 
              overlay.parentElement?.style.display === 'none') {
            overlay.remove()
            console.log('✅ 移除了遗留遮罩元素')
          }
        }
      })
    }
    
    // 立即执行一次
    cleanOverlays()
    
    // 定期清理
    const interval = setInterval(cleanOverlays, 1000)
    
    // 监听 DOM 变化
    const observer = new MutationObserver(() => {
      cleanOverlays()
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    return () => {
      clearInterval(interval)
      observer.disconnect()
    }
  }, [])
  
  return null
}