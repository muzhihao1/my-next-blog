/** * RSS Feed 生成模块 * @module lib/rss * @description 生成博客的 RSS 2.0 订阅源 */
import { getAllPosts }
from './notion' 

import { formatDate }
from './notion' 

import fs from 'fs' 

import path from 'path' /** * RSS Feed 配置 * @interface RSSConfig */
interface RSSConfig { title: string description: string siteUrl: string feedUrl: string language: string copyright: string author: { name: string email: string }
}/** * 获取 RSS 配置 * @returns {RSSConfig}
RSS 配置对象 */
function getRSSConfig(): RSSConfig { const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com' return { title: '无题之墨', description: '分享技术见解、展示项目成果、记录学习历程', siteUrl: baseUrl, feedUrl: `${baseUrl}/rss.xml`, language: 'zh-CN', copyright: `© ${new Date().getFullYear()}
Zhihao Mu. All rights reserved.`, author: { name: 'Zhihao Mu', email: 'your-email@example.com' }
} }
/** * 转义 XML 特殊字符 * @param {string}
str - 需要转义的字符串 * @returns {string} 转义后的字符串 */
function escapeXml(str: string): string { if (!str) return '' const xmlEscapeMap: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }
return str.replace(/[&<>"']/g, (char) => xmlEscapeMap[char] || char) }
/** * 生成 RSS item * @param {any}
post - 文章对象 * @param {string}
baseUrl - 网站基础 URL * @returns {string}
RSS item XML */
function generateRSSItem(post: any, baseUrl: string): string { const postUrl = `${baseUrl}/posts/${post.slug}` const pubDate = new Date(post.date).toUTCString() return ` <item>
<title>${escapeXml(post.title)}</title>
<link>${postUrl}</link>
<guid isPermaLink="true">${postUrl}</guid>
<description>${escapeXml(post.excerpt || post.title)}</description>
<pubDate>${pubDate}</pubDate>
<author>${escapeXml(post.author.name)}</author> ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
${post.tags?.map((tag: string) => `<category>${escapeXml(tag)}</category>`).join('') || ''} </item> `.trim() }
/** * 生成完整的 RSS feed * @param {any[]
}
posts - 文章列表 * @param {RSSConfig}
config - RSS 配置 * @returns {string} 完整的 RSS XML */
function generateRSSFeed(posts: any[], config: RSSConfig): string { const items = posts .slice(0, 20) // 限制最新 20 篇文章 .map(post => generateRSSItem(post, config.siteUrl)) .join('\n') return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(config.title)}</title>
<link>${config.siteUrl}</link>
<description>${escapeXml(config.description)}</description>
<language>${config.language}</language>
<copyright>${escapeXml(config.copyright)}</copyright>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<atom:link href="${config.feedUrl}" rel="self" type="application/rss+xml" />
<generator>Next.js Blog RSS Generator</generator> ${items} </channel> </rss>` }
/** * 生成并保存 RSS feed 文件 * @async * @returns {Promise<void>} * @description 从 Notion 获取文章数据并生成 RSS feed 文件 */
export async function generateRSS(): Promise<void> { try { console.log('开始生成 RSS feed...') // 获取所有已发布的文章 const posts = await getAllPosts() if (!posts || posts.length === 0) { console.warn('没有找到任何文章，跳过 RSS 生成') return }
// 获取配置 const config = getRSSConfig() // 生成 RSS feed const rssFeed = generateRSSFeed(posts, config) // 确保 public 目录存在 const publicDir = path.join(process.cwd(), 'public') if (!fs.existsSync(publicDir)) { fs.mkdirSync(publicDir, { recursive: true }) }
// 写入文件 const rssPath = path.join(publicDir, 'rss.xml') fs.writeFileSync(rssPath, rssFeed, 'utf-8') console.log(`✅ RSS feed 已生成: ${rssPath}`) console.log(` 包含 ${posts.length} 篇文章`) }
catch (error) { console.error('生成 RSS feed 时出错:', error) // 不抛出错误，避免构建失败 }
}/** * 生成 Atom feed * @async * @returns {Promise<void>} * @description 生成 Atom 1.0 格式的订阅源 */
export async function generateAtomFeed(): Promise<void> { try { console.log('开始生成 Atom feed...') const posts = await getAllPosts() if (!posts || posts.length === 0) { console.warn('没有找到任何文章，跳过 Atom 生成') return }
const config = getRSSConfig() const atomFeed = generateAtomFeedContent(posts, config) const publicDir = path.join(process.cwd(), 'public') const atomPath = path.join(publicDir, 'atom.xml') fs.writeFileSync(atomPath, atomFeed, 'utf-8') console.log(`✅ Atom feed 已生成: ${atomPath}`) }
catch (error) { console.error('生成 Atom feed 时出错:', error) }
}/** * 生成 Atom feed 内容 * @param {any[]
}
posts - 文章列表 * @param {RSSConfig}
config - 配置 * @returns {string}
Atom XML */
function generateAtomFeedContent(posts: any[], config: RSSConfig): string { const entries = posts .slice(0, 20) .map(post => { const postUrl = `${config.siteUrl}/posts/${post.slug}` const updated = post.lastEditedTime || post.date return ` <entry>
<title>${escapeXml(post.title)}</title>
<link href="${postUrl}" />
<id>${postUrl}</id>
<updated>${new Date(updated).toISOString()}</updated>
<published>${new Date(post.date).toISOString()}</published>
<author>
<name>${escapeXml(post.author.name)}</name> </author>
<summary>${escapeXml(post.excerpt || post.title)}</summary> ${post.tags?.map((tag: string) => `<category term="${escapeXml(tag)}" />`).join('') || ''} </entry>` }) .join('\n') return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>${escapeXml(config.title)}</title>
<link href="${config.siteUrl}" />
<link href="${config.siteUrl}/atom.xml" rel="self" />
<updated>${new Date().toISOString()}</updated>
<id>${config.siteUrl}/</id>
<author>
<name>${escapeXml(config.author.name)}</name> </author>
<subtitle>${escapeXml(config.description)}</subtitle>
<generator>Next.js Blog Atom Generator</generator> ${entries} </feed>` }
/** * 生成 JSON Feed * @async * @returns {Promise<void>} * @description 生成 JSON Feed 1.1 格式的订阅源 */
export async function generateJSONFeed(): Promise<void> { try { console.log('开始生成 JSON Feed...') const posts = await getAllPosts() if (!posts || posts.length === 0) { console.warn('没有找到任何文章，跳过 JSON Feed 生成') return }
const config = getRSSConfig() const jsonFeed = { version: 'https://jsonfeed.org/version/1.1', title: config.title, home_page_url: config.siteUrl, feed_url: `${config.siteUrl}/feed.json`, description: config.description, language: config.language, authors: [{ name: config.author.name, url: config.siteUrl }
], items: posts.slice(0, 20).map(post => ({ id: `${config.siteUrl}/posts/${post.slug}`, url: `${config.siteUrl}/posts/${post.slug}`, title: post.title, summary: post.excerpt || post.title, date_published: new Date(post.date).toISOString(), date_modified: post.lastEditedTime ? new Date(post.lastEditedTime).toISOString() : undefined, authors: [{ name: post.author.name }
], tags: post.tags || [], _meta: { category: post.category }
})) }
const publicDir = path.join(process.cwd(), 'public') const jsonPath = path.join(publicDir, 'feed.json') fs.writeFileSync(jsonPath, JSON.stringify(jsonFeed, null, 2), 'utf-8') console.log(`✅ JSON Feed 已生成: ${jsonPath}`) }
catch (error) { console.error('生成 JSON Feed 时出错:', error) }
}/** * 生成所有格式的订阅源 * @async * @returns {Promise<void>} */
export async function generateAllFeeds(): Promise<void> { await Promise.all([ generateRSS(), generateAtomFeed(), generateJSONFeed() ]) }