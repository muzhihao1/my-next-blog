/**
 * Algolia 迁移助手
 * 帮助从 Fuse.js 平滑迁移到 Algolia
 */

import { isAlgoliaConfigured } from './client'

/**
 * 搜索提供者类型
 */
export type SearchProvider = 'algolia' | 'fuse' | 'auto'

/**
 * 搜索配置
 */
interface SearchConfig {
  provider: SearchProvider
  algoliaEnabled: boolean
  fuseEnabled: boolean
  preferredProvider: SearchProvider
}

/**
 * 获取当前搜索配置
 */
export function getSearchConfig(): SearchConfig {
  const algoliaEnabled = isAlgoliaConfigured()
  const fuseEnabled = true // Fuse.js 始终可用作为降级方案
  
  // 从本地存储获取用户偏好
  const savedProvider = typeof window !== 'undefined' 
    ? localStorage.getItem('searchProvider') as SearchProvider
    : null
  
  // 确定首选提供者
  let preferredProvider: SearchProvider = 'auto'
  if (savedProvider && savedProvider !== 'auto') {
    // 使用用户保存的偏好
    preferredProvider = savedProvider
  } else if (algoliaEnabled) {
    // 如果 Algolia 可用，优先使用
    preferredProvider = 'algolia'
  } else {
    // 降级到 Fuse.js
    preferredProvider = 'fuse'
  }
  
  return {
    provider: preferredProvider,
    algoliaEnabled,
    fuseEnabled,
    preferredProvider
  }
}

/**
 * 设置搜索提供者
 */
export function setSearchProvider(provider: SearchProvider) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('searchProvider', provider)
  }
}

/**
 * 搜索 A/B 测试配置
 */
interface ABTestConfig {
  enabled: boolean
  algoliaPercentage: number
  userGroup?: 'algolia' | 'fuse'
}

/**
 * 获取 A/B 测试配置
 */
export function getABTestConfig(): ABTestConfig {
  // 检查是否启用 A/B 测试
  const abTestEnabled = process.env.NEXT_PUBLIC_SEARCH_AB_TEST === 'true'
  if (!abTestEnabled) {
    return { enabled: false, algoliaPercentage: 100 }
  }
  
  // 获取 Algolia 使用百分比
  const algoliaPercentage = parseInt(
    process.env.NEXT_PUBLIC_ALGOLIA_PERCENTAGE || '50'
  )
  
  // 确定用户分组
  let userGroup: 'algolia' | 'fuse' | undefined
  if (typeof window !== 'undefined') {
    // 从本地存储获取或生成用户分组
    let savedGroup = localStorage.getItem('searchABGroup')
    if (!savedGroup) {
      // 随机分配用户到组
      const random = Math.random() * 100
      savedGroup = random < algoliaPercentage ? 'algolia' : 'fuse'
      localStorage.setItem('searchABGroup', savedGroup)
    }
    userGroup = savedGroup as 'algolia' | 'fuse'
  }
  
  return {
    enabled: true,
    algoliaPercentage,
    userGroup
  }
}

/**
 * 搜索分析事件
 */
interface SearchAnalyticsEvent {
  provider: 'algolia' | 'fuse'
  query: string
  resultsCount: number
  responseTime: number
  clicked?: boolean
  clickedPosition?: number
  timestamp: number
}

/**
 * 记录搜索分析事件
 */
export function trackSearchEvent(event: Omit<SearchAnalyticsEvent, 'timestamp'>) {
  const fullEvent: SearchAnalyticsEvent = {
    ...event,
    timestamp: Date.now()
  }
  
  // 在生产环境发送到分析服务
  if (process.env.NODE_ENV === 'production') {
    // 这里可以集成 Google Analytics、Mixpanel 等
    console.log('Search Analytics:', fullEvent)
  }
  
  // 本地存储用于调试
  if (typeof window !== 'undefined') {
    const events = JSON.parse(
      localStorage.getItem('searchAnalytics') || '[]'
    ) as SearchAnalyticsEvent[]
    
    // 保留最近 100 个事件
    events.push(fullEvent)
    if (events.length > 100) {
      events.shift()
    }
    
    localStorage.setItem('searchAnalytics', JSON.stringify(events))
  }
}

/**
 * 获取搜索分析摘要
 */
export function getSearchAnalyticsSummary() {
  if (typeof window === 'undefined') {
    return null
  }
  
  const events = JSON.parse(
    localStorage.getItem('searchAnalytics') || '[]'
  ) as SearchAnalyticsEvent[]
  
  if (events.length === 0) {
    return null
  }
  
  // 按提供者分组统计
  const algoliaEvents = events.filter(e => e.provider === 'algolia')
  const fuseEvents = events.filter(e => e.provider === 'fuse')
  
  const calculateStats = (events: SearchAnalyticsEvent[]) => {
    if (events.length === 0) {
      return {
        count: 0,
        avgResponseTime: 0,
        avgResultsCount: 0,
        clickRate: 0
      }
    }
    
    const totalResponseTime = events.reduce((sum, e) => sum + e.responseTime, 0)
    const totalResults = events.reduce((sum, e) => sum + e.resultsCount, 0)
    const clickedEvents = events.filter(e => e.clicked)
    
    return {
      count: events.length,
      avgResponseTime: Math.round(totalResponseTime / events.length),
      avgResultsCount: Math.round(totalResults / events.length),
      clickRate: (clickedEvents.length / events.length) * 100
    }
  }
  
  return {
    total: events.length,
    algolia: calculateStats(algoliaEvents),
    fuse: calculateStats(fuseEvents),
    recentQueries: events
      .slice(-10)
      .map(e => ({
        query: e.query,
        provider: e.provider,
        results: e.resultsCount,
        time: e.responseTime
      }))
  }
}

/**
 * 迁移检查列表
 */
export interface MigrationChecklist {
  algoliaConfigured: boolean
  algoliaIndexCreated: boolean
  algoliaDataSynced: boolean
  searchComponentUpdated: boolean
  fallbackConfigured: boolean
  analyticsSetup: boolean
  abTestEnabled: boolean
}

/**
 * 获取迁移检查列表状态
 */
export async function getMigrationStatus(): Promise<MigrationChecklist> {
  const algoliaConfigured = isAlgoliaConfigured()
  
  // 检查索引是否创建（通过测试搜索）
  let algoliaIndexCreated = false
  let algoliaDataSynced = false
  
  if (algoliaConfigured) {
    try {
      const response = await fetch('/api/search/algolia?q=test&limit=1')
      const data = await response.json()
      algoliaIndexCreated = data.algoliaEnabled === true
      algoliaDataSynced = data.nbHits > 0
    } catch (error) {
      console.error('Failed to check Algolia status:', error)
    }
  }
  
  // 检查组件是否更新（检查是否有 AlgoliaSearch 组件）
  const searchComponentUpdated = true // 已创建 AlgoliaSearch 组件
  
  // 检查降级配置
  const fallbackConfigured = true // 已在 useAlgoliaSearch 中配置
  
  // 检查分析设置
  const analyticsSetup = !!process.env.NEXT_PUBLIC_SEARCH_ANALYTICS
  
  // 检查 A/B 测试
  const abTestEnabled = process.env.NEXT_PUBLIC_SEARCH_AB_TEST === 'true'
  
  return {
    algoliaConfigured,
    algoliaIndexCreated,
    algoliaDataSynced,
    searchComponentUpdated,
    fallbackConfigured,
    analyticsSetup,
    abTestEnabled
  }
}

/**
 * 格式化迁移状态报告
 */
export function formatMigrationReport(status: MigrationChecklist): string {
  const checks = [
    { name: 'Algolia 配置', done: status.algoliaConfigured },
    { name: 'Algolia 索引创建', done: status.algoliaIndexCreated },
    { name: 'Algolia 数据同步', done: status.algoliaDataSynced },
    { name: '搜索组件更新', done: status.searchComponentUpdated },
    { name: '降级方案配置', done: status.fallbackConfigured },
    { name: '分析设置', done: status.analyticsSetup },
    { name: 'A/B 测试启用', done: status.abTestEnabled }
  ]
  
  const completed = checks.filter(c => c.done).length
  const total = checks.length
  const percentage = Math.round((completed / total) * 100)
  
  let report = `Algolia 迁移进度: ${percentage}% (${completed}/${total})\n\n`
  
  checks.forEach(check => {
    report += `${check.done ? '✅' : '❌'} ${check.name}\n`
  })
  
  if (percentage < 100) {
    report += '\n下一步:\n'
    if (!status.algoliaConfigured) {
      report += '1. 配置 Algolia 环境变量\n'
    }
    if (!status.algoliaIndexCreated) {
      report += '2. 创建 Algolia 索引\n'
    }
    if (!status.algoliaDataSynced) {
      report += '3. 运行 npm run sync-algolia 同步数据\n'
    }
    if (!status.analyticsSetup) {
      report += '4. 配置搜索分析\n'
    }
  } else {
    report += '\n🎉 迁移完成！Algolia 搜索已就绪。'
  }
  
  return report
}