# Vercel 部署配置完成报告

**更新日期**: 2025-01-08  
**负责人**: 终端B

## 一、配置概览

本次部署配置主要完成了以下任务：

1. 创建 vercel.json 配置文件
2. 实现健康检查 API
3. 配置全局错误处理
4. 实现内容重新验证 API
5. 更新环境变量配置

## 二、配置文件详情

### 2.1 vercel.json 配置

创建了 `vercel.json` 文件，包含以下配置：

```json
{
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": { "maxDuration": 30 },
    "app/**/*.tsx": { "maxDuration": 30 }
  },
  "crons": [
    {
      "path": "/api/revalidate",
      "schedule": "0 */6 * * *"  // 每6小时执行一次
    }
  ],
  "regions": ["sin1"],  // 新加坡区域，适合亚洲用户
  "headers": [...]      // 安全和缓存头配置
}
```

**主要特性**：

- 函数执行时间限制：30秒
- 定时任务：每6小时自动触发内容更新
- 区域部署：新加坡（可根据主要用户群体调整）
- 安全头：防止XSS、点击劫持等攻击
- 缓存策略：静态资源长期缓存，API不缓存

### 2.2 健康检查 API

**路径**: `/api/health`  
**文件**: `app/api/health/route.ts`

**功能特性**：

- 检查 Notion API 连接状态
- 验证环境变量配置
- 返回应用版本和运行时间
- 支持监控工具集成

**响应示例**：

```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T10:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "responseTime": 150,
  "checks": {
    "notion": {
      "status": "ok",
      "message": "Notion API connected successfully",
      "responseTime": 120
    },
    "environment": {
      "nodeVersion": "v18.17.0",
      "environment": "production",
      "hasNotionToken": true,
      "hasNotionDatabaseId": true
    }
  }
}
```

### 2.3 全局错误处理

**文件**: `app/error.tsx`

**功能特性**：

- 友好的错误页面展示
- 开发环境显示详细错误信息
- 支持错误重试
- 预留 Sentry 集成接口
- 响应式设计和深色模式支持

### 2.4 内容重新验证 API

**路径**: `/api/revalidate`  
**文件**: `app/api/revalidate/route.ts`

**功能特性**：

- Bearer Token 认证保护
- 支持三种重新验证模式：
  - `all`: 重新验证所有主要页面
  - `path`: 重新验证指定路径
  - `tag`: 重新验证指定标签
- 开发环境支持 GET 请求测试

**使用示例**：

```bash
# 重新验证所有内容
curl -X POST https://your-site.vercel.app/api/revalidate \
  -H "Authorization: Bearer your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'

# 重新验证特定路径
curl -X POST https://your-site.vercel.app/api/revalidate \
  -H "Authorization: Bearer your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"type": "path", "path": "/blog"}'
```

## 三、环境变量配置

### 3.1 新增环境变量

在 `.env.example` 中添加了以下配置：

1. **REVALIDATE_SECRET**
   - 用途：保护重新验证 API
   - 建议：使用强密码或 UUID
   - 示例：`uuid-v4-string-here`

2. **NEXT_PUBLIC_SENTRY_DSN**
   - 用途：Sentry 错误监控（可选）
   - 格式：Sentry 提供的 DSN 字符串
   - 示例：`https://xxx@xxx.ingest.sentry.io/xxx`

### 3.2 Vercel 环境变量设置

在 Vercel 控制台中需要配置以下环境变量：

**必需的**：

- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`
- `REVALIDATE_SECRET`

**推荐的**：

- `NOTION_PROJECTS_DB`
- `NOTION_BOOKS_DB`
- `NOTION_TOOLS_DB`
- `NEXT_PUBLIC_BASE_URL`

**可选的**：

- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `CACHE_TTL`

## 四、部署步骤

### 4.1 首次部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 触发部署

### 4.2 更新部署

1. 推送代码到主分支
2. Vercel 自动触发部署
3. 等待构建完成
4. 验证部署结果

### 4.3 手动触发内容更新

```bash
# 使用配置的密钥
export REVALIDATE_SECRET="your-secret-key"

# 触发全站更新
curl -X POST https://your-site.vercel.app/api/revalidate \
  -H "Authorization: Bearer $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'
```

## 五、监控和维护

### 5.1 健康检查监控

可以使用以下服务监控网站健康状态：

- Uptime Robot
- Pingdom
- Better Uptime

监控端点：`https://your-site.vercel.app/api/health`

### 5.2 错误监控

1. 注册 Sentry 账号
2. 创建新项目
3. 获取 DSN
4. 配置环境变量
5. 集成 Sentry SDK（后续任务）

### 5.3 性能监控

- Vercel Analytics（内置）
- Web Vitals 监控
- Lighthouse CI（可选）

## 六、安全建议

1. **API 密钥安全**
   - 使用强密码
   - 定期轮换
   - 不要在客户端暴露

2. **环境变量管理**
   - 使用 Vercel 的环境变量分组
   - 区分开发/预览/生产环境
   - 敏感信息加密存储

3. **访问控制**
   - 限制 API 访问频率
   - 监控异常请求
   - 及时更新依赖

## 七、故障排查

### 7.1 常见问题

**问题1：健康检查失败**

- 检查 Notion Token 是否正确
- 验证数据库 ID 是否有效
- 确认 Notion 集成权限

**问题2：重新验证不生效**

- 检查密钥是否正确
- 查看 Vercel 函数日志
- 确认 ISR 配置正确

**问题3：部署失败**

- 检查构建日志
- 验证环境变量
- 确认依赖版本兼容

### 7.2 日志查看

在 Vercel 控制台中查看：

1. Functions 标签页 - API 日志
2. Build Logs - 构建日志
3. Runtime Logs - 运行时日志

## 八、下一步优化

1. **集成 Sentry SDK**
   - 安装依赖
   - 配置初始化
   - 添加错误边界

2. **添加速率限制**
   - 保护 API 端点
   - 防止滥用

3. **实现 Webhook**
   - Notion 更新自动触发
   - GitHub 集成

4. **性能优化**
   - 添加 Redis 缓存
   - 优化图片加载
   - 实现预加载

---

**任务状态**: ✅ 已完成  
**测试状态**: 待测试  
**文档更新**: 2025-01-08
