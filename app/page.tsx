export default function Home() {
  const posts = [
    {
      id: 1,
      title: "战胜拖延的策略：从'冷启动'到'热启动'",
      excerpt: "战胜拖延的策略，从'冷启动'到'热启动'。",
      date: "24 Nov 2024",
      readTime: "4 min read",
      author: {
        name: "Zhihao Mu",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
      },
      category: "Productivity"
    },
    {
      id: 2,
      title: "理解 React 18 的并发特性",
      excerpt: "深入探讨 React 18 带来的并发渲染机制，以及如何在项目中有效利用这些新特性。",
      date: "20 Nov 2024", 
      readTime: "6 min read",
      author: {
        name: "Zhihao Mu",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
      },
      category: "Technology"
    },
    {
      id: 3,
      title: "构建高效的个人知识管理系统",
      excerpt: "如何使用现代工具和方法论，构建一个适合自己的知识管理体系。",
      date: "15 Nov 2024",
      readTime: "5 min read",
      author: {
        name: "Zhihao Mu",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
      },
      category: "Productivity"
    },
    {
      id: 4,
      title: "设计系统的思考：从组件到体验",
      excerpt: "探讨如何构建一个既灵活又一致的设计系统，以及在实践中遇到的挑战。",
      date: "10 Nov 2024",
      readTime: "7 min read",
      author: {
        name: "Zhihao Mu",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
      },
      category: "Design"
    }
  ]

  return (
    <div className="py-12">
      <div className="container-narrow">
        <h1 className="text-4xl font-light mb-2">最新文章</h1>
        <p className="text-gray-600 mb-12">探索技术、设计与生活的交集</p>

        <div className="space-y-16">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <div className="mb-4">
                <span className="text-pink-600 text-sm font-medium uppercase tracking-wide">
                  {post.category}
                </span>
              </div>
              
              <h2 className="text-3xl font-light mb-4 leading-tight">
                <a 
                  href={`/posts/${post.id}`}
                  className="text-gray-900 hover:text-pink-600 transition-colors"
                >
                  {post.title}
                </a>
              </h2>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                {post.excerpt}
              </p>
              
              <div className="flex items-center">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name}
                  className="author-avatar mr-3"
                />
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{post.author.name}</span>
                  <span className="mx-2">·</span>
                  <time>{post.date}</time>
                  <span className="mx-2">·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 pt-16 border-t border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl font-light mb-4">订阅更新</h2>
            <p className="text-gray-600 mb-8">
              获取最新文章推送，每周不超过一封邮件
            </p>
            <form className="flex max-w-md mx-auto">
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