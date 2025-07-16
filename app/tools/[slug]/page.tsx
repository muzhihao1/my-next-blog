/** * Tool detail page */
import { notFound }
from 'next/navigation' 

import { Suspense }
from 'react' 

import { getToolBySlug, getAllToolSlugs }
from '@/lib/notion/tools' 

import { fallbackTools }
from '@/lib/fallback-tools' 

import type { Tool } from '@/types/tool'
import { StructuredData, generateSoftwareApplicationStructuredData } from '@/components/seo/StructuredData' 

import type { Metadata } from 'next'

// ISR配置：每小时重新验证一次
export const revalidate = 3600

/**
 * Generate static params for all tools
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllToolSlugs()
    if (slugs.length > 0) {
      return slugs.map((slug: string) => ({ slug }))
    }
  } catch (error) {
    console.error('Error generating static params:', error)
  }
  
  // Fallback to static tools
  return fallbackTools.map((tool: Tool) => ({ slug: tool.slug }))
}

/**
 * Get tool data with fallback
 */
async function getToolData(slug: string): Promise<Tool | null> {
  try {
    const tool = await getToolBySlug(slug)
    if (tool) return tool
  }
  catch (error) {
    console.error('Error loading tool:', error)
  }
  // Try fallback tools
  return fallbackTools.find(tool => tool.slug === slug) || null
}
/** * Generate metadata for the tool page */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tool = await getToolData(slug)
  
  if (!tool) {
    return {
      title: '工具不存在',
      description: '抱歉，找不到这个工具。'
    }
  }
  
  return {
    title: `${tool.name} - 工具推荐`,
    description: tool.description,
    openGraph: {
      title: tool.name,
      description: tool.description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: tool.name,
      description: tool.description,
    },
  }
}

/** * Tool content component */
async function ToolContent({ slug }: { slug: string }) {
  const tool = await getToolData(slug)
  
  if (!tool) {
    notFound()
  }
  
  const priceLabels = { free: '免费', freemium: '免费增值', paid: '付费', subscription: '订阅制' }
  const categoryLabels = { development: '开发工具', design: '设计工具', productivity: '效率工具', hardware: '硬件设备', service: '在线服务' }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  
  const structuredData = generateSoftwareApplicationStructuredData({
    name: tool.name,
    description: tool.description,
    category: tool.category,
    applicationCategory: categoryLabels[tool.category],
    offers: tool.price !== 'free' ? { price: '0', priceCurrency: 'CNY' } : undefined,
    aggregateRating: { ratingValue: tool.rating, reviewCount: 1 },
    url: `${baseUrl}/tools/${slug}`
  })
  
  return (
    <article className="max-w-4xl mx-auto">
<StructuredData type="SoftwareApplication" data={structuredData}
/> {/* Header */}
<header className="mb-12 mt-8">
<div className="flex items-center gap-4 mb-4">
<span className="text-sm text-muted-foreground"> {categoryLabels[tool.category]
}</span>
<span className={`text-sm px-2 py-1 rounded ${ tool.price === 'free' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground' }`}> {priceLabels[tool.price]
}</span> </div>
<h1 className="text-4xl font-bold mb-4">{tool.name}</h1>
<p className="text-xl text-muted-foreground mb-6">{tool.description}</p>
<div className="flex items-center gap-6">
<div className="flex items-center space-x-1"> {[...Array(5)].map((_: undefined, i: number) => ( <svg key={i}
className={`w-5 h-5 ${ i < tool.rating ? 'text-yellow-500 fill-current' : 'text-gray-300' }`}
viewBox="0 0 20 20" fill="currentColor" >
<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /> </svg> ))}
<span className="ml-2 text-muted-foreground"> {tool.rating}/5 </span> </div> {tool.website && ( <a href={tool.website}
target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline" > 访问官网 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /> </svg> </a> )} </div> </header> {/* Main Content */}
<div className="space-y-12"> {/* Review */} {tool.review && ( <section>
<h2 className="text-2xl font-bold mb-4">详细评测</h2>
<div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: tool.review }
}
/> </section> )} {/* Pros and Cons */}
<section className="grid md:grid-cols-2 gap-8">
<div>
<h3 className="text-xl font-bold mb-4 text-green-600"> 优点 </h3>
<ul className="space-y-2"> {tool.pros.map((pro: string, index: number) => ( <li key={index}
className="flex items-start gap-2">
<svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M5 13l4 4L19 7" /> </svg>
<span>{pro}</span> </li> ))} </ul> </div>
<div>
<h3 className="text-xl font-bold mb-4 text-red-600"> 缺点 </h3>
<ul className="space-y-2"> {tool.cons.map((con: string, index: number) => ( <li key={index}
className="flex items-start gap-2">
<svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M6 18L18 6M6 6l12 12" /> </svg>
<span>{con}</span> </li> ))} </ul> </div> </section> {/* Use Cases */} {tool.useCases.length > 0 && ( <section>
<h3 className="text-xl font-bold mb-4">使用场景</h3>
<div className="flex flex-wrap gap-3"> {tool.useCases.map((useCase: string, index: number) => ( <span key={index}
className="px-4 py-2 bg-muted rounded-full text-sm" > {useCase} </span> ))} </div> </section> )} {/* Alternatives */} {tool.alternatives && tool.alternatives.length > 0 && ( <section>
<h3 className="text-xl font-bold mb-4">替代工具</h3>
<div className="flex flex-wrap gap-3"> {tool.alternatives.map((alt: string, index: number) => ( <span key={index}
className="px-4 py-2 border border-border rounded-full text-sm hover:bg-muted transition-colors" > {alt} </span> ))} </div> </section> )} {/* Tags */} {tool.tags.length > 0 && ( <section>
<h3 className="text-xl font-bold mb-4">标签</h3>
<div className="flex flex-wrap gap-2"> {tool.tags.map((tag: string, index: number) => ( <span key={index}
className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm" > #{tag} </span> ))} </div> </section> )} </div> {/* Last Updated */}
<footer className="mt-12 pt-8 border-t">
<p className="text-sm text-muted-foreground"> 最后更新于 {new Date(tool.lastUpdated).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} </p> </footer> </article> ) }
/** * Loading skeleton */
function ToolSkeleton() { return ( <div className="max-w-4xl mx-auto">
<div className="mb-12">
<div className="flex gap-4 mb-4">
<div className="h-6 w-20 bg-muted rounded animate-pulse" />
<div className="h-6 w-16 bg-muted rounded animate-pulse" /> </div>
<div className="h-10 w-3/4 bg-muted rounded mb-4 animate-pulse" />
<div className="h-6 w-full bg-muted rounded mb-6 animate-pulse" />
<div className="flex gap-6">
<div className="h-6 w-32 bg-muted rounded animate-pulse" />
<div className="h-6 w-24 bg-muted rounded animate-pulse" /> </div> </div>
<div className="space-y-12">
<div className="h-48 bg-muted rounded animate-pulse" />
<div className="grid md:grid-cols-2 gap-8">
<div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/** * Tool detail page component */
export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  return (
    <div className="container py-12">
      <Suspense fallback={<ToolSkeleton />}>
        <ToolContent slug={slug} />
      </Suspense>
    </div>
  )
}