import { NextRequest }
from 'next/server' 

import { GET }
from '../user/route' // Mock Supabase server client jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));
const mockCreateClient = require('@/lib/supabase/server').createClient describe('/api/auth/user', () => { beforeEach(() => { jest.clearAllMocks() });

it('returns user data with profile', async () => { const mockUser = { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01T00:00:00Z', user_metadata: { avatar_url: 'https://example.com/avatar.jpg', full_name: 'Test User', user_name: 'testuser' }
};
const mockProfile = { id: 'user-123', display_name: 'Test Display Name', username: 'testusername', bio: 'Test bio', website: 'https://example.com', github_username: 'testgithub', twitter_username: 'testtwitter', avatar_url: 'https://example.com/profile-avatar.jpg' };
const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockFrom = jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }) }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom });
const request = new NextRequest('http://localhost:3000/api/auth/user', { method: 'GET' });
const response = await GET(request);
const data = await response.json();
expect(mockGetUser).toHaveBeenCalled();
expect(mockFrom).toHaveBeenCalledWith('user_profiles');
expect(data.user).toEqual({ id: 'user-123', email: 'test@example.com', created_at: '2024-01-01T00:00:00Z', avatar_url: 'https://example.com/avatar.jpg', display_name: 'Test Display Name', username: 'testusername', bio: 'Test bio', website: 'https://example.com', github_username: 'testgithub', twitter_username: 'testtwitter' });
expect(response.status).toBe(200) });

it('returns 401 when user is not authenticated', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null }, error: null }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }
});
const request = new NextRequest('http://localhost:3000/api/auth/user', { method: 'GET' });
const response = await GET(request);
const data = await response.json();
expect(mockGetUser).toHaveBeenCalled();
expect(data).toEqual({ user: null });
expect(response.status).toBe(401) });

it('returns 401 when auth error occurs', async () => { const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'Invalid session' }
}) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }
});
const request = new NextRequest('http://localhost:3000/api/auth/user', { method: 'GET' });
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ user: null });
expect(response.status).toBe(401) });

it('handles missing profile data', async () => { const mockUser = { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01T00:00:00Z', user_metadata: {}
};
const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockFrom = jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: null }) }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom });
const request = new NextRequest('http://localhost:3000/api/auth/user', { method: 'GET' });
const response = await GET(request);
const data = await response.json();
expect(data.user).toEqual({ id: 'user-123', email: 'test@example.com', created_at: '2024-01-01T00:00:00Z', avatar_url: undefined, display_name: 'test', username: undefined, bio: undefined, website: undefined, github_username: undefined, twitter_username: undefined });
expect(response.status).toBe(200) });

it('uses user metadata avatar_url when profile avatar_url is not available', async () => { const mockUser = { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01T00:00:00Z', user_metadata: { avatar_url: 'https://example.com/metadata-avatar.jpg' }
};
const mockProfile = { // No avatar_url in profile display_name: 'Test User' };
const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockFrom = jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }) }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom });
const request = new NextRequest('http://localhost:3000/api/auth/user', { method: 'GET' });
const response = await GET(request);
const data = await response.json() // Should use user metadata avatar_url since profile doesn't have one expect(data.user.avatar_url).toBe('https://example.com/metadata-avatar.jpg') });

it('handles profile query error gracefully', async () => { const mockUser = { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01T00:00:00Z', user_metadata: {}
};
const mockGetUser = jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockFrom = jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Profile not found' }
}) }) mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom });
const request = new NextRequest('http://localhost:3000/api/auth/user', { method: 'GET' });
const response = await GET(request);
const data = await response.json() // Should still return user data even if profile query fails expect(data.user.id).toBe('user-123');
expect(data.user.email).toBe('test@example.com');
expect(response.status).toBe(200) }) })