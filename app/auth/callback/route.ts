import { NextRequest, NextResponse }
from 'next/server' 

import { createClient }
from '@/lib/supabase/server' 

export async function GET(request: NextRequest) { 
  const requestUrl = new URL(request.url) 
  const code = requestUrl.searchParams.get('code') 
  const error = requestUrl.searchParams.get('error') 
  const errorDescription = requestUrl.searchParams.get('error_description') 
  
  // 处理 OAuth 错误 
  if (error) { 
    console.error('OAuth error:', error, errorDescription) 
    const redirectUrl = new URL('/', requestUrl.origin) 
    redirectUrl.searchParams.set('auth_error', errorDescription || error) 
    return NextResponse.redirect(redirectUrl) 
  }
  if (code) {
    const supabase = await createClient()
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!sessionError) {
      // 检查是否有保存的重定向路径
      const response = NextResponse.redirect(new URL('/', requestUrl.origin))
      response.cookies.set('auth_redirect_handled', 'true', {
        maxAge: 5, // 5秒后过期
        httpOnly: true,
        sameSite: 'lax'
      })
      return response
    }
    else {
      console.error('Session exchange error:', sessionError)
      const redirectUrl = new URL('/', requestUrl.origin)
      redirectUrl.searchParams.set('auth_error', '登录失败，请重试')
      return NextResponse.redirect(redirectUrl)
    }
}
  
  // 如果没有 code，重定向到主页
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}