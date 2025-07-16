'use client'

/**
 * 文章反应组件
 * @module components/features/ArticleReactions
 */
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/hooks/useAuthModal'

/**
 * 反应类型定义
 * @interface ReactionType
 * @property {string} id - 反应的唯一标识符
 * @property {string} emoji - 反应的表情符号
 * @property {string} label - 反应的中文标签
 */
interface ReactionType {
  id: string
  emoji: string
  label: string
}

/**
 * 文章反应组件的属性
 * @interface ArticleReactionsProps
 * @property {string} articleId - 文章的唯一标识符
 * @property {Record<string, number>} [initialCounts={}] - 初始反应计数（可选）
 */
interface ArticleReactionsProps {
  articleId: string
  initialCounts?: Record<string, number>
}

/**
 * 预定义的反应类型列表
 * @constant {ReactionType[]}
 */
const reactions: ReactionType[] = [
  { id: 'like', emoji: '👍', label: '赞' },
  { id: 'love', emoji: '❤️', label: '喜欢' },
  { id: 'insightful', emoji: '💡', label: '有启发' },
  { id: 'celebrate', emoji: '🎉', label: '太棒了' },
  { id: 'support', emoji: '🙌', label: '支持' }
]

/**
 * 文章反应组件
 * @component
 * @param {ArticleReactionsProps} props - 组件属性
 * @returns {JSX.Element} 渲染的反应组件
 * @description 允许用户对文章添加表情反应。使用本地存储保存用户的反应状态和计数。
 * 支持多种反应类型，包含动画效果和工具提示。
 * @example
 * <ArticleReactions
 *   articleId="article-123"
 *   initialCounts={{ like: 10, love: 5 }}
 * />
 */
export default function ArticleReactions({ articleId, initialCounts = {} }: ArticleReactionsProps) {
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal()
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts)
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set())
  const [isAnimating, setIsAnimating] = useState<string | null>(null)
  
  // 从本地存储加载用户反应
  useEffect(() => {
    const storageKey = `reactions_${articleId}`
    const stored = localStorage.getItem(storageKey)
    
    if (stored) {
      try {
        const parsedReactions = JSON.parse(stored)
        setUserReactions(new Set(parsedReactions))
        
        // 从本地存储加载计数
        const countsKey = `reaction_counts_${articleId}`
        const storedCounts = localStorage.getItem(countsKey)
        if (storedCounts) {
          setCounts(JSON.parse(storedCounts))
        }
      } catch (error) {
        console.error('Failed to load reactions:', error)
      }
    }
  }, [articleId])
  
  const handleReaction = (reactionId: string) => {
    // 如果未登录，打开登录模态框
    if (!user) {
      openAuthModal({
        feature: '为文章添加反应'
      })
      return
    }
    
    const newUserReactions = new Set(userReactions)
    const newCounts = { ...counts }
    
    if (userReactions.has(reactionId)) {
      // 取消反应
      newUserReactions.delete(reactionId)
      newCounts[reactionId] = Math.max(0, (newCounts[reactionId] || 0) - 1)
    } else {
      // 添加反应
      newUserReactions.add(reactionId)
      newCounts[reactionId] = (newCounts[reactionId] || 0) + 1
      
      // 添加动画效果
      setIsAnimating(reactionId)
      setTimeout(() => setIsAnimating(null), 600)
    }
    
    setUserReactions(newUserReactions)
    setCounts(newCounts)
    
    // 保存到本地存储
    localStorage.setItem(`reactions_${articleId}`, JSON.stringify(Array.from(newUserReactions)))
    localStorage.setItem(`reaction_counts_${articleId}`, JSON.stringify(newCounts))
  }
  
  const getTotalReactions = () => {
    return Object.values(counts).reduce((sum, count) => sum + count, 0)
  }
  
  return (
    <div className="border-t border-b border-gray-200 py-6 my-8">
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-sm font-medium text-gray-700">
          觉得这篇文章怎么样？
        </h3>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          {reactions.map((reaction) => {
            const count = counts[reaction.id] || 0
            const isSelected = userReactions.has(reaction.id)
            const isThisAnimating = isAnimating === reaction.id
            
            return (
              <button
                key={reaction.id}
                onClick={() => handleReaction(reaction.id)}
                className={`group relative flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isSelected
                    ? 'bg-blue-100 text-blue-600 scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={`${reaction.label} (${count})`}
              >
                <span
                  className={`text-2xl transition-transform ${
                    isThisAnimating ? 'animate-bounce' : 'group-hover:scale-110'
                  }`}
                >
                  {reaction.emoji}
                </span>
                {count > 0 && (
                  <span className="text-sm font-medium">{count}</span>
                )}
                
                {/* 工具提示 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {reaction.label}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        
        {getTotalReactions() > 0 && (
          <p className="text-sm text-gray-500">
            {getTotalReactions()} 人觉得这篇文章有帮助
          </p>
        )}
      </div>
    </div>
  )
}