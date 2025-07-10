'use client' import { useState, useEffect }
from 'react' 

import Link from 'next/link' 

import Image from 'next/image' // 社交媒体链接配置 const socialLinks = [ { name: 'GitHub', href: 'https://github.com/yourusername', icon: ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/> </svg> ) }, { name: 'Twitter', href: 'https://twitter.com/yourusername', icon: ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/> </svg> ) }, { name: 'LinkedIn', href: 'https://linkedin.com/in/yourusername', icon: ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/> </svg> ) }, { name: 'Email', href: 'mailto:hello@yourdomain.com', icon: ( <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> </svg> ) }
]// 职业亮点 const highlights = [ { number: '5+', label: '年开发经验', icon: '💼' }, { number: '50+', label: '完成项目', icon: '🚀' }, { number: '1000+', label: '代码提交', icon: '💻' }, { number: '∞', label: '学习热情', icon: '📚' }
]// 打字机效果文本 const roles = [ '全栈开发者', '技术作家', 'UI/UX 爱好者', '开源贡献者', '终身学习者' ] /** * 增强的个人介绍组件 */
export default function EnhancedHero() { const [currentRoleIndex, setCurrentRoleIndex] = useState(0) const [displayText, setDisplayText] = useState('') const [isDeleting, setIsDeleting] = useState(false) // 打字机效果 useEffect(() => { const currentRole = roles[currentRoleIndex]
const timeout = setTimeout(() => { if (!isDeleting) { if (displayText.length < currentRole.length) { setDisplayText(currentRole.slice(0, displayText.length + 1)) }
else { setTimeout(() => setIsDeleting(true), 2000) }
}
else { if (displayText.length > 0) { setDisplayText(displayText.slice(0, -1)) }
else { setIsDeleting(false) setCurrentRoleIndex((prev) => (prev + 1) % roles.length) }
} }, isDeleting ? 50 : 150) return () => clearTimeout(timeout) }, [displayText, currentRoleIndex, isDeleting]) return ( <section className="relative py-20 overflow-hidden"> {/* 背景装饰 */}
<div className="absolute inset-0 -z-10">
<div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
<div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
<div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div> </div>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"> {/* 左侧：文字内容 */}
<div className="space-y-8"> {/* 问候语 */}
<div className="space-y-4">
<h1 className="text-5xl md:text-6xl font-bold text-gray-900"> 你好，我是 <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Zhihao Mu </span> </h1> {/* 动态角色展示 */}
<div className="text-2xl md:text-3xl text-gray-700 h-10">
<span>{displayText}</span>
<span className="animate-pulse">|</span> </div> </div> {/* 个人简介 */}
<p className="text-lg text-gray-600 leading-relaxed"> 热爱技术，享受创造。专注于构建优雅的解决方案， 致力于通过代码和文字分享知识，帮助他人成长。 相信持续学习和开源精神的力量。 </p> {/* 社交链接 */}
<div className="flex items-center gap-4"> {socialLinks.map((link) => ( <a key={link.name}
href={link.href}
target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200:bg-gray-700 transition-colors group" aria-label={link.name} >
<span className="text-gray-600 group-hover:text-gray-900:text-white transition-colors"> {link.icon} </span> </a> ))} </div> {/* 行动按钮 */}
<div className="flex flex-wrap gap-4">
<Link href="/about" className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800:bg-gray-100 transition-colors" > 了解更多 </Link>
<Link href="/projects" className="px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50:bg-gray-700 transition-colors" > 查看项目 </Link> </div> </div> {/* 右侧：视觉元素 */}
<div className="relative"> {/* 头像占位 */}
<div className="relative w-80 h-80 mx-auto">
<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-50"></div>
<div className="relative w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
<span className="text-8xl">👨‍💻</span> </div> </div> {/* 职业亮点 */}
<div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4">
<div className="flex items-center gap-3">
<span className="text-2xl">🏆</span>
<div>
<p className="text-sm text-gray-600">代码质量</p>
<p className="font-semibold text-gray-900">A+ 级别</p> </div> </div> </div>
<div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4">
<div className="flex items-center gap-3">
<span className="text-2xl">⚡</span>
<div>
<p className="text-sm text-gray-600">响应速度</p>
<p className="font-semibold text-gray-900">24h 内</p> </div> </div> </div> </div> </div> {/* 底部统计 */}
<div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"> {highlights.map((item, index) => ( <div key={index}
className="text-center">
<div className="text-4xl mb-2">{item.icon}</div>
<div className="text-3xl font-bold text-gray-900 mb-1"> {item.number} </div>
<div className="text-sm text-gray-600"> {item.label} </div> </div> ))} </div> </div>
<style jsx>{` @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); }
}.animate-blob { animation: blob 7s infinite; } .animation-delay-2000 { animation-delay: 2s; } .animation-delay-4000 { animation-delay: 4s; } `}</style> </section> ) }