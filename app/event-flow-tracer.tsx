'use client'

import { useEffect } from 'react'

export default function EventFlowTracer() {
  useEffect(() => {
    console.log('🎯 开始追踪事件流...')
    
    // 记录所有点击事件的详细流程
    const traceEventFlow = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // 只追踪链接点击
      if (target.tagName !== 'A' && !target.closest('a')) return
      
      const link = target.tagName === 'A' ? target : target.closest('a')
      const phase = e.eventPhase === 1 ? 'CAPTURE' : e.eventPhase === 2 ? 'TARGET' : 'BUBBLE'
      
      console.log(`🔵 [${phase}] 点击事件:`, {
        currentTarget: e.currentTarget === document ? 'document' : 
                      e.currentTarget === window ? 'window' : 
                      (e.currentTarget as HTMLElement)?.tagName || 'unknown',
        target: target.tagName,
        link: (link as HTMLAnchorElement)?.href,
        defaultPrevented: e.defaultPrevented,
        timestamp: performance.now()
      })
      
      // 在事件被阻止的瞬间捕获调用栈
      if (e.defaultPrevented && !target.dataset.preventDefaultLogged) {
        target.dataset.preventDefaultLogged = 'true'
        console.error('❌ preventDefault 在此处被调用！当前事件状态:', {
          phase,
          currentTarget: e.currentTarget,
          propagationStopped: e.cancelBubble
        })
      }
    }
    
    // 监听所有可能的事件阶段
    const elements = [document, document.body, ...document.querySelectorAll('*')]
    
    // 捕获阶段
    document.addEventListener('click', traceEventFlow, true)
    document.body.addEventListener('click', traceEventFlow, true)
    
    // 冒泡阶段
    document.addEventListener('click', traceEventFlow, false)
    document.body.addEventListener('click', traceEventFlow, false)
    
    // 监听 window 级别的事件
    window.addEventListener('click', (e) => {
      console.log('🌐 Window 级别点击事件:', {
        defaultPrevented: e.defaultPrevented,
        target: (e.target as HTMLElement)?.tagName
      })
    }, true)
    
    // 拦截 React 合成事件系统
    const checkReactRoot = () => {
      // 查找 React 根节点
      const reactRoot = document.getElementById('__next') || document.querySelector('[data-reactroot]')
      if (reactRoot) {
        console.log('⚛️ 找到 React 根节点:', reactRoot)
        
        // 检查 React 事件委托
        const reactEventHandlers = Object.keys(reactRoot).filter(key => 
          key.startsWith('__reactEvents') || 
          key.startsWith('__reactListeners') ||
          key.includes('react')
        )
        
        if (reactEventHandlers.length > 0) {
          console.log('⚛️ React 事件处理器:', reactEventHandlers)
          
          reactEventHandlers.forEach(key => {
            const value = (reactRoot as any)[key]
            console.log(`React 事件 ${key}:`, value)
          })
        }
      }
      
      // 查找所有具有 onClick 的元素
      const elementsWithOnClick = document.querySelectorAll('[onclick]')
      if (elementsWithOnClick.length > 0) {
        console.log('🔴 发现内联 onclick 处理器:')
        elementsWithOnClick.forEach(el => {
          console.log({
            element: `${el.tagName}.${el.className}`,
            onclick: el.getAttribute('onclick')
          })
        })
      }
    }
    
    // 延迟执行以确保 React 完全加载
    setTimeout(checkReactRoot, 2000)
    
    // 尝试拦截 React 19 的事件系统
    const interceptReact19Events = () => {
      // React 19 使用新的事件系统
      const possibleRoots = [
        document.getElementById('__next'),
        document.querySelector('#root'),
        document.body.firstElementChild
      ].filter(Boolean)
      
      possibleRoots.forEach(root => {
        if (!root) return
        
        // 查找 React Fiber 节点
        const fiberKey = Object.keys(root).find(key => 
          key.startsWith('__reactFiber') || 
          key.startsWith('_reactRootContainer')
        )
        
        if (fiberKey) {
          console.log('⚛️ React Fiber 找到:', fiberKey)
          const fiber = (root as any)[fiberKey]
          
          // 遍历 Fiber 树查找事件处理器
          const findEventHandlers = (node: any, depth = 0) => {
            if (!node || depth > 10) return
            
            if (node.memoizedProps?.onClick) {
              console.log('🎯 发现 onClick 处理器:', {
                component: node.type?.name || node.type,
                onClick: node.memoizedProps.onClick.toString().substring(0, 200)
              })
            }
            
            if (node.child) findEventHandlers(node.child, depth + 1)
            if (node.sibling) findEventHandlers(node.sibling, depth)
          }
          
          findEventHandlers(fiber)
        }
      })
    }
    
    setTimeout(interceptReact19Events, 3000)
    
    // 清理函数
    return () => {
      document.removeEventListener('click', traceEventFlow, true)
      document.removeEventListener('click', traceEventFlow, false)
      document.body.removeEventListener('click', traceEventFlow, true)
      document.body.removeEventListener('click', traceEventFlow, false)
    }
  }, [])
  
  return null
}