import { NextRequest }
from 'next/server' 

import { GET }
from '../route' // Mock Supabase admin client jest.mock('@/lib/supabase/admin', () => ({ createAdminClient: jest.fn() }));
const { createAdminClient } = require('@/lib/supabase/admin') describe('/api/analytics/stats', () => { beforeEach(() => { jest.clearAllMocks() // Mock console methods to avoid test noise jest.spyOn(console, 'error').mockImplementation() })
afterEach(() => { jest.restoreAllMocks() });

describe('GET /api/analytics/stats', () => { const mockActions = [ { action_type: 'view', metadata: { scrollDepth: 50, readingTime: 120 }, created_at: '2024-01-01T00:00:00Z' }, { action_type: 'view', metadata: { scrollDepth: 100, readingTime: 180 }, created_at: '2024-01-01T01:00:00Z' }, { action_type: 'view', metadata: { scrollDepth: 25 }, created_at: '2024-01-01T02:00:00Z' }, { action_type: 'share', metadata: { platform: 'twitter' }, created_at: '2024-01-01T03:00:00Z' }
]

it('returns analytics stats for content', async () => { const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockGte = jest.fn().mockResolvedValue({ data: mockActions, count: mockActions.length, error: null });
const mockFrom = jest.fn().mockImplementation((table) => { if (table === 'user_actions') { return { select: mockSelect, eq: mockEq, gte: mockGte }
}
// For likes and bookmarks tables return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), count: table === 'likes' ? 15 : 8, error: null }
}) createAdminClient.mockReturnValue({ from: mockFrom });
const request = new NextRequest('http://localhost:3000/api/analytics/stats?contentId=post-1&contentType=post&period=week');
const response = await GET(request);
const data = await response.json();
expect(data.contentId).toBe('post-1');
expect(data.contentType).toBe('post');
expect(data.period).toBe('week');
expect(data.stats).toEqual({ views: 3, likes: 15, bookmarks: 8, shares: 1, scrollDepth: { 25: 1, 50: 1, 75: 0, 100: 1 }, averageReadingTime: 150 // (120 + 180) / 2 });
expect(response.status).toBe(200) });

it('returns error for missing parameters', async () => { const request = new NextRequest('http://localhost:3000/api/analytics/stats?contentId=post-1');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ error: '缺少必要参数' });
expect(response.status).toBe(400) });

it('handles different time periods correctly', async () => { const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockGte = jest.fn().mockResolvedValue({ data: [], count: 0, error: null }) createAdminClient.mockReturnValue({ from: jest.fn().mockReturnValue({ select: mockSelect, eq: mockEq, gte: mockGte }) }) // Test day period const dayRequest = new NextRequest('http://localhost:3000/api/analytics/stats?contentId=post-1&contentType=post&period=day') await GET(dayRequest) // Check that gte was called with a date 24 hours ago const gteCall = mockGte.mock.calls[0][1]
const dateFromCall = new Date(gteCall);
const now = new Date();
const hoursDiff = (now.getTime() - dateFromCall.getTime()) / (1000 * 60 * 60);
expect(hoursDiff).toBeCloseTo(24, 0) });

it('handles "all" period without date filter', async () => { const mockQuery = { data: [], count: 0, error: null };
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis() createAdminClient.mockReturnValue({ from: jest.fn().mockReturnValue({ select: mockSelect, eq: mockEq, // Note: no gte method called for 'all' period ...mockQuery }) });
const request = new NextRequest('http://localhost:3000/api/analytics/stats?contentId=post-1&contentType=post&period=all') await GET(request) // Verify that gte was not called (no date filtering);
expect(mockSelect).toHaveBeenCalled();
expect(mockEq).toHaveBeenCalled() });

it('handles database errors gracefully', async () => { const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis() // Create a mock that has the error property to match the actual query result structure const mockQuery = { select: mockSelect, eq: mockEq, data: null, count: null, error: new Error('Database error') }
createAdminClient.mockReturnValue({ from: jest.fn().mockReturnValue(mockQuery) });
const request = new NextRequest('http://localhost:3000/api/analytics/stats?contentId=post-1&contentType=post');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ error: '获取统计数据失败' });
expect(response.status).toBe(500) });

it('calculates stats correctly with no actions', async () => { createAdminClient.mockReturnValue({ from: jest.fn().mockImplementation((table) => { if (table === 'user_actions') { return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), data: [], count: 0, error: null }
}
return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), count: 0, error: null }
}) });
const request = new NextRequest('http://localhost:3000/api/analytics/stats?contentId=post-1&contentType=post');
const response = await GET(request);
const data = await response.json();
expect(data.stats).toEqual({ views: 0, likes: 0, bookmarks: 0, shares: 0, scrollDepth: { 25: 0, 50: 0, 75: 0, 100: 0 }, averageReadingTime: 0 }) });

it('handles actions without metadata gracefully', async () => { const actionsWithoutMetadata = [ { action_type: 'view', metadata: null }, { action_type: 'view', metadata: {}
}, { action_type: 'share', metadata: null }
]
createAdminClient.mockReturnValue({ from: jest.fn().mockImplementation((table) => { if (table === 'user_actions') { return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), data: actionsWithoutMetadata, count: actionsWithoutMetadata.length, error: null }
}
return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), count: 0, error: null }
}) });
const request = new NextRequest('http://localhost:3000/api/analytics/stats?contentId=post-1&contentType=post');
const response = await GET(request);
const data = await response.json();
expect(data.stats.views).toBe(2);
expect(data.stats.shares).toBe(1);
expect(data.stats.averageReadingTime).toBe(0) });

it('handles general server errors', async () => { createAdminClient.mockImplementation(() => { throw new Error('Connection failed') });
const request = new NextRequest('http://localhost:3000/api/analytics/stats?contentId=post-1&contentType=post');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ error: '服务器错误' });
expect(response.status).toBe(500) });

it('handles month period correctly', async () => { const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockGte = jest.fn().mockResolvedValue({ data: [], count: 0, error: null }) createAdminClient.mockReturnValue({ from: jest.fn().mockReturnValue({ select: mockSelect, eq: mockEq, gte: mockGte }) });
const request = new NextRequest('http://localhost:3000/api/analytics/stats?contentId=post-1&contentType=post&period=month') await GET(request);
const gteCall = mockGte.mock.calls[0][1]
const dateFromCall = new Date(gteCall);
const now = new Date();
const daysDiff = (now.getTime() - dateFromCall.getTime()) / (1000 * 60 * 60 * 24);
expect(daysDiff).toBeCloseTo(30, 0) }) }) })