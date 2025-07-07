export interface Tool {
  id: string
  name: string
  slug: string
  category: 'development' | 'design' | 'productivity' | 'hardware' | 'service'
  description: string
  rating: 1 | 2 | 3 | 4 | 5
  price: 'free' | 'freemium' | 'paid' | 'subscription'
  pricing?: string // 详细价格信息
  website: string
  github?: string // GitHub 仓库链接
  icon?: string // 工具图标
  platform?: string[] // 支持平台
  features?: string[] // 主要功能
  pros: string[]
  cons: string[]
  useCases: string[]
  review: string
  alternatives?: string[]
  tags: string[]
  featured: boolean
  lastUpdated: string
}