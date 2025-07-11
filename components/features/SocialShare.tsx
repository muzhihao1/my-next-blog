'use client'

/**
 * 社交分享组件
 * @module components/features/SocialShare
 */
import { useState } from 'react'

/**
 * 社交分享组件的属性
 * @interface SocialShareProps
 * @property {string} url - 要分享的 URL
 * @property {string} title - 分享标题
 * @property {string} [description=''] - 分享描述（可选）
 * @property {string[]} [tags=[]] - 标签数组（可选，用于 Twitter hashtags）
 */
interface SocialShareProps {
  url: string
  title: string
  description?: string
  tags?: string[]
}

/**
 * 社交媒体分享组件
 * @component
 * @param {SocialShareProps} props - 组件属性
 * @returns {JSX.Element} 渲染的分享按钮组
 * @description 提供多平台社交分享功能，支持 Twitter、LinkedIn、微博等平台。
 * 包含复制链接功能和分享成功提示。
 * @example
 * <SocialShare
 *   url="https://example.com/article"
 *   title="文章标题"
 *   description="文章描述"
 *   tags={['React', 'Next.js']}
 * />
 */
export function SocialShare({
  url,
  title,
  description = '',
  tags = []
}: SocialShareProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  
  const shareLinks = {
    twitter: {
      name: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}${tags.length > 0 ? '&hashtags=' + tags.join(',') : ''}`,
      color: 'hover:bg-black hover:text-white'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`,
      color: 'hover:bg-blue-600 hover:text-white'
    },
    weibo: {
      name: '微博',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.614-2.76 5.05-6.739 5.443m9.834-12.154c-.336 0-.608-.273-.608-.607 0-.337.272-.61.608-.61 2.043 0 3.71 1.667 3.71 3.71 0 .337-.271.61-.607.61-.337 0-.61-.273-.61-.61 0-1.368-1.12-2.493-2.493-2.493m0-2.513c-3.374 0-6.128 2.754-6.128 6.128 0 .674.549 1.215 1.216 1.215.673 0 1.216-.541 1.216-1.215 0-2.026 1.667-3.7 3.696-3.7.674 0 1.216-.54 1.216-1.214 0-.674-.542-1.214-1.216-1.214m-5.95 11.012c-.353.547-.885.887-1.49.955a1.642 1.642 0 01-1.19-.277c-.566-.422-.668-1.172-.23-1.676.429-.498 1.127-.812 1.962-.703.834.11 1.297.588 1.297 1.064 0 .237-.126.48-.349.637m1.968-7.665c-.715-.181-1.446-.219-2.137-.156-2.242.205-4.012 1.445-4.578 3.067a3.137 3.137 0 00-.105 1.933l.05.184a.999.999 0 01-.719 1.211.997.997 0 01-1.215-.716l-.052-.186a5.058 5.058 0 01.168-3.104c.914-2.608 3.674-4.518 7.137-4.835 1.098-.1 2.256-.041 3.381.24.542.134.872.681.738 1.225a1.004 1.004 0 01-1.22.737l-1.448-.361z"/>
        </svg>
      ),
      url: `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title + ' - ' + description)}`,
      color: 'hover:bg-red-600 hover:text-white'
    },
    copy: {
      name: '复制链接',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      color: 'hover:bg-gray-600 hover:text-white'
    }
  }
  
  const handleShare = async (platform: keyof typeof shareLinks) => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url)
        setShowTooltip('copy')
        setTimeout(() => setShowTooltip(null), 2000)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    } else {
      window.open(shareLinks[platform].url, '_blank', 'width=600,height=400')
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">分享：</span>
      <div className="flex items-center gap-1">
        {Object.entries(shareLinks).map(([platform, config]) => (
          <div key={platform} className="relative">
            <button
              onClick={() => handleShare(platform as keyof typeof shareLinks)}
              className={`p-2 rounded-lg text-gray-600 transition-colors ${config.color}`}
              title={config.name}
              aria-label={`分享到 ${config.name}`}
            >
              {config.icon}
            </button>
            
            {showTooltip === platform && platform === 'copy' && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                已复制链接
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}