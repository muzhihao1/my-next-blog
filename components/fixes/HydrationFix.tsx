/** * HydrationFix - 确保客户端正确hydration * * 解决Next.js 15 + React 18的hydration和事件委托问题 */ 'use client' import { useEffect }
from 'react' 

import { useRouter }
from 'next/navigation' export function HydrationFix() { const router = useRouter() useEffect(() => { // 只在客户端运行 if (typeof window === 'undefined') return console.log('💧 HydrationFix: 开始修复hydration问题') // 1. 确保React已完成hydration const checkHydration = () => { const reactRoot = document.getElementById('__next') if (reactRoot && !reactRoot.hasAttribute('data-hydration-fixed')) { // 标记hydration已修复 reactRoot.setAttribute('data-hydration-fixed', 'true') // 2. 强制触发一次微小的DOM更新 requestAnimationFrame(() => { document.body.classList.add('hydrated') // 3. 确保Next.js路由系统已准备好 router.prefetch(window.location.pathname) // 4. 分发自定义事件，通知其他组件 window.dispatchEvent(new CustomEvent('hydrationComplete')) console.log('💧 HydrationFix: Hydration修复完成') }) }
}
// 5. 使用多种时机确保修复成功 // 立即执行 checkHydration() // DOM内容加载完成后 if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', checkHydration) }
// 页面完全加载后 window.addEventListener('load', checkHydration) // React可能的异步渲染完成后 const timer = setTimeout(checkHydration, 0) // 6. 修复可能的事件委托问题 const fixEventDelegation = () => { // 获取所有Next.js Link组件渲染的链接 const links = document.querySelectorAll('a[href^="/"]') links.forEach(link => { // 确保链接有正确的事件处理 if (!link.hasAttribute('data-event-fixed')) { link.setAttribute('data-event-fixed', 'true') // 如果点击无效，添加备用处理 link.addEventListener('click', (e) => { // 检查是否已被Next.js处理 if (!e.defaultPrevented && link instanceof HTMLAnchorElement) { const href = link.getAttribute('href') if (href && href.startsWith('/')) { console.log('💧 HydrationFix: 使用备用导航', href) e.preventDefault() router.push(href) }
} }, { capture: false, passive: false }) }
}) }
// 延迟执行事件修复 const eventTimer = setTimeout(fixEventDelegation, 100) // 清理 return () => { clearTimeout(timer) clearTimeout(eventTimer) document.removeEventListener('DOMContentLoaded', checkHydration) window.removeEventListener('load', checkHydration) }
}, [router]) return null }