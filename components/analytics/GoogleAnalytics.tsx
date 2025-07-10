/** * Google Analytics 4 集成组件 */
import Script from 'next/script' interface GoogleAnalyticsProps { /** * Google Analytics 测量 ID */
measurementId?: string }
/** * Google Analytics 组件 */
export default function GoogleAnalytics({ measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID }: GoogleAnalyticsProps) { if (!measurementId) { return null }
return ( <> {/* Google Analytics Script */}
<Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
strategy="afterInteractive" />
<Script id="google-analytics" strategy="afterInteractive"> {` window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}
gtag('js', new Date()); gtag('config', '${measurementId}', { page_path: window.location.pathname, }); `} </Script> </> ) }
/** * 跟踪事件 */
export function trackEvent( action: string, category: string, label?: string, value?: number ) { if (typeof window !== 'undefined' && window.gtag) { window.gtag('event', action, { event_category: category, event_label: label, value: value, }) }
}/** * 跟踪页面浏览 */
export function trackPageView(url: string) { if (typeof window !== 'undefined' && window.gtag) { window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, { page_path: url, }) }
}/** * 跟踪自定义事件的预定义函数 */
export const analyticsEvents = { // 内容交互 viewArticle: (title: string) => trackEvent('view_article', 'engagement', title), shareArticle: (title: string, method: string) => trackEvent('share', 'engagement', `${title} - ${method}`), likeArticle: (title: string) => trackEvent('like', 'engagement', title), // 导航事件 useSearch: (query: string) => trackEvent('search', 'navigation', query), clickNavLink: (link: string) => trackEvent('click_nav', 'navigation', link), // 外部链接 clickExternalLink: (url: string) => trackEvent('click_external', 'outbound', url), clickGitHubLink: (repo: string) => trackEvent('click_github', 'outbound', repo), // 订阅事件 subscribeAttempt: () => trackEvent('subscribe_attempt', 'conversion'), subscribeSuccess: () => trackEvent('subscribe_success', 'conversion'), subscribeFail: (error: string) => trackEvent('subscribe_fail', 'conversion', error), // 评论事件 viewComments: () => trackEvent('view_comments', 'engagement'), writeComment: () => trackEvent('write_comment', 'engagement'), // 工具和项目 viewProject: (name: string) => trackEvent('view_project', 'content', name), viewTool: (name: string) => trackEvent('view_tool', 'content', name), viewBook: (title: string) => trackEvent('view_book', 'content', title), // 性能监控 reportWebVitals: (metric: { name: string; value: number }) => trackEvent(metric.name, 'Web Vitals', undefined, Math.round(metric.value)), }
// 声明全局 gtag 函数类型 declare global { interface Window { gtag: ( command: 'config' | 'event' | 'js' | 'set', targetId: string, config?: any ) => void dataLayer: any[]
} }