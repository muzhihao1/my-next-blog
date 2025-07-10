# 生产环境部署指南

本指南将帮助您将博客系统部署到生产环境。

## 目录

1. [准备工作](#准备工作)
2. [环境配置](#环境配置)
3. [数据库迁移](#数据库迁移)
4. [Vercel 部署](#vercel-部署)
5. [部署后配置](#部署后配置)
6. [监控和维护](#监控和维护)
7. [故障排除](#故障排除)

## 准备工作

### 必需账号

1. **Supabase 账号**
   - 创建新项目或使用现有项目
   - 获取项目 URL 和密钥

2. **Notion 账号**
   - 创建集成 (Integration)
   - 获取数据库 ID

3. **Vercel 账号**
   - 连接 GitHub 仓库
   - 准备部署

4. **Algolia 账号**（可选）
   - 创建应用和索引
   - 获取 API 密钥

### 本地测试

在部署前，确保本地测试通过：

```bash
# 安装依赖
npm install

# 类型检查
npm run type-check

# 构建测试
npm run build

# 本地生产环境测试
npm run start
```

## 环境配置

### 1. 复制环境变量模板

```bash
cp .env.production.example .env.production.local
```

### 2. 配置必需的环境变量

编辑 `.env.production.local`：

```env
# Supabase (必需)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Notion (必需)
NOTION_TOKEN=your-notion-integration-token
NOTION_DATABASE_ID=your-notion-database-id

# 站点配置 (必需)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3. 配置可选服务

```env
# Algolia 搜索
NEXT_PUBLIC_ALGOLIA_APP_ID=your-app-id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your-search-key
ALGOLIA_ADMIN_API_KEY=your-admin-key

# 监控告警
SLACK_WEBHOOK_URL=your-slack-webhook
SENTRY_DSN=your-sentry-dsn
```

## 数据库迁移

### 1. 设置数据库连接

```bash
export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres'
```

### 2. 执行迁移脚本

```bash
# 使用自动化脚本
./scripts/migrate-database.sh

# 或手动执行每个迁移
psql $SUPABASE_DB_URL -f scripts/supabase-migration.sql
psql $SUPABASE_DB_URL -f scripts/supabase-realtime-setup.sql
psql $SUPABASE_DB_URL -f scripts/supabase-migration-analytics.sql
psql $SUPABASE_DB_URL -f scripts/supabase-migration-monitoring.sql
psql $SUPABASE_DB_URL -f scripts/supabase-migration-recommendation.sql
```

### 3. 配置 Supabase

在 Supabase Dashboard 中：

1. **启用 Realtime**
   - Database → Replication
   - 启用以下表：`comments`, `notifications`

2. **验证 RLS 策略**
   - 检查所有表的 RLS 已启用
   - 测试权限配置

3. **创建存储桶**（如需要）
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('avatars', 'avatars', true);
   ```

## Vercel 部署

### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

### 2. 使用部署脚本

```bash
# 执行自动化部署
./scripts/deploy-vercel.sh
```

### 3. 手动部署步骤

如果使用 Vercel Dashboard：

1. **连接 GitHub 仓库**
   - Import Git Repository
   - 选择您的仓库

2. **配置环境变量**
   - 在 Settings → Environment Variables
   - 添加所有必需的环境变量

3. **部署设置**

   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install"
   }
   ```

4. **区域选择**
   - 选择靠近目标用户的区域
   - 推荐：Hong Kong, Singapore, Sydney

### 4. 自定义域名

1. 在 Vercel Dashboard → Domains
2. 添加您的域名
3. 配置 DNS 记录：
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

## 部署后配置

### 1. 验证部署

使用提供的健康检查端点：

```bash
# 检查应用状态
curl https://your-domain.com/api/health

# 简单健康检查
curl -I https://your-domain.com/api/health
```

### 2. 功能测试清单

- [ ] 首页加载正常
- [ ] 文章详情页正常
- [ ] 用户注册/登录
- [ ] 评论功能
- [ ] 点赞/收藏
- [ ] 搜索功能（如配置）
- [ ] 实时通知
- [ ] 数据统计
- [ ] 推荐系统

### 3. 性能优化

1. **启用 Vercel 优化**
   - Edge Network
   - Image Optimization
   - Analytics

2. **监控 Core Web Vitals**
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

## 监控和维护

### 1. 设置监控

**Vercel Analytics**

- 自动启用
- 查看实时性能数据

**自定义监控**

- 访问 `/api/monitoring/metrics`
- 查看性能报告

**错误追踪**

```env
SENTRY_DSN=your-sentry-dsn
```

### 2. 定期维护任务

**每日**

- 检查健康状态端点
- 查看错误日志
- 监控性能指标

**每周**

- 审查性能报告
- 检查数据库大小
- 更新依赖（如需要）

**每月**

- 清理旧数据
- 优化数据库索引
- 安全审计

### 3. 数据备份

配置自动备份：

```bash
# Supabase 自动备份
# Dashboard → Settings → Backups

# 手动备份重要数据
pg_dump $SUPABASE_DB_URL > backup-$(date +%Y%m%d).sql
```

## 故障排除

### 常见问题

#### 构建失败

```bash
# 检查错误日志
vercel logs

# 常见原因：
# - 环境变量缺失
# - TypeScript 错误
# - 依赖版本冲突
```

#### 数据库连接错误

```javascript
// 检查连接字符串
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);

// 验证 RLS 策略
// Supabase Dashboard → Authentication → Policies
```

#### 性能问题

```bash
# 使用 Lighthouse 分析
lighthouse https://your-domain.com

# 检查 API 响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/api/posts
```

#### 实时功能不工作

1. 检查 Realtime 是否启用
2. 验证 WebSocket 连接
3. 查看浏览器控制台错误

### 回滚流程

如果出现严重问题：

1. **Vercel 回滚**
   - Dashboard → Deployments
   - 选择之前的部署
   - "Promote to Production"

2. **数据库回滚**
   ```bash
   # 从备份恢复
   psql $SUPABASE_DB_URL < backup-20250111.sql
   ```

### 获取帮助

1. **查看日志**
   - Vercel 函数日志
   - Supabase 日志
   - 浏览器控制台

2. **调试模式**

   ```env
   # 临时启用详细日志
   LOG_LEVEL=debug
   ```

3. **社区支持**
   - Vercel Discord
   - Supabase Discord
   - Next.js GitHub Discussions

## 安全检查清单

- [ ] 所有环境变量已正确设置
- [ ] 敏感信息未暴露在客户端
- [ ] HTTPS 已启用
- [ ] CORS 配置正确
- [ ] RLS 策略已启用
- [ ] API 端点有适当的权限控制
- [ ] 定期更新依赖项

## 性能优化建议

1. **图片优化**
   - 使用 Next.js Image 组件
   - 配置适当的图片格式
   - 启用懒加载

2. **缓存策略**
   - 静态资源长期缓存
   - API 响应适当缓存
   - 使用 ISR 提升性能

3. **代码分割**
   - 动态导入大型组件
   - 路由级别代码分割
   - 优化首屏加载

4. **数据库优化**
   - 添加适当的索引
   - 使用连接池
   - 优化查询性能

---

**最后更新**：2025年1月11日  
**维护者**：终端A

如有问题，请参考 [生产环境部署检查清单](./production-checklist.md) 获取详细的检查项目。
