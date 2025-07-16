/**
 * 认证模态框组件
 * 提供更流畅的登录体验
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { X, Github, CheckCircle } from 'lucide-react'
import { createPortal } from 'react-dom'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  redirectTo?: string
  feature?: string
}

export function AuthModal({ isOpen, onClose, redirectTo, feature }: AuthModalProps) {
  const { signIn, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  const handleSignIn = async () => {
    try {
      await signIn()
      // 登录成功后会自动重定向，所以这里不需要手动关闭
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
  
  if (!mounted || !isOpen) return null
  
  const modal = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* 内容 */}
          <div className="p-8 text-center">
            {/* Logo或图标 */}
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              欢迎回来
            </h2>
            
            <p className="text-gray-600 mb-8">
              {feature 
                ? `登录后即可${feature}`
                : '登录以获得完整的阅读体验'
              }
            </p>
            
            {/* 登录按钮 */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>正在登录...</span>
                </>
              ) : (
                <>
                  <Github className="w-5 h-5" />
                  <span>使用 GitHub 登录</span>
                </>
              )}
            </button>
            
            {/* 功能特性 */}
            <div className="mt-8 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">评论互动</p>
                  <p className="text-sm text-gray-600">参与文章讨论，分享你的见解</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">收藏文章</p>
                  <p className="text-sm text-gray-600">保存喜欢的内容，随时回顾</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">个性推荐</p>
                  <p className="text-sm text-gray-600">基于阅读历史的智能推荐</p>
                </div>
              </div>
            </div>
            
            {/* 隐私说明 */}
            <p className="mt-6 text-xs text-gray-500">
              我们尊重您的隐私，仅使用必要的信息提供服务
            </p>
          </div>
        </div>
      </div>
    </div>
  )
  
  return createPortal(modal, document.body)
}