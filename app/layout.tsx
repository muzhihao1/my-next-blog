import './globals.css'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header' 
import { Footer } from '@/components/layout/Footer' 
import { SEO, generateWebsiteStructuredData } from '@/components/seo/SEO' 
import { AuthProvider } from '@/contexts/AuthContext' 
import { SkipLink } from '@/components/a11y/AriaLabels'
import { siteConfig, generateKeywords } from '@/lib/seo-config'
import { AuthModalProvider } from '@/components/auth/AuthModalProvider'
import { ThemeProvider } from '@/components/theme/ThemeProvider' 
import { LinkFixProvider } from './link-fix-provider'

// 历史版本 - 保留作为参考 
// import { LinkFixProviderV3 } from './link-fix-provider-v3' 
// import { LinkFixProviderV4 } from './link-fix-provider-v4' 
// import { LinkFixProviderV5 } from './link-fix-provider-v5' 
// import { LinkFixProviderFinal } from './link-fix-provider-final' 
// import { LinkFixProviderUltimate } from './link-fix-provider-ultimate'
// import { LinkFixProviderBrowserSpecific } from './link-fix-provider-browser-specific'
// import { LinkFixProviderWebKit } from './link-fix-provider-webkit'
// import { LinkFixProviderMinimal } from './link-fix-provider-minimal'
// 诊断工具 - 需要时取消注释
// import { LinkFixProviderV2 } from './link-fix-provider-v2' // import ComponentIsolationTester from '@/components/debug/ComponentIsolationTester' // import EnhancedEventScanner from '@/components/debug/EnhancedEventScanner' // import ThirdPartyDetector from '@/components/debug/ThirdPartyDetector' // import NextjsPortalInvestigator from '@/components/debug/NextjsPortalInvestigator' // import BrowserDetector from '@/components/debug/BrowserDetector' 
// 临时移除所有诊断工具 
// import GlobalListenerChecker from './global-listener-checker' 
// import DeepDiagnostics from './deep-diagnostics' 
// import PreventDefaultTracker from './prevent-default-tracker' 
// import OverlapInvestigator from './overlap-investigator' 
// import EventFlowTracer from './event-flow-tracer' 
// import LinkFixFinder from './link-fix-finder' 

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: generateKeywords(),
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  openGraph: {
    type: siteConfig.openGraph.type,
    locale: siteConfig.openGraph.locale,
    url: siteConfig.url,
    siteName: siteConfig.openGraph.site_name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.defaultImage,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      }
    ],
  },
  twitter: {
    card: siteConfig.twitter.card,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.defaultImage],
    creator: siteConfig.twitter.creator,
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
    canonical: siteConfig.url,
    languages: {
      'zh-CN': siteConfig.url,
    },
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: 'Peter的人生实验室 RSS Feed' }
      ],
      'application/atom+xml': [
        { url: '/atom.xml', title: 'Peter的人生实验室 Atom Feed' }
      ],
      'application/feed+json': [
        { url: '/feed.json', title: 'Peter的人生实验室 JSON Feed' }
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
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    authorName: siteConfig.author,
    searchUrlTemplate: `${siteConfig.url}/search?q={search_term_string}`
  })
  
  return (
    <html lang="zh-CN">
      <head>
        <SEO structuredData={websiteStructuredData} />
      </head>
      <body>
        {/* 诊断工具 - 需要时取消注释 
        <ThirdPartyDetector />
        <NextjsPortalInvestigator />
        <ComponentIsolationTester />
        <EnhancedEventScanner /> 
        */}
        <ThemeProvider>
          <AuthProvider>
          {/* 暂时禁用 LinkFixProvider 以排查导航问题 */}
          {/* <LinkFixProvider> */}
          {/* 跳转链接 - 提升可访问性 */}
          <SkipLink href="#main-content">跳转到主要内容</SkipLink>
          <SkipLink href="#main-navigation">跳转到导航</SkipLink>
          
          <div className="min-h-screen flex flex-col">
            <Header />
            <main 
              id="main-content" 
              className="flex-grow" 
              role="main" 
              aria-label="主要内容"
            >
              {children}
            </main>
            <Footer />
          </div>
          
          {/* 全局认证模态框 */}
          <AuthModalProvider />
          {/* </LinkFixProvider> */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}