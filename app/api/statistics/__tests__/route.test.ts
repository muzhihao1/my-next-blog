import { GET, POST }
from '../route' 

import { NextRequest }
from 'next/server' 

import { getSiteStatistics, getPostStatistics }
from '@/lib/statistics' // Mock the statistics functions jest.mock('@/lib/statistics', () => ({ getSiteStatistics: jest.fn(), getPostStatistics: jest.fn() }));
describe('/api/statistics', () => { beforeEach(() => { jest.clearAllMocks() });

describe('GET', () => { it('should return site statistics by default', async () => { const mockStats = { totalPosts: 10, totalViews: 5000, totalTags: 15, popularPosts: [], tagDistribution: {}, viewsTrend: { period: 'all', data: []
}
};(getSiteStatistics as jest.Mock).mockResolvedValue(mockStats);
const request = new NextRequest('http://localhost/api/statistics');
const response = await GET(request);
const data = await response.json();
expect(response.status).toBe(200);
expect(data.success).toBe(true);
expect(data.data).toEqual(mockStats);
expect(data.meta.type).toBe('site') });

it('should return post statistics when type=posts', async () => { const mockStats = { total: 20, categories: { tech: 10, life: 10 }, tags: { javascript: 5, react: 5 }, totalWords: 50000, averageWords: 2500, totalReadingTime: 250 } ;(getPostStatistics as jest.Mock).mockResolvedValue(mockStats);
const request = new NextRequest('http://localhost/api/statistics?type=posts');
const response = await GET(request);
const data = await response.json();
expect(response.status).toBe(200);
expect(data.success).toBe(true);
expect(data.data).toEqual(mockStats);
expect(data.meta.type).toBe('posts') });

it('should handle errors gracefully', async () => { const errorMessage = 'Database connection failed' ;(getSiteStatistics as jest.Mock).mockRejectedValue(new Error(errorMessage));
const request = new NextRequest('http://localhost/api/statistics');
const response = await GET(request);
const data = await response.json();
expect(response.status).toBe(500);
expect(data.success).toBe(false);
expect(data.error.message).toBe(errorMessage);
expect(data.error.code).toBe('STATISTICS_ERROR') });

it('should respect query parameters', async () => { const mockStats = { /* ... */ } ;(getSiteStatistics as jest.Mock).mockResolvedValue(mockStats);
const request = new NextRequest('http://localhost/api/statistics?limit=5&period=week') await GET(request);
expect(getSiteStatistics).toHaveBeenCalledWith({ limit: 5, period: 'week' }) }) });

describe('POST', () => { it('should track events successfully', async () => { const requestBody = { event: 'page_view', data: { page: '/posts/test' }, sessionId: 'abc123' };
const request = new NextRequest('http://localhost/api/statistics', { method: 'POST', body: JSON.stringify(requestBody) });
const response = await POST(request);
const data = await response.json();
expect(response.status).toBe(200);
expect(data.success).toBe(true);
expect(data.message).toBe('Event tracked successfully') });

it('should reject requests without event name', async () => { const requestBody = { data: { page: '/posts/test' }
};
const request = new NextRequest('http://localhost/api/statistics', { method: 'POST', body: JSON.stringify(requestBody) });
const response = await POST(request);
const data = await response.json();
expect(response.status).toBe(400);
expect(data.success).toBe(false);
expect(data.error.message).toBe('Event name is required');
expect(data.error.code).toBe('MISSING_EVENT') });

it('should handle malformed JSON', async () => { const request = new NextRequest('http://localhost/api/statistics', { method: 'POST', body: 'invalid json' }) // Mock json() to throw an error jest.spyOn(request, 'json').mockRejectedValue(new Error('Invalid JSON'));
const response = await POST(request);
const data = await response.json();
expect(response.status).toBe(500);
expect(data.success).toBe(false);
expect(data.error.code).toBe('TRACKING_ERROR') }) }) })