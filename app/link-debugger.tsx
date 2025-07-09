'use client'

import { useEffect } from 'react'

export default function LinkDebugger() {
  useEffect(() => {
    console.log('🔍 Link Debugger 启动...')
    
    // 1. 检查所有的事件监听器
    const checkEventListeners = () => {
      // 保存原始方法
      const originalAddEventListener = EventTarget.prototype.addEventListener
      const originalRemoveEventListener = EventTarget.prototype.removeEventListener
      
      // 跟踪所有监听器
      const listeners = new Map()
      
      // 拦截 addEventListener
      EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
        if (type === 'click') {
          const target = this
          const key = `${target.constructor.name}_${type}`
          
          if (!listeners.has(key)) {
            listeners.set(key, [])
          }
          
          listeners.get(key).push({
            target: target.constructor.name,
            listener: listener.toString().substring(0, 200),
            capture: options === true || (options && options.capture),
            passive: options && options.passive,
            once: options && options.once
          })
          
          console.log(`📎 添加了 click 监听器:`, {
            target: target.constructor.name,
            capture: options === true || (options && options.capture)
          })
        }
        
        return originalAddEventListener.call(this, type, listener, options)
      }
      
      // 3秒后打印所有监听器
      setTimeout(() => {
        console.log('📋 所有 click 监听器:', Array.from(listeners.entries()))
        
        // 恢复原始方法
        EventTarget.prototype.addEventListener = originalAddEventListener
        EventTarget.prototype.removeEventListener = originalRemoveEventListener
      }, 3000)
    }
    
    // 2. 监听所有链接点击
    const monitorClicks = () => {
      // 捕获阶段监听
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const link = target.closest('a')
        
        if (link) {
          console.log('🔗 捕获阶段 - 链接点击:', {
            href: link.href,
            pathname: link.pathname,
            defaultPrevented: e.defaultPrevented,
            propagationStopped: e.cancelBubble,
            currentTarget: e.currentTarget?.constructor.name,
            eventPhase: e.eventPhase === 1 ? 'CAPTURING' : e.eventPhase === 2 ? 'AT_TARGET' : 'BUBBLING'
          })
        }
      }, true)
      
      // 冒泡阶段监听
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const link = target.closest('a')
        
        if (link) {
          console.log('🔗 冒泡阶段 - 链接点击:', {
            href: link.href,
            pathname: link.pathname,
            defaultPrevented: e.defaultPrevented,
            propagationStopped: e.cancelBubble
          })
          
          // 如果默认行为被阻止，尝试找出原因
          if (e.defaultPrevented) {
            console.error('❌ 默认行为被阻止!')
          }
        }
      }, false)
    }
    
    // 3. 检查 Next.js 路由器状态
    const checkNextRouter = () => {
      // @ts-ignore
      if (window.next && window.next.router) {
        // @ts-ignore
        const router = window.next.router
        console.log('✅ Next.js 路由器存在:', {
          pathname: router.pathname,
          isReady: router.isReady,
          // @ts-ignore
          components: Object.keys(router.components || {})
        })
      } else {
        console.error('❌ Next.js 路由器未找到!')
      }
      
      // 检查 window.__NEXT_DATA__
      // @ts-ignore
      if (window.__NEXT_DATA__) {
        console.log('✅ Next.js 数据:', {
          // @ts-ignore
          buildId: window.__NEXT_DATA__.buildId,
          // @ts-ignore
          page: window.__NEXT_DATA__.page
        })
      }
    }
    
    // 4. 检查可能的 CSS 问题
    const checkCSS = () => {
      // 检查所有链接的计算样式
      const links = document.querySelectorAll('a')
      links.forEach((link, index) => {
        const styles = window.getComputedStyle(link)
        const parentStyles = link.parentElement ? window.getComputedStyle(link.parentElement) : null
        
        // 检查可能阻止点击的样式
        const problems = []
        
        if (styles.pointerEvents === 'none') {
          problems.push('pointer-events: none')
        }
        
        if (styles.userSelect === 'none') {
          problems.push('user-select: none')
        }
        
        if (styles.position === 'relative' && styles.zIndex === '-1') {
          problems.push('negative z-index')
        }
        
        // 检查是否有覆盖元素
        const rect = link.getBoundingClientRect()
        const elementAtPoint = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        )
        
        if (elementAtPoint && !link.contains(elementAtPoint) && !elementAtPoint.contains(link)) {
          problems.push(`被元素覆盖: ${elementAtPoint.tagName}.${elementAtPoint.className}`)
        }
        
        if (problems.length > 0 && index < 5) { // 只报告前5个有问题的链接
          console.warn(`⚠️ 链接样式问题 [${link.textContent?.trim()}]:`, problems)
        }
      })
    }
    
    // 5. 创建测试面板
    const createTestPanel = () => {
      const panel = document.createElement('div')
      panel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border: 2px solid #333;
        padding: 20px;
        z-index: 99999;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        max-width: 300px;
      `
      
      panel.innerHTML = `
        <h3 style="margin-top: 0;">链接调试面板</h3>
        <div style="margin: 10px 0;">
          <a href="/about" style="color: blue; text-decoration: underline;">
            测试 Next.js Link
          </a>
        </div>
        <div style="margin: 10px 0;">
          <button onclick="window.location.href='/blog'" style="padding: 5px 10px;">
            使用 location.href
          </button>
        </div>
        <div id="debug-log" style="margin-top: 10px; font-size: 12px; max-height: 200px; overflow-y: auto;"></div>
        <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px;">
          关闭
        </button>
      `
      
      document.body.appendChild(panel)
      
      // 监听测试链接
      const testLink = panel.querySelector('a')
      if (testLink) {
        testLink.addEventListener('click', (e) => {
          const log = document.getElementById('debug-log')
          if (log) {
            log.innerHTML += `<div>测试链接被点击 - preventDefault: ${e.defaultPrevented}</div>`
          }
        })
      }
    }
    
    // 执行所有检查
    checkEventListeners()
    monitorClicks()
    checkNextRouter()
    setTimeout(checkCSS, 1000) // 等待页面完全加载
    createTestPanel()
    
    // 6. 监听路由变化
    if ('navigation' in window) {
      // @ts-ignore
      navigation.addEventListener('navigate', (e: any) => {
        console.log('🚀 Navigation API - navigate 事件:', {
          destination: e.destination.url,
          navigationType: e.navigationType,
          canIntercept: e.canIntercept,
          userInitiated: e.userInitiated
        })
      })
    }
    
  }, [])
  
  return null
}