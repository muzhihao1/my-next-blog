/** * 页面过渡动画组件 * 实现页面切换时的平滑过渡效果 */ 'use client' import { motion, AnimatePresence }
from 'framer-motion' 

import { ReactNode }
from 'react' 

import { usePathname }
from 'next/navigation' 

import { pageTransition }
from '@/lib/animation/constants' 

import { useReducedMotionPreference }
from '@/lib/animation/hooks' interface PageTransitionProps { children: ReactNode className?: string }
export function PageTransition({ children, className }: PageTransitionProps) { const pathname = usePathname() const { shouldReduceMotion } = useReducedMotionPreference() // 如果用户偏好减少动画，直接返回内容 if (shouldReduceMotion) { return <div className={className}>{children}</div> }
return ( <AnimatePresence mode="wait">
<motion.div key={pathname}
initial={pageTransition.initial}
animate={pageTransition.animate}
exit={pageTransition.exit}
transition={pageTransition.transition}
className={className} > {children} </motion.div> </AnimatePresence> ) }
// 特定类型的页面过渡 interface TypedPageTransitionProps extends PageTransitionProps { type?: 'fade' | 'slide' | 'scale' | 'rotate' }
export function TypedPageTransition({ children, className, type = 'fade' }: TypedPageTransitionProps) { const pathname = usePathname() const { shouldReduceMotion } = useReducedMotionPreference() if (shouldReduceMotion) { return <div className={className}>{children}</div> }
const transitions = { fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, }, slide: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '-100%' }, }, scale: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 1.2, opacity: 0 }, }, rotate: { initial: { rotateY: 90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 }, exit: { rotateY: -90, opacity: 0 }, }, }
return ( <AnimatePresence mode="wait">
<motion.div key={pathname} {...transitions[type]
}
transition={{ duration: 0.3, ease: 'easeInOut', }
}
className={className}
style={{ transformStyle: 'preserve-3d' }
}> {children} </motion.div> </AnimatePresence> ) }