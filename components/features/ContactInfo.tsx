/**
 * Contact information component
 */
import Link from 'next/link'
import { ReactElement } from 'react'

interface ContactItem {
  id: string
  platform: string
  handle: string
  url: string
  icon: ReactElement
  color: string
  description: string
}

const contactItems: ContactItem[] = [
  {
    id: 'email',
    platform: 'Email',
    handle: 'zhihao@example.com',
    url: 'mailto:zhihao@example.com',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    color: 'hover:text-red-500',
    description: '工作咨询、合作邀请'
  },
  {
    id: 'github',
    platform: 'GitHub',
    handle: '@zhihaomu',
    url: 'https://github.com/zhihaomu',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
    color: 'hover:text-gray-700',
    description: '开源项目、代码分享'
  },
  {
    id: 'twitter',
    platform: 'Twitter',
    handle: '@zhihaomu',
    url: 'https://twitter.com/zhihaomu',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    color: 'hover:text-blue-500',
    description: '技术分享、日常动态'
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    handle: 'Zhihao Mu',
    url: 'https://linkedin.com/in/zhihaomu',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: 'hover:text-blue-700',
    description: '职业发展、商务合作'
  },
  {
    id: 'wechat',
    platform: 'WeChat',
    handle: 'zhihao_tech',
    url: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.19 14.91c-.45 0-.81-.36-.81-.81s.36-.81.81-.81.81.36.81.81-.36.81-.81.81zm2.38 0c-.45 0-.81-.36-.81-.81s.36-.81.81-.81.81.36.81.81-.36.81-.81.81zm2.38-3.38c-.45 0-.81-.36-.81-.81s.36-.81.81-.81.81.36.81.81-.36.81-.81.81zm0-2.86c-.45 0-.81-.36-.81-.81s.36-.81.81-.81.81.36.81.81-.36.81-.81.81zm-2.38-2.81c-.45 0-.81-.36-.81-.81s.36-.81.81-.81.81.36.81.81-.36.81-.81.81zm-2.38 0c-.45 0-.81-.36-.81-.81s.36-.81.81-.81.81.36.81.81-.36.81-.81.81zm-2.38 2.81c-.45 0-.81-.36-.81-.81s.36-.81.81-.81.81.36.81.81-.36.81-.81.81zm0 2.86c-.45 0-.81-.36-.81-.81s.36-.81.81-.81.81.36.81.81-.36.81-.81.81z"/>
      </svg>
    ),
    color: 'hover:text-green-500',
    description: '技术交流、日常沟通'
  },
  {
    id: 'blog',
    platform: 'RSS',
    handle: '订阅博客',
    url: '/rss.xml',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
        />
      </svg>
    ),
    color: 'hover:text-orange-500',
    description: '获取最新文章更新'
  }
]

/**
 * Contact info component
 */
export default function ContactInfo() {
  return (
    <div>
      {/* Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {contactItems.map((item) => (
          <div key={item.id}>
            {item.url.startsWith('#') ? (
              <div className="flex items-start gap-4 p-4 rounded-lg border bg-card cursor-default">
                <div className={`p-3 rounded-lg bg-muted ${item.color} transition-colors`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{item.platform}</h4>
                  <p className="text-sm text-muted-foreground">{item.handle}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            ) : (
              <Link
                href={item.url}
                target={item.url.startsWith('http') ? '_blank' : undefined}
                rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all group"
              >
                <div className={`p-3 rounded-lg bg-muted ${item.color} transition-colors`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                    {item.platform}
                  </h4>
                  <p className="text-sm text-muted-foreground">{item.handle}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
      
      {/* Additional Info */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-3">联系说明</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• 工作相关咨询请优先通过 Email 联系</p>
          <p>• GitHub 上可以找到我的开源项目和代码示例</p>
          <p>• 欢迎在社交媒体上关注我，获取最新动态</p>
          <p>• 如果你也是技术爱好者，期待与你交流学习</p>
        </div>
      </div>
      
      {/* Location and Timezone */}
      <div className="mt-6 flex flex-col sm:flex-row gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>中国 · 上海</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>UTC+8 (北京时间)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
          <span>中文 / English</span>
        </div>
      </div>
    </div>
  )
}