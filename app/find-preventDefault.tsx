'use client'

import { useEffect } from 'react'

export default function FindPreventDefault() {
  useEffect(() => {
    console.log('🔍 查找 preventDefault 源头...')
    
    // 检查所有现有的事件监听器
    const checkExistingListeners = () => {
      // 获取所有链接
      const links = document.querySelectorAll('a')
      
      links.forEach((link, index) => {
        // 创建一个假的点击事件
        const testEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        })
        
        // 添加一个标记来追踪
        let preventDefaultCalled = false
        const originalPreventDefault = testEvent.preventDefault
        testEvent.preventDefault = function() {
          preventDefaultCalled = true
          return originalPreventDefault.call(this)
        }
        
        // 分派事件
        link.dispatchEvent(testEvent)
        
        if (preventDefaultCalled && index < 5) { // 只报告前5个
          console.log(`🔗 链接 "${link.textContent?.trim()}" 的点击被阻止`)
          console.log('  href:', link.href)
          console.log('  class:', link.className)
          
          // 检查链接的父元素
          let parent = link.parentElement
          let depth = 0
          while (parent && depth < 5) {
            if (parent.onclick || parent.getAttribute('onclick')) {
              console.log(`  父元素 ${parent.tagName} 有 onclick`)
            }
            parent = parent.parentElement
            depth++
          }
        }
      })
    }
    
    // 检查全局对象
    const checkGlobalHandlers = () => {
      console.log('🌍 检查全局处理器:')
      
      // 检查 window 对象
      if (window.onclick) {
        console.log('  window.onclick 存在')
      }
      
      // 检查 document 对象
      if (document.onclick) {
        console.log('  document.onclick 存在')
      }
      
      // 检查 body
      if (document.body && document.body.onclick) {
        console.log('  document.body.onclick 存在')
      }
      
      // 检查所有具有 onclick 属性的元素
      const elementsWithOnclick = document.querySelectorAll('[onclick]')
      if (elementsWithOnclick.length > 0) {
        console.log(`  发现 ${elementsWithOnclick.length} 个元素有 onclick 属性`)
      }
    }
    
    // 延迟执行，确保页面完全加载
    setTimeout(() => {
      checkExistingListeners()
      checkGlobalHandlers()
      
      // 检查 Next.js 特定的问题
      console.log('🔍 Next.js 检查:')
      // @ts-ignore
      if (window.__NEXT_DATA__) {
        // @ts-ignore
        console.log('  页面:', window.__NEXT_DATA__.page)
        // @ts-ignore
        console.log('  查询参数:', window.__NEXT_DATA__.query)
      }
      
      // 检查是否有任何第三方脚本
      const scripts = document.querySelectorAll('script[src]')
      const thirdPartyScripts = Array.from(scripts).filter(s => 
        !s.src.includes('/_next/') && !s.src.includes('localhost')
      )
      
      if (thirdPartyScripts.length > 0) {
        console.log('🔍 第三方脚本:')
        thirdPartyScripts.forEach(script => {
          console.log('  -', script.src)
        })
      }
    }, 2000)
    
  }, [])
  
  return null
}