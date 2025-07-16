/**
 * 标签列表组件
 * @module components/features/TagList
 */
'use client'

import Link from 'next/link'
import { Tag } from '@/types/tag'

/**
 * 简化的标签数据接口
 */
interface SimpleTag {
  name: string
  slug?: string
  color?: string
}

/**
 * 标签列表组件的属性
 * @interface TagListProps
 * @property {string[]} [tags] - 标签名称数组
 * @property {Tag[]} [tagObjects] - 标签对象数组（包含更多信息）
 * @property {'small' | 'medium' | 'large'} [size='medium'] - 标签大小
 * @property {boolean} [interactive=true] - 是否可交互（点击跳转）
 * @property {string} [className] - 额外的CSS类名
 * @property {(tag: string) => void} [onTagClick] - 标签点击回调
 */
interface TagListProps {
  tags?: string[]
  tagObjects?: Tag[]
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
  className?: string
  onTagClick?: (tag: string) => void
}

/**
 * 标签列表组件
 * @component
 * @param {TagListProps} props - 组件属性
 * @returns {JSX.Element | null} 渲染的标签列表或null
 * @description 展示标签列表，支持不同尺寸和交互模式。
 * 可以接收简单的标签名称数组或完整的标签对象数组。
 * @example
 * // 使用标签名称数组
 * <TagList tags={['React', 'Next.js', 'TypeScript']} />
 * 
 * @example
 * // 使用标签对象数组
 * <TagList tagObjects={tagObjectsArray} size="small" />
 */
export default function TagList({
  tags,
  tagObjects,
  size = 'medium',
  interactive = true,
  className = '',
  onTagClick
}: TagListProps) {
  // 如果两种数据都没有提供，返回null
  if (!tags?.length && !tagObjects?.length) {
    return null
  }
  
  // 统一处理为标签数据格式
  const tagData: SimpleTag[] | undefined = tagObjects || tags?.map(name => ({
    name,
    slug: name.toLowerCase().replace(/[\s_]+/g, '-')
  }))
  
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  }
  
  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    if (onTagClick) {
      e.preventDefault()
      onTagClick(tag)
    }
  }
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tagData?.map((tag, index) => {
        const tagName = tag.name
        const tagSlug = tag.slug || tag.name.toLowerCase().replace(/[\s_]+/g, '-')
        const tagColor = 'color' in tag ? tag.color : undefined
        
        const baseClasses = `
          inline-flex items-center rounded-full font-medium
          transition-all duration-200
          ${sizeClasses[size]}
          ${interactive
            ? 'hover:scale-105 hover:shadow-md cursor-pointer'
            : 'cursor-default'
          }
        `
        
        const colorClasses = tagColor
          ? 'text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          
        if (interactive) {
          return (
            <Link
              key={`${tagSlug}-${index}`}
              href={`/tags/${tagSlug}`}
              className={`${baseClasses} ${colorClasses}`}
              style={tagColor ? { backgroundColor: tagColor } : undefined}
              onClick={onTagClick ? (e) => handleTagClick(e, tagName) : undefined}
            >
              <span className="flex items-center gap-1">
                <svg
                  className={`${
                    size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {tagName}
              </span>
            </Link>
          )
        }
        
        return (
          <span
            key={`${tagSlug}-${index}`}
            className={`${baseClasses} ${colorClasses}`}
            style={tagColor ? { backgroundColor: tagColor } : undefined}
          >
            <span className="flex items-center gap-1">
              <svg
                className={`${
                  size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              {tagName}
            </span>
          </span>
        )
      })}
    </div>
  )
}

/**
 * 标签云组件
 * @component
 * @param {Object} props - 组件属性
 * @param {import('@/types/tag').TagCloudItem[]} props.tags - 标签云数据
 * @param {string} [props.className] - 额外的CSS类名
 * @returns {JSX.Element} 渲染的标签云
 */
export function TagCloud({
  tags,
  className = ''
}: {
  tags: import('@/types/tag').TagCloudItem[]
  className?: string
}) {
  return (
    <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`/tags/${tag.slug}`}
          className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 transition-all duration-200"
          style={{
            fontSize: `${0.875 + tag.weight * 0.5}rem`,
            opacity: 0.6 + tag.weight * 0.4
          }}
        >
          {tag.name}
          <span className="ml-2 text-xs opacity-70">({tag.count})</span>
        </Link>
      ))}
    </div>
  )
}