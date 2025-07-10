# 实时功能实现指南

**创建日期**：2025年1月10日  
**任务**：A2. 实时交互后端  
**负责人**：终端A

## 一、概述

实时功能基于 Supabase Realtime 构建，提供以下核心功能：

- 🔄 实时评论更新
- 👥 在线用户状态
- 🔔 实时通知系统
- 📡 WebSocket 连接管理

## 二、技术架构

### 1. 架构设计

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   前端组件   │ ←→ │ 实时事件管理器 │ ←→ │  Supabase   │
│  (React)    │     │(EventManager)│     │  Realtime   │
└─────────────┘     └──────────────┘     └─────────────┘
        ↓                   ↓                     ↓
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Hooks     │     │   客户端     │     │  PostgreSQL │
│(useRealtime)│     │(RealtimeClient)│    │   数据库    │
└─────────────┘     └──────────────┘     └─────────────┘
```

### 2. 核心模块

- **RealtimeClient**: WebSocket 连接管理，自动重连
- **EventManager**: 事件分发，优先级队列
- **Feature Modules**: 评论、在线状态、通知
- **React Hooks**: 便捷的组件集成

## 三、功能实现

### 1. 实时评论

```typescript
// 使用实时评论
import { useRealtimeComments } from '@/lib/realtime'

function CommentSection({ postId }) {
  const { typingUsers, updateTypingStatus } = useRealtimeComments(
    postId,
    'post'
  )

  // 监听评论事件
  useEffect(() => {
    const handleNewComment = (e) => {
      // 添加新评论到列表
      addComment(e.detail)
    }

    window.addEventListener('comment:created', handleNewComment)
    return () => window.removeEventListener('comment:created', handleNewComment)
  }, [])

  // 用户输入时
  const handleInput = () => {
    updateTypingStatus(true)
  }

  return (
    <div>
      {typingUsers.length > 0 && (
        <div>{typingUsers.join(', ')} 正在输入...</div>
      )}
      {/* 评论列表 */}
    </div>
  )
}
```

### 2. 在线用户

```typescript
// 使用在线状态
import { useOnlinePresence } from '@/lib/realtime'

function OnlineUsers() {
  const { onlineUsers, totalOnline } = useOnlinePresence()

  return (
    <div>
      <h3>在线用户 ({totalOnline})</h3>
      <div className="flex gap-2">
        {onlineUsers.map(user => (
          <div key={user.userId} className="flex items-center gap-1">
            <img src={user.avatar} className="w-8 h-8 rounded-full" />
            <span className={`w-2 h-2 rounded-full ${
              user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 3. 实时通知

```typescript
// 使用实时通知
import { useRealtimeNotifications } from '@/lib/realtime'

function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useRealtimeNotifications()

  return (
    <div>
      <div className="flex justify-between">
        <h3>通知 ({unreadCount})</h3>
        <button onClick={markAllAsRead}>全部标记已读</button>
      </div>

      <div className="space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            onClick={() => markAsRead(notif.id)}
            className={`p-4 ${notif.read ? 'opacity-60' : 'bg-blue-50'}`}
          >
            <h4>{notif.title}</h4>
            <p>{notif.message}</p>
            <time>{notif.createdAt}</time>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 四、配置和初始化

### 1. 全局初始化

在 `app/layout.tsx` 中初始化：

```typescript
import { useRealtime } from '@/lib/realtime'

export default function RootLayout({ children }) {
  const { isInitialized, error } = useRealtime({
    reconnect: {
      maxRetries: 10,
      initialDelay: 1000,
    },
    performance: {
      maxConcurrentChannels: 5,
    }
  })

  if (error) {
    console.error('Realtime initialization failed:', error)
  }

  return (
    <html>
      <body>
        {children}
        {isInitialized && <OnlineIndicator />}
      </body>
    </html>
  )
}
```

### 2. 环境变量

确保设置了 Supabase 环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 数据库迁移

执行通知表迁移：

```bash
# 在 Supabase SQL Editor 中执行
scripts/supabase-migration-notifications.sql
```

## 五、高级功能

### 1. 自定义事件

```typescript
import { onRealtimeEvent, emitRealtimeEvent } from "@/lib/realtime";

// 监听自定义事件
const unsubscribe = onRealtimeEvent("custom:event", (data) => {
  console.log("Received custom event:", data);
});

// 发送自定义事件
await emitRealtimeEvent(REALTIME_CHANNELS.ANALYTICS, "custom:event", {
  action: "button_click",
  value: 123,
});
```

### 2. 事件过滤和优先级

```typescript
// 带过滤器的订阅
eventManager.subscribe(REALTIME_EVENTS.COMMENT_CREATED, handleComment, {
  filter: (data) => data.contentType === "post",
  priority: 10, // 高优先级
  once: true, // 只触发一次
});
```

### 3. 批量操作

```typescript
// 批量发送通知
await notificationManager.sendBatch([
  {
    userId: "user1",
    notification: {
      type: "comment",
      title: "新评论",
      message: "有人评论了你的文章",
    },
  },
  // ... 更多通知
]);
```

## 六、性能优化

### 1. 连接管理

- 自动重连，指数退避策略
- 心跳检测，保持连接活跃
- 离线队列，断网自动缓存

### 2. 事件节流

```typescript
// 输入状态节流（5秒自动停止）
const handleTyping = throttle(() => {
  updateTypingStatus(true);
}, 1000);
```

### 3. 内存管理

- 最大并发频道限制
- 事件缓冲区大小限制
- 自动清理过期数据

## 七、错误处理

### 1. 连接错误

```typescript
const channel = await client.subscribe(REALTIME_CHANNELS.COMMENTS, {
  onError: (error) => {
    console.error("Connection error:", error);
    // 显示错误提示
    showErrorToast("连接失败，正在重试...");
  },
});
```

### 2. 降级策略

- WebSocket 不可用时降级到轮询
- 离线时缓存操作，在线后同步
- 关键操作使用乐观更新

## 八、安全考虑

### 1. 权限控制

- RLS 策略限制数据访问
- 用户只能看到自己的通知
- 评论编辑权限验证

### 2. 数据验证

- 服务端验证所有输入
- 防止 XSS 攻击
- 速率限制防止滥用

## 九、测试指南

### 1. 单元测试

```typescript
// 测试事件管理器
describe("EventManager", () => {
  it("should handle event subscription", async () => {
    const handler = jest.fn();
    const unsubscribe = eventManager.subscribe("test:event", handler);

    await eventManager.publish("test:channel", "test:event", { data: 123 });

    expect(handler).toHaveBeenCalledWith({ data: 123 });
    unsubscribe();
  });
});
```

### 2. 集成测试

- 测试 WebSocket 连接
- 测试自动重连机制
- 测试离线队列功能

## 十、部署注意事项

### 1. Vercel 部署

- WebSocket 通过 Supabase 处理
- 无需额外服务器配置
- 自动扩展支持

### 2. 监控

- 监控 WebSocket 连接数
- 跟踪事件处理延迟
- 记录错误和重连次数

## 十一、常见问题

### Q1: 如何处理大量在线用户？

使用分页和虚拟滚动：

```typescript
const pageSize = 50;
const visibleUsers = onlineUsers.slice(0, pageSize);
```

### Q2: 如何优化通知性能？

- 批量标记已读
- 定期清理旧通知
- 使用索引优化查询

### Q3: 如何调试实时功能？

```typescript
// 启用调试日志
window.localStorage.setItem("supabase.auth.debug", "true");
```

---

**完成时间**：2025年1月10日  
**下一步**：集成到前端组件，实现完整的实时交互体验
