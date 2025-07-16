'use client' import { useState, useEffect, useCallback }
from 'react' 

import { useAuth }
from '@/contexts/AuthContext' 

import type { ContentType }
from '@/types/supabase' interface UseInteractionsOptions { initialLikes?: number initialBookmarks?: number }
interface UseInteractionsReturn { likes: number bookmarks: number isLiked: boolean isBookmarked: boolean isLoading: boolean toggleLike: () => Promise<void> toggleBookmark: () => Promise<void> refetchInteractions: () => Promise<void> }
/** * 管理内容交互状态的自定义Hook * 处理点赞、收藏的状态管理和API调用 */
export function useInteractions( contentId: string, contentType: ContentType, options: UseInteractionsOptions = {} ): UseInteractionsReturn { const { initialLikes = 0, initialBookmarks = 0 } = options const [likes, setLikes] = useState(initialLikes) const [bookmarks, setBookmarks] = useState(initialBookmarks) const [isLiked, setIsLiked] = useState(false) const [isBookmarked, setIsBookmarked] = useState(false) const [isLoading, setIsLoading] = useState(true) // 使用 AuthContext 中的 user const { user } = useAuth() // 获取交互状态 const fetchInteractions = useCallback(async () => { try { setIsLoading(true) // 获取点赞状态 const likesParams = new URLSearchParams({ contentId, contentType, ...(user?.id && { userId: user.id }) }) const likesResponse = await fetch(`/api/likes?${likesParams}`) const likesData = await likesResponse.json() // 获取收藏状态 const bookmarksParams = new URLSearchParams({ contentId, contentType, ...(user?.id && { userId: user.id }) }) const bookmarksResponse = await fetch(`/api/bookmarks?${bookmarksParams}`) const bookmarksData = await bookmarksResponse.json() setLikes(likesData.count || 0) setIsLiked(likesData.isLiked || false) setBookmarks(bookmarksData.count || 0) setIsBookmarked(bookmarksData.isBookmarked || false) }
catch (error) { console.error('获取交互状态失败:', error) }
finally { setIsLoading(false) }
}, [contentId, contentType, user?.id]) // 初始加载和用户变化时重新获取状态 useEffect(() => { fetchInteractions() }, [fetchInteractions]) // 切换点赞状态 const toggleLike = async () => { if (!user) { // TODO: 显示登录提示 alert('请先登录后再点赞') return }
// 乐观更新 const previousLiked = isLiked const previousCount = likes setIsLiked(!isLiked) setLikes(isLiked ? likes - 1 : likes + 1) try { const response = await fetch('/api/likes', { method: isLiked ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contentId, contentType }), ...(isLiked && { method: 'DELETE', body: undefined }) }) // 如果是DELETE请求，需要传递查询参数 if (isLiked) { const params = new URLSearchParams({ contentId, contentType }) const deleteResponse = await fetch(`/api/likes?${params}`, { method: 'DELETE' }) if (!deleteResponse.ok) { throw new Error('取消点赞失败') }
const data = await deleteResponse.json() setLikes(data.count) }
else { if (!response.ok) { throw new Error('点赞失败') }
const data = await response.json() setLikes(data.count) }
}
catch (error) { // 回滚状态 setIsLiked(previousLiked) setLikes(previousCount) console.error('点赞操作失败:', error) }
}
// 切换收藏状态 const toggleBookmark = async () => { if (!user) { // TODO: 显示登录提示 alert('请先登录后再收藏') return }
// 乐观更新 const previousBookmarked = isBookmarked const previousCount = bookmarks setIsBookmarked(!isBookmarked) setBookmarks(isBookmarked ? bookmarks - 1 : bookmarks + 1) try { const response = await fetch('/api/bookmarks', { method: isBookmarked ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contentId, contentType }), ...(isBookmarked && { method: 'DELETE', body: undefined }) }) // 如果是DELETE请求，需要传递查询参数 if (isBookmarked) { const params = new URLSearchParams({ contentId, contentType }) const deleteResponse = await fetch(`/api/bookmarks?${params}`, { method: 'DELETE' }) if (!deleteResponse.ok) { throw new Error('取消收藏失败') }
const data = await deleteResponse.json() setBookmarks(data.count) }
else { if (!response.ok) { throw new Error('收藏失败') }
const data = await response.json() setBookmarks(data.count) }
}
catch (error) { // 回滚状态 setIsBookmarked(previousBookmarked) setBookmarks(previousCount) console.error('收藏操作失败:', error) }
}
return { likes, bookmarks, isLiked, isBookmarked, isLoading, toggleLike, toggleBookmark, refetchInteractions: fetchInteractions } }