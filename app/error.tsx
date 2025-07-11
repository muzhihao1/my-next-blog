'use client'

import { useEffect } from 'react' 
import Link from 'next/link' 

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误到控制台
    console.error('应用错误:', error)
  }, [error])
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
<h2 className="text-2xl font-bold text-red-600 mb-4">出现了一些问题</h2>
<p className="text-gray-600 mb-6"> 抱歉，页面加载时遇到了错误。这可能是由于浏览器扩展或临时的技术问题导致的。 </p>
<div className="space-y-4">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
          <Link
            href="/"
            className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            返回首页
          </Link>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-gray-500">错误详情</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}