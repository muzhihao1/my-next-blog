'use client' import { useState }
from 'react' 

import { Share2, Copy, Check, X }
from 'lucide-react' 

import { cn }
from '@/lib/utils' interface ShareButtonProps { title?: string url?: string text?: string size?: 'sm' | 'md' | 'lg' className?: string }
export function ShareButton({ title, url, text, size = 'md', className }: ShareButtonProps) { const [showTooltip, setShowTooltip] = useState(false) const [tooltipMessage, setTooltipMessage] = useState('') const [tooltipType, setTooltipType] = useState<'success' | 'error'>('success') const sizeClasses = { sm: { button: 'p-1.5', icon: 'h-3 w-3' }, md: { button: 'p-2', icon: 'h-4 w-4' }, lg: { button: 'p-2.5', icon: 'h-5 w-5' }
}
const { button, icon } = sizeClasses[size]
const showMessage = (message: string, type: 'success' | 'error' = 'success') => { setTooltipMessage(message) setTooltipType(type) setShowTooltip(true) setTimeout(() => setShowTooltip(false), 2000) }
const handleShare = async () => { const shareUrl = url || window.location.href const shareTitle = title || document.title const shareText = text || '' // 尝试使用原生分享API if (navigator.share) { try { await navigator.share({ title: shareTitle, text: shareText, url: shareUrl }) showMessage('分享成功') }
catch (error) { // 用户取消分享不算错误 if ((error as Error).name !== 'AbortError') { console.error('分享失败:', error) handleCopyLink(shareUrl) }
} }
else { // 不支持原生分享，复制链接 handleCopyLink(shareUrl) }
}
const handleCopyLink = async (link: string) => { try { await navigator.clipboard.writeText(link) showMessage('链接已复制') }
catch (error) { console.error('复制失败:', error) showMessage('复制失败', 'error') }
}
return ( <div className="relative">
<button onClick={handleShare}
className={cn( "relative rounded-full transition-all", "bg-gray-100 text-gray-600", "hover:bg-gray-200:bg-gray-700 hover:scale-105 active:scale-95", button, className )}
aria-label="分享" >
<Share2 className={icon}
/> </button> {/* 提示信息 */} {showTooltip && ( <div className={cn( "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5", "rounded-lg text-xs font-medium whitespace-nowrap", "animate-in fade-in slide-in-from-bottom-1 duration-200", tooltipType === 'success' ? "bg-green-100/30 text-green-700" : "bg-red-100/30 text-red-700" )} >
<div className="flex items-center gap-1"> {tooltipType === 'success' ? ( <Check className="h-3 w-3" /> ) : ( <X className="h-3 w-3" /> )} {tooltipMessage} </div> {/* 小三角 */}
<div className={cn( "absolute top-full left-1/2 -translate-x-1/2 -mt-px", "border-4 border-transparent", tooltipType === 'success' ? "border-t-green-100/30" : "border-t-red-100/30" )}
/> </div> )} </div> ) }