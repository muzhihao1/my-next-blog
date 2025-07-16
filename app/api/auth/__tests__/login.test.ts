import { NextRequest }
from "next/server";
import { POST }
from "../login/route";
// Mock Supabase server client jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));
const mockCreateClient = require('@/lib/supabase/server').createClient describe('/api/auth/login', () => { beforeEach(() => { jest.clearAllMocks() });

it('successfully initiates GitHub OAuth', async () => { const mockSignInWithOAuth = jest.fn().mockResolvedValue({ data: { url: 'https://github.com/oauth/authorize?...' }, error: null }) mockCreateClient.mockResolvedValue({ auth: { signInWithOAuth: mockSignInWithOAuth }
});
const formData = new FormData() formData.append('provider', 'github');
const request = new NextRequest('http://localhost:3000/api/auth/login', { method: 'POST', body: formData });
const response = await POST(request);
const data = await response.json();
expect(mockSignInWithOAuth).toHaveBeenCalledWith({ provider: 'github', options: { redirectTo: 'http://localhost:3000/auth/callback' }
});
expect(data).toEqual({ url: 'https://github.com/oauth/authorize?...' });
expect(response.status).toBe(200) });

it('handles OAuth error', async () => { const mockSignInWithOAuth = jest.fn().mockResolvedValue({ data: null, error: { message: 'OAuth configuration error' }
}) mockCreateClient.mockResolvedValue({ auth: { signInWithOAuth: mockSignInWithOAuth }
});
const formData = new FormData() formData.append('provider', 'github');
const request = new NextRequest('http://localhost:3000/api/auth/login', { method: 'POST', body: formData });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: 'OAuth configuration error' });
expect(response.status).toBe(400) });

it('rejects unsupported providers', async () => { mockCreateClient.mockResolvedValue({ auth: { signInWithOAuth: jest.fn() }
});
const formData = new FormData() formData.append('provider', 'unsupported');
const request = new NextRequest('http://localhost:3000/api/auth/login', { method: 'POST', body: formData });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '不支持的登录方式' });
expect(response.status).toBe(400) });

it('handles missing provider', async () => { mockCreateClient.mockResolvedValue({ auth: { signInWithOAuth: jest.fn() }
});
const formData = new FormData();
const request = new NextRequest('http://localhost:3000/api/auth/login', { method: 'POST', body: formData });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '不支持的登录方式' });
expect(response.status).toBe(400) });

it('handles empty OAuth response', async () => { const mockSignInWithOAuth = jest.fn().mockResolvedValue({ data: {}, error: null }) mockCreateClient.mockResolvedValue({ auth: { signInWithOAuth: mockSignInWithOAuth }
});
const formData = new FormData() formData.append('provider', 'github');
const request = new NextRequest('http://localhost:3000/api/auth/login', { method: 'POST', body: formData });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: '不支持的登录方式' });
expect(response.status).toBe(400) });

it('uses correct redirect URL from request', async () => { const mockSignInWithOAuth = jest.fn().mockResolvedValue({ data: { url: 'https://github.com/oauth/authorize?...' }, error: null }) mockCreateClient.mockResolvedValue({ auth: { signInWithOAuth: mockSignInWithOAuth }
});
const formData = new FormData() formData.append('provider', 'github');
const request = new NextRequest('https://example.com/api/auth/login', { method: 'POST', body: formData }) await POST(request);
expect(mockSignInWithOAuth).toHaveBeenCalledWith({ provider: 'github', options: { redirectTo: 'https://example.com/auth/callback' }
}) }) })
