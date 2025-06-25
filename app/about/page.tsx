export default function About() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold mb-8">关于我</h1>
      
      <div className="bg-gray-50 p-8 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">个人简介</h2>
        <p className="text-gray-700 mb-4">
          你好！我是一名热爱技术和写作的博主。这个博客是我分享想法、经验和学习心得的地方。
        </p>
        <p className="text-gray-700">
          我相信通过分享，我们不仅能帮助他人，也能让自己获得成长。欢迎你经常来访，一起交流学习。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-3">兴趣领域</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Web 开发</li>
            <li>人工智能</li>
            <li>产品设计</li>
            <li>个人成长</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-3">联系方式</h3>
          <p className="text-gray-700 mb-2">
            如果你想和我交流，可以通过以下方式联系我：
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Email: your-email@example.com</li>
            <li>GitHub: github.com/yourusername</li>
          </ul>
        </div>
      </div>
    </div>
  )
}