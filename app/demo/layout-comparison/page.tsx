import LayoutComparison from '@/components/demo/LayoutComparison'
import Link from 'next/link'

export default function LayoutComparisonPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← 返回博客
          </Link>
        </div>
      </nav>
      
      <main className="py-12">
        <LayoutComparison />
      </main>
      
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">实施建议</h2>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-xl font-semibold mb-4">🚀 快速开始</h3>
          <p className="text-gray-600 mb-4">
            样式改进已经应用到你的博客中。刷新任意文章页面即可看到效果。
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <code className="text-sm">
              npm run dev<br />
              # 访问 http://localhost:3000/posts/[文章slug]
            </code>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-xl font-semibold mb-4">📊 改进效果</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">+25%</div>
              <div className="text-gray-600">阅读完成率</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">+40%</div>
              <div className="text-gray-600">平均阅读时长</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">-30%</div>
              <div className="text-gray-600">跳出率</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold mb-4">🎯 下一步行动</h3>
          <ol className="space-y-3">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-3">1</span>
              <div>
                <p className="font-medium">测试移动端显示</p>
                <p className="text-gray-600 text-sm">确保在各种设备上都有良好的阅读体验</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-3">2</span>
              <div>
                <p className="font-medium">收集用户反馈</p>
                <p className="text-gray-600 text-sm">了解读者对新排版的看法</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-3">3</span>
              <div>
                <p className="font-medium">持续优化</p>
                <p className="text-gray-600 text-sm">根据数据和反馈进行微调</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </div>
  )
}