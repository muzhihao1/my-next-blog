/**
 * HydrationBoundary Usage Example
 * 
 * This file demonstrates how to integrate the HydrationBoundary component
 * into your Next.js 15 layout to fix the link clicking issue.
 */

import './globals.css'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SEO, generateWebsiteStructuredData } from '@/components/seo/SEO'
import { AuthProvider } from '@/contexts/AuthContext'
import { SkipLink } from '@/components/a11y/AriaLabels'
import { ThemeProvider } from '@/lib/theme/ThemeContext'
import { HydrationBoundary } from '@/components/fixes/HydrationBoundary'
import { LinkFixProviderProduction } from './link-fix-provider-production'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '数字花园 - 个人成果展示平台',
    template: '%s | 数字花园'
  },
  description: '展示项目、分享知识、记录成长。探索我的项目作品集、技术文章、读书笔记和工具推荐。',
  keywords: ['个人博客', '项目展示', '技术文章', '读书笔记', '工具推荐', '数字花园', 'portfolio'],
}

/**
 * Example 1: Basic usage with HydrationBoundary wrapping the entire app
 */
export function RootLayoutExample1({
  children,
}: {
  children: React.ReactNode
}) {
  const websiteStructuredData = generateWebsiteStructuredData({
    name: '数字花园',
    url: baseUrl,
    description: '展示项目、分享知识、记录成长。',
    authorName: 'Your Name',
    searchUrlTemplate: `${baseUrl}/search?q={search_term_string}`
  })

  return (
    <html lang="zh-CN">
      <head>
        <SEO structuredData={websiteStructuredData} />
      </head>
      <body>
        {/* HydrationBoundary wraps the entire app content */}
        <HydrationBoundary
          debug={process.env.NODE_ENV === 'development'}
          onHydrationComplete={() => console.log('✅ App hydration complete')}
        >
          <ThemeProvider>
            <AuthProvider>
              {/* LinkFixProviderProduction can work alongside HydrationBoundary */}
              <LinkFixProviderProduction />
              
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
        </HydrationBoundary>
      </body>
    </html>
  )
}

/**
 * Example 2: Granular usage with HydrationBoundary on specific components
 */
export function RootLayoutExample2({
  children,
}: {
  children: React.ReactNode
}) {
  const websiteStructuredData = generateWebsiteStructuredData({
    name: '数字花园',
    url: baseUrl,
    description: '展示项目、分享知识、记录成长。',
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
            <SkipLink href="#main-content">跳转到主要内容</SkipLink>
            <SkipLink href="#main-navigation">跳转到导航</SkipLink>
            
            <div className="min-h-screen flex flex-col">
              {/* Wrap navigation specifically as it contains links */}
              <HydrationBoundary
                fallback={<div className="h-16 bg-gray-100 animate-pulse" />}
              >
                <Header />
              </HydrationBoundary>
              
              <main id="main-content" className="flex-grow" role="main" aria-label="主要内容">
                {/* Main content wrapped separately */}
                <HydrationBoundary>
                  {children}
                </HydrationBoundary>
              </main>
              
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

/**
 * Example 3: Production-ready setup with custom fallback
 */
export function RootLayoutProduction({
  children,
}: {
  children: React.ReactNode
}) {
  const websiteStructuredData = generateWebsiteStructuredData({
    name: '数字花园',
    url: baseUrl,
    description: '展示项目、分享知识、记录成长。',
    authorName: 'Your Name',
    searchUrlTemplate: `${baseUrl}/search?q={search_term_string}`
  })

  // Custom fallback component that matches your design
  const HydrationFallback = () => (
    <div className="min-h-screen flex flex-col">
      {/* Header skeleton */}
      <div className="h-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      
      {/* Main content skeleton */}
      <main className="flex-grow p-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>
      </main>
      
      {/* Footer skeleton */}
      <div className="h-32 bg-gray-100 border-t border-gray-200" />
    </div>
  )

  return (
    <html lang="zh-CN">
      <head>
        <SEO structuredData={websiteStructuredData} />
      </head>
      <body>
        <HydrationBoundary
          fallback={<HydrationFallback />}
          debug={false} // Disable debug in production
          onHydrationComplete={() => {
            // Track hydration completion for monitoring
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'hydration_complete', {
                event_category: 'Performance',
                event_label: 'React Hydration'
              })
            }
          }}
        >
          <ThemeProvider>
            <AuthProvider>
              {/* LinkFixProviderProduction as additional safeguard */}
              <LinkFixProviderProduction />
              
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
        </HydrationBoundary>
      </body>
    </html>
  )
}

/**
 * Usage in a page component with useHydrationStatus hook
 */
'use client'

import { useHydrationStatus } from '@/components/fixes/HydrationBoundary'

export function PageWithHydrationAwareness() {
  const isHydrated = useHydrationStatus()

  return (
    <div>
      <h1>Hydration-Aware Page</h1>
      
      {/* Show different content based on hydration status */}
      {!isHydrated ? (
        <p className="text-gray-500">准备中...</p>
      ) : (
        <p className="text-green-600">页面已完全加载，链接可正常点击</p>
      )}
      
      {/* Links that will work properly after hydration */}
      <nav className="mt-4 space-x-4">
        <a href="/posts" className="text-blue-600 hover:underline">
          文章列表
        </a>
        <a href="/projects" className="text-blue-600 hover:underline">
          项目展示
        </a>
        <a href="/tools" className="text-blue-600 hover:underline">
          工具推荐
        </a>
      </nav>
    </div>
  )
}

/**
 * Integration Guide:
 * 
 * 1. Install the HydrationBoundary component:
 *    - Copy components/fixes/HydrationBoundary.tsx to your project
 * 
 * 2. Choose an integration approach:
 *    - Example 1: Wrap entire app (recommended for most cases)
 *    - Example 2: Wrap specific components (for granular control)
 *    - Example 3: Production setup with custom fallback
 * 
 * 3. Update your app/layout.tsx:
 *    - Import HydrationBoundary
 *    - Wrap your content as shown in the examples
 *    - Keep LinkFixProviderProduction as additional safeguard
 * 
 * 4. Test the implementation:
 *    - Load your site in production mode (npm run build && npm start)
 *    - Click links immediately after page load
 *    - Links should be responsive without needing to interact with search
 * 
 * 5. Monitor performance:
 *    - Use the onHydrationComplete callback for analytics
 *    - Enable debug mode in development to see hydration progress
 *    - Check browser console for any hydration warnings
 * 
 * Benefits:
 * - Fixes link clicking issue without hacky workarounds
 * - Provides smooth loading experience with fallback UI
 * - Works with React 18 concurrent features
 * - Compatible with Next.js 15 App Router
 * - Production-ready with error handling
 */

export default RootLayoutProduction