'use client'

import { useState }
from 'react'

interface CopyButtonProps {
  text: string
  className?: string
  children?: React.ReactNode
}
export default function CopyButton({ text, className = "", children }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    catch (error) {
      console.error('Failed to copy:', error)
    }
  }
  
  return (
    <button onClick={handleCopy}
      className={className}
    >
      {copied ? '已复制' : (children || '复制')}
    </button>
  )
} 