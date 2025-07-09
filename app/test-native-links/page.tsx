import Link from 'next/link'

export default function TestNativeLinksPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">原生链接测试（无任何修复）</h1>
      
      <div className="space-y-4 max-w-md">
        <h2 className="font-semibold">Next.js Link 组件:</h2>
        
        <Link href="/about" className="block p-4 bg-blue-100 hover:bg-blue-200 rounded">
          /about
        </Link>
        
        <Link href="/blog" className="block p-4 bg-blue-100 hover:bg-blue-200 rounded">
          /blog
        </Link>
        
        <Link href="/projects" className="block p-4 bg-blue-100 hover:bg-blue-200 rounded">
          /projects
        </Link>
        
        <h2 className="font-semibold mt-6">普通 a 标签:</h2>
        
        <a href="/tools" className="block p-4 bg-green-100 hover:bg-green-200 rounded">
          /tools
        </a>
        
        <a href="https://github.com" className="block p-4 bg-green-100 hover:bg-green-200 rounded">
          https://github.com (外部)
        </a>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p className="text-sm">这个页面只包含原生的 Link 组件和 a 标签，没有任何修复代码。</p>
        <p className="text-sm">如果这些链接不能点击，说明问题在其他地方。</p>
      </div>
    </div>
  )
}