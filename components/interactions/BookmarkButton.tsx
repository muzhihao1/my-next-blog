'use client' import { useState }
from 'react' 

import { Bookmark }
from 'lucide-react' 

import { cn }
from '@/lib/utils' interface BookmarkButtonProps { isBookmarked: boolean bookmarks: number onToggle: () => void | Promise<void> disabled?: boolean size?: 'sm' | 'md' | 'lg' showCount?: boolean className?: string }
export function BookmarkButton({ isBookmarked, bookmarks, onToggle, disabled = false, size = 'md', showCount = true, className }: BookmarkButtonProps) { const [isAnimating, setIsAnimating] = useState(false) const handleClick = async () => { if (disabled || isAnimating) return setIsAnimating(true) await onToggle() // 动画持续时间 setTimeout(() => setIsAnimating(false), 600) }
const sizeClasses = { sm: { button: 'px-2 py-1 text-xs', icon: 'h-3 w-3', gap: 'gap-1' }, md: { button: 'px-3 py-1.5 text-sm', icon: 'h-4 w-4', gap: 'gap-2' }, lg: { button: 'px-4 py-2 text-base', icon: 'h-5 w-5', gap: 'gap-2' }
}
const { button, icon, gap } = sizeClasses[size]
return ( <button onClick={handleClick}
disabled={disabled}
className={cn( "relative flex items-center rounded-full transition-all", "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed", button, gap, isBookmarked ? "bg-blue-100/30 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700", className )}
aria-label={isBookmarked ? "取消收藏" : "收藏"} >
<Bookmark className={cn( icon, "transition-all duration-300", isBookmarked && "fill-current", isAnimating && "animate-bookmark-bounce" )}
/> {showCount && ( <span className="font-medium tabular-nums"> {bookmarks.toLocaleString()} </span> )} {/* 点击动画效果 */} {isAnimating && ( <span className="absolute inset-0 rounded-full animate-ping-once bg-blue-400/20" /> )} </button> ) }