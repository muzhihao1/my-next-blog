/** * 标签索引页面 * @module app/tags/page */
import { getPosts }
from '@/lib/notion' 

import { getProjects }
from '@/lib/notion/projects' 

import { fallbackPosts }
from '@/lib/fallback-posts' 

import { fallbackProjects }
from '@/lib/fallback-projects' 

import Link from 'next/link' 

import type { Metadata } from 'next'
import { createTagSlug, getTagColor } from '@/types/tag' 

import { TagCloud } from '@/components/features/TagList'

// ISR配置：每小时重新验证一次
export const revalidate = 3600

export const metadata: Metadata = {
  title: '标签 - 博客',
  description: '浏览所有文章和项目标签'
}

/**
 * 标签统计信息
 * @interface TagInfo
 * @property {string} name - 标签名称
 * @property {string}
slug - 标签slug * @property {number}
postCount - 文章数量 * @property {number}
projectCount - 项目数量 * @property {number}
totalCount - 总数量 * @property {string}
color - 标签颜色 */
interface TagInfo {
  name: string
  slug: string
  postCount: number
  projectCount: number
  totalCount: number
  color: string
}
/** * 标签索引页面组件 * @async * @function TagsPage * @returns {Promise<JSX.Element>} 渲染的标签索引页面 * @description 显示所有标签的统计信息和标签云 */
export default async function TagsPage() {
  // 获取所有文章和项目
  const posts = await getPosts() || fallbackPosts
  const projects = await getProjects() || fallbackProjects
  
  // 统计标签信息
  const tagMap = new Map<string, TagInfo>()
  
  // 处理文章标签
  posts.forEach(post => {
    post.tags?.forEach(tag => {
      const slug = createTagSlug(tag)
      const existing = tagMap.get(slug)
      
      if (existing) {
        existing.postCount++
        existing.totalCount++
      } else {
        tagMap.set(slug, {
          name: tag,
          slug,
          postCount: 1,
          projectCount: 0,
          totalCount: 1,
          color: getTagColor(slug)
        })
      }
    })
  })
  
  // 处理项目标签
  projects.forEach(project => {
    project.tags?.forEach(tag => {
      const slug = createTagSlug(tag)
      const existing = tagMap.get(slug)
      
      if (existing) {
        existing.projectCount++
        existing.totalCount++
      } else {
        tagMap.set(slug, {
          name: tag,
          slug,
          postCount: 0,
          projectCount: 1,
          totalCount: 1,
          color: getTagColor(slug)
        })
      }
    })
  })
  
  // 转换为数组并排序
  const tags = Array.from(tagMap.values()).sort((a, b) => b.totalCount - a.totalCount)
  
  // 准备标签云数据
  const tagCloudData = tags.map(tag => ({
    name: tag.name,
    slug: tag.slug,
    count: tag.totalCount,
    weight: Math.min(tag.totalCount / Math.max(...tags.map(t => t.totalCount)), 1)
  }))
  
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
<div className="max-w-7xl mx-auto"> {/* 页面标题 */}
<div className="text-center mb-12">
<h1 className="text-4xl font-bold text-gray-900 mb-4"> 标签 </h1>
<p className="text-lg text-gray-600"> 探索不同主题的内容 </p> </div> {/* 标签云 */}
<section className="mb-16">
<h2 className="text-2xl font-bold text-gray-900 mb-8 text-center"> 标签云 </h2>
<TagCloud tags={tagCloudData}
/> </section> {/* 所有标签列表 */}
<section>
<h2 className="text-2xl font-bold text-gray-900 mb-8"> 所有标签 ({tags.length}) </h2>
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {tags.map(tag => ( <Link key={tag.slug}
href={`/tags/${tag.slug}`}
className="group block p-6 bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300" >
<div className="flex items-start justify-between mb-3">
<h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600:text-blue-400 transition-colors"> #{tag.name} </h3>
<div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }
}
/> </div>
<div className="space-y-1 text-sm text-gray-600">
<p>
<span className="font-medium text-gray-700">总计：</span> {tag.totalCount} 个内容 </p> {tag.postCount > 0 && ( <p>
<span className="font-medium text-gray-700">文章：</span> {tag.postCount} 篇 </p> )} {tag.projectCount > 0 && ( <p>
<span className="font-medium text-gray-700">项目：</span> {tag.projectCount} 个 </p> )} </div>
<div className="mt-4 flex items-center text-blue-600 group-hover:translate-x-1 transition-transform">
<span className="text-sm font-medium">查看全部</span>
<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M9 5l7 7-7 7" /> </svg> </div> </Link> ))} </div> </section> {/* 统计信息 */}
<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-gray-50 rounded-lg p-6 text-center">
<div className="text-3xl font-bold text-gray-900 mb-2"> {tags.length} </div>
<div className="text-gray-600"> 标签总数 </div> </div>
<div className="bg-gray-50 rounded-lg p-6 text-center">
<div className="text-3xl font-bold text-gray-900 mb-2"> {posts.length} </div>
<div className="text-gray-600"> 已标记文章 </div> </div>
<div className="bg-gray-50 rounded-lg p-6 text-center">
<div className="text-3xl font-bold text-gray-900 mb-2"> {projects.length} </div>
<div className="text-gray-600"> 已标记项目 </div> </div> </div> </div> </div> ) }