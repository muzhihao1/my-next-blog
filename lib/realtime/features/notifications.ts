/**
 * 实时通知功能
 * 处理通知的发送、接收、存储和展示
 */
import { createClient } from '@/lib/supabase/client'
import { getEventManager } from '../event-manager'
import {
  REALTIME_CHANNELS,
  REALTIME_EVENTS,
  RealtimeNotification,
} from '../config'

/**
 * 通知优先级
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}
/**
 * 通知选项
 */
export interface NotificationOptions {
  priority?: NotificationPriority
  duration?: number // 显示时长（毫秒）
  persistent?: boolean // 是否持久显示
  sound?: boolean // 是否播放声音
  vibrate?: boolean // 是否振动（移动端）
  actions?: NotificationAction[] // 操作按钮
}
/**
 * 通知操作
 */
export interface NotificationAction {
  id: string
  label: string
  style?: 'primary' | 'secondary' | 'danger'
  callback?: () => void | Promise<void>
}
/**
 * 通知存储
 */
interface NotificationStore {
  notifications: RealtimeNotification[]
  unreadCount: number
  lastReadAt: string
}
/**
 * 实时通知管理器
 */
export class RealtimeNotifications {
  private eventManager = getEventManager()
  private supabase = createClient()
  private notifications: RealtimeNotification[] = []
  private unreadCount = 0
  private notificationSound?: HTMLAudioElement
  private permissionGranted = false
  
  constructor() {
    this.initializeAudio()
    this.checkNotificationPermission()
  }
  /**
   * 初始化通知监听
   */
  async initialize() {
    // 加载历史通知
    await this.loadNotifications()
    
    // 订阅新通知事件
    const unsubNew = this.eventManager.subscribe(
      REALTIME_EVENTS.NOTIFICATION_NEW,
      (notification: RealtimeNotification) => {
        this.handleNewNotification(notification)
      }
    )
    
    // 订阅已读事件
    const unsubRead = this.eventManager.subscribe(
      REALTIME_EVENTS.NOTIFICATION_READ,
      (data: { notificationId: string; userId: string }) => {
        this.handleNotificationRead(data.notificationId)
      }
    )
    
    // 返回清理函数
    return () => {
      unsubNew()
      unsubRead()
    }
  }
  
  /**
   * 发送通知
   */
  async send(
    userId: string,
    notification: Omit<RealtimeNotification, 'id' | 'createdAt' | 'read'>,
    options?: NotificationOptions
  ): Promise<void> {
    // 保存到数据库
    const { data, error } = await this.supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        metadata: {
          ...notification.metadata,
          priority: options?.priority || NotificationPriority.MEDIUM,
        },
      })
      .select()
      .single()
      
    if (error) {
      console.error('Failed to save notification:', error)
      throw error
    }
    // 发送实时通知
    await this.eventManager.sendNotification(userId, {
      ...notification,
      metadata: {
        ...notification.metadata,
        ...options,
      },
    })
  }
  /**
   * 批量发送通知
   */
  async sendBatch(
    notifications: Array<{
      userId: string
      notification: Omit<RealtimeNotification, 'id' | 'createdAt' | 'read'>
      options?: NotificationOptions
    }>
  ): Promise<void> {
    // 批量保存到数据库
    const records = notifications.map(({ userId, notification, options }) => ({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      metadata: {
        ...notification.metadata,
        priority: options?.priority || NotificationPriority.MEDIUM,
      },
    }))

    const { error } = await this.supabase
      .from('notifications')
      .insert(records)
      
    if (error) {
      console.error('Failed to save notifications:', error)
      throw error
    }
    // 发送实时通知
    await Promise.all(
      notifications.map(({ userId, notification, options }) =>
        this.eventManager.sendNotification(userId, {
          ...notification,
          metadata: {
            ...notification.metadata,
            ...options,
          },
        })
      )
    )
  }
  /**
   * 获取通知列表
   */
  getNotifications(filter?: {
    unreadOnly?: boolean
    type?: RealtimeNotification['type']
    limit?: number
  }): RealtimeNotification[] {
    let filtered = [...this.notifications]
    if (filter?.unreadOnly) {
      filtered = filtered.filter(n => !n.read)
    }
    
    if (filter?.type) {
      filtered = filtered.filter(n => n.type === filter.type)
    }
    
    if (filter?.limit) {
      filtered = filtered.slice(0, filter.limit)
    }
    
    return filtered
  }
  /**
   * 标记为已读
   */
  async markAsRead(notificationId: string): Promise<void> {
    // 更新本地状态
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      this.unreadCount = Math.max(0, this.unreadCount - 1)
      
      // 更新数据库
      await this.supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        
      // 发送已读事件
      const { data: { user }
      } = await this.supabase.auth.getUser()
      
      if (user) {
        await this.eventManager.publish(
          REALTIME_CHANNELS.NOTIFICATIONS,
          REALTIME_EVENTS.NOTIFICATION_READ,
          { notificationId, userId: user.id }
        )
      }
    }
  }
  /**
   * 标记所有为已读
   */
  async markAllAsRead(): Promise<void> {
    const unreadIds = this.notifications
      .filter(n => !n.read)
      .map(n => n.id)
      
    if (unreadIds.length === 0) return
    
    // 更新本地状态
    this.notifications.forEach(n => {
      if (!n.read) n.read = true
    })
    this.unreadCount = 0
    
    // 批量更新数据库
    await this.supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .in('id', unreadIds)
      
    // 保存最后已读时间
    this.saveLastReadTime()
  }
  /**
   * 删除通知
   */
  async deleteNotification(notificationId: string): Promise<void> {
    // 从本地移除
    const index = this.notifications.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      const notification = this.notifications[index]
      if (!notification.read) {
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
      
      this.notifications.splice(index, 1)
      
      // 从数据库删除
      await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
    }
  }
  
  /**
   * 清空所有通知
   */
  async clearAll(): Promise<void> {
    const { data: { user }
    } = await this.supabase.auth.getUser()
    
    if (!user) return
    
    // 清空本地
    this.notifications = []
    this.unreadCount = 0
    
    // 清空数据库
    await this.supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
  }
  /**
   * 获取未读数量
   */
  getUnreadCount(): number {
    return this.unreadCount
  }
  // === 私有方法 ===
  
  /**
   * 加载通知
   */
  private async loadNotifications() {
    const { data: { user }
    } = await this.supabase.auth.getUser()
    
    if (!user) return
    
    // 获取最近30天的通知
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100)
      
    if (error) {
      console.error('Failed to load notifications:', error)
      return
    }
    this.notifications = data.map(this.transformNotification)
    this.unreadCount = this.notifications.filter(n => !n.read).length
  }
  /**
   * 处理新通知
   */
  private async handleNewNotification(notification: RealtimeNotification) {
    // 检查是否是当前用户的通知
    const { data: { user }
    } = await this.supabase.auth.getUser()
    
    if (!user || notification.userId !== user.id) return
    
    // 添加到列表
    this.notifications.unshift(notification)
    if (!notification.read) {
      this.unreadCount++
    }
    // 显示通知
    this.showNotification(notification)
    
    // 触发UI更新
    window.dispatchEvent(new CustomEvent('notification:new', {
      detail: notification
    }))
  }
  /**
   * 处理通知已读
   */
  private handleNotificationRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      this.unreadCount = Math.max(0, this.unreadCount - 1)
      
      // 触发UI更新
      window.dispatchEvent(new CustomEvent('notification:read', {
        detail: notificationId
      }))
    }
  }
  
  /**
   * 显示通知
   */
  private showNotification(notification: RealtimeNotification) {
    const options = notification.metadata as NotificationOptions
    
    // 播放声音
    if (options?.sound !== false) {
      this.playNotificationSound()
    }
    // 显示浏览器通知
    if (this.permissionGranted) {
      this.showBrowserNotification(notification)
    }
    // 触发自定义通知UI
    window.dispatchEvent(new CustomEvent('notification:show', {
      detail: { notification, options }
    }))
  }
  /**
   * 显示浏览器通知
   */
  private showBrowserNotification(notification: RealtimeNotification) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }
    const browserNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/icon-96x96.png',
      tag: notification.id,
      requireInteraction: notification.metadata?.persistent,
    })
    
    // 点击通知
    browserNotif.onclick = () => {
      window.focus()
      if (notification.link) {
        window.location.href = notification.link
      }
      browserNotif.close()
    }
    // 自动关闭
    const duration = notification.metadata?.duration || 5000
    if (!notification.metadata?.persistent) {
      setTimeout(() => browserNotif.close(), duration)
    }
  }
  
  /**
   * 初始化音频
   */
  private initializeAudio() {
    if (typeof window === 'undefined') return
    
    this.notificationSound = new Audio('/sounds/notification.mp3')
    this.notificationSound.volume = 0.5
  }
  /**
   * 播放通知声音
   */
  private playNotificationSound() {
    if (this.notificationSound) {
      this.notificationSound.play().catch(err => {
        console.log('Failed to play notification sound:', err)
      })
    }
  }
  
  /**
   * 检查通知权限
   */
  private async checkNotificationPermission() {
    if (!('Notification' in window)) return
    
    if (Notification.permission === 'granted') {
      this.permissionGranted = true
    }
    else if (Notification.permission !== 'denied') {
      // 请求权限
      const permission = await Notification.requestPermission()
      this.permissionGranted = permission === 'granted'
    }
  }
  
  /**
   * 保存最后已读时间
   */
  private saveLastReadTime() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastNotificationRead', new Date().toISOString())
    }
  }
  
  /**
   * 转换通知格式
   */
  private transformNotification(data: any): RealtimeNotification {
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      read: data.read,
      createdAt: data.created_at,
      userId: data.user_id,
      metadata: data.metadata,
    }
  }
}
// 导出单例实例
let notificationManager: RealtimeNotifications | null = null

export function getNotificationManager(): RealtimeNotifications {
  if (!notificationManager) {
    notificationManager = new RealtimeNotifications()
  }
  return notificationManager
}
/**
 * React Hook: 使用实时通知
 */
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    const manager = getNotificationManager()
    
    const initialize = async () => {
      await manager.initialize()
      setNotifications(manager.getNotifications())
      setUnreadCount(manager.getUnreadCount())
      setIsInitialized(true)
    }
    // 监听通知事件
    const handleNew = () => {
      setNotifications(manager.getNotifications())
      setUnreadCount(manager.getUnreadCount())
    }
    const handleRead = () => {
      setNotifications(manager.getNotifications())
      setUnreadCount(manager.getUnreadCount())
    }
    window.addEventListener('notification:new', handleNew)
    window.addEventListener('notification:read', handleRead)
    
    initialize()
    
    return () => {
      window.removeEventListener('notification:new', handleNew)
      window.removeEventListener('notification:read', handleRead)
    }
  }, [])
  
  return {
    notifications,
    unreadCount,
    isInitialized,
    markAsRead: (id: string) => manager.markAsRead(id),
    markAllAsRead: () => manager.markAllAsRead(),
    deleteNotification: (id: string) => manager.deleteNotification(id),
    clearAll: () => manager.clearAll(),
  }
}

// 导入React hooks
import { useState, useEffect } from 'react'

const manager = getNotificationManager()