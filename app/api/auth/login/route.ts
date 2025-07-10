import { NextRequest, NextResponse }
from 'next/server' 

import { createServerClient, type CookieOptions }
from '@supabase/ssr' 

import { cookies }
from 'next/headers' 

import type { Database } from '@/types/supabase'

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const provider = String(formData.get('provider'))
  
  const cookieStore = await cookies()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
  
  // 支持多种OAuth提供商
  if (provider === 'github') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${requestUrl.origin}/auth/callback`,
      },
    })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    if (data.url) {
      return NextResponse.json({ url: data.url })
    }
  }
  
  return NextResponse.json({ error: '不支持的登录方式' }, { status: 400 })
}