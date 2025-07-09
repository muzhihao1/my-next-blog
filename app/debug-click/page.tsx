'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DebugClickPage() {
  useEffect(() => {
    // 监听所有点击事件
    const handleClick = (e: MouseEvent) => {
      console.log('Click event:', {
        target: e.target,
        currentTarget: e.currentTarget,
        path: e.composedPath(),
        clientX: e.clientX,
        clientY: e.clientY,
        // 获取点击位置的所有元素
        elementsAtPoint: document.elementsFromPoint(e.clientX, e.clientY)
      })
    }

    // 监听所有Link组件的导航
    const handleRouteChange = (e: any) => {
      console.log('Route change attempt:', e)
    }

    document.addEventListener('click', handleClick, true)
    window.addEventListener('beforeunload', handleRouteChange)

    // 检查所有元素的z-index和pointer-events
    const checkElements = () => {
      const allElements = document.querySelectorAll('*')
      const problematicElements: any[] = []

      allElements.forEach((el) => {
        const styles = window.getComputedStyle(el)
        const zIndex = styles.zIndex
        const pointerEvents = styles.pointerEvents
        const position = styles.position

        // 检查高z-index元素
        if (zIndex !== 'auto' && parseInt(zIndex) > 10) {
          problematicElements.push({
            element: el,
            zIndex,
            pointerEvents,
            position,
            className: el.className,
            tagName: el.tagName.toLowerCase()
          })
        }

        // 检查pointer-events: none的元素
        if (pointerEvents === 'none' && el.querySelector('a, button')) {
          console.warn('Element with pointer-events: none contains interactive elements:', el)
        }
      })

      console.log('Elements with high z-index:', problematicElements)
    }

    // 延迟执行以确保页面完全加载
    setTimeout(checkElements, 1000)

    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('beforeunload', handleRouteChange)
    }
  }, [])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">调试点击问题</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">测试链接</h2>
          <div className="space-y-4">
            {/* Next.js Link */}
            <div>
              <Link href="/" className="text-blue-600 underline">
                Next.js Link 到首页
              </Link>
            </div>

            {/* 普通 a 标签 */}
            <div>
              <a href="/blog" className="text-blue-600 underline">
                普通 a 标签到博客
              </a>
            </div>

            {/* 带 onClick 的 Link */}
            <div>
              <Link 
                href="/projects" 
                onClick={(e) => {
                  console.log('Link onClick fired')
                }}
                className="text-blue-600 underline"
              >
                带 onClick 的 Link
              </Link>
            </div>

            {/* 按钮 */}
            <div>
              <button 
                onClick={() => {
                  console.log('Button clicked')
                  alert('按钮点击成功！')
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                测试按钮
              </button>
            </div>

            {/* 使用 router.push 的按钮 */}
            <div>
              <button 
                onClick={() => {
                  console.log('Attempting navigation with router')
                  window.location.href = '/about'
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                使用 window.location 导航
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">调试信息</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p>打开浏览器控制台查看：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>所有点击事件的详细信息</li>
              <li>高 z-index 元素列表</li>
              <li>可能阻止点击的元素</li>
              <li>路由导航尝试</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">检查 CSS</h2>
          <div className="space-y-2">
            <p>当前页面的计算样式：</p>
            <div id="style-info" className="bg-gray-200 p-4 rounded font-mono text-sm">
              <script dangerouslySetInnerHTML={{
                __html: `
                  setTimeout(() => {
                    const info = document.getElementById('style-info');
                    const body = window.getComputedStyle(document.body);
                    info.innerHTML = 
                      'body pointer-events: ' + body.pointerEvents + '<br>' +
                      'body position: ' + body.position + '<br>' +
                      'body z-index: ' + body.zIndex;
                  }, 100);
                `
              }} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}