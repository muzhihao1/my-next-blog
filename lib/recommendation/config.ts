/**
 * 推荐系统配置
 */
import { RecommendationConfig, UserActionType } from './types'

/**
 * 默认推荐配置
 */
export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationConfig = {
  // 策略权重（总和为1）
  strategy_weights: {
    collaborative: 0.3, // 协同过滤
    content_based: 0.25, // 内容相似
    trending: 0.2, // 热门趋势
    recent: 0.15, // 最新内容
    random: 0.1, // 随机探索
  },
  // 业务规则
  rules: {
    min_quality_score: 0.6, // 最低质量分
    max_repeat_in_days: 7, // 7天内不重复推荐
    boost_recent_days: 3, // 提升最近3天的内容
    diversity_factor: 0.3, // 多样性因子
    personalization_threshold: 5, // 至少5次行为才开启个性化
  },
  // 特征权重（用于计算用户兴趣）
  feature_weights: {
    view_weight: 1.0, // 浏览权重
    like_weight: 3.0, // 点赞权重
    collect_weight: 4.0, // 收藏权重
    comment_weight: 5.0, // 评论权重
    read_time_weight: 0.01, // 阅读时长权重（秒）
  },
  // 衰减配置
  decay: {
    time_decay_factor: 0.95, // 时间衰减（每天衰减5%）
    position_decay_factor: 0.9, // 位置衰减（每个位置衰减10%）
  },
}

/**
 * 行为权重映射
 */
export const ACTION_WEIGHTS: Record<UserActionType, number> = {
  [UserActionType.VIEW]: 1.0,
  [UserActionType.LIKE]: 3.0,
  [UserActionType.COLLECT]: 4.0,
  [UserActionType.COMMENT]: 5.0,
  [UserActionType.SHARE]: 4.0,
  [UserActionType.READ_TIME]: 0.01,
  [UserActionType.CLICK]: 1.5,
}

/**
 * 推荐数量配置
 */
export const RECOMMENDATION_LIMITS = {
  DEFAULT_COUNT: 10, // 默认推荐数量
  MAX_COUNT: 50, // 最大推荐数量
  CANDIDATE_MULTIPLIER: 3, // 候选集倍数
  MIN_CANDIDATES: 100, // 最小候选集大小
}

/**
 * 质量评分配置
 */
export const QUALITY_SCORE_CONFIG = {
  // 互动率权重
  engagement_weights: {
    views: 0.1,
    likes: 0.25,
    collects: 0.3,
    comments: 0.35,
  },
  // 质量阈值
  thresholds: {
    high_quality: 0.8,
    medium_quality: 0.6,
    low_quality: 0.4,
  },
  // 基准值（用于归一化）
  benchmarks: {
    views_per_day: 100, // 每天100次浏览
    like_rate: 0.1, // 10%点赞率
    collect_rate: 0.05, // 5%收藏率
    comment_rate: 0.02, // 2%评论率
    avg_read_ratio: 0.7, // 70%阅读完成率
  },
}

/**
 * 相似度计算配置
 */
export const SIMILARITY_CONFIG = {
  // 特征权重
  feature_weights: {
    title: 0.15, // 标题相似度
    tags: 0.3, // 标签相似度
    categories: 0.25, // 分类相似度
    keywords: 0.2, // 关键词相似度
    author: 0.1, // 作者相同
  },
  // 相似度阈值
  thresholds: {
    high_similarity: 0.8,
    medium_similarity: 0.6,
    low_similarity: 0.4,
    min_similarity: 0.2, // 最小相似度
  },
}

/**
 * 热门趋势配置
 */
export const TRENDING_CONFIG = {
  // 时间窗口
  time_windows: {
    hourly: 60 * 60 * 1000, // 1小时
    daily: 24 * 60 * 60 * 1000, // 1天
    weekly: 7 * 24 * 60 * 60 * 1000, // 1周
  },
  // 热度计算权重
  heat_weights: {
    views: 1.0,
    likes: 2.0,
    collects: 3.0,
    comments: 4.0,
    shares: 3.0,
  },
  // 热度衰减
  decay_rate: 0.9, // 每天衰减10%
}

/**
 * 用户分群配置
 */
export const USER_SEGMENT_CONFIG = {
  // 活跃度分群
  activity_segments: {
    heavy_user: { min_actions: 50, days: 7 }, // 重度用户：7天50次
    medium_user: { min_actions: 20, days: 7 }, // 中度用户：7天20次
    light_user: { min_actions: 5, days: 7 }, // 轻度用户：7天5次
    new_user: { max_days: 7 }, // 新用户：注册7天内
  },
  // 兴趣分群（基于主要兴趣标签）
  interest_segments: {
    tech_enthusiast: ['技术', '编程', '开发'],
    business_minded: ['商业', '创业', '管理'],
    creative_soul: ['设计', '艺术', '创意'],
    knowledge_seeker: ['学习', '教育', '知识'],
  },
}

/**
 * 个性化配置
 */
export const PERSONALIZATION_CONFIG = {
  // 冷启动策略
  cold_start: {
    use_popular: true, // 使用热门内容
    use_recent: true, // 使用最新内容
    use_high_quality: true, // 使用高质量内容
    explore_ratio: 0.3, // 探索比例
  },
  // 兴趣衰减
  interest_decay: {
    enabled: true,
    half_life_days: 30, // 半衰期30天
    min_weight: 0.1, // 最小权重
  },
  // 多样性控制
  diversity: {
    max_same_category: 0.3, // 同类别最多30%
    max_same_author: 0.2, // 同作者最多20%
    max_same_tag: 0.4, // 同标签最多40%
  },
}

/**
 * 缓存配置
 */
export const CACHE_CONFIG = {
  // 缓存时间（毫秒）
  ttl: {
    user_profile: 10 * 60 * 1000, // 用户画像：10分钟
    content_features: 60 * 60 * 1000, // 内容特征：1小时
    recommendations: 5 * 60 * 1000, // 推荐结果：5分钟
    similarity: 24 * 60 * 60 * 1000, // 相似度：24小时
  },
  // 缓存大小
  max_size: {
    user_profiles: 10000, // 最多缓存1万个用户画像
    content_features: 50000, // 最多缓存5万篇文章特征
    recommendations: 5000, // 最多缓存5千个推荐结果
  },
}

/**
 * 评估指标配置
 */
export const METRICS_CONFIG = {
  // 采样率
  sampling_rate: 0.1, // 10%采样
  // 指标计算窗口
  windows: {
    realtime: 5 * 60 * 1000, // 实时：5分钟
    hourly: 60 * 60 * 1000, // 小时级
    daily: 24 * 60 * 60 * 1000, // 天级
  },
  // 目标指标
  targets: {
    ctr: 0.1, // 目标CTR：10%
    engagement_rate: 0.05, // 目标互动率：5%
    avg_read_ratio: 0.7, // 目标完读率：70%
    user_coverage: 0.8, // 目标用户覆盖：80%
    item_coverage: 0.6, // 目标物品覆盖：60%
  },
}

/**
 * API配置
 */
export const API_CONFIG = {
  // 请求限制
  rate_limits: {
    per_user_per_minute: 60, // 每用户每分钟60次
    per_ip_per_minute: 100, // 每IP每分钟100次
  },
  // 超时配置
  timeouts: {
    recommendation: 1000, // 推荐API：1秒
    user_action: 500, // 用户行为：500毫秒
    batch_sync: 5000, // 批量同步：5秒
  },
  // 批处理配置
  batch: {
    max_size: 100, // 最大批次大小
    flush_interval: 1000, // 刷新间隔：1秒
  },
}

/**
 * 获取环境相关的配置
 */
export function getConfig(): RecommendationConfig {
  const env = process.env.NODE_ENV
  
  // 可以根据环境返回不同的配置
  if (env === 'production') {
    return {
      ...DEFAULT_RECOMMENDATION_CONFIG,
      // 生产环境可能需要调整的配置
      rules: {
        ...DEFAULT_RECOMMENDATION_CONFIG.rules,
        min_quality_score: 0.7, // 生产环境提高质量要求
      },
    }
  }
  
  return DEFAULT_RECOMMENDATION_CONFIG
}