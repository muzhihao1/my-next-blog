import { NextRequest, NextResponse }
from 'next/server' 

import { createServerClient, type CookieOptions }
from '@supabase/ssr' 

import { cookies }
from 'next/headers' 

import type { Database } from '@/types/supabase'

export async function GET(request: NextRequest) {
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
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  
  // 获取用户的profile信息
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      avatar_url: user.user_metadata?.avatar_url || profile?.avatar_url,
      display_name: profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0],
      username: profile?.username,
      bio: profile?.bio,
      website: profile?.website,
      github_username: profile?.github_username || user.user_metadata?.user_name,
      twitter_username: profile?.twitter_username,
    }
  })
}