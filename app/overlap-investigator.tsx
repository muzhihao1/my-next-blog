'use client'

import { useEffect } from 'react'

export default function OverlapInvestigator() {
  useEffect(() => {
    console.log('🔍 开始调查链接覆盖问题...')
    
    const investigateOverlap = () => {
      const links = document.querySelectorAll('a')
      const coverageReport: any[] = []
      
      links.forEach((link, index) => {
        const rect = link.getBoundingClientRect()
        
        // 检查链接的多个点
        const points = [
          { x: rect.left + rect.width * 0.1, y: rect.top + rect.height * 0.1, label: '左上' },
          { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5, label: '中心' },
          { x: rect.left + rect.width * 0.9, y: rect.top + rect.height * 0.9, label: '右下' },
        ]
        
        let isCovered = false
        const coveringElements = new Set<string>()
        
        points.forEach(point => {
          const element = document.elementFromPoint(point.x, point.y)
          
          if (element && element !== link && !link.contains(element)) {
            isCovered = true
            const identifier = `${element.tagName}.${element.className || 'no-class'}#${element.id || 'no-id'}`
            coveringElements.add(identifier)
          }
        })
        
        if (isCovered || index >= 9) { // 特别关注链接10-28
          const linkInfo = {
            index: index + 1,
            href: link.getAttribute('href') || 'no-href',
            text: link.textContent?.trim() || 'no-text',
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            },
            covered: isCovered,
            coveringElements: Array.from(coveringElements),
            linkStyles: {
              position: window.getComputedStyle(link).position,
              zIndex: window.getComputedStyle(link).zIndex,
              display: window.getComputedStyle(link).display,
              visibility: window.getComputedStyle(link).visibility,
              pointerEvents: window.getComputedStyle(link).pointerEvents
            }
          }
          
          coverageReport.push(linkInfo)
          
          if (isCovered) {
            console.warn(`链接 ${index + 1} 被覆盖:`, linkInfo)
          }
        }
      })
      
      // 查找所有可能的遮罩层元素
      const potentialOverlays = document.querySelectorAll('*')
      const overlays: any[] = []
      
      potentialOverlays.forEach(el => {
        const styles = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        
        // 检查是否是潜在的遮罩层
        if (
          (styles.position === 'fixed' || styles.position === 'absolute') &&
          rect.width > window.innerWidth * 0.8 &&
          rect.height > window.innerHeight * 0.8
        ) {
          overlays.push({
            element: `${el.tagName}.${el.className || 'no-class'}#${el.id || 'no-id'}`,
            position: styles.position,
            zIndex: styles.zIndex,
            display: styles.display,
            visibility: styles.visibility,
            pointerEvents: styles.pointerEvents,
            opacity: styles.opacity,
            background: styles.backgroundColor,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          })
        }
      })
      
      console.log('📊 链接覆盖报告:')
      console.table(coverageReport)
      
      if (overlays.length > 0) {
        console.log('🔴 发现潜在遮罩层:')
        console.table(overlays)
      }
      
      // 尝试识别具体的覆盖元素
      const link10 = links[9] // 第10个链接
      if (link10) {
        console.log('🎯 深入分析链接10:')
        const rect = link10.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        // 临时隐藏链接本身
        const originalDisplay = link10.style.display
        link10.style.display = 'none'
        
        // 获取该位置的所有元素
        const elementsAtPoint = document.elementsFromPoint(centerX, centerY)
        
        // 恢复链接显示
        link10.style.display = originalDisplay
        
        console.log('链接10位置的元素层级（从上到下）:')
        elementsAtPoint.forEach((el, i) => {
          const styles = window.getComputedStyle(el)
          console.log(`层级 ${i}:`, {
            element: `${el.tagName}.${el.className || 'no-class'}#${el.id || 'no-id'}`,
            position: styles.position,
            zIndex: styles.zIndex,
            pointerEvents: styles.pointerEvents,
            display: styles.display,
            opacity: styles.opacity
          })
        })
      }
    }
    
    // 等待页面完全加载
    setTimeout(investigateOverlap, 3000)
    
  }, [])
  
  return null
}