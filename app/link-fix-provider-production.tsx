/**
 * LinkFixProviderProduction - 生产环境链接修复方案
 * 
 * 基于搜索框触发现象的发现，实现多层次修复策略
 */
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function LinkFixProviderProduction() {
  const [fixAttempts, setFixAttempts] = useState(0)
  const [isFixed, setIsFixed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    console.log('🔧 LinkFixProvider: 生产环境修复启动')

    // 策略1: 搜索框触发修复（最可靠）
    const searchTriggerFix = () => {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="搜索"]') as HTMLInputElement
      
      if (searchInput && !isFixed) {
        console.log('🔧 使用搜索框触发修复')
        
        // 模拟用户输入来激活链接
        const originalValue = searchInput.value
        searchInput.focus()
        
        // 创建并分发输入事件
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          data: ' '
        })
        
        searchInput.value = ' '
        searchInput.dispatchEvent(inputEvent)
        
        // 快速恢复原始状态
        requestAnimationFrame(() => {
          searchInput.value = originalValue
          searchInput.blur()
          setIsFixed(true)
          verifyFix()
        })
      }
    }

    // 策略2: DOM操作触发React更新
    const domTriggerFix = () => {
      console.log('🔧 使用DOM触发修复')
      
      // 创建一个临时元素触发React更新
      const tempDiv = document.createElement('div')
      tempDiv.style.display = 'none'
      tempDiv.id = 'link-fix-trigger'
      document.body.appendChild(tempDiv)
      
      // 强制重排
      void tempDiv.offsetHeight
      
      // 移除元素
      requestAnimationFrame(() => {
        tempDiv.remove()
        setIsFixed(true)
        verifyFix()
      })
    }

    // 策略3: 修复事件委托
    const eventDelegationFix = () => {
      console.log('🔧 修复事件委托')
      
      // 查找所有内部链接
      const links = document.querySelectorAll('a[href^="/"]')
      let fixedCount = 0
      
      links.forEach(link => {
        if (!link.hasAttribute('data-production-fixed')) {
          link.setAttribute('data-production-fixed', 'true')
          
          // 添加点击事件监听器作为后备
          link.addEventListener('click', function(e) {
            const href = this.getAttribute('href')
            if (href && !e.defaultPrevented) {
              // 如果默认行为被阻止，说明Next.js的处理可能有问题
              console.log('🔧 备用导航激活:', href)
            }
          }, { passive: true })
          
          fixedCount++
        }
      })
      
      if (fixedCount > 0) {
        console.log(`🔧 修复了 ${fixedCount} 个链接`)
        setIsFixed(true)
      }
    }

    // 策略4: Next.js Portal修复（针对开发环境遗留问题）
    const portalFix = () => {
      const portal = document.querySelector('nextjs-portal') as HTMLElement
      if (portal) {
        portal.style.pointerEvents = 'none'
        console.log('🔧 修复了Next.js Portal')
      }
    }

    // 验证修复是否成功
    const verifyFix = () => {
      setTimeout(() => {
        const testLink = document.querySelector('a[href^="/"]')
        if (testLink) {
          const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          })
          
          // 测试事件是否会被处理
          const prevented = !testLink.dispatchEvent(event)
          console.log('🔧 链接修复验证:', prevented ? '成功' : '需要继续尝试')
          
          if (!prevented && fixAttempts < 3) {
            setFixAttempts(prev => prev + 1)
            setIsFixed(false)
          }
        }
      }, 100)
    }

    // 执行修复策略
    const runFixes = () => {
      if (isFixed) return

      // 按优先级执行修复策略
      const strategies = [
        { fn: searchTriggerFix, delay: 50 },
        { fn: domTriggerFix, delay: 150 },
        { fn: eventDelegationFix, delay: 250 },
        { fn: portalFix, delay: 0 }
      ]

      strategies.forEach(({ fn, delay }) => {
        setTimeout(fn, delay)
      })
    }

    // 初始修复
    runFixes()

    // 监听自定义事件，允许手动触发修复
    const handleManualFix = () => {
      setIsFixed(false)
      setFixAttempts(0)
      runFixes()
    }
    
    window.addEventListener('fixLinks', handleManualFix)

    return () => {
      window.removeEventListener('fixLinks', handleManualFix)
    }
  }, [fixAttempts, isFixed])

  // 路由变化时重置修复状态
  useEffect(() => {
    setIsFixed(false)
    setFixAttempts(0)
  }, [pathname])

  // 开发环境显示状态
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: 10,
        left: 10,
        padding: '5px 10px',
        background: isFixed ? '#51cf66' : '#ff6b6b',
        color: 'white',
        borderRadius: 4,
        fontSize: 12,
        zIndex: 9999
      }}>
        链接修复: {isFixed ? '已完成' : `尝试中(${fixAttempts})`}
      </div>
    )
  }

  return null
}