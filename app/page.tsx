import { getPublishedPosts, withFallback, formatDate } from '@/lib/notion'
import { getFallbackPosts } from '@/lib/fallback-posts'

export default async function Home() {
  const posts = await withFallback(
    () => getPublishedPosts(),
    getFallbackPosts()
  )

  function getCategoryClass(category: string) {
    const categoryMap: { [key: string]: string } = {
      'Technology': 'category-technology',
      'Design': 'category-design', 
      'Productivity': 'category-productivity',
      'Life': 'category-life'
    }
    return `category-badge ${categoryMap[category] || 'category-technology'}`
  }

  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50/30">
      <div className="container-narrow">
        {/* 页面标题区域 */}
        <div className="text-center mb-20">
          <h1 className="page-title">最新文章</h1>
          <div className="divider"></div>
          <p className="page-subtitle">探索技术、设计与生活的交集</p>
        </div>

        {/* 文章列表 */}
        <div className="articles-grid">
          {posts.map((post, index) => (
            <article key={post.id} className="article-card group">
              <div className={getCategoryClass(post.category)}>
                {post.category}
              </div>
              
              <h2 className="article-title">
                <a href={`/posts/${post.slug}`}>
                  {post.title}
                </a>
              </h2>
              
              <p className="article-excerpt">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <img 
                    src={post.author.avatar} 
                    alt={post.author.name}
                    className="author-avatar mr-4"
                  />
                  <div className="article-meta">
                    <span className="font-medium text-gray-700">{post.author.name}</span>
                    <span className="mx-2">·</span>
                    <time>{formatDate(post.date)}</time>
                    <span className="mx-2">·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* 订阅区域 */}
        <div className="mt-20">
          <div className="subscribe-section">
            <h2 className="text-3xl font-light mb-4 text-gray-900">订阅更新</h2>
            <div className="divider"></div>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              获取最新文章推送，每周不超过一封邮件，随时可以取消订阅
            </p>
            <form className="flex max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder="输入您的邮箱地址"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
              />
              <button 
                type="submit"
                className="btn-subscribe"
              >
                订阅
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">
              我们尊重您的隐私，不会分享您的邮箱地址
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}