# B3 实时交互前端集成指南

> 完成时间：2025年1月11日  
> 实现状态：核心组件已完成

## 功能概述

实时交互前端提供了三个核心组件，实现了完整的实时体验：

1. **实时评论系统** (`RealtimeComments`)
   - 实时评论同步
   - 用户输入状态显示
   - 评论的增删改查
   - 在线用户统计

2. **在线用户显示** (`OnlineUsers`)
   - 实时在线状态
   - 用户头像展示
   - 悬浮详情提示
   - 页面级别追踪

3. **通知中心** (`NotificationCenter`)
   - 实时通知推送
   - Toast 提示
   - 未读计数
   - 浏览器通知

## 技术架构

### 依赖关系

```
Frontend Components
    ↓
useRealtime Hook
    ↓
Event Manager → Realtime Client
    ↓
Supabase Realtime (WebSocket)
```

### 核心文件

```
components/realtime/
├── RealtimeComments.tsx      # 实时评论组件
├── OnlineUsers.tsx           # 在线用户组件
├── NotificationCenter.tsx    # 通知中心组件
├── index.ts                  # 统一导出
└── __tests__/               # 单元测试
    └── OnlineUsers.test.tsx

hooks/
└── useRealtime.ts           # 实时功能 Hook
```

## 使用示例

### 1. 在文章页面添加实时评论

```tsx
// app/posts/[slug]/page.tsx
import { RealtimeComments } from "@/components/realtime";
import { getCommentsByPostId } from "@/lib/comments";

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  const comments = await getCommentsByPostId(post.id);

  return (
    <article>
      {/* 文章内容 */}
      <div className="prose">{post.content}</div>

      {/* 实时评论 */}
      <div className="mt-12">
        <RealtimeComments postId={post.id} initialComments={comments} />
      </div>
    </article>
  );
}
```

### 2. 在导航栏显示在线用户

```tsx
// components/layout/BlogHeader.tsx
import { OnlineUsers } from "@/components/realtime";

export function BlogHeader() {
  return (
    <header className="flex justify-between items-center">
      <h1>我的博客</h1>

      {/* 显示在线用户 */}
      <OnlineUsers showDetails={true} maxDisplay={5} />
    </header>
  );
}
```

### 3. 使用 useRealtime Hook

```tsx
// components/custom/LiveChat.tsx
"use client";

import { useRealtime, useRealtimeEvent } from "@/hooks/useRealtime";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime/config";

export function LiveChat() {
  const { publish, isConnected } = useRealtime({
    channel: REALTIME_CHANNELS.COMMENTS,
  });

  // 监听新消息
  useRealtimeEvent(REALTIME_EVENTS.COMMENT_CREATED, (comment) => {
    console.log("New comment:", comment);
    // 更新 UI
  });

  // 发送消息
  const sendMessage = async (text: string) => {
    await publish(REALTIME_CHANNELS.COMMENTS, REALTIME_EVENTS.COMMENT_CREATED, {
      content: text,
      timestamp: Date.now(),
    });
  };

  return (
    <div>
      {isConnected ? "已连接" : "连接中..."}
      {/* Chat UI */}
    </div>
  );
}
```

### 4. 发送实时通知

```tsx
// 在任何服务端或客户端代码中
import { getEventManager } from "@/lib/realtime/event-manager";

// 发送通知给特定用户
await getEventManager().sendNotification(userId, {
  type: "comment",
  title: "新评论",
  message: "有人回复了你的评论",
  link: `/posts/${postSlug}#comment-${commentId}`,
});
```

## 功能特性

### 实时评论系统

- ✅ 实时同步评论（WebSocket）
- ✅ 显示谁正在输入
- ✅ 评论的 CRUD 操作
- ✅ Markdown 支持提示
- ✅ 编辑历史标记
- ✅ 登录后才能评论

### 在线用户显示

- ✅ 实时在线状态
- ✅ 1分钟内活跃判定
- ✅ 用户头像和名称
- ✅ 当前浏览页面
- ✅ 简单/详细两种模式
- ✅ 悬浮提示详情

### 通知中心

- ✅ 实时通知推送
- ✅ 未读计数徽章
- ✅ Toast 弹出提示
- ✅ 浏览器通知权限
- ✅ 通知分类图标
- ✅ 标记已读/删除

## 性能优化

### 1. 连接管理

- 单例模式复用 WebSocket 连接
- 自动重连机制（指数退避）
- 离线消息队列
- 心跳检测

### 2. 事件优化

- 防抖输入状态（1秒）
- 批量事件处理
- 优先级队列
- 内存泄漏防护

### 3. UI 优化

- 虚拟滚动（大量评论）
- 懒加载用户头像
- 动画性能优化
- 条件渲染

## 测试覆盖

已实现 `OnlineUsers` 组件的完整单元测试：

- ✅ 基础渲染测试
- ✅ 在线用户显示
- ✅ 头像和数量限制
- ✅ 离线用户过滤
- ✅ 悬浮提示交互
- ✅ 生命周期管理

## 配置选项

### RealtimeComments Props

```typescript
interface RealtimeCommentsProps {
  postId: string; // 文章 ID
  initialComments: Comment[]; // 初始评论列表
  onCommentAdded?: Function; // 评论添加回调
  onCommentUpdated?: Function; // 评论更新回调
  onCommentDeleted?: Function; // 评论删除回调
}
```

### OnlineUsers Props

```typescript
interface OnlineUsersProps {
  channelName?: string; // 频道名称
  showDetails?: boolean; // 显示详情模式
  maxDisplay?: number; // 最多显示数量
  className?: string; // 自定义样式
}
```

### NotificationCenter Props

```typescript
interface NotificationCenterProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  maxNotifications?: number; // 最多显示通知数
  autoHideDuration?: number; // 自动隐藏时间(ms)
}
```

## 注意事项

1. **认证要求**：大部分实时功能需要用户登录
2. **浏览器兼容**：需要支持 WebSocket 的现代浏览器
3. **网络状态**：实现了离线队列，但最好有网络状态提示
4. **性能考虑**：大量用户时考虑分页或虚拟滚动

## 后续优化

### 短期计划

1. 添加消息已读状态
2. 支持图片/文件上传
3. 表情回应功能
4. @提及功能

### 长期规划

1. 私信系统
2. 群组聊天
3. 视频通话集成
4. AI 助手集成

## 故障排除

### WebSocket 连接失败

```javascript
// 检查 Supabase 配置
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 检查网络状态
navigator.onLine; // 应该为 true
```

### 消息不同步

1. 检查频道订阅是否成功
2. 确认事件名称是否匹配
3. 查看浏览器控制台错误

### 性能问题

1. 减少同时订阅的频道数
2. 使用防抖/节流优化
3. 清理不用的事件监听器

## 总结

B3 实时交互前端实现了完整的实时功能，包括评论同步、在线状态、通知推送等核心特性。通过模块化设计和 Hook 封装，使得集成变得简单直观。配合后端的 WebSocket 服务，为用户提供了流畅的实时体验。

---

**负责人**：Terminal B  
**完成状态**：核心功能已完成  
**集成建议**：优先在评论系统和通知功能中应用
