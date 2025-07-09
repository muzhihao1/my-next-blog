'use client'

import Link from 'next/link'

export default function TestLinks() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">链接测试页面</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Next.js Link 组件</h2>
          <Link href="/" className="text-blue-600 hover:underline block">
            Link 组件 - 首页
          </Link>
          <Link href="/blog" className="text-blue-600 hover:underline block">
            Link 组件 - 博客
          </Link>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">普通 a 标签</h2>
          <a href="/" className="text-green-600 hover:underline block">
            a 标签 - 首页
          </a>
          <a href="/blog" className="text-green-600 hover:underline block">
            a 标签 - 博客
          </a>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">按钮测试</h2>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
          >
            JS 跳转 - 首页
          </button>
          <button 
            onClick={() => console.log('Button clicked!')}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            控制台日志
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">当前环境信息</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
{JSON.stringify({
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  hasNotionToken: !!process.env.NOTION_TOKEN,
  hasNotionDb: !!process.env.NOTION_DATABASE_ID,
}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}