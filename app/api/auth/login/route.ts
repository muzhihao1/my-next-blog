import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const provider = String(formData.get('provider'))
  
  const supabase = await createClient()
  
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