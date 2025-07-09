'use client'

export default function LinkTestPage() {
  return (
    <div className="min-h-screen p-8 bg-white">
      <h1 className="text-3xl font-bold mb-8">链接测试页面</h1>
      
      <div className="space-y-8">
        {/* 测试不同类型的链接 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">基础链接测试</h2>
          <div className="space-y-2">
            <p>
              <a href="/" className="text-blue-600 underline">
                基础 a 标签回首页
              </a>
            </p>
            <p>
              <a href="/blog" className="text-blue-600 underline">
                基础 a 标签到博客页
              </a>
            </p>
          </div>
        </section>

        {/* 测试内联样式 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">内联样式测试</h2>
          <div className="space-y-2">
            <p>
              <a 
                href="/" 
                style={{ 
                  color: 'green', 
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 999
                }}
              >
                带内联样式的链接
              </a>
            </p>
          </div>
        </section>

        {/* 测试按钮 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">按钮测试</h2>
          <div className="space-y-2">
            <button 
              type="button"
              onClick={() => alert('按钮点击成功！')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            >
              测试按钮点击
            </button>
          </div>
        </section>

        {/* 测试 JavaScript 事件 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">JavaScript 事件测试</h2>
          <div className="space-y-2">
            <div 
              onClick={() => alert('div 点击成功！')}
              className="inline-block px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              点击这个 div
            </div>
          </div>
        </section>

        {/* 调试信息 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">调试信息</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p>如果任何链接或按钮无法点击，请检查：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>浏览器控制台是否有错误</li>
              <li>元素检查器中是否有覆盖层</li>
              <li>CSS 中是否有 pointer-events: none</li>
              <li>是否有 JavaScript 错误阻止了事件</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}