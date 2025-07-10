import { NextRequest }
from "next/server";
import { GET, POST, DELETE }
from "../route";
// Mock Supabase clients jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('@/lib/supabase/admin', () => ({ createAdminClient: jest.fn() }));
const mockCreateClient = require('@/lib/supabase/server').createClient const mockCreateAdminClient = require('@/lib/supabase/admin').createAdminClient describe('/api/bookmarks', () => { beforeEach(() => { jest.clearAllMocks() // Mock console methods to avoid test noise jest.spyOn(console, 'error').mockImplementation() })
afterEach(() => { jest.restoreAllMocks() });

describe('GET /api/bookmarks', () => { it('returns bookmark count and status', async () => { const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'bookmark-1' }, error: null }) mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: mockSelect.mockImplementation((_, options) => { if (options?.count === 'exact' && options?.head === true) { return { eq: mockEq, count: 3, error: null }
}
return { eq: mockEq, single: mockSingle }
}), eq: mockEq }) });
const request = new NextRequest('http://localhost:3000/api/bookmarks?contentId=post-1&contentType=post&userId=user-123');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ count: 3, isBookmarked: true });
expect(response.status).toBe(200) });

it('returns error for missing parameters', async () => { const request = new NextRequest('http://localhost:3000/api/bookmarks?contentId=post-1');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ error: '缺少必要参数' });
expect(response.status).toBe(400) });

it('handles database errors gracefully', async () => { mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), count: null, error: new Error('Database error') }) }) });
const request = new NextRequest('http://localhost:3000/api/bookmarks?contentId=post-1&contentType=post');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ error: '获取收藏数失败' });
expect(response.status).toBe(500) });

it('returns isBookmarked false when user has not bookmarked', async () => { const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null }) mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: mockSelect.mockImplementation((_, options) => { if (options?.count === 'exact' && options?.head === true) { return { eq: mockEq, count: 2, error: null }
}
return { eq: mockEq, single: mockSingle }
}), eq: mockEq }) });
const request = new NextRequest('http://localhost:3000/api/bookmarks?contentId=post-1&contentType=post&userId=user-123');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ count: 2, isBookmarked: false }) });

it('works without userId parameter', async () => { mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), count: 7, error: null }) }) });
const request = new NextRequest('http://localhost:3000/api/bookmarks?contentId=post-1&contentType=post');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ count: 7, isBookmarked: false }) }) });

describe('POST /api/bookmarks', () => { const mockUser = { id: 'user-123', email: 'test@example.com' }

it('adds a bookmark successfully', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn() .mockResolvedValueOnce({ data: null, error: null }) // No existing bookmark .mockResolvedValueOnce({ data: { id: 'bookmark-1' }, error: null }) // New bookmark created const mockInsert = jest.fn().mockReturnValue({ select: mockSelect, single: mockSingle }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockImplementation((table) => { if (table === 'bookmarks') { return { select: mockSelect.mockImplementation((_, options) => { if (options?.count === 'exact' && options?.head === true) { return { eq: mockEq, count: 4, error: null }
}
return { eq: mockEq, single: mockSingle }
}), eq: mockEq, insert: mockInsert }
} }) }) mockCreateAdminClient.mockReturnValue({ from: jest.fn().mockReturnValue({ insert: jest.fn().mockResolvedValue({ data: {}, error: null }) }) });
const request = new NextRequest('http://localhost:3000/api/bookmarks', { method: 'POST', body: JSON.stringify({ contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ success: true, count: 4, bookmark: { id: 'bookmark-1' }
});
expect(response.status).toBe(200) });

it('returns 401 if user is not authenticated', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/bookmarks', { method: 'POST', body: JSON.stringify({ contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '请先登录' });
expect(response.status).toBe(401) });

it('returns error if already bookmarked', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }, from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: { id: 'existing-bookmark' }, error: null }) }) }) });
const request = new NextRequest('http://localhost:3000/api/bookmarks', { method: 'POST', body: JSON.stringify({ contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '已经收藏过了' });
expect(response.status).toBe(400) });

it('returns error for missing parameters', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/bookmarks', { method: 'POST', body: JSON.stringify({ contentId: 'post-1' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '缺少必要参数' });
expect(response.status).toBe(400) });

it('handles database insert error', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn() .mockResolvedValueOnce({ data: null, error: null }) // No existing bookmark const mockInsert = jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }) }) }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockReturnValue({ select: mockSelect, eq: mockEq, single: mockSingle, insert: mockInsert }) });
const request = new NextRequest('http://localhost:3000/api/bookmarks', { method: 'POST', body: JSON.stringify({ contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '添加收藏失败' });
expect(response.status).toBe(500) }) });

describe('DELETE /api/bookmarks', () => { const mockUser = { id: 'user-123', email: 'test@example.com' }

it('removes a bookmark successfully', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }, from: jest.fn().mockImplementation((table) => { if (table === 'bookmarks') { return { delete: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), error: null }), select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), count: 2, error: null }) }
} }) }) mockCreateAdminClient.mockReturnValue({ from: jest.fn().mockReturnValue({ insert: jest.fn().mockResolvedValue({ data: {}, error: null }) }) });
const request = new NextRequest('http://localhost:3000/api/bookmarks?contentId=post-1&contentType=post', { method: 'DELETE' });
const response = await DELETE(request);
const data = await response.json();
expect(data).toEqual({ success: true, count: 2 });
expect(response.status).toBe(200) });

it('returns 401 if user is not authenticated', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/bookmarks?contentId=post-1&contentType=post', { method: 'DELETE' });
const response = await DELETE(request);
const data = await response.json();
expect(data).toEqual({ error: '请先登录' });
expect(response.status).toBe(401) });

it('returns error for missing parameters', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/bookmarks?contentType=post', { method: 'DELETE' });
const response = await DELETE(request);
const data = await response.json();
expect(data).toEqual({ error: '缺少必要参数' });
expect(response.status).toBe(400) });

it('handles database delete error', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }, from: jest.fn().mockReturnValue({ delete: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), error: new Error('Delete failed') }) }) });
const request = new NextRequest('http://localhost:3000/api/bookmarks?contentId=post-1&contentType=post', { method: 'DELETE' });
const response = await DELETE(request);
const data = await response.json();
expect(data).toEqual({ error: '取消收藏失败' });
expect(response.status).toBe(500) }) }) })
