/**
 * 协同过滤推荐算法
 */
import { BaseRecommendationAlgorithm } from './base' 

import {
  RecommendationCandidate,
  UserProfile,
  ContentFeatures,
  RecommendationRequest,
  RecommendationSource,
  UserAction,
  UserActionType,
} from '../types' 

import { ACTION_WEIGHTS } from '../config'

/**
 * 用户-物品交互矩阵
 */
interface UserItemMatrix {
  [userId: string]: {
    [itemId: string]: number // 交互分数
  }
}

/**
 * 用户相似度
 */
interface UserSimilarity {
  user1: string
  user2: string
  similarity: number
}

/**
 * 协同过滤推荐算法
 */
export class CollaborativeFilteringAlgorithm extends BaseRecommendationAlgorithm {
  name = 'collaborative-filtering'
  
  // 缓存
  private userItemMatrix: UserItemMatrix | null = null
  private userSimilarities: Map<string, UserSimilarity[]> = new Map()
  private itemSimilarities: Map<string, Map<string, number>> = new Map()
  
  async generateCandidates(
    userProfile: UserProfile | null,
    request: RecommendationRequest,
    contentPool: ContentFeatures[]
  ): Promise<RecommendationCandidate[]> {
    // 过滤候选内容
    const filteredContent = this.filterCandidates(contentPool, request, userProfile)
    
    // 如果没有用户信息，返回空结果（协同过滤需要用户历史）
    if (!userProfile || !request.user_id) {
      return []
    }
    
    // 获取用户行为数据（这里简化处理，实际需要从数据库获取）
    const userActions = await this.getUserActions(request.user_id)
    if (userActions.length < 5) {
      // 用户行为太少，无法进行协同过滤
      return []
    }
    
    // 构建用户-物品矩阵
    await this.buildUserItemMatrix()
    
    // 基于用户的协同过滤
    const userBasedCandidates = await this.userBasedRecommendation(
      request.user_id,
      filteredContent,
      request.count || 10
    )
    
    // 基于物品的协同过滤
    const itemBasedCandidates = await this.itemBasedRecommendation(
      request.user_id,
      userActions,
      filteredContent,
      request.count || 10
    )
    
    // 合并结果
    const candidateMap = new Map<string, RecommendationCandidate>()
    
    // 合并用户协同过滤结果
    for (const candidate of userBasedCandidates) {
      candidateMap.set(candidate.post_id, candidate)
    }
    
    // 合并物品协同过滤结果
    for (const candidate of itemBasedCandidates) {
      const existing = candidateMap.get(candidate.post_id)
      if (existing) {
        // 取较高分数
        existing.score = Math.max(existing.score, candidate.score)
        existing.features = {
          ...existing.features,
          ...candidate.features,
        }
      } else {
        candidateMap.set(candidate.post_id, candidate)
      }
    }
    
    return this.sortCandidates(Array.from(candidateMap.values()), request.count || 10)
  }
  
  score(
    candidate: ContentFeatures,
    userProfile: UserProfile | null,
    context?: any
  ): number {
    let score = 0
    
    // 基础质量分
    const qualityScore = this.calculateQualityScore(candidate)
    score += qualityScore * 0.2
    
    // 协同过滤分数（从context中获取）
    if (context?.collaborative_score) {
      score += context.collaborative_score * 0.6
    }
    
    // 热度分
    const popularityScore = this.calculatePopularityScore(
      candidate.engagement,
      {
        views: 1000,
        likes: 100,
        collects: 50,
        comments: 20,
      }
    )
    score += popularityScore * 0.2
    
    return Math.min(score, 1)
  }
  
  /**
   * 基于用户的协同过滤
   */
  private async userBasedRecommendation(
    userId: string,
    contentPool: ContentFeatures[],
    limit: number
  ): Promise<RecommendationCandidate[]> {
    if (!this.userItemMatrix) return []
    
    // 获取相似用户
    const similarUsers = await this.findSimilarUsers(userId, 20)
    if (similarUsers.length === 0) return []
    
    // 计算推荐分数
    const itemScores: Map<string, number> = new Map()
    const itemReasons: Map<string, Set<string>> = new Map()
    
    for (const similar of similarUsers) {
      const otherUserItems = this.userItemMatrix[similar.user2]
      if (!otherUserItems) continue
      
      for (const [itemId, score] of Object.entries(otherUserItems)) {
        // 如果当前用户已经交互过，跳过
        if (this.userItemMatrix[userId]?.[itemId]) continue
        
        // 累加推荐分数
        const currentScore = itemScores.get(itemId) || 0
        itemScores.set(itemId, currentScore + score * similar.similarity)
        
        // 记录推荐原因
        if (!itemReasons.has(itemId)) {
          itemReasons.set(itemId, new Set())
        }
        itemReasons.get(itemId)!.add(similar.user2)
      }
    }
    
    // 转换为候选列表
    const candidates: RecommendationCandidate[] = []
    const contentMap = new Map(contentPool.map(c => [c.post_id, c]))
    
    for (const [itemId, score] of itemScores.entries()) {
      const content = contentMap.get(itemId)
      if (!content) continue
      
      const candidate: RecommendationCandidate = {
        post_id: itemId,
        score: this.score(content, null, { collaborative_score: score }),
        reasons: [`${itemReasons.get(itemId)!.size}位相似用户喜欢`],
        source: RecommendationSource.COLLABORATIVE,
        features: {
          similarity_score: score,
          popularity_score: this.calculatePopularityScore(
            content.engagement,
            { views: 1000, likes: 100, collects: 50, comments: 20 }
          ),
        },
      }
      candidates.push(candidate)
    }
    
    return this.sortCandidates(candidates, limit)
  }
  
  /**
   * 基于物品的协同过滤
   */
  private async itemBasedRecommendation(
    userId: string,
    userActions: UserAction[],
    contentPool: ContentFeatures[],
    limit: number
  ): Promise<RecommendationCandidate[]> {
    if (!this.userItemMatrix) return []
    
    // 获取用户交互过的物品
    const userItems = new Set(userActions.map(a => a.target_id))
    
    // 计算推荐分数
    const itemScores: Map<string, number> = new Map()
    const itemReasons: Map<string, string[]> = new Map()
    
    for (const baseItemId of userItems) {
      // 获取相似物品
      const similarItems = await this.findSimilarItems(baseItemId, 10)
      
      for (const [similarItemId, similarity] of similarItems.entries()) {
        // 如果用户已经交互过，跳过
        if (userItems.has(similarItemId)) continue
        
        // 累加推荐分数
        const currentScore = itemScores.get(similarItemId) || 0
        const userScore = this.userItemMatrix[userId]?.[baseItemId] || 1
        itemScores.set(similarItemId, currentScore + userScore * similarity)
        
        // 记录推荐原因
        if (!itemReasons.has(similarItemId)) {
          itemReasons.set(similarItemId, [])
        }
        
        const baseContent = contentPool.find(c => c.post_id === baseItemId)
        if (baseContent) {
          itemReasons.get(similarItemId)!.push(baseContent.title)
        }
      }
    }
    
    // 转换为候选列表
    const candidates: RecommendationCandidate[] = []
    const contentMap = new Map(contentPool.map(c => [c.post_id, c]))
    
    for (const [itemId, score] of itemScores.entries()) {
      const content = contentMap.get(itemId)
      if (!content) continue
      
      const reasons = itemReasons.get(itemId) || []
      const candidate: RecommendationCandidate = {
        post_id: itemId,
        score: this.score(content, null, { collaborative_score: score }),
        reasons: reasons.length > 0 ? [`与「${reasons[0]}」相似`] : ['基于您的阅读历史'],
        source: RecommendationSource.COLLABORATIVE,
        features: {
          similarity_score: score,
          quality_score: content.quality_score,
        },
      }
      candidates.push(candidate)
    }
    
    return this.sortCandidates(candidates, limit)
  }
  
  /**
   * 查找相似用户
   */
  private async findSimilarUsers(userId: string, limit: number): Promise<UserSimilarity[]> {
    // 检查缓存
    if (this.userSimilarities.has(userId)) {
      return this.userSimilarities.get(userId)!.slice(0, limit)
    }
    
    if (!this.userItemMatrix || !this.userItemMatrix[userId]) {
      return []
    }
    
    const similarities: UserSimilarity[] = []
    const targetUserItems = this.userItemMatrix[userId]
    
    // 计算与其他用户的相似度
    for (const [otherUserId, otherUserItems] of Object.entries(this.userItemMatrix)) {
      if (otherUserId === userId) continue
      
      const similarity = this.calculateUserSimilarity(targetUserItems, otherUserItems)
      if (similarity > 0.1) { // 最小相似度阈值
        similarities.push({
          user1: userId,
          user2: otherUserId,
          similarity,
        })
      }
    }
    
    // 排序并缓存
    similarities.sort((a, b) => b.similarity - a.similarity)
    this.userSimilarities.set(userId, similarities)
    return similarities.slice(0, limit)
  }
  
  /**
   * 查找相似物品
   */
  private async findSimilarItems(itemId: string, limit: number): Promise<Map<string, number>> {
    // 检查缓存
    if (this.itemSimilarities.has(itemId)) {
      return this.itemSimilarities.get(itemId)!
    }
    
    if (!this.userItemMatrix) {
      return new Map()
    }
    
    // 获取与该物品交互过的用户
    const itemUsers: Map<string, number> = new Map()
    for (const [userId, items] of Object.entries(this.userItemMatrix)) {
      if (items[itemId]) {
        itemUsers.set(userId, items[itemId])
      }
    }
    
    if (itemUsers.size === 0) {
      return new Map()
    }
    
    // 计算与其他物品的相似度
    const similarities: Map<string, number> = new Map()
    const allItems = new Set<string>()
    
    // 收集所有物品
    for (const items of Object.values(this.userItemMatrix)) {
      for (const item of Object.keys(items)) {
        allItems.add(item)
      }
    }
    
    // 计算相似度
    for (const otherItemId of allItems) {
      if (otherItemId === itemId) continue
      
      const otherItemUsers: Map<string, number> = new Map()
      for (const [userId, items] of Object.entries(this.userItemMatrix)) {
        if (items[otherItemId]) {
          otherItemUsers.set(userId, items[otherItemId])
        }
      }
      
      const similarity = this.calculateItemSimilarity(itemUsers, otherItemUsers)
      if (similarity > 0.1) {
        similarities.set(otherItemId, similarity)
      }
    }
    
    // 排序并取前N个
    const sortedSimilarities = new Map(
      [...similarities.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
    )
    
    // 缓存结果
    this.itemSimilarities.set(itemId, sortedSimilarities)
    return sortedSimilarities
  }
  
  /**
   * 计算用户相似度（余弦相似度）
   */
  private calculateUserSimilarity(
    user1Items: Record<string, number>,
    user2Items: Record<string, number>
  ): number {
    const commonItems = Object.keys(user1Items).filter(item => item in user2Items)
    if (commonItems.length === 0) return 0
    
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    
    for (const item of commonItems) {
      dotProduct += user1Items[item] * user2Items[item]
    }
    
    for (const score of Object.values(user1Items)) {
      norm1 += score * score
    }
    
    for (const score of Object.values(user2Items)) {
      norm2 += score * score
    }
    
    norm1 = Math.sqrt(norm1)
    norm2 = Math.sqrt(norm2)
    
    return norm1 * norm2 > 0 ? dotProduct / (norm1 * norm2) : 0
  }
  
  /**
   * 计算物品相似度（余弦相似度）
   */
  private calculateItemSimilarity(
    item1Users: Map<string, number>,
    item2Users: Map<string, number>
  ): number {
    const commonUsers = new Set([...item1Users.keys()].filter(u => item2Users.has(u)))
    if (commonUsers.size === 0) return 0
    
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    
    for (const user of commonUsers) {
      dotProduct += item1Users.get(user)! * item2Users.get(user)!
    }
    
    for (const score of item1Users.values()) {
      norm1 += score * score
    }
    
    for (const score of item2Users.values()) {
      norm2 += score * score
    }
    
    norm1 = Math.sqrt(norm1)
    norm2 = Math.sqrt(norm2)
    
    return norm1 * norm2 > 0 ? dotProduct / (norm1 * norm2) : 0
  }
  
  /**
   * 构建用户-物品矩阵
   */
  private async buildUserItemMatrix(): Promise<void> {
    // 这里简化处理，实际需要从数据库获取所有用户行为
    // 并构建完整的用户-物品交互矩阵
    if (this.userItemMatrix) return
    
    this.userItemMatrix = {}
    
    // TODO: 从数据库获取所有用户行为并构建矩阵
    // 示例代码：
    // const allActions = await getAllUserActions()
    // for (const action of allActions) {
    //   if (!this.userItemMatrix[action.user_id]) {
    //     this.userItemMatrix[action.user_id] = {}
    //   }
    //   const weight = ACTION_WEIGHTS[action.action_type] || 1
    //   const current = this.userItemMatrix[action.user_id][action.target_id] || 0
    //   this.userItemMatrix[action.user_id][action.target_id] = current + weight
    // }
  }
  
  /**
   * 获取用户行为（模拟）
   */
  private async getUserActions(userId: string): Promise<UserAction[]> {
    // TODO: 实际需要从数据库获取
    return []
  }
}