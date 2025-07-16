/**
 * 缓存管理器
 * 实现LRU缓存策略，防止内存无限增长
 */

interface CacheEntry<T> {
  value: T
  timestamp: number
  size: number
}

export class CacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private accessOrder: string[] = []
  private currentSize = 0
  
  constructor(
    private maxSize: number = 50 * 1024 * 1024, // 50MB
    private ttl: number = 3600000, // 1小时
    private maxEntries: number = 1000
  ) {}

  /**
   * 获取缓存项
   */
  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.delete(key)
      return null
    }
    
    // 更新访问顺序（LRU）
    this.updateAccessOrder(key)
    
    return entry.value
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T): void {
    // 计算对象大小（简化版）
    const size = this.estimateSize(value)
    
    // 如果单个项目太大，不缓存
    if (size > this.maxSize / 2) {
      console.warn(`Cache item too large: ${key} (${this.formatSize(size)})`)
      return
    }
    
    // 检查是否需要清理空间
    while (this.currentSize + size > this.maxSize || this.cache.size >= this.maxEntries) {
      this.evictOldest()
    }
    
    // 如果已存在，先删除旧的
    if (this.cache.has(key)) {
      this.delete(key)
    }
    
    // 添加新缓存
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      size
    })
    
    this.currentSize += size
    this.accessOrder.push(key)
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    this.cache.delete(key)
    this.currentSize -= entry.size
    this.accessOrder = this.accessOrder.filter(k => k !== key)
    
    return true
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    this.currentSize = 0
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      entries: this.cache.size,
      size: this.currentSize,
      sizeFormatted: this.formatSize(this.currentSize),
      maxSize: this.maxSize,
      maxSizeFormatted: this.formatSize(this.maxSize),
      hitRate: this.calculateHitRate()
    }
  }

  /**
   * 更新访问顺序（LRU）
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    this.accessOrder.push(key)
  }

  /**
   * 驱逐最老的缓存项
   */
  private evictOldest(): void {
    if (this.accessOrder.length === 0) return
    
    const oldestKey = this.accessOrder[0]
    this.delete(oldestKey)
  }

  /**
   * 估算对象大小
   */
  private estimateSize(obj: any): number {
    const json = JSON.stringify(obj)
    return json.length * 2 // UTF-16编码，每个字符2字节
  }

  /**
   * 格式化大小显示
   */
  private formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  /**
   * 计算缓存命中率
   */
  private calculateHitRate(): string {
    // 简化版本，实际应该追踪命中和未命中次数
    return 'N/A'
  }
}

// 导出单例实例
export const globalCache = new CacheManager()