'use client'

import { useEffect } from 'react'

export default function UltimateDebugger() {
  useEffect(() => {
    console.log('🚀 Ultimate Debugger 启动...')
    
    // 1. 拦截 Next.js Link 组件的渲染
    const checkNextJSComponents = () => {
      // 查找所有的 React Fiber 节点
      const findReactFiber = (element: Element): any => {
        const key = Object.keys(element).find(key => 
          key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
        )
        return key ? (element as any)[key] : null
      }
      
      // 检查所有链接
      const links = document.querySelectorAll('a')
      const linkInfo: any[] = []
      
      links.forEach((link, index) => {
        const fiber = findReactFiber(link)
        if (fiber && index < 10) { // 只检查前10个
          const info: any = {
            href: link.href,
            text: link.textContent?.trim(),
            className: link.className,
            hasOnClick: !!link.onclick,
            fiberType: fiber.elementType?.name || fiber.elementType || 'unknown'
          }
          
          // 查找 onClick props
          if (fiber.memoizedProps) {
            info.hasPropsOnClick = !!fiber.memoizedProps.onClick
            if (fiber.memoizedProps.onClick) {
              info.onClickString = fiber.memoizedProps.onClick.toString().substring(0, 100)
            }
          }
          
          linkInfo.push(info)
        }
      })
      
      console.log('🔗 链接分析:', linkInfo)
    }
    
    // 2. 监控所有的路由变化尝试
    const monitorRouting = () => {
      // 监控 history API
      const originalPushState = window.history.pushState
      const originalReplaceState = window.history.replaceState
      
      window.history.pushState = function(...args) {
        console.log('📍 history.pushState 被调用:', args)
        return originalPushState.apply(window.history, args)
      }
      
      window.history.replaceState = function(...args) {
        console.log('📍 history.replaceState 被调用:', args)
        return originalReplaceState.apply(window.history, args)
      }
      
      // 监控 popstate
      window.addEventListener('popstate', (e) => {
        console.log('📍 popstate 事件:', e)
      })
    }
    
    // 3. 检查是否有其他脚本在干扰
    const checkForInterference = () => {
      // 检查是否有覆盖默认行为的代码
      console.log('🔍 检查干扰因素:')
      
      // 检查是否有全局的 CSS 规则
      const styleSheets = Array.from(document.styleSheets)
      styleSheets.forEach((sheet, index) => {
        try {
          const rules = Array.from(sheet.cssRules || [])
          rules.forEach(rule => {
            if (rule instanceof CSSStyleRule) {
              const style = rule.style
              if (style.pointerEvents === 'none' && rule.selectorText?.includes('a')) {
                console.warn(`⚠️ CSS 规则阻止链接点击: ${rule.selectorText}`)
              }
            }
          })
        } catch (e) {
          // 跨域样式表
        }
      })
      
      // 检查 Next.js 的内部状态
      // @ts-ignore
      if (window.next) {
        console.log('Next.js 内部状态:')
        // @ts-ignore
        console.log('  version:', window.next.version)
        // @ts-ignore
        console.log('  router:', window.next.router)
        // @ts-ignore
        console.log('  emitter:', window.next.emitter)
      }
    }
    
    // 4. 创建一个完全独立的测试链接
    const createTestLink = () => {
      const testContainer = document.createElement('div')
      testContainer.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: yellow;
        padding: 20px;
        z-index: 999999;
        border: 2px solid black;
      `
      
      testContainer.innerHTML = `
        <h3 style="margin: 0 0 10px 0;">测试链接</h3>
        <a href="/about" style="color: blue; text-decoration: underline; display: block; margin: 5px 0;">
          原生 a 标签
        </a>
        <div id="test-next-link" style="margin: 5px 0;"></div>
        <button id="close-test" style="margin-top: 10px;">关闭</button>
      `
      
      document.body.appendChild(testContainer)
      
      // 监听测试链接
      const testLink = testContainer.querySelector('a')
      testLink?.addEventListener('click', (e) => {
        console.log('🧪 测试链接点击:', {
          defaultPrevented: e.defaultPrevented,
          href: (e.target as HTMLAnchorElement).href
        })
      }, true)
      
      // 关闭按钮
      document.getElementById('close-test')?.addEventListener('click', () => {
        testContainer.remove()
      })
    }
    
    // 执行所有检查
    setTimeout(() => {
      console.log('========== 开始诊断 ==========')
      checkNextJSComponents()
      monitorRouting()
      checkForInterference()
      createTestLink()
      console.log('========== 诊断完成 ==========')
    }, 2000)
    
  }, [])
  
  return null
}