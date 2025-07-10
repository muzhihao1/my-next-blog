/** * 动画容器组件 * 提供通用的动画包装功能 */ 'use client' import { motion, HTMLMotionProps }
from 'framer-motion' 

import { ReactNode }
from 'react' 

import { fadeInVariants, fadeInUpVariants, scaleInVariants, slideInVariants }
from '@/lib/animation/variants' 

import { useScrollAnimation, useReducedMotionPreference }
from '@/lib/animation/hooks' interface AnimatedContainerProps extends Omit<HTMLMotionProps<"div">, 'children'> { children: ReactNode animation?: 'fadeIn' | 'fadeInUp' | 'scaleIn' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' delay?: number duration?: number triggerOnce?: boolean threshold?: number className?: string as?: keyof JSX.IntrinsicElements }
export function AnimatedContainer({ children, animation = 'fadeInUp', delay = 0, duration, triggerOnce = true, threshold = 0.1, className, as = 'div', ...props }: AnimatedContainerProps) { const { ref, controls } = useScrollAnimation(threshold, triggerOnce) const { shouldReduceMotion } = useReducedMotionPreference() const Component = motion[as as keyof typeof motion]
as typeof motion.div // 如果用户偏好减少动画，直接返回内容 if (shouldReduceMotion) { return ( <div className={className}> {children} </div> ) }
// 选择动画变体 const getVariants = () => { switch (animation) { case 'fadeIn': return fadeInVariants case 'fadeInUp': return fadeInUpVariants case 'scaleIn': return scaleInVariants case 'slideLeft': return slideInVariants('left') case 'slideRight': return slideInVariants('right') case 'slideUp': return slideInVariants('up') case 'slideDown': return slideInVariants('down') default: return fadeInUpVariants }
}
return ( <Component ref={ref}
initial="hidden" animate={controls}
variants={getVariants()}
className={className}
custom={{ delay, duration }
}{...props} > {children} </Component> ) }