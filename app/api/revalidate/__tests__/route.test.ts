import { NextRequest }
from "next/server";
import { POST, GET }
from "../route";
// Mock Next.js cache functions jest.mock('next/cache', () => ({ revalidatePath: jest.fn(), revalidateTag: jest.fn() }));
const { revalidatePath, revalidateTag } = require('next/cache') describe('/api/revalidate', () => { const originalEnv = process.env const mockSecret = 'test-secret-token' beforeEach(() => { jest.clearAllMocks() process.env = { ...originalEnv, REVALIDATE_SECRET: mockSecret }
// Mock console methods to avoid test noise jest.spyOn(console, 'log').mockImplementation() jest.spyOn(console, 'error').mockImplementation() })
afterEach(() => { process.env = originalEnv jest.restoreAllMocks() });

describe('POST /api/revalidate', () => { it('revalidates path when type is "path"', async () => { const request = new NextRequest('http://localhost:3000/api/revalidate', { method: 'POST', headers: { 'authorization': `Bearer ${mockSecret}` }, body: JSON.stringify({ type: 'path', path: '/posts/my-post' }) });
const response = await POST(request);
const data = await response.json();
expect(revalidatePath).toHaveBeenCalledWith('/posts/my-post');
expect(data.revalidated).toBe(true);
expect(data.type).toBe('path');
expect(data.path).toBe('/posts/my-post');
expect(response.status).toBe(200) });

it('revalidates tag when type is "tag"', async () => { const request = new NextRequest('http://localhost:3000/api/revalidate', { method: 'POST', headers: { 'authorization': `Bearer ${mockSecret}` }, body: JSON.stringify({ type: 'tag', tag: 'posts' }) });
const response = await POST(request);
const data = await response.json();
expect(revalidateTag).toHaveBeenCalledWith('posts');
expect(data.revalidated).toBe(true);
expect(data.type).toBe('tag');
expect(data.tag).toBe('posts');
expect(response.status).toBe(200) });

it('revalidates common paths when type is "all"', async () => { const request = new NextRequest('http://localhost:3000/api/revalidate', { method: 'POST', headers: { 'authorization': `Bearer ${mockSecret}` }, body: JSON.stringify({ type: 'all' }) });
const response = await POST(request);
const data = await response.json();
expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
expect(revalidatePath).toHaveBeenCalledWith('/blog');
expect(revalidatePath).toHaveBeenCalledWith('/projects');
expect(revalidatePath).toHaveBeenCalledWith('/bookshelf');
expect(revalidatePath).toHaveBeenCalledWith('/tools');
expect(revalidatePath).toHaveBeenCalledWith('/tags');
expect(revalidateTag).toHaveBeenCalledWith('posts');
expect(revalidateTag).toHaveBeenCalledWith('projects');
expect(revalidateTag).toHaveBeenCalledWith('books');
expect(revalidateTag).toHaveBeenCalledWith('tools');
expect(data.revalidated).toBe(true);
expect(data.timestamp).toBeDefined();
expect(response.status).toBe(200) });

it('returns 401 for missing authorization', async () => { const request = new NextRequest('http://localhost:3000/api/revalidate', { method: 'POST', body: JSON.stringify({ type: 'path', path: '/posts' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: 'Unauthorized' });
expect(response.status).toBe(401) });

it('returns 401 for invalid token', async () => { const request = new NextRequest('http://localhost:3000/api/revalidate', { method: 'POST', headers: { 'authorization': 'Bearer wrong-token' }, body: JSON.stringify({ type: 'path', path: '/posts' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: 'Unauthorized' });
expect(response.status).toBe(401) });

it('returns 400 for missing path in path revalidation', async () => { const request = new NextRequest('http://localhost:3000/api/revalidate', { method: 'POST', headers: { 'authorization': `Bearer ${mockSecret}` }, body: JSON.stringify({ type: 'path' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: 'Path is required for path revalidation' });
expect(response.status).toBe(400) });

it('returns 400 for missing tag in tag revalidation', async () => { const request = new NextRequest('http://localhost:3000/api/revalidate', { method: 'POST', headers: { 'authorization': `Bearer ${mockSecret}` }, body: JSON.stringify({ type: 'tag' }) });
const response = await POST(request);
const data = await response.json();
expect(data).toEqual({ error: 'Tag is required for tag revalidation' });
expect(response.status).toBe(400) });

it('handles invalid JSON body gracefully', async () => { const request = new NextRequest('http://localhost:3000/api/revalidate', { method: 'POST', headers: { 'authorization': `Bearer ${mockSecret}`, 'content-type': 'application/json' }, body: 'invalid json' });
const response = await POST(request);
const data = await response.json();
expect(data.revalidated).toBe(true);
expect(data.type).toBe('all') // Defaults to 'all' });

it('uses default secret when REVALIDATE_SECRET is not set', async () => { delete process.env.REVALIDATE_SECRET const request = new NextRequest('http://localhost:3000/api/revalidate', { method: 'POST', headers: { 'authorization': 'Bearer my-secret-token' }, body: JSON.stringify({ type: 'path', path: '/posts' }) });
const response = await POST(request);
const data = await response.json();
expect(revalidatePath).toHaveBeenCalledWith('/posts');
expect(data.revalidated).toBe(true) });

it('logs revalidation requests', async () => { const request = new NextRequest('http://localhost:3000/api/revalidate', { method: 'POST', headers: { 'authorization': `Bearer ${mockSecret}` }, body: JSON.stringify({ type: 'tag', tag: 'products' }) }) await POST(request);
expect(console.log).toHaveBeenCalledWith('Revalidation request:', { type: 'tag', path: undefined, tag: 'products' }) });

it('handles server errors gracefully', async () => { // Mock revalidatePath to throw an error revalidatePath.mockImplementation(() => { throw new Error('Revalidation failed') });
const request = new NextRequest('http://localhost:3000/api/revalidate', { method: 'POST', headers: { 'authorization': `Bearer ${mockSecret}` }, body: JSON.stringify({ type: 'path', path: '/posts' }) });
const response = await POST(request);
const data = await response.json();
expect(data.error).toBe('Internal server error');
expect(data.message).toBe('Revalidation failed');
expect(response.status).toBe(500);
expect(console.error).toHaveBeenCalled() }) });

describe('GET /api/revalidate', () => { it('returns 405 in production environment', async () => { process.env.NODE_ENV = 'production' const request = new NextRequest('http://localhost:3000/api/revalidate?secret=' + mockSecret);
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ error: 'Method not allowed in production' });
expect(response.status).toBe(405) });

it('revalidates all paths in development with valid secret', async () => { process.env.NODE_ENV = 'development' const request = new NextRequest('http://localhost:3000/api/revalidate?secret=' + mockSecret);
const response = await GET(request);
const data = await response.json();
expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
expect(revalidateTag).toHaveBeenCalledWith('posts');
expect(revalidateTag).toHaveBeenCalledWith('projects');
expect(revalidateTag).toHaveBeenCalledWith('books');
expect(revalidateTag).toHaveBeenCalledWith('tools');
expect(data.revalidated).toBe(true);
expect(data.message).toBe('All paths and tags revalidated');
expect(response.status).toBe(200) });

it('returns 401 for invalid secret in GET request', async () => { process.env.NODE_ENV = 'development' const request = new NextRequest('http://localhost:3000/api/revalidate?secret=wrong-secret');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ error: 'Unauthorized' });
expect(response.status).toBe(401) });

it('returns 401 for missing secret in GET request', async () => { process.env.NODE_ENV = 'development' const request = new NextRequest('http://localhost:3000/api/revalidate');
const response = await GET(request);
const data = await response.json();
expect(data).toEqual({ error: 'Unauthorized' });
expect(response.status).toBe(401) }) }) })
