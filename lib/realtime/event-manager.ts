/**
 * 实时事件管理器
 * 处理实时事件的分发、队列管理和错误处理
 */
import { getRealtimeClient, RealtimeClient } from './client' 

import {
  REALTIME_CHANNELS,
  REALTIME_EVENTS,
  RealtimeChannel,
  RealtimeEvent,
  RealtimeMessage,
  UserPresence,
  RealtimeNotification,
} from './config'

/**
 * 事件处理器类型
 */
type EventHandler<T = any> = (data: T) => void | Promise<void>

/**
 * 事件订阅选项
 */
interface SubscriptionOptions {
  once?: boolean // 只触发一次
  priority?: number // 优先级（越大越先执行）
  filter?: (data: any) => boolean // 过滤器
}
/**
 * 订阅信息
 */
interface Subscription {
  id: string
  event: RealtimeEvent
  handler: EventHandler
  options: SubscriptionOptions
}
/**
 * 实时事件管理器
 */
export class RealtimeEventManager {
  private client: RealtimeClient
  private subscriptions: Map<RealtimeEvent, Subscription[]> = new Map()
  private eventQueue: RealtimeMessage[] = []
  private processing = false
  private subscribedChannels: Set<RealtimeChannel> = new Set()
  
  constructor(client?: RealtimeClient) {
    this.client = client || getRealtimeClient()
    this.setupGlobalHandlers()
  }
  /**
   * 订阅事件
   */
  subscribe<T = any>(
    event: RealtimeEvent,
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): () => void {
    const subscription: Subscription = {
      id: this.generateSubscriptionId(),
      event,
      handler,
      options: {
        once: false,
        priority: 0,
        ...options,
      },
    }
    // 添加到订阅列表
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, [])
    }
    
    const subs = this.subscriptions.get(event)!
    subs.push(subscription)
    
    // 按优先级排序
    subs.sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0))
    
    // 自动订阅相关频道
    this.autoSubscribeChannel(event)
    
    // 返回取消订阅函数
    return () => this.unsubscribe(subscription.id)
  }
  /**
   * 取消订阅
   */
  unsubscribe(subscriptionId: string): void {
    for (const [event, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex(s => s.id === subscriptionId)
      if (index !== -1) {
        subs.splice(index, 1)
        if (subs.length === 0) {
          this.subscriptions.delete(event)
        }
        break
      }
    }
  }
  /**
   * 发布事件
   */
  async publish<T = any>(
    channel: RealtimeChannel,
    event: RealtimeEvent,
    data: T
  ): Promise<void> {
    try {
      await this.client.broadcast(channel, event, data)
    } catch (error) {
      console.error(`Failed to publish event ${event}:`, error)
      throw error
    }
  }
  
  /**
   * 批量发布事件
   */
  async publishBatch(
    messages: Array<{
      channel: RealtimeChannel
      event: RealtimeEvent
      data: any
    }>
  ): Promise<void> {
    const results = await Promise.allSettled(
      messages.map(msg => this.publish(msg.channel, msg.event, msg.data))
    )
    
    const failures = results.filter(r => r.status === 'rejected')
    if (failures.length > 0) {
      console.error(`Failed to publish ${failures.length} events`)
    }
  }
  
  /**
   * 获取在线用户
   */
  async getOnlineUsers(channel: RealtimeChannel): Promise<UserPresence[]> {
    return this.client.getPresence(channel)
  }
  /**
   * 更新用户状态
   */
  async updateUserStatus(
    channel: RealtimeChannel,
    status: Partial<UserPresence>
  ): Promise<void> {
    await this.client.updatePresence(channel, status)
  }
  /**
   * 发送实时通知
   */
  async sendNotification(
    userId: string,
    notification: Omit<RealtimeNotification, 'id' | 'createdAt' | 'read'>
  ): Promise<void> {
    const fullNotification: RealtimeNotification = {
      ...notification,
      id: this.generateNotificationId(),
      createdAt: new Date().toISOString(),
      read: false,
      userId,
    }
    
    await this.publish(
      REALTIME_CHANNELS.NOTIFICATIONS,
      REALTIME_EVENTS.NOTIFICATION_NEW,
      fullNotification
    )
  }
  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.subscriptions.clear()
    this.eventQueue = []
    this.subscribedChannels.clear()
    await this.client.disconnect()
  }
  // === 私有方法 ===
  
  /**
   * 设置全局事件处理器
   */
  private setupGlobalHandlers() {
    // 监听所有已注册的事件
    Object.values(REALTIME_EVENTS).forEach(event => {
      this.client.on(event, (message: RealtimeMessage) => {
        this.handleEvent(event, message)
      })
    })
  }
  /**
   * 处理事件
   */
  private async handleEvent(event: RealtimeEvent, message: RealtimeMessage) {
    // 添加到队列
    this.eventQueue.push(message)
    
    // 如果没有在处理，开始处理队列
    if (!this.processing) {
      await this.processEventQueue()
    }
  }
  
  /**
   * 处理事件队列
   */
  private async processEventQueue() {
    if (this.processing || this.eventQueue.length === 0) {
      return
    }
    
    this.processing = true
    
    while (this.eventQueue.length > 0) {
      const message = this.eventQueue.shift()!
      const subscriptions = this.subscriptions.get(message.event) || []
      
      // 并行执行所有处理器
      const handlers = subscriptions
        .filter(sub => !sub.options.filter || sub.options.filter(message.payload))
        .map(async sub => {
          try {
            await sub.handler(message.payload)
            
            // 如果是一次性订阅，移除它
            if (sub.options.once) {
              this.unsubscribe(sub.id)
            }
          } catch (error) {
            console.error(`Error in event handler for ${message.event}:`, error)
          }
        })
      
      await Promise.all(handlers)
    }
    
    this.processing = false
  }
  /**
   * 自动订阅频道
   */
  private async autoSubscribeChannel(event: RealtimeEvent) {
    // 根据事件类型确定需要订阅的频道
    let channel: RealtimeChannel | null = null
    
    if (event.startsWith('comment:')) {
      channel = REALTIME_CHANNELS.COMMENTS
    } else if (event.startsWith('user:')) {
      channel = REALTIME_CHANNELS.PRESENCE
    } else if (event.startsWith('notification:')) {
      channel = REALTIME_CHANNELS.NOTIFICATIONS
    } else if (event.startsWith('system:')) {
      channel = REALTIME_CHANNELS.ANALYTICS
    }
    
    if (channel && !this.subscribedChannels.has(channel)) {
      try {
        await this.client.subscribe(channel)
        this.subscribedChannels.add(channel)
      } catch (error) {
        console.error(`Failed to auto-subscribe to channel ${channel}:`, error)
      }
    }
  }
  /**
   * 生成订阅ID
   */
  private generateSubscriptionId(): string {
    return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  /**
   * 生成通知ID
   */
  private generateNotificationId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
// 导出单例实例
let eventManager: RealtimeEventManager | null = null

export function getEventManager(): RealtimeEventManager {
  if (!eventManager) {
    eventManager = new RealtimeEventManager()
  }
  return eventManager
}
export function disconnectEventManager(): Promise<void> {
  if (eventManager) {
    return eventManager.disconnect().then(() => {
      eventManager = null
    })
  }
  return Promise.resolve()
}
/**
 * 便捷订阅函数
 */
export function onRealtimeEvent<T = any>(
  event: RealtimeEvent,
  handler: EventHandler<T>,
  options?: SubscriptionOptions
): () => void {
  return getEventManager().subscribe(event, handler, options)
}
/**
 * 便捷发布函数
 */
export function emitRealtimeEvent<T = any>(
  channel: RealtimeChannel,
  event: RealtimeEvent,
  data: T
): Promise<void> {
  return getEventManager().publish(channel, event, data)
}