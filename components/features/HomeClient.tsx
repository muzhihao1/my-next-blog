'use client'

import { ReactNode } from 'react'
import LazyLoad from '@/components/ui/LazyLoad'

interface HomeClientProps {
  children: ReactNode
}

export default function HomeClient({ children }: HomeClientProps) {
  return (
    <LazyLoad threshold={0.1} rootMargin="100px">
      {children}
    </LazyLoad>
  )
}