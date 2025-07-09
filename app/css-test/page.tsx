'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CSSTestPage() {
  const [cssEnabled, setCssEnabled] = useState(true)
  
  const toggleCSS = () => {
    const styleSheets = Array.from(document.styleSheets)
    styleSheets.forEach(sheet => {
      try {
        sheet.disabled = !cssEnabled
      } catch (e) {
        // 跨域样式表
      }
    })
    setCssEnabled(!cssEnabled)
  }
  
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'white' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '1rem' }}>CSS 测试页面</h1>
      
      <button 
        onClick={toggleCSS}
        style={{
          padding: '10px 20px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '2rem'
        }}
      >
        {cssEnabled ? '禁用所有 CSS' : '启用所有 CSS'}
      </button>
      
      <div style={{ marginBottom: '1rem' }}>
        当前状态：CSS {cssEnabled ? '已启用' : '已禁用'}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
        <Link 
          href="/about"
          style={{
            padding: '1rem',
            background: '#dbeafe',
            textDecoration: 'none',
            color: '#1e40af',
            borderRadius: '4px',
            display: 'block'
          }}
        >
          Next.js Link - /about
        </Link>
        
        <Link 
          href="/blog"
          style={{
            padding: '1rem',
            background: '#dbeafe',
            textDecoration: 'none',
            color: '#1e40af',
            borderRadius: '4px',
            display: 'block'
          }}
        >
          Next.js Link - /blog
        </Link>
        
        <a 
          href="/projects"
          style={{
            padding: '1rem',
            background: '#dcfce7',
            textDecoration: 'none',
            color: '#166534',
            borderRadius: '4px',
            display: 'block'
          }}
        >
          普通 a 标签 - /projects
        </a>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '4px' }}>
        <p>测试步骤：</p>
        <ol>
          <li>1. 点击上面的链接，看是否能正常跳转</li>
          <li>2. 点击"禁用所有 CSS"按钮</li>
          <li>3. 再次点击链接，看是否能正常跳转</li>
          <li>4. 如果禁用 CSS 后链接能工作，说明问题在 CSS 中</li>
        </ol>
      </div>
    </div>
  )
}