import { NextRequest }
from "next/server";
import { POST }
from "../logout/route";
// Mock Supabase server client jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));
const mockCreateClient = require('@/lib/supabase/server').createClient describe('/api/auth/logout', () => { beforeEach(() => { jest.clearAllMocks() });

it('successfully signs out user', async () => { const mockSignOut = jest.fn().mockResolvedValue({ error: null }) mockCreateClient.mockResolvedValue({ auth: { signOut: mockSignOut }
});
const request = new NextRequest('http://localhost:3000/api/auth/logout', { method: 'POST' });
const response = await POST(request);
const data = await response.json();
expect(mockSignOut).toHaveBeenCalled();
expect(data).toEqual({ success: true });
expect(response.status).toBe(200) });

it('handles sign out error', async () => { const mockSignOut = jest.fn().mockResolvedValue({ error: { message: 'Session not found' }
}) mockCreateClient.mockResolvedValue({ auth: { signOut: mockSignOut }
});
const request = new NextRequest('http://localhost:3000/api/auth/logout', { method: 'POST' });
const response = await POST(request);
const data = await response.json();
expect(mockSignOut).toHaveBeenCalled();
expect(data).toEqual({ error: 'Session not found' });
expect(response.status).toBe(400) });

it('handles network error during sign out', async () => { const mockSignOut = jest.fn().mockRejectedValue(new Error('Network error'));
mockCreateClient.mockResolvedValue({ auth: { signOut: mockSignOut }
});
const request = new NextRequest('http://localhost:3000/api/auth/logout', { method: 'POST' }) await expect(POST(request)).rejects.toThrow('Network error') });

it('handles missing auth client', async () => { mockCreateClient.mockResolvedValue({ auth: null });
const request = new NextRequest('http://localhost:3000/api/auth/logout', { method: 'POST' }) await expect(POST(request)).rejects.toThrow() });

it('works with different request origins', async () => { const mockSignOut = jest.fn().mockResolvedValue({ error: null }) mockCreateClient.mockResolvedValue({ auth: { signOut: mockSignOut }
});
const request = new NextRequest('https://example.com/api/auth/logout', { method: 'POST' });
const response = await POST(request);
const data = await response.json();
expect(mockSignOut).toHaveBeenCalled();
expect(data).toEqual({ success: true });
expect(response.status).toBe(200) }) })
