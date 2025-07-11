/**
 * 用户画像构建器
 */
import {
  UserProfile,
  UserAction,
  UserActionType,
  ContentFeatures,
} from './types'

import {
  ACTION_WEIGHTS,
  USER_SEGMENT_CONFIG,
  PERSONALIZATION_CONFIG,
} from './config'

/**
 * 用户画像构建器
 */
export class UserProfileBuilder {
  /**
   * 构建用户画像
   */
  async buildProfile(
    userId: string,
    userActions: UserAction[],
    contentFeatures: Map<string, ContentFeatures>
  ): Promise<UserProfile> {
    // 计算兴趣标签权重
    const interests = this.calculateInterests(userActions, contentFeatures)
    
    // 计算阅读偏好
    const preferences = this.calculatePreferences(userActions, contentFeatures)
    
    // 计算行为统计
    const stats = this.calculateStats(userActions)
    
    // 用户分群
    const segments = this.calculateSegments(userActions, interests, stats)
    
    return {
      user_id: userId,
      interests,
      preferences,
      stats,
      segments,
      updated_at: new Date(),
    }
  }
  
  /**
   * 更新用户画像
   */
  async updateProfile(
    existingProfile: UserProfile,
    newActions: UserAction[],
    contentFeatures: Map<string, ContentFeatures>
  ): Promise<UserProfile> {
    // 计算新的兴趣权重
    const newInterests = this.calculateInterests(newActions, contentFeatures)
    
    // 合并兴趣（应用衰减）
    const mergedInterests = this.mergeInterests(existingProfile.interests, newInterests)
    
    // 更新偏好
    const preferences = this.updatePreferences(
      existingProfile.preferences,
      newActions,
      contentFeatures
    )
    
    // 更新统计
    const stats = this.updateStats(existingProfile.stats, newActions)
    
    // 重新计算分群
    const segments = this.calculateSegments(newActions, mergedInterests, stats)
    
    return {
      ...existingProfile,
      interests: mergedInterests,
      preferences,
      stats,
      segments,
      updated_at: new Date(),
    }
  }
  
  /**
   * 计算用户兴趣
   */
  private calculateInterests(
    userActions: UserAction[],
    contentFeatures: Map<string, ContentFeatures>
  ): Record<string, number> {
    const interestScores: Record<string, number> = {}
    // 按时间倒序，最新的行为权重更高
    const sortedActions = [...userActions].sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    )
    
    for (let i = 0; i < sortedActions.length; i++) {
      const action = sortedActions[i]
      const content = contentFeatures.get(action.target_id)
      if (!content) continue
      
      // 计算时间衰减
      const daysSinceAction = (Date.now() - action.created_at.getTime()) / (1000 * 60 * 60 * 24)
      const timeDecay = this.calculateTimeDecay(daysSinceAction)
      
      // 计算行为权重
      const actionWeight = ACTION_WEIGHTS[action.action_type] || 1
      const weight = actionWeight * timeDecay
      
      // 更新标签权重
      for (const tag of content.tags) {
        interestScores[tag] = (interestScores[tag] || 0) + weight
      }
      // 更新分类权重（权重较低）
      for (const category of content.categories) {
        interestScores[category] = (interestScores[category] || 0) + weight * 0.5
      }
      
      // 更新关键词权重（权重更低）
      for (const keyword of content.keywords) {
        interestScores[keyword] = (interestScores[keyword] || 0) + weight * 0.3
      }
    }
    // 归一化权重
    return this.normalizeInterests(interestScores)
  }
  
  /**
   * 计算阅读偏好
   */
  private calculatePreferences(
    userActions: UserAction[],
    contentFeatures: Map<string, ContentFeatures>
  ): UserProfile['preferences'] {
    const preferences: UserProfile['preferences'] = {}
    
    // 文章长度偏好
    const lengthCounts = { short: 0, medium: 0, long: 0 }
    const readTimes: number[] = []
    const categories: Record<string, number> = {}
    const readingHours: Record<number, number> = {}
    for (const action of userActions) {
      const content = contentFeatures.get(action.target_id)
      if (!content) continue
      
      // 统计长度偏好
      if (action.action_type === UserActionType.VIEW || action.action_type === UserActionType.READ_TIME) {
        const lengthCategory = this.getContentLengthCategory(content.word_count)
        lengthCounts[lengthCategory]++
      }
      // 统计阅读时长
      if (action.action_type === UserActionType.READ_TIME && action.value) {
        readTimes.push(action.value)
      }
      
      // 统计分类偏好
      for (const category of content.categories) {
        categories[category] = (categories[category] || 0) + 1
      }
      
      // 统计阅读时间偏好
      const hour = action.created_at.getHours()
      readingHours[hour] = (readingHours[hour] || 0) + 1
    }
    // 确定长度偏好
    const maxLengthCount = Math.max(...Object.values(lengthCounts))
    if (maxLengthCount > 0) {
      for (const [length, count] of Object.entries(lengthCounts)) {
        if (count === maxLengthCount) {
          preferences.preferred_length = length as 'short' | 'medium' | 'long'
          break
        }
      }
    }
    
    // 计算阅读速度
    if (readTimes.length > 0) {
      const avgReadTime = readTimes.reduce((a, b) => a + b, 0) / readTimes.length
      // 假设平均阅读时间对应1000字
      preferences.reading_speed = Math.round(1000 * 60 / avgReadTime) // 字/分钟
    }
    // 确定偏好分类（前3个）
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat)
    
    if (sortedCategories.length > 0) {
      preferences.preferred_categories = sortedCategories
    }
    // 确定偏好阅读时间段
    const peakHours = Object.entries(readingHours)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => {
        const h = parseInt(hour)
        if (h >= 6 && h < 12) return '早晨'
        if (h >= 12 && h < 14) return '中午'
        if (h >= 14 && h < 18) return '下午'
        if (h >= 18 && h < 22) return '晚上'
        return '深夜'
      })
    
    preferences.preferred_time = [...new Set(peakHours)]
    return preferences
  }
  
  /**
   * 计算行为统计
   */
  private calculateStats(userActions: UserAction[]): UserProfile['stats'] {
    const stats: UserProfile['stats'] = {
      total_views: 0,
      total_likes: 0,
      total_collects: 0,
      total_comments: 0,
      avg_read_time: 0,
      active_days: 0,
      last_active: new Date(),
    }
    const readTimes: number[] = []
    const activeDays = new Set<string>()
    let lastActiveTime = 0
    
    for (const action of userActions) {
      // 更新计数
      switch (action.action_type) {
        case UserActionType.VIEW:
          stats.total_views++
          break
        case UserActionType.LIKE:
          stats.total_likes++
          break
        case UserActionType.COLLECT:
          stats.total_collects++
          break
        case UserActionType.COMMENT:
          stats.total_comments++
          break
        case UserActionType.READ_TIME:
          if (action.value) {
            readTimes.push(action.value)
          }
          break
      }
      // 记录活跃天数
      const dateStr = action.created_at.toISOString().split('T')[0]
      activeDays.add(dateStr)
      
      // 更新最后活跃时间
      const actionTime = action.created_at.getTime()
      if (actionTime > lastActiveTime) {
        lastActiveTime = actionTime
        stats.last_active = action.created_at
      }
    }
    // 计算平均阅读时长
    if (readTimes.length > 0) {
      stats.avg_read_time = Math.round(
        readTimes.reduce((a, b) => a + b, 0) / readTimes.length
      )
    }
    
    stats.active_days = activeDays.size
    
    return stats
  }
  
  /**
   * 计算用户分群
   */
  private calculateSegments(
    userActions: UserAction[],
    interests: Record<string, number>,
    stats: UserProfile['stats']
  ): string[] {
    const segments: string[] = []
    
    // 活跃度分群
    const recentActions = userActions.filter(
      a => (Date.now() - a.created_at.getTime()) / (1000 * 60 * 60 * 24) <= 7
    )
    
    if (recentActions.length >= USER_SEGMENT_CONFIG.activity_segments.heavy_user.min_actions) {
      segments.push('heavy_user')
    }
    else if (recentActions.length >= USER_SEGMENT_CONFIG.activity_segments.medium_user.min_actions) {
      segments.push('medium_user')
    }
    else if (recentActions.length >= USER_SEGMENT_CONFIG.activity_segments.light_user.min_actions) {
      segments.push('light_user')
    }
    // 新用户判断
    const daysSinceFirstAction = userActions.length > 0
      ? (Date.now() - Math.min(...userActions.map(a => a.created_at.getTime()))) / (1000 * 60 * 60 * 24)
      : 0
      
    if (daysSinceFirstAction <= USER_SEGMENT_CONFIG.activity_segments.new_user.max_days) {
      segments.push('new_user')
    }
    // 兴趣分群
    const topInterests = Object.entries(interests)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)
      
    for (const [segment, keywords] of Object.entries(USER_SEGMENT_CONFIG.interest_segments)) {
      if (keywords.some(keyword => topInterests.includes(keyword))) {
        segments.push(segment)
      }
    }
    
    // 深度用户（高完读率）
    if (stats.avg_read_time > 180) { // 平均阅读时间超过3分钟
      segments.push('deep_reader')
    }
    
    // 互动用户（高互动率）
    const interactionRate = stats.total_views > 0
      ? (stats.total_likes + stats.total_collects + stats.total_comments) / stats.total_views
      : 0
      
    if (interactionRate > 0.2) {
      segments.push('active_engager')
    }
    return [...new Set(segments)]
  }
  
  /**
   * 时间衰减计算
   */
  private calculateTimeDecay(days: number): number {
    if (!PERSONALIZATION_CONFIG.interest_decay.enabled) {
      return 1
    }
    const halfLife = PERSONALIZATION_CONFIG.interest_decay.half_life_days
    const decay = Math.pow(0.5, days / halfLife)
    return Math.max(decay, PERSONALIZATION_CONFIG.interest_decay.min_weight)
  }
  
  /**
   * 归一化兴趣权重
   */
  private normalizeInterests(interests: Record<string, number>): Record<string, number> {
    const maxWeight = Math.max(...Object.values(interests))
    if (maxWeight === 0) return interests
    
    const normalized: Record<string, number> = {}
    for (const [tag, weight] of Object.entries(interests)) {
      normalized[tag] = weight / maxWeight
    }
    
    return normalized
  }
  
  /**
   * 合并新旧兴趣
   */
  private mergeInterests(
    oldInterests: Record<string, number>,
    newInterests: Record<string, number>
  ): Record<string, number> {
    const merged: Record<string, number> = {}
    // 应用衰减到旧兴趣
    for (const [tag, weight] of Object.entries(oldInterests)) {
      merged[tag] = weight * 0.8 // 旧兴趣权重衰减20%
    }
    
    // 添加新兴趣
    for (const [tag, weight] of Object.entries(newInterests)) {
      merged[tag] = (merged[tag] || 0) + weight * 0.5 // 新兴趣权重50%
    }
    return this.normalizeInterests(merged)
  }
  
  /**
   * 更新偏好设置
   */
  private updatePreferences(
    oldPreferences: UserProfile['preferences'],
    newActions: UserAction[],
    contentFeatures: Map<string, ContentFeatures>
  ): UserProfile['preferences'] {
    // 计算新的偏好
    const newPreferences = this.calculatePreferences(newActions, contentFeatures)
    
    // 合并偏好（新的覆盖旧的）
    return {
      ...oldPreferences,
      ...newPreferences,
    }
  }
  
  /**
   * 更新统计信息
   */
  private updateStats(
    oldStats: UserProfile['stats'],
    newActions: UserAction[]
  ): UserProfile['stats'] {
    const newStats = this.calculateStats(newActions)
    
    return {
      total_views: oldStats.total_views + newStats.total_views,
      total_likes: oldStats.total_likes + newStats.total_likes,
      total_collects: oldStats.total_collects + newStats.total_collects,
      total_comments: oldStats.total_comments + newStats.total_comments,
      avg_read_time: Math.round(
        (oldStats.avg_read_time + newStats.avg_read_time) / 2
      ),
      active_days: oldStats.active_days + newStats.active_days,
      last_active: newStats.last_active,
    }
  }
  
  /**
   * 获取内容长度分类
   */
  private getContentLengthCategory(wordCount: number): 'short' | 'medium' | 'long' {
    if (wordCount < 500) return 'short'
    if (wordCount < 1500) return 'medium'
    return 'long'
  }
}