import { Project } from '@/types/project'

export const fallbackProjects: Project[] = [
  {
    id: '1',
    title: '个人博客系统',
    slug: 'personal-blog',
    description: '基于 Next.js 和 Notion API 构建的现代化博客系统，支持 Markdown 渲染、深色模式、响应式设计等功能。',
    category: 'website',
    status: 'active',
    featured: true,
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Notion API'],
    tags: ['博客', 'Next.js', '开源项目', 'CMS'],
    thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=800&fit=crop'
    ],
    demoUrl: 'https://blog.example.com',
    githubUrl: 'https://github.com/example/blog',
    content: `
# 个人博客系统

这是一个基于 Next.js 和 Notion API 构建的现代化博客系统。

## 主要特性

- 🚀 使用 Next.js 15 和 React 19
- 📝 通过 Notion API 管理内容
- 🎨 Tailwind CSS 样式系统
- 🌓 深色/浅色主题切换
- 📱 完全响应式设计
- ⚡ 静态生成，性能优异

## 技术架构

项目采用了现代化的技术栈，确保了良好的开发体验和用户体验。
`,
    startDate: '2024-01-01',
    lastUpdated: new Date().toISOString(),
    metrics: {
      users: 1000,
      performance: '98/100 Lighthouse Score',
      achievement: '提升了内容管理效率 80%'
    },
    keyFeatures: [
      '基于 Notion 的内容管理系统',
      '支持 Markdown 和富文本编辑',
      '自动生成目录和导航',
      '深色模式支持',
      'SEO 优化和性能优化',
      '响应式设计，支持移动端'
    ],
    developmentProcess: '项目从需求分析开始，首先确定了使用 Next.js 作为框架，结合 Notion API 实现内容管理。开发过程中采用了敏捷开发方法，每周进行迭代更新。通过持续集成和自动化部署，确保了代码质量和发布效率。',
    challenges: [
      'Notion API 的速率限制和响应时间问题',
      '静态生成与动态内容的平衡',
      '深色模式下的样式兼容性'
    ],
    solutions: [
      '实现了智能缓存机制和后备数据系统，确保在 API 不可用时仍能正常访问',
      '采用增量静态再生成（ISR）策略，既保证了性能又能及时更新内容',
      '使用 CSS 变量和 Tailwind CSS 的深色模式支持，确保了完美的主题切换体验'
    ],
    codeSnippets: [
      {
        filename: 'lib/notion.ts',
        language: 'typescript',
        code: `import { Client } from '@notionhq/client'
import { cache } from 'react'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

export const getDatabase = cache(async (databaseId: string) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    })
    return response.results
  } catch (error) {
    console.error('Notion API Error:', error)
    return []
  }
})`
      },
      {
        filename: 'app/layout.tsx',
        language: 'tsx',
        code: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}`
      },
      {
        filename: 'tailwind.config.js',
        language: 'javascript',
        code: `module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}`
      }
    ]
  },
  {
    id: '2',
    title: '任务管理应用',
    slug: 'task-manager',
    description: '一个简洁高效的任务管理工具，支持项目分组、标签管理、时间追踪等功能。',
    category: 'website',
    status: 'completed',
    featured: true,
    techStack: ['React', 'Node.js', 'MongoDB', 'Express'],
    tags: ['效率工具', '任务管理', 'React', '全栈开发'],
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=800&fit=crop'
    ],
    demoUrl: 'https://tasks.example.com',
    content: `
# 任务管理应用

一个功能完善的任务管理工具，帮助个人和团队提高工作效率。

## 核心功能

- 任务创建和分配
- 项目分组管理
- 标签和优先级设置
- 时间追踪功能
- 团队协作支持
`,
    startDate: '2023-06-01',
    endDate: '2023-12-01',
    lastUpdated: new Date().toISOString(),
    metrics: {
      users: 500,
      achievement: '帮助用户提升效率 40%'
    }
  },
  {
    id: '3',
    title: '开源 UI 组件库',
    slug: 'ui-components',
    description: '基于 React 和 TypeScript 的可复用 UI 组件库，包含 50+ 常用组件。',
    category: 'opensource',
    status: 'active',
    featured: true,
    techStack: ['React', 'TypeScript', 'Storybook', 'Jest'],
    tags: ['开源', 'UI组件', 'React', 'TypeScript', '组件库'],
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
    screenshots: [],
    githubUrl: 'https://github.com/example/ui-lib',
    content: `
# 开源 UI 组件库

一个现代化的 React UI 组件库，提供了丰富的可复用组件。

## 特点

- 50+ 精心设计的组件
- 完整的 TypeScript 支持
- 全面的文档和示例
- 支持主题定制
- 单元测试覆盖率 95%+
`,
    startDate: '2023-01-01',
    lastUpdated: new Date().toISOString()
  }
]