/** * 订阅页面 * @module app/subscribe/page * @description 展示所有可用的订阅方式 */
import Link from 'next/link' 

import { Metadata }
from 'next' 

import SubscribeForm from '@/components/features/SubscribeForm' 

import CopyButton from '@/components/ui/CopyButton' export const metadata: Metadata = { title: '订阅 - 无题之墨', description: '通过 RSS、Atom、JSON Feed 或邮件订阅博客更新' }
export default function SubscribePage() { const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com' const feedFormats = [ { name: 'RSS 2.0', description: '最广泛支持的订阅格式', url: '/rss.xml', icon: '📡', recommended: true }, { name: 'Atom 1.0', description: '现代化的 XML 订阅格式', url: '/atom.xml', icon: '⚛️' }, { name: 'JSON Feed', description: '面向开发者的 JSON 格式订阅', url: '/feed.json', icon: '{ }' }
]
const feedReaders = [ { name: 'Feedly', url: 'https://feedly.com', description: '流行的在线 RSS 阅读器' }, { name: 'Inoreader', url: 'https://www.inoreader.com', description: '功能强大的 RSS 服务' }, { name: 'NetNewsWire', url: 'https://netnewswire.com', description: 'Mac 和 iOS 原生应用' }, { name: 'Reeder', url: 'https://reederapp.com', description: '优雅的阅读体验' }
]
return ( <div className="py-16 px-4 sm:px-6 lg:px-8">
<div className="max-w-4xl mx-auto"> {/* 页面标题 */}
<div className="text-center mb-12">
<h1 className="text-4xl font-bold text-gray-900 mb-4"> 订阅博客更新 </h1>
<p className="text-lg text-gray-600"> 选择你喜欢的方式，第一时间获取最新文章 </p> </div> {/* 邮件订阅 */}
<section className="mb-16">
<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
<h2 className="text-2xl font-semibold text-gray-900 mb-4"> 📧 邮件订阅 </h2>
<p className="text-gray-600 mb-6"> 每周精选文章推送，不错过任何精彩内容 </p>
<SubscribeForm /> </div> </section> {/* RSS 订阅 */}
<section className="mb-12">
<h2 className="text-2xl font-semibold text-gray-900 mb-6"> 🔔 RSS 订阅 </h2>
<div className="grid gap-4"> {feedFormats.map((format) => ( <div key={format.name}
className="border border-gray-200 rounded-lg p-6 hover:border-blue-500:border-blue-400 transition-colors" >
<div className="flex items-start justify-between">
<div className="flex items-start gap-4">
<span className="text-3xl">{format.icon}</span>
<div>
<h3 className="text-lg font-medium text-gray-900 mb-1"> {format.name} {format.recommended && ( <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"> 推荐 </span> )} </h3>
<p className="text-sm text-gray-600 mb-3"> {format.description} </p>
<div className="flex items-center gap-4">
<Link href={format.url}
className="text-sm text-blue-600 hover:underline" > {baseUrl}{format.url} </Link>
<CopyButton text={`${baseUrl}
${format.url}`}
className="text-sm text-gray-500 hover:text-gray-700:text-gray-200" > 复制链接 </CopyButton> </div> </div> </div>
<Link href={format.url}
className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200:bg-gray-700 transition-colors" > 订阅 </Link> </div> </div> ))} </div> </section> {/* RSS 阅读器推荐 */}
<section className="mb-12">
<h2 className="text-2xl font-semibold text-gray-900 mb-6"> 📱 推荐的 RSS 阅读器 </h2>
<div className="grid md:grid-cols-2 gap-4"> {feedReaders.map((reader) => ( <a key={reader.name}
href={reader.url}
target="_blank" rel="noopener noreferrer" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500:border-blue-400 transition-colors" >
<h3 className="font-medium text-gray-900 mb-1"> {reader.name} ↗ </h3>
<p className="text-sm text-gray-600"> {reader.description} </p> </a> ))} </div> </section> {/* 使用说明 */}
<section className="bg-gray-50 rounded-lg p-6">
<h3 className="text-lg font-medium text-gray-900 mb-4"> 💡 如何使用 RSS 订阅？ </h3>
<ol className="space-y-3 text-gray-600">
<li>1. 选择一个 RSS 阅读器（如上方推荐）</li>
<li>2. 复制上方的 RSS 订阅链接</li>
<li>3. 在 RSS 阅读器中添加订阅源</li>
<li>4. 即可在阅读器中接收博客更新</li> </ol> </section> </div> </div> ) }