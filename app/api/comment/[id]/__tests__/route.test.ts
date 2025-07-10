import { NextRequest }
from "next/server";
import { PATCH, DELETE }
from "../route";
// Mock Supabase client jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));
const mockCreateClient = require('@/lib/supabase/server').createClient describe('/api/comments/[id]', () => { beforeEach(() => { jest.clearAllMocks() // Mock console methods to avoid test noise jest.spyOn(console, 'error').mockImplementation() })
afterEach(() => { jest.restoreAllMocks() });

describe('PATCH /api/comments/[id]', () => { const mockUser = { id: 'user-123', email: 'test@example.com' }

it('updates a comment successfully', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn() .mockResolvedValueOnce({ data: { user_id: 'user-123' }, error: null }) // Check ownership .mockResolvedValueOnce({ data: { id: 'comment-1', content: '更新后的评论内容', user_id: 'user-123', updated_at: '2024-01-02T00:00:00Z', user_profiles: { id: 'user-123', username: 'testuser', display_name: 'Test User', avatar_url: 'https://example.com/avatar.jpg' }
}, error: null });
const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq, select: mockSelect, single: mockSingle }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockReturnValue({ select: mockSelect, eq: mockEq, single: mockSingle, update: mockUpdate }) });
const request = new NextRequest('http://localhost:3000/api/comments/comment-1', { method: 'PATCH', body: JSON.stringify({ content: '更新后的评论内容' }) });
const response = await PATCH(request, { params: { id: 'comment-1' }
});
const data = await response.json();
expect(data.message).toBe('评论更新成功');
expect(data.comment.content).toBe('更新后的评论内容');
expect(response.status).toBe(200) });

it('returns 401 if user is not authenticated', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/comments/comment-1', { method: 'PATCH', body: JSON.stringify({ content: '更新内容' }) });
const response = await PATCH(request, { params: { id: 'comment-1' }
});
const data = await response.json();
expect(data).toEqual({ error: '请先登录' });
expect(response.status).toBe(401) });

it('returns error for empty content', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/comments/comment-1', { method: 'PATCH', body: JSON.stringify({ content: '' }) });
const response = await PATCH(request, { params: { id: 'comment-1' }
});
const data = await response.json();
expect(data).toEqual({ error: '评论内容不能为空' });
expect(response.status).toBe(400) });

it('returns error for content exceeding 500 characters', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
});
const longContent = 'a'.repeat(501);
const request = new NextRequest('http://localhost:3000/api/comments/comment-1', { method: 'PATCH', body: JSON.stringify({ content: longContent }) });
const response = await PATCH(request, { params: { id: 'comment-1' }
});
const data = await response.json();
expect(data).toEqual({ error: '评论内容不能超过500字' });
expect(response.status).toBe(400) });

it('returns 404 if comment does not exist', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }, from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }) }) });
const request = new NextRequest('http://localhost:3000/api/comments/non-existent', { method: 'PATCH', body: JSON.stringify({ content: '更新内容' }) });
const response = await PATCH(request, { params: { id: 'non-existent' }
});
const data = await response.json();
expect(data).toEqual({ error: '评论不存在' });
expect(response.status).toBe(404) });

it('returns 403 if user does not own the comment', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }, from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: { user_id: 'other-user-id' }, error: null }) }) });
const request = new NextRequest('http://localhost:3000/api/comments/comment-1', { method: 'PATCH', body: JSON.stringify({ content: '更新内容' }) });
const response = await PATCH(request, { params: { id: 'comment-1' }
});
const data = await response.json();
expect(data).toEqual({ error: '无权编辑此评论' });
expect(response.status).toBe(403) });

it('handles update database error', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn() .mockResolvedValueOnce({ data: { user_id: 'user-123' }, error: null });
const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq, select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: null, error: new Error('Update failed') }) }) }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockReturnValue({ select: mockSelect, eq: mockEq, single: mockSingle, update: mockUpdate }) });
const request = new NextRequest('http://localhost:3000/api/comments/comment-1', { method: 'PATCH', body: JSON.stringify({ content: '更新内容' }) });
const response = await PATCH(request, { params: { id: 'comment-1' }
});
const data = await response.json();
expect(data).toEqual({ error: '更新评论失败' });
expect(response.status).toBe(500) }) });

describe('DELETE /api/comments/[id]', () => { const mockUser = { id: 'user-123', email: 'test@example.com' }

it('soft deletes a comment successfully', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({ data: { user_id: 'user-123' }, error: null });
const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockReturnValue({ select: mockSelect, eq: mockEq, single: mockSingle, update: mockUpdate }) });
const request = new NextRequest('http://localhost:3000/api/comments/comment-1', { method: 'DELETE' });
const response = await DELETE(request, { params: { id: 'comment-1' }
});
const data = await response.json();
expect(data).toEqual({ message: '评论删除成功' });
expect(mockUpdate).toHaveBeenCalledWith({ content: '[此评论已删除]', is_deleted: true, updated_at: expect.any(String) });
expect(response.status).toBe(200) });

it('returns 401 if user is not authenticated', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) }
});
const request = new NextRequest('http://localhost:3000/api/comments/comment-1', { method: 'DELETE' });
const response = await DELETE(request, { params: { id: 'comment-1' }
});
const data = await response.json();
expect(data).toEqual({ error: '请先登录' });
expect(response.status).toBe(401) });

it('returns 404 if comment does not exist', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }, from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }) }) });
const request = new NextRequest('http://localhost:3000/api/comments/non-existent', { method: 'DELETE' });
const response = await DELETE(request, { params: { id: 'non-existent' }
});
const data = await response.json();
expect(data).toEqual({ error: '评论不存在' });
expect(response.status).toBe(404) });

it('returns 403 if user does not own the comment', async () => { mockCreateClient.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }, from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: { user_id: 'other-user-id' }, error: null }) }) });
const request = new NextRequest('http://localhost:3000/api/comments/comment-1', { method: 'DELETE' });
const response = await DELETE(request, { params: { id: 'comment-1' }
});
const data = await response.json();
expect(data).toEqual({ error: '无权删除此评论' });
expect(response.status).toBe(403) });

it('handles delete database error', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({ data: { user_id: 'user-123' }, error: null });
const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: new Error('Delete failed') }) }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: jest.fn().mockReturnValue({ select: mockSelect, eq: mockEq, single: mockSingle, update: mockUpdate }) });
const request = new NextRequest('http://localhost:3000/api/comments/comment-1', { method: 'DELETE' });
const response = await DELETE(request, { params: { id: 'comment-1' }
});
const data = await response.json();
expect(data).toEqual({ error: '删除评论失败' });
expect(response.status).toBe(500) });

it('handles general server errors', async () => { mockCreateClient.mockRejectedValue(new Error('Connection failed'));
const request = new NextRequest('http://localhost:3000/api/comments/comment-1', { method: 'DELETE' });
const response = await DELETE(request, { params: { id: 'comment-1' }
});
const data = await response.json();
expect(data).toEqual({ error: '服务器错误' });
expect(response.status).toBe(500) }) }) })
