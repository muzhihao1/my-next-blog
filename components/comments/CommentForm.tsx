'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { ContentType } from '@/types/supabase'
import type { Comment } from './CommentSection'

interface CommentFormProps {
  contentId: string
  contentType: ContentType
  parentId?: string
  onCommentAdded: (comment: Comment) => void
  onCancel?: () => void
  placeholder?: string
}

export function CommentForm({
  contentId,
  contentType,
  parentId,
  onCommentAdded,
  onCancel,
  placeholder = '写下你的评论...'
}: CommentFormProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('评论内容不能为空')
      return
    }
    
    if (content.length > 500) {
      setError('评论内容不能超过500字')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content.trim(),
          contentId,
          contentType,
          parentId
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '发布评论失败')
      }
      
      // 清空表单
      setContent('')
      
      // 通知父组件
      onCommentAdded(data.comment)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布评论失败')
    } finally {
      setSubmitting(false)
    }
  }
  
  if (!user) return null
  
  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          disabled={submitting}
        />
        <div className="absolute bottom-2 right-2 text-sm text-gray-500">
          {content.length}/500
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
      
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          支持 Markdown 格式
        </div>
        
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={submitting}
            >
              取消
            </button>
          )}
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={submitting || !content.trim()}
          >
            {submitting ? '发布中...' : '发布评论'}
          </button>
        </div>
      </div>
    </form>
  )
}