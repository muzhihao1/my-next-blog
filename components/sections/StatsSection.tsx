'use client'

import { useState, useEffect } from 'react'
import { fallbackPosts } from '@/lib/fallback-posts'
import { fallbackProjects } from '@/lib/fallback-projects'
import { fallbackBooks } from '@/lib/fallback-books'

interface StatItem {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const stats: StatItem[] = [
    {
      label: '发布文章',
      value: 33, // 实际文章数量
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      color: 'text-blue-600'
    },
    {
      label: '完成项目',
      value: 3, // 实际项目数量
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      ),
      color: 'text-green-600'
    },
    {
      label: '已读书籍',
      value: 8, // 实际已读书籍数量
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      color: 'text-purple-600'
    },
    {
      label: '技术栈',
      value: 15,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      color: 'text-orange-600'
    }
  ]
  
  const [animatedValues, setAnimatedValues] = useState<number[]>(stats.map(s => s.value))
  const [hasAnimated, setHasAnimated] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    
    const element = document.getElementById('stats-section')
    if (element) {
      observer.observe(element)
    }
    
    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])
  
  useEffect(() => {
    if (isVisible && !hasAnimated) {
      const targetValues = stats.map(stat => stat.value)
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps
      let currentStep = 0
      
      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        
        setAnimatedValues(targetValues.map(target => Math.floor(target * easeOutQuart)))
        
        if (currentStep >= steps) {
          clearInterval(interval)
          setAnimatedValues(targetValues)
          setHasAnimated(true)
        }
      }, stepDuration)
      
      return () => clearInterval(interval)
    }
  }, [isVisible, hasAnimated, stats])
  
  return (
    <section id="stats-section" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center group">
              <div className={`inline-flex p-4 rounded-full bg-gray-100 ${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {animatedValues[index]}
              </div>
              <div className="text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}