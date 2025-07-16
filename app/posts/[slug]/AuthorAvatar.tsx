'use client'

import { useState } from 'react'
import { getCloudinaryUrl } from '@/lib/cloudinary-mapping'

interface AuthorAvatarProps {
  src: string
  alt: string
  fallbackSrc?: string
}

export default function AuthorAvatar({ src, alt, fallbackSrc = '/images/default-avatar.svg' }: AuthorAvatarProps) {
  const [imgSrc, setImgSrc] = useState(getCloudinaryUrl(src))
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(getCloudinaryUrl(fallbackSrc))
    }
  }

  return (
    <img 
      src={imgSrc}
      alt={alt}
      width={48}
      height={48}
      className="w-full h-full object-cover"
      onError={handleError}
    />
  )
}