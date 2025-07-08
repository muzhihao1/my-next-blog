import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
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