/** * 骨架屏动画组件 * 用于加载状态的占位效果 */ 'use client' import { motion }
from 'framer-motion' 

import { cn }
from '@/lib/utils' interface SkeletonProps { className?: string variant?: 'text' | 'circular' | 'rectangular' | 'rounded' width?: string | number height?: string | number animation?: boolean }
export function Skeleton({ className, variant = 'text', width, height, animation = true, }: SkeletonProps) { const baseClasses = cn( "bg-gray-200", { "rounded-md": variant === 'text' || variant === 'rectangular', "rounded-full": variant === 'circular', "rounded-lg": variant === 'rounded', "h-4": variant === 'text' && !height, "aspect-square": variant === 'circular' && !height, }, className ) const style = { width: width || (variant === 'circular' ? height : '100%'), height: height || (variant === 'circular' ? width : undefined), }
if (!animation) { return <div className={baseClasses}
style={style}
/> }
return ( <motion.div className={`${baseClasses}
relative overflow-hidden`}
style={style} >
<motion.div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ translateX: ['100%', '-100%'], }
}
transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "linear", }
}
/> </motion.div> ) }
// 预设的骨架屏组合 export function SkeletonText({ lines = 3 }: { lines?: number }) { return ( <div className="space-y-2"> {Array.from({ length: lines }).map((_, i) => ( <Skeleton key={i}
variant="text" width={i === lines - 1 ? "80%" : "100%"}
/> ))} </div> ) }
export function SkeletonCard() { return ( <div className="p-4 space-y-3">
<Skeleton variant="rectangular" height={200}
/>
<Skeleton variant="text" />
<Skeleton variant="text" />
<Skeleton variant="text" width="60%" /> </div> ) }
export function SkeletonAvatar({ size = 40 }: { size?: number }) { return <Skeleton variant="circular" width={size}
height={size}
/> }
export function SkeletonListItem() { return ( <div className="flex items-center space-x-3">
<SkeletonAvatar />
<div className="flex-1 space-y-2">
<Skeleton variant="text" width="40%" />
<Skeleton variant="text" width="60%" /> </div> </div> ) }