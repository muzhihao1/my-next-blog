# Supabase 集成指南

## 项目信息

- **项目URL**: https://xelyobfvfjqeuysfzpcf.supabase.co
- **项目ID**: xelyobfvfjqeuysfzpcf
- **Region**: 根据项目设置确定

## 一、环境变量配置

在 `.env.local` 中添加：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xelyobfvfjqeuysfzpcf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=从Supabase项目设置中获取
SUPABASE_SERVICE_ROLE_KEY=从Supabase项目设置中获取（仅服务器端使用）
```

### 获取API密钥

1. 登录 Supabase Dashboard
2. 进入 Settings → API
3. 复制相应的密钥

## 二、数据库架构设计

### 2.1 用户表（由Supabase Auth自动管理）

```sql
-- auth.users 表由Supabase自动创建和管理
-- 包含用户的基本信息：id, email, created_at等
```

### 2.2 用户配置表

```sql
-- 用户扩展信息表
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  website VARCHAR(255),
  github_username VARCHAR(50),
  twitter_username VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 评论表

```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id VARCHAR(255) NOT NULL, -- Notion页面ID
  content_type VARCHAR(50) NOT NULL, -- 'post', 'project', 'book', 'tool'
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 支持回复
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建索引
CREATE INDEX idx_comments_content ON comments(content_id, content_type);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
```

### 2.4 点赞表

```sql
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, content_id, content_type)
);

-- 创建索引
CREATE INDEX idx_likes_content ON likes(content_id, content_type);
CREATE INDEX idx_likes_user ON likes(user_id);
```

### 2.5 收藏表

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, content_id, content_type)
);

-- 创建索引
CREATE INDEX idx_bookmarks_content ON bookmarks(content_id, content_type);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
```

### 2.6 用户行为表

```sql
CREATE TABLE user_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'comment', 'share', 'bookmark'
  content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  metadata JSONB, -- 存储额外信息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建索引
CREATE INDEX idx_user_actions_user ON user_actions(user_id);
CREATE INDEX idx_user_actions_content ON user_actions(content_id, content_type);
CREATE INDEX idx_user_actions_created ON user_actions(created_at);
```

## 三、RLS（Row Level Security）策略

### 3.1 启用RLS

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
```

### 3.2 用户配置策略

```sql
-- 所有人可以查看用户配置
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

-- 用户只能更新自己的配置
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 用户创建自己的配置
CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3.3 评论策略

```sql
-- 所有人可以查看已批准的评论
CREATE POLICY "Anyone can view approved comments" ON comments
  FOR SELECT USING (is_approved = true);

-- 登录用户可以创建评论
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的评论
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的评论
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);
```

### 3.4 点赞策略

```sql
-- 所有人可以查看点赞
CREATE POLICY "Anyone can view likes" ON likes
  FOR SELECT USING (true);

-- 登录用户可以管理自己的点赞
CREATE POLICY "Users can manage own likes" ON likes
  FOR ALL USING (auth.uid() = user_id);
```

### 3.5 收藏策略

```sql
-- 用户只能查看自己的收藏
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以管理自己的收藏
CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

### 3.6 用户行为策略

```sql
-- 用户只能查看自己的行为
CREATE POLICY "Users can view own actions" ON user_actions
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建自己的行为记录
CREATE POLICY "Users can create own actions" ON user_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 四、OAuth配置

### 4.1 GitHub OAuth

1. 访问 GitHub Settings → Developer settings → OAuth Apps
2. 创建新的 OAuth App
3. 配置回调URL: `https://xelyobfvfjqeuysfzpcf.supabase.co/auth/v1/callback`
4. 在 Supabase Dashboard → Authentication → Providers 中配置

### 4.2 Google OAuth（可选）

1. 访问 Google Cloud Console
2. 创建 OAuth 2.0 客户端 ID
3. 配置授权重定向 URI
4. 在 Supabase 中配置

## 五、安装依赖

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

## 六、客户端配置

### 6.1 创建 Supabase 客户端

```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export const createClient = () => createClientComponentClient<Database>();

export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies });
```

### 6.2 类型定义

```typescript
// types/supabase.ts
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          github_username: string | null;
          twitter_username: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          github_username?: string | null;
          twitter_username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          github_username?: string | null;
          twitter_username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // 其他表的类型定义...
    };
  };
};
```

## 七、开发流程

### 7.1 初始设置

1. 复制环境变量到 `.env.local`
2. 运行数据库迁移脚本
3. 配置 OAuth 提供商
4. 测试认证流程

### 7.2 开发顺序

1. 先实现基础认证功能
2. 再实现用户配置管理
3. 然后实现评论系统
4. 最后实现点赞和收藏

### 7.3 测试要点

- 认证流程是否正常
- RLS策略是否生效
- 实时功能是否工作
- 错误处理是否完善

## 八、注意事项

1. **安全性**：
   - Service Role Key 只能在服务器端使用
   - 始终验证用户权限
   - 使用 RLS 保护数据

2. **性能**：
   - 合理使用索引
   - 避免 N+1 查询
   - 使用批量操作

3. **用户体验**：
   - 提供清晰的错误提示
   - 实现乐观更新
   - 保持响应速度

---

**创建日期**: 2025年1月8日
**文档版本**: 1.0
