'use client'

import { useEffect } from 'react'

export default function DeepDiagnostics() {
  useEffect(() => {
    console.log('🔬 深度诊断开始...')
    
    // 1. 追踪所有事件监听器
    const originalAddEventListener = EventTarget.prototype.addEventListener
    const eventListeners: Array<{
      target: string
      type: string
      handler: string
      capture: boolean
      source: string
    }> = []
    
    EventTarget.prototype.addEventListener = function(type, handler, options) {
      const target = this
      const targetName = target === document ? 'document' : 
                       target === window ? 'window' : 
                       target === document.body ? 'body' :
                       (target as any).tagName || 'unknown'
      
      // 记录事件监听器
      if (type === 'click' || type === 'mousedown' || type === 'touchstart') {
        const stack = new Error().stack || ''
        const source = stack.split('\n')[3]?.trim() || 'unknown'
        
        eventListeners.push({
          target: targetName,
          type,
          handler: handler?.toString().substring(0, 100) || 'anonymous',
          capture: typeof options === 'boolean' ? options : options?.capture || false,
          source
        })
        
        console.log(`📎 检测到 ${type} 监听器:`, {
          target: targetName,
          capture: typeof options === 'boolean' ? options : options?.capture || false,
          source
        })
      }
      
      return originalAddEventListener.call(this, type, handler, options)
    }
    
    // 2. 检查可能阻止点击的 CSS
    const checkBlockingCSS = () => {
      console.log('\n🎨 检查 CSS 问题...')
      
      // 检查所有链接
      const links = document.querySelectorAll('a[href^="/"]')
      links.forEach((link, index) => {
        const styles = window.getComputedStyle(link)
        const rect = link.getBoundingClientRect()
        const parent = link.parentElement
        const parentStyles = parent ? window.getComputedStyle(parent) : null
        
        // 检查是否被其他元素覆盖
        const elementAtPoint = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        )
        
        if (elementAtPoint !== link && !link.contains(elementAtPoint)) {
          console.error(`❌ 链接 ${index} 被覆盖:`, {
            href: link.getAttribute('href'),
            coveredBy: elementAtPoint?.tagName + '.' + elementAtPoint?.className,
            linkZIndex: styles.zIndex,
            coveringZIndex: elementAtPoint ? window.getComputedStyle(elementAtPoint).zIndex : 'N/A'
          })
        }
        
        // 检查 pointer-events
        if (styles.pointerEvents === 'none') {
          console.error(`❌ 链接 ${index} pointer-events: none`)
        }
        
        // 检查父元素的 pointer-events
        if (parentStyles?.pointerEvents === 'none') {
          console.error(`❌ 链接 ${index} 的父元素 pointer-events: none`)
        }
        
        // 检查 user-select
        if (styles.userSelect === 'none' && styles.webkitUserSelect === 'none') {
          console.warn(`⚠️ 链接 ${index} user-select: none`)
        }
      })
    }
    
    // 3. 模拟点击测试
    const simulateClick = () => {
      console.log('\n🖱️ 模拟点击测试...')
      
      const testLink = document.querySelector('a[href="/projects"]')
      if (!testLink) {
        console.error('❌ 未找到测试链接')
        return
      }
      
      // 创建各种类型的点击事件
      const events = [
        new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
        new MouseEvent('mouseup', { bubbles: true, cancelable: true }),
        new MouseEvent('click', { bubbles: true, cancelable: true }),
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
        new PointerEvent('pointerup', { bubbles: true, cancelable: true }),
        new PointerEvent('pointerclick', { bubbles: true, cancelable: true })
      ]
      
      events.forEach(event => {
        let prevented = false
        let propagationStopped = false
        
        const originalPrevent = event.preventDefault
        const originalStop = event.stopPropagation
        
        event.preventDefault = function() {
          prevented = true
          console.error(`❌ ${event.type} 被 preventDefault`)
          return originalPrevent.call(this)
        }
        
        event.stopPropagation = function() {
          propagationStopped = true
          console.error(`❌ ${event.type} 被 stopPropagation`)
          return originalStop.call(this)
        }
        
        testLink.dispatchEvent(event)
        
        console.log(`${event.type} 结果:`, {
          prevented,
          propagationStopped,
          defaultPrevented: event.defaultPrevented
        })
      })
    }
    
    // 4. 检查 React 事件处理
    const checkReactHandlers = () => {
      console.log('\n⚛️ 检查 React 事件处理...')
      
      const links = document.querySelectorAll('a[href^="/"]')
      links.forEach((link) => {
        // 查找 React 内部属性
        const reactProps = Object.keys(link).filter(key => key.startsWith('__react'))
        if (reactProps.length > 0) {
          console.log('React 属性:', reactProps)
          
          // 尝试获取 React Fiber
          const fiber = (link as any)._reactInternalFiber || 
                       (link as any).__reactInternalFiber ||
                       (link as any).__reactFiber
          
          if (fiber) {
            console.log('React Fiber:', {
              type: fiber.type?.name || fiber.type,
              props: fiber.memoizedProps
            })
          }
        }
      })
    }
    
    // 5. 检查全局样式
    const checkGlobalStyles = () => {
      console.log('\n🌍 检查全局样式...')
      
      const styleSheets = Array.from(document.styleSheets)
      styleSheets.forEach((sheet) => {
        try {
          const rules = Array.from(sheet.cssRules || [])
          rules.forEach(rule => {
            if (rule instanceof CSSStyleRule) {
              const style = rule.style
              
              // 检查可能影响链接的全局样式
              if (rule.selectorText && 
                  (rule.selectorText.includes('a') || 
                   rule.selectorText.includes('*') ||
                   rule.selectorText.includes('body'))) {
                
                if (style.pointerEvents === 'none' ||
                    style.userSelect === 'none' ||
                    style.cursor === 'default' ||
                    style.position === 'fixed') {
                  console.warn('⚠️ 可疑全局样式:', {
                    selector: rule.selectorText,
                    pointerEvents: style.pointerEvents,
                    userSelect: style.userSelect,
                    cursor: style.cursor,
                    position: style.position
                  })
                }
              }
            }
          })
        } catch (e) {
          // 跨域样式表无法访问
        }
      })
    }
    
    // 延迟执行，确保页面完全加载
    setTimeout(() => {
      console.log('========== 深度诊断报告 ==========')
      checkBlockingCSS()
      simulateClick()
      checkReactHandlers()
      checkGlobalStyles()
      console.log('\n📊 事件监听器汇总:')
      console.table(eventListeners)
      console.log('==================================')
    }, 2000)
    
    // 恢复原始 addEventListener
    return () => {
      EventTarget.prototype.addEventListener = originalAddEventListener
    }
  }, [])
  
  return null
}