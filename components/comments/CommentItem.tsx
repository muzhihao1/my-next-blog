'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Edit2, Trash2, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { CommentForm } from './CommentForm'
import type { Comment } from './CommentSection'

interface CommentItemProps {
  comment: Comment
  onUpdate: (comment: Comment) => void
  onDelete: (commentId: string) => void
  onReplyAdded: (comment: Comment) => void
  isReply?: boolean
}

export function CommentItem({
  comment,
  onUpdate,
  onDelete,
  onReplyAdded,
  isReply = false
}: CommentItemProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [submitting, setSubmitting] = useState(false)
  
  const isOwner = user?.id === comment.user_id
  const canEdit = isOwner && !comment.is_deleted
  
  // 处理编辑
  const handleEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false)
      return
    }
    
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/comment/${comment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: editContent.trim()
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '更新失败')
      }
      
      onUpdate(data.comment)
      setIsEditing(false)
    } catch (error) {
      console.error('更新评论失败:', error)
    } finally {
      setSubmitting(false)
    }
  }
  
  // 处理删除
  const handleDelete = async () => {
    if (!confirm('确定要删除这条评论吗？')) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/comment/${comment.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '删除失败')
      }
      
      onDelete(comment.id)
    } catch (error) {
      console.error('删除评论失败:', error)
    } finally {
      setSubmitting(false)
    }
  }
  
  // 处理回复添加
  const handleReplyAdded = (newComment: Comment) => {
    onReplyAdded(newComment)
    setIsReplying(false)
  }
  
  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex items-start gap-3">
        {/* 头像 */}
        <div className="flex-shrink-0">
          {comment.user_profiles.avatar_url ? (
            <img
              src={comment.user_profiles.avatar_url}
              alt={comment.user_profiles.display_name || 'User'}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">
                {(comment.user_profiles.display_name || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        {/* 评论内容 */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            {/* 用户信息和时间 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {comment.user_profiles.display_name || comment.user_profiles.username || '匿名用户'}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    locale: zhCN,
                    addSuffix: true
                  })}
                </span>
                {comment.updated_at !== comment.created_at && (
                  <span className="text-sm text-gray-500">
                    (已编辑)
                  </span>
                )}
              </div>
              
              {/* 操作按钮 */}
              {canEdit && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    disabled={submitting}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1 text-gray-500 hover:text-red-600"
                    disabled={submitting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* 评论内容或编辑框 */}
            {isEditing ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  disabled={submitting}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    disabled={submitting}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    disabled={submitting || !editContent.trim()}
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>
          
          {/* 回复按钮 */}
          {!isReply && !comment.is_deleted && user && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" />
              回复
            </button>
          )}
          
          {/* 回复表单 */}
          {isReplying && (
            <div className="mt-4">
              <CommentForm
                contentId={comment.content_id}
                contentType={comment.content_type as any}
                parentId={comment.id}
                onCommentAdded={handleReplyAdded}
                onCancel={() => setIsReplying(false)}
                placeholder={`回复 @${comment.user_profiles.display_name || '用户'}...`}
              />
            </div>
          )}
          
          {/* 回复列表 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onReplyAdded={onReplyAdded}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}