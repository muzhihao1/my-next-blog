import { NextRequest }
from "next/server";
import { GET, POST, DELETE }
from "../route";
// Mock Supabase clients jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('@/lib/supabase/admin', () => ({ createAdminClient: jest.fn() }));
const mockCreateClient = require('@/lib/supabase/server').createClient const mockCreateAdminClient = require('@/lib/supabase/admin').createAdminClient describe('/api/likes', () => { beforeEach(() => { jest.clearAllMocks() // Mock console methods to avoid test noise jest.spyOn(console, 'error').mockImplementation() })
afterEach(() => { jest.restoreAllMocks() });

describe('GET /api/likes', () => { it('returns like count and status', async () => { const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'like-1' }, error: null }) mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: mockSelect.mockImplementation((_, options) => { if (options?.count === 'exact' && options?.head === true) { return { eq: mockEq, count: 5, error: null }
}
return { eq: mockEq, single: mockSingle }
}), eq: mockEq }) });
const request = new NextRequest('http://localhost:3000/api/likes?contentId=post-1&contentType=post&userId=user-123');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ count: 5, isLiked: true });
expect(response.status).toBe(200) });

it('returns error for missing parameters', async () => { const request = new NextRequest('http://localhost:3000/api/likes');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ error: '缺少必要参数' });
expect(response.status).toBe(400) });

it('handles database errors gracefully', async () => { mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), count: null, error: new Error('Database error') }) }) });
const request = new NextRequest('http://localhost:3000/api/likes?contentId=post-1&contentType=post');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ error: '获取点赞数失败' });
expect(response.status).toBe(500) });

it('returns isLiked false when user has not liked', async () => { const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null }) mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: mockSelect.mockImplementation((_, options) => { if (options?.count === 'exact' && options?.head === true) { return { eq: mockEq, count: 3, error: null }
}
return { eq: mockEq, single: mockSingle }
}), eq: mockEq }) });
const request = new NextRequest('http://localhost:3000/api/likes?contentId=post-1&contentType=post&userId=user-123');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ count: 3, isLiked: false }) });

it('works without userId parameter', async () => { mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), count: 10, error: null }) }) });
const request = new NextRequest('http://localhost:3000/api/likes?contentId=post-1&contentType=post');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ count: 10, isLiked: false }) }) });

describe('POST /api/likes', () => { const mockUser = { id: 'user-123', email: 'test@example.com' }

it('adds a like successfully', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn() .mockResolvedValueOnce({ data: null, error: null }) // No existing like .mockResolvedValueOnce({ data: { id: 'like-1' }, error: null }) // New like created const mockInsert = jest.fn().mockReturnValue({ select: mockSelect, single: mockSingle }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockImplementation((table) => { if (table === 'likes') { return { select: mockSelect.mockImplementation((_, options) => { if (options?.count === 'exact' && options?.head === true) { return { eq: mockEq, count: 6, error: null }
}
return { eq: mockEq, single: mockSingle }
}), eq: mockEq, insert: mockInsert }
} }) }) mockCreateAdminClient.mockReturnValue({ from: jest.fn().mockReturnValue({ insert: jest.fn().mockResolvedValue({ data: {}, error: null }) }) });
const request = new NextRequest('http://localhost:3000/api/likes', { method: 'POST', body: JSON.stringify({ contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ success: true, count: 6, like: { id: 'like-1' }
});
expect(response.status).toBe(200) });

it('returns 401 if user is not authenticated', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/likes', { method: 'POST', body: JSON.stringify({ contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '请先登录' });
expect(response.status).toBe(401) });

it('returns error if already liked', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }, from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: { id: 'existing-like' }, error: null }) }) }) });
const request = new NextRequest('http://localhost:3000/api/likes', { method: 'POST', body: JSON.stringify({ contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '已经点赞过了' });
expect(response.status).toBe(400) });

it('returns error for missing parameters', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/likes', { method: 'POST', body: JSON.stringify({}) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '缺少必要参数' });
expect(response.status).toBe(400) }) });

describe('DELETE /api/likes', () => { const mockUser = { id: 'user-123', email: 'test@example.com' }

it('removes a like successfully', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }, from: jest.fn().mockImplementation((table) => { if (table === 'likes') { return { delete: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), error: null }), select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), count: 4, error: null }) }
} }) }) mockCreateAdminClient.mockReturnValue({ from: jest.fn().mockReturnValue({ insert: jest.fn().mockResolvedValue({ data: {}, error: null }) }) });
const request = new NextRequest('http://localhost:3000/api/likes?contentId=post-1&contentType=post', { method: 'DELETE' });
const response = await DELETE(request);
const data = await response.json();
expect(data).toEqual({ success: true, count: 4 });
expect(response.status).toBe(200) });

it('returns 401 if user is not authenticated', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/likes?contentId=post-1&contentType=post', { method: 'DELETE' });
const response = await DELETE(request);
const data = await response.json();
expect(data).toEqual({ error: '请先登录' });
expect(response.status).toBe(401) });

it('returns error for missing parameters', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/likes', { method: 'DELETE' });
const response = await DELETE(request);
const data = await response.json();
expect(data).toEqual({ error: '缺少必要参数' });
expect(response.status).toBe(400) }) }) })
