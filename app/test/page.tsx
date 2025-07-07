import Container from '@/components/ui/Container'

export default function TestPage() {
  return (
    <Container size="lg" className="py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
        测试页面
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        这是一个测试页面，用于验证样式是否正常工作。
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-3">卡片 1</h2>
          <p className="text-gray-600 dark:text-gray-400">
            这是第一个测试卡片，应该有白色背景和阴影。
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-3">卡片 2</h2>
          <p className="text-gray-600 dark:text-gray-400">
            这是第二个测试卡片，应该有相同的样式。
          </p>
        </div>
      </div>
    </Container>
  )
}