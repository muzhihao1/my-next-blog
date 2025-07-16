'use client'

import { useState, useEffect, Suspense }
from 'react' 

import { useSearchParams }
from 'next/navigation' 

import Link from 'next/link' 

import { Tool }
from '@/types/tool' 

import { getTools }
from '@/lib/notion/tools' 

import { fallbackTools }
from '@/lib/fallback-tools' 

import ToolCompareTable from '@/components/features/ToolCompareTable' 

import ToolSelector from '@/components/features/ToolSelector'

function ToolCompareContent() {
  const searchParams = useSearchParams()
  const [tools, setTools] = useState<Tool[]>([])
  const [selectedTools, setSelectedTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // 从 URL 参数获取要对比的工具
  useEffect(() => {
    const loadTools = async () => {
      setIsLoading(true)
      try {
        let allTools = await getTools()
        if (allTools.length === 0) {
          allTools = fallbackTools
        }
        setTools(allTools)
        
        // 从 URL 参数获取选中的工具
        const toolIds = searchParams.get('tools')?.split(',') || []
        const selected = allTools.filter(tool => toolIds.includes(tool.id))
        setSelectedTools(selected)
      } catch (error) {
        console.error('Failed to load tools:', error)
        setTools(fallbackTools)
      } finally {
        setIsLoading(false)
      }
    }
    loadTools()
  }, [searchParams])
  
  // 更新 URL 参数
  const updateUrlParams = (tools: Tool[]) => {
    const toolIds = tools.map((t: Tool) => t.id).join(',')
    const newUrl = toolIds ? `/tools/compare?tools=${toolIds}` : '/tools/compare'
    window.history.pushState({}, '', newUrl)
  }
  
  // 添加工具到对比
  const addToolToCompare = (tool: Tool) => {
    if (selectedTools.length >= 4) {
      alert('最多只能同时对比 4 个工具')
      return
    }
    
    if (!selectedTools.find(t => t.id === tool.id)) {
      const newTools = [...selectedTools, tool]
      setSelectedTools(newTools)
      updateUrlParams(newTools)
    }
  }
  
  // 从对比中移除工具
  const removeToolFromCompare = (toolId: string) => {
    const newTools = selectedTools.filter(t => t.id !== toolId)
    setSelectedTools(newTools)
    updateUrlParams(newTools)
  }
  
  // 清空对比
  const clearCompare = () => {
    setSelectedTools([])
    updateUrlParams([])
  }
  
  // 分享对比结果
  const shareCompare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '工具对比结果',
          text: `我正在对比这些工具：${selectedTools.map((t: Tool) => t.name).join('、')}`,
          url: url
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(url)
      alert('对比链接已复制到剪贴板')
    }
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
<div className="max-w-7xl mx-auto"> {/* 页头 */}
<div className="mb-8">
<Link href="/tools" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900:text-white mb-4 transition-colors" >
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M15 19l-7-7 7-7" /> </svg> 返回工具列表 </Link>
<h1 className="text-3xl font-bold text-gray-900 mb-4"> 工具对比 </h1>
<p className="text-gray-600 max-w-3xl"> 选择最多 4 个工具进行详细对比，帮助你做出最佳选择。 </p> </div> {/* 已选择的工具 */} {selectedTools.length > 0 && ( <div className="mb-8 p-4 bg-gray-50 rounded-lg">
<div className="flex items-center justify-between mb-4">
<h2 className="text-lg font-semibold text-gray-900"> 已选择 {selectedTools.length} 个工具 </h2>
<div className="flex gap-2">
<button onClick={shareCompare}
className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" > 分享对比 </button>
<button onClick={clearCompare}
className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300:bg-gray-600 transition-colors" > 清空 </button> </div> </div>
<div className="flex flex-wrap gap-2"> {selectedTools.map((tool: Tool) => ( <div key={tool.id}
className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200" >
<span className="text-sm font-medium text-gray-900"> {tool.name} </span>
<button onClick={() => removeToolFromCompare(tool.id)}
className="text-gray-400 hover:text-red-600:text-red-400 transition-colors" >
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M6 18L18 6M6 6l12 12" /> </svg> </button> </div> ))} </div> </div> )} {/* 对比表格 */} {selectedTools.length >= 2 ? ( <ToolCompareTable tools={selectedTools}
/> ) : ( <div className="text-center py-12 bg-gray-50 rounded-lg">
<svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> </svg>
<p className="text-gray-600 mb-6"> 请至少选择 2 个工具进行对比 </p> </div> )} {/* 工具选择器 */}
<div className="mt-12">
<h2 className="text-2xl font-bold text-gray-900 mb-6"> 选择要对比的工具 </h2>
<ToolSelector tools={tools}
selectedTools={selectedTools}
onSelectTool={addToolToCompare}
        maxSelection={4}
      />
    </div>
  </div>
</div>
  )
}

// 加载骨架屏
function LoadingSkeleton() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
<div className="max-w-7xl mx-auto">
<div className="animate-pulse">
<div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
<div className="h-10 w-64 bg-gray-200 rounded mb-4"></div>
<div className="h-6 w-96 bg-gray-200 rounded mb-8"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i: number) => (
          <div key={i} className="h-40 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
</div>
  )
}

// 导出的页面组件，包含 Suspense 边界
export default function ToolComparePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ToolCompareContent />
    </Suspense>
  )
}