import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '部署状态 - 无题之墨',
  description: '查看网站部署和环境配置状态'
}

export default function DeploymentStatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🚀 部署状态
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            ✅ 网站已成功部署
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            如果你能看到这个页面，说明网站的基础部署已经成功。
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            部署时间：{new Date().toLocaleString('zh-CN')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🔍 环境状态
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            本站使用静态导出模式，Notion 数据在构建时获取。如果内容无法显示，可能是环境变量配置问题。
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">构建模式：</span>
              <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">output: export</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">框架版本：</span>
              <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Next.js 15.3.5</code>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📝 检查清单
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• 访问 <a href="/blog" className="text-blue-600 hover:underline">/blog</a> 查看文章列表</li>
            <li>• 访问 <a href="/projects" className="text-blue-600 hover:underline">/projects</a> 查看项目展示</li>
            <li>• 访问 <a href="/tools" className="text-blue-600 hover:underline">/tools</a> 查看工具推荐</li>
            <li>• 如果页面显示"暂无内容"，检查 Notion 环境变量配置</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
}