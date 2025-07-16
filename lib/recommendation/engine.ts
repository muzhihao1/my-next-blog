/**
 * 推荐引擎核心
 */
import {
  RecommendationRequest,
  RecommendationResponse,
  RecommendationCandidate,
  RecommendationItem,
  UserProfile,
  ContentFeatures,
  UserAction,
} from './types'

import {
  DEFAULT_RECOMMENDATION_CONFIG,
  RECOMMENDATION_LIMITS,
  CACHE_CONFIG,
} from './config'

import { ContentBasedAlgorithm } from './algorithms/content-based'
import { CollaborativeFilteringAlgorithm } from './algorithms/collaborative'
import { TrendingAlgorithm } from './algorithms/trending'
import { UserProfileBuilder } from './user-profile'
import { createClient } from '@/lib/supabase/server' 

import { v4 as uuidv4 } from 'uuid'

/**
 * 推荐引擎
 */
export class RecommendationEngine {
  private config = DEFAULT_RECOMMENDATION_CONFIG
  private algorithms = {
    content: new ContentBasedAlgorithm(),
    collaborative: new CollaborativeFilteringAlgorithm(),
    trending: new TrendingAlgorithm(),
  }
  private profileBuilder = new UserProfileBuilder()
  
  // 缓存
  private userProfileCache = new Map<string, { profile: UserProfile; timestamp: number }>()
  private contentFeatureCache = new Map<string, { features: ContentFeatures; timestamp: number }>()
  private recommendationCache = new Map<string, { response: RecommendationResponse; timestamp: number }>()
  
  /**
   * 生成推荐
   */
  async recommend(request: RecommendationRequest): Promise<RecommendationResponse> {
    const startTime = Date.now()
    const sessionId = request.context?.session_id || uuidv4()
    
    // 检查缓存
    const cacheKey = this.getCacheKey(request)
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }
    try {
      // 获取用户画像
      const userProfile = request.user_id
        ? await this.getUserProfile(request.user_id)
        : null
        
      // 获取内容池
      const contentPool = await this.getContentPool()
      
      // 生成候选集
      const candidates = await this.generateCandidates(
        userProfile,
        request,
        contentPool
      )
      
      // 重排序
      const rerankedCandidates = await this.rerank(
        candidates,
        userProfile,
        request
      )
      
      // 转换为响应格式
      const recommendations = this.formatRecommendations(
        rerankedCandidates,
        request.count || RECOMMENDATION_LIMITS.DEFAULT_COUNT
      )
      
      const response: RecommendationResponse = {
        recommendations,
        session_id: sessionId,
        generated_at: new Date(),
      }
      // 添加调试信息（仅开发环境）
      if (process.env.NODE_ENV === 'development') {
        response.debug = {
          user_profile: userProfile ? {
            interests: Object.entries(userProfile.interests)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
            segments: userProfile.segments,
          } : undefined,
          strategy_weights: this.config.strategy_weights,
          candidates_count: candidates.length,
          processing_time: Date.now() - startTime,
        }
      }
      
      // 缓存结果
      this.cacheRecommendation(cacheKey, response)
      
      // 异步记录推荐日志
      this.logRecommendation(request, response).catch(console.error)
      
      return response
    } catch (error) {
      console.error('Recommendation error:', error)
      // 降级策略：返回热门内容
      return this.fallbackRecommendation(request)
    }
  }
  
  /**
   * 记录用户行为
   */
  async recordUserAction(action: UserAction): Promise<void> {
    try {
      const supabase = await createClient()
      
      // 保存用户行为
      const { error } = await supabase
        .from('user_actions')
        .insert({
          id: action.id,
          user_id: action.user_id,
          action_type: action.action_type,
          target_id: action.target_id,
          target_type: action.target_type,
          value: action.value,
          context: action.context,
          created_at: action.created_at,
        })
        
      if (error) {
        console.error('Failed to record user action:', error)
        return
      }
      
      // 清除用户画像缓存
      this.userProfileCache.delete(action.user_id)
      
      // 异步更新用户画像
      this.updateUserProfile(action.user_id).catch(console.error)
    }
    catch (error) {
      console.error('Record user action error:', error)
    }
  }
  
  /**
   * 获取用户画像
   */
  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    // 检查缓存
    const cached = this.userProfileCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.ttl.user_profile) {
      return cached.profile
    }
    try {
      const supabase = await createClient()
      
      // 获取保存的用户画像
      const { data: savedProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
        
      if (savedProfile) {
        const profile: UserProfile = {
          user_id: savedProfile.user_id,
          interests: savedProfile.interests || {},
          preferences: savedProfile.preferences || {},
          stats: savedProfile.stats || {},
          segments: savedProfile.segments || [],
          updated_at: new Date(savedProfile.updated_at),
        }
        // 缓存
        this.userProfileCache.set(userId, {
          profile,
          timestamp: Date.now(),
        })
        
        return profile
      }
      
      // 如果没有保存的画像，构建新的
      return await this.buildUserProfile(userId)
    }
    catch (error) {
      console.error('Failed to get user profile:', error)
      return null
    }
  }
  
  /**
   * 构建用户画像
   */
  private async buildUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = await createClient()
      
      // 获取用户行为历史
      const { data: actions } = await supabase
        .from('user_actions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1000)
        
      if (!actions || actions.length === 0) {
        return null
      }
      // 获取内容特征
      const contentIds = [...new Set(actions.map(a => a.target_id))]
      const contentFeatures = await this.getContentFeatures(contentIds)
      
      // 构建画像
      const userActions: UserAction[] = actions.map(a => ({
        id: a.id,
        user_id: a.user_id,
        action_type: a.action_type,
        target_id: a.target_id,
        target_type: a.target_type,
        value: a.value,
        context: a.context,
        created_at: new Date(a.created_at),
      }))

      const profile = await this.profileBuilder.buildProfile(
        userId,
        userActions,
        new Map(contentFeatures.map(f => [f.post_id, f]))
      )
      
      // 保存画像
      await this.saveUserProfile(profile)
      
      // 缓存
      this.userProfileCache.set(userId, {
        profile,
        timestamp: Date.now(),
      })
      
      return profile
    }
    catch (error) {
      console.error('Failed to build user profile:', error)
      return null
    }
  }
  
  /**
   * 获取内容池
   */
  private async getContentPool(): Promise<ContentFeatures[]> {
    try {
      const supabase = await createClient()
      
      // 获取所有发布的文章
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          author,
          published_at,
          categories,
          tags,
          summary,
          word_count,
          read_time,
          quality_score,
          views,
          likes,
          collects,
          comments
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(1000)
        
      if (!posts) return []
      
      // 转换为内容特征
      return posts.map(post => ({
        post_id: post.id,
        title: post.title,
        author: post.author,
        published_at: new Date(post.published_at),
        categories: post.categories || [],
        tags: post.tags || [],
        keywords: [], // TODO: 从内容中提取关键词
        summary: post.summary,
        word_count: post.word_count || 0,
        read_time: post.read_time || Math.ceil(post.word_count / 200),
        quality_score: post.quality_score,
        engagement: {
          views: post.views || 0,
          likes: post.likes || 0,
          collects: post.collects || 0,
          comments: post.comments || 0,
          shares: 0, // TODO: 添加分享统计
          avg_read_ratio: 0.7, // TODO: 计算实际完读率
        },
        updated_at: new Date(),
      }))
    } catch (error) {
      console.error('Failed to get content pool:', error)
      return []
    }
  }
  
  /**
   * 获取内容特征
   */
  private async getContentFeatures(contentIds: string[]): Promise<ContentFeatures[]> {
    const features: ContentFeatures[] = []
    const uncachedIds: string[] = []
    
    // 检查缓存
    for (const id of contentIds) {
      const cached = this.contentFeatureCache.get(id)
      if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.ttl.content_features) {
        features.push(cached.features)
      } else {
        uncachedIds.push(id)
      }
    }
    
    // 获取未缓存的内容
    if (uncachedIds.length > 0) {
      try {
        const supabase = await createClient()
        const { data: posts } = await supabase
          .from('posts')
          .select('*')
          .in('id', uncachedIds)
          
        if (posts) {
          for (const post of posts) {
            const contentFeatures: ContentFeatures = {
              post_id: post.id,
              title: post.title,
              author: post.author,
              published_at: new Date(post.published_at),
              categories: post.categories || [],
              tags: post.tags || [],
              keywords: [],
              summary: post.summary,
              word_count: post.word_count || 0,
              read_time: post.read_time || Math.ceil(post.word_count / 200),
              quality_score: post.quality_score,
              engagement: {
                views: post.views || 0,
                likes: post.likes || 0,
                collects: post.collects || 0,
                comments: post.comments || 0,
                shares: 0,
                avg_read_ratio: 0.7,
              },
              updated_at: new Date(),
            }
            
            features.push(contentFeatures)
            
            // 缓存
            this.contentFeatureCache.set(post.id, {
              features: contentFeatures,
              timestamp: Date.now(),
            })
          }
        }
      } catch (error) {
        console.error('Failed to get content features:', error)
      }
    }
    
    return features
  }
  /**
   * 生成候选集
   */
  private async generateCandidates(
    userProfile: UserProfile | null,
    request: RecommendationRequest,
    contentPool: ContentFeatures[]
  ): Promise<RecommendationCandidate[]> {
    const candidateMap = new Map<string, RecommendationCandidate>()
    const weights = this.config.strategy_weights
    
    // 限制候选集大小
    const candidateLimit = Math.min(
      (request.count || RECOMMENDATION_LIMITS.DEFAULT_COUNT) * RECOMMENDATION_LIMITS.CANDIDATE_MULTIPLIER,
      RECOMMENDATION_LIMITS.MIN_CANDIDATES
    )
    
    // 协同过滤
    if (weights.collaborative > 0 && userProfile) {
      const collaborativeCandidates = await this.algorithms.collaborative.generateCandidates(
        userProfile,
        request,
        contentPool
      )
      
      for (const candidate of collaborativeCandidates.slice(0, candidateLimit)) {
        candidate.score *= weights.collaborative
        candidateMap.set(candidate.post_id, candidate)
      }
    }
    
    // 内容相似
    if (weights.content_based > 0) {
      const contentCandidates = await this.algorithms.content.generateCandidates(
        userProfile,
        request,
        contentPool
      )
      
      for (const candidate of contentCandidates.slice(0, candidateLimit)) {
        const existing = candidateMap.get(candidate.post_id)
        if (existing) {
          existing.score += candidate.score * weights.content_based
        } else {
          candidate.score *= weights.content_based
          candidateMap.set(candidate.post_id, candidate)
        }
      }
    }
    
    // 热门趋势
    if (weights.trending > 0) {
      const trendingCandidates = await this.algorithms.trending.generateCandidates(
        userProfile,
        request,
        contentPool
      )
      
      for (const candidate of trendingCandidates.slice(0, candidateLimit)) {
        const existing = candidateMap.get(candidate.post_id)
        if (existing) {
          existing.score += candidate.score * weights.trending
        } else {
          candidate.score *= weights.trending
          candidateMap.set(candidate.post_id, candidate)
        }
      }
    }
    
    // 最新内容
    if (weights.recent > 0) {
      const recentContent = contentPool
        .filter(c => {
          const daysSincePublish = (Date.now() - c.published_at.getTime()) / (1000 * 60 * 60 * 24)
          return daysSincePublish <= 7
        })
        .slice(0, candidateLimit)
        
      for (const content of recentContent) {
        const existing = candidateMap.get(content.post_id)
        if (existing) {
          existing.score += weights.recent * 0.8
        } else {
          candidateMap.set(content.post_id, {
            post_id: content.post_id,
            score: weights.recent * 0.8,
            reasons: ['最新发布'],
            source: 'recent' as any,
          })
        }
      }
    }
    
    // 随机探索
    if (weights.random > 0) {
      const randomContent = this.getRandomItems(contentPool, 10)
      
      for (const content of randomContent) {
        const existing = candidateMap.get(content.post_id)
        if (existing) {
          existing.score += weights.random * 0.5
        } else {
          candidateMap.set(content.post_id, {
            post_id: content.post_id,
            score: weights.random * 0.5,
            reasons: ['探索发现'],
            source: 'recent' as any,
          })
        }
      }
    }
    
    return Array.from(candidateMap.values())
  }
  /**
   * 重排序
   */
  private async rerank(
    candidates: RecommendationCandidate[],
    userProfile: UserProfile | null,
    request: RecommendationRequest
  ): Promise<RecommendationCandidate[]> {
    // 基础排序
    let ranked = candidates.sort((a, b) => b.score - a.score)
    
    // 应用业务规则
    ranked = this.applyBusinessRules(ranked, userProfile)
    
    // 应用多样性
    ranked = this.applyDiversityControl(ranked)
    
    // 应用位置衰减
    ranked = this.applyPositionDecay(ranked)
    
    return ranked
  }
  /**
   * 应用业务规则
   */
  private applyBusinessRules(
    candidates: RecommendationCandidate[],
    userProfile: UserProfile | null
  ): RecommendationCandidate[] {
    const rules = this.config.rules
    
    return candidates.filter(candidate => {
      // 质量过滤
      if (candidate.features?.quality_score && candidate.features.quality_score < rules.min_quality_score) {
        return false
      }
      
      // TODO: 实现其他业务规则
      // - 去重规则
      // - 用户黑名单
      // - 内容过滤
      
      return true
    })
  }
  /**
   * 应用多样性控制
   */
  private applyDiversityControl(
    candidates: RecommendationCandidate[]
  ): RecommendationCandidate[] {
    // TODO: 实现多样性控制
    // - 限制同类别内容比例
    // - 限制同作者内容比例
    // - 确保标签多样性
    
    return candidates
  }
  /**
   * 应用位置衰减
   */
  private applyPositionDecay(
    candidates: RecommendationCandidate[]
  ): RecommendationCandidate[] {
    const decayFactor = this.config.decay.position_decay_factor
    
    return candidates.map((candidate, index) => ({
      ...candidate,
      score: candidate.score * Math.pow(decayFactor, index),
    }))
  }
  /**
   * 格式化推荐结果
   */
  private formatRecommendations(
    candidates: RecommendationCandidate[],
    limit: number
  ): RecommendationItem[] {
    return candidates
      .slice(0, limit)
      .map((candidate, index) => ({
        post_id: candidate.post_id,
        rank: index + 1,
        score: candidate.score,
        reason: candidate.reasons[0] || '为您推荐',
        source: candidate.source,
        predicted_ctr: this.predictCTR(candidate),
      }))
  }
  /**
   * 预测点击率
   */
  private predictCTR(candidate: RecommendationCandidate): number {
    // 简单的CTR预测模型
    const baseRate = 0.1 // 基础点击率10%
    const scoreBoost = candidate.score * 0.2 // 分数提升
    const qualityBoost = (candidate.features?.quality_score || 0) * 0.1
    
    return Math.min(baseRate + scoreBoost + qualityBoost, 0.5)
  }
  /**
   * 降级推荐
   */
  private async fallbackRecommendation(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    try {
      const supabase = await createClient()
      
      // 获取热门内容
      const { data: posts } = await supabase
        .from('posts')
        .select('id')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(request.count || RECOMMENDATION_LIMITS.DEFAULT_COUNT)
        
      const recommendations: RecommendationItem[] = (posts || []).map((post, index) => ({
        post_id: post.id,
        rank: index + 1,
        score: 1 - index * 0.1,
        reason: '热门推荐',
        source: 'trending' as any,
      }))
      
      return {
        recommendations,
        session_id: uuidv4(),
        generated_at: new Date(),
      }
    } catch (error) {
      console.error('Fallback recommendation error:', error)
      return {
        recommendations: [],
        session_id: uuidv4(),
        generated_at: new Date(),
      }
    }
  }
  /**
   * 更新用户画像
   */
  private async updateUserProfile(userId: string): Promise<void> {
    try {
      const profile = await this.buildUserProfile(userId)
      if (profile) {
        await this.saveUserProfile(profile)
      }
    } catch (error) {
      console.error('Failed to update user profile:', error)
    }
  }
  
  /**
   * 保存用户画像
   */
  private async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const supabase = await createClient()
      
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: profile.user_id,
          interests: profile.interests,
          preferences: profile.preferences,
          stats: profile.stats,
          segments: profile.segments,
          updated_at: profile.updated_at,
        })
    } catch (error) {
      console.error('Failed to save user profile:', error)
    }
  }
  
  /**
   * 记录推荐日志
   */
  private async logRecommendation(
    request: RecommendationRequest,
    response: RecommendationResponse
  ): Promise<void> {
    try {
      const supabase = await createClient()
      
      await supabase
        .from('recommendation_logs')
        .insert({
          session_id: response.session_id,
          user_id: request.user_id,
          request: request,
          response: {
            recommendations: response.recommendations,
            generated_at: response.generated_at,
          },
          created_at: new Date(),
        })
    } catch (error) {
      console.error('Failed to log recommendation:', error)
    }
  }
  
  /**
   * 获取缓存键
   */
  private getCacheKey(request: RecommendationRequest): string {
    const parts = [
      request.user_id || 'anonymous',
      request.count || RECOMMENDATION_LIMITS.DEFAULT_COUNT,
      request.offset || 0,
      request.context?.current_post_id || '',
      request.context?.source || '',
    ]
    
    return parts.join(':')
  }
  /**
   * 从缓存获取
   */
  private getFromCache(key: string): RecommendationResponse | null {
    const cached = this.recommendationCache.get(key)
    
    if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.ttl.recommendations) {
      return cached.response
    }
    
    return null
  }
  /**
   * 缓存推荐结果
   */
  private cacheRecommendation(key: string, response: RecommendationResponse): void {
    // 限制缓存大小
    if (this.recommendationCache.size >= CACHE_CONFIG.max_size.recommendations) {
      const firstKey = this.recommendationCache.keys().next().value
      this.recommendationCache.delete(firstKey)
    }
    
    this.recommendationCache.set(key, {
      response,
      timestamp: Date.now(),
    })
  }
  /**
   * 获取随机项
   */
  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }
  /**
   * 清理缓存
   */
  clearCache(): void {
    this.userProfileCache.clear()
    this.contentFeatureCache.clear()
    this.recommendationCache.clear()
  }
}