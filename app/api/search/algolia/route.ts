/**
 * Algolia 搜索 API 路由
 * 处理搜索请求并返回结果
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSearchClient, getIndexName, SearchParams, SearchResult } from '@/lib/algolia/client'

export async function GET(request: NextRequest) {
  try {
    // 获取搜索参数
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type')
    const tags = searchParams.get('tags')
    const page = parseInt(searchParams.get('page') || '0')
    const hitsPerPage = parseInt(searchParams.get('limit') || '20')
    
    // 检查 Algolia 配置
    const client = getSearchClient()
    if (!client) {
      // 返回空结果而不是错误，允许降级到本地搜索
      return NextResponse.json({
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 20,
        processingTimeMS: 0,
        query,
        algoliaEnabled: false
      })
    }
    
    const index = client.initIndex(getIndexName())
    
    // 构建过滤器
    const filters: string[] = []
    if (type) {
      filters.push(`type:${type}`)
    }
    if (tags) {
      const tagList = tags.split(',').map(tag => `tags:${tag}`)
      filters.push(`(${tagList.join(' OR ')})`)
    }
    
    // 执行搜索
    const searchResponse = await index.search(query, {
      page,
      hitsPerPage,
      filters: filters.length > 0 ? filters.join(' AND ') : undefined,
      facets: ['type', 'tags', 'author'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      snippetEllipsisText: '...',
      attributesToSnippet: ['content:50', 'description:30']
    })
    
    // 构建响应
    const result: SearchResult = {
      hits: searchResponse.hits as any[],
      nbHits: searchResponse.nbHits,
      page: searchResponse.page,
      nbPages: searchResponse.nbPages,
      hitsPerPage: searchResponse.hitsPerPage,
      processingTimeMS: searchResponse.processingTimeMS,
      query: searchResponse.query,
      facets: searchResponse.facets,
      algoliaEnabled: true
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Algolia search error:', error)
    
    // 错误时返回空结果，允许前端降级处理
    return NextResponse.json({
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage: 20,
      processingTimeMS: 0,
      query: '',
      algoliaEnabled: false,
      error: 'Search service unavailable'
    })
  }
}

/**
 * POST 方法用于更高级的搜索
 */
export async function POST(request: NextRequest) {
  try {
    const body: SearchParams = await request.json()
    
    const client = getSearchClient()
    if (!client) {
      return NextResponse.json({
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 20,
        processingTimeMS: 0,
        query: body.query || '',
        algoliaEnabled: false
      })
    }
    
    const index = client.initIndex(getIndexName())
    
    // 执行搜索
    const searchResponse = await index.search(body.query || '', {
      page: body.page || 0,
      hitsPerPage: body.hitsPerPage || 20,
      filters: body.filters,
      facets: body.facets || ['type', 'tags', 'author'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      snippetEllipsisText: '...',
      attributesToSnippet: ['content:50', 'description:30']
    })
    
    const result: SearchResult = {
      hits: searchResponse.hits as any[],
      nbHits: searchResponse.nbHits,
      page: searchResponse.page,
      nbPages: searchResponse.nbPages,
      hitsPerPage: searchResponse.hitsPerPage,
      processingTimeMS: searchResponse.processingTimeMS,
      query: searchResponse.query,
      facets: searchResponse.facets,
      algoliaEnabled: true
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Algolia search error:', error)
    
    return NextResponse.json({
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage: 20,
      processingTimeMS: 0,
      query: '',
      algoliaEnabled: false,
      error: 'Search service unavailable'
    })
  }
}