'use client'

import { useEffect, useState } from 'react'

interface BrowserInfo {
  name: string
  version: string
  engine: string
  engineVersion: string
  platform: string
  userAgent: string
  vendor: string
  features: {
    webGL: boolean
    webRTC: boolean
    serviceWorker: boolean
    webAssembly: boolean
    webBluetooth: boolean
    webUSB: boolean
  }
  screen: {
    width: number
    height: number
    colorDepth: number
    pixelRatio: number
  }
  navigator: {
    language: string
    languages: string[]
    cookieEnabled: boolean
    onLine: boolean
    hardwareConcurrency: number
    maxTouchPoints: number
  }
}

export default function BrowserDetector() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null)
  const [linkTestResults, setLinkTestResults] = useState<any[]>([])
  
  useEffect(() => {
    // 收集浏览器信息
    const detectBrowser = (): BrowserInfo => {
      const ua = navigator.userAgent
      const vendor = navigator.vendor || ''
      
      // 检测浏览器名称和版本
      let name = 'Unknown'
      let version = 'Unknown'
      let engine = 'Unknown'
      let engineVersion = 'Unknown'
      
      // 检测引擎
      if (ua.includes('Gecko/')) {
        engine = 'Gecko'
        const match = ua.match(/Gecko\/(\d+)/)
        if (match) engineVersion = match[1]
      }
      if (ua.includes('AppleWebKit/')) {
        engine = 'WebKit'
        const match = ua.match(/AppleWebKit\/(\d+\.?\d*)/)
        if (match) engineVersion = match[1]
      }
      if (ua.includes('Chrome/')) {
        engine = 'Blink'
        const match = ua.match(/Chrome\/(\d+\.?\d*)/)
        if (match) engineVersion = match[1]
      }
      
      // 检测浏览器
      if (ua.includes('Dia/') || ua.includes('dia/')) {
        name = 'Dia'
        const match = ua.match(/Dia\/(\d+\.?\d*)/)
        if (match) version = match[1]
      } else if (ua.includes('Arc/')) {
        name = 'Arc'
        const match = ua.match(/Arc\/(\d+\.?\d*)/)
        if (match) version = match[1]
      } else if (ua.includes('Chrome/') && vendor.includes('Google')) {
        name = 'Chrome'
        const match = ua.match(/Chrome\/(\d+\.?\d*)/)
        if (match) version = match[1]
      } else if (ua.includes('Safari/') && vendor.includes('Apple')) {
        name = 'Safari'
        const match = ua.match(/Version\/(\d+\.?\d*)/)
        if (match) version = match[1]
      } else if (ua.includes('Firefox/')) {
        name = 'Firefox'
        const match = ua.match(/Firefox\/(\d+\.?\d*)/)
        if (match) version = match[1]
      } else if (ua.includes('Edg/')) {
        name = 'Edge'
        const match = ua.match(/Edg\/(\d+\.?\d*)/)
        if (match) version = match[1]
      }
      
      return {
        name,
        version,
        engine,
        engineVersion,
        platform: navigator.platform,
        userAgent: ua,
        vendor: vendor,
        features: {
          webGL: 'WebGLRenderingContext' in window,
          webRTC: 'RTCPeerConnection' in window,
          serviceWorker: 'serviceWorker' in navigator,
          webAssembly: 'WebAssembly' in window,
          webBluetooth: 'bluetooth' in navigator,
          webUSB: 'usb' in navigator,
        },
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio || 1,
        },
        navigator: {
          language: navigator.language,
          languages: [...(navigator.languages || [])],
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          hardwareConcurrency: navigator.hardwareConcurrency || 0,
          maxTouchPoints: navigator.maxTouchPoints || 0,
        }
      }
    }
    
    // 测试链接点击行为
    const testLinkBehavior = () => {
      const results: any[] = []
      
      // 测试1：创建测试链接
      const testLink = document.createElement('a')
      testLink.href = '#test'
      testLink.textContent = '测试链接'
      testLink.style.position = 'fixed'
      testLink.style.top = '-9999px'
      document.body.appendChild(testLink)
      
      // 测试 preventDefault
      let preventDefaultCalled = false
      testLink.addEventListener('click', (e) => {
        preventDefaultCalled = true
        e.preventDefault()
      })
      
      // 模拟点击
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
      
      testLink.dispatchEvent(clickEvent)
      
      results.push({
        test: 'preventDefault 测试',
        result: preventDefaultCalled ? '被调用' : '未被调用',
        expected: '被调用'
      })
      
      // 测试2：检查全局监听器
      const listeners = (window as any).getEventListeners?.(document)
      results.push({
        test: '全局点击监听器',
        result: listeners?.click?.length || '无法检测',
        expected: '0 或少量'
      })
      
      // 测试3：pointer-events
      const computed = window.getComputedStyle(testLink)
      results.push({
        test: 'pointer-events 默认值',
        result: computed.pointerEvents,
        expected: 'auto'
      })
      
      // 清理
      document.body.removeChild(testLink)
      
      return results
    }
    
    setBrowserInfo(detectBrowser())
    setLinkTestResults(testLinkBehavior())
  }, [])
  
  if (!browserInfo) return null
  
  const isDiaOrArc = browserInfo.name === 'Dia' || browserInfo.name === 'Arc' || 
                     browserInfo.userAgent.toLowerCase().includes('dia')
  
  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] max-h-[80vh] overflow-y-auto">
      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
        🌐 浏览器检测诊断
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className={`p-2 rounded ${isDiaOrArc ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
          <strong className="text-gray-900 dark:text-white">浏览器:</strong>{' '}
          <span className={isDiaOrArc ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
            {browserInfo.name} {browserInfo.version}
          </span>
          {isDiaOrArc && <span className="ml-2 text-red-600 dark:text-red-400">⚠️ 需要特殊处理</span>}
        </div>
        
        <div>
          <strong className="text-gray-700 dark:text-gray-300">引擎:</strong> {browserInfo.engine} {browserInfo.engineVersion}
        </div>
        
        <div>
          <strong className="text-gray-700 dark:text-gray-300">平台:</strong> {browserInfo.platform}
        </div>
        
        <div>
          <strong className="text-gray-700 dark:text-gray-300">供应商:</strong> {browserInfo.vendor || '未知'}
        </div>
        
        <details className="mt-2">
          <summary className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            User Agent 完整信息
          </summary>
          <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs break-all">
            {browserInfo.userAgent}
          </div>
        </details>
        
        <details className="mt-2">
          <summary className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            链接行为测试结果
          </summary>
          <div className="mt-1 space-y-1">
            {linkTestResults.map((test, index) => (
              <div key={index} className="p-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                <strong>{test.test}:</strong> {test.result}
                {test.result !== test.expected && (
                  <span className="ml-1 text-red-600 dark:text-red-400">
                    (期望: {test.expected})
                  </span>
                )}
              </div>
            ))}
          </div>
        </details>
        
        <details className="mt-2">
          <summary className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            浏览器特性
          </summary>
          <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
            {Object.entries(browserInfo.features).map(([feature, supported]) => (
              <div key={feature} className="flex items-center gap-1">
                <span className={supported ? 'text-green-600' : 'text-red-600'}>
                  {supported ? '✓' : '✗'}
                </span>
                <span className="text-gray-600 dark:text-gray-400">{feature}</span>
              </div>
            ))}
          </div>
        </details>
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <strong>建议:</strong>
            {isDiaOrArc ? (
              <div className="mt-1 text-orange-600 dark:text-orange-400">
                检测到 Dia/Arc 浏览器。已应用特殊链接修复。如果链接仍无法点击，请尝试：
                <ul className="list-disc list-inside mt-1">
                  <li>禁用浏览器扩展</li>
                  <li>检查浏览器的安全设置</li>
                  <li>使用 Chrome 或 Firefox</li>
                </ul>
              </div>
            ) : (
              <div className="mt-1 text-green-600 dark:text-green-400">
                浏览器兼容性良好，链接应该正常工作。
              </div>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={() => {
          const detector = document.querySelector('[data-browser-detector]')
          if (detector) detector.remove()
        }}
        className="mt-3 w-full px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        关闭
      </button>
    </div>
  )
}