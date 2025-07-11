/** * 动画相关的自定义 Hooks * 提供便捷的动画功能接口 */
import { useEffect, useState }
from 'react' 

import { useAnimation, AnimationControls, useInView, useReducedMotion }
from 'framer-motion' 

import { useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * 检测元素是否在视口内并触发动画
 */
export function useScrollAnimation(threshold = 0.1, triggerOnce = true) {
  const controls = useAnimation()
  const ref = useInView({
    threshold,
    triggerOnce,
  })
  
  useEffect(() => {
    if (ref) {
      controls.start('visible')
    }
    else if (!triggerOnce) {
      controls.start('hidden')
    }
  }, [ref, controls, triggerOnce])
  
  return { ref, controls }
}

/**
 * 延迟显示动画
 */
export function useDelayedAnimation(delay: number = 0) {
  const controls = useAnimation()
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
      controls.start('visible')
    }, delay * 1000)
    
    return () => clearTimeout(timer)
  }, [delay, controls])
  
  return { controls, isReady }
}

/**
 * 交错动画控制
 */
export function useStaggerAnimation(itemCount: number, staggerDelay: number = 0.1) {
  const controls = useAnimation()
  
  const startAnimation = async () => {
    await controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * staggerDelay,
      },
    }))
  }
  
  return { controls, startAnimation }
}

/**
 * 检测用户是否开启了减少动画偏好
 */
export function useReducedMotionPreference() {
  const prefersReducedMotion = useReducedMotion()
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)
  
  useEffect(() => {
    // 检查系统设置
    if (prefersReducedMotion) {
      setShouldReduceMotion(true)
      return
    }
    
    // 检查本地存储的用户偏好
    const userPreference = localStorage.getItem('reduceMotion')
    if (userPreference === 'true') {
      setShouldReduceMotion(true)
    }
  }, [prefersReducedMotion])
  
  const toggleReducedMotion = (value: boolean) => {
    setShouldReduceMotion(value)
    localStorage.setItem('reduceMotion', value.toString())
  }
  
  return { shouldReduceMotion, toggleReducedMotion }
}

/**
 * 根据滚动位置控制动画
 */
export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(Math.min(progress, 100))
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return scrollProgress
}

/**
 * 鼠标跟随动画
 */
export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
window.addEventListener('mousemove', handleMouseMove) return () => window.removeEventListener('mousemove', handleMouseMove) }, []) return mousePosition }
/** * 视差滚动效果 */
export function useParallax(speed: number = 0.5) { const [offset, setOffset] = useState(0) useEffect(() => { const handleScroll = () => { setOffset(window.scrollY * speed) }
window.addEventListener('scroll', handleScroll) return () => window.removeEventListener('scroll', handleScroll) }, [speed]) return offset }
/** * 响应式动画配置 */
export function useResponsiveAnimation() { const isMobile = useMediaQuery('(max-width: 768px)') const isTablet = useMediaQuery('(max-width: 1024px)') const prefersReducedMotion = useReducedMotion() const getAnimationConfig = () => { if (prefersReducedMotion) { return { duration: 0, delay: 0, stagger: 0, }
}
if (isMobile) { return { duration: 0.2, delay: 0.05, stagger: 0.03, }
}
if (isTablet) { return { duration: 0.25, delay: 0.08, stagger: 0.04, }
}
return { duration: 0.3, delay: 0.1, stagger: 0.05, }
}
return getAnimationConfig() }
/** * 页面加载动画 */
export function usePageLoadAnimation() { const controls = useAnimation() const [isLoaded, setIsLoaded] = useState(false) useEffect(() => { const handleLoad = () => { setIsLoaded(true) controls.start('visible') }
if (document.readyState === 'complete') { handleLoad() }
else { window.addEventListener('load', handleLoad) return () => window.removeEventListener('load', handleLoad) }
}, [controls]) return { controls, isLoaded }
}/** * 路由切换动画 */
export function useRouteAnimation() { const controls = useAnimation() const animatePageIn = async () => { await controls.start({ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' }, }) }
const animatePageOut = async () => { await controls.start({ opacity: 0, y: -20, transition: { duration: 0.2, ease: 'easeIn' }, }) }
return { controls, animatePageIn, animatePageOut } }