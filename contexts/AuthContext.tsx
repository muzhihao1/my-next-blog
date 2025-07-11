'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  
  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    }
  }
  
  useEffect(() => {
    // 获取初始用户状态
    refreshUser().finally(() => setLoading(false))
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        // 如果是登录事件，确保user_profiles表有记录
        if (event === 'SIGNED_IN' && session?.user) {
          // 检查profile是否存在
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()
          
          // 如果不存在，创建一个（触发器应该已经创建了，这是备用方案）
          if (!profile) {
            await supabase.from('user_profiles').upsert({
              id: session.user.id,
              display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatar_url: session.user.user_metadata?.avatar_url,
              github_username: session.user.user_metadata?.user_name,
            })
          }
        }
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  const clearError = () => {
    setError(null)
  }
  
  const signIn = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        const errorMessage = 
          error.message === 'Email link is invalid or has expired'
            ? '登录链接已失效，请重新登录'
            : error.message || '登录失败，请稍后重试'
        setError(errorMessage)
        console.error('登录失败:', error)
      }
    } catch (err) {
      setError('登录过程中发生错误，请稍后重试')
      console.error('登录异常:', err)
    }
  }
  
  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError('登出失败，请稍后重试')
        console.error('登出失败:', error)
      }
    } catch (err) {
      setError('登出过程中发生错误')
      console.error('登出异常:', err)
    }
  }
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signOut,
        refreshUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}