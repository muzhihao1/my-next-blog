'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DebugPage() {
  const router = useRouter()
  const [errors, setErrors] = useState<string[]>([])
  const [clickCount, setClickCount] = useState(0)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])

  useEffect(() => {
    // 监听全局错误
    const handleError = (event: ErrorEvent) => {
      setErrors(prev => [...prev, `Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`])
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setErrors(prev => [...prev, `Unhandled Promise Rejection: ${event.reason}`])
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // 检查是否有元素覆盖
    const checkOverlay = () => {
      const elements = document.querySelectorAll('*')
      const overlayElements: string[] = []
      
      elements.forEach((el) => {
        const styles = window.getComputedStyle(el)
        if (
          styles.position === 'fixed' &&
          styles.width === '100%' &&
          styles.height === '100%' &&
          styles.zIndex !== 'auto' &&
          parseInt(styles.zIndex) > 1000
        ) {
          overlayElements.push(`${el.tagName}.${el.className}`)
        }
      })
      
      if (overlayElements.length > 0) {
        setErrors(prev => [...prev, `Found overlay elements: ${overlayElements.join(', ')}`])
      }
    }

    checkOverlay()

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const handleLinkClick = (href: string) => {
    setNavigationHistory(prev => [...prev, `Clicked: ${href} at ${new Date().toLocaleTimeString()}`])
  }

  const handleRouterPush = (href: string) => {
    try {
      router.push(href)
      setNavigationHistory(prev => [...prev, `Router.push: ${href} at ${new Date().toLocaleTimeString()}`])
    } catch (error) {
      setErrors(prev => [...prev, `Router.push error: ${error}`])
    }
  }

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8">调试页面</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* 链接测试 */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">链接测试</h2>
          
          <div className="space-y-3">
            <div>
              <Link 
                href="/" 
                onClick={() => handleLinkClick('/')}
                className="text-blue-600 hover:underline"
              >
                Next.js Link - 首页
              </Link>
            </div>
            
            <div>
              <Link 
                href="/blog" 
                onClick={() => handleLinkClick('/blog')}
                className="text-blue-600 hover:underline"
              >
                Next.js Link - 博客
              </Link>
            </div>
            
            <div>
              <button
                onClick={() => handleRouterPush('/')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Router.push - 首页
              </button>
            </div>
            
            <div>
              <button
                onClick={() => {
                  setClickCount(prev => prev + 1)
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                点击计数: {clickCount}
              </button>
            </div>
          </div>
        </div>
        
        {/* 错误日志 */}
        <div className="border border-red-300 dark:border-red-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">错误日志</h2>
          {errors.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">暂无错误</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {errors.map((error, index) => (
                <li key={index} className="text-red-600 dark:text-red-400">
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* 导航历史 */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">导航历史</h2>
          {navigationHistory.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">暂无导航记录</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {navigationHistory.map((item, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* 环境信息 */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">环境信息</h2>
          <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
{JSON.stringify({
  userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
  pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
  hasSupabase: typeof window !== 'undefined' && !!(window as any).supabase,
  documentReady: typeof document !== 'undefined' ? document.readyState : 'N/A',
}, null, 2)}
          </pre>
        </div>
      </div>
      
      {/* 快速操作 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">快速操作</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            刷新页面
          </button>
          <button
            onClick={() => {
              localStorage.clear()
              sessionStorage.clear()
              alert('已清除本地存储')
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            清除存储
          </button>
          <button
            onClick={() => {
              const links = document.querySelectorAll('a')
              alert(`页面上有 ${links.length} 个链接`)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            检查链接数量
          </button>
        </div>
      </div>
    </div>
  )
}