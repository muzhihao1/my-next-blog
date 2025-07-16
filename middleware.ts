import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 只在生产环境保护 admin 路由
  if (process.env.NODE_ENV === 'production' && request.nextUrl.pathname.startsWith('/admin')) {
    // 检查是否设置了 ADMIN_PASSWORD
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      // 如果没有设置密码，完全禁用 admin 路由
      return NextResponse.json(
        { error: 'Admin panel is disabled in production' },
        { status: 403 }
      )
    }
    
    // 简单的密码验证（通过 URL 参数）
    const password = request.nextUrl.searchParams.get('password')
    
    if (password !== adminPassword) {
      // 返回一个简单的密码输入页面
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Admin Access</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #f3f4f6;
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 0.5rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 100%;
                margin: 1rem;
              }
              h1 {
                margin: 0 0 1.5rem 0;
                font-size: 1.5rem;
                color: #111827;
              }
              form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
              }
              input {
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                font-size: 1rem;
              }
              button {
                background: #3b82f6;
                color: white;
                padding: 0.75rem;
                border: none;
                border-radius: 0.375rem;
                font-size: 1rem;
                cursor: pointer;
              }
              button:hover {
                background: #2563eb;
              }
              .error {
                color: #ef4444;
                font-size: 0.875rem;
                margin-top: 0.5rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Admin Access Required</h1>
              <form method="GET">
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Enter admin password" 
                  required
                  autofocus
                />
                <button type="submit">Access Admin Panel</button>
              </form>
              ${password ? '<p class="error">Invalid password</p>' : ''}
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      )
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}