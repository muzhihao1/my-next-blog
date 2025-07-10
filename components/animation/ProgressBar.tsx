/** * 进度条动画组件 * 支持多种样式和动画效果 */ 'use client' import { motion }
from 'framer-motion' 

import { useEffect, useState }
from 'react' 

import { cn }
from '@/lib/utils' 

import { progressVariants }
from '@/lib/animation/variants' interface ProgressBarProps { value: number // 0-100 className?: string variant?: 'default' | 'gradient' | 'striped' | 'glow' size?: 'sm' | 'md' | 'lg' showLabel?: boolean animate?: boolean }
const sizes = { sm: 'h-1', md: 'h-2', lg: 'h-4', }
export function ProgressBar({ value, className, variant = 'default', size = 'md', showLabel = false, animate = true, }: ProgressBarProps) { const [displayValue, setDisplayValue] = useState(animate ? 0 : value) useEffect(() => { if (animate) { const timer = setTimeout(() => setDisplayValue(value), 100) return () => clearTimeout(timer) }
else { setDisplayValue(value) }
}, [value, animate]) const baseClasses = cn( "relative w-full overflow-hidden rounded-full bg-gray-200", sizes[size], className ) const progressClasses = cn( "h-full rounded-full transition-all duration-500", { "bg-blue-500": variant === 'default', "bg-gradient-to-r from-blue-500 to-purple-500": variant === 'gradient', "bg-blue-500 bg-striped animate-striped": variant === 'striped', "bg-blue-500 shadow-glow": variant === 'glow', } ) return ( <div className="w-full">
<div className={baseClasses}>
<motion.div className={progressClasses}
initial={{ width: 0 }
}
animate={{ width: `${displayValue}%` }
}
transition={{ duration: animate ? 0.5 : 0, ease: "easeOut", }
}
/> </div> {showLabel && ( <div className="mt-1 text-sm text-gray-600"> {displayValue}% </div> )} </div> ) }
// 圆形进度条 export function CircularProgress({ value, size = 120, strokeWidth = 8, className, showLabel = true, }: { value: number size?: number strokeWidth?: number className?: string showLabel?: boolean }) { const radius = (size - strokeWidth) / 2 const circumference = radius * 2 * Math.PI const offset = circumference - (value / 100) * circumference return ( <div className={cn("relative inline-flex", className)}>
<svg width={size}
height={size}
className="transform -rotate-90">
<circle cx={size / 2}
cy={size / 2}
r={radius}
stroke="currentColor" strokeWidth={strokeWidth}
fill="none" className="text-gray-200" />
<motion.circle cx={size / 2}
cy={size / 2}
r={radius}
stroke="currentColor" strokeWidth={strokeWidth}
fill="none" strokeDasharray={circumference}
initial={{ strokeDashoffset: circumference }
}
animate={{ strokeDashoffset: offset }
}
transition={{ duration: 0.5, ease: "easeOut" }
}
className="text-blue-500" strokeLinecap="round" /> </svg> {showLabel && ( <div className="absolute inset-0 flex items-center justify-center">
<span className="text-lg font-semibold">{value}%</span> </div> )} </div> ) }
// 分段进度条 export function SegmentedProgress({ segments, className, }: { segments: Array<{ value: number; color: string; label?: string }> className?: string }) { return ( <div className={cn("space-y-2", className)}> {segments.map((segment, index) => ( <div key={index}
className="space-y-1"> {segment.label && ( <div className="flex justify-between text-sm">
<span>{segment.label}</span>
<span>{segment.value}%</span> </div> )}
<div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
<motion.div className="h-full rounded-full" style={{ backgroundColor: segment.color }
}
initial={{ width: 0 }
}
animate={{ width: `${segment.value}%` }
}
transition={{ duration: 0.5, delay: index * 0.1 }
}
/> </div> </div> ))} </div> ) }
// 步骤进度条 export function StepProgress({ currentStep, totalSteps, labels, className, }: { currentStep: number totalSteps: number labels?: string[]
className?: string }) { return ( <div className={cn("flex items-center justify-between", className)}> {Array.from({ length: totalSteps }).map((_, index) => { const isActive = index < currentStep const isCurrent = index === currentStep - 1 return ( <div key={index}
className="flex items-center flex-1">
<motion.div className={cn( "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold", { "bg-blue-500 text-white": isActive, "bg-gray-200 text-gray-500": !isActive, "ring-2 ring-blue-500 ring-offset-2": isCurrent, } )}
initial={false}
animate={{ scale: isCurrent ? 1.1 : 1, }
}
transition={{ duration: 0.2 }
}> {index + 1} </motion.div> {index < totalSteps - 1 && ( <div className="flex-1 h-1 mx-2 bg-gray-200 relative">
<motion.div className="absolute inset-y-0 left-0 bg-blue-500" initial={{ width: 0 }
}
animate={{ width: isActive ? "100%" : "0%" }
}
transition={{ duration: 0.3, delay: index * 0.1 }
}
/> </div> )} </div> ) })} </div> ) }
// 添加条纹背景样式 const stripedStyles = ` @keyframes striped { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; }
}.bg-striped { background-image: linear-gradient( 45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent ); background-size: 40px 40px; } .animate-striped { animation: striped 1s linear infinite; } .shadow-glow { box-shadow: 0 0 10px currentColor; } ` // 注入样式 if (typeof window !== 'undefined') { const style = document.createElement('style') style.innerHTML = stripedStyles document.head.appendChild(style) }