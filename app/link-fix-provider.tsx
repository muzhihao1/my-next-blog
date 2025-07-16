'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function LinkFixProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  useEffect(() => {
    // 修复点击事件
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (!link) return
      
      const href = link.getAttribute('href')
      if (!href) return
      
      // 检查是否为内部链接
      if (href.startsWith('/') || href.startsWith('#')) {
        e.preventDefault()
        
        if (href.startsWith('#')) {
          // 处理锚点链接
          const element = document.querySelector(href)
          element?.scrollIntoView({ behavior: 'smooth' })
        } else {
          // 使用 Next.js router 进行导航
          router.push(href)
        }
      }
    }
    
    // 添加全局点击监听器
    document.addEventListener('click', handleClick, true)
    
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [router])
  
  return <>{children}</>
}