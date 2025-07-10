'use client' import { useState, useEffect, useCallback, useRef }
from 'react' 

import { useAuth }
from '@/contexts/AuthContext' 

import { Comment }
from '@/types/comment' 

import { REALTIME_CHANNELS, REALTIME_EVENTS, RealtimeMessage, UserPresence }
from '@/lib/realtime/config' 

import { getEventManager }
from '@/lib/realtime/event-manager' 

import { formatDistanceToNow }
from 'date-fns' 

import { zhCN }
from 'date-fns/locale' interface RealtimeCommentsProps { postId: string initialComments: Comment[]
onCommentAdded?: (comment: Comment) => void onCommentUpdated?: (comment: Comment) => void onCommentDeleted?: (commentId: string) => void }
interface TypingUser { userId: string username: string timestamp: number }
export function RealtimeComments({ postId, initialComments, onCommentAdded, onCommentUpdated, onCommentDeleted }: RealtimeCommentsProps) { const { user } = useAuth() const [comments, setComments] = useState<Comment[]>(initialComments) const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map()) const [onlineCount, setOnlineCount] = useState(0) const [isSubmitting, setIsSubmitting] = useState(false) const [commentText, setCommentText] = useState('') const [editingId, setEditingId] = useState<string | null>(null) const [editText, setEditText] = useState('') const typingTimeoutRef = useRef<NodeJS.Timeout>() const lastTypingRef = useRef<number>(0) const eventManagerRef = useRef(getEventManager()) // 订阅实时事件 useEffect(() => { const eventManager = eventManagerRef.current // 订阅评论创建事件 const unsubCommentCreated = eventManager.subscribe<Comment>( REALTIME_EVENTS.COMMENT_CREATED, (comment) => { if (comment.postId === postId) { setComments(prev => { // 避免重复 if (prev.find(c => c.id === comment.id)) return prev return [comment, ...prev]
}) onCommentAdded?.(comment) // 清除该用户的输入状态 setTypingUsers(prev => { const next = new Map(prev) next.delete(comment.userId) return next }) }
}) // 订阅评论更新事件 const unsubCommentUpdated = eventManager.subscribe<Comment>( REALTIME_EVENTS.COMMENT_UPDATED, (comment) => { if (comment.postId === postId) { setComments(prev => prev.map(c => c.id === comment.id ? comment : c) ) onCommentUpdated?.(comment) }
}) // 订阅评论删除事件 const unsubCommentDeleted = eventManager.subscribe<{ commentId: string, postId: string }>( REALTIME_EVENTS.COMMENT_DELETED, (data) => { if (data.postId === postId) { setComments(prev => prev.filter(c => c.id !== data.commentId)) onCommentDeleted?.(data.commentId) }
}) // 订阅用户输入事件 const unsubUserTyping = eventManager.subscribe<{ userId: string, username: string, postId: string }>( REALTIME_EVENTS.USER_TYPING, (data) => { if (data.postId === postId && data.userId !== user?.id) { setTypingUsers(prev => { const next = new Map(prev) next.set(data.userId, { userId: data.userId, username: data.username, timestamp: Date.now() }) return next }) }
}) // 清理过期的输入状态 const cleanupInterval = setInterval(() => { const now = Date.now() setTypingUsers(prev => { const next = new Map(prev) for (const [userId, user]
of next) { if (now - user.timestamp > 3000) { // 3秒后清除 next.delete(userId) }
}
return next.size === prev.size ? prev : next }) }, 1000) return () => { unsubCommentCreated() unsubCommentUpdated() unsubCommentDeleted() unsubUserTyping() clearInterval(cleanupInterval) }
}, [postId, user?.id, onCommentAdded, onCommentUpdated, onCommentDeleted]) // 发送输入状态 const sendTypingStatus = useCallback(() => { if (!user) return const now = Date.now() if (now - lastTypingRef.current < 1000) return // 限制频率 lastTypingRef.current = now eventManagerRef.current.publish( REALTIME_CHANNELS.COMMENTS, REALTIME_EVENTS.USER_TYPING, { userId: user.id, username: user.user_metadata?.display_name || user.email || '匿名用户', postId } ) }, [user, postId]) // 处理评论输入 const handleCommentChange = (value: string) => { setCommentText(value) if (value.trim()) { sendTypingStatus() // 清除之前的定时器 if (typingTimeoutRef.current) { clearTimeout(typingTimeoutRef.current) }
// 3秒后停止显示输入状态 typingTimeoutRef.current = setTimeout(() => { lastTypingRef.current = 0 }, 3000) }
}
// 提交评论 const handleSubmitComment = async (e: React.FormEvent) => { e.preventDefault() if (!user || !commentText.trim() || isSubmitting) return setIsSubmitting(true) try { const response = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, content: commentText.trim() }) }) if (response.ok) { const newComment = await response.json() // 发布到实时频道 await eventManagerRef.current.publish( REALTIME_CHANNELS.COMMENTS, REALTIME_EVENTS.COMMENT_CREATED, newComment ) setCommentText('') }
else { throw new Error('Failed to submit comment') }
}
catch (error) { console.error('Error submitting comment:', error) alert('发表评论失败，请重试') }
finally { setIsSubmitting(false) }
}
// 更新评论 const handleUpdateComment = async (commentId: string) => { if (!editText.trim() || isSubmitting) return setIsSubmitting(true) try { const response = await fetch(`/api/comments/${commentId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: editText.trim() }) }) if (response.ok) { const updatedComment = await response.json() // 发布到实时频道 await eventManagerRef.current.publish( REALTIME_CHANNELS.COMMENTS, REALTIME_EVENTS.COMMENT_UPDATED, updatedComment ) setEditingId(null) setEditText('') }
else { throw new Error('Failed to update comment') }
}
catch (error) { console.error('Error updating comment:', error) alert('更新评论失败，请重试') }
finally { setIsSubmitting(false) }
}
// 删除评论 const handleDeleteComment = async (commentId: string) => { if (!confirm('确定要删除这条评论吗？')) return try { const response = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' }) if (response.ok) { // 发布到实时频道 await eventManagerRef.current.publish( REALTIME_CHANNELS.COMMENTS, REALTIME_EVENTS.COMMENT_DELETED, { commentId, postId } ) }
else { throw new Error('Failed to delete comment') }
}
catch (error) { console.error('Error deleting comment:', error) alert('删除评论失败，请重试') }
}
// 渲染输入状态 const renderTypingIndicator = () => { const typingList = Array.from(typingUsers.values()) if (typingList.length === 0) return null const names = typingList.map(u => u.username) let text = '' if (names.length === 1) { text = `${names[0]
}正在输入...` }
else if (names.length === 2) { text = `${names[0]
}和 ${names[1]
}正在输入...` }
else { text = `${names[0]
}等 ${names.length} 人正在输入...` }
return ( <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
<div className="flex space-x-1">
<span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }
}
/>
<span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }
}
/>
<span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }
}
/> </div>
<span>{text}</span> </div> ) }
return ( <div className="space-y-6"> {/* 评论标题 */}
<div className="flex items-center justify-between">
<h3 className="text-xl font-semibold"> 评论 ({comments.length}) </h3> {onlineCount > 0 && ( <span className="text-sm text-gray-500">
<span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1" /> {onlineCount} 人在线 </span> )} </div> {/* 评论表单 */} {user ? ( <form onSubmit={handleSubmitComment}
className="space-y-4">
<div className="flex gap-3">
<img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`}
alt="Avatar" className="w-10 h-10 rounded-full" />
<div className="flex-1">
<textarea value={commentText}
onChange={(e) => handleCommentChange(e.target.value)}
placeholder="写下你的评论..." className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary resize-none" rows={3}
disabled={isSubmitting}
/>
<div className="flex justify-between items-center mt-2">
<span className="text-xs text-gray-500"> 支持 Markdown 格式 </span>
<button type="submit" disabled={!commentText.trim() || isSubmitting}
className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" > {isSubmitting ? '发送中...' : '发表评论'} </button> </div> </div> </div> </form> ) : ( <div className="text-center py-8 bg-gray-50 rounded-lg">
<p className="text-gray-600 mb-4"> 登录后即可发表评论 </p>
<a href="/api/auth/login" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" >
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /> </svg> 登录 </a> </div> )} {/* 输入指示器 */} {renderTypingIndicator()} {/* 评论列表 */}
<div className="space-y-4"> {comments.length === 0 ? ( <p className="text-center text-gray-500 py-8"> 还没有评论，来做第一个评论的人吧！ </p> ) : ( comments.map((comment) => ( <div key={comment.id}
className="flex gap-3 group">
<img src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.name}`}
alt={comment.author.name}
className="w-10 h-10 rounded-full" />
<div className="flex-1">
<div className="bg-gray-50 rounded-lg px-4 py-3">
<div className="flex items-center justify-between mb-2">
<div className="flex items-center gap-2">
<span className="font-medium">{comment.author.name}</span>
<span className="text-sm text-gray-500"> {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: zhCN })} </span> {comment.updatedAt !== comment.createdAt && ( <span className="text-xs text-gray-400">(已编辑)</span> )} </div> {user?.id === comment.userId && ( <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
<button onClick={() => { setEditingId(comment.id) setEditText(comment.content) }
}
className="text-sm text-gray-500 hover:text-gray-700:text-gray-200" > 编辑 </button>
<button onClick={() => handleDeleteComment(comment.id)}
className="text-sm text-red-500 hover:text-red-700:text-red-300" > 删除 </button> </div> )} </div> {editingId === comment.id ? ( <div className="space-y-2">
<textarea value={editText}
onChange={(e) => setEditText(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary resize-none" rows={3}
autoFocus />
<div className="flex gap-2">
<button onClick={() => handleUpdateComment(comment.id)}
disabled={!editText.trim() || isSubmitting}
className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed" > {isSubmitting ? '保存中...' : '保存'} </button>
<button onClick={() => { setEditingId(null) setEditText('') }
}
className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800:text-gray-200" > 取消 </button> </div> </div> ) : ( <div className="prose prose-sm max-w-none"> {comment.content} </div> )} </div> </div> </div> )) )} </div> </div> ) }