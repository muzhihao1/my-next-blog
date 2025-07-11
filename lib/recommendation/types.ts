/**
 * 推荐系统类型定义
 */

/**
 * 用户行为类型
 */
export enum UserActionType {
  VIEW = 'view', // 浏览
  LIKE = 'like', // 点赞
  COLLECT = 'collect', // 收藏
  COMMENT = 'comment', // 评论
  SHARE = 'share', // 分享
  READ_TIME = 'read_time', // 阅读时长
  CLICK = 'click', // 点击
}
/**
 * 用户行为记录
 */
export interface UserAction {
  id: string
  user_id: string
  action_type: UserActionType
  target_id: string // 文章ID
  target_type: 'post' // 目标类型
  value?: number // 行为值（如阅读时长秒数）
  context?: {
    source?: string // 来源（首页、推荐、搜索等）
    position?: number // 展示位置
    session_id?: string // 会话ID
  }
  created_at: Date
}
/**
 * 用户画像
 */
export interface UserProfile {
  user_id: string
  
  // 兴趣标签（标签 -> 权重）
  interests: Record<string, number>
  
  // 阅读偏好
  preferences: {
    preferred_length?: 'short' | 'medium' | 'long' // 文章长度偏好
    preferred_time?: string[] // 偏好阅读时间段
    preferred_categories?: string[] // 偏好分类
    reading_speed?: number // 阅读速度（字/分钟）
  }
  
  // 行为统计
  stats: {
    total_views: number
    total_likes: number
    total_collects: number
    total_comments: number
    avg_read_time: number // 平均阅读时长（秒）
    active_days: number // 活跃天数
    last_active: Date
  }
  
  // 用户分群
  segments?: string[] // 用户分群标签
  updated_at: Date
}
/**
 * 内容特征
 */
export interface ContentFeatures {
  post_id: string
  
  // 基础特征
  title: string
  author: string
  published_at: Date
  
  // 内容特征
  categories: string[] // 分类
  tags: string[] // 标签
  keywords: string[] // 关键词
  summary?: string // 摘要
  
  // 统计特征
  word_count: number // 字数
  read_time: number // 预计阅读时间（分钟）
  difficulty?: number // 难度系数（0-1）
  
  // 质量指标
  quality_score?: number // 内容质量分
  
  // 互动指标
  engagement: {
    views: number
    likes: number
    collects: number
    comments: number
    shares: number
    avg_read_ratio: number // 平均阅读完成率
  }
  
  // 向量表示（用于相似度计算）
  embedding?: number[]
  updated_at: Date
}
/**
 * 推荐候选项
 */
export interface RecommendationCandidate {
  post_id: string
  score: number // 推荐分数
  reasons: string[] // 推荐理由
  source: RecommendationSource // 推荐来源
  features?: {
    similarity_score?: number // 相似度分数
    popularity_score?: number // 热度分数
    freshness_score?: number // 新鲜度分数
    personalization_score?: number // 个性化分数
  }
}

/**
 * 推荐来源
 */
export enum RecommendationSource {
  COLLABORATIVE = 'collaborative', // 协同过滤
  CONTENT_BASED = 'content_based', // 内容相似
  TRENDING = 'trending', // 热门趋势
  RECENT = 'recent', // 最新内容
  SIMILAR_USERS = 'similar_users', // 相似用户
  AUTHOR_FOLLOW = 'author_follow', // 关注作者
  TAG_BASED = 'tag_based', // 标签相关
}
/**
 * 推荐请求
 */
export interface RecommendationRequest {
  user_id?: string // 用户ID（未登录用户可为空）
  count?: number // 推荐数量
  offset?: number // 偏移量（分页）
  exclude_ids?: string[] // 排除的文章ID
  context?: {
    current_post_id?: string // 当前文章（用于相关推荐）
    source?: string // 请求来源
    session_id?: string // 会话ID
    device_type?: string // 设备类型
  }
}

/**
 * 推荐响应
 */
export interface RecommendationResponse {
  recommendations: RecommendationItem[]
  session_id: string
  generated_at: Date
  debug?: {
    user_profile?: Partial<UserProfile>
    strategy_weights?: Record<string, number>
    candidates_count?: number
  }
}

/**
 * 推荐项
 */
export interface RecommendationItem {
  post_id: string
  rank: number // 排名
  score: number // 分数
  reason: string // 主要推荐理由
  source: RecommendationSource
  predicted_ctr?: number // 预测点击率
}

/**
 * 推荐策略配置
 */
export interface RecommendationConfig {
  // 策略权重
  strategy_weights: {
    collaborative: number // 协同过滤权重
    content_based: number // 内容相似权重
    trending: number // 热门趋势权重
    recent: number // 最新内容权重
    random: number // 随机探索权重
  }
  
  // 业务规则
  rules: {
    min_quality_score: number // 最低质量分
    max_repeat_in_days: number // 多少天内不重复推荐
    boost_recent_days: number // 提升最近N天的内容
    diversity_factor: number // 多样性因子（0-1）
    personalization_threshold: number // 个性化阈值（用户行为数）
  }
  // 特征权重
  feature_weights: {
    view_weight: number // 浏览权重
    like_weight: number // 点赞权重
    collect_weight: number // 收藏权重
    comment_weight: number // 评论权重
    read_time_weight: number // 阅读时长权重
  }
  // 衰减配置
  decay: {
    time_decay_factor: number // 时间衰减因子
    position_decay_factor: number // 位置衰减因子
  }
}

/**
 * 推荐算法接口
 */
export interface RecommendationAlgorithm {
  name: string
  
  /**
   * 生成推荐候选
   */
  generateCandidates(
    userProfile: UserProfile | null,
    request: RecommendationRequest,
    contentPool: ContentFeatures[]
  ): Promise<RecommendationCandidate[]>
  
  /**
   * 计算推荐分数
   */
  score(
    candidate: ContentFeatures,
    userProfile: UserProfile | null,
    context?: any
  ): number
}
/**
 * 相似度计算结果
 */
export interface SimilarityResult {
  item1_id: string
  item2_id: string
  similarity: number // 相似度分数（0-1）
  method: 'cosine' | 'jaccard' | 'euclidean'
}
/**
 * 推荐效果指标
 */
export interface RecommendationMetrics {
  date: Date
  
  // 基础指标
  impressions: number // 曝光次数
  clicks: number // 点击次数
  ctr: number // 点击率
  
  // 深度指标
  avg_read_ratio: number // 平均阅读完成率
  engagement_rate: number // 互动率（点赞+收藏+评论）
  
  // 多样性指标
  category_diversity: number // 类别多样性
  author_diversity: number // 作者多样性
  
  // 覆盖率
  user_coverage: number // 用户覆盖率
  item_coverage: number // 物品覆盖率
  
  // 分策略指标
  metrics_by_source: Record<RecommendationSource, {
    impressions: number
    clicks: number
    ctr: number
  }>
}