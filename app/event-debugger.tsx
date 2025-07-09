'use client'

import { useEffect } from 'react'

export default function EventDebugger() {
  useEffect(() => {
    console.log('🔍 Event Debugger 启动...')
    
    // 保存原始方法
    const originalAddEventListener = EventTarget.prototype.addEventListener
    const originalPreventDefault = Event.prototype.preventDefault
    const originalStopPropagation = Event.prototype.stopPropagation
    const originalStopImmediatePropagation = Event.prototype.stopImmediatePropagation
    
    // 跟踪谁调用了 preventDefault
    Event.prototype.preventDefault = function() {
      const stack = new Error().stack
      
      // 如果是点击事件
      if (this.type === 'click') {
        const target = this.target as HTMLElement
        const link = target?.closest?.('a')
        
        if (link) {
          console.error('❌ preventDefault 被调用在链接点击事件上！')
          console.error('目标链接:', link.href)
          console.error('调用栈:', stack)
          
          // 尝试找出调用者
          const stackLines = stack?.split('\n') || []
          const relevantLine = stackLines.find(line => 
            !line.includes('event-debugger') && 
            !line.includes('Event.preventDefault') &&
            (line.includes('.tsx') || line.includes('.ts') || line.includes('.js'))
          )
          
          if (relevantLine) {
            console.error('🎯 可能的调用者:', relevantLine.trim())
          }
        }
      }
      
      return originalPreventDefault.call(this)
    }
    
    // 跟踪谁调用了 stopPropagation
    Event.prototype.stopPropagation = function() {
      if (this.type === 'click') {
        const target = this.target as HTMLElement
        const link = target?.closest?.('a')
        
        if (link) {
          console.warn('⚠️ stopPropagation 被调用在链接点击事件上')
          console.warn('调用栈:', new Error().stack)
        }
      }
      
      return originalStopPropagation.call(this)
    }
    
    // 跟踪事件监听器
    const listeners = new Map()
    
    EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
      if (type === 'click') {
        const target = this
        const listenerStr = listener.toString()
        
        // 记录监听器信息
        const key = `${target.constructor.name}_${type}_${Date.now()}`
        listeners.set(key, {
          target: target.constructor.name,
          element: target,
          listener: listenerStr,
          hasPreventDefault: listenerStr.includes('preventDefault'),
          hasStopPropagation: listenerStr.includes('stopPropagation'),
          capture: options === true || (options && options.capture),
          stack: new Error().stack
        })
        
        // 如果监听器包含 preventDefault，警告
        if (listenerStr.includes('preventDefault')) {
          console.warn('⚠️ 发现包含 preventDefault 的 click 监听器:', {
            target: target.constructor.name,
            preview: listenerStr.substring(0, 100) + '...'
          })
        }
      }
      
      return originalAddEventListener.call(this, type, listener, options)
    }
    
    // 监听所有链接点击，看看哪些被阻止了
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && e.defaultPrevented) {
        console.error('🚫 链接点击被阻止:', {
          href: link.href,
          text: link.textContent?.trim(),
          defaultPrevented: e.defaultPrevented,
          currentTarget: e.currentTarget
        })
        
        // 打印所有相关的监听器
        console.log('📋 相关的 click 监听器:')
        listeners.forEach((info, key) => {
          if (info.hasPreventDefault) {
            console.log(`  - ${info.target}:`, info)
          }
        })
      }
    }, true)
    
    // 5秒后打印总结
    setTimeout(() => {
      console.log('📊 Event Debugger 总结:')
      console.log('总共 click 监听器数量:', listeners.size)
      
      const preventDefaultListeners = Array.from(listeners.values()).filter(l => l.hasPreventDefault)
      console.log('包含 preventDefault 的监听器:', preventDefaultListeners.length)
      
      preventDefaultListeners.forEach(listener => {
        console.log('  -', listener.target, '包含 preventDefault')
      })
    }, 5000)
    
    // 清理
    return () => {
      Event.prototype.preventDefault = originalPreventDefault
      Event.prototype.stopPropagation = originalStopPropagation
      Event.prototype.stopImmediatePropagation = originalStopImmediatePropagation
      EventTarget.prototype.addEventListener = originalAddEventListener
    }
  }, [])
  
  return null
}