'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ErrorToastProps {
  message: string | null
  onClose: () => void
  duration?: number
}

export function ErrorToast({ message, onClose, duration = 5000 }: ErrorToastProps) {
  useEffect(() => {
    if (message && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [message, duration, onClose])
  
  if (!message) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in-0">
      <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg shadow-lg max-w-md">
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">
            错误
          </p>
          <p className="text-sm text-red-600 mt-0.5">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 transition-colors"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}