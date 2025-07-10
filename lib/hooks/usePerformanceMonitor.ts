'use client' import { useEffect }
from 'react' export function usePerformanceMonitor() { useEffect(() => { // 监控页面加载性能 if (typeof window !== 'undefined' && window.performance) { const perfData = window.performance.getEntriesByType('navigation')[0]
as PerformanceNavigationTiming if (perfData) { const pageLoadTime = perfData.loadEventEnd - perfData.fetchStart const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart const tcpTime = perfData.connectEnd - perfData.connectStart const ttfb = perfData.responseStart - perfData.fetchStart const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart console.log('Performance Metrics:', { pageLoadTime: `${pageLoadTime.toFixed(2)}
ms`, dnsTime: `${dnsTime.toFixed(2)}
ms`, tcpTime: `${tcpTime.toFixed(2)}
ms`, ttfb: `${ttfb.toFixed(2)}
ms`, domContentLoaded: `${domContentLoaded.toFixed(2)}
ms` }) }
}
// 监控 Web Vitals if ('web-vital' in window) { // @ts-ignore window['web-vital']?.getCLS?.((metric: any) => console.log('CLS:', metric.value)) // @ts-ignore window['web-vital']?.getFID?.((metric: any) => console.log('FID:', metric.value)) // @ts-ignore window['web-vital']?.getLCP?.((metric: any) => console.log('LCP:', metric.value)) }
}, []) }