'use client'

import { useEffect } from 'react'

export default function PreventDefaultTracker() {
  useEffect(() => {
    console.log('🎯 开始追踪 preventDefault 调用...')
    
    // 保存原始的 preventDefault 方法
    const originalPreventDefault = Event.prototype.preventDefault
    const trackingData: Array<{
      eventType: string
      target: string
      timestamp: number
      stack: string
      component?: string
    }> = []
    
    // 重写 preventDefault 方法
    Event.prototype.preventDefault = function() {
      const event = this as Event
      const target = event.target as HTMLElement
      const stack = new Error().stack || ''
      
      // 解析调用栈，尝试找到 React 组件
      const stackLines = stack.split('\n')
      let componentName = '未知组件'
      
      // 查找包含组件信息的栈帧
      for (const line of stackLines) {
        // Next.js 构建后的文件模式
        if (line.includes('.js:') && !line.includes('node_modules')) {
          // 尝试从文件名中提取信息
          const match = line.match(/(\w+)\.js:/) || line.match(/(\w+)-[\w]+\.js:/)
          if (match) {
            componentName = match[1]
          }
        }
        
        // React 组件名称模式
        if (line.includes('at ') && !line.includes('at Object.')) {
          const componentMatch = line.match(/at (\w+)/)
          if (componentMatch && componentMatch[1] !== 'HTMLUnknownElement') {
            componentName = componentMatch[1]
            break
          }
        }
      }
      
      // 记录信息
      const info = {
        eventType: event.type,
        target: `${target?.tagName}.${target?.className} (${target?.id || '无ID'})`,
        timestamp: Date.now(),
        stack: stack.substring(0, 500),
        component: componentName
      }
      
      trackingData.push(info)
      
      // 如果是链接点击事件，立即报告
      if (event.type === 'click' && target?.tagName === 'A') {
        console.error('❌ 链接点击被 preventDefault 阻止！', {
          href: (target as HTMLAnchorElement).href,
          组件: componentName,
          目标元素: info.target,
          调用栈前5行: stackLines.slice(0, 5).join('\n')
        })
      }
      
      // 每次都输出当前的 preventDefault 调用
      console.log(`⚠️ preventDefault 被调用:`, {
        事件类型: event.type,
        目标元素: info.target,
        组件: componentName
      })
      
      // 调用原始方法
      return originalPreventDefault.call(this)
    }
    
    // 定期输出汇总报告
    const reportInterval = setInterval(() => {
      if (trackingData.length > 0) {
        console.log('📊 preventDefault 调用汇总:')
        console.table(trackingData.map(item => ({
          时间: new Date(item.timestamp).toLocaleTimeString(),
          事件类型: item.eventType,
          目标元素: item.target,
          组件: item.component
        })))
      }
    }, 5000)
    
    // 监听所有点击事件，查看事件流
    const captureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a')
        console.log('🔍 检测到链接点击:', {
          href: (link as HTMLAnchorElement)?.href,
          defaultPrevented: e.defaultPrevented,
          eventPhase: e.eventPhase === 1 ? '捕获阶段' : e.eventPhase === 2 ? '目标阶段' : '冒泡阶段'
        })
      }
    }
    
    // 在捕获阶段监听
    document.addEventListener('click', captureClick, true)
    
    // 清理函数
    return () => {
      Event.prototype.preventDefault = originalPreventDefault
      clearInterval(reportInterval)
      document.removeEventListener('click', captureClick, true)
    }
  }, [])
  
  return null
}