'use client'

import { useState } from 'react'
import { X, AlignLeft } from 'lucide-react'

interface MobileTOCButtonProps {
  children: React.ReactNode
}

export default function MobileTOCButton({ children }: MobileTOCButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile TOC Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 lg:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 flex items-center justify-center"
        aria-label="打开目录"
      >
        <AlignLeft className="w-6 h-6" />
      </button>

      {/* Mobile TOC Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* TOC Panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">文章目录</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="关闭目录"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  )
}