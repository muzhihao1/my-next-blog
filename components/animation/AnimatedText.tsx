/** * 动画文本组件 * 提供各种文本动画效果 */ 'use client' import { motion, Variants }
from 'framer-motion' 

import { ReactNode }
from 'react' 

import { duration, easing }
from '@/lib/animation/constants' interface AnimatedTextProps { children: string className?: string type?: 'fadeIn' | 'typewriter' | 'slideIn' | 'wordByWord' | 'letterByLetter' delay?: number stagger?: number as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' }
// 打字机效果变体 const typewriterVariants: Variants = { hidden: { opacity: 0 }, visible: (i: number) => ({ opacity: 1, transition: { delay: i * 0.03, }, }), }
// 单词动画变体 const wordVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: duration.normal, ease: easing.easeOut, }, }), }
// 字母动画变体 const letterVariants: Variants = { hidden: { opacity: 0, y: 50, rotateZ: -10 }, visible: (i: number) => ({ opacity: 1, y: 0, rotateZ: 0, transition: { delay: i * 0.02, duration: duration.normal, type: "spring", stiffness: 100, }, }), }
export function AnimatedText({ children, className = '', type = 'fadeIn', delay = 0, stagger = 0.05, as = 'p', }: AnimatedTextProps) { const Component = motion[as] // 简单淡入效果 if (type === 'fadeIn') { return ( <Component initial={{ opacity: 0 }
}
animate={{ opacity: 1 }
}
transition={{ delay, duration: duration.normal }
}
className={className} > {children} </Component> ) }
// 滑入效果 if (type === 'slideIn') { return ( <Component initial={{ opacity: 0, x: -50 }
}
animate={{ opacity: 1, x: 0 }
}
transition={{ delay, duration: duration.normal, ease: easing.easeOut }
}
className={className} > {children} </Component> ) }
// 打字机效果 if (type === 'typewriter') { return ( <Component className={className}> {children.split('').map((char, i) => ( <motion.span key={`${char}-${i}`}
initial="hidden" animate="visible" custom={i + delay * 30}
variants={typewriterVariants} > {char === ' ' ? '\u00A0' : char} </motion.span> ))} </Component> ) }
// 逐词动画 if (type === 'wordByWord') { const words = children.split(' ') return ( <Component className={className}> {words.map((word, i) => ( <motion.span key={`${word}-${i}`}
initial="hidden" animate="visible" custom={i + delay * 20}
variants={wordVariants}
style={{ display: 'inline-block', marginRight: '0.25em' }
}> {word} </motion.span> ))} </Component> ) }
// 逐字母动画 if (type === 'letterByLetter') { return ( <Component className={className}> {children.split('').map((char, i) => ( <motion.span key={`${char}-${i}`}
initial="hidden" animate="visible" custom={i + delay * 50}
variants={letterVariants}
style={{ display: 'inline-block' }
}> {char === ' ' ? '\u00A0' : char} </motion.span> ))} </Component> ) }
return <Component className={className}>{children}</Component> }