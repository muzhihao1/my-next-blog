export default function About() {
  return (
    <div className="py-12">
      <div className="container-narrow">
        <h1 className="text-4xl font-light mb-8">关于我</h1>
        
        <div className="prose prose-lg text-gray-700 max-w-none">
          <p className="text-xl leading-relaxed mb-6">
            你好，我是 Zhihao Mu，一名热爱技术和写作的全栈开发者。
          </p>
          
          <p>
            我相信技术的力量可以改变世界，而写作是分享知识和连接人心的最好方式。
            在这个博客里，我会分享我的技术探索、生活感悟和学习心得。
          </p>

          <h2 className="text-2xl font-light mt-12 mb-6">我的故事</h2>
          
          <p>
            从第一次接触编程开始，我就被代码世界的逻辑之美深深吸引。这些年来，
            我在前端开发、后端架构、产品设计等领域都有所涉猎，始终保持着对新技术的好奇心。
          </p>

          <p>
            除了技术，我还热爱阅读、写作和思考。我相信持续学习和分享是个人成长的最佳途径。
            通过这个博客，我希望能够记录自己的成长轨迹，同时也希望我的经验能够帮助到他人。
          </p>

          <h2 className="text-2xl font-light mt-12 mb-6">关注领域</h2>
          
          <ul>
            <li>前端开发（React、Vue、Next.js）</li>
            <li>全栈架构设计</li>
            <li>用户体验设计</li>
            <li>个人效率提升</li>
            <li>知识管理系统</li>
          </ul>

          <h2 className="text-2xl font-light mt-12 mb-6">联系方式</h2>
          
          <p>如果你想和我交流，可以通过以下方式联系我：</p>
          
          <ul>
            <li>Email: zhihao@example.com</li>
            <li>GitHub: <a href="https://github.com/zhihaomu" className="text-pink-600 hover:underline">@zhihaomu</a></li>
            <li>Twitter: <a href="https://twitter.com/zhihaomu" className="text-pink-600 hover:underline">@zhihaomu</a></li>
          </ul>

          <div className="mt-12 p-8 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium mb-4">订阅我的博客</h3>
            <p className="text-gray-600 mb-6">
              获取最新文章更新，每周不超过一封邮件
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:border-pink-600"
              />
              <button 
                type="submit"
                className="btn-subscribe rounded-l-none"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}