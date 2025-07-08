'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 错误日志上报
    console.error('Application error:', error)
    
    // 如果配置了Sentry，在这里上报错误
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // TODO: 集成Sentry错误上报
      // Sentry.captureException(error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          出错了
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          抱歉，应用程序遇到了一个意外错误。我们已经记录了这个问题，并会尽快修复。
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                错误ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500 dark:text-gray-500">
          如果问题持续存在，请联系我们的技术支持
        </div>
      </div>
    </div>
  )
}