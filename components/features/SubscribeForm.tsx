'use client'

/**
 * 订阅表单组件
 * @module components/features/SubscribeForm
 * @description 使用 ConvertKit 的公开表单 URL，避免暴露 API 密钥
 */
import { useState, FormEvent } from 'react'

interface SubscribeFormProps {
  /**
   * ConvertKit 表单 ID
   */
  formId?: string
  /**
   * 自定义样式类
   */
  className?: string
  /**
   * 提交成功后的回调
   */
  onSuccess?: () => void
  /**
   * 是否显示在侧边栏（紧凑模式）
   */
  compact?: boolean
}

/**
 * 邮件订阅表单组件
 * @component
 * @param {SubscribeFormProps} props - 组件属性
 * @returns {JSX.Element} 渲染的订阅表单
 * @description 使用 ConvertKit 的公开订阅端点，无需 API 密钥。
 * 支持两种模式：紧凑模式（用于侧边栏）和完整模式（用于文章底部）。
 * 包含表单验证、加载状态、成功/错误反馈。
 * @example
 * // 紧凑模式
 * <SubscribeForm compact={true} />
 * 
 * // 完整模式
 * <SubscribeForm onSuccess={() => console.log('Subscribed!')} />
 */
export default function SubscribeForm({
  formId = process.env.NEXT_PUBLIC_CONVERTKIT_FORM_ID || '1234567',
  className = '',
  onSuccess,
  compact = false
}: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  
  /**
   * 处理表单提交
   * @async
   * @param {FormEvent<HTMLFormElement>} e - 表单提交事件
   * @returns {Promise<void>}
   * @description 使用 ConvertKit 的公开表单提交端点，不需要 API 密钥。
   * 处理表单验证、API 调用、状态更新和错误处理。
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!email) {
      setStatus('error')
      setMessage('请输入有效的邮箱地址')
      return
    }
    
    setStatus('loading')
    setMessage('')
    
    try {
      // 使用 ConvertKit 的公开表单提交 URL
      // 这个端点不需要 API 密钥，是安全的客户端解决方案
      const formData = new FormData()
      formData.append('email_address', email)
      if (firstName) {
        formData.append('first_name', firstName)
      }
      
      const response = await fetch(
        `https://app.convertkit.com/forms/${formId}/subscriptions`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        }
      )
      
      const data = await response.json()
      
      if (response.ok && data.status === 'success') {
        setStatus('success')
        setMessage('订阅成功！请查看您的邮箱确认订阅。')
        setEmail('')
        setFirstName('')
        onSuccess?.()
        
        // 3秒后重置状态
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 3000)
      } else {
        throw new Error(data.error || '订阅失败')
      }
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '订阅失败，请稍后重试')
      
      // 3秒后重置错误状态
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }
  
  if (compact) {
    // 紧凑模式（侧边栏）
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          订阅更新
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          获取最新文章和资源
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="您的邮箱"
            disabled={status === 'loading' || status === 'success'}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
          
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                订阅中...
              </span>
            ) : status === 'success' ? (
              '已订阅 ✓'
            ) : (
              '订阅'
            )}
          </button>
        </form>
        
        {message && (
          <p className={`mt-3 text-xs ${
            status === 'error' ? 'text-red-600' : 'text-green-600'
          }`}>
            {message}
          </p>
        )}
        
        <p className="mt-3 text-xs text-gray-500">
          我们尊重您的隐私，随时可取消订阅
        </p>
      </div>
    )
  }
  
  // 完整模式（文章底部）
  return (
    <div className={`subscribe-section ${className}`}>
      <h3 className="text-2xl font-light mb-4 text-gray-900">
        喜欢这篇文章？
      </h3>
      
      <div className="divider"></div>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        订阅我的博客，获取更多关于技术、设计和生活的深度思考
      </p>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="您的名字（可选）"
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="您的邮箱地址"
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="w-full btn-subscribe disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              订阅中...
            </span>
          ) : status === 'success' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已订阅
            </span>
          ) : (
            '订阅'
          )}
        </button>
      </form>
      
      {message && (
        <p className={`mt-4 text-sm text-center ${
          status === 'error' ? 'text-red-600' : 'text-green-600'
        }`}>
          {message}
        </p>
      )}
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        每周最多一封邮件，随时可以取消订阅
      </p>
    </div>
  )
}