'use client' import { useAuth }
from '@/contexts/AuthContext' 

import { useRouter }
from 'next/navigation' 

import { useEffect }
from 'react' interface ProtectedRouteProps { children: React.ReactNode redirectTo?: string fallback?: React.ReactNode }
export function ProtectedRoute({ children, redirectTo = '/', fallback }: ProtectedRouteProps) { const { user, loading } = useAuth() const router = useRouter() useEffect(() => { if (!loading && !user) { // 保存当前路径，登录后可以返回 const currentPath = window.location.pathname sessionStorage.setItem('redirectAfterLogin', currentPath) router.push(redirectTo) }
}, [user, loading, router, redirectTo]) // 加载中状态 if (loading) { return fallback || ( <div className="min-h-screen flex items-center justify-center">
<div className="text-center">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
<p className="mt-4 text-gray-600">加载中...</p> </div> </div> ) }
// 未登录状态 if (!user) { return fallback || ( <div className="min-h-screen flex items-center justify-center">
<div className="text-center">
<h2 className="text-2xl font-bold text-gray-900 mb-4"> 需要登录 </h2>
<p className="text-gray-600 mb-8"> 请先登录以访问此页面 </p> </div> </div> ) }
// 已登录，显示内容 return <>{children}</> }