'use client'

import { useEffect } from 'react'

export default function EmergencyDebugger() {
  useEffect(() => {
    console.log('🚨 紧急诊断开始...')
    
    // 1. 检查所有固定定位的元素
    const checkFixedElements = () => {
      console.log('\n🔍 检查固定定位元素:')
      const allElements = document.querySelectorAll('*')
      const fixedElements: HTMLElement[] = []
      
      allElements.forEach(el => {
        const styles = window.getComputedStyle(el)
        if (styles.position === 'fixed' || styles.position === 'absolute') {
          const rect = el.getBoundingClientRect()
          if (rect.width > window.innerWidth * 0.5 && rect.height > window.innerHeight * 0.5) {
            fixedElements.push(el as HTMLElement)
            console.warn('发现大型固定元素:', {
              element: el,
              className: el.className,
              id: el.id,
              zIndex: styles.zIndex,
              display: styles.display,
              pointerEvents: styles.pointerEvents,
              rect
            })
          }
        }
      })
      
      return fixedElements
    }
    
    // 2. 检查事件监听器
    const checkEventListeners = () => {
      console.log('\n🎯 检查全局事件监听器:')
      
      // 覆盖 addEventListener 来捕获新的监听器
      const originalAdd = EventTarget.prototype.addEventListener
      const listeners: any[] = []
      
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        if ((this === document || this === window || this === document.body) && type === 'click') {
          console.error('❌ 发现全局 click 监听器!', {
            target: this === document ? 'document' : this === window ? 'window' : 'body',
            listener: listener.toString().substring(0, 200)
          })
          listeners.push({ target: this, type, listener })
        }
        return originalAdd.call(this, type, listener, options)
      }
      
      // 恢复
      setTimeout(() => {
        EventTarget.prototype.addEventListener = originalAdd
      }, 100)
      
      return listeners
    }
    
    // 3. 检查所有链接并测试点击
    const testLinks = () => {
      console.log('\n🔗 测试所有链接:')
      const links = document.querySelectorAll('a[href]')
      
      // 深入调查覆盖问题
      const investigateOverlay = () => {
        console.log('\n🔍 开始深入调查覆盖问题...')
        
        // 获取一个被覆盖的链接作为测试目标
        const testLink = document.querySelector('a[href="/"]')
        if (!testLink) return
        
        const linkRect = testLink.getBoundingClientRect()
        const centerX = linkRect.left + linkRect.width / 2
        const centerY = linkRect.top + linkRect.height / 2
        
        // 使用elementsFromPoint获取所有层级的元素
        const elements = document.elementsFromPoint(centerX, centerY)
        console.log(`📊 链接中心点下共有 ${elements.length} 个元素:`)
        
        elements.forEach((el, index) => {
          const styles = window.getComputedStyle(el)
          console.log(`  ${index + 1}. ${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className : ''}`, {
            position: styles.position,
            zIndex: styles.zIndex,
            pointerEvents: styles.pointerEvents,
            opacity: styles.opacity,
            width: el.getBoundingClientRect().width,
            height: el.getBoundingClientRect().height
          })
        })
        
        // 检查伪元素
        console.log('\n🎭 检查伪元素:')
        elements.forEach(el => {
          const beforeStyles = window.getComputedStyle(el, '::before')
          const afterStyles = window.getComputedStyle(el, '::after')
          
          if (beforeStyles.content !== 'none' && beforeStyles.content !== '""') {
            console.log(`${el.tagName}::before`, {
              content: beforeStyles.content,
              position: beforeStyles.position,
              pointerEvents: beforeStyles.pointerEvents,
              width: beforeStyles.width,
              height: beforeStyles.height
            })
          }
          
          if (afterStyles.content !== 'none' && afterStyles.content !== '""') {
            console.log(`${el.tagName}::after`, {
              content: afterStyles.content,
              position: afterStyles.position,
              pointerEvents: afterStyles.pointerEvents,
              width: afterStyles.width,
              height: afterStyles.height
            })
          }
        })
      }
      
      investigateOverlay()
      
      links.forEach((link, index) => {
        const a = link as HTMLAnchorElement
        
        // 检查样式
        const styles = window.getComputedStyle(a)
        const rect = a.getBoundingClientRect()
        
        // 检查是否被覆盖
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const topElement = document.elementFromPoint(centerX, centerY)
        
        if (topElement !== a && !a.contains(topElement)) {
          console.error(`❌ 链接 ${index + 1} 被覆盖:`, {
            href: a.href,
            text: a.textContent,
            coveredBy: topElement
          })
        }
        
        // 检查 pointer-events
        if (styles.pointerEvents === 'none') {
          console.error(`❌ 链接 ${index + 1} pointer-events: none`)
        }
        
        // 添加临时点击处理器
        const tempHandler = (e: Event) => {
          if (e.defaultPrevented) {
            console.error(`❌ 链接点击被阻止: ${a.href}`)
            // 强制导航
            setTimeout(() => {
              console.log('✅ 强制导航到:', a.href)
              window.location.href = a.href
            }, 0)
          }
        }
        a.addEventListener('click', tempHandler, true)
        
        // 5秒后移除
        setTimeout(() => {
          a.removeEventListener('click', tempHandler, true)
        }, 5000)
      })
    }
    
    // 4. 移除所有可疑的遮罩层
    const removeOverlays = () => {
      console.log('\n🧹 尝试移除遮罩层:')
      const fixedElements = checkFixedElements()
      
      fixedElements.forEach(el => {
        // 检查是否是透明或半透明的遮罩
        const styles = window.getComputedStyle(el)
        const isOverlay = 
          styles.backgroundColor === 'rgba(0, 0, 0, 0)' ||
          styles.opacity === '0' ||
          !el.textContent?.trim()
        
        if (isOverlay) {
          console.warn('移除可疑遮罩层:', el)
          el.style.display = 'none'
          el.style.pointerEvents = 'none'
        }
      })
    }
    
    // 5. 监控 preventDefault 调用
    const monitorPreventDefault = () => {
      const original = Event.prototype.preventDefault
      Event.prototype.preventDefault = function() {
        const event = this as Event
        if (event.type === 'click' && (event.target as HTMLElement)?.tagName === 'A') {
          console.error('❌ preventDefault 被调用!', {
            target: event.target,
            type: event.type,
            stack: new Error().stack
          })
        }
        return original.call(this)
      }
      
      // 5秒后恢复
      setTimeout(() => {
        Event.prototype.preventDefault = original
      }, 5000)
    }
    
    // 执行所有检查
    console.log('========== 紧急诊断报告 ==========')
    checkEventListeners()
    checkFixedElements()
    testLinks()
    removeOverlays()
    monitorPreventDefault()
    console.log('===================================')
    
    // 添加紧急修复按钮
    const button = document.createElement('button')
    button.textContent = '🚨 强制修复所有链接'
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      z-index: 99999;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `
    
    button.onclick = () => {
      console.log('🔧 执行强制修复...')
      
      // 移除所有固定元素的 pointer-events
      document.querySelectorAll('*').forEach(el => {
        const styles = window.getComputedStyle(el)
        if (styles.position === 'fixed' && el !== button) {
          (el as HTMLElement).style.pointerEvents = 'none'
        }
      })
      
      // 修复所有链接
      document.querySelectorAll('a[href]').forEach(link => {
        const a = link as HTMLAnchorElement
        a.style.pointerEvents = 'auto'
        a.style.cursor = 'pointer'
        a.style.position = 'relative'
        a.style.zIndex = '9999'
        
        // 移除所有点击监听器并添加新的
        const newLink = a.cloneNode(true) as HTMLAnchorElement
        a.parentNode?.replaceChild(newLink, a)
        
        newLink.addEventListener('click', (e) => {
          if (e.defaultPrevented) {
            e.stopPropagation()
            e.stopImmediatePropagation()
            window.location.href = newLink.href
          }
        }, true)
      })
      
      console.log('✅ 强制修复完成！')
    }
    
    document.body.appendChild(button)
    
    return () => {
      document.body.removeChild(button)
    }
  }, [])
  
  return null
}