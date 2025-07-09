'use client'

import { useEffect, useState } from 'react'

export default function RootCauseFinder() {
  const [findings, setFindings] = useState<string[]>([])
  
  const addFinding = (message: string) => {
    console.log(`🔍 ${message}`)
    setFindings(prev => [...prev, message])
  }
  
  useEffect(() => {
    addFinding('开始诊断...')
    
    // 1. 检查是否有全局事件监听器阻止了默认行为
    const checkEventListeners = () => {
      const originalAddEventListener = EventTarget.prototype.addEventListener
      let capturedListeners: any[] = []
      
      // 临时替换 addEventListener 来捕获所有监听器
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'click' && this === document) {
          capturedListeners.push({ type, listener: listener.toString(), options })
        }
        return originalAddEventListener.call(this, type, listener, options)
      }
      
      // 等待一下让其他组件注册监听器
      setTimeout(() => {
        EventTarget.prototype.addEventListener = originalAddEventListener
        if (capturedListeners.length > 0) {
          addFinding(`发现 ${capturedListeners.length} 个全局点击监听器`)
          capturedListeners.forEach((l, i) => {
            addFinding(`监听器 ${i + 1}: ${l.listener.substring(0, 100)}...`)
          })
        }
      }, 100)
    }
    
    // 2. 检查是否有元素遮挡
    const checkOverlays = () => {
      const links = document.querySelectorAll('a')
      links.forEach(link => {
        const rect = link.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const topElement = document.elementFromPoint(centerX, centerY)
        
        if (topElement !== link && !link.contains(topElement)) {
          const computedStyle = window.getComputedStyle(topElement!)
          addFinding(`链接 ${link.href} 被遮挡，顶层元素: ${topElement?.tagName}.${topElement?.className}, z-index: ${computedStyle.zIndex}`)
        }
      })
    }
    
    // 3. 检查 CSS 问题
    const checkCSS = () => {
      // 检查是否有全局的 pointer-events: none
      const allElements = document.querySelectorAll('*')
      allElements.forEach(el => {
        const styles = window.getComputedStyle(el)
        if (styles.pointerEvents === 'none' && el.querySelector('a')) {
          addFinding(`元素包含链接但设置了 pointer-events: none - ${el.tagName}.${el.className}`)
        }
      })
      
      // 检查伪元素
      const styleSheets = Array.from(document.styleSheets)
      styleSheets.forEach((sheet, index) => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || [])
          rules.forEach(rule => {
            if (rule instanceof CSSStyleRule) {
              const styleRule = rule as CSSStyleRule
              if (styleRule.style.pointerEvents === 'none') {
                addFinding(`CSS 规则设置了 pointer-events: none - ${styleRule.selectorText}`)
              }
            }
          })
        } catch (e) {
          // 跨域样式表无法访问
        }
      })
    }
    
    // 4. 检查 Next.js 路由
    const checkNextRouter = () => {
      // @ts-ignore
      if (window.next && window.next.router) {
        addFinding('Next.js 路由已初始化')
        // @ts-ignore
        const router = window.next.router
        if (router.isReady) {
          addFinding('路由已就绪')
        } else {
          addFinding('⚠️ 路由未就绪')
        }
      } else {
        addFinding('❌ Next.js 路由未找到')
      }
    }
    
    // 5. 创建测试链接并监听其事件
    const testLinkBehavior = () => {
      const testLink = document.createElement('a')
      testLink.href = '/test'
      testLink.textContent = '测试链接'
      testLink.style.cssText = 'position: fixed; top: -9999px; left: -9999px;'
      
      let clickPrevented = false
      testLink.addEventListener('click', (e) => {
        if (e.defaultPrevented) {
          clickPrevented = true
        }
      })
      
      document.body.appendChild(testLink)
      
      // 模拟点击
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
      
      testLink.dispatchEvent(event)
      
      if (clickPrevented) {
        addFinding('❌ 测试链接的点击事件被阻止了')
      } else {
        addFinding('✅ 测试链接的点击事件正常')
      }
      
      document.body.removeChild(testLink)
    }
    
    // 执行所有检查
    setTimeout(() => {
      checkEventListeners()
      checkOverlays()
      checkCSS()
      checkNextRouter()
      testLinkBehavior()
      addFinding('诊断完成')
    }, 1000)
  }, [])
  
  return (
    <div className="fixed bottom-4 right-4 max-w-md max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-[9999]">
      <h3 className="font-semibold mb-2">链接问题诊断结果</h3>
      <div className="space-y-1 text-sm font-mono">
        {findings.map((finding, index) => (
          <div key={index} className="text-xs">
            {finding}
          </div>
        ))}
      </div>
    </div>
  )
}