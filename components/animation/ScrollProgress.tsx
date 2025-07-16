/** * 滚动进度指示器 * 显示页面滚动进度 */ 'use client' import { motion, useScroll, useSpring }
from 'framer-motion' 

import { useEffect, useState }
from 'react' interface ScrollProgressProps { className?: string position?: 'top' | 'bottom' height?: number color?: string }
export function ScrollProgress({ className = '', position = 'top', height = 3, color = 'bg-blue-500', }: ScrollProgressProps) { const { scrollYProgress } = useScroll() const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001, }) const positionClasses = position === 'top' ? 'top-0' : 'bottom-0' return ( <motion.div className={`fixed left-0 right-0 z-50 ${positionClasses}
${className}`}
style={{ height: `${height}
px`, background: 'rgba(0, 0, 0, 0.05)', }
}>
<motion.div className={`h-full ${color}
origin-left`}
style={{ scaleX }
}
/> </motion.div> ) }
// 阅读进度环 export function ReadingProgressRing({ size = 60, strokeWidth = 4, className, }: { size?: number strokeWidth?: number className?: string }) { const { scrollYProgress } = useScroll() const [progress, setProgress] = useState(0) useEffect(() => { const unsubscribe = scrollYProgress.onChange(v => { setProgress(Math.round(v * 100)) }) return unsubscribe }, [scrollYProgress]) const radius = (size - strokeWidth) / 2 const circumference = radius * 2 * Math.PI const offset = circumference - (progress / 100) * circumference return ( <div className={`fixed bottom-8 right-8 ${className}`}>
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
strokeDashoffset={offset}
className="text-blue-500" strokeLinecap="round" /> </svg>
<div className="absolute inset-0 flex items-center justify-center">
<span className="text-sm font-medium">{progress}%</span> </div> </div> ) }
// 章节进度指示器 export function SectionProgress({ sections, className, }: { sections: Array<{ id: string; title: string }> className?: string }) { const [activeSection, setActiveSection] = useState('') const { scrollY } = useScroll() useEffect(() => { const handleScroll = () => { const sectionElements = sections.map(s => document.getElementById(s.id) ).filter(Boolean) const scrollPosition = window.scrollY + 100 for (let i = sectionElements.length - 1; i >= 0; i--) { const element = sectionElements[i]
if (element && element.offsetTop <= scrollPosition) { setActiveSection(sections[i].id) break }
} }
const unsubscribe = scrollY.onChange(handleScroll) handleScroll() return unsubscribe }, [sections, scrollY]) return ( <div className={`fixed right-4 top-1/2 -translate-y-1/2 space-y-2 ${className}`}> {sections.map((section) => { const isActive = section.id === activeSection return ( <motion.a key={section.id}
href={`#${section.id}`}
className="block group" whileHover={{ scale: 1.1 }
}
whileTap={{ scale: 0.95 }
}>
<div className="flex items-center space-x-3">
<motion.div className="w-2 h-2 rounded-full bg-gray-300" animate={{ scale: isActive ? 1.5 : 1, backgroundColor: isActive ? '#3B82F6' : undefined, }
}
transition={{ duration: 0.2 }
}
/>
<span className={`text-sm opacity-0 group-hover:opacity-100 transition-opacity ${ isActive ? 'text-blue-500 font-medium' : 'text-gray-600' }`} > {section.title} </span> </div> </motion.a> ) })} </div> ) }