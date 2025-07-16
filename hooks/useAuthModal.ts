/**
 * 认证模态框状态管理钩子
 */

import { create } from 'zustand'

interface AuthModalState {
  isOpen: boolean
  feature?: string
  redirectTo?: string
  openAuthModal: (options?: { feature?: string; redirectTo?: string }) => void
  closeAuthModal: () => void
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  feature: undefined,
  redirectTo: undefined,
  
  openAuthModal: (options) => set({ 
    isOpen: true, 
    feature: options?.feature,
    redirectTo: options?.redirectTo 
  }),
  
  closeAuthModal: () => set({ 
    isOpen: false, 
    feature: undefined,
    redirectTo: undefined 
  }),
}))