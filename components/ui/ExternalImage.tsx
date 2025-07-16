'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ExternalImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  onLoad?: () => void
}

export function ExternalImage({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority = false, 
  fill = false, 
  sizes, 
  onLoad 
}: ExternalImageProps) {
  // 预处理src：如果是Amazon图片文件名，补全为完整URL
  const processedSrc = (() => {
    if (!src.includes('http') && src.match(/^[A-Z0-9]+\._[A-Z0-9_]+\.(jpg|jpeg|png)$/i)) {
      return `https://m.media-amazon.com/images/I/${src}`
    }
    return src
  })()
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(processedSrc)
  
  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }
  
  const handleError = () => {
    // 如果是Amazon图片且还没尝试过其他域名
    if (currentSrc.includes('m.media-amazon.com')) {
      // 尝试使用images-na.ssl-images-amazon.com域名
      const alternativeUrl = currentSrc.replace('m.media-amazon.com', 'images-na.ssl-images-amazon.com')
      setCurrentSrc(alternativeUrl)
      setError(false)
      return
    }
    
    // 如果已经尝试过所有选项，标记为错误
    setError(true)
    setIsLoading(false)
  }
  
  // 默认占位图
  const placeholderSrc = `data:image/svg+xml,%3Csvg width='${width || 400}' height='${height || 300}' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='14' fill='%239ca3af'%3ELoading...%3C/text%3E%3C/svg%3E`
  
  // 检查是否是本地图片
  const isLocalImage = src.startsWith('/book-covers/')
  
  // 检查是否需要使用非优化模式
  const needsUnoptimized = !isLocalImage && (
                          src.includes('media-amazon.com') || 
                          src.includes('doubanio.com') || 
                          src.includes('prod-files-secure.s3'))
  
  if (error) {
    return (
      <div 
        className={cn(
          "bg-gray-100 flex items-center justify-center",
          className
        )}
        style={{ 
          width: fill ? '100%' : width, 
          height: fill ? '100%' : height 
        }}
      >
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    )
  }
  
  // 对于外部图片，使用原生img标签
  if (needsUnoptimized) {
    return (
      <div className={cn("relative overflow-hidden", fill && "w-full h-full", className)}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        
        <img
          src={currentSrc}
          alt={alt}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            fill && "object-cover w-full h-full"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
        />
      </div>
    )
  }
  
  // 对于本地图片，使用Next.js的Image组件
  return (
    <div className={cn("relative overflow-hidden", fill && "w-full h-full", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      
      <Image
        src={currentSrc}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        sizes={sizes || (fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined)}
        priority={priority}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          fill && "object-cover"
        )}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL={placeholderSrc}
      />
    </div>
  )
}