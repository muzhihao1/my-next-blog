'use client'

import { useEffect } from 'react'

/**
 * 极简链接修复提供者
 * 
 * 只做最基础的修复，确保 Chrome 正常工作
 * 不进行任何激进的优化，保持高性能
 */
export function LinkFixProviderMinimal() {
  useEffect(() => {
    // 仅在开发环境运行
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ 生产环境，跳过链接修复')
      return
    }
    
    console.log('🔧 极简链接修复已启动（仅开发环境）')
    
    // 仅修复 Next.js Portal
    const fixPortal = () => {
      const portal = document.querySelector('nextjs-portal') as HTMLElement
      if (portal && portal.style.pointerEvents !== 'none') {
        portal.style.pointerEvents = 'none'
        console.log('✅ 修复了 Next.js Portal')
      }
    }
    
    // 初始修复
    fixPortal()
    
    // 仅在 Portal 可能重新出现时检查（5秒一次）
    const interval = setInterval(fixPortal, 5000)
    
    // 清理
    return () => {
      clearInterval(interval)
    }
  }, [])
  
  return null
}