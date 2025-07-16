/**
 * 登录提示组件
 * 统一的登录引导UI，可在多处复用
 */

'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Github } from 'lucide-react'

interface LoginPromptProps {
  title?: string
  description?: string
  action?: string
  className?: string
  compact?: boolean
}

export function LoginPrompt({ 
  title = '需要登录',
  description = '登录后即可使用此功能',
  action = '参与互动',
  className = '',
  compact = false
}: LoginPromptProps) {
  const { signIn } = useAuth()
  
  if (compact) {
    return (
      <div className={`flex items-center justify-center gap-2 text-sm text-gray-600 ${className}`}>
        <span>{description}</span>
        <button
          onClick={signIn}
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          立即登录
        </button>
      </div>
    )
  }
  
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center ${className}`}>
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <button
          onClick={signIn}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <Github className="w-5 h-5" />
          <span>使用 GitHub 登录{action && `${action}`}</span>
        </button>
        
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>安全快捷</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>无需注册</span>
          </div>
        </div>
      </div>
    </div>
  )
}