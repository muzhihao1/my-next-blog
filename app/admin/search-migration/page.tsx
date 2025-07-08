/**
 * 搜索迁移状态页面
 * 用于检查和管理 Algolia 迁移进度
 */

'use client'

import { useState, useEffect } from 'react'
import { getMigrationStatus, formatMigrationReport, getSearchConfig, setSearchProvider, getSearchAnalyticsSummary } from '@/lib/algolia/migration'
import type { MigrationChecklist, SearchProvider } from '@/lib/algolia/migration'

export default function SearchMigrationPage() {
  const [migrationStatus, setMigrationStatus] = useState<MigrationChecklist | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchConfig, setSearchConfig] = useState(getSearchConfig())
  const [analyticsSummary, setAnalyticsSummary] = useState(getSearchAnalyticsSummary())
  const [testQuery, setTestQuery] = useState('')
  const [testResults, setTestResults] = useState<any>(null)
  
  // 加载迁移状态
  useEffect(() => {
    loadMigrationStatus()
  }, [])
  
  const loadMigrationStatus = async () => {
    setLoading(true)
    try {
      const status = await getMigrationStatus()
      setMigrationStatus(status)
      setSearchConfig(getSearchConfig())
      setAnalyticsSummary(getSearchAnalyticsSummary())
    } catch (error) {
      console.error('Failed to load migration status:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 切换搜索提供者
  const handleProviderChange = (provider: SearchProvider) => {
    setSearchProvider(provider)
    setSearchConfig(getSearchConfig())
  }
  
  // 测试搜索
  const handleTestSearch = async (provider: 'algolia' | 'fuse') => {
    if (!testQuery) return
    
    try {
      const startTime = Date.now()
      let response
      
      if (provider === 'algolia') {
        response = await fetch(`/api/search/algolia?q=${encodeURIComponent(testQuery)}`)
      } else {
        response = await fetch(`/api/search?q=${encodeURIComponent(testQuery)}`)
      }
      
      const data = await response.json()
      const responseTime = Date.now() - startTime
      
      setTestResults({
        provider,
        query: testQuery,
        responseTime,
        resultsCount: data.hits?.length || data.results?.length || 0,
        data
      })
    } catch (error) {
      console.error('Test search failed:', error)
      setTestResults({
        provider,
        query: testQuery,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载迁移状态...</p>
        </div>
      </div>
    )
  }
  
  const migrationReport = migrationStatus ? formatMigrationReport(migrationStatus) : ''
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Algolia 搜索迁移状态</h1>
      
      {/* 迁移进度 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">迁移检查列表</h2>
        <pre className="whitespace-pre-wrap font-mono text-sm">{migrationReport}</pre>
        <button
          onClick={loadMigrationStatus}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          刷新状态
        </button>
      </div>
      
      {/* 搜索配置 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">搜索配置</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">当前搜索提供者</p>
            <div className="flex gap-2">
              {(['auto', 'algolia', 'fuse'] as SearchProvider[]).map(provider => (
                <button
                  key={provider}
                  onClick={() => handleProviderChange(provider)}
                  className={`px-4 py-2 rounded transition-colors ${
                    searchConfig.provider === provider
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {provider === 'auto' ? '自动' : provider.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Algolia 状态：</span>
              <span className={`ml-2 font-medium ${searchConfig.algoliaEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {searchConfig.algoliaEnabled ? '已启用' : '未配置'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Fuse.js 状态：</span>
              <span className="ml-2 font-medium text-green-600">始终可用</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 搜索测试 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">搜索测试</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="输入测试查询..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleTestSearch('algolia')}
              disabled={!searchConfig.algoliaEnabled}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              测试 Algolia
            </button>
            <button
              onClick={() => handleTestSearch('fuse')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              测试 Fuse.js
            </button>
          </div>
          
          {testResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">测试结果 - {testResults.provider.toUpperCase()}</h3>
              {testResults.error ? (
                <p className="text-red-600">错误: {testResults.error}</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p>查询: {testResults.query}</p>
                  <p>响应时间: {testResults.responseTime}ms</p>
                  <p>结果数量: {testResults.resultsCount}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 hover:underline">查看原始数据</summary>
                    <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(testResults.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 搜索分析 */}
      {analyticsSummary && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">搜索分析摘要</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Algolia 统计</h3>
              <div className="space-y-1 text-sm">
                <p>搜索次数: {analyticsSummary.algolia.count}</p>
                <p>平均响应时间: {analyticsSummary.algolia.avgResponseTime}ms</p>
                <p>平均结果数: {analyticsSummary.algolia.avgResultsCount}</p>
                <p>点击率: {analyticsSummary.algolia.clickRate.toFixed(1)}%</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Fuse.js 统计</h3>
              <div className="space-y-1 text-sm">
                <p>搜索次数: {analyticsSummary.fuse.count}</p>
                <p>平均响应时间: {analyticsSummary.fuse.avgResponseTime}ms</p>
                <p>平均结果数: {analyticsSummary.fuse.avgResultsCount}</p>
                <p>点击率: {analyticsSummary.fuse.clickRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">最近搜索</h3>
            <div className="space-y-1 text-sm">
              {analyticsSummary.recentQueries.map((query, index) => (
                <div key={index} className="flex items-center gap-4 text-gray-600">
                  <span className="font-mono">{query.query}</span>
                  <span className="text-xs">{query.provider}</span>
                  <span className="text-xs">{query.results} 结果</span>
                  <span className="text-xs">{query.time}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 环境变量配置提示 */}
      {!searchConfig.algoliaEnabled && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-medium text-yellow-800 mb-2">配置 Algolia</h3>
          <p className="text-sm text-yellow-700 mb-2">
            请在 .env.local 文件中添加以下环境变量：
          </p>
          <pre className="text-xs bg-yellow-100 p-2 rounded overflow-auto">
{`NEXT_PUBLIC_ALGOLIA_APP_ID=你的应用ID
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=你的搜索密钥
ALGOLIA_ADMIN_KEY=你的管理密钥
ALGOLIA_INDEX_NAME=blog_content`}
          </pre>
        </div>
      )}
    </div>
  )
}