import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  // 直接使用环境变量，让 Next.js 在构建时替换
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}