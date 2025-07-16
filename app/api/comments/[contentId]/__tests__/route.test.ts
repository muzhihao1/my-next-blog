import { NextRequest }
from "next/server";
import { GET }
from "../route";
// Mock Supabase client jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));
const mockCreateClient = require('@/lib/supabase/server').createClient describe('/api/comments/[contentId]', () => { beforeEach(() => { jest.clearAllMocks() // Mock console methods to avoid test noise jest.spyOn(console, 'error').mockImplementation() })
afterEach(() => { jest.restoreAllMocks() });

describe('GET /api/comments/[contentId]', () => { const mockComments = [ { id: 'comment-1', content: '这是第一条评论', content_id: 'post-1', content_type: 'post', user_id: 'user-1', parent_id: null, created_at: '2024-01-01T00:00:00Z', user_profiles: { id: 'user-1', username: 'user1', display_name: 'User 1', avatar_url: 'https://example.com/avatar1.jpg' }, replies: [ { id: 'comment-2', content: '这是一条回复', parent_id: 'comment-1', user_profiles: { id: 'user-2', username: 'user2', display_name: 'User 2', avatar_url: 'https://example.com/avatar2.jpg' }
}
]}, { id: 'comment-3', content: '这是第二条评论', content_id: 'post-1', content_type: 'post', user_id: 'user-3', parent_id: null, created_at: '2024-01-02T00:00:00Z', user_profiles: { id: 'user-3', username: 'user3', display_name: 'User 3', avatar_url: 'https://example.com/avatar3.jpg' }, replies: []
}
]

it('returns comments with pagination', async () => { const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockIs = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockRange = jest.fn().mockResolvedValue({ data: mockComments, error: null, count: 10 }) mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: mockSelect, eq: mockEq, is: mockIs, order: mockOrder, range: mockRange }) });
const request = new NextRequest('http://localhost:3000/api/comments/post-1?contentType=post&page=1&limit=20');
const response = await GET(request, { params: { contentId: 'post-1' }
});
const data = await response.json();
expect(data.comments).toHaveLength(2);
expect(data.comments[0].replies).toHaveLength(1);
expect(data.total).toBe(10);
expect(data.page).toBe(1);
expect(data.limit).toBe(20);
expect(data.hasMore).toBe(false);
expect(response.status).toBe(200) });

it('handles empty comments list', async () => { mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), is: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(), range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }) }) });
const request = new NextRequest('http://localhost:3000/api/comments/post-1');
const response = await GET(request, { params: { contentId: 'post-1' }
});
const data = await response.json();
expect(data.comments).toEqual([]);
expect(data.total).toBe(0);
expect(data.hasMore).toBe(false);
expect(response.status).toBe(200) });

it('uses default values for pagination', async () => { mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), is: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(), range: jest.fn().mockImplementation((start, end) => { // Check that default values are used expect(start).toBe(0);
expect(end).toBe(19) return Promise.resolve({ data: [], error: null, count: 0 }) }) }) });
const request = new NextRequest('http://localhost:3000/api/comments/post-1');
const response = await GET(request, { params: { contentId: 'post-1' }
});
const data = await response.json();
expect(data.page).toBe(1);
expect(data.limit).toBe(20) });

it('calculates hasMore correctly', async () => { mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), is: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(), range: jest.fn().mockResolvedValue({ data: Array(10).fill(mockComments[0]), error: null, count: 50 }) }) });
const request = new NextRequest('http://localhost:3000/api/comments/post-1?page=2&limit=10');
const response = await GET(request, { params: { contentId: 'post-1' }
});
const data = await response.json();
expect(data.total).toBe(50);
expect(data.page).toBe(2);
expect(data.limit).toBe(10);
expect(data.hasMore).toBe(true) // 50 > 10 + 10 });

it('handles different content types', async () => { const mockEq = jest.fn().mockReturnThis() mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: mockEq, is: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(), range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }) }) });
const request = new NextRequest('http://localhost:3000/api/comments/project-1?contentType=project') await GET(request, { params: { contentId: 'project-1' }
}) // Verify contentType was used correctly expect(mockEq).toHaveBeenCalledWith('content_type', 'project') });

it('handles database errors', async () => { mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), is: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(), range: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error'), count: null }) }) });
const request = new NextRequest('http://localhost:3000/api/comments/post-1');
const response = await GET(request, { params: { contentId: 'post-1' }
});
const data = await response.json();
expect(data).toEqual({ error: '获取评论失败' });
expect(response.status).toBe(500) });

it('handles server errors gracefully', async () => { mockCreateClient.mockRejectedValue(new Error('Connection failed'));
const request = new NextRequest('http://localhost:3000/api/comments/post-1');
const response = await GET(request, { params: { contentId: 'post-1' }
});
const data = await response.json();
expect(data).toEqual({ error: '服务器错误' });
expect(response.status).toBe(500) });

it('constructs comment tree structure correctly', async () => { const commentsWithNullReplies = [ { ...mockComments[0], replies: null // Test null handling }
]
mockCreateClient.mockResolvedValue({ from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), is: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(), range: jest.fn().mockResolvedValue({ data: commentsWithNullReplies, error: null, count: 1 }) }) });
const request = new NextRequest('http://localhost:3000/api/comments/post-1');
const response = await GET(request, { params: { contentId: 'post-1' }
});
const data = await response.json();
expect(data.comments[0].replies).toEqual([]);
expect(response.status).toBe(200) }) }) })
