/** * 加载动画组件 * 提供多种加载指示器样式 */ 'use client' import { motion }
from 'framer-motion' 

import { cn }
from '@/lib/utils' 

import { loading }
from '@/lib/animation/constants' interface LoadingSpinnerProps { size?: 'sm' | 'md' | 'lg' variant?: 'spin' | 'dots' | 'pulse' | 'bars' className?: string color?: string }
const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', }
export function LoadingSpinner({ size = 'md', variant = 'spin', className, color = 'currentColor', }: LoadingSpinnerProps) { // 旋转加载 if (variant === 'spin') { return ( <motion.div className={cn(sizes[size], className)}
animate={loading.spin.animate}
transition={loading.spin.transition} >
<svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
<circle className="opacity-25" cx="12" cy="12" r="10" stroke={color}
strokeWidth="4" />
<path className="opacity-75" fill={color}
d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /> </svg> </motion.div> ) }
// 点状加载 if (variant === 'dots') { return ( <div className={cn("flex space-x-1", className)}> {[0, 1, 2].map((i) => ( <motion.div key={i}
className={cn( "rounded-full bg-current", size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3' )}
animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5], }
}
transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, }
}
style={{ color }
}
/> ))} </div> ) }
// 脉冲加载 if (variant === 'pulse') { return ( <motion.div className={cn(sizes[size], "rounded-full bg-current", className)}
animate={loading.pulse.animate}
transition={loading.pulse.transition}
style={{ color }
}
/> ) }
// 条状加载 if (variant === 'bars') { return ( <div className={cn("flex space-x-1", className)}> {[0, 1, 2, 3].map((i) => ( <motion.div key={i}
className={cn( "bg-current", size === 'sm' ? 'w-1 h-4' : size === 'md' ? 'w-1.5 h-6' : 'w-2 h-8' )}
animate={{ scaleY: [0.5, 1, 0.5], }
}
transition={{ duration: 1, repeat: Infinity, delay: i * 0.1, }
}
style={{ color, originY: 0.5 }
}
/> ))} </div> ) }
return null }
// 全屏加载遮罩 export function LoadingOverlay({ isLoading, text = "加载中..." }: { isLoading: boolean text?: string }) { return ( <AnimatePresence> {isLoading && ( <motion.div initial={{ opacity: 0 }
}
animate={{ opacity: 1 }
}
exit={{ opacity: 0 }
}
className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" >
<motion.div initial={{ scale: 0.9, opacity: 0 }
}
animate={{ scale: 1, opacity: 1 }
}
exit={{ scale: 0.9, opacity: 0 }
}
className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4" >
<LoadingSpinner size="lg" variant="spin" />
<p className="text-gray-600">{text}</p> </motion.div> </motion.div> )} </AnimatePresence> ) }
// 导入必要的模块 import { AnimatePresence }
from 'framer-motion'