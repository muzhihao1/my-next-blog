'use client'

import { useEffect } from 'react'

export default function GlobalListenerChecker() {
  useEffect(() => {
    console.log('🌍 检查全局事件监听器...')
    
    // 检查是否有遮罩元素残留
    const checkForOverlays = () => {
      const allElements = document.querySelectorAll('*')
      const overlays: Element[] = []
      
      allElements.forEach(el => {
        const styles = window.getComputedStyle(el)
        
        // 检查是否是全屏遮罩
        if (
          styles.position === 'fixed' &&
          styles.inset === '0px' || 
          (styles.top === '0px' && styles.left === '0px' && styles.right === '0px' && styles.bottom === '0px')
        ) {
          // 检查是否可见
          if (
            styles.display !== 'none' &&
            styles.visibility !== 'hidden' &&
            parseFloat(styles.opacity) > 0
          ) {
            overlays.push(el)
          }
        }
      })
      
      if (overlays.length > 0) {
        console.error('⚠️ 发现全屏遮罩元素！这可能阻止链接点击：')
        overlays.forEach((el, index) => {
          console.log(`  ${index + 1}. ${el.tagName}`, {
            className: el.className,
            id: el.id,
            zIndex: window.getComputedStyle(el).zIndex,
            backgroundColor: window.getComputedStyle(el).backgroundColor,
            hasOnClick: !!(el as HTMLElement).onclick
          })
        })
      }
    }
    
    // 检查 body 和 document 的事件监听器
    const checkGlobalClickHandlers = () => {
      console.log('🔍 检查全局点击处理器:')
      
      // 创建测试事件
      const testEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
      
      // 检查 document
      let docPreventDefault = false
      const origPrevent = testEvent.preventDefault
      testEvent.preventDefault = function() {
        docPreventDefault = true
        return origPrevent.call(this)
      }
      
      document.dispatchEvent(testEvent)
      
      if (docPreventDefault) {
        console.error('❌ document 级别有阻止默认行为的监听器！')
      }
      
      // 恢复
      testEvent.preventDefault = origPrevent
    }
    
    // 检查是否有隐藏的模态框或面板
    const checkHiddenModals = () => {
      const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"], .modal, .drawer, .panel')
      const hiddenModals: Element[] = []
      
      modals.forEach(modal => {
        const styles = window.getComputedStyle(modal)
        // 检查是否隐藏但仍在 DOM 中
        if (styles.display === 'none' || styles.visibility === 'hidden' || parseFloat(styles.opacity) === 0) {
          // 检查子元素是否有遮罩
          const overlay = modal.querySelector('.overlay, .backdrop, [class*="bg-overlay"]')
          if (overlay) {
            hiddenModals.push(modal)
          }
        }
      })
      
      if (hiddenModals.length > 0) {
        console.warn('⚠️ 发现隐藏的模态框/面板，可能有遮罩残留:')
        hiddenModals.forEach(modal => {
          console.log('  -', modal.className || modal.tagName)
        })
      }
    }
    
    // 检查所有具有 onClick 的元素
    const checkOnClickElements = () => {
      const elementsWithOnClick = document.querySelectorAll('[onclick]')
      if (elementsWithOnClick.length > 0) {
        console.log(`📎 发现 ${elementsWithOnClick.length} 个元素有 onclick 属性`)
        
        // 检查是否有阻止事件冒泡的
        elementsWithOnClick.forEach((el, index) => {
          const onclickStr = el.getAttribute('onclick') || ''
          if (
            onclickStr.includes('stopPropagation') || 
            onclickStr.includes('preventDefault') ||
            onclickStr.includes('return false')
          ) {
            console.warn(`  ⚠️ 元素 ${index} 可能阻止事件传播:`, el.tagName, el.className)
          }
        })
      }
    }
    
    // 延迟执行，确保页面完全加载
    setTimeout(() => {
      console.log('========== 全局监听器检查 ==========')
      checkForOverlays()
      checkGlobalClickHandlers()
      checkHiddenModals()
      checkOnClickElements()
      console.log('====================================')
      
      // 每 5 秒检查一次，看是否有新的遮罩出现
      const interval = setInterval(checkForOverlays, 5000)
      
      // 清理
      return () => clearInterval(interval)
    }, 2000)
    
  }, [])
  
  return null
}