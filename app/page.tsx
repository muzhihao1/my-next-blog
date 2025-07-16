import Link from 'next/link' 

import { getPublishedPosts, withFallback, formatDate }
from '@/lib/notion' 

import { getProjects }
from '@/lib/notion/projects' 

import { fallbackPosts }
from '@/lib/fallback-posts' 

import { fallbackProjects }
from '@/lib/fallback-projects' 

import { OptimizedImage }
from '@/components/ui/OptimizedImage' 

import Container from '@/components/ui/Container' 

import StatsSection from '@/components/sections/StatsSection' 

import StatsWidget from '@/components/widgets/StatsWidget' 

import HomeClient from '@/components/features/HomeClient'

// ISR配置：每30分钟重新验证一次
export const revalidate = 1800

// 提取 Hero Section 作为独立组件
function HeroSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Container size="md" className="text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          欢迎来到<span className="text-gradient">Peter的人生实验室</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          这里是我进行人生实验的地方 —— 用代码验证想法，用文字记录成长，用项目探索可能。每一天都是新的实验，每个想法都值得被验证
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/projects"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            查看项目
          </Link>
          <Link
            href="/posts"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            阅读博客
          </Link>
        </div>
      </Container>
    </section>
  )
}
export default async function Home() {
  // 获取数据
  const posts = await withFallback(
    () => getPublishedPosts(),
    fallbackPosts
  )
  
  const projects = await withFallback(
    () => getProjects(),
    fallbackProjects
  )
  
  // 获取最新文章和精选项目
  const recentPosts = posts.slice(0, 3)
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)
  
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
    <div>
      {/* Hero Section */}
      <HeroSection />
      
      {/* 使用客户端组件处理需要客户端功能的部分 */}
<HomeClient> {/* Stats Section */}
<StatsSection /> {/* Statistics Widget */}
<section className="py-16">
<Container size="lg">
<StatsWidget /> </Container> </section> </HomeClient> {/* Featured Projects */}
<section className="py-20">
<Container size="xl">
<div className="text-center mb-12">
<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"> 精选项目 </h2>
<p className="text-lg text-gray-600"> 探索我最引以为豪的作品 </p> </div>
<div className="grid md:grid-cols-3 gap-8"> {featuredProjects.map((project) => ( <Link key={project.id}
href={`/projects/${project.slug}`}
className="group block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300" >
<div className="aspect-video relative overflow-hidden">
<OptimizedImage src={project.thumbnail}
alt={project.title}
fill className="group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" /> </div>
<div className="p-6">
<h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"> {project.title} </h3>
<p className="text-gray-600 mb-4 line-clamp-2"> {project.description} </p>
<div className="flex flex-wrap gap-2"> {project.techStack.slice(0, 3).map((tech) => ( <span key={tech}
className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"> {tech} </span> ))} </div> </div> </Link> ))} </div>
<div className="text-center mt-12">
<Link href="/projects" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors" > 查看所有项目 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M17 8l4 4m0 0l-4 4m4-4H3" /> </svg> </Link> </div> </Container> </section> {/* Recent Posts */}
<section className="py-20 bg-gray-50">
<Container size="xl">
<div className="text-center mb-12">
<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"> 最新文章 </h2>
<p className="text-lg text-gray-600"> 技术思考与经验分享 </p> </div>
<div className="grid md:grid-cols-3 gap-8"> {recentPosts.map((post) => ( <article key={post.id}
className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
<Link href={`/posts/${post.slug}`}
className="block p-6">
<div className="flex items-center gap-4 mb-4">
<span className={getCategoryClass(post.category)}> {post.category} </span>
<time className="text-sm text-gray-500"> {formatDate(post.date)} </time> </div>
<h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors"> {post.title} </h3>
<p className="text-gray-600 line-clamp-3"> {post.excerpt} </p> </Link> </article> ))} </div>
<div className="text-center mt-12">
<Link href="/blog" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors" > 查看所有文章 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M17 8l4 4m0 0l-4 4m4-4H3" /> </svg> </Link> </div> </Container> </section> </div> ) }