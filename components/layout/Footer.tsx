import Link from 'next/link'

const footerLinks = {
  导航: [
    { name: '首页', href: '/' },
    { name: '项目', href: '/projects' },
    { name: '博客', href: '/blog' },
    { name: '关于', href: '/about' },
  ],
  资源: [
    { name: '书架', href: '/bookshelf' },
    { name: '工具', href: '/tools' },
    { name: '数据统计', href: '/stats' },
    { name: 'RSS订阅', href: '/rss.xml' },
    { name: '网站地图', href: '/sitemap.xml' },
  ],
  社交: [
    { name: 'GitHub', href: 'https://github.com/petermu' },
    { name: 'Twitter', href: 'https://twitter.com/petermu' },
    { name: 'LinkedIn', href: 'https://linkedin.com/in/petermu' },
    { name: '邮箱', href: 'mailto:contact@petermu.com' },
  ],
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              数字花园
            </h3>
            <p className="text-sm text-gray-600">
              记录成长，分享知识，连接世界
            </p>
          </div>
          
          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => {
                  // Use regular anchor tag for XML files and external links
                  const isXmlFile = link.href.endsWith('.xml')
                  const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto')
                  
                  if (isXmlFile || isExternal) {
                    return (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {link.name}
                        </a>
                      </li>
                    )
                  }
                  
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} 数字花园. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex items-center space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                隐私政策
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                使用条款
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}