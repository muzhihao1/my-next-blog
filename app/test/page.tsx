'use client'

import { useTheme } from '@/lib/hooks/useTheme'
import { useState } from 'react'
import Link from 'next/link'

export default function TestPage() {
  const { theme, toggleTheme } = useTheme()
  const [viewport, setViewport] = useState('desktop')

  const pages = [
    { name: '首页', path: '/' },
    { name: '项目', path: '/projects' },
    { name: '博客', path: '/blog' },
    { name: '书架', path: '/bookshelf' },
    { name: '工具', path: '/tools' },
    { name: '关于', path: '/about' },
    { name: '归档', path: '/archive' },
  ]

  const viewportSizes = {
    mobile: '375px',
    tablet: '768px',
    desktop: '1280px'
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">测试页面</h1>
        
        {/* 主题测试 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">深色模式测试</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="mb-4">当前主题: <strong>{theme}</strong></p>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              切换主题
            </button>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded">
                <p className="text-gray-900 dark:text-white">主要文本</p>
                <p className="text-gray-600 dark:text-gray-400">次要文本</p>
                <p className="text-blue-600 dark:text-blue-400">链接文本</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-500">渐变测试</p>
              </div>
            </div>
          </div>
        </section>

        {/* 响应式测试 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">响应式设计测试</h2>
          <div className="space-y-2 mb-4">
            {Object.entries(viewportSizes).map(([name, size]) => (
              <button
                key={name}
                onClick={() => setViewport(name)}
                className={`px-4 py-2 rounded mr-2 ${
                  viewport === name 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {name} ({size})
              </button>
            ))}
          </div>
          
          <div 
            className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden mx-auto transition-all duration-300"
            style={{ width: viewportSizes[viewport as keyof typeof viewportSizes] }}
          >
            <div className="bg-gray-100 dark:bg-gray-800 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-700 p-4 rounded">
                  <div className="w-full h-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <p className="text-sm">响应式卡片 1</p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded">
                  <div className="w-full h-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <p className="text-sm">响应式卡片 2</p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded">
                  <div className="w-full h-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <p className="text-sm">响应式卡片 3</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 页面链接测试 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">页面导航测试</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pages.map((page) => (
              <Link
                key={page.path}
                href={page.path}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center"
              >
                <p className="font-medium">{page.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{page.path}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 组件测试 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">UI 组件测试</h2>
          <div className="space-y-4">
            {/* 按钮 */}
            <div>
              <h3 className="text-lg font-medium mb-2">按钮</h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">主要按钮</button>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">次要按钮</button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800">边框按钮</button>
              </div>
            </div>
            
            {/* 输入框 */}
            <div>
              <h3 className="text-lg font-medium mb-2">输入框</h3>
              <input
                type="text"
                placeholder="测试输入框"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* 标签 */}
            <div>
              <h3 className="text-lg font-medium mb-2">标签</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">已完成</span>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm">进行中</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}