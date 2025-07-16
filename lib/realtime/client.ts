/**
 * Supabase Realtime 客户端
 * 管理WebSocket连接和实时订阅
 */
import { createClient } from '@/lib/supabase/client' 

import { RealtimeChannel as SupabaseChannel, RealtimePresence } from '@supabase/supabase-js' 

import {
  REALTIME_CHANNELS,
  REALTIME_EVENTS,
  RealtimeChannel,
  RealtimeEvent,
  RealtimeMessage,
  UserPresence,
  RealtimeConfig,
  mergeRealtimeConfig,
} from './config'

/**
 * 实时客户端类
 * 封装Supabase Realtime功能，提供更好的类型支持和错误处理
 */
export class RealtimeClient {
  private client = createClient()
  private channels: Map<string, SupabaseChannel> = new Map()
  private config: RealtimeConfig
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map()
  private eventHandlers: Map<string, Set<Function>> = new Map()
  private offlineQueue: RealtimeMessage[] = []
  private isOnline = true
  
  constructor(config?: Partial<RealtimeConfig>) {
    this.config = mergeRealtimeConfig(config)
    this.setupNetworkMonitoring()
  }
  /**
   * 订阅频道
   */
  async subscribe(
    channelName: RealtimeChannel,
    options?: {
      onConnect?: () => void
      onDisconnect?: () => void
      onError?: (error: Error) => void
    }
  ): Promise<SupabaseChannel> {
    // 如果已经订阅，返回现有频道
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }
    // 检查并发频道限制
    if (this.channels.size >= this.config.performance.maxConcurrentChannels) {
      throw new Error(`Maximum concurrent channels (${this.config.performance.maxConcurrentChannels}) reached`)
    }
    // 创建新频道
    const channel = this.client.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: this.getPresenceKey() },
      },
    })
    
    // 设置事件监听
    channel
      .on('broadcast', { event: '*' }, (payload) => {
        this.handleBroadcastEvent(channelName, payload)
      })
      .on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync(channelName, channel)
      })
      .on('presence', { event: 'join' }, (payload) => {
        this.handlePresenceJoin(channelName, payload)
      })
      .on('presence', { event: 'leave' }, (payload) => {
        this.handlePresenceLeave(channelName, payload)
      })
    
    // 订阅频道
    const subscription = channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to channel: ${channelName}`)
        this.channels.set(channelName, channel)
        options?.onConnect?.()
        
        // 处理离线队列
        this.processOfflineQueue(channelName)
      }
      else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to channel: ${channelName}`)
        options?.onError?.(new Error(`Failed to subscribe to ${channelName}`))
        
        // 尝试重连
        if (this.config.reconnect.enabled) {
          this.scheduleReconnect(channelName, options)
        }
      }
      else if (status === 'CLOSED') {
        console.log(`Channel closed: ${channelName}`)
        options?.onDisconnect?.()
        this.channels.delete(channelName)
      }
    })
    
    return channel
  }
  /**
   * 取消订阅频道
   */
  async unsubscribe(channelName: RealtimeChannel): Promise<void> {
    const channel = this.channels.get(channelName)
    if (!channel) return
    
    // 清理重连定时器
    const timer = this.reconnectTimers.get(channelName)
    if (timer) {
      clearTimeout(timer)
      this.reconnectTimers.delete(channelName)
    }
    
    // 取消订阅
    await channel.unsubscribe()
    this.channels.delete(channelName)
    console.log(`Unsubscribed from channel: ${channelName}`)
  }
  /**
   * 发送广播消息
   */
  async broadcast<T = any>(
    channelName: RealtimeChannel,
    event: RealtimeEvent,
    payload: T
  ): Promise<void> {
    const message: RealtimeMessage<T> = {
      id: this.generateMessageId(),
      channel: channelName,
      event,
      payload,
      timestamp: Date.now(),
      userId: await this.getCurrentUserId(),
    }
    
    // 如果离线，加入队列
    if (!this.isOnline && this.config.subscription.queueOfflineEvents) {
      this.addToOfflineQueue(message)
      return
    }
    
    const channel = this.channels.get(channelName)
    if (!channel) {
      throw new Error(`Not subscribed to channel: ${channelName}`)
    }
    
    await channel.send({
      type: 'broadcast',
      event,
      payload: message,
    })
  }
  /**
   * 监听事件
   */
  on(event: RealtimeEvent, handler: (message: RealtimeMessage) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    
    this.eventHandlers.get(event)!.add(handler)
    
    // 返回取消监听函数
    return () => {
      this.eventHandlers.get(event)?.delete(handler)
    }
  }
  
  /**
   * 获取频道的在线用户
   */
  async getPresence(channelName: RealtimeChannel): Promise<UserPresence[]> {
    const channel = this.channels.get(channelName)
    if (!channel) {
      return []
    }
    
    const presenceState = channel.presenceState()
    return Object.values(presenceState).flat() as UserPresence[]
  }
  
  /**
   * 更新用户在线状态
   */
  async updatePresence(
    channelName: RealtimeChannel,
    presence: Partial<UserPresence>
  ): Promise<void> {
    const channel = this.channels.get(channelName)
    if (!channel) {
      throw new Error(`Not subscribed to channel: ${channelName}`)
    }
    
    await channel.track({
      ...presence,
      lastSeen: Date.now(),
    })
  }
  /**
   * 断开所有连接
   */
  async disconnect(): Promise<void> {
    // 清理所有重连定时器
    this.reconnectTimers.forEach(timer => clearTimeout(timer))
    this.reconnectTimers.clear()
    
    // 取消所有订阅
    await Promise.all(
      Array.from(this.channels.keys()).map(channel => 
        this.unsubscribe(channel as RealtimeChannel)
      )
    )
    
    // 清理事件处理器
    this.eventHandlers.clear()
    console.log('Realtime client disconnected')
  }
  // === 私有方法 ===
  
  /**
   * 设置网络状态监控
   */
  private setupNetworkMonitoring() {
    if (typeof window === 'undefined') return
    
    window.addEventListener('online', () => {
      console.log('Network online')
      this.isOnline = true
      this.processAllOfflineQueues()
    })
    
    window.addEventListener('offline', () => {
      console.log('Network offline')
      this.isOnline = false
    })
  }
  /**
   * 处理广播事件
   */
  private handleBroadcastEvent(channelName: string, payload: any) {
    const message = payload.payload as RealtimeMessage
    const handlers = this.eventHandlers.get(message.event)
    
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message)
        } catch (error) {
          console.error('Error in event handler:', error)
        }
      })
    }
  }
  
  /**
   * 处理在线状态同步
   */
  private handlePresenceSync(channelName: string, channel: SupabaseChannel) {
    const event = `${REALTIME_EVENTS.USER_ONLINE}:${channelName}`
    const handlers = this.eventHandlers.get(event)
    
    if (handlers) {
      const presence = this.getPresence(channelName as RealtimeChannel)
      handlers.forEach(handler => handler(presence))
    }
  }
  
  /**
   * 处理用户加入
   */
  private handlePresenceJoin(channelName: string, payload: any) {
    console.log(`User joined ${channelName}:`, payload)
    
    // 触发用户上线事件
    this.triggerEvent(REALTIME_EVENTS.USER_ONLINE, {
      channel: channelName,
      user: payload.currentPresences[0],
    })
  }
  /**
   * 处理用户离开
   */
  private handlePresenceLeave(channelName: string, payload: any) {
    console.log(`User left ${channelName}:`, payload)
    
    // 触发用户下线事件
    this.triggerEvent(REALTIME_EVENTS.USER_OFFLINE, {
      channel: channelName,
      user: payload.leftPresences[0],
    })
  }
  /**
   * 触发事件
   */
  private triggerEvent(event: RealtimeEvent, data: any) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }
  
  /**
   * 安排重连
   */
  private scheduleReconnect(
    channelName: RealtimeChannel,
    options?: any,
    retryCount = 0
  ) {
    if (retryCount >= this.config.reconnect.maxRetries) {
      console.error(`Max reconnection attempts reached for channel: ${channelName}`)
      return
    }
    
    const delay = Math.min(
      this.config.reconnect.initialDelay * Math.pow(this.config.reconnect.backoffMultiplier, retryCount),
      this.config.reconnect.maxDelay
    )
    
    console.log(`Reconnecting to ${channelName} in ${delay}ms (attempt ${retryCount + 1})`)
    
    const timer = setTimeout(() => {
      this.subscribe(channelName, {
        ...options,
        onError: (error) => {
          options?.onError?.(error)
          this.scheduleReconnect(channelName, options, retryCount + 1)
        },
      })
    }, delay)
    
    this.reconnectTimers.set(channelName, timer)
  }
  /**
   * 添加到离线队列
   */
  private addToOfflineQueue(message: RealtimeMessage) {
    if (this.offlineQueue.length >= this.config.subscription.maxOfflineEvents) {
      // 移除最旧的消息
      this.offlineQueue.shift()
    }
    
    this.offlineQueue.push(message)
    console.log(`Message queued for offline delivery: ${message.event}`)
  }
  /**
   * 处理离线队列
   */
  private async processOfflineQueue(channelName: RealtimeChannel) {
    const messages = this.offlineQueue.filter(m => m.channel === channelName)
    
    for (const message of messages) {
      try {
        await this.broadcast(message.channel, message.event, message.payload)
        
        // 从队列中移除
        const index = this.offlineQueue.indexOf(message)
        if (index > -1) {
          this.offlineQueue.splice(index, 1)
        }
      } catch (error) {
        console.error('Failed to send queued message:', error)
      }
    }
  }
  /**
   * 处理所有离线队列
   */
  private async processAllOfflineQueues() {
    const channels = new Set(this.offlineQueue.map(m => m.channel))
    for (const channel of channels) {
      await this.processOfflineQueue(channel)
    }
  }
  
  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  /**
   * 获取当前用户ID
   */
  private async getCurrentUserId(): Promise<string | undefined> {
    const { data: { user } } = await this.client.auth.getUser()
    return user?.id
  }
  /**
   * 获取在线状态键
   */
  private getPresenceKey(): string {
    // 使用用户ID或会话ID作为键
    return `user-${Date.now()}`
  }
}
// 导出单例实例
let realtimeClient: RealtimeClient | null = null

export function getRealtimeClient(config?: Partial<RealtimeConfig>): RealtimeClient {
  if (!realtimeClient) {
    realtimeClient = new RealtimeClient(config)
  }
  return realtimeClient
}
export function disconnectRealtimeClient(): Promise<void> {
  if (realtimeClient) {
    return realtimeClient.disconnect().then(() => {
      realtimeClient = null
    })
  }
  return Promise.resolve()
}