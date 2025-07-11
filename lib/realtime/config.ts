/**
 * 实时功能配置
 * 定义实时功能的通道、事件类型和配置选项
 */

/**
 * 实时通道定义
 */
export const REALTIME_CHANNELS = {
  COMMENTS: 'comments',
  PRESENCE: 'presence',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
} as const

export type RealtimeChannel = typeof REALTIME_CHANNELS[keyof typeof REALTIME_CHANNELS] 
/**
 * 实时事件类型
 */
export const REALTIME_EVENTS = {
  // 评论事件
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  // 点赞事件
  LIKE_ADDED: 'like:added',
  LIKE_REMOVED: 'like:removed',
  // 用户状态事件
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',
  // 通知事件
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  // 系统事件
  SYSTEM_BROADCAST: 'system:broadcast',
  SYSTEM_MAINTENANCE: 'system:maintenance',
} as const

export type RealtimeEvent = typeof REALTIME_EVENTS[keyof typeof REALTIME_EVENTS] 
/**
 * 实时连接配置
 */
export interface RealtimeConfig {
  // 重连策略
  reconnect: {
    enabled: boolean
    maxRetries: number
    initialDelay: number
    maxDelay: number
    backoffMultiplier: number
  }
  // 心跳配置
  heartbeat: {
    enabled: boolean
    interval: number
    timeout: number
  }
  // 订阅配置
  subscription: {
    autoSubscribe: boolean
    queueOfflineEvents: boolean
    maxOfflineEvents: number
  }
  // 性能配置
  performance: {
    enableCompression: boolean
    maxConcurrentChannels: number
    eventBufferSize: number
  }
}

/**
 * 默认实时配置
 */
export const DEFAULT_REALTIME_CONFIG: RealtimeConfig = {
  reconnect: {
    enabled: true,
    maxRetries: 10,
    initialDelay: 1000, // 1秒
    maxDelay: 30000, // 30秒
    backoffMultiplier: 1.5,
  },
  heartbeat: {
    enabled: true,
    interval: 30000, // 30秒
    timeout: 60000, // 60秒
  },
  subscription: {
    autoSubscribe: true,
    queueOfflineEvents: true,
    maxOfflineEvents: 100,
  },
  performance: {
    enableCompression: true,
    maxConcurrentChannels: 10,
    eventBufferSize: 1000,
  },
}

/**
 * 实时消息格式
 */
export interface RealtimeMessage<T = any> {
  id: string
  channel: RealtimeChannel
  event: RealtimeEvent
  payload: T
  timestamp: number
  userId?: string
  metadata?: Record<string, any>
}

/**
 * 用户在线状态
 */
export interface UserPresence {
  userId: string
  username: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  lastSeen: number
  currentPage?: string
  isTyping?: boolean
}

/**
 * 实时通知
 */
export interface RealtimeNotification {
  id: string
  type: 'comment' | 'like' | 'mention' | 'system'
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
  userId: string
  metadata?: Record<string, any>
}

/**
 * 获取环境相关的配置
 */
export function getEnvironmentConfig(): Partial<RealtimeConfig> {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return {
    reconnect: {
      ...DEFAULT_REALTIME_CONFIG.reconnect,
      maxRetries: isDevelopment ? 5 : 10,
    },
    performance: {
      ...DEFAULT_REALTIME_CONFIG.performance,
      enableCompression: !isDevelopment,
    },
  }
}

/**
 * 合并配置
 */
export function mergeRealtimeConfig(
  custom?: Partial<RealtimeConfig>
): RealtimeConfig {
  const envConfig = getEnvironmentConfig()
  
  return {
    reconnect: {
      ...DEFAULT_REALTIME_CONFIG.reconnect,
      ...envConfig.reconnect,
      ...custom?.reconnect,
    },
    heartbeat: {
      ...DEFAULT_REALTIME_CONFIG.heartbeat,
      ...custom?.heartbeat,
    },
    subscription: {
      ...DEFAULT_REALTIME_CONFIG.subscription,
      ...custom?.subscription,
    },
    performance: {
      ...DEFAULT_REALTIME_CONFIG.performance,
      ...envConfig.performance,
      ...custom?.performance,
    },
  }
}