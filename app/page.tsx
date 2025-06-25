export default function Home() {
  const posts = [
    {
      id: 1,
      title: "我的第一篇博客",
      date: "2024-01-01",
      excerpt: "这是我的第一篇博客文章，欢迎来到我的个人网站。在这里我会分享我的想法和经验。"
    },
    {
      id: 2,
      title: "关于技术学习的一些思考",
      date: "2024-01-15",
      excerpt: "学习新技术总是充满挑战，但也充满乐趣。这篇文章分享我在学习过程中的一些心得。"
    }
  ]

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">最新文章</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.id} className="border-b pb-8">
            <h2 className="text-2xl font-semibold mb-2">
              <a href={`/posts/${post.id}`} className="hover:text-blue-600">
                {post.title}
              </a>
            </h2>
            <time className="text-gray-600 text-sm">{post.date}</time>
            <p className="mt-3 text-gray-700">{post.excerpt}</p>
            <a href={`/posts/${post.id}`} className="text-blue-600 hover:underline mt-2 inline-block">
              阅读更多 →
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}