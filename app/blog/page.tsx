import { getPublishedPosts, withFallback, formatDate } from '@/lib/notion'
import { getFallbackPosts } from '@/lib/fallback-posts'
import Link from 'next/link'

export default async function BlogPage() {
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
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            博客文章
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            分享技术见解、设计思考和生活感悟
          </p>
        </div>

        {/* 文章列表 */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="article-card group">
              <div className={getCategoryClass(post.category)}>
                {post.category}
              </div>
              
              <h2 className="article-title">
                <Link href={`/posts/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              
              <p className="article-excerpt">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="article-meta">
                  <time>{formatDate(post.date)}</time>
                  <span className="mx-2">·</span>
                  <span>{post.readTime}</span>
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

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">暂无文章</p>
          </div>
        )}
      </div>
    </div>
  )
}