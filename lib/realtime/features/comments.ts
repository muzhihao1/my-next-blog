/**
 * 实时评论功能
 * 处理评论的实时更新、通知和同步
 */
import { createClient } from '@/lib/supabase/client' 

import { getEventManager } from '../event-manager' 

import {
  REALTIME_CHANNELS,
  REALTIME_EVENTS,
  RealtimeMessage,
} from '../config'

/**
 * 评论实时事件数据
 */
export interface CommentRealtimeData {
  commentId: string
  contentId: string
  contentType: 'post' | 'project' | 'book' | 'tool'
  userId: string
  username: string
  userAvatar?: string
  content: string
  parentId?: string
  createdAt: string
  action: 'create' | 'update' | 'delete'
}
/**
 * 评论输入状态
 */
export interface CommentTypingData {
  contentId: string
  userId: string
  username: string
  isTyping: boolean
}
/**
 * 实时评论管理器
 */
export class RealtimeComments {
  private eventManager = getEventManager()
  private supabase = createClient()
  private typingTimers: Map<string, NodeJS.Timeout> = new Map()
  
  /**
   * 初始化实时评论监听
   */
  async initialize(contentId: string, contentType: string) {
    // 订阅评论创建事件
    const unsubCreate = this.eventManager.subscribe(
      REALTIME_EVENTS.COMMENT_CREATED,
      (data: CommentRealtimeData) => {
        if (data.contentId === contentId && data.contentType === contentType) {
          this.handleCommentCreated(data)
        }
      }
    )
    
    // 订阅评论更新事件
    const unsubUpdate = this.eventManager.subscribe(
      REALTIME_EVENTS.COMMENT_UPDATED,
      (data: CommentRealtimeData) => {
        if (data.contentId === contentId && data.contentType === contentType) {
          this.handleCommentUpdated(data)
        }
      }
    )
    
    // 订阅评论删除事件
    const unsubDelete = this.eventManager.subscribe(
      REALTIME_EVENTS.COMMENT_DELETED,
      (data: CommentRealtimeData) => {
        if (data.contentId === contentId && data.contentType === contentType) {
          this.handleCommentDeleted(data)
        }
      }
    )
    
    // 订阅输入状态事件
    const unsubTyping = this.eventManager.subscribe(
      REALTIME_EVENTS.USER_TYPING,
      (data: CommentTypingData) => {
        if (data.contentId === contentId) {
          this.handleUserTyping(data)
        }
      }
    )
    
    // 返回清理函数
    return () => {
      unsubCreate()
      unsubUpdate()
      unsubDelete()
      unsubTyping()
      this.clearAllTypingTimers()
    }
  }
  
  /**
   * 发送新评论通知
   */
  async notifyNewComment(comment: CommentRealtimeData) {
    await this.eventManager.publish(
      REALTIME_CHANNELS.COMMENTS,
      REALTIME_EVENTS.COMMENT_CREATED,
      comment
    )
    
    // 发送通知给相关用户
    await this.sendCommentNotifications(comment)
  }
  /**
   * 发送评论更新通知
   */
  async notifyCommentUpdate(comment: CommentRealtimeData) {
    await this.eventManager.publish(
      REALTIME_CHANNELS.COMMENTS,
      REALTIME_EVENTS.COMMENT_UPDATED,
      comment
    )
  }
  /**
   * 发送评论删除通知
   */
  async notifyCommentDelete(commentId: string, contentId: string, contentType: string) {
    await this.eventManager.publish(
      REALTIME_CHANNELS.COMMENTS,
      REALTIME_EVENTS.COMMENT_DELETED,
      {
        commentId,
        contentId,
        contentType,
        action: 'delete',
      }
    )
  }
  /**
   * 更新输入状态
   */
  async updateTypingStatus(contentId: string, isTyping: boolean) {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return
    
    const typingData: CommentTypingData = {
      contentId,
      userId: user.id,
      username: user.user_metadata.name || user.email || 'Anonymous',
      isTyping,
    }
    await this.eventManager.publish(
      REALTIME_CHANNELS.COMMENTS,
      REALTIME_EVENTS.USER_TYPING,
      typingData
    )
    
    // 如果正在输入，设置自动停止定时器
    if (isTyping) {
      this.setTypingTimeout(contentId)
    }
  }
  
  /**
   * 获取正在输入的用户列表
   */
  getTypingUsers(contentId: string): string[] {
    // 这个方法应该从组件的本地状态中获取
    // 实际实现会在React组件中维护
    return []
  }
  
  // === 私有方法 ===
  
  /**
   * 处理新评论创建
   */
  private handleCommentCreated(data: CommentRealtimeData) {
    // 触发UI更新（通过事件系统）
    window.dispatchEvent(new CustomEvent('comment:created', { detail: data }))
  }
  /**
   * 处理评论更新
   */
  private handleCommentUpdated(data: CommentRealtimeData) {
    // 触发UI更新
    window.dispatchEvent(new CustomEvent('comment:updated', { detail: data }))
  }
  
  /**
   * 处理评论删除
   */
  private handleCommentDeleted(data: CommentRealtimeData) {
    // 触发UI更新
    window.dispatchEvent(new CustomEvent('comment:deleted', { detail: data }))
  }
  
  /**
   * 处理用户输入状态
   */
  private handleUserTyping(data: CommentTypingData) {
    // 触发UI更新
    window.dispatchEvent(new CustomEvent('user:typing', { detail: data }))
  }
  
  /**
   * 发送评论通知
   */
  private async sendCommentNotifications(comment: CommentRealtimeData) {
    // 获取需要通知的用户
    const usersToNotify = await this.getUsersToNotify(comment)
    
    // 发送通知
    for (const userId of usersToNotify) {
      await this.eventManager.sendNotification(userId, {
        type: 'comment',
        title: '新评论',
        message: `${comment.username} 回复了你的评论`,
        link: `/posts/${comment.contentId}#comment-${comment.commentId}`,
        userId,
        metadata: {
          commentId: comment.commentId,
          contentId: comment.contentId,
          contentType: comment.contentType,
        },
      })
    }
  }
  
  /**
   * 获取需要通知的用户
   */
  private async getUsersToNotify(comment: CommentRealtimeData): Promise<string[]> {
    const users = new Set<string>()
    
    // 1. 如果是回复，通知被回复的用户
    if (comment.parentId) {
      const { data: parentComment } = await this.supabase
        .from('comments')
        .select('user_id')
        .eq('id', comment.parentId)
        .single()
        
      if (parentComment && parentComment.user_id !== comment.userId) {
        users.add(parentComment.user_id)
      }
    }
    
    // 2. 通知内容作者
    const { data: content } = await this.getContentAuthor(
      comment.contentId,
      comment.contentType
    )
    
    if (content && content.authorId !== comment.userId) {
      users.add(content.authorId)
    }
    
    // 3. 通知提到的用户（如果评论中有@提及）
    const mentionedUsers = this.extractMentions(comment.content)
    mentionedUsers.forEach(userId => {
      if (userId !== comment.userId) {
        users.add(userId)
      }
    })
    
    return Array.from(users)
  }
  
  /**
   * 获取内容作者
   */
  private async getContentAuthor(
    contentId: string,
    contentType: string
  ): Promise<{ authorId: string } | null> {
    // 根据内容类型查询不同的表
    // 这里简化处理，实际应该根据contentType查询对应的表
    try {
      const { data } = await this.supabase
        .from('posts')
        .select('author_id')
        .eq('id', contentId)
        .single()
        
      return data ? { authorId: data.author_id } : null
    } catch (error) {
      console.error('Failed to get content author:', error)
      return null
    }
  }
  
  /**
   * 提取评论中的@提及
   */
  private extractMentions(content: string): string[] {
    // 简单的@提及提取，实际应该更复杂
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    
    let match
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }
    
    return mentions
  }
  
  /**
   * 设置输入超时
   */
  private setTypingTimeout(contentId: string) {
    // 清除现有定时器
    const existingTimer = this.typingTimers.get(contentId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    
    // 设置新定时器（5秒后自动停止输入状态）
    const timer = setTimeout(() => {
      this.updateTypingStatus(contentId, false)
      this.typingTimers.delete(contentId)
    }, 5000)
    
    this.typingTimers.set(contentId, timer)
  }
  
  /**
   * 清除所有输入定时器
   */
  private clearAllTypingTimers() {
    this.typingTimers.forEach(timer => clearTimeout(timer))
    this.typingTimers.clear()
  }
}

// 导出单例实例
let realtimeComments: RealtimeComments | null = null

export function getRealtimeComments(): RealtimeComments {
  if (!realtimeComments) {
    realtimeComments = new RealtimeComments()
  }
  return realtimeComments
}
/**
 * React Hook: 使用实时评论
 */
export function useRealtimeComments(
  contentId: string,
  contentType: string,
  enabled = true
) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    if (!enabled || !contentId) return
    
    let cleanup: (() => void) | undefined
    
    const initialize = async () => {
      const comments = getRealtimeComments()
      cleanup = await comments.initialize(contentId, contentType)
      setIsInitialized(true)
    }
    
    // 监听输入状态事件
    const handleTyping = (event: CustomEvent<CommentTypingData>) => {
      const { userId, username, isTyping } = event.detail
      
      setTypingUsers(prev => {
        if (isTyping) {
          // 添加到输入列表（如果不存在）
          return prev.includes(username) ? prev : [...prev, username]
        } else {
          // 从输入列表移除
          return prev.filter(u => u !== username)
        }
      })
    }
    
    window.addEventListener('user:typing', handleTyping as EventListener)
    
    initialize()
    
    return () => {
      window.removeEventListener('user:typing', handleTyping as EventListener)
      cleanup?.()
      setIsInitialized(false)
      setTypingUsers([])
    }
  }, [contentId, contentType, enabled])
  
  return {
    typingUsers,
    isInitialized,
    updateTypingStatus: (isTyping: boolean) => {
      getRealtimeComments().updateTypingStatus(contentId, isTyping)
    },
  }
}
// 导入useState和useEffect
import { useState, useEffect } from 'react'