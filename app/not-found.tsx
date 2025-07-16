import Link from 'next/link' 

export default function NotFound() {
  return (
    <div className="py-24">
<div className="container-narrow text-center">
<h1 className="text-6xl font-light text-gray-300 mb-8">404</h1>
<h2 className="text-3xl font-light mb-4">页面不存在</h2>
<p className="text-gray-600 mb-8"> 抱歉，您访问的页面不存在或已被移除。 </p>
<div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            返回首页
          </Link>
          <p className="text-sm text-gray-500">
            或者您可以通过导航菜单浏览其他内容
          </p>
        </div>
      </div>
    </div>
  )
}