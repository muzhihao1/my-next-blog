'use client'

import { useState } from 'react'
import { 
  SuspenseNavigationLinks, 
  SingleSuspenseNavLink,
  HydratedLink 
} from '@/components/fixes/SuspenseNavigationLinks'

/**
 * Navigation Suspense Example
 * 
 * This example demonstrates how to use the SuspenseNavigationLinks components
 * to fix the issue where navigation links are unresponsive until search box
 * or other interactive element interaction in Next.js 15.
 */
export default function NavigationSuspenseExample() {
  const [activeSection, setActiveSection] = useState('example1')

  // Example navigation links
  const mainNavLinks = [
    { href: '/', label: '首页' },
    { href: '/posts', label: '文章' },
    { href: '/about', label: '关于我' },
    { href: '/archive', label: '归档' },
    { href: '/tags', label: '标签' }
  ]

  const sidebarLinks = [
    { href: '#section1', label: '第一节', onClick: () => console.log('Section 1 clicked') },
    { href: '#section2', label: '第二节', onClick: () => console.log('Section 2 clicked') },
    { href: '#section3', label: '第三节', onClick: () => console.log('Section 3 clicked') }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">
            Navigation Suspense Example - 导航悬念示例
          </h1>
          <p className="text-gray-600 mb-6">
            演示如何使用 SuspenseNavigationLinks 组件解决 Next.js 15 中链接无响应的问题
          </p>
        </header>

        {/* Example 1: Horizontal Navigation Menu */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            示例 1: 水平导航菜单
          </h2>
          <p className="text-gray-600 mb-4">
            使用 SuspenseNavigationLinks 创建响应式水平导航
          </p>
          
          <div className="border-b border-gray-200 pb-4">
            <SuspenseNavigationLinks
              links={mainNavLinks}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              containerClassName="justify-center"
              orientation="horizontal"
            />
          </div>

          <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<SuspenseNavigationLinks
  links={mainNavLinks}
  className="text-gray-700 hover:text-blue-600"
  containerClassName="justify-center"
  orientation="horizontal"
/>`}
          </pre>
        </section>

        {/* Example 2: Vertical Sidebar Navigation */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            示例 2: 垂直侧边栏导航
          </h2>
          <p className="text-gray-600 mb-4">
            使用 SuspenseNavigationLinks 创建垂直导航，支持点击回调
          </p>
          
          <div className="flex gap-6">
            <aside className="w-48 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-3">侧边栏</h3>
              <SuspenseNavigationLinks
                links={sidebarLinks}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-all duration-200"
                orientation="vertical"
              />
            </aside>
            
            <div className="flex-1 p-4">
              <p className="text-gray-600">
                点击左侧链接查看控制台输出
              </p>
            </div>
          </div>

          <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<SuspenseNavigationLinks
  links={sidebarLinks}
  className="text-gray-600 hover:text-blue-600"
  orientation="vertical"
/>`}
          </pre>
        </section>

        {/* Example 3: Individual Links */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            示例 3: 单独的导航链接
          </h2>
          <p className="text-gray-600 mb-4">
            使用 SingleSuspenseNavLink 包装单个链接
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <SingleSuspenseNavLink
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                返回首页
              </SingleSuspenseNavLink>

              <SingleSuspenseNavLink
                href="/posts"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                查看所有文章
              </SingleSuspenseNavLink>
            </div>
          </div>

          <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<SingleSuspenseNavLink
  href="/"
  className="px-4 py-2 bg-blue-600 text-white"
>
  返回首页
</SingleSuspenseNavLink>`}
          </pre>
        </section>

        {/* Example 4: Direct HydratedLink Usage */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            示例 4: 直接使用 HydratedLink
          </h2>
          <p className="text-gray-600 mb-4">
            在需要更多控制时直接使用 HydratedLink 组件
          </p>
          
          <div className="space-y-2">
            <HydratedLink 
              href="/custom-page"
              className="text-blue-600 hover:underline"
              onClick={() => console.log('Custom link clicked')}
            >
              自定义链接示例
            </HydratedLink>
          </div>

          <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
{`<HydratedLink 
  href="/custom-page"
  className="text-blue-600 hover:underline"
  onClick={() => console.log('Custom link clicked')}
>
  自定义链接示例
</HydratedLink>`}
          </pre>
        </section>

        {/* Usage Instructions */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            使用说明
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">1. 安装组件</h3>
              <p className="text-sm">
                将 SuspenseNavigationLinks 组件复制到你的项目中
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. 导入并使用</h3>
              <pre className="p-3 bg-gray-100 rounded text-sm">
{`import { SuspenseNavigationLinks } from '@/components/fixes/SuspenseNavigationLinks'`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. 特性</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>自动处理链接水合问题</li>
                <li>支持水平和垂直布局</li>
                <li>最小性能影响</li>
                <li>兼容 Next.js 15 App Router</li>
                <li>支持自定义样式和点击回调</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. 何时使用</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>导航链接在页面加载后无响应</li>
                <li>需要与搜索框交互后链接才能点击</li>
                <li>使用 Next.js 15 App Router 的项目</li>
                <li>需要确保导航链接立即可交互</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive Test */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            交互测试
          </h2>
          <p className="text-gray-600 mb-4">
            测试导航链接是否立即响应，无需先与其他元素交互
          </p>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded">
              <p className="text-sm text-gray-600 mb-2">测试搜索框（用于对比）:</p>
              <input 
                type="text" 
                placeholder="输入搜索内容..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-4 border border-gray-200 rounded">
              <p className="text-sm text-gray-600 mb-2">测试导航链接:</p>
              <SuspenseNavigationLinks
                links={[
                  { href: '#test1', label: '测试链接 1', onClick: () => alert('链接 1 被点击!') },
                  { href: '#test2', label: '测试链接 2', onClick: () => alert('链接 2 被点击!') },
                  { href: '#test3', label: '测试链接 3', onClick: () => alert('链接 3 被点击!') }
                ]}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm">
          <p>这些组件专门解决 Next.js 15 中的链接水合问题</p>
          <p className="mt-1">确保导航链接在页面加载后立即可交互</p>
        </footer>
      </div>
    </div>
  )
}