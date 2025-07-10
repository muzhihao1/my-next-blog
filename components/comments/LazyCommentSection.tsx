/** * 懒加载评论组件 * 使用Intersection Observer实现视口检测加载 */ 'use client' import { useState, useEffect, useRef }
from 'react' 

import dynamic from 'next/dynamic' 

import { LoadingSpinner }
from '@/components/a11y/AriaLabels' // 动态导入评论组件 const CommentSection = dynamic( () => import('./CommentSection').then(mod => mod.CommentSection), { loading: () =>
<CommentSectionSkeleton />, ssr: false // 评论不需要SSR } ) interface LazyCommentSectionProps { contentId: string contentType: 'post' | 'project' | 'book' | 'tool' threshold?: number // 触发加载的可见度阈值 rootMargin?: string // 提前加载的边距 }
export function LazyCommentSection({ contentId, contentType, threshold = 0.1, rootMargin = '100px' }: LazyCommentSectionProps) { const [shouldLoad, setShouldLoad] = useState(false) const [hasIntersected, setHasIntersected] = useState(false) const containerRef = useRef<HTMLDivElement>(null) useEffect(() => { // 如果已经加载过，不再重复观察 if (hasIntersected) return const observer = new IntersectionObserver( ([entry]) => { if (entry.isIntersecting) { setShouldLoad(true) setHasIntersected(true) // 一旦加载，停止观察 if (containerRef.current) { observer.unobserve(containerRef.current) }
} }, { threshold, rootMargin } ) if (containerRef.current) { observer.observe(containerRef.current) }
return () => { if (containerRef.current) { observer.unobserve(containerRef.current) }
} }, [threshold, rootMargin, hasIntersected]) return ( <div ref={containerRef}
id="comments-section" className="min-h-[200px]
py-8" > {shouldLoad ? ( <CommentSection contentId={contentId}
contentType={contentType}
/> ) : ( <div className="text-center py-12">
<button onClick={() => setShouldLoad(true)}
className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200:bg-gray-700 rounded-lg transition-colors" aria-label="加载评论" >
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> </svg>
<span>加载评论</span> </button>
<p className="text-sm text-gray-500 mt-2"> 继续滚动将自动加载评论 </p> </div> )} </div> ) }
/** * 评论区骨架屏 */
function CommentSectionSkeleton() { return ( <div className="animate-pulse"> {/* 标题骨架 */}
<div className="h-8 w-32 bg-gray-200 rounded mb-6" /> {/* 表单骨架 */}
<div className="mb-8">
<div className="h-32 bg-gray-100 rounded-lg mb-2" />
<div className="flex justify-end">
<div className="h-10 w-24 bg-gray-200 rounded" /> </div> </div> {/* 评论列表骨架 */}
<div className="space-y-4"> {[1, 2, 3].map((i) => ( <div key={i}
className="flex gap-3">
<div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
<div className="flex-1">
<div className="bg-gray-100 rounded-lg p-4">
<div className="h-4 w-24 bg-gray-200 rounded mb-2" />
<div className="space-y-2">
<div className="h-3 bg-gray-200 rounded" />
<div className="h-3 bg-gray-200 rounded w-5/6" /> </div> </div> </div> </div> ))} </div>
<div className="flex justify-center items-center gap-2 mt-6">
<LoadingSpinner size="sm" label="加载评论中" />
<span className="text-sm text-gray-500"> 加载评论中... </span> </div> </div> ) }
/** * 预加载评论组件 * 在用户可能需要时提前加载 */
export function preloadCommentSection() { // 预加载组件代码 import('./CommentSection') }