'use client'

import Link from 'next/link' 
import { useEffect, useState } from 'react' 
import type { ComponentProps } from 'react'

/**
 * HydratedLink - A Link component that ensures proper hydration
 * 
 * This component addresses the issue where Next.js links become unresponsive
 * until another interactive element is triggered. It uses a hydration state
 * to ensure the link is properly interactive after client-side hydration.
 * 
 * Features:
 * - Tracks hydration state to ensure interactivity
 * - Provides visual feedback during hydration
 * - Minimal performance impact
 * - Seamless transition from SSR to client
 */
export function HydratedLink({ 
  children, 
  className = '', 
  ...props 
}: ComponentProps<typeof Link>) {
  // Track hydration state
  const [isHydrated, setIsHydrated] = useState(false)
  
  useEffect(() => {
    // Mark as hydrated after mount
    setIsHydrated(true)
  }, [])
  
  return (
    <Link 
      {...props}
      className={`
        ${className}
        ${!isHydrated ? 'hydrating' : ''}
        transition-opacity duration-150
      `}
      // Ensure the link is interactive even during hydration
      onClick={(e) => {
        // If not hydrated yet, handle navigation manually
        if (!isHydrated && props.href) {
          e.preventDefault()
          window.location.href = props.href.toString()
        }
        // Call original onClick if provided
        if (props.onClick) {
          props.onClick(e)
        }
      }}
      // Add touch event for mobile devices
      onTouchStart={() => {
        if (!isHydrated) {
          setIsHydrated(true)
        }
      }}
      style={{
        // Ensure link is always clickable
        pointerEvents: 'auto',
        // Subtle visual indication during hydration
        opacity: isHydrated ? 1 : 0.95,
        ...props.style
      }}
    >
      {children}
    </Link>
  )
}