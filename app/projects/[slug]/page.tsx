import { getProjects, getProjectBySlug }
from '@/lib/notion/projects' 

import { fallbackProjects }
from '@/lib/fallback-projects' 

import { notFound }
from 'next/navigation' 

import Image from 'next/image' 

import Link from 'next/link' 

import { remark }
from 'remark' 

import html from 'remark-html' 

import { StructuredData }
from '@/components/seo/StructuredData' 

import { CodeSnippet }
from '@/components/features/CodeSnippet' 

import { SocialShare }
from '@/components/features/SocialShare' 

import TagList from '@/components/features/TagList' 

import FavoriteButton from '@/components/features/FavoriteButton' 

import { FavoriteType }
from '@/lib/hooks/useFavorites' 

import type { Metadata } from 'next'
import type { Project } from '@/types/project'

// ISR配置：每小时重新验证一次
export const revalidate = 3600

// 生成静态路径
export async function generateStaticParams() {
  let projects = await getProjects()
  if (projects.length === 0) {
    projects = fallbackProjects
  }
  return projects.map((project: Project) => ({
    slug: project.slug,
  }))
}
// 处理 Markdown 内容
async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown)
  return result.toString()
}

// 生成元数据
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  let project = await getProjectBySlug(slug)
  if (!project) {
    project = fallbackProjects.find(p => p.slug === slug) || null
  }

  if (!project) {
    return {
      title: '项目不存在',
      description: '抱歉，找不到这个项目。'
    }
  }

  return {
    title: `${project.title} - 项目展示`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: 'website',
      images: project.thumbnail ? [project.thumbnail] : [],
    },
  }
}
export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let project = await getProjectBySlug(slug)
  
  // 如果没有从 Notion 获取到，尝试从后备数据中查找
  if (!project) {
    project = fallbackProjects.find(p => p.slug === slug) || null
  }

  if (!project) {
    notFound()
  }

  const contentHtml = await markdownToHtml(project.content)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  const projectStructuredData = {
    name: project.title,
    description: project.description,
    url: `${baseUrl}/projects/${slug}`,
    image: project.thumbnail,
    author: {
      '@type': 'Person',
      name: 'Your Name'
    },
    dateCreated: project.startDate,
    applicationCategory: project.category
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
<div className="max-w-4xl mx-auto">
<StructuredData type="SoftwareApplication" data={projectStructuredData}
/> {/* 返回按钮 */}
<Link href="/projects" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900:text-white mb-8 transition-colors" >
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M15 19l-7-7 7-7" /> </svg> 返回项目列表 </Link> {/* 项目头部信息 */}
<header className="mb-12">
<div className="flex items-center gap-4 mb-4">
<span className={`px-3 py-1 rounded-full text-sm font-medium ${ project.status === 'active' ? 'bg-green-100/30 text-green-700' : project.status === 'completed' ? 'bg-blue-100/30 text-blue-700' : 'bg-gray-100/30 text-gray-700' }`}> {project.status === 'active' ? '进行中' : project.status === 'completed' ? '已完成' : '已归档'} </span> {project.featured && ( <span className="px-3 py-1 bg-yellow-100/30 text-yellow-700 rounded-full text-sm font-medium"> 精选项目 </span> )} </div>
<h1 className="text-4xl font-bold text-gray-900 mb-4"> {project.title} </h1>
<p className="text-xl text-gray-600 mb-6"> {project.description} </p> {/* 标签 */} {project.tags && project.tags.length > 0 && ( <div className="mb-6">
<TagList tags={project.tags}
size="medium" /> </div> )} {/* 社交分享和收藏 */}
<div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
<SocialShare url={`${baseUrl}/projects/${slug}`}
title={project.title}
description={project.description}
tags={project.techStack.slice(0, 3)}
/>
<FavoriteButton itemId={project.id}
itemType={FavoriteType.PROJECT}
title={project.title}
description={project.description}
thumbnail={project.thumbnail}
slug={project.slug}
size="medium" /> </div> {/* 项目链接 */}
<div className="flex flex-wrap gap-4"> {project.demoUrl && ( <a href={project.demoUrl}
target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors" >
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /> </svg> 在线演示 </a> )} {project.githubUrl && ( <a href={project.githubUrl}
target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900:bg-gray-600 transition-colors" >
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/> </svg> 查看源码 </a> )} </div> </header> {/* 项目信息 */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
<div className="bg-gray-50 rounded-lg p-6">
<h3 className="font-semibold text-gray-900 mb-4">技术栈</h3>
<div className="flex flex-wrap gap-2"> {project.techStack.map((tech: string) => ( <span key={tech}
className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm" > {tech} </span> ))} </div> </div>
<div className="bg-gray-50 rounded-lg p-6">
<h3 className="font-semibold text-gray-900 mb-4">时间线</h3>
<div className="space-y-2 text-sm">
<div className="flex justify-between">
<span className="text-gray-600">开始时间</span>
<span className="text-gray-900"> {new Date(project.startDate).toLocaleDateString('zh-CN')} </span> </div> {project.endDate && ( <div className="flex justify-between">
<span className="text-gray-600">结束时间</span>
<span className="text-gray-900"> {new Date(project.endDate).toLocaleDateString('zh-CN')} </span> </div> )} </div> </div> {project.metrics && ( <div className="bg-gray-50 rounded-lg p-6">
<h3 className="font-semibold text-gray-900 mb-4">项目成果</h3>
<div className="space-y-2 text-sm"> {project.metrics.users && ( <div>
<span className="text-gray-600">用户数：</span>
<span className="text-gray-900 ml-2">{project.metrics.users.toLocaleString()}</span> </div> )} {project.metrics.performance && ( <div>
<span className="text-gray-600">性能：</span>
<span className="text-gray-900 ml-2">{project.metrics.performance}</span> </div> )} {project.metrics.achievement && ( <div>
<span className="text-gray-600">成就：</span>
<span className="text-gray-900 ml-2">{project.metrics.achievement}</span> </div> )} </div> </div> )} </div> {/* 项目截图 */} {project.screenshots && project.screenshots.length > 0 && ( <div className="mb-12">
<h2 className="text-2xl font-bold text-gray-900 mb-6">项目截图</h2>
<div className="grid gap-4"> {project.screenshots.map((screenshot: string, index: number) => ( <div key={index}
className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
<Image src={screenshot}
alt={`${project.title} 截图 ${index + 1}`}
fill className="object-cover" /> </div> ))} </div> </div> )} {/* 主要功能 */} {project.keyFeatures && project.keyFeatures.length > 0 && ( <div className="mb-12">
<h2 className="text-2xl font-bold text-gray-900 mb-6">主要功能</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {project.keyFeatures.map((feature: string, index: number) => ( <div key={index}
className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
<svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M5 13l4 4L19 7" /> </svg>
<span className="text-gray-700">{feature}</span> </div> ))} </div> </div> )} {/* 开发过程 */} {project.developmentProcess && ( <div className="mb-12">
<h2 className="text-2xl font-bold text-gray-900 mb-6">开发过程</h2>
<div className="bg-blue-50/20 rounded-lg p-6">
<div className="prose prose-blue max-w-none">
<p className="text-gray-700">{project.developmentProcess}</p> </div> </div> </div> )} {/* 代码示例 */} {project.codeSnippets && project.codeSnippets.length > 0 && ( <div className="mb-12">
<h2 className="text-2xl font-bold text-gray-900 mb-6">代码示例</h2>
<CodeSnippet files={project.codeSnippets}
/> </div> )} {/* 技术挑战与解决方案 */} {((project.challenges && project.challenges.length > 0) || (project.solutions && project.solutions.length > 0)) && ( <div className="mb-12">
<h2 className="text-2xl font-bold text-gray-900 mb-6">技术挑战与解决方案</h2>
<div className="space-y-6"> {project.challenges && project.challenges.map((challenge: string, index: number) => ( <div key={index}
className="bg-gray-50 rounded-lg p-6">
<div className="flex items-start gap-4">
<div className="flex-shrink-0">
<div className="w-10 h-10 bg-red-100/30 rounded-full flex items-center justify-center">
<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> </svg> </div> </div>
<div className="flex-1">
<h3 className="font-semibold text-gray-900 mb-2">挑战 {index + 1}</h3>
<p className="text-gray-600 mb-3">{challenge}</p> {project.solutions && project.solutions[index] && ( <div className="mt-4 bg-green-50/20 rounded-lg p-4">
<div className="flex items-start gap-3">
<svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg>
<div>
<h4 className="font-medium text-gray-900 mb-1">解决方案</h4>
<p className="text-gray-600">{project.solutions[index]
}</p> </div> </div> </div> )} </div> </div> </div> ))} </div> </div> )} {/* 项目详情 */}
<div className="prose prose-lg max-w-none mb-16">
<div dangerouslySetInnerHTML={{ __html: contentHtml }
}
/> </div> </div> </div> ) }