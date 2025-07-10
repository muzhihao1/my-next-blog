'use client' import Image from 'next/image' 

import Link from 'next/link' 

import { formatDistanceToNow }
from 'date-fns' 

import { zhCN }
from 'date-fns/locale' 

import { Twitter, Linkedin, Link2, Heart, Bookmark, Share2 }
from 'lucide-react' 

import { useState }
from 'react' 

import { PostData }
from '@/types/post' interface PostHeaderProps { post: PostData readingTime?: number wordCount?: number }
export function PostHeader({ post, readingTime = 6, wordCount = 593 }: PostHeaderProps) { const [isLiked, setIsLiked] = useState(false) const [isBookmarked, setIsBookmarked] = useState(false) const publishDate = new Date(post.date) const lastModified = post.lastModified ? new Date(post.lastModified) : publishDate // 分享功能 const shareOnTwitter = () => { const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}` window.open(url, '_blank') }
const shareOnLinkedIn = () => { const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}` window.open(url, '_blank') }
const copyLink = async () => { await navigator.clipboard.writeText(window.location.href) // 可以添加一个提示 }
return ( <header className="mb-12"> {/* 文章标题 */}
<h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-900"> {post.title} </h1> {/* 作者和发布信息 */}
<div className="flex flex-col gap-4 mb-6">
<div className="flex items-center gap-4"> {/* 作者头像 */}
<div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200"> {post.author.avatar ? ( <Image src={post.author.avatar}
alt={post.author.name}
fill className="object-cover" /> ) : ( <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold"> {post.author.name.charAt(0)} </div> )} </div> {/* 作者信息 */}
<div className="flex-1">
<div className="flex items-center gap-2 mb-1">
<Link href={`/authors/${post.author.id || post.author.name}`}
className="font-semibold text-gray-900 hover:text-blue-600" > {post.author.name} </Link> {post.author.title && ( <span className="text-sm text-gray-500"> {post.author.title} </span> )} </div> {/* 发布信息 */}
<div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
<time dateTime={publishDate.toISOString()}> {publishDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} </time>
<span className="text-gray-400">·</span>
<span>{readingTime} 分钟阅读</span>
<span className="text-gray-400">·</span>
<span>{wordCount} 字</span> {lastModified > publishDate && ( <>
<span className="text-gray-400">·</span>
<span> 更新于 {formatDistanceToNow(lastModified, { locale: zhCN, addSuffix: true })} </span> </> )} </div> </div> </div> {/* 标签 */} {post.tags && post.tags.length > 0 && ( <div className="flex flex-wrap gap-2"> {post.tags.map((tag) => ( <Link key={tag}
href={`/tags/${tag}`}
className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors" > {tag} </Link> ))} </div> )} </div> {/* 操作栏 */}
<div className="flex items-center justify-between py-4 border-t border-gray-200"> {/* 互动按钮 */}
<div className="flex items-center gap-4">
<button onClick={() => setIsLiked(!isLiked)}
className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${isLiked ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100' }`} >
<Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
/>
<span className="text-sm font-medium">喜欢</span> </button>
<button onClick={() => setIsBookmarked(!isBookmarked)}
className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${isBookmarked ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100' }`} >
<Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`}
/>
<span className="text-sm font-medium">收藏</span> </button> </div> {/* 分享按钮 */}
<div className="flex items-center gap-2">
<span className="text-sm text-gray-500 mr-2">分享：</span>
<button onClick={shareOnTwitter}
className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" aria-label="分享到 Twitter" >
<Twitter className="w-5 h-5" /> </button>
<button onClick={shareOnLinkedIn}
className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" aria-label="分享到 LinkedIn" >
<Linkedin className="w-5 h-5" /> </button>
<button onClick={copyLink}
className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" aria-label="复制链接" >
<Link2 className="w-5 h-5" /> </button> </div> </div> </header> ) }