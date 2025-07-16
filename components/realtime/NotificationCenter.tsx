'use client'

import { useState, useEffect, useRef } from 'react' 

import { useAuth } from '@/contexts/AuthContext' 

import { REALTIME_EVENTS, RealtimeNotification } from '@/lib/realtime/config' 

import { getEventManager } from '@/lib/realtime/event-manager' 

import { formatDistanceToNow } from 'date-fns' 

import { zhCN } from 'date-fns/locale'

interface NotificationCenterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxNotifications?: number
  autoHideDuration?: number
}
export function NotificationCenter({
  position = 'top-right',
  maxNotifications = 5,
  autoHideDuration = 5000
}: NotificationCenterProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [showToast, setShowToast] = useState<RealtimeNotification | null>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const toastTimeoutRef = useRef<NodeJS.Timeout>()
  
  // 订阅通知事件
  useEffect(() => {
    if (!user) return
    
    const eventManager = getEventManager()
    
    // 订阅新通知事件
    const unsubscribe = eventManager.subscribe<RealtimeNotification>(
      REALTIME_EVENTS.NOTIFICATION_NEW,
      (notification) => {
        // 只处理发给当前用户的通知
        if (notification.userId === user.id) {
          handleNewNotification(notification)
        }
      }
    )
    
    // 加载历史通知
    loadNotifications()
    
    return () => {
      unsubscribe()
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }   }, [user])
  
  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // 加载通知列表
  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        updateUnreadCount(data)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }
  
  // 处理新通知
  const handleNewNotification = (notification: RealtimeNotification) => {
    // 添加到列表
    setNotifications(prev => {
      const updated = [notification, ...prev]
      if (updated.length > maxNotifications) {
        updated.pop()
      }
      return updated
    })
    
    // 更新未读数
    if (!notification.read) {
      setUnreadCount(prev => prev + 1)
    }
    
    // 显示 Toast 提示
    showNotificationToast(notification)
    
    // 播放提示音（可选）
    playNotificationSound()
    
    // 浏览器通知（需要权限）
    showBrowserNotification(notification)
  }
  
  // 显示 Toast 提示
  const showNotificationToast = (notification: RealtimeNotification) => {
    setShowToast(notification)
    
    // 清除之前的定时器
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    
    // 自动隐藏
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(null)
    }, autoHideDuration)
  }
  
  // 播放提示音
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.5
      audio.play()
    } catch (error) {
      console.log('Failed to play notification sound')
    }
  }
  
  // 显示浏览器通知
  const showBrowserNotification = async (notification: RealtimeNotification) => {
    if (!('Notification' in window)) return
    
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: notification.id,
        requireInteraction: false
      })
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        showBrowserNotification(notification)
      }
    }
  }
  
  // 标记为已读
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
        updateUnreadCount()
        
        // 发布已读事件
        getEventManager().publish(
          'notifications',
          REALTIME_EVENTS.NOTIFICATION_READ,
          { notificationId, userId: user?.id }
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }
  
  // 标记全部已读
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }
  
  // 删除通知
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        updateUnreadCount()
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }
  
  // 更新未读数
  const updateUnreadCount = (notificationList?: RealtimeNotification[]) => {
    const list = notificationList || notifications
    const count = list.filter(n => !n.read).length
    setUnreadCount(count)
  }
  
  // 获取通知图标
  const getNotificationIcon = (type: RealtimeNotification['type']) => {
    switch (type) {
      case 'comment': return '💬'
      case 'like': return '❤️'
      case 'mention': return '@'
      case 'system': return '📢'
      default: return '🔔'
    }
  }
  
  // 获取位置样式
  const getPositionStyles = () => {
    switch (position) {
      case 'top-left': return 'top-20 left-4'
      case 'bottom-right': return 'bottom-4 right-4'
      case 'bottom-left': return 'bottom-4 left-4'
      default: return 'top-20 right-4'
    }
  }
  
  if (!user) return null
  
  return (
    <>
      {/* 通知按钮 */}
      <div ref={notificationRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="通知中心"
        >
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        
        {/* 通知列表 */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold">通知中心</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    全部已读
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* 通知列表 */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <span className="text-4xl mb-2 block">🔕</span>
                  <p>暂无通知</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50/20' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id)
                        }
                        if (notification.link) {
                          window.location.href = notification.link
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="text-gray-400 hover:text-gray-600 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: zhCN
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* 底部操作 */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <a
                  href="/notifications"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  查看全部通知 →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Toast 通知 */}
      {showToast && (
        <div className={`fixed ${getPositionStyles()} z-50 animate-slide-in`}>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">
                {getNotificationIcon(showToast.type)}
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {showToast.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {showToast.message}
                </p>
              </div>
              <button
                onClick={() => setShowToast(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}