/** * 动画系统主入口 * 导出所有动画相关的组件、hooks 和工具 */ // 导出常量 export * from './constants' // 导出变体 export * from './variants' // 导出 Hooks export * from './hooks' // 导出性能优化工具 export * from './performance' // 导出动画组件 export { AnimatedContainer }
from '@/components/animation/AnimatedContainer' export { AnimatedText }
from '@/components/animation/AnimatedText' export { AnimatedButton }
from '@/components/animation/AnimatedButton' export { AnimatedCard }
from '@/components/animation/AnimatedCard' export { PageTransition, TypedPageTransition }
from '@/components/animation/PageTransition' export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonListItem }
from '@/components/animation/Skeleton' export { LoadingSpinner, LoadingOverlay }
from '@/components/animation/LoadingSpinner' export { ProgressBar, CircularProgress, SegmentedProgress, StepProgress }
from '@/components/animation/ProgressBar' export { ScrollProgress, ReadingProgressRing, SectionProgress }
from '@/components/animation/ScrollProgress' // 全局动画配置 export const animationConfig = { // 是否启用动画 enabled: true, // 默认动画持续时间 defaultDuration: 0.3, // 默认缓动函数 defaultEasing: 'easeOut', // 是否遵循用户的减少动画偏好 respectReducedMotion: true, // 移动端动画简化 simplifyOnMobile: true, // 性能阈值 performanceThreshold: { fps: 50, animationCount: 10, }, }
// 动画预设 export const animationPresets = { // 页面进入 pageEnter: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, }, // 元素淡入 fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }, }, // 卡片悬停 cardHover: { whileHover: { y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }, transition: { duration: 0.2 }, }, // 按钮点击 buttonTap: { whileTap: { scale: 0.95 }, transition: { duration: 0.1 }, }, // 列表项进入 listItem: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.2 }, }, }
