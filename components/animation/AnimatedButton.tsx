/** * 动画按钮组件 * 提供丰富的按钮交互动效 */ 'use client' import { motion, Variants }
from 'framer-motion' 

import { ReactNode, MouseEvent }
from 'react' 

import { buttonVariants }
from '@/lib/animation/variants' 

import { duration }
from '@/lib/animation/constants' interface AnimatedButtonProps { children: ReactNode onClick?: (e: MouseEvent<HTMLButtonElement>) => void variant?: 'scale' | 'glow' | 'slide' | 'ripple' className?: string disabled?: boolean type?: 'button' | 'submit' | 'reset' }
// 涟漪效果组件 function Ripple({ x, y }: { x: number; y: number }) { return ( <motion.span className="absolute rounded-full bg-white/30 pointer-events-none" style={{ left: x - 10, top: y - 10, width: 20, height: 20, }
}
initial={{ scale: 0, opacity: 1 }
}
animate={{ scale: 4, opacity: 0 }
}
transition={{ duration: 0.6, ease: "easeOut" }
}
/> ) }
export function AnimatedButton({ children, onClick, variant = 'scale', className = '', disabled = false, type = 'button', }: AnimatedButtonProps) { const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]) const handleClick = (e: MouseEvent<HTMLButtonElement>) => { if (disabled) return // 涟漪效果 if (variant === 'ripple') { const rect = e.currentTarget.getBoundingClientRect() const x = e.clientX - rect.left const y = e.clientY - rect.top const id = Date.now() setRipples([...ripples, { x, y, id }
]) setTimeout(() => { setRipples(prev => prev.filter(ripple => ripple.id !== id)) }, 600) }
onClick?.(e) }
// 基础按钮样式 const baseClass = `relative overflow-hidden ${className}` // 缩放效果 if (variant === 'scale') { return ( <motion.button type={type}
className={baseClass}
onClick={handleClick}
disabled={disabled}
variants={buttonVariants}
initial="rest" whileHover={!disabled ? "hover" : undefined}
whileTap={!disabled ? "tap" : undefined} > {children} </motion.button> ) }
// 发光效果 if (variant === 'glow') { return ( <motion.button type={type}
className={baseClass}
onClick={handleClick}
disabled={disabled}
whileHover={!disabled ? { boxShadow: [ "0 0 0 0 rgba(59, 130, 246, 0)", "0 0 0 8px rgba(59, 130, 246, 0.1)", "0 0 0 16px rgba(59, 130, 246, 0)", ], } : undefined}
transition={{ duration: 0.8, repeat: Infinity, }
}> {children} </motion.button> ) }
// 滑动效果 if (variant === 'slide') { return ( <motion.button type={type}
className={`${baseClass}
group`}
onClick={handleClick}
disabled={disabled} >
<motion.span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100" initial={{ x: '-100%' }
}
whileHover={{ x: 0 }
}
transition={{ duration: duration.normal }
}
/>
<span className="relative z-10">{children}</span> </motion.button> ) }
// 涟漪效果 if (variant === 'ripple') { return ( <motion.button type={type}
className={baseClass}
onClick={handleClick}
disabled={disabled}
whileTap={!disabled ? { scale: 0.98 } : undefined} > {children}
<AnimatePresence> {ripples.map(ripple => ( <Ripple key={ripple.id}
x={ripple.x}
y={ripple.y}
/> ))} </AnimatePresence> </motion.button> ) }
return ( <button type={type}
className={className}
onClick={handleClick}
disabled={disabled} > {children} </button> ) }
// 导入必要的 hooks import { useState }
from 'react' 

import { AnimatePresence }
from 'framer-motion'