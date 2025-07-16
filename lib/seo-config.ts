/**
 * SEO配置文件
 * @module lib/seo-config
 * @description 网站的SEO相关配置
 */

export const siteConfig = {
  // 基本信息
  name: 'Peter的人生实验室',
  title: 'Peter的人生实验室 - 用代码和文字记录人生实验',
  description: '这里是我进行人生实验的地方。用代码验证想法，用文字记录成长，用项目探索可能。分享技术探索、产品思考、效率方法和人生感悟。',
  author: 'Peter Mu',
  
  // URL配置
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com',
  
  // 社交媒体
  social: {
    twitter: '@zhihaomu',
    github: 'muzhihao1',
    linkedin: 'zhihaomu',
  },
  
  // 默认图片
  defaultImage: '/og-image.png',
  
  // 语言和地区
  locale: 'zh-CN',
  
  // 关键词
  keywords: [
    '人生实验室',
    '技术博客',
    '个人成长',
    '编程实验',
    '产品探索',
    '创意实践',
    '技术思考',
    '人工智能',
    'AI探索',
    '前端开发',
    'React',
    'Next.js',
    '产品设计',
    '效率方法',
    '人生感悟',
    'Zhihao Mu',
  ],
  
  // 分类关键词映射
  categoryKeywords: {
    Technology: ['编程', '技术', '开发', '代码', 'JavaScript', 'TypeScript', 'React', 'Node.js'],
    Design: ['设计', 'UI', 'UX', '用户体验', '界面设计', '设计系统'],
    Productivity: ['效率', '生产力', '时间管理', '工具', '方法论'],
    Life: ['生活', '思考', '成长', '感悟', '阅读'],
  },
  
  // Open Graph配置
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    site_name: 'Peter的人生实验室',
  },
  
  // Twitter Card配置
  twitter: {
    card: 'summary_large_image',
    creator: '@zhihaomu',
  },
  
  // 验证码（如果有的话）
  verification: {
    google: '', // Google Search Console验证码
    baidu: '',  // 百度站长平台验证码
  },
}

/**
 * 生成页面标题
 * @param pageTitle 页面标题
 * @returns 完整的页面标题
 */
export function generatePageTitle(pageTitle?: string): string {
  if (!pageTitle) return siteConfig.title
  return `${pageTitle} - ${siteConfig.name}`
}

/**
 * 生成页面描述
 * @param description 页面描述
 * @returns 页面描述或默认描述
 */
export function generatePageDescription(description?: string): string {
  return description || siteConfig.description
}

/**
 * 生成关键词
 * @param keywords 额外的关键词
 * @param category 文章分类
 * @returns 合并后的关键词数组
 */
export function generateKeywords(keywords: string[] = [], category?: string): string[] {
  const baseKeywords = [...siteConfig.keywords]
  
  if (category && siteConfig.categoryKeywords[category as keyof typeof siteConfig.categoryKeywords]) {
    baseKeywords.push(...siteConfig.categoryKeywords[category as keyof typeof siteConfig.categoryKeywords])
  }
  
  return [...new Set([...baseKeywords, ...keywords])]
}

/**
 * 生成规范化URL
 * @param path 页面路径
 * @returns 完整的规范化URL
 */
export function generateCanonicalUrl(path: string = ''): string {
  const baseUrl = siteConfig.url.replace(/\/$/, '')
  const cleanPath = path.replace(/^\//, '')
  return `${baseUrl}/${cleanPath}`
}