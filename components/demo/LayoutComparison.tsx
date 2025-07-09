'use client'

import { useState } from 'react'

export default function LayoutComparison() {
  const [showGhostStyle, setShowGhostStyle] = useState(false)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">排版风格对比演示</h2>
        <div className="inline-flex items-center gap-4 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setShowGhostStyle(false)}
            className={`px-6 py-2 rounded-md transition-all ${
              !showGhostStyle 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            当前样式
          </button>
          <button
            onClick={() => setShowGhostStyle(true)}
            className={`px-6 py-2 rounded-md transition-all ${
              showGhostStyle 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ghost 风格
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {!showGhostStyle ? (
          // 当前样式演示
          <article className="p-8">
            <header className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">技术</span>
                <span>2024-12-11</span>
                <span>•</span>
                <span>5 分钟阅读</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900">
                探索现代 Web 开发的最佳实践
              </h1>
              <p className="text-base text-gray-600 leading-relaxed">
                在这篇文章中，我们将深入探讨现代 Web 开发中的一些关键概念和最佳实践，
                帮助你构建更好的应用。
              </p>
            </header>
            
            <div className="prose prose-sm max-w-none">
              <h2 className="text-xl font-semibold mt-6 mb-3">引言</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                随着前端技术的快速发展，开发者面临着越来越多的选择。从框架选择到构建工具，
                从状态管理到样式方案，每个决策都可能影响项目的长期维护性和性能表现。
              </p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">核心原则</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>保持代码简洁和可读性</li>
                <li>优先考虑用户体验</li>
                <li>采用渐进增强策略</li>
              </ul>
              
              <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600">
                "简单是终极的复杂。" — 达芬奇
              </blockquote>
            </div>
            
            <footer className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {['React', 'TypeScript', 'Next.js'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 text-gray-500">
                  <button className="hover:text-gray-700">👍 赞</button>
                  <button className="hover:text-gray-700">💬 评论</button>
                  <button className="hover:text-gray-700">🔖 收藏</button>
                </div>
              </div>
            </footer>
          </article>
        ) : (
          // Ghost 风格演示
          <article className="py-12">
            <div className="max-w-[740px] mx-auto px-6">
              <header className="text-center mb-12">
                <div className="text-gray-500 mb-6">
                  <time>2024年12月11日</time>
                </div>
                <h1 className="text-5xl font-bold leading-tight mb-6 text-gray-900">
                  探索现代 Web 开发的最佳实践
                </h1>
                <p className="text-2xl text-gray-600 leading-relaxed max-w-[620px] mx-auto">
                  在这篇文章中，我们将深入探讨现代 Web 开发中的一些关键概念和最佳实践，
                  帮助你构建更好的应用。
                </p>
              </header>
              
              <div className="prose-ghost" style={{ fontSize: '21px', lineHeight: '1.7' }}>
                <h2 style={{ fontSize: '36px', fontWeight: 700, marginTop: '3rem', marginBottom: '1.5rem' }}>
                  引言
                </h2>
                <p style={{ marginBottom: '1.8rem', color: '#3a3a3a' }}>
                  随着前端技术的快速发展，开发者面临着越来越多的选择。从框架选择到构建工具，
                  从状态管理到样式方案，每个决策都可能影响项目的长期维护性和性能表现。
                </p>
                
                <h3 style={{ fontSize: '28px', fontWeight: 600, marginTop: '2.5rem', marginBottom: '1rem' }}>
                  核心原则
                </h3>
                <ul style={{ margin: '2rem 0', paddingLeft: '1.5rem' }}>
                  <li style={{ marginBottom: '0.8rem', lineHeight: '1.7', color: '#3a3a3a' }}>
                    保持代码简洁和可读性
                  </li>
                  <li style={{ marginBottom: '0.8rem', lineHeight: '1.7', color: '#3a3a3a' }}>
                    优先考虑用户体验
                  </li>
                  <li style={{ marginBottom: '0.8rem', lineHeight: '1.7', color: '#3a3a3a' }}>
                    采用渐进增强策略
                  </li>
                </ul>
                
                <blockquote style={{ 
                  fontSize: '26px', 
                  lineHeight: '1.6', 
                  fontStyle: 'italic',
                  margin: '3rem 0',
                  paddingLeft: '2rem',
                  borderLeft: '3px solid #1a1a1a',
                  color: '#5a5a5a'
                }}>
                  "简单是终极的复杂。" — 达芬奇
                </blockquote>
              </div>
              
              <footer className="mt-16 text-center">
                <a href="/" className="text-gray-600 hover:text-gray-900 underline underline-offset-4">
                  ← 返回首页
                </a>
              </footer>
            </div>
          </article>
        )}
      </div>
      
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-3">当前样式特点</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 紧凑的布局，信息密度高</li>
            <li>• 多种交互元素（点赞、评论、收藏）</li>
            <li>• 丰富的元数据显示</li>
            <li>• 标准的 16px 字体大小</li>
            <li>• 复杂的视觉层级</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-3">Ghost 风格特点</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 宽松的布局，注重留白</li>
            <li>• 极简的界面，专注内容</li>
            <li>• 精简的元数据</li>
            <li>• 更大的 21px 字体</li>
            <li>• 清晰的视觉层级</li>
          </ul>
        </div>
      </div>
    </div>
  )
}