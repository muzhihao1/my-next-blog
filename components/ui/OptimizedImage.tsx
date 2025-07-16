'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { CloudinaryImage } from './CloudinaryImage'

interface OptimizedImageProps {
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
export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority = false, 
  fill = false, 
  sizes, 
  onLoad 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // 检测是否为 Cloudinary 图片
  const isCloudinaryImage = src.includes('cloudinary.com') || 
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && 
     !src.startsWith('http') && 
     !src.startsWith('/') && 
     !src.startsWith('data:'))
  
  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }
  
  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }
  
  // 默认占位图
  const placeholderSrc = `data:image/svg+xml,%3Csvg width='${width || 400}' height='${height || 300}' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='14' fill='%239ca3af'%3ELoading...%3C/text%3E%3C/svg%3E`
  
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
  
  // 如果是 Cloudinary 图片，使用专门的组件
  if (isCloudinaryImage && process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    return (
      <CloudinaryImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        fill={fill}
        sizes={sizes}
        onLoad={onLoad}
        onError={() => setError(true)}
      />
    )
  }

  // 否则使用标准的 Next.js Image 组件
  return (
    <div className={cn("relative overflow-hidden", fill && "w-full h-full", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      
      <Image
        src={src}
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
        unoptimized={src.includes('media-amazon.com') || src.startsWith('data:')}
      />
    </div>
  )
}