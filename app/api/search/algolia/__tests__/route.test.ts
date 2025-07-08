import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock Algolia client module
jest.mock('@/lib/algolia/client', () => ({
  getSearchClient: jest.fn(),
  getIndexName: jest.fn().mockReturnValue('blog_content'),
  SearchParams: {},
  SearchResult: {}
}))

const { getSearchClient } = require('@/lib/algolia/client')

describe('/api/search/algolia', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console methods to avoid test noise
    jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/search/algolia', () => {
    it('returns search results when Algolia is configured', async () => {
      const mockSearch = jest.fn().mockResolvedValue({
        hits: [
          { objectID: '1', title: 'Test Post 1', type: 'post' },
          { objectID: '2', title: 'Test Post 2', type: 'post' }
        ],
        nbHits: 2,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        processingTimeMS: 10,
        query: 'test'
      })

      const mockInitIndex = jest.fn().mockReturnValue({
        search: mockSearch
      })

      getSearchClient.mockReturnValue({
        initIndex: mockInitIndex
      })

      const request = new NextRequest('http://localhost:3000/api/search/algolia?q=test')
      const response = await GET(request)
      const data = await response.json()

      expect(mockInitIndex).toHaveBeenCalledWith('blog_content')
      expect(mockSearch).toHaveBeenCalledWith('test', {
        page: 0,
        hitsPerPage: 20,
        filters: undefined,
        facets: ['type', 'tags', 'author'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        snippetEllipsisText: '...',
        attributesToSnippet: ['content:50', 'description:30']
      })
      expect(data.hits).toHaveLength(2)
      expect(data.nbHits).toBe(2)
      expect(data.algoliaEnabled).toBe(true)
      expect(response.status).toBe(200)
    })

    it('applies type filter correctly', async () => {
      const mockSearch = jest.fn().mockResolvedValue({
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 20,
        processingTimeMS: 5,
        query: 'test'
      })

      getSearchClient.mockReturnValue({
        initIndex: jest.fn().mockReturnValue({
          search: mockSearch
        })
      })

      const request = new NextRequest('http://localhost:3000/api/search/algolia?q=test&type=project')
      await GET(request)

      expect(mockSearch).toHaveBeenCalledWith('test', expect.objectContaining({
        filters: 'type:project'
      }))
    })

    it('applies tags filter correctly', async () => {
      const mockSearch = jest.fn().mockResolvedValue({
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 20,
        processingTimeMS: 5,
        query: 'test'
      })

      getSearchClient.mockReturnValue({
        initIndex: jest.fn().mockReturnValue({
          search: mockSearch
        })
      })

      const request = new NextRequest('http://localhost:3000/api/search/algolia?q=test&tags=javascript,react')
      await GET(request)

      expect(mockSearch).toHaveBeenCalledWith('test', expect.objectContaining({
        filters: '(tags:javascript OR tags:react)'
      }))
    })

    it('combines type and tags filters', async () => {
      const mockSearch = jest.fn().mockResolvedValue({
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 20,
        processingTimeMS: 5,
        query: 'test'
      })

      getSearchClient.mockReturnValue({
        initIndex: jest.fn().mockReturnValue({
          search: mockSearch
        })
      })

      const request = new NextRequest('http://localhost:3000/api/search/algolia?q=test&type=post&tags=javascript')
      await GET(request)

      expect(mockSearch).toHaveBeenCalledWith('test', expect.objectContaining({
        filters: 'type:post AND (tags:javascript)'
      }))
    })

    it('handles pagination parameters', async () => {
      const mockSearch = jest.fn().mockResolvedValue({
        hits: [],
        nbHits: 100,
        page: 2,
        nbPages: 10,
        hitsPerPage: 10,
        processingTimeMS: 5,
        query: 'test'
      })

      getSearchClient.mockReturnValue({
        initIndex: jest.fn().mockReturnValue({
          search: mockSearch
        })
      })

      const request = new NextRequest('http://localhost:3000/api/search/algolia?q=test&page=2&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(mockSearch).toHaveBeenCalledWith('test', expect.objectContaining({
        page: 2,
        hitsPerPage: 10
      }))
      expect(data.page).toBe(2)
      expect(data.hitsPerPage).toBe(10)
    })

    it('returns empty result when Algolia is not configured', async () => {
      getSearchClient.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/search/algolia?q=test')
      const response = await GET(request)
      const data = await response.json()

      expect(data.hits).toEqual([])
      expect(data.nbHits).toBe(0)
      expect(data.algoliaEnabled).toBe(false)
      expect(response.status).toBe(200)
    })

    it('handles search errors gracefully', async () => {
      const mockSearch = jest.fn().mockRejectedValue(new Error('Search failed'))

      getSearchClient.mockReturnValue({
        initIndex: jest.fn().mockReturnValue({
          search: mockSearch
        })
      })

      const request = new NextRequest('http://localhost:3000/api/search/algolia?q=test')
      const response = await GET(request)
      const data = await response.json()

      expect(data.hits).toEqual([])
      expect(data.nbHits).toBe(0)
      expect(data.algoliaEnabled).toBe(false)
      expect(data.error).toBe('Search service unavailable')
      expect(response.status).toBe(200) // Still returns 200 for graceful degradation
    })

    it('handles empty query', async () => {
      const mockSearch = jest.fn().mockResolvedValue({
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 20,
        processingTimeMS: 5,
        query: ''
      })

      getSearchClient.mockReturnValue({
        initIndex: jest.fn().mockReturnValue({
          search: mockSearch
        })
      })

      const request = new NextRequest('http://localhost:3000/api/search/algolia')
      await GET(request)

      expect(mockSearch).toHaveBeenCalledWith('', expect.any(Object))
    })
  })

  describe('POST /api/search/algolia', () => {
    it('performs advanced search with custom parameters', async () => {
      const mockSearch = jest.fn().mockResolvedValue({
        hits: [{ objectID: '1', title: 'Test' }],
        nbHits: 1,
        page: 1,
        nbPages: 5,
        hitsPerPage: 10,
        processingTimeMS: 15,
        query: 'advanced',
        facets: { type: { post: 10, project: 5 } }
      })

      const mockInitIndex = jest.fn().mockReturnValue({
        search: mockSearch
      })

      getSearchClient.mockReturnValue({
        initIndex: mockInitIndex
      })

      const searchParams = {
        query: 'advanced',
        filters: 'type:post AND author:john',
        facets: ['type', 'tags'],
        page: 1,
        hitsPerPage: 10
      }

      const request = new NextRequest('http://localhost:3000/api/search/algolia', {
        method: 'POST',
        body: JSON.stringify(searchParams)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(mockSearch).toHaveBeenCalledWith('advanced', {
        page: 1,
        hitsPerPage: 10,
        filters: 'type:post AND author:john',
        facets: ['type', 'tags'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        snippetEllipsisText: '...',
        attributesToSnippet: ['content:50', 'description:30']
      })
      expect(data.nbHits).toBe(1)
      expect(data.facets).toBeDefined()
      expect(data.algoliaEnabled).toBe(true)
    })

    it('uses default values for optional parameters', async () => {
      const mockSearch = jest.fn().mockResolvedValue({
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 20,
        processingTimeMS: 5,
        query: ''
      })

      getSearchClient.mockReturnValue({
        initIndex: jest.fn().mockReturnValue({
          search: mockSearch
        })
      })

      const request = new NextRequest('http://localhost:3000/api/search/algolia', {
        method: 'POST',
        body: JSON.stringify({})
      })

      await POST(request)

      expect(mockSearch).toHaveBeenCalledWith('', expect.objectContaining({
        page: 0,
        hitsPerPage: 20,
        facets: ['type', 'tags', 'author']
      }))
    })

    it('returns empty result when Algolia is not configured', async () => {
      getSearchClient.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/search/algolia', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.hits).toEqual([])
      expect(data.nbHits).toBe(0)
      expect(data.algoliaEnabled).toBe(false)
      expect(data.query).toBe('test')
    })

    it('handles POST errors gracefully', async () => {
      const mockSearch = jest.fn().mockRejectedValue(new Error('Search failed'))

      getSearchClient.mockReturnValue({
        initIndex: jest.fn().mockReturnValue({
          search: mockSearch
        })
      })

      const request = new NextRequest('http://localhost:3000/api/search/algolia', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.hits).toEqual([])
      expect(data.algoliaEnabled).toBe(false)
      expect(data.error).toBe('Search service unavailable')
      expect(response.status).toBe(200)
    })
  })
})