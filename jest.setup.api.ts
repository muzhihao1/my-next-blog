// Mock Next.js server runtime import { TextEncoder, TextDecoder }
from 'util' global.TextEncoder = TextEncoder global.TextDecoder = TextDecoder as any // Mock Request/Response if not available if (typeof Request === 'undefined') { global.Request = class Request { url: string method: string headers: Headers body: any constructor(url: string, init?: RequestInit) { this.url = url this.method = init?.method || 'GET' this.headers = new Headers(init?.headers) this.body = init?.body }
async formData() { return this.body }
async json() { return JSON.parse(this.body) }
async text() { return this.body }
}
as any }
if (typeof Response === 'undefined') { global.Response = class Response { body: any status: number headers: Headers constructor(body?: any, init?: ResponseInit) { this.body = body this.status = init?.status || 200 this.headers = new Headers(init?.headers) }
async json() { return typeof this.body === 'string' ? JSON.parse(this.body) : this.body }
async text() { return typeof this.body === 'string' ? this.body : JSON.stringify(this.body) }
}
as any }
if (typeof Headers === 'undefined') { global.Headers = class Headers { private headers: Record<string, string> = {}
constructor(init?: HeadersInit) { if (init) { if (Array.isArray(init)) { init.forEach(([key, value]) => { this.headers[key.toLowerCase()] = value }) }
else if (init instanceof Headers) { // Copy headers }
else { Object.entries(init).forEach(([key, value]) => { this.headers[key.toLowerCase()] = value }) }
} }
get(key: string) { return this.headers[key.toLowerCase()]
}
set(key: string, value: string) { this.headers[key.toLowerCase()] = value }
has(key: string) { return key.toLowerCase() in this.headers }
delete(key: string) { delete this.headers[key.toLowerCase()]
}
forEach(callback: (value: string, key: string) => void) { Object.entries(this.headers).forEach(([key, value]) => { callback(value, key) }) }
}
as any }
if (typeof FormData === 'undefined') { global.FormData = class FormData { private data: Map<string, any> = new Map() append(key: string, value: any) { this.data.set(key, value) }
get(key: string) { return this.data.get(key) }
has(key: string) { return this.data.has(key) }
delete(key: string) { this.data.delete(key) }
forEach(callback: (value: any, key: string) => void) { this.data.forEach((value, key) => { callback(value, key) }) }
}
as any }
