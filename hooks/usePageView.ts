'use client' import { useEffect, useRef }
from 'react' 

import { tracker }
from '@/lib/analytics/tracker' 

import type { ContentType }
from '@/types/supabase' interface UsePageViewOptions { contentId: string contentType: ContentType trackScroll?: boolean trackReadTime?: boolean }
/** * 追踪页面浏览和交互的Hook * 自动处理页面浏览、滚动深度和阅读时长 */
export function usePageView({ contentId, contentType, trackScroll = true, trackReadTime = true }: UsePageViewOptions) { const trackedRef = useRef(false) const readingTimerRef = useRef<(() => number) | null>(null) const lastScrollDepthRef = useRef(0) useEffect(() => { // 避免重复追踪 if (trackedRef.current) return trackedRef.current = true // 追踪页面浏览 tracker.trackPageView({ userId: '', // 将在服务端获取 contentId, contentType }) // 开始阅读计时 if (trackReadTime) { readingTimerRef.current = tracker.startReadingTimer(contentId) }
// 追踪滚动深度 if (trackScroll) { const handleScroll = () => { const scrollTop = window.pageYOffset || document.documentElement.scrollTop const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight const scrollPercent = Math.round((scrollTop / scrollHeight) * 100) // 检查是否达到新的深度阈值 const thresholds = [25, 50, 75, 100]
for (const threshold of thresholds) { if (scrollPercent >= threshold && lastScrollDepthRef.current < threshold) { tracker.trackScrollDepth(contentId, contentType, threshold) lastScrollDepthRef.current = threshold }
} }
// 使用节流避免频繁触发 let scrollTimer: NodeJS.Timeout | null = null const throttledScroll = () => { if (scrollTimer) return scrollTimer = setTimeout(() => { handleScroll() scrollTimer = null }, 200) }
window.addEventListener('scroll', throttledScroll, { passive: true }) // 初始检查 handleScroll() return () => { window.removeEventListener('scroll', throttledScroll) if (scrollTimer) clearTimeout(scrollTimer) }
} }, [contentId, contentType, trackScroll, trackReadTime]) // 页面卸载时记录阅读时长 useEffect(() => { if (!trackReadTime) return const handleUnload = () => { if (readingTimerRef.current) { const duration = readingTimerRef.current() // 只记录超过5秒的阅读 if (duration > 5) { tracker.trackAction({ userId: '', actionType: 'view', contentId, contentType, metadata: { readingTime: duration }
}) }
} }
window.addEventListener('beforeunload', handleUnload) window.addEventListener('pagehide', handleUnload) return () => { window.removeEventListener('beforeunload', handleUnload) window.removeEventListener('pagehide', handleUnload) // 组件卸载时也记录 handleUnload() }
}, [contentId, contentType, trackReadTime]) }
/** * 追踪通用用户行为的Hook */
export function useActionTracker() { const trackAction = ( actionType: string, contentId: string, contentType: ContentType, metadata?: Record<string, any> ) => { tracker.trackAction({ userId: '', actionType: actionType as any, contentId, contentType, metadata }) }
return { trackAction } }