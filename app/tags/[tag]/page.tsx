/** * 标签详情页面 * @module app/tags/[tag]/page */
import { getPosts }
from '@/lib/notion' 

import { getProjects }
from '@/lib/notion/projects' 

import { fallbackPosts }
from '@/lib/fallback-posts' 

import { fallbackProjects }
from '@/lib/fallback-projects' 

import { notFound }
from 'next/navigation' 

import Link from 'next/link' 

import Image from 'next/image' 

import type { Metadata } from 'next'
import { BlogPost } from '@/types/notion' 

import { Project }
from '@/types/project' 

import { createTagSlug } from '@/types/tag'

// ISR配置：每小时重新验证一次
export const revalidate = 3600

/**
 * 内容卡片组件
 * @component
 * @param {Object} props - 组件属性
 * @param {BlogPost | Project} props.item - 内容项
 * @param {'post' | 'project'} props.type - 内容类型
 * @returns {JSX.Element} 渲染的内容卡片
 */
function ContentCard({ item, type }: { item: BlogPost | Project; type: 'post' | 'project' }) {
  const href = type === 'post' ? `/posts/${item.slug}` : `/projects/${item.slug}`
  const date = type === 'post' 
    ? new Date((item as BlogPost).date).toLocaleDateString('zh-CN')
    : new Date((item as Project).startDate).toLocaleDateString('zh-CN')
  
  return (
    <Link href={href}
className="block group">
<article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full"> {/* 缩略图 */} {((type === 'post' && (item as BlogPost).cover) || (type === 'project' && (item as Project).thumbnail)) && ( <div className="relative aspect-video overflow-hidden">
<Image src={(type === 'post' ? (item as BlogPost).cover : (item as Project).thumbnail) || ''}
alt={item.title}
fill className="object-cover group-hover:scale-105 transition-transform duration-300" /> </div> )} {/* 内容 */}
<div className="p-6"> {/* 类型标签 */}
<div className="flex items-center gap-3 mb-3">
<span className={`text-xs font-medium px-2 py-1 rounded ${ type === 'post' ? 'bg-blue-100/30 text-blue-700' : 'bg-green-100/30 text-green-700' }`}> {type === 'post' ? '文章' : '项目'} </span> {type === 'post' && (item as BlogPost).category && ( <span className="text-sm text-gray-500"> {(item as BlogPost).category} </span> )} {type === 'project' && ( <span className="text-sm text-gray-500"> {(item as Project).status === 'active' ? '进行中' : (item as Project).status === 'completed' ? '已完成' : '已归档'} </span> )} </div> {/* 标题 */}
<h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600:text-blue-400 transition-colors"> {item.title} </h3> {/* 描述 */}
<p className="text-gray-600 mb-4 line-clamp-2"> {type === 'post' ? (item as BlogPost).excerpt : (item as Project).description} </p> {/* 底部信息 */}
<div className="flex items-center justify-between text-sm">
              <time className="text-gray-500">{date}</time>
              {type === 'post' && (item as BlogPost).readTime && (
                <span className="text-gray-500">{(item as BlogPost).readTime}</span>
              )}
            </div>
          </div>
        </article>
      </Link>
    )
}

/**
 * 生成静态路径
 * @async
 * @function generateStaticParams
 * @returns {Promise<Array<{tag: string}>>} 返回所有标签的路径参数
 * @description 从文章和项目中收集所有唯一的标签
 */
export async function generateStaticParams() {
  const posts = await getPosts() || fallbackPosts
  const projects = await getProjects() || fallbackProjects
  
  // 收集所有唯一的标签
  const allTags = new Set<string>()
  
  posts.forEach(post => {
    post.tags?.forEach(tag => allTags.add(tag))
  })
  
  projects.forEach(project => {
    project.tags?.forEach(tag => allTags.add(tag))
  })
  
  return Array.from(allTags).map(tag => ({
    tag: createTagSlug(tag)
  }))
}
/** * 生成页面元数据 * @async * @function generateMetadata * @param {Object}
props - 属性对象 * @param {Promise<{tag: string}>}
props.params - 包含标签的参数 * @returns {Promise<Metadata>} 返回页面的元数据 */
export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  
  return {
    title: `${decodedTag} - 标签`,
    description: `查看所有标记为"${decodedTag}"的文章和项目`
  }
}/** * 标签详情页面组件 * @async * @function TagDetailPage * @param {Object}
props - 组件属性 * @param {Promise<{tag: string}>}
props.params - 包含标签的参数 * @returns {Promise<JSX.Element>} 渲染的标签详情页面 * @description 显示所有带有特定标签的文章和项目 */
export default async function TagDetailPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  
  // 获取所有文章和项目
  const posts = await getPosts() || fallbackPosts
  const projects = await getProjects() || fallbackProjects
  
  // 筛选包含该标签的内容
  const taggedPosts = posts.filter(post => 
    post.tags?.some(t => createTagSlug(t) === tag || t === decodedTag)
  )
  
  const taggedProjects = projects.filter(project => 
    project.tags?.some(t => createTagSlug(t) === tag || t === decodedTag)
  )
  
  const totalCount = taggedPosts.length + taggedProjects.length
  
  if (totalCount === 0) {
    notFound()
  }
  
  // 找到原始标签名称（用于显示）
  const originalTagName = [
    ...taggedPosts.flatMap(p => p.tags || []),
    ...taggedProjects.flatMap(p => p.tags || [])
  ].find(t => createTagSlug(t) === tag || t === decodedTag) || decodedTag
  
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
<div className="max-w-7xl mx-auto"> {/* 页面头部 */}
<div className="mb-12 text-center">
<h1 className="text-4xl font-bold text-gray-900 mb-4"> #{originalTagName} </h1>
<p className="text-lg text-gray-600"> 共 {totalCount} 个相关内容 </p> </div> {/* 文章部分 */} {taggedPosts.length > 0 && ( <section className="mb-12">
<h2 className="text-2xl font-bold text-gray-900 mb-6"> 文章 ({taggedPosts.length}) </h2>
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {taggedPosts.map(post => ( <ContentCard key={post.id}
item={post}
type="post" /> ))} </div> </section> )} {/* 项目部分 */} {taggedProjects.length > 0 && ( <section className="mb-12">
<h2 className="text-2xl font-bold text-gray-900 mb-6"> 项目 ({taggedProjects.length}) </h2>
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {taggedProjects.map(project => ( <ContentCard key={project.id}
item={project}
type="project" /> ))} </div> </section> )} {/* 返回按钮 */}
<div className="mt-12 text-center">
<Link href="/" className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200:bg-gray-700 text-gray-700 hover:text-gray-900:text-white rounded-lg font-medium transition-all group" >
<svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M10 19l-7-7m0 0l7-7m-7 7h18" /> </svg> 返回首页 </Link> </div> </div> </div> ) }