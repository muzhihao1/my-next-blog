# Supabase API 密钥获取指南

## 项目信息
- **项目URL**: https://xelyobfvfjqeuysfzpcf.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/xelyobfvfjqeuysfzpcf

## 获取 API 密钥步骤

### 1. 登录 Supabase Dashboard
访问：https://supabase.com/dashboard/project/xelyobfvfjqeuysfzpcf

### 2. 获取 Project URL 和 Anon Key
1. 在左侧菜单中，点击 **Settings**
2. 选择 **API** 标签
3. 你会看到以下信息：
   - **Project URL**: `https://xelyobfvfjqeuysfzpcf.supabase.co`
   - **anon public**: 这是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: 这是 `SUPABASE_SERVICE_ROLE_KEY`

### 3. 复制密钥到 .env.local
将获取到的密钥更新到 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://xelyobfvfjqeuysfzpcf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_public_密钥
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_密钥
```

## 重要说明

### 密钥安全
- **anon public key**: 可以在客户端使用，会暴露给用户
- **service_role key**: 只能在服务器端使用，绕过 RLS 策略，必须保密

### 密钥格式
密钥通常是一个很长的 JWT token，格式类似：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（很长的字符串）
```

## 配置 GitHub OAuth

### 1. 在 GitHub 创建 OAuth App
1. 访问：https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - **Application name**: My Blog (或任意名称)
   - **Homepage URL**: http://localhost:3000 (开发环境)
   - **Authorization callback URL**: 
     ```
     https://xelyobfvfjqeuysfzpcf.supabase.co/auth/v1/callback
     ```
4. 点击 "Register application"
5. 保存 Client ID 和 Client Secret

### 2. 在 Supabase 配置 GitHub Provider
1. 在 Supabase Dashboard 中，选择 **Authentication**
2. 点击 **Providers** 标签
3. 找到 **GitHub** 并启用
4. 填入从 GitHub 获取的：
   - Client ID
   - Client Secret
5. 保存配置

## 测试连接

配置完成后，运行测试脚本验证连接：

```bash
npm run test:supabase
```

或手动运行：

```bash
node scripts/test-supabase-connection.js
```

## 初始化数据库

如果测试显示表不存在，需要在 Supabase SQL Editor 中执行初始化脚本：

1. 在 Dashboard 中选择 **SQL Editor**
2. 点击 "New Query"
3. 复制 `scripts/supabase-init.sql` 的内容
4. 点击 "Run" 执行

## 常见问题

### 1. 获取密钥时看到警告
Supabase 会提醒你 service_role key 的安全性，这是正常的。确保只在服务器端使用。

### 2. OAuth 回调 URL 错误
确保 GitHub OAuth App 中的回调 URL 与 Supabase 项目 URL 匹配。

### 3. 数据库初始化失败
- 检查是否有语法错误
- 确保按顺序执行（先创建函数，再创建表）
- 如果表已存在，可能需要先删除再创建

## 下一步

完成配置后，可以开始 A2.2 认证系统实现任务。