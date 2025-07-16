'use client'

/**
 * Tool card component for displaying tool information
 * @module components/features/ToolCard
 */
import Link from 'next/link' 
import type { Tool } from '@/types/tool'

/**
 * Props for the ToolCard component
 * @interface ToolCardProps
 * @property {Tool} tool - The tool object to display
 * @property {boolean} [featured=false] - Whether to display as a featured card with enhanced styling
 */
interface ToolCardProps {
  tool: Tool
  featured?: boolean
}
/**
 * Tool card component for displaying tool information in a card format
 * @component
 * @param {ToolCardProps} props - Component props
 * @returns {JSX.Element} Rendered tool card
 * @description Displays tool information including name, description, price, rating, and tags.
 * Features hover effects and responsive design. Featured cards have additional styling and tag display.
 * @example
 * <ToolCard tool={myTool} featured={true} />
 */
export default function ToolCard({ tool, featured = false }: ToolCardProps) {
  const priceLabels = {
    free: '免费',
    freemium: '免费增值',
    paid: '付费',
    subscription: '订阅制'
  }
  const priceColors = {
    free: 'bg-green-100 text-green-800',
    freemium: 'bg-blue-100 text-blue-800',
    paid: 'bg-purple-100 text-purple-800',
    subscription: 'bg-orange-100 text-orange-800'
  }
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`block p-5 sm:p-6 rounded-lg border transition-all hover:shadow-lg hover:-translate-y-1 ${
        featured
          ? 'border-primary bg-gradient-to-br from-background to-muted shadow-md'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold line-clamp-1">{tool.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${priceColors[tool.price]}`}>
          {priceLabels[tool.price]}
        </span>
      </div>
      <p className="text-muted-foreground mb-4 line-clamp-2">
        {tool.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${
                i < tool.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-1 text-sm text-muted-foreground">
            {tool.rating}.0
          </span>
        </div>
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          查看详情
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
      
      {/* Tags preview for featured cards */}
      {featured && tool.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {tool.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
            >
              {tag}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className="text-xs px-2 py-1 text-muted-foreground">
              +{tool.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}