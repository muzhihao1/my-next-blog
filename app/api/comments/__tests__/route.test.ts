import { NextRequest }
from "next/server";
import { POST }
from "../route";
// Mock Supabase client jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));
const mockCreateClient = require('@/lib/supabase/server').createClient describe('/api/comments', () => { beforeEach(() => { jest.clearAllMocks() // Mock console methods to avoid test noise jest.spyOn(console, 'error').mockImplementation() })
afterEach(() => { jest.restoreAllMocks() });

describe('POST /api/comments', () => { const mockUser = { id: 'user-123', email: 'test@example.com' }

it('creates a comment successfully', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockSelect = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'comment-1', content: '这是一条测试评论', content_id: 'post-1', content_type: 'post', user_id: 'user-123', parent_id: null, created_at: '2024-01-01T00:00:00Z', user_profiles: { id: 'user-123', username: 'testuser', display_name: 'Test User', avatar_url: 'https://example.com/avatar.jpg' }
}, error: null });
const mockInsert = jest.fn().mockReturnValue({ select: mockSelect, single: mockSingle }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockImplementation((table) => { if (table === 'comments') { return { insert: mockInsert }
}
if (table === 'user_actions') { return { insert: jest.fn().mockResolvedValue({ data: {}, error: null }) }
} }) });
const request = new NextRequest('http://localhost:3000/api/comments', { method: 'POST', body: JSON.stringify({ content: '这是一条测试评论', contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data.message).toBe('评论发布成功');
expect(data.comment).toBeDefined();
expect(data.comment.content).toBe('这是一条测试评论');
expect(response.status).toBe(200) });

it('returns 401 if user is not authenticated', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/comments', { method: 'POST', body: JSON.stringify({ content: '测试评论', contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '请先登录后再评论' });
expect(response.status).toBe(401) });

it('returns error for missing required fields', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/comments', { method: 'POST', body: JSON.stringify({ content: '测试评论' // Missing contentId and contentType }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '缺少必填字段' });
expect(response.status).toBe(400) });

it('returns error for content exceeding 500 characters', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
});
const longContent = 'a'.repeat(501);
const request = new NextRequest('http://localhost:3000/api/comments', { method: 'POST', body: JSON.stringify({ content: longContent, contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '评论内容不能超过500字' });
expect(response.status).toBe(400) });

it('creates a reply comment with parent validation', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn() .mockResolvedValueOnce({ data: { id: 'parent-comment' }, error: null }) // Parent exists .mockResolvedValueOnce({ data: { id: 'reply-comment-1', content: '这是一条回复', parent_id: 'parent-comment', user_profiles: {}
}, error: null });
const mockInsert = jest.fn().mockReturnValue({ select: mockSelect, single: mockSingle }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockImplementation((table) => { if (table === 'comments') { return { select: mockSelect, eq: mockEq, single: mockSingle, insert: mockInsert }
}
if (table === 'user_actions') { return { insert: jest.fn().mockResolvedValue({ data: {}, error: null }) }
} }) });
const request = new NextRequest('http://localhost:3000/api/comments', { method: 'POST', body: JSON.stringify({ content: '这是一条回复', contentId: 'post-1', contentType: 'post', parentId: 'parent-comment' }) });
const response = await POST(request);
const data = await response.json();
expect(data.message).toBe('评论发布成功');
expect(data.comment.parent_id).toBe('parent-comment');
expect(response.status).toBe(200) });

it('returns error if parent comment does not exist', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockReturnValue({ select: mockSelect, eq: mockEq, single: mockSingle }) });
const request = new NextRequest('http://localhost:3000/api/comments', { method: 'POST', body: JSON.stringify({ content: '这是一条回复', contentId: 'post-1', contentType: 'post', parentId: 'non-existent-parent' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '回复的评论不存在' });
expect(response.status).toBe(400) });

it('handles database insert error', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockInsert = jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') }) }) }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockReturnValue({ insert: mockInsert }) });
const request = new NextRequest('http://localhost:3000/api/comments', { method: 'POST', body: JSON.stringify({ content: '测试评论', contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '发布评论失败' });
expect(response.status).toBe(500) });

it('handles general server errors', async () => { mockCreateClient.mockRejectedValue(new Error('Connection failed'));
const request = new NextRequest('http://localhost:3000/api/comments', { method: 'POST', body: JSON.stringify({ content: '测试评论', contentId: 'post-1', contentType: 'post' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '服务器错误' });
expect(response.status).toBe(500) }) }) })
