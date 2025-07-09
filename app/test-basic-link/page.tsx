import Link from 'next/link'

export default function TestBasicLink() {
  return (
    <div style={{ padding: '50px' }}>
      <h1>基础链接测试</h1>
      
      <div style={{ marginTop: '20px' }}>
        <h2>1. Next.js Link（无任何样式）</h2>
        <Link href="/about">Next.js Link to /about</Link>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>2. 普通 a 标签</h2>
        <a href="/about">Regular anchor to /about</a>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>3. Next.js Link with inline styles</h2>
        <Link href="/blog" style={{ color: 'blue', textDecoration: 'underline' }}>
          Styled Link to /blog
        </Link>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>4. Next.js Link with legacyBehavior</h2>
        <Link href="/projects" legacyBehavior>
          <a style={{ color: 'green' }}>Legacy Link to /projects</a>
        </Link>
      </div>
    </div>
  )
}