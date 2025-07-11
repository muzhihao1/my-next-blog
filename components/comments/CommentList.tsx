'use client'

import { CommentItem } from './CommentItem'
import type { Comment } from './CommentSection'

interface CommentListProps {
  comments: Comment[]
  loading: boolean
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (commentId: string) => void
  onReplyAdded: (comment: Comment) => void
}

export function CommentList({
  comments,
  loading,
  onCommentUpdated,
  onCommentDeleted,
  onReplyAdded
}: CommentListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          还没有评论，来发表第一条评论吧！
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onUpdate={onCommentUpdated}
          onDelete={onCommentDeleted}
          onReplyAdded={onReplyAdded}
        />
      ))}
    </div>
  )
}