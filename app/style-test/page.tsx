export default function StyleTestPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">样式测试页面</h1>
      
      <div className="space-y-8">
        {/* 颜色测试 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">颜色系统</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded">
              <p className="text-sm text-gray-600">白色背景</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">灰色背景</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-600">蓝色背景</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-600">绿色背景</p>
            </div>
          </div>
        </section>

        {/* 文字测试 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">文字系统</h2>
          <p className="text-gray-900 mb-2">主要文字 - text-gray-900</p>
          <p className="text-gray-600 mb-2">次要文字 - text-gray-600</p>
          <p className="text-gray-400 mb-2">辅助文字 - text-gray-400</p>
          <p className="text-blue-600">链接文字 - text-blue-600</p>
        </section>

        {/* 卡片测试 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">卡片组件</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">卡片标题</h3>
              <p className="text-gray-600">这是一个标准的白色卡片，应该有阴影和边框。</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">灰色卡片</h3>
              <p className="text-gray-600">这是一个灰色背景的卡片。</p>
            </div>
          </div>
        </section>

        {/* 按钮测试 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">按钮系统</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              主要按钮
            </button>
            <button className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors">
              次要按钮
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              边框按钮
            </button>
          </div>
        </section>

        {/* 深色模式对比 */}
        <section className="dark">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">深色模式预览</h2>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-2">深色模式卡片</h3>
            <p className="text-gray-300">这是深色模式下的卡片样式（手动添加 dark 类）。</p>
          </div>
        </section>
      </div>
    </div>
  )
}