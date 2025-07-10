/** * 推荐系统主入口 * 导出所有推荐系统功能 */ // 导出类型 export * from './types' // 导出配置 export * from './config' // 导出推荐引擎 export { RecommendationEngine }
from './engine' // 导出用户画像构建器 export { UserProfileBuilder }
from './user-profile' // 导出算法 export { BaseRecommendationAlgorithm }
from './algorithms/base' export { ContentBasedAlgorithm }
from './algorithms/content-based' export { CollaborativeFilteringAlgorithm }
from './algorithms/collaborative' export { TrendingAlgorithm }
from './algorithms/trending' // 便捷方法和单例 import { RecommendationEngine }
from './engine'

import { UserAction, UserActionType }
from "./types";
// 全局推荐引擎实例 let globalEngine: RecommendationEngine | null = null /** * 获取推荐引擎实例 */
export function getRecommendationEngine(): RecommendationEngine { if (!globalEngine) { globalEngine = new RecommendationEngine() }
return globalEngine }
/** * 记录用户行为（便捷方法） */
export async function trackUserAction( userId: string, actionType: UserActionType, targetId: string, value?: number, context?: Record<string, any> ): Promise<void> { const engine = getRecommendationEngine() const action: UserAction = { id: crypto.randomUUID(), user_id: userId, action_type: actionType, target_id: targetId, target_type: 'post', value, context, created_at: new Date(), }
await engine.recordUserAction(action) }
/** * 记录页面浏览 */
export async function trackPageView( userId: string, postId: string, context?: Record<string, any> ): Promise<void> { await trackUserAction(userId, UserActionType.VIEW, postId, undefined, context) }
/** * 记录点赞 */
export async function trackLike( userId: string, postId: string, context?: Record<string, any> ): Promise<void> { await trackUserAction(userId, UserActionType.LIKE, postId, undefined, context) }
/** * 记录收藏 */
export async function trackCollect( userId: string, postId: string, context?: Record<string, any> ): Promise<void> { await trackUserAction(userId, UserActionType.COLLECT, postId, undefined, context) }
/** * 记录评论 */
export async function trackComment( userId: string, postId: string, context?: Record<string, any> ): Promise<void> { await trackUserAction(userId, UserActionType.COMMENT, postId, undefined, context) }
/** * 记录阅读时长 */
export async function trackReadTime( userId: string, postId: string, seconds: number, context?: Record<string, any> ): Promise<void> { await trackUserAction(userId, UserActionType.READ_TIME, postId, seconds, context) }
/** * 清理缓存 */
export function clearRecommendationCache(): void { const engine = getRecommendationEngine() engine.clearCache() }
