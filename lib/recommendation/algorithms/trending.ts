/**
 * 热门趋势推荐算法
 */
import { BaseRecommendationAlgorithm } from './base' 

import { 
  RecommendationCandidate, 
  UserProfile, 
  ContentFeatures, 
  RecommendationRequest, 
  RecommendationSource 
} from '../types' 

import { TRENDING_CONFIG } from '../config'

/**
 * 热门趋势推荐算法
 */
export class TrendingAlgorithm extends BaseRecommendationAlgorithm {
  name = 'trending'
  
  async generateCandidates(
    userProfile: UserProfile | null,
    request: RecommendationRequest,
    contentPool: ContentFeatures[]
  ): Promise<RecommendationCandidate[]> {
    // 过滤候选内容
    const filteredContent = this.filterCandidates(contentPool, request, userProfile)
    
    // 计算每个内容的热度分数
    const now = new Date()
    const candidates: RecommendationCandidate[] = []
    
    for (const content of filteredContent) {
      // 计算时间窗口内的热度
      const heatScore = this.calculateHeatScore(content, now)
      
      if (heatScore > 0) {
        const score = this.score(content, userProfile, { heat_score: heatScore })
        const candidate: RecommendationCandidate = {
          post_id: content.post_id,
          score,
          reasons: [],
          source: RecommendationSource.TRENDING,
          features: {
            popularity_score: heatScore,
            freshness_score: this.calculateFreshnessScore(content.published_at),
            quality_score: content.quality_score,
          },
        }
        
        this.addTrendingReasons(candidate, content, heatScore)
        candidates.push(candidate)
      }
    }
    
    // 应用多样性控制
    const contentMap = new Map(filteredContent.map(c => [c.post_id, c]))
    const diversifiedCandidates = this.applyDiversity(candidates, contentMap, 0.4)
    
    return this.sortCandidates(diversifiedCandidates, request.count || 10)
  }
  
  score(
    candidate: ContentFeatures,
    userProfile: UserProfile | null,
    context?: any
  ): number {
    let score = 0
    
    // 热度分数（主要因素）
    if (context?.heat_score) {
      score += context.heat_score * 0.5
    }
    
    // 质量分数
    const qualityScore = this.calculateQualityScore(candidate)
    score += qualityScore * 0.2
    
    // 新鲜度分数
    const freshnessScore = this.calculateFreshnessScore(candidate.published_at, 7)
    score += freshnessScore * 0.2
    
    // 个性化调整
    if (userProfile) {
      const interestMatch = this.calculateInterestMatch(candidate, userProfile)
      score += interestMatch * 0.1
    } else {
      // 无用户信息时，增加随机性
      score += Math.random() * 0.1
    }
    
    return Math.min(score, 1)
  }
  
  /**
   * 计算热度分数
   */
  private calculateHeatScore(content: ContentFeatures, currentTime: Date): number {
    const { engagement, published_at } = content
    const weights = TRENDING_CONFIG.heat_weights
    
    // 计算基础热度值
    const baseHeat = 
      engagement.views * weights.views +
      engagement.likes * weights.likes +
      engagement.collects * weights.collects +
      engagement.comments * weights.comments +
      engagement.shares * weights.shares
    
    // 计算时间衰减
    const hoursSincePublish = (currentTime.getTime() - published_at.getTime()) / (1000 * 60 * 60)
    const daysSincePublish = hoursSincePublish / 24
    
    // 使用不同的衰减策略
    let timeDecay = 1
    if (hoursSincePublish < 24) {
      // 24小时内：快速上升期
      timeDecay = 1 + (24 - hoursSincePublish) / 24 * 0.5
    } else if (daysSincePublish < 7) {
      // 1-7天：缓慢衰减
      timeDecay = Math.pow(TRENDING_CONFIG.decay_rate, daysSincePublish - 1)
    } else if (daysSincePublish < 30) {
      // 7-30天：快速衰减
      timeDecay = Math.pow(TRENDING_CONFIG.decay_rate * 0.8, daysSincePublish - 7) * 0.5
    } else {
      // 30天以上：极低权重
      timeDecay = 0.1
    }
    
    // 计算速度因子（单位时间内的互动）
    const velocityFactor = this.calculateVelocityFactor(engagement, hoursSincePublish)
    
    // 归一化热度分数
    const normalizedHeat = Math.min(baseHeat / 10000, 1) // 假设10000为最高热度
    
    return normalizedHeat * timeDecay * velocityFactor
  }
  
  /**
   * 计算速度因子（互动增长速度）
   */
  private calculateVelocityFactor(
    engagement: ContentFeatures['engagement'],
    hoursSincePublish: number
  ): number {
    if (hoursSincePublish <= 0) return 1
    
    // 计算每小时平均互动
    const totalEngagement = 
      engagement.views +
      engagement.likes * 2 +
      engagement.collects * 3 +
      engagement.comments * 4
    
    const engagementPerHour = totalEngagement / hoursSincePublish
    
    // 根据不同时间段设置不同的基准
    let benchmark = 10 // 默认每小时10次互动
    if (hoursSincePublish < 6) {
      benchmark = 50 // 前6小时期望更高
    } else if (hoursSincePublish < 24) {
      benchmark = 20 // 6-24小时
    }
    
    // 计算速度因子
    const velocityFactor = Math.min(engagementPerHour / benchmark, 2)
    return 0.5 + velocityFactor * 0.5 // 0.5-1.5的范围
  }
  
  /**
   * 计算兴趣匹配度
   */
  private calculateInterestMatch(
    content: ContentFeatures,
    userProfile: UserProfile
  ): number {
    let matchScore = 0
    let matchCount = 0
    
    // 标签匹配
    for (const tag of content.tags) {
      if (userProfile.interests[tag] && userProfile.interests[tag] > 0.3) {
        matchScore += userProfile.interests[tag]
        matchCount++
      }
    }
    
    // 分类匹配
    if (userProfile.preferences.preferred_categories) {
      for (const category of content.categories) {
        if (userProfile.preferences.preferred_categories.includes(category)) {
          matchScore += 0.5
          matchCount++
        }
      }
    }
    
    return matchCount > 0 ? matchScore / matchCount : 0
  }
  
  /**
   * 添加热门趋势推荐理由
   */
  private addTrendingReasons(
    candidate: RecommendationCandidate,
    content: ContentFeatures,
    heatScore: number
  ): void {
    const reasons: string[] = []
    const { engagement, published_at } = content
    const hoursSincePublish = (Date.now() - published_at.getTime()) / (1000 * 60 * 60)
    
    // 根据时间段添加理由
    if (hoursSincePublish < 6) {
      reasons.push('正在热议')
    } else if (hoursSincePublish < 24) {
      reasons.push('今日热门')
    } else if (hoursSincePublish < 24 * 7) {
      reasons.push('本周热门')
    } else {
      reasons.push('近期热门')
    }
    
    // 根据互动类型添加理由
    if (engagement.comments > 50) {
      reasons.push('讨论热烈')
    } else if (engagement.likes > 100) {
      reasons.push('广受好评')
    } else if (engagement.collects > 50) {
      reasons.push('收藏量高')
    }
    
    // 根据热度等级添加图标
    if (heatScore > 0.8) {
      reasons[0] = '🔥 ' + reasons[0]
    } else if (heatScore > 0.6) {
      reasons[0] = '🌟 ' + reasons[0]
    }
    
    candidate.reasons = reasons.slice(0, 2) // 最多显示2个理由
  }
  
  /**
   * 获取不同时间窗口的热门内容
   */
  async getTopTrendingByWindow(
    contentPool: ContentFeatures[],
    window: 'hourly' | 'daily' | 'weekly',
    limit: number = 10
  ): Promise<RecommendationCandidate[]> {
    const now = new Date()
    const windowMillis = TRENDING_CONFIG.time_windows[window]
    const cutoffTime = new Date(now.getTime() - windowMillis)
    
    // 过滤时间窗口内的内容
    const recentContent = contentPool.filter(
      content => content.published_at >= cutoffTime
    )
    
    // 生成候选
    const candidates = await this.generateCandidates(null, { count: limit }, recentContent)
    
    // 添加时间窗口标记
    candidates.forEach(candidate => {
      candidate.features = {
        ...candidate.features,
        trending_window: window,
      }
    })
    
    return candidates
  }
  
  /**
   * 获取分类热门
   */
  async getCategoryTrending(
    contentPool: ContentFeatures[],
    category: string,
    limit: number = 5
  ): Promise<RecommendationCandidate[]> {
    // 过滤特定分类
    const categoryContent = contentPool.filter(
      content => content.categories.includes(category)
    )
    
    // 生成候选
    const candidates = await this.generateCandidates(null, { count: limit }, categoryContent)
    
    // 修改推荐理由
    candidates.forEach(candidate => {
      candidate.reasons = [`${category}热门`, ...candidate.reasons.slice(1)]
    })
    
    return candidates
  }
}