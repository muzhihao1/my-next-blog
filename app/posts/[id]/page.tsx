export default function Post({ params }: { params: { id: string } }) {
  // 这里暂时使用模拟数据，之后可以从 Markdown 文件读取
  const posts: { [key: string]: { title: string; date: string; content: string } } = {
    '1': {
      title: '我的第一篇博客',
      date: '2024-01-01',
      content: `
        <p>欢迎来到我的个人博客！这是我的第一篇文章。</p>
        <p>我创建这个博客的目的是为了记录和分享我的学习历程、技术心得以及生活感悟。</p>
        <h2>为什么要写博客？</h2>
        <ul>
          <li>记录学习过程，方便回顾</li>
          <li>分享知识，帮助他人</li>
          <li>锻炼写作能力</li>
          <li>建立个人品牌</li>
        </ul>
        <p>希望通过持续的写作，能够不断提升自己，也能结识更多志同道合的朋友。</p>
      `
    },
    '2': {
      title: '关于技术学习的一些思考',
      date: '2024-01-15',
      content: `
        <p>在技术学习的道路上，我们常常会遇到各种挑战。</p>
        <h2>学习方法</h2>
        <p>我总结了一些有效的学习方法：</p>
        <ol>
          <li><strong>实践为主</strong>：动手做项目是最好的学习方式</li>
          <li><strong>循序渐进</strong>：从基础开始，逐步深入</li>
          <li><strong>保持好奇</strong>：对新技术保持开放的心态</li>
          <li><strong>分享交流</strong>：通过教学相长的方式巩固知识</li>
        </ol>
        <p>记住，学习是一个持续的过程，享受这个过程比急于求成更重要。</p>
      `
    }
  }

  const post = posts[params.id] || { title: '文章不存在', date: '', content: '<p>抱歉，找不到这篇文章。</p>' }

  return (
    <article className="max-w-none">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <time className="text-gray-600 block mb-8">{post.date}</time>
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="mt-12 pt-8 border-t">
        <a href="/" className="text-blue-600 hover:underline">← 返回首页</a>
      </div>
    </article>
  )
}