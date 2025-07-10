# 生产环境部署检查清单

## 部署前准备

### 1. 环境变量配置 ⚠️ 关键

- [ ] 复制 `.env.production.example` 为 `.env.production.local`
- [ ] 配置所有必需的环境变量
- [ ] 验证 Supabase URL 和密钥
- [ ] 验证 Notion Token 和数据库ID
- [ ] 配置 Algolia 搜索（如果启用）
- [ ] 设置正确的 NEXT_PUBLIC_SITE_URL

### 2. 数据库迁移

- [ ] 执行用户系统迁移
  ```sql
  -- 执行顺序很重要
  scripts/supabase-migration.sql
  ```
- [ ] 执行实时功能迁移
  ```sql
  scripts/supabase-realtime-setup.sql
  ```
- [ ] 执行分析系统迁移
  ```sql
  scripts/supabase-migration-analytics.sql
  ```
- [ ] 执行监控系统迁移
  ```sql
  scripts/supabase-migration-monitoring.sql
  ```
- [ ] 执行推荐系统迁移
  ```sql
  scripts/supabase-migration-recommendation.sql
  ```

### 3. Supabase 配置

- [ ] 启用 Realtime 功能
  - 在 Supabase Dashboard > Database > Replication
  - 为以下表启用实时功能：
    - `comments`
    - `notifications`
    - `analytics_events`（可选）
- [ ] 配置 RLS 策略
  - 验证所有表的 RLS 已启用
  - 测试权限是否正确
- [ ] 配置存储桶（如需要）
  - 创建 `avatars` 桶
  - 创建 `post-images` 桶
  - 设置正确的 CORS 策略

### 4. 构建验证

- [ ] 本地生产构建测试
  ```bash
  npm run build
  npm run start
  ```
- [ ] 检查构建输出大小
- [ ] 验证静态页面生成
- [ ] 测试动态路由

## 部署步骤

### 1. Vercel 部署配置

#### 环境变量设置

在 Vercel Dashboard > Settings > Environment Variables 中添加：

**必需变量：**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`

**可选变量：**

- `NEXT_PUBLIC_ALGOLIA_APP_ID`
- `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY`
- `ALGOLIA_ADMIN_API_KEY`
- `SENTRY_DSN`
- `SLACK_WEBHOOK_URL`

#### 构建设置

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

#### 函数配置

在 `vercel.json` 中：

```json
{
  "functions": {
    "app/api/monitoring/metrics/route.ts": {
      "maxDuration": 30
    },
    "app/api/analytics/export/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### 2. 域名配置

- [ ] 在 Vercel 中配置自定义域名
- [ ] 配置 SSL 证书（Vercel 自动处理）
- [ ] 更新 DNS 记录
- [ ] 配置 www 重定向

### 3. 性能优化

- [ ] 启用 Vercel Edge Network
- [ ] 配置图片优化
- [ ] 设置缓存头
- [ ] 启用 Brotli 压缩

## 部署后验证

### 1. 功能测试 ✅

- [ ] 首页加载正常
- [ ] 文章详情页正常
- [ ] 用户登录/注册功能
- [ ] 评论功能
- [ ] 点赞/收藏功能
- [ ] 搜索功能（如果配置）
- [ ] 实时通知
- [ ] 数据分析记录
- [ ] 推荐系统

### 2. 性能测试 🚀

- [ ] 使用 Lighthouse 测试
  - Performance > 90
  - Accessibility > 95
  - Best Practices > 95
  - SEO > 95
- [ ] 测试 Core Web Vitals
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] 测试不同设备和网络条件

### 3. 监控验证 📊

- [ ] 性能监控数据收集
- [ ] 错误日志记录
- [ ] 用户行为追踪
- [ ] 告警通知测试

### 4. 安全检查 🔒

- [ ] HTTPS 正确配置
- [ ] 环境变量不暴露
- [ ] API 端点权限验证
- [ ] CORS 配置正确
- [ ] CSP 头部设置

## 回滚计划

### 准备工作

1. 记录当前版本的 Git commit hash
2. 备份数据库（如有重要数据）
3. 保存当前环境变量配置

### 回滚步骤

1. 在 Vercel Dashboard 中选择之前的部署
2. 点击 "Promote to Production"
3. 验证回滚成功

## 监控和告警

### 1. 设置监控

- [ ] Vercel Analytics
- [ ] 自定义性能监控
- [ ] 错误追踪（Sentry）
- [ ] 正常运行时间监控

### 2. 配置告警

- [ ] API 错误率 > 5%
- [ ] 响应时间 > 3秒
- [ ] 内存使用 > 85%
- [ ] 数据库连接失败

### 3. 定期检查

- [ ] 每日查看性能报告
- [ ] 每周检查错误日志
- [ ] 每月进行性能优化

## 故障排除

### 常见问题

#### 1. 构建失败

- 检查环境变量是否完整
- 查看构建日志
- 验证依赖版本

#### 2. 数据库连接失败

- 验证 Supabase URL
- 检查网络连接
- 确认 RLS 策略

#### 3. 性能问题

- 检查 API 响应时间
- 优化数据库查询
- 启用缓存

#### 4. 实时功能不工作

- 验证 Realtime 已启用
- 检查 WebSocket 连接
- 查看浏览器控制台

## 联系支持

如遇到问题：

1. 查看 Vercel 部署日志
2. 检查 Supabase 日志
3. 查看应用错误日志
4. 联系技术支持

---

**最后更新**：2025年1月11日  
**负责人**：终端A
