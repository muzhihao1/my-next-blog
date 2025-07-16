/**
 * 收藏按钮组件
 * @module components/features/FavoriteButton
 */
'use client'

import { useState, useEffect } from 'react'
import { useFavorites, FavoriteType } from '@/lib/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/hooks/useAuthModal'

/** 
 * 收藏按钮组件的属性
 * @interface FavoriteButtonProps
 * @property {string} itemId - 内容ID
 * @property {FavoriteType} itemType - 内容类型
 * @property {string} title - 标题
 * @property {string} [description] - 描述
 * @property {string} [thumbnail] - 缩略图
 * @property {string} [slug] - URL标识
 * @property {'small' | 'medium' | 'large'} [size='medium'] - 按钮大小
 * @property {boolean} [showText=true] - 是否显示文字
 * @property {string} [className] - 额外的CSS类名
 * @property {(isFavorited: boolean) => void} [onToggle] - 切换回调
 */
interface FavoriteButtonProps {
  itemId: string
  itemType: FavoriteType
  title: string
  description?: string
  thumbnail?: string
  slug?: string
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  className?: string
  onToggle?: (isFavorited: boolean) => void
}

/**
 * 收藏按钮组件
 * @component
 * @param {FavoriteButtonProps} props - 组件属性
 * @returns {JSX.Element} 渲染的收藏按钮
 * @description 提供收藏和取消收藏功能的交互按钮，支持不同尺寸和样式。
 * 包含动画效果和状态反馈。
 * @example
 * <FavoriteButton
 *   itemId="post-1"
 *   itemType={FavoriteType.POST}
 *   title="文章标题"
 *   description="文章描述"
 *   slug="article-slug"
 * />
 */
export default function FavoriteButton({
  itemId,
  itemType,
  title,
  description,
  thumbnail,
  slug,
  size = 'medium',
  showText = true,
  className = '',
  onToggle
}: FavoriteButtonProps) {
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // 检查初始收藏状态
  useEffect(() => {
    setIsFavorited(isFavorite(itemId, itemType))
  }, [itemId, itemType, isFavorite])

  // 处理点击事件
  const handleClick = () => {
    // 如果未登录，打开登录模态框
    if (!user) {
      openAuthModal({
        feature: '收藏文章'
      })
      return
    }
    
    setIsAnimating(true)
    
    if (isFavorited) {
      removeFavorite(itemId, itemType)
      setIsFavorited(false)
      onToggle?.(false)
    } else {
      addFavorite({
        id: itemId,
        type: itemType,
        title,
        description,
        thumbnail,
        slug
      })
      setIsFavorited(true)
      onToggle?.(true)
    }

    // 重置动画状态
    setTimeout(() => setIsAnimating(false), 600)
  }

  const sizeClasses = {
    small: 'p-1.5',
    medium: 'p-2',
    large: 'p-3'
  }

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  }

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 rounded-lg transition-all duration-200
        ${sizeClasses[size]}
        ${showText ? 'px-4' : ''}
        ${isFavorited 
          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
        }
        hover:scale-105 active:scale-95
        ${className}
      `}
      title={isFavorited ? '取消收藏' : '添加收藏'}
      aria-label={isFavorited ? '取消收藏' : '添加收藏'}
      aria-pressed={isFavorited}
    >
      <svg
        className={`
          ${iconSizeClasses[size]}
          ${isAnimating ? 'animate-bounce' : ''}
          transition-transform
        `}
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showText && (
        <span className={`font-medium ${textSizeClasses[size]}`}>
          {isFavorited ? '已收藏' : '收藏'}
        </span>
      )}
    </button>
  )
}
/**
 * 收藏按钮浮动版本
 * @component
 * @param {Omit<FavoriteButtonProps, 'showText' | 'size'>} props - 组件属性（排除showText和size）
 * @returns {JSX.Element} 渲染的浮动收藏按钮
 * @description 固定在右下角的浮动收藏按钮，适用于长文章页面
 */
export function FloatingFavoriteButton(
  props: Omit<FavoriteButtonProps, 'showText' | 'size'>
) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <FavoriteButton
        {...props}
        size="large"
        showText={false}
        className="shadow-lg hover:shadow-xl"
      />
    </div>
  )
}
/**
 * 收藏计数显示组件
 * @component
 * @param {Object} props - 组件属性
 * @param {string} props.itemId - 内容ID
 * @param {FavoriteType} props.itemType - 内容类型
 * @param {number} [props.initialCount=0] - 初始计数
 * @returns {JSX.Element} 渲染的收藏计数
 */
export function FavoriteCount({
  itemId,
  itemType,
  initialCount = 0
}: {
  itemId: string
  itemType: FavoriteType
  initialCount?: number
}) {
  const { isFavorite } = useFavorites()
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    // 这里可以集成实际的计数API
    // 目前只是简单地根据本地收藏状态调整
    setCount(prev => isFavorite(itemId, itemType) ? prev + 1 : prev)
  }, [itemId, itemType, isFavorite])

  if (count === 0) return null

  return (
    <div className="flex items-center gap-1 text-sm text-gray-500">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
      </svg>
      <span>{count}</span>
    </div>
  )
}