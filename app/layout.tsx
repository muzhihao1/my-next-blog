import './globals.css'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SEO, generateWebsiteStructuredData } from '@/components/seo/SEO'
import { AuthProvider } from '@/contexts/AuthContext'
import { SkipLink } from '@/components/a11y/AriaLabels'
import { ThemeProvider } from '@/lib/theme/ThemeContext'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '数字花园 - 个人成果展示平台',
    template: '%s | 数字花园'
  },
  description: '展示项目、分享知识、记录成长。探索我的项目作品集、技术文章、读书笔记和工具推荐。',
  keywords: ['个人博客', '项目展示', '技术文章', '读书笔记', '工具推荐', '数字花园', 'portfolio'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  publisher: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: baseUrl,
    siteName: '数字花园',
    title: '数字花园 - 个人成果展示平台',
    description: '展示项目、分享知识、记录成长。探索我的项目作品集、技术文章、读书笔记和工具推荐。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '数字花园 - 个人成果展示平台',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '数字花园 - 个人成果展示平台',
    description: '展示项目、分享知识、记录成长。探索我的项目作品集、技术文章、读书笔记和工具推荐。',
    images: ['/twitter-image.png'],
    creator: '@yourtwitterhandle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'zh-CN': baseUrl,
    },
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: '无题之墨 RSS Feed' }
      ],
      'application/atom+xml': [
        { url: '/atom.xml', title: '无题之墨 Atom Feed' }
      ],
      'application/feed+json': [
        { url: '/feed.json', title: '无题之墨 JSON Feed' }
      ]
    }
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const websiteStructuredData = generateWebsiteStructuredData({
    name: '数字花园',
    url: baseUrl,
    description: '展示项目、分享知识、记录成长。探索我的项目作品集、技术文章、读书笔记和工具推荐。',
    authorName: 'Your Name',
    searchUrlTemplate: `${baseUrl}/search?q={search_term_string}`
  })

  return (
    <html lang="zh-CN">
      <head>
        <SEO structuredData={websiteStructuredData} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {/* 跳转链接 - 提升可访问性 */}
            <SkipLink href="#main-content">跳转到主要内容</SkipLink>
            <SkipLink href="#main-navigation">跳转到导航</SkipLink>
            
            <div className="min-h-screen flex flex-col">
              <Header />
              <main id="main-content" className="flex-grow" role="main" aria-label="主要内容">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}