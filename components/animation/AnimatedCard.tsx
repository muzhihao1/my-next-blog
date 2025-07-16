/** * 动画卡片组件 * 提供卡片悬停、点击等交互效果 */ 'use client' import { motion, useMotionValue, useSpring, useTransform }
from 'framer-motion' 

import { ReactNode, MouseEvent }
from 'react' 

import { cardHoverVariants }
from '@/lib/animation/variants' interface AnimatedCardProps { children: ReactNode className?: string variant?: 'lift' | 'tilt' | 'glow' | 'morph' onClick?: () => void }
export function AnimatedCard({ children, className = '', variant = 'lift', onClick, }: AnimatedCardProps) { const x = useMotionValue(0) const y = useMotionValue(0) const mouseXSpring = useSpring(x) const mouseYSpring = useSpring(y) const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]) const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]) const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => { if (variant !== 'tilt') return const rect = e.currentTarget.getBoundingClientRect() const width = rect.width const height = rect.height const mouseX = e.clientX - rect.left const mouseY = e.clientY - rect.top const xPct = mouseX / width - 0.5 const yPct = mouseY / height - 0.5 x.set(xPct) y.set(yPct) }
const handleMouseLeave = () => { if (variant !== 'tilt') return x.set(0) y.set(0) }
// 基础卡片样式 const baseClass = `cursor-pointer ${className}` // 上浮效果 if (variant === 'lift') { return ( <motion.div className={baseClass}
onClick={onClick}
variants={cardHoverVariants}
initial="rest" whileHover="hover" whileTap="tap" > {children} </motion.div> ) }
// 倾斜效果 if (variant === 'tilt') { return ( <motion.div className={baseClass}
onClick={onClick}
onMouseMove={handleMouseMove}
onMouseLeave={handleMouseLeave}
style={{ rotateX, rotateY, transformStyle: "preserve-3d", }
}
whileHover={{ scale: 1.02 }
}
whileTap={{ scale: 0.98 }
}>
<div style={{ transform: "translateZ(50px)" }
}> {children} </div> </motion.div> ) }
// 发光效果 if (variant === 'glow') { return ( <motion.div className={`${baseClass}
relative`}
onClick={onClick}
whileHover={{ scale: 1.02 }
}
whileTap={{ scale: 0.98 }
}>
<motion.div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl" initial={{ opacity: 0 }
}
whileHover={{ opacity: 1 }
}
transition={{ duration: 0.3 }
}
/>
<div className="relative z-10"> {children} </div> </motion.div> ) }
// 变形效果 if (variant === 'morph') { return ( <motion.div className={baseClass}
onClick={onClick}
whileHover={{ borderRadius: "24px", scale: 1.05, }
}
transition={{ type: "spring", stiffness: 300, damping: 20, }
}> {children} </motion.div> ) }
return ( <div className={className}
onClick={onClick}> {children} </div> ) }