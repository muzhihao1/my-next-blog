/** * 动画系统常量定义 * 统一管理所有动画参数，确保一致性 */ // 动画持续时间 export const duration = { instant: 0.1, fast: 0.2, normal: 0.3, slow: 0.5, slower: 0.8, slowest: 1.2, }
as const // 动画缓动函数 export const easing = { // 标准缓动 linear: [0, 0, 1, 1], easeIn: [0.4, 0, 1, 1], easeOut: [0, 0, 0.2, 1], easeInOut: [0.4, 0, 0.2, 1], // 弹性缓动 spring: { type: "spring", stiffness: 500, damping: 30, }, springBounce: { type: "spring", stiffness: 400, damping: 10, }, springSmooth: { type: "spring", stiffness: 100, damping: 20, }, }
as const // 动画延迟 export const delay = { none: 0, short: 0.1, medium: 0.2, long: 0.3, stagger: 0.05, // 用于列表动画 }
as const // 页面过渡动画 export const pageTransition = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: duration.normal, ease: easing.easeInOut, }, }
as const // 淡入淡出动画 export const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: duration.normal, }, }
as const // 缩放动画 export const scale = { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, transition: { duration: duration.fast, }, }
as const // 滑入动画方向 export const slideDirection = { up: { y: 50 }, down: { y: -50 }, left: { x: 50 }, right: { x: -50 }, }
as const // 列表动画 export const listAnimation = { container: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: delay.stagger, }, }, }, item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: duration.normal, }, }, }, }
as const // 悬停动画 export const hover = { scale: { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, transition: { duration: duration.fast, }, }, lift: { whileHover: { y: -5 }, transition: { duration: duration.fast, }, }, glow: { whileHover: { boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)", }, transition: { duration: duration.fast, }, }, }
as const // 骨架屏动画 export const skeleton = { animate: { backgroundPosition: ["200% 0", "-200% 0"], }, transition: { duration: 1.5, repeat: Infinity, ease: "linear", }, }
as const // 加载动画 export const loading = { spin: { animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear", }, }, pulse: { animate: { scale: [1, 1.2, 1]
}, transition: { duration: 1, repeat: Infinity, ease: "easeInOut", }, }, dots: { animate: { opacity: [0, 1, 0]
}, transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut", }, }, }
as const // 性能优化设置 export const performance = { // 减少重绘 layoutId: true, // GPU 加速 style: { willChange: "transform", }, // 降低移动端动画复杂度 reducedMotion: { opacity: 1, scale: 1, y: 0, x: 0, transition: { duration: 0, }, }, }
as const
