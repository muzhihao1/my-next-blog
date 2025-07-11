/**
 * 工具对比表格组件
 * @module components/features/ToolCompareTable
 */
'use client'

import { Tool } from '@/types/tool'
import Link from 'next/link'

/**
 * 工具对比表格组件的属性
 * @interface ToolCompareTableProps
 * @property {Tool[]} tools - 需要对比的工具数组
 */
interface ToolCompareTableProps {
  tools: Tool[]
}

/**
 * 对比维度配置
 * @constant
 * @type {Array<{key: string, label: string, type: string}>}
 * @description 定义工具对比的维度和显示方式
 */
const compareAspects = [
  { key: 'category', label: '分类', type: 'text' },
  { key: 'platform', label: '平台', type: 'list' },
  { key: 'pricing', label: '价格', type: 'text' },
  { key: 'features', label: '主要功能', type: 'list' },
  { key: 'pros', label: '优点', type: 'list' },
  { key: 'cons', label: '缺点', type: 'list' },
  { key: 'alternatives', label: '替代品', type: 'list' },
  { key: 'tags', label: '标签', type: 'list' },
  { key: 'lastUpdated', label: '更新时间', type: 'date' }
]

/**
 * 工具分类标签映射
 * @constant
 * @type {Record<string, string>}
 * @description 将英文分类标识映射为中文显示名称
 */
const categoryLabels: Record<string, string> = {
  development: '开发工具',
  design: '设计工具',
  productivity: '效率工具',
  hardware: '硬件设备',
  service: '在线服务'
}

/**
 * 工具对比表格组件
 * @component
 * @param {ToolCompareTableProps} props - 组件属性
 * @returns {JSX.Element} 渲染的对比表格
 * @description 以表格形式展示多个工具的详细对比信息。
 * 支持多种数据类型的格式化显示，包括列表、日期等。
 * 自动过滤空数据维度，确保表格简洁。
 * @example
 * <ToolCompareTable tools={[tool1, tool2, tool3]} />
 */
export default function ToolCompareTable({ tools }: ToolCompareTableProps) {
  /**
   * 格式化值的显示
   * @function formatValue
   * @param {any} value - 需要格式化的值
   * @param {string} type - 值的类型（'list' | 'date' | 'text'）
   * @returns {JSX.Element | string} 格式化后的显示内容
   * @description 根据数据类型格式化显示内容：
   * - list: 渲染为无序列表
   * - date: 格式化为中文日期
   * - text: 处理分类标签的中文映射
   */
  const formatValue = (value: any, type: string) => {
    if (!value) return '-'
    
    switch (type) {
      case 'list':
        if (Array.isArray(value)) {
          return (
            <ul className="list-disc list-inside space-y-1">
              {value.map((item, index) => (
                <li key={index} className="text-sm">{item}</li>
              ))}
            </ul>
          )
        }
        return value
      
      case 'date':
        return new Date(value).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      
      case 'text':
        if (value === 'development' || value === 'design' || value === 'productivity' || value === 'hardware' || value === 'service') {
          return categoryLabels[value] || value
        }
        return value
      
      default:
        return value
    }
  }

  /**
   * 检查某个维度是否至少有一个工具有值
   * @function hasAnyValue
   * @param {string} key - 需要检查的属性键名
   * @returns {boolean} 是否有至少一个工具在该维度有值
   * @description 用于过滤空数据维度，确保表格只显示有意义的对比项
   */
  const hasAnyValue = (key: string) => {
    return tools.some(tool => {
      const value = (tool as any)[key]
      return value && (Array.isArray(value) ? value.length > 0 : true)
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-900 border-b border-r border-gray-200">
              对比项
            </th>
            {tools.map(tool => (
              <th key={tool.id} className="p-4 text-left border-b border-gray-200 bg-white">
                <div className="space-y-2">
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {tool.name}
                  </Link>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="flex gap-2">
                    {tool.website && (
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        官网
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                    {tool.github && (
                      <a
                        href={tool.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                      >
                        GitHub
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {compareAspects.map(aspect => {
            // 只显示至少有一个工具有值的维度
            if (!hasAnyValue(aspect.key)) return null
            
            return (
              <tr key={aspect.key} className="border-b border-gray-200">
                <td className="sticky left-0 z-10 bg-gray-50 p-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                  {aspect.label}
                </td>
                {tools.map(tool => (
                  <td key={tool.id} className="p-4 bg-white">
                    <div className="text-sm text-gray-900">
                      {formatValue((tool as any)[aspect.key], aspect.type)}
                    </div>
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}