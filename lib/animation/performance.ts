/** * 动画性能优化配置 * 确保动画流畅且不影响性能 */
import { MotionConfig }
from "framer-motion";
// 性能监控 export class AnimationPerformanceMonitor { private static instance: AnimationPerformanceMonitor private frameDropThreshold = 10 // 掉帧阈值 private lastFrameTime = 0 private frameCount = 0 private isReducedMotion = false static getInstance() { if (!this.instance) { this.instance = new AnimationPerformanceMonitor() }
return this.instance }
constructor() { this.checkReducedMotion() this.startMonitoring() }
private checkReducedMotion() { if (typeof window !== 'undefined') { const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)') this.isReducedMotion = mediaQuery.matches mediaQuery.addEventListener('change', (e) => { this.isReducedMotion = e.matches }) }
}
private startMonitoring() { if (typeof window === 'undefined') return let lastTime = performance.now() let frames = 0 let fps = 60 const measureFPS = () => { frames++ const currentTime = performance.now() if (currentTime >= lastTime + 1000) { fps = Math.round((frames * 1000) / (currentTime - lastTime)) frames = 0 lastTime = currentTime // 如果FPS低于阈值，建议减少动画 if (fps < 60 - this.frameDropThreshold) { this.handleLowPerformance(fps) }
}
requestAnimationFrame(measureFPS) }
requestAnimationFrame(measureFPS) }
private handleLowPerformance(fps: number) { console.warn(`Low FPS detected: ${fps}. Consider reducing animations.`) // 可以在这里触发全局事件，让应用减少动画复杂度 window.dispatchEvent(new CustomEvent('lowPerformance', { detail: { fps }
})) }
shouldReduceMotion() { return this.isReducedMotion }
}
// 动画优化配置 export const animationOptimizations = { // GPU加速 gpuAcceleration: { transform: 'translateZ(0)', willChange: 'transform', backfaceVisibility: 'hidden', perspective: 1000, }, // 减少重绘 reduceRepaints: { contain: 'layout style paint', contentVisibility: 'auto', }, // 图层优化 layerOptimization: { isolation: 'isolate', zIndex: 1, }, }
// 根据设备性能调整动画 export function getDeviceOptimizedConfig() { if (typeof window === 'undefined') { return { reducedMotion: false, lowPowerMode: false }
}
// 检测设备性能 const memory = (navigator as any).deviceMemory || 4 const cores = navigator.hardwareConcurrency || 4 // 低性能设备判断 const isLowEndDevice = memory < 4 || cores < 4 // 检测电池状态 let isLowPowerMode = false if ('getBattery' in navigator) { (navigator as any).getBattery().then((battery: any) => { isLowPowerMode = battery.level < 0.2 && battery.charging === false }) }
return { reducedMotion: isLowEndDevice, lowPowerMode: isLowPowerMode, transitionDuration: isLowEndDevice ? 0.2 : 0.3, staggerDelay: isLowEndDevice ? 0.03 : 0.05, maxAnimations: isLowEndDevice ? 3 : 10, }
}
// 防抖动画触发 export function debounceAnimation(func: Function, wait: number) { let timeout: NodeJS.Timeout return function executedFunction(...args: any[]) { const later = () => { clearTimeout(timeout) func(...args) }
clearTimeout(timeout) timeout = setTimeout(later, wait) }
}
// 节流动画触发 export function throttleAnimation(func: Function, limit: number) { let inThrottle: boolean return function(...args: any[]) { if (!inThrottle) { func.apply(this, args) inThrottle = true setTimeout(() => inThrottle = false, limit) }
} }
// 动画队列管理 export class AnimationQueue { private queue: Array<() => Promise<void>> = []
private isProcessing = false private maxConcurrent = 3 private running = 0 async add(animation: () => Promise<void>) { this.queue.push(animation) this.process() }
private async process() { if (this.isProcessing || this.running >= this.maxConcurrent) return this.isProcessing = true while (this.queue.length > 0 && this.running < this.maxConcurrent) { const animation = this.queue.shift() if (animation) { this.running++ animation().finally(() => { this.running-- this.process() }) }
}
this.isProcessing = false }
}
// 视口内动画控制 export function isInViewport(element: HTMLElement, threshold = 0) { const rect = element.getBoundingClientRect() return ( rect.top >= -threshold && rect.left >= -threshold && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold && rect.right <= (window.innerWidth || document.documentElement.clientWidth) + threshold ) }
// 批量动画优化 export function batchAnimations(animations: Array<() => void>) { requestAnimationFrame(() => { animations.forEach(animate => animate()) }) }
// 动画预加载 export function preloadAnimation(animationName: string) { // 预加载关键动画帧 const style = document.createElement('style') style.innerHTML = ` @keyframes ${animationName}-preload { from { opacity: 1; }
to { opacity: 1; }
}.animation-preload { animation: ${animationName}-preload 0.1s; } ` document.head.appendChild(style) // 创建隐藏元素触发动画加载 const preloader = document.createElement('div') preloader.className = 'animation-preload' preloader.style.position = 'absolute' preloader.style.visibility = 'hidden' document.body.appendChild(preloader) setTimeout(() => { document.body.removeChild(preloader) document.head.removeChild(style) }, 100) }
