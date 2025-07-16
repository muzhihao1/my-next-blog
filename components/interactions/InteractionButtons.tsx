'use client' import { useState, useEffect }
from 'react' 

import { Heart, Bookmark, Share2 }
from 'lucide-react' 

import { cn }
from '@/lib/utils' 

import { useAuth }
from '@/contexts/AuthContext' 

import { useInteractions }
from '@/hooks/useInteractions' 

import type { ContentType }
from '@/types/supabase' interface InteractionButtonsProps { contentId: string contentType: ContentType initialLikes?: number initialBookmarks?: number className?: string }
export function InteractionButtons({ contentId, contentType, initialLikes = 0, initialBookmarks = 0, className }: InteractionButtonsProps) { const { user, signIn } = useAuth() const { likes, bookmarks, isLiked, isBookmarked, isLoading, toggleLike, toggleBookmark } = useInteractions(contentId, contentType, { initialLikes, initialBookmarks }) const handleLike = async () => { if (!user) { // 未登录，提示用户登录 if (confirm('请先登录后再点赞，是否立即登录？')) { await signIn() }
return }
await toggleLike() }
const handleBookmark = async () => { if (!user) { // 未登录，提示用户登录 if (confirm('请先登录后再收藏，是否立即登录？')) { await signIn() }
return }
await toggleBookmark() }
const handleShare = async () => { if (navigator.share) { try { await navigator.share({ title: document.title, url: window.location.href }) }
catch (error) { if ((error as Error).name !== 'AbortError') { console.error('Failed to share:', error) }
} }
else { // 复制链接到剪贴板 try { await navigator.clipboard.writeText(window.location.href) // TODO: 显示复制成功提示 alert('链接已复制到剪贴板') }
catch (error) { console.error('Failed to copy link:', error) }
} }
if (isLoading) { return ( <div className={cn("flex items-center gap-4", className)}>
<div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
<div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
<div className="h-8 w-8 bg-gray-200 rounded animate-pulse" /> </div> ) }
return ( <div className={cn("flex items-center gap-4", className)}> {/* 点赞按钮 */}
<button onClick={handleLike}
className={cn( "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all", "hover:scale-105 active:scale-95", isLiked ? "bg-red-100/30 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700" )}
aria-label={isLiked ? "取消点赞" : "点赞"} >
<Heart className={cn( "h-4 w-4 transition-all", isLiked && "fill-current" )}
/>
<span className="text-sm font-medium">{likes}</span> </button> {/* 收藏按钮 */}
<button onClick={handleBookmark}
className={cn( "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all", "hover:scale-105 active:scale-95", isBookmarked ? "bg-blue-100/30 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700" )}
aria-label={isBookmarked ? "取消收藏" : "收藏"} >
<Bookmark className={cn( "h-4 w-4 transition-all", isBookmarked && "fill-current" )}
/>
<span className="text-sm font-medium">{bookmarks}</span> </button> {/* 分享按钮 */}
<button onClick={handleShare}
className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700 transition-all hover:scale-105 active:scale-95" aria-label="分享" >
<Share2 className="h-4 w-4" /> </button> </div> ) }