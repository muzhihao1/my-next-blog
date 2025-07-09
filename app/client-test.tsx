'use client'

import { useEffect } from 'react'

export default function ClientTest() {
  useEffect(() => {
    console.log('✅ Client-side JavaScript is working!')
    
    // 检查 Next.js 路由是否初始化
    if (typeof window !== 'undefined' && window.next) {
      console.log('✅ Next.js router initialized')
    } else {
      console.log('❌ Next.js router NOT initialized')
    }
    
    // 监听点击事件进行调试
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A' || target.closest('a')) {
        console.log('Link clicked:', target.getAttribute('href'))
      }
    })
  }, [])
  
  return null
}