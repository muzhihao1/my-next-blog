'use client'

import { useEffect, useState } from 'react'

export default function LinkFixFinder() {
  const [fixAttempt, setFixAttempt] = useState(0)
  const [findings, setFindings] = useState<string[]>([])
  
  useEffect(() => {
    console.log('🔧 开始查找并修复链接问题...')
    
    // 方案1: 查找所有可能干扰的元素并临时移除
    const findAndDisableBlockingElements = () => {
      const newFindings: string[] = []
      
      // 查找所有固定定位的大元素
      const fixedElements = document.querySelectorAll('*')
      const problematicElements: HTMLElement[] = []
      
      fixedElements.forEach(el => {
        const styles = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        
        // 检查是否是可能的遮罩层
        if (
          (styles.position === 'fixed' || styles.position === 'absolute') &&
          rect.width >= window.innerWidth * 0.5 &&
          rect.height >= window.innerHeight * 0.5 &&
          !el.className.includes('diagnostic') && // 排除我们的诊断组件
          !el.id.includes('__next') // 排除 Next.js 根元素
        ) {
          problematicElements.push(el as HTMLElement)
          newFindings.push(`发现遮罩元素: ${el.tagName}.${el.className || 'no-class'}`)
        }
      })
      
      // 临时禁用这些元素
      problematicElements.forEach(el => {
        el.style.pointerEvents = 'none'
        newFindings.push(`已禁用: ${el.tagName}.${el.className}`)
      })
      
      // 查找所有有 onClick 但阻止默认行为的元素
      const elementsWithOnClick = document.querySelectorAll('[onclick]')
      elementsWithOnClick.forEach(el => {
        const onclick = el.getAttribute('onclick')
        if (onclick?.includes('preventDefault')) {
          el.removeAttribute('onclick')
          newFindings.push(`移除了内联 onclick: ${el.tagName}.${el.className}`)
        }
      })
      
      setFindings(prev => [...prev, ...newFindings])
      return problematicElements.length > 0
    }
    
    // 方案2: 覆盖所有链接的点击处理
    const overrideLinkHandlers = () => {
      const links = document.querySelectorAll('a[href]')
      let fixed = 0
      
      links.forEach(link => {
        const href = link.getAttribute('href')
        if (!href) return
        
        // 移除所有现有的点击监听器
        const newLink = link.cloneNode(true) as HTMLAnchorElement
        link.parentNode?.replaceChild(newLink, link)
        
        // 添加新的点击处理器
        newLink.addEventListener('click', (e) => {
          e.stopPropagation()
          if (href.startsWith('/')) {
            e.preventDefault()
            window.location.href = href
            console.log('✅ 强制导航到:', href)
          }
        }, true)
        
        // 确保链接可点击
        newLink.style.pointerEvents = 'auto'
        newLink.style.cursor = 'pointer'
        newLink.style.position = 'relative'
        newLink.style.zIndex = '9999'
        
        fixed++
      })
      
      setFindings(prev => [...prev, `修复了 ${fixed} 个链接`])
      return fixed > 0
    }
    
    // 方案3: 查找并禁用全局事件监听器
    const disableGlobalListeners = () => {
      // 保存原始的 addEventListener
      const originalAddEventListener = EventTarget.prototype.addEventListener
      const blockedListeners: string[] = []
      
      // 拦截新的事件监听器
      EventTarget.prototype.addEventListener = function(type, handler, options) {
        if (type === 'click' && (this === document || this === document.body || this === window)) {
          blockedListeners.push(`阻止了 ${this === document ? 'document' : this === window ? 'window' : 'body'} 上的 click 监听器`)
          return // 不添加这个监听器
        }
        return originalAddEventListener.call(this, type, handler, options)
      }
      
      setFindings(prev => [...prev, ...blockedListeners])
      
      // 10秒后恢复
      setTimeout(() => {
        EventTarget.prototype.addEventListener = originalAddEventListener
      }, 10000)
    }
    
    // 执行修复尝试
    const attemptFix = () => {
      console.log(`🔧 修复尝试 #${fixAttempt + 1}`)
      
      const fixed1 = findAndDisableBlockingElements()
      const fixed2 = overrideLinkHandlers()
      disableGlobalListeners()
      
      if (fixed1 || fixed2) {
        console.log('✅ 应用了修复，请测试链接是否可以点击')
      }
      
      setFixAttempt(prev => prev + 1)
    }
    
    // 立即执行一次
    setTimeout(attemptFix, 1000)
    
    // 创建手动触发按钮
    const button = document.createElement('button')
    button.textContent = '🔧 重新尝试修复链接'
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #3b82f6;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      z-index: 99999;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `
    button.onclick = attemptFix
    document.body.appendChild(button)
    
    // 清理函数
    return () => {
      document.body.removeChild(button)
    }
  }, [fixAttempt])
  
  // 显示发现的问题
  if (findings.length > 0) {
    return (
      <div className="fixed top-20 left-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-w-md shadow-lg z-[99999]">
        <h3 className="font-bold mb-2 text-sm">🔍 链接修复发现:</h3>
        <ul className="text-xs space-y-1">
          {findings.map((finding, i) => (
            <li key={i} className="text-gray-600 dark:text-gray-300">• {finding}</li>
          ))}
        </ul>
        <p className="text-xs mt-2 text-green-600 dark:text-green-400 font-medium">
          已尝试修复 {fixAttempt} 次
        </p>
      </div>
    )
  }
  
  return null
}