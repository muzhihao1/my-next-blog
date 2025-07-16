'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'
import { ErrorToast } from '@/components/ui/ErrorToast'
import { LoginPrompt } from '@/components/auth/LoginPrompt'
import type { ContentType } from '@/types/supabase'

interface CommentSectionProps {
  contentId: string
  contentType: ContentType
}

export interface Comment {
  id: string
  content: string
  user_id: string
  content_id: string
  content_type: string
  parent_id: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
  user_profiles: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  }
  replies?: Comment[]
}

interface CommentsResponse {
  comments: Comment[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export function CommentSection({ contentId, contentType }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  
  // 获取评论列表
  const fetchComments = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        contentType,
        page: pageNum.toString(),
        limit: '20'
      })
      
      const response = await fetch(`/api/comments/${contentId}?${params}`)
      
      if (!response.ok) {
        throw new Error('获取评论失败')
      }
      
      const data: CommentsResponse = await response.json()
      
      if (pageNum === 1) {
        setComments(data.comments)
      } else {
        setComments(prev => [...prev, ...data.comments])
      }
      
      setTotal(data.total)
      setHasMore(data.hasMore)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取评论失败')
    } finally {
      setLoading(false)
    }
  }
  
  // 初始加载
  useEffect(() => {
    fetchComments(1)
  }, [contentId, contentType])
  
  // 处理新评论
  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev])
    setTotal(prev => prev + 1)
  }
  
  // 处理评论更新
  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prev => prev.map(comment => 
      comment.id === updatedComment.id ? updatedComment : comment
    ))
  }
  
  // 处理评论删除
  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          content: '[此评论已删除]',
          is_deleted: true
        }
      }
      return comment
    }))
  }
  
  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchComments(page + 1)
    }
  }
  
  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-8">
        评论 {total > 0 && <span className="text-gray-500">({total})</span>}
      </h3>
      
      {/* 评论表单 */}
      {user ? (
        <CommentForm
          contentId={contentId}
          contentType={contentType}
          onCommentAdded={handleCommentAdded}
        />
      ) : (
        <LoginPrompt
          title="加入讨论"
          description="登录后即可发表评论，与其他读者交流想法"
          action="并开始评论"
          className="mb-8"
        />
      )}
      
      {/* 评论列表 */}
      <CommentList
        comments={comments}
        loading={loading}
        onCommentUpdated={handleCommentUpdated}
        onCommentDeleted={handleCommentDeleted}
        onReplyAdded={handleCommentAdded}
      />
      
      {/* 加载更多按钮 */}
      {hasMore && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            加载更多评论
          </button>
        </div>
      )}
      
      {/* 错误提示 */}
      <ErrorToast
        message={error}
        onClose={() => setError(null)}
      />
    </div>
  )
}