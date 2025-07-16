'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { CldImage } from 'next-cloudinary'

interface CloudinaryImageProps {
  src: string // Cloudinary public ID 或完整 URL
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  fill?: boolean
  sizes?: string
  crop?: 'fill' | 'fit' | 'scale' | 'pad' | 'crop' | 'thumb'
  gravity?: 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west'
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number
  format?: 'auto' | 'webp' | 'png' | 'jpg' | 'gif'
  placeholder?: 'blur' | 'empty' | 'none'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function CloudinaryImage({
  src,
  alt,
  width = 1920,
  height = 1080,
  priority = false,
  className = '',
  fill = false,
  sizes,
  crop = 'fill',
  gravity = 'auto',
  quality = 'auto:best',
  format = 'auto',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError
}: CloudinaryImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  // 检查是否为 Cloudinary URL 或 public ID
  const isCloudinaryUrl = src.includes('cloudinary.com')
  const publicId = isCloudinaryUrl 
    ? src.split('/upload/')[1]?.split('.')[0] 
    : src

  // 生成占位符
  const defaultBlurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="system-ui" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">Loading...</text>
    </svg>`
  ).toString('base64')}`

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  // 如果配置了 Cloudinary
  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && publicId && !hasError) {
    return (
      <div className={`relative ${isLoading ? 'animate-pulse' : ''}`}>
        <CldImage
          src={publicId}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={className}
          fill={fill}
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          crop={crop}
          gravity={gravity}
          quality={quality}
          format={format}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          removeBackground={false}
          tint=""
          underlays={[]}
          overlays={[]}
          effects={[]}
          theme=""
          preserveTransformations
        />
      </div>
    )
  }

  // 回退到普通 Next.js Image
  return (
    <div className={`relative ${isLoading ? 'animate-pulse' : ''}`}>
      <Image
        src={hasError ? '/images/placeholder.jpg' : src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        priority={priority}
        className={className}
        fill={fill}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

// 用于生成响应式图片的辅助函数
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  } = {}
) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return publicId

  const transformations = [
    options.width && `w_${options.width}`,
    options.height && `h_${options.height}`,
    options.crop && `c_${options.crop}`,
    options.quality && `q_${options.quality}`,
    options.format && `f_${options.format}`,
    'dpr_auto'
  ].filter(Boolean).join(',')

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`
}

// 预设的图片尺寸配置
export const IMAGE_SIZES = {
  thumbnail: { width: 256, height: 256 },
  small: { width: 640, height: 480 },
  medium: { width: 1024, height: 768 },
  large: { width: 1920, height: 1080 },
  hero: { width: 2560, height: 1440 }
} as const

// 导出类型
export type ImageSize = keyof typeof IMAGE_SIZES