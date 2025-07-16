/**
 * AutoLinkFixer - 自动修复链接点击问题
 * 
 * 通过模拟搜索框交互来激活链接功能
 * 这是基于用户发现的现象：搜索框输入后链接恢复正常
 */
'use client'

import { useEffect, useState } from 'react'

export function AutoLinkFixer() {
  const [isFixed, setIsFixed] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)

  useEffect(() => {
    // 只在生产环境运行
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 AutoLinkFixer: 开发环境，跳过修复')
      return
    }

    const attemptFix = () => {
      console.log(`🔧 AutoLinkFixer: 尝试修复 (第${attemptCount + 1}次)`)
      
      // 查找搜索输入框
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="搜索"]',
        'input[placeholder*="search"]',
        'input[placeholder*="Search"]',
        '[data-component="search"] input',
        '.search-input',
        '#search-input'
      ]

      let searchInput: HTMLInputElement | null = null
      for (const selector of searchSelectors) {
        searchInput = document.querySelector(selector) as HTMLInputElement
        if (searchInput) {
          console.log(`🔧 AutoLinkFixer: 找到搜索框 - ${selector}`)
          break
        }
      }

      if (searchInput) {
        try {
          // 保存原始值
          const originalValue = searchInput.value
          
          // 触发一系列事件来模拟真实的用户输入
          searchInput.focus()
          
          // 设置一个临时值
          searchInput.value = ' '
          
          // 触发各种事件
          const inputEvent = new Event('input', { bubbles: true, cancelable: true })
          const changeEvent = new Event('change', { bubbles: true, cancelable: true })
          const keyupEvent = new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true })
          
          searchInput.dispatchEvent(inputEvent)
          searchInput.dispatchEvent(keyupEvent)
          searchInput.dispatchEvent(changeEvent)
          
          // 短暂延迟后恢复原始状态
          setTimeout(() => {
            searchInput.value = originalValue
            searchInput.blur()
            
            // 测试链接是否可点击
            const testLink = document.querySelector('a[href^="/"]') as HTMLAnchorElement
            if (testLink) {
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              })
              
              // 阻止实际导航，只测试事件是否被处理
              clickEvent.preventDefault = () => {
                console.log('🔧 AutoLinkFixer: 链接点击事件被正确处理')
                setIsFixed(true)
                return true
              }
              
              testLink.dispatchEvent(clickEvent)
            }
            
            console.log('🔧 AutoLinkFixer: 修复完成')
          }, 50)
        } catch (error) {
          console.error('🔧 AutoLinkFixer: 修复过程出错', error)
        }
      } else {
        console.log('🔧 AutoLinkFixer: 未找到搜索框')
        // 如果没找到搜索框，尝试其他修复方法
        alternativeFix()
      }
    }

    const alternativeFix = () => {
      console.log('🔧 AutoLinkFixer: 尝试备选修复方案')
      
      // 方案1：强制触发React重渲染
      const root = document.getElementById('__next')
      if (root) {
        const event = new Event('reactfix', { bubbles: true })
        root.dispatchEvent(event)
      }
      
      // 方案2：触发window resize事件
      window.dispatchEvent(new Event('resize'))
      
      // 方案3：修改body class触发重绘
      document.body.classList.add('links-fixed')
      
      setIsFixed(true)
    }

    // 延迟执行，确保DOM完全加载
    const timeouts = [100, 500, 1000] // 多次尝试，增加成功率
    
    if (attemptCount < timeouts.length && !isFixed) {
      const timeout = setTimeout(() => {
        attemptFix()
        setAttemptCount(prev => prev + 1)
      }, timeouts[attemptCount])
      
      return () => clearTimeout(timeout)
    }
  }, [attemptCount, isFixed])

  // 监听路由变化，重新应用修复
  useEffect(() => {
    const handleRouteChange = () => {
      setIsFixed(false)
      setAttemptCount(0)
    }

    // 监听popstate事件（浏览器前进/后退）
    window.addEventListener('popstate', handleRouteChange)
    
    // 监听Next.js路由变化（如果有自定义事件）
    window.addEventListener('routeChangeComplete', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('routeChangeComplete', handleRouteChange)
    }
  }, [])

  return null
}