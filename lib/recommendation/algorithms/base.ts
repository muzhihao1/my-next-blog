/**
 * 推荐算法基类
 */
import { 
  RecommendationAlgorithm, 
  RecommendationCandidate, 
  UserProfile, 
  ContentFeatures, 
  RecommendationRequest 
} from '../types'

/**
 * 推荐算法基类
 */
export abstract class BaseRecommendationAlgorithm implements RecommendationAlgorithm {
  abstract name: string

  /**
   * 生成推荐候选
   */
  abstract generateCandidates(
    userProfile: UserProfile | null,
    request: RecommendationRequest,
    contentPool: ContentFeatures[]
  ): Promise<RecommendationCandidate[]>

  /**
   * 计算推荐分数
   */
  abstract score(
    candidate: ContentFeatures,
    userProfile: UserProfile | null,
    context?: any
  ): number

  /**
   * 过滤候选内容
   */
  protected filterCandidates(
    contentPool: ContentFeatures[],
    request: RecommendationRequest,
    userProfile?: UserProfile | null
  ): ContentFeatures[] {
    return contentPool.filter(content => {
      // 排除已经推荐过的
      if (request.exclude_ids?.includes(content.post_id)) {
        return false
      }
      // 排除当前正在查看的
      if (request.context?.current_post_id === content.post_id) {
        return false
      }
      return true
    })
  }

  /**
   * 计算时间衰减因子
   */
  protected calculateTimeDecay(
    publishedAt: Date,
    decayFactor: number = 0.95,
    halfLifeDays: number = 7
  ): number {
    const now = new Date()
    const daysSincePublish = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24)
    // 使用指数衰减
    return Math.pow(decayFactor, daysSincePublish / halfLifeDays)
  }

  /**
   * 计算新鲜度分数
   */
  protected calculateFreshnessScore(
    publishedAt: Date,
    boostRecentDays: number = 3
  ): number {
    const now = new Date()
    const daysSincePublish = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSincePublish <= boostRecentDays) {
      // 最近N天的内容获得额外加成
      return 1 + (boostRecentDays - daysSincePublish) / boostRecentDays * 0.5
    }
    
    // 使用sigmoid函数计算衰减
    return 1 / (1 + Math.exp((daysSincePublish - 30) / 10))
  }

  /**
   * 计算热度分数
   */
  protected calculatePopularityScore(
    engagement: ContentFeatures['engagement'],
    benchmarks: {
      views: number
      likes: number
      collects: number
      comments: number
    }
  ): number {
    // 归一化各项指标
    const normalizedViews = Math.min(engagement.views / benchmarks.views, 2)
    const normalizedLikes = Math.min(engagement.likes / benchmarks.likes, 2)
    const normalizedCollects = Math.min(engagement.collects / benchmarks.collects, 2)
    const normalizedComments = Math.min(engagement.comments / benchmarks.comments, 2)
    
    // 加权平均
    const weights = {
      views: 0.2,
      likes: 0.3,
      collects: 0.3,
      comments: 0.2,
    }
    
    return (
      normalizedViews * weights.views +
      normalizedLikes * weights.likes +
      normalizedCollects * weights.collects +
      normalizedComments * weights.comments
    )
  }

  /**
   * 计算质量分数
   */
  protected calculateQualityScore(content: ContentFeatures): number {
    const { engagement, word_count, read_time } = content
    
    // 互动率
    const interactionRate = engagement.views > 0
      ? (engagement.likes + engagement.collects + engagement.comments) / engagement.views
      : 0
    
    // 完读率
    const readCompletionRate = engagement.avg_read_ratio || 0
    
    // 内容丰富度（基于字数）
    const contentRichness = Math.min(word_count / 2000, 1) // 2000字为满分
    
    // 加权计算
    return (
      interactionRate * 0.4 +
      readCompletionRate * 0.4 +
      contentRichness * 0.2
    )
  }

  /**
   * 排序候选列表
   */
  protected sortCandidates(
    candidates: RecommendationCandidate[],
    limit: number
  ): RecommendationCandidate[] {
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * 应用多样性控制
   */
  protected applyDiversity(
    candidates: RecommendationCandidate[],
    contentMap: Map<string, ContentFeatures>,
    diversityFactor: number = 0.3
  ): RecommendationCandidate[] {
    const selected: RecommendationCandidate[] = []
    const categoryCount: Record<string, number> = {}
    const authorCount: Record<string, number> = {}
    const tagCount: Record<string, number> = {}

    for (const candidate of candidates) {
      const content = contentMap.get(candidate.post_id)
      if (!content) continue

      // 检查多样性约束
      const categoryRatio = (categoryCount[content.categories[0]] || 0) / Math.max(selected.length, 1)
      const authorRatio = (authorCount[content.author] || 0) / Math.max(selected.length, 1)

      // 如果超过多样性阈值，降低分数
      let diversityPenalty = 1
      if (categoryRatio > diversityFactor) {
        diversityPenalty *= 0.7
      }
      if (authorRatio > diversityFactor * 0.7) {
        diversityPenalty *= 0.8
      }

      // 应用惩罚
      candidate.score *= diversityPenalty

      // 更新计数
      selected.push(candidate)
      categoryCount[content.categories[0]] = (categoryCount[content.categories[0]] || 0) + 1
      authorCount[content.author] = (authorCount[content.author] || 0) + 1
      content.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    }

    // 重新排序
    return selected.sort((a, b) => b.score - a.score)
  }

  /**
   * 添加推荐理由
   */
  protected addRecommendationReasons(
    candidate: RecommendationCandidate,
    content: ContentFeatures,
    userProfile?: UserProfile | null
  ): void {
    const reasons: string[] = []

    // 基于用户兴趣
    if (userProfile && content.tags.length > 0) {
      const matchedTags = content.tags.filter(tag =>
        userProfile.interests[tag] && userProfile.interests[tag] > 0.5
      )
      if (matchedTags.length > 0) {
        reasons.push(`与您感兴趣的「${matchedTags[0]}」相关`)
      }
    }

    // 基于热度
    if (content.engagement.views > 1000) {
      reasons.push('热门文章')
    }

    // 基于质量
    if (content.quality_score && content.quality_score > 0.8) {
      reasons.push('优质内容')
    }

    // 基于新鲜度
    const daysSincePublish = (Date.now() - content.published_at.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSincePublish <= 3) {
      reasons.push('最新发布')
    }

    // 基于作者
    if (userProfile?.preferences.preferred_categories?.includes(content.categories[0])) {
      reasons.push(`${content.categories[0]}领域精选`)
    }

    candidate.reasons = reasons.length > 0 ? reasons : ['为您推荐']
  }
}