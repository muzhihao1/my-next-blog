'use client' /** * 错误边界组件 * 捕获子组件的 JavaScript 错误，记录错误信息，并显示备用 UI */
import { Component, ReactNode, ErrorInfo }
from 'react' 

import { reportError }
from '@/lib/monitoring/sentry' interface Props { children: ReactNode fallback?: ReactNode }
interface State { hasError: boolean error: Error | null }
/** * 错误边界组件 */
export class ErrorBoundary extends Component<Props, State> { constructor(props: Props) { super(props) this.state = { hasError: false, error: null }
}
static getDerivedStateFromError(error: Error): State { // 更新 state 使下一次渲染能够显示降级后的 UI return { hasError: true, error }
}
componentDidCatch(error: Error, errorInfo: ErrorInfo) { // 将错误日志上报给 Sentry reportError(error, errorInfo) // 同时在控制台输出，方便开发调试 console.error('ErrorBoundary caught an error:', error, errorInfo) }
handleReset = () => { this.setState({ hasError: false, error: null }) }
render() { if (this.state.hasError) { // 如果提供了自定义的 fallback 组件，使用它 if (this.props.fallback) { return this.props.fallback }
// 否则显示默认的错误界面 return ( <div className="min-h-[400px]
flex items-center justify-center p-8">
<div className="text-center max-w-md">
<div className="mb-8">
<svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> </svg> </div>
<h2 className="text-2xl font-semibold text-gray-900 mb-4"> 页面出现了错误 </h2>
<p className="text-gray-600 mb-6"> 抱歉，页面遇到了一些问题。这个错误已经被记录，我们会尽快修复。 </p>
<div className="flex flex-col sm:flex-row gap-4 justify-center">
<button onClick={this.handleReset}
className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" > 重试 </button>
<button onClick={() => window.location.href = '/'}
className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300:bg-gray-600 transition-colors" > 返回首页 </button> </div> {/* 开发环境显示错误详情 */} {process.env.NODE_ENV === 'development' && this.state.error && ( <details className="mt-8 text-left">
<summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700:text-gray-300"> 查看错误详情（仅开发环境可见） </summary>
<pre className="mt-4 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
<code className="text-red-600"> {this.state.error.toString()} {'\n\n'} {this.state.error.stack} </code> </pre> </details> )} </div> </div> ) }
return this.props.children }
}/** * 带有错误边界的异步组件包装器 */
export function withErrorBoundary<P extends object>( Component: React.ComponentType<P>, fallback?: ReactNode ) { return function WrappedComponent(props: P) { return ( <ErrorBoundary fallback={fallback}>
<Component {...props}
/> </ErrorBoundary> ) } }