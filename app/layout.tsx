import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '无题之墨 - 个人博客',
  description: '记录生活，分享思考',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen bg-white">
          <header className="bg-pink-600 text-white">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-between h-12">
                <a href="/" className="text-xl font-bold">无题之墨</a>
                
                <nav className="flex items-center space-x-6">
                  <a href="/" className="text-white/90 hover:text-white text-sm">主页</a>
                  <a href="/archive" className="text-white/90 hover:text-white text-sm">人生档案</a>
                  <a href="/search" className="text-white/90 hover:text-white text-sm">搜索挖坟</a>
                  <a href="/about" className="text-white/90 hover:text-white text-sm">自述档案</a>
                  <a href="/subscribe" className="text-white/90 hover:text-white text-sm">人生邀请</a>
                  
                  <div className="flex items-center space-x-4 ml-6">
                    <button className="text-white/90 hover:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    <a href="/login" className="text-white/90 hover:text-white text-sm">Sign in</a>
                    <button className="bg-white text-pink-600 px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-100">
                      Subscribe
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </header>

          <main>
            {children}
          </main>

          <footer className="mt-24 border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-4 py-12">
              <div className="text-center text-sm text-gray-500">
                <p>© 2024 无题之墨. All rights reserved.</p>
                <p className="mt-2">
                  <a href="/privacy" className="hover:text-gray-700">隐私政策</a>
                  <span className="mx-2">·</span>
                  <a href="/terms" className="hover:text-gray-700">使用条款</a>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}