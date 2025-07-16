'use client' import { useState }
from 'react' 

import Link from 'next/link' interface SkillCategory { name: string label: string skills: string[]
level: number // 综合水平 0-100 color: string icon: React.ReactElement }
const skillCategories: SkillCategory[] = [ { name: 'frontend', label: '前端开发', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'], level: 92, color: 'from-blue-500 to-blue-600', icon: ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> </svg> ) }, { name: 'backend', label: '后端开发', skills: ['Node.js', 'Python', 'PostgreSQL', 'GraphQL'], level: 82, color: 'from-green-500 to-green-600', icon: ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /> </svg> ) }, { name: 'design', label: '设计能力', skills: ['UI/UX', 'Figma', '响应式设计', '设计系统'], level: 85, color: 'from-purple-500 to-purple-600', icon: ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /> </svg> ) }, { name: 'tools', label: '工具效率', skills: ['Git', 'Docker', 'CI/CD', 'VS Code'], level: 88, color: 'from-orange-500 to-orange-600', icon: ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> </svg> ) }
]/** * 首页技能展示组件 - 精简版 */
export default function SkillsOverview() { const [hoveredCategory, setHoveredCategory] = useState<string | null>(null) return ( <section className="py-16">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="text-center mb-12">
<h2 className="text-3xl font-bold text-gray-900 mb-4"> 技术栈概览 </h2>
<p className="text-lg text-gray-600 max-w-2xl mx-auto"> 全栈开发能力，从前端到后端，从设计到部署 </p> </div> {/* 技能卡片网格 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"> {skillCategories.map((category) => ( <div key={category.name}
className="relative group" onMouseEnter={() => setHoveredCategory(category.name)}
onMouseLeave={() => setHoveredCategory(null)} >
<div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"> {/* 图标和标题 */}
<div className="flex items-center justify-between mb-4">
<div className={`p-3 rounded-lg bg-gradient-to-r ${category.color}
text-white`}> {category.icon} </div>
<span className="text-2xl font-bold text-gray-900"> {category.level}% </span> </div> {/* 类别名称 */}
<h3 className="text-lg font-semibold text-gray-900 mb-2"> {category.label} </h3> {/* 技能列表 */}
<div className="space-y-1"> {category.skills.map((skill, index) => ( <span key={index}
className="inline-block text-sm text-gray-600 mr-2" > {skill}{index < category.skills.length - 1 && '·'} </span> ))} </div> {/* 进度条 */}
<div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
<div className={`h-full bg-gradient-to-r ${category.color}
transition-all duration-500`}
style={{ width: hoveredCategory === category.name ? `${category.level}%` : '0%', transition: 'width 1s ease-out' }
}
/> </div> </div> </div> ))} </div> {/* 技能雷达图（简化版） */}
<div className="bg-white rounded-xl p-8 shadow-lg">
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"> {/* 左侧：技能总览 */}
<div>
<h3 className="text-2xl font-bold text-gray-900 mb-6"> 核心竞争力 </h3>
<div className="space-y-4">
<SkillBar label="技术深度" value={90}
color="from-blue-500 to-blue-600" />
<SkillBar label="学习能力" value={95}
color="from-green-500 to-green-600" />
<SkillBar label="问题解决" value={92}
color="from-purple-500 to-purple-600" />
<SkillBar label="团队协作" value={88}
color="from-orange-500 to-orange-600" />
<SkillBar label="创新思维" value={85}
color="from-pink-500 to-pink-600" /> </div> </div> {/* 右侧：描述和链接 */}
<div className="space-y-6">
<div>
<h4 className="text-lg font-semibold text-gray-900 mb-3"> 技术特长 </h4>
<ul className="space-y-2 text-gray-600">
<li className="flex items-start">
<svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> </svg>
<span>精通现代前端框架和工具链</span> </li>
<li className="flex items-start">
<svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> </svg>
<span>丰富的全栈开发经验</span> </li>
<li className="flex items-start">
<svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> </svg>
<span>注重用户体验和性能优化</span> </li>
<li className="flex items-start">
<svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> </svg>
<span>持续学习和技术分享</span> </li> </ul> </div>
<div className="pt-6">
<Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800:bg-gray-100 transition-colors" > 查看详细技能 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M17 8l4 4m0 0l-4 4m4-4H3" /> </svg> </Link> </div> </div> </div> </div> </div> </section> ) }
/** * 技能进度条组件 */
function SkillBar({ label, value, color }: { label: string; value: number; color: string }) { return ( <div>
<div className="flex justify-between mb-2">
<span className="text-sm font-medium text-gray-700">{label}</span>
<span className="text-sm text-gray-500">{value}%</span> </div>
<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
<div className={`h-full bg-gradient-to-r ${color}
transition-all duration-500`}
style={{ width: `${value}%` }
}
/> </div> </div> ) }