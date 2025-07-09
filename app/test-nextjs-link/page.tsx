'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TestNextJSLink() {
  const router = useRouter()
  
  const handleManualNavigation = () => {
    console.log('手动导航到 /about')
    router.push('/about')
  }
  
  return (
    <div style={{ padding: '50px' }}>
      <h1>测试 Next.js Link 组件</h1>
      
      <div style={{ marginTop: '20px' }}>
        <h2>1. 标准 Next.js Link</h2>
        <Link href="/about">
          点击这里去 About 页面
        </Link>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>2. 带样式的 Next.js Link</h2>
        <Link 
          href="/blog"
          style={{ color: 'blue', textDecoration: 'underline' }}
        >
          点击这里去 Blog 页面
        </Link>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>3. 使用 router.push</h2>
        <button onClick={handleManualNavigation}>
          使用 router.push 导航
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>4. 普通 a 标签对比</h2>
        <a href="/projects" style={{ color: 'green' }}>
          普通链接到 Projects
        </a>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>5. 外部链接测试</h2>
        <Link href="https://google.com" target="_blank">
          外部链接（应该正常工作）
        </Link>
      </div>
    </div>
  )
}