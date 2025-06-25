import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '我的个人博客',
  description: '分享我的想法和经验',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          <header className="border-b">
            <nav className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex justify-between items-center">
                <a href="/" className="text-2xl font-bold">我的博客</a>
                <div className="space-x-6">
                  <a href="/" className="hover:text-gray-600">首页</a>
                  <a href="/about" className="hover:text-gray-600">关于我</a>
                </div>
              </div>
            </nav>
          </header>
          <main className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t mt-12">
            <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600">
              © 2024 我的博客. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}