import { createBrowserClient }
from '@supabase/ssr' 
import type { Database }
from '@/types/supabase' export function createClient() { // 检查环境变量是否存在 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // 如果环境变量不存在，返回一个 mock 客户端 if (!supabaseUrl || !supabaseAnonKey) { console.warn('Supabase environment variables not found. Using mock client.') // 返回一个基本的 mock 对象，避免应用崩溃 return { auth: { getUser: async () => ({ data: { user: null }, error: null }), signInWithOAuth: async () => ({ data: null, error: new Error('Supabase not configured') }), signOut: async () => ({ error: null }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {}
} }
}) }, from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), data: null, error: null }), order: () => ({ limit: () => ({ data: null, error: null }) }) }), insert: async () => ({ data: null, error: null }), update: async () => ({ data: null, error: null }), delete: async () => ({ data: null, error: null }) }) }
as any }
return createBrowserClient<Database>( supabaseUrl, supabaseAnonKey ) }