/** * 基于内容的推荐算法 */
import { BaseRecommendationAlgorithm }
from './base' 

import { RecommendationCandidate, UserProfile, ContentFeatures, RecommendationRequest, RecommendationSource, }
from '../types' 

import { SIMILARITY_CONFIG, QUALITY_SCORE_CONFIG } from '../config'

/**
 * 内容相似度推荐算法
 */
export class ContentBasedAlgorithm extends BaseRecommendationAlgorithm {
  name = 'content-based'
  
  async generateCandidates(
    userProfile: UserProfile | null,
    request: RecommendationRequest,
    contentPool: ContentFeatures[]
  ): Promise<RecommendationCandidate[]> {
    // 过滤候选内容
    const filteredContent = this.filterCandidates(contentPool, request, userProfile)
    
    // 如果有当前文章，基于当前文章推荐
    if (request.context?.current_post_id) {
      const currentPost = contentPool.find(c => c.post_id === request.context!.current_post_id)
      if (currentPost) {
        return this.recommendSimilarContent(currentPost, filteredContent, request.count || 10)
      }
    }
    
    // 如果有用户画像，基于用户兴趣推荐
    if (userProfile) {
      return this.recommendByUserInterests(userProfile, filteredContent, request.count || 10)
    }
    
    // 冷启动：推荐高质量内容
    return this.recommendHighQualityContent(filteredContent, request.count || 10)
  }
  score(
    candidate: ContentFeatures,
    userProfile: UserProfile | null,
    context?: any
  ): number {
    let score = 0
    
    // 基础质量分
    const qualityScore = this.calculateQualityScore(candidate)
    score += qualityScore * 0.3
    
    // 新鲜度分
    const freshnessScore = this.calculateFreshnessScore(candidate.published_at)
    score += freshnessScore * 0.2
    
    // 用户兴趣匹配分
    if (userProfile) {
      const interestScore = this.calculateUserInterestScore(candidate, userProfile)
      score += interestScore * 0.5
    } else {
      // 无用户信息时，使用热度分
      const popularityScore = this.calculatePopularityScore(
        candidate.engagement,
        {
          views: 1000,
          likes: 100,
          collects: 50,
          comments: 20,
        }
      )
      score += popularityScore * 0.5
    }
    
    return Math.min(score, 1) // 归一化到0-1
  }
  /**
   * 基于内容相似度推荐
   */
  private async recommendSimilarContent(
    baseContent: ContentFeatures,
    contentPool: ContentFeatures[],
    limit: number
  ): Promise<RecommendationCandidate[]> {
    const candidates: RecommendationCandidate[] = []
    
    for (const content of contentPool) {
      if (content.post_id === baseContent.post_id) continue
      
      // 计算相似度
      const similarity = this.calculateContentSimilarity(baseContent, content)
      
      if (similarity >= SIMILARITY_CONFIG.thresholds.min_similarity) {
        const score = this.score(content, null, { similarity })
        const candidate: RecommendationCandidate = {
          post_id: content.post_id,
          score: score * similarity, // 结合相似度和质量分
          reasons: [],
          source: RecommendationSource.CONTENT_BASED,
          features: {
            similarity_score: similarity,
            quality_score: content.quality_score,
            freshness_score: this.calculateFreshnessScore(content.published_at),
          },
        }
        
        this.addRecommendationReasons(candidate, content)
        candidates.push(candidate)
      }
    }
    
    return this.sortCandidates(candidates, limit)
  }
  
  /**
   * 基于用户兴趣推荐
   */
  private async recommendByUserInterests(
    userProfile: UserProfile,
    contentPool: ContentFeatures[],
    limit: number
  ): Promise<RecommendationCandidate[]> {
    const candidates: RecommendationCandidate[] = []
    for (const content of contentPool) {
      const interestScore = this.calculateUserInterestScore(content, userProfile)
      
      if (interestScore > 0.2) { // 最小兴趣阈值
        const score = this.score(content, userProfile)
        const candidate: RecommendationCandidate = {
          post_id: content.post_id,
          score,
          reasons: [],
          source: RecommendationSource.CONTENT_BASED,
          features: {
            personalization_score: interestScore,
            quality_score: content.quality_score,
            freshness_score: this.calculateFreshnessScore(content.published_at),
          },
        }
        
        this.addRecommendationReasons(candidate, content, userProfile)
        candidates.push(candidate)
      }
    }
    
    return this.sortCandidates(candidates, limit)
  }
  
  /**
   * 推荐高质量内容（冷启动）
   */
  private async recommendHighQualityContent(
    contentPool: ContentFeatures[],
    limit: number
  ): Promise<RecommendationCandidate[]> {
    const candidates: RecommendationCandidate[] = []
    for (const content of contentPool) {
      const qualityScore = this.calculateQualityScore(content)
      
      if (qualityScore >= QUALITY_SCORE_CONFIG.thresholds.medium_quality) {
        const score = this.score(content, null)
        const candidate: RecommendationCandidate = {
          post_id: content.post_id,
          score,
          reasons: [],
          source: RecommendationSource.CONTENT_BASED,
          features: {
            quality_score: qualityScore,
            popularity_score: this.calculatePopularityScore(
              content.engagement,
              QUALITY_SCORE_CONFIG.benchmarks
            ),
            freshness_score: this.calculateFreshnessScore(content.published_at),
          },
        }
        
        this.addRecommendationReasons(candidate, content)
        candidates.push(candidate)
      }
    }
    
    return this.sortCandidates(candidates, limit)
  }
  
  /**
   * 计算内容相似度
   */
  private calculateContentSimilarity(
    content1: ContentFeatures,
    content2: ContentFeatures
  ): number {
    const weights = SIMILARITY_CONFIG.feature_weights
    let weightedSum = 0
    let totalWeight = 0
    
    // 标题相似度（简单的词重叠）
    if (weights.title > 0) {
      const titleSim = this.calculateTextSimilarity(content1.title, content2.title)
      weightedSum += titleSim * weights.title
      totalWeight += weights.title
    }
    // 标签相似度（Jaccard系数）
    if (weights.tags > 0 && content1.tags.length > 0 && content2.tags.length > 0) {
      const tagSim = this.calculateJaccardSimilarity(content1.tags, content2.tags)
      weightedSum += tagSim * weights.tags
      totalWeight += weights.tags
    }
    // 分类相似度
    if (weights.categories > 0) {
      const categorySim = this.calculateJaccardSimilarity(content1.categories, content2.categories)
      weightedSum += categorySim * weights.categories
      totalWeight += weights.categories
    }
    // 关键词相似度
    if (weights.keywords > 0 && content1.keywords.length > 0 && content2.keywords.length > 0) {
      const keywordSim = this.calculateJaccardSimilarity(content1.keywords, content2.keywords)
      weightedSum += keywordSim * weights.keywords
      totalWeight += weights.keywords
    }
    // 作者相同
    if (weights.author > 0 && content1.author === content2.author) {
      weightedSum += weights.author
      totalWeight += weights.author
    }
    // 向量相似度（如果有embedding）
    if (content1.embedding && content2.embedding) {
      const embeddingSim = this.calculateCosineSimilarity(content1.embedding, content2.embedding)
      return embeddingSim * 0.7 + (totalWeight > 0 ? weightedSum / totalWeight : 0) * 0.3
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }
  
  /**
   * 计算用户兴趣匹配分
   */
  private calculateUserInterestScore(
    content: ContentFeatures,
    userProfile: UserProfile
  ): number {
    let score = 0
    let matchCount = 0
    
    // 标签匹配
    for (const tag of content.tags) {
      if (userProfile.interests[tag]) {
        score += userProfile.interests[tag]
        matchCount++
      }
    }
    
    // 分类匹配
    if (userProfile.preferences.preferred_categories) {
      for (const category of content.categories) {
        if (userProfile.preferences.preferred_categories.includes(category)) {
          score += 0.5
          matchCount++
        }
      }
    }
    // 长度偏好匹配
    if (userProfile.preferences.preferred_length) {
      const contentLength = this.getContentLengthCategory(content.word_count)
      if (contentLength === userProfile.preferences.preferred_length) {
        score += 0.3
        matchCount++
      }
    }
    return matchCount > 0 ? score / matchCount : 0
  }
  
  /**
   * 计算文本相似度（简单实现）
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    return union.size > 0 ? intersection.size / union.size : 0
  }
  /**
   * 计算Jaccard相似度
   */
  private calculateJaccardSimilarity(set1: string[], set2: string[]): number {
    const s1 = new Set(set1)
    const s2 = new Set(set2)
    const intersection = new Set([...s1].filter(x => s2.has(x)))
    const union = new Set([...s1, ...s2])
    return union.size > 0 ? intersection.size / union.size : 0
  }
  /**
   * 计算余弦相似度
   */
  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0
    
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }
    norm1 = Math.sqrt(norm1)
    norm2 = Math.sqrt(norm2)
    
    return norm1 * norm2 > 0 ? dotProduct / (norm1 * norm2) : 0
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