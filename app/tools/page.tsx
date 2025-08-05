/** * Tools listing page */
import { Suspense }
from 'react' 

import { getTools }
from '@/lib/notion/tools' 

import { fallbackTools }
from '@/lib/fallback-tools' 

import type { Tool } from '@/types/tool'

/** * Get tools data with fallback */
async function getToolsData(): Promise<Tool[]> {
  try {
    const tools = await getTools()
    return tools.length > 0 ? tools : fallbackTools
  } catch (error) {
    console.error('Error loading tools:', error)
    return fallbackTools
  }
}

/** * Import client component */
import ToolsList from '@/components/features/ToolsList'
import ToolsListOptimized from '@/components/features/ToolsListOptimized'

/** * Tools content component */
async function ToolsContent() {
  const tools = await getToolsData()
  // Use the optimized version for better UX
  return <ToolsListOptimized tools={tools} />
}
/** * Loading skeleton */
function ToolsSkeleton() { return ( <div className="space-y-12"> {[1, 2, 3].map((section: number) => ( <section key={section}>
<div className="h-8 w-32 bg-muted rounded mb-6 animate-pulse" />
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {[1, 2, 3].map((item: number) => ( <div key={item}
className="p-6 rounded-lg border border-border bg-card" >
<div className="h-6 w-3/4 bg-muted rounded mb-3 animate-pulse" />
<div className="h-4 w-full bg-muted rounded mb-2 animate-pulse" />
<div className="h-4 w-2/3 bg-muted rounded mb-4 animate-pulse" />
<div className="flex justify-between">
<div className="h-4 w-20 bg-muted rounded animate-pulse" />
<div className="h-4 w-16 bg-muted rounded animate-pulse" /> </div> </div> ))} </div> </section> ))} </div> ) }
/** * Tools page */
export default function ToolsPage() { return ( <div className="container max-w-6xl py-12">
<div className="mb-12">
<h1 className="text-4xl font-bold mb-4">工具推荐</h1>
<p className="text-xl text-muted-foreground"> 分享我在工作和生活中使用的优秀工具，帮助你提高效率 </p> </div>
<Suspense fallback={<ToolsSkeleton />}>
<ToolsContent /> </Suspense> </div> ) }