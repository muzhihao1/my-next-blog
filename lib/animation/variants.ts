/** * 动画变体集合 * 定义可复用的动画效果 */
import { Variants } from "framer-motion";
import { duration, easing, delay, slideDirection } from "./constants";
// 淡入动画变体 export const fadeInVariants: Variants = { hidden: { opacity: 0, }, visible: { opacity: 1, transition: { duration: duration.normal, ease: easing.easeOut, }, }, }
// 从下往上淡入 export const fadeInUpVariants: Variants = { hidden: { opacity: 0, y: 30, }, visible: { opacity: 1, y: 0, transition: { duration: duration.normal, ease: easing.easeOut, }, }, }
// 从上往下淡入 export const fadeInDownVariants: Variants = { hidden: { opacity: 0, y: -30, }, visible: { opacity: 1, y: 0, transition: { duration: duration.normal, ease: easing.easeOut, }, }, }
// 缩放淡入 export const scaleInVariants: Variants = { hidden: { opacity: 0, scale: 0.8, }, visible: { opacity: 1, scale: 1, transition: { duration: duration.normal, ease: easing.easeOut, }, }, }
// 弹性缩放 export const bounceInVariants: Variants = { hidden: { opacity: 0, scale: 0, }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 500, damping: 15, }, }, }
// 滑入动画（可配置方向） export const slideInVariants = (direction: keyof typeof slideDirection = 'up'): Variants => ({ hidden: { opacity: 0, ...slideDirection[direction], }, visible: { opacity: 1, x: 0, y: 0, transition: { duration: duration.normal, ease: easing.easeOut, }, }, }) // 交错列表动画 export const staggerContainerVariants: Variants = { hidden: { opacity: 0, }, visible: { opacity: 1, transition: { staggerChildren: delay.stagger, delayChildren: delay.short, }, }, }
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: easing.easeOut },
  },
};
// 卡片悬停效果 export const cardHoverVariants: Variants = { rest: { scale: 1, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", }, hover: { scale: 1.02, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)", transition: { duration: duration.fast, ease: easing.easeOut, }, }, tap: { scale: 0.98, transition: { duration: duration.instant, }, }, }
// 按钮动画效果 export const buttonVariants: Variants = { rest: { scale: 1, }, hover: { scale: 1.05, transition: { duration: duration.fast, ease: easing.easeOut, }, }, tap: { scale: 0.95, transition: { duration: duration.instant, }, }, }
// 图片加载动画 export const imageLoadVariants: Variants = { loading: { opacity: 0, scale: 0.95, }, loaded: { opacity: 1, scale: 1, transition: { duration: duration.slow, ease: easing.easeOut, }, }, }
// 骨架屏闪烁动画 export const skeletonVariants: Variants = { animate: { backgroundPosition: ["200% 0", "-200% 0"], transition: { duration: 1.5, repeat: Infinity, ease: "linear", }, }, }
// 错误抖动动画 export const shakeVariants: Variants = { shake: { x: [-10, 10, -10, 10, 0], transition: { duration: duration.slow, }, }, }
// 成功动画 export const successVariants: Variants = { hidden: { opacity: 0, scale: 0, rotate: 180, }, visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 500, damping: 15, }, }, }
// 标签云动画 export const tagCloudVariants: Variants = { hidden: { opacity: 0, scale: 0, }, visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.05, duration: duration.normal, ease: easing.easeOut, }, }), }
// 导航菜单动画 export const menuVariants: Variants = { closed: { opacity: 0, height: 0, transition: { duration: duration.fast, ease: easing.easeInOut, }, }, open: { opacity: 1, height: "auto", transition: { duration: duration.normal, ease: easing.easeInOut, }, }, }
// 模态框背景动画 export const overlayVariants: Variants = { hidden: { opacity: 0, }, visible: { opacity: 1, transition: { duration: duration.fast, }, }, }
// 模态框内容动画 export const modalVariants: Variants = { hidden: { opacity: 0, scale: 0.9, y: 20, }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20, }, }, }
// 工具提示动画 export const tooltipVariants: Variants = { hidden: { opacity: 0, scale: 0.8, y: 10, }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.fast, ease: easing.easeOut, }, }, }
// 侧边栏滑入动画 export const sidebarVariants: Variants = { hidden: { x: "-100%", }, visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30, }, }, }
// 进度条动画 export const progressVariants: Variants = { initial: { width: 0, }, animate: (progress: number) => ({ width: `${progress}%`, transition: { duration: duration.slow, ease: easing.easeOut, }, }), }
