'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LinkDiagnosticPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])
  const [navigationAttempts, setNavigationAttempts] = useState(0)

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`🔍 ${message}`)
  }

  useEffect(() => {
    log('页面加载完成')
    
    // 检查 Next.js 路由器状态
    if (router) {
      log('Router 对象存在')
    } else {
      log('❌ Router 对象不存在')
    }

    // 监听所有点击事件
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      
      if (anchor) {
        const href = anchor.getAttribute('href')
        log(`点击了链接: ${href}`)
        
        // 检查是否有其他元素在阻止点击
        const rect = anchor.getBoundingClientRect()
        const elementsAtPoint = document.elementsFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        )
        
        if (elementsAtPoint[0] !== anchor && !anchor.contains(elementsAtPoint[0])) {
          log(`⚠️ 链接被遮挡，最上层元素: ${elementsAtPoint[0].tagName}.${elementsAtPoint[0].className}`)
        }
      }
    }

    document.addEventListener('click', handleGlobalClick, true)
    return () => document.removeEventListener('click', handleGlobalClick, true)
  }, [router])

  // 测试各种导航方法
  const testNavigationMethods = async () => {
    log('=== 开始导航测试 ===')
    
    // 方法1: router.push
    try {
      log('测试 router.push("/about")...')
      setNavigationAttempts(prev => prev + 1)
      await router.push('/about')
      log('✅ router.push 成功')
    } catch (error) {
      log(`❌ router.push 失败: ${error}`)
    }
  }

  // 手动导航函数
  const manualNavigate = (path: string) => {
    log(`手动导航到: ${path}`)
    try {
      router.push(path)
      log('✅ 导航命令已发送')
    } catch (error) {
      log(`❌ 导航失败: ${error}`)
    }
  }

  // 检查页面中所有链接的状态
  const checkAllLinks = () => {
    const links = document.querySelectorAll('a')
    log(`=== 检查页面中的 ${links.length} 个链接 ===`)
    
    links.forEach((link, index) => {
      const href = link.getAttribute('href')
      const styles = window.getComputedStyle(link)
      const rect = link.getBoundingClientRect()
      
      log(`链接 ${index + 1}: ${href}`)
      log(`  - pointer-events: ${styles.pointerEvents}`)
      log(`  - z-index: ${styles.zIndex}`)
      log(`  - position: ${styles.position}`)
      log(`  - display: ${styles.display}`)
      log(`  - visibility: ${styles.visibility}`)
      log(`  - 位置: top=${rect.top}, left=${rect.left}`)
      
      // 检查是否在视口内
      if (rect.top < 0 || rect.bottom > window.innerHeight || 
          rect.left < 0 || rect.right > window.innerWidth) {
        log(`  - ⚠️ 链接在视口外`)
      }
      
      // 检查是否被遮挡
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const topElement = document.elementFromPoint(centerX, centerY)
      
      if (topElement !== link && !link.contains(topElement)) {
        log(`  - ⚠️ 被遮挡，顶层元素: ${topElement?.tagName}`)
      }
    })
  }

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8">链接诊断工具</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* 左侧：测试控制面板 */}
        <div className="space-y-6">
          <section className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">测试链接</h2>
            
            {/* Next.js Link 组件 */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Next.js Link 组件:</h3>
              <div className="space-y-2">
                <Link href="/about" className="block p-2 bg-blue-100 rounded hover:bg-blue-200">
                  Link 到 /about
                </Link>
                <Link href="/blog" className="block p-2 bg-blue-100 rounded hover:bg-blue-200">
                  Link 到 /blog
                </Link>
              </div>
            </div>

            {/* 普通 a 标签 */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">普通 a 标签:</h3>
              <div className="space-y-2">
                <a href="/projects" className="block p-2 bg-green-100 rounded hover:bg-green-200">
                  a 标签到 /projects
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                   className="block p-2 bg-green-100 rounded hover:bg-green-200">
                  外部链接 (GitHub)
                </a>
              </div>
            </div>

            {/* 手动导航按钮 */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">手动导航测试:</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => manualNavigate('/tools')}
                  className="w-full p-2 bg-purple-100 rounded hover:bg-purple-200"
                >
                  router.push 到 /tools
                </button>
                <button 
                  onClick={testNavigationMethods}
                  className="w-full p-2 bg-purple-100 rounded hover:bg-purple-200"
                >
                  运行导航测试
                </button>
                <button 
                  onClick={() => window.location.href = '/bookshelf'}
                  className="w-full p-2 bg-yellow-100 rounded hover:bg-yellow-200"
                >
                  window.location 到 /bookshelf
                </button>
              </div>
            </div>
          </section>

          <section className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">诊断工具</h2>
            <div className="space-y-2">
              <button 
                onClick={checkAllLinks}
                className="w-full p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                检查所有链接状态
              </button>
              <button 
                onClick={() => setLogs([])}
                className="w-full p-2 bg-red-100 rounded hover:bg-red-200"
              >
                清空日志
              </button>
            </div>
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <p>导航尝试次数: {navigationAttempts}</p>
            </div>
          </section>
        </div>

        {/* 右侧：日志显示 */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">诊断日志</h2>
          <div className="h-[600px] overflow-y-auto bg-gray-50 dark:bg-gray-800 p-4 rounded font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">等待操作...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 底部说明 */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 rounded">
        <h3 className="font-semibold mb-2">使用说明:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>点击左侧的各种链接测试导航</li>
          <li>查看右侧日志了解发生了什么</li>
          <li>使用"检查所有链接状态"查看页面中所有链接的详细信息</li>
          <li>如果链接无法点击，日志会显示具体原因</li>
        </ol>
      </div>
    </div>
  )
}