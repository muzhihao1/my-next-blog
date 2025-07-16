/**
 * 认证模态框提供者组件
 * 在应用根部提供全局认证模态框
 */

'use client'

import { AuthModal } from './AuthModal'
import { useAuthModal } from '@/hooks/useAuthModal'

export function AuthModalProvider() {
  const { isOpen, feature, redirectTo, closeAuthModal } = useAuthModal()
  
  return (
    <AuthModal
      isOpen={isOpen}
      onClose={closeAuthModal}
      feature={feature}
      redirectTo={redirectTo}
    />
  )
}