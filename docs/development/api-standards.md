# API 接口设计规范

> 终端 C 制定的 API 设计和数据获取规范

## 📌 当前架构说明

当前项目使用 **Next.js 静态导出**（`output: 'export'`），不支持动态 API 路由。所有数据在构建时获取并生成静态页面。

### 静态模式下的数据获取

```typescript
// ✅ 正确：在服务器组件中获取数据
export default async function Page() {
  const posts = await getPosts() // 构建时执行
  return <PostList posts={posts} />
}

// ❌ 错误：不能使用 API 路由
fetch('/api/posts') // 静态导出不支持
```

## 🔄 数据获取规范（当前模式）

### 1. Notion 数据获取函数规范

所有 Notion 数据获取函数应遵循以下模式：

```typescript
/**
 * 获取数据的标准模式
 */
export async function getResources(): Promise<Resource[]> {
  // 1. 环境变量检查
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.warn("Notion credentials not found, using fallback data");
    return fallbackResources;
  }

  // 2. 缓存检查（可选）
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  try {
    // 3. 初始化 Notion 客户端
    const notion = new Client({ auth: process.env.NOTION_TOKEN });

    // 4. 查询数据
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        /* 过滤条件 */
      },
      sorts: [
        /* 排序规则 */
      ],
    });

    // 5. 数据转换
    const resources = response.results.map(formatResource);

    // 6. 更新缓存
    cache = { data: resources, timestamp: Date.now() };

    return resources;
  } catch (error) {
    // 7. 错误处理和降级
    console.error("Failed to fetch from Notion:", error);
    return fallbackResources;
  }
}
```

### 2. 数据转换函数规范

```typescript
/**
 * 将 Notion 页面数据转换为应用数据模型
 */
function formatResource(page: any): Resource {
  // 使用类型守卫确保数据安全
  const properties = page.properties || {};

  return {
    id: page.id,
    title: getTextProperty(properties.Title),
    description: getTextProperty(properties.Description),
    // ... 其他字段
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  };
}

/**
 * 安全获取文本属性
 */
function getTextProperty(property: any): string {
  if (!property) return "";

  // 处理不同类型的 Notion 属性
  if (property.type === "title" || property.type === "rich_text") {
    return property[property.type]?.[0]?.plain_text || "";
  }

  return "";
}
```

### 3. 后备数据规范

每个数据模块都应有对应的后备数据：

```typescript
// lib/fallback-resources.ts
export const fallbackResources: Resource[] = [
  {
    id: "fallback-1",
    title: "示例资源",
    description: "这是后备数据，当 Notion API 不可用时显示",
    // ... 完整的数据结构
  },
  // ... 更多后备数据
];
```

## 🚀 未来 API 设计规范（如改为动态部署）

如果未来项目改为支持服务器端渲染，以下是推荐的 API 设计规范：

### 1. RESTful API 设计

```typescript
// app/api/posts/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  try {
    const posts = await getPosts({
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch posts",
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 },
    );
  }
}
```

### 2. API 响应格式规范

成功响应：

```json
{
  "success": true,
  "data": {
    /* 实际数据 */
  },
  "metadata": {
    "timestamp": "2025-01-07T12:00:00Z",
    "version": "1.0"
  }
}
```

错误响应：

```json
{
  "success": false,
  "error": "RESOURCE_NOT_FOUND",
  "message": "请求的资源不存在",
  "details": {
    /* 可选的详细信息 */
  }
}
```

分页响应：

```json
{
  "success": true,
  "data": [
    /* 数据数组 */
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 3. 错误码规范

```typescript
export enum ApiError {
  // 客户端错误 4xx
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",

  // 服务器错误 5xx
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // 业务错误
  NOTION_API_ERROR = "NOTION_API_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}
```

### 4. API 安全规范

```typescript
// 1. 速率限制
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// 2. 请求验证
function validateRequest(request: Request) {
  // 验证 API 密钥
  const apiKey = request.headers.get("X-API-Key");
  if (!apiKey || apiKey !== process.env.API_KEY) {
    throw new Error("Unauthorized");
  }

  // 验证内容类型
  const contentType = request.headers.get("Content-Type");
  if (!contentType?.includes("application/json")) {
    throw new Error("Invalid content type");
  }
}

// 3. 输入验证
import { z } from "zod";

const PostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  tags: z.array(z.string()).optional(),
});

function validateInput(data: unknown) {
  return PostSchema.parse(data);
}
```

## 📊 性能优化建议

### 1. 缓存策略

```typescript
// 内存缓存（当前使用）
const cache = new Map<string, CacheEntry>();

// Redis 缓存（未来扩展）
import { Redis } from "@vercel/kv";

async function getCachedData(key: string) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchData();
  await redis.set(key, JSON.stringify(data), { ex: 3600 });
  return data;
}
```

### 2. 数据预加载

```typescript
// 预加载相关数据
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
  };
}

// 预生成静态路径
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

### 3. 增量静态再生（ISR）

```typescript
// 未来可以使用 ISR 实现准实时更新
export const revalidate = 3600 // 每小时重新验证

export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}
```

## 🔧 Notion API 集成最佳实践

### 1. 批量操作

```typescript
// 批量获取多个数据库的数据
export async function getBatchData() {
  const [posts, projects, tools] = await Promise.all([
    getPosts(),
    getProjects(),
    getTools(),
  ]);

  return { posts, projects, tools };
}
```

### 2. 查询优化

```typescript
// 只获取需要的属性
const response = await notion.databases.query({
  database_id: databaseId,
  page_size: 100, // 最大值
  filter_properties: ["Title", "Status", "Date"], // 只获取需要的字段
});
```

### 3. 错误重试

```typescript
async function retryableQuery(queryFn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // 指数退避
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000),
      );
    }
  }
}
```

## 📝 迁移指南

如果未来需要从静态导出迁移到动态部署：

1. **修改 next.config.js**

   ```js
   // 移除或注释掉
   // output: 'export'
   ```

2. **添加 API 路由**

   ```
   app/api/
     posts/route.ts
     projects/route.ts
     search/route.ts
   ```

3. **更新数据获取**

   ```typescript
   // 从直接调用改为 API 调用
   const response = await fetch("/api/posts");
   const { data } = await response.json();
   ```

4. **配置缓存层**
   - 添加 Redis 或其他缓存服务
   - 实现缓存失效策略

5. **添加认证和授权**
   - 实现 API 密钥管理
   - 添加用户认证（如需要）

---

_终端 C 制定于 2025-01-07_
_适用于当前静态导出模式，并为未来扩展预留规范_
