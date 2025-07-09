'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function TestLinksPage() {
  const router = useRouter()
  const [clickLog, setClickLog] = useState<string[]>([])

  // 监听全局点击事件
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const closestAnchor = target.closest('a')
      
      setClickLog(prev => [...prev, `Global click: ${target.tagName} - ${closestAnchor ? 'Inside anchor' : 'Not in anchor'}`])
    }

    document.addEventListener('click', handleGlobalClick, true)
    return () => document.removeEventListener('click', handleGlobalClick, true)
  }, [])

  const handleClick = (message: string) => {
    setClickLog(prev => [...prev, message])
  }

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8">链接测试页面</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* 左侧：各种链接测试 */}
        <div className="space-y-6">
          <section className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Next.js Link 组件</h2>
            <div className="space-y-2">
              <Link 
                href="/" 
                className="block text-blue-600 hover:text-blue-800 underline p-2 border rounded"
                onClick={() => handleClick('Next.js Link clicked')}
              >
                Next.js Link 到首页
              </Link>
              
              <Link 
                href="/blog" 
                className="block text-blue-600 hover:text-blue-800 underline p-2 border rounded"
              >
                Next.js Link 到博客（无 onClick）
              </Link>
            </div>
          </section>

          <section className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">普通 a 标签</h2>
            <div className="space-y-2">
              <a 
                href="/" 
                className="block text-green-600 hover:text-green-800 underline p-2 border rounded"
                onClick={() => handleClick('Regular <a> clicked')}
              >
                普通 a 标签到首页
              </a>
              
              <a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="block text-green-600 hover:text-green-800 underline p-2 border rounded"
                onClick={() => handleClick('External link clicked')}
              >
                外部链接（GitHub）
              </a>
            </div>
          </section>

          <section className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">使用 router.push</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  handleClick('router.push to /about')
                  router.push('/about')
                }}
                className="block w-full text-left text-purple-600 hover:text-purple-800 underline p-2 border rounded bg-purple-50"
              >
                使用 router.push 到关于页面
              </button>
              
              <button
                onClick={() => {
                  handleClick('window.location.href to /projects')
                  window.location.href = '/projects'
                }}
                className="block w-full text-left text-purple-600 hover:text-purple-800 underline p-2 border rounded bg-purple-50"
              >
                使用 window.location.href 到项目页面
              </button>
            </div>
          </section>

          <section className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">测试阻止默认行为</h2>
            <div className="space-y-2">
              <Link 
                href="/tools" 
                className="block text-red-600 hover:text-red-800 underline p-2 border rounded"
                onClick={(e) => {
                  e.preventDefault()
                  handleClick('Link with preventDefault - blocked')
                }}
              >
                Link with preventDefault（应该被阻止）
              </Link>
              
              <a 
                href="/bookshelf" 
                className="block text-red-600 hover:text-red-800 underline p-2 border rounded"
                onClick={(e) => {
                  e.preventDefault()
                  handleClick('Anchor with preventDefault - blocked')
                }}
              >
                a 标签 with preventDefault（应该被阻止）
              </a>
            </div>
          </section>
        </div>

        {/* 右侧：点击日志 */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">点击日志</h2>
          <div className="space-y-1 h-96 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-4 rounded">
            {clickLog.length === 0 ? (
              <p className="text-gray-500">等待点击事件...</p>
            ) : (
              clickLog.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {index + 1}. {log}
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setClickLog([])}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            清空日志
          </button>
        </div>
      </div>

      {/* 诊断信息 */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded">
        <h3 className="font-semibold mb-2">诊断信息：</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Next.js Link 组件在内部使用 router.push 进行客户端导航</li>
          <li>如果 Link 无法点击，可能是被 CSS 或 JavaScript 阻止了</li>
          <li>检查是否有全局的 pointer-events: none 或 preventDefault</li>
          <li>查看控制台是否有错误信息</li>
        </ul>
      </div>
    </div>
  )
}