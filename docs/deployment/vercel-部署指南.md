# Vercel 部署指南

> 更新：2025年1月11日  
> 前置条件：基础测试已通过

## 一、快速部署步骤

### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

### 3. 部署到预览环境

```bash
# 在项目根目录执行
vercel

# 按提示选择：
# - Set up and deploy? Y
# - Which scope? 选择您的账号
# - Link to existing project? N
# - What's your project's name? my-blog
# - In which directory is your code located? ./
# - Want to override the settings? N
```

### 4. 配置环境变量

#### 方式一：通过 CLI（推荐）

```bash
# 复制本地环境变量到 Vercel
vercel env pull .env.production.local

# 编辑 .env.production.local，确保包含所有必需变量
# 然后推送到 Vercel
vercel env push
```

#### 方式二：通过 Dashboard

1. 访问 https://vercel.com/dashboard
2. 选择您的项目
3. Settings → Environment Variables
4. 添加以下变量：

```env
# Notion 配置
NOTION_TOKEN=ntn_S73526150797bgCeqUOXSUW5ila0F0FDY8OhJqS4RwA0sj
NOTION_DATABASE_ID=21f1b640-00a7-808c-8b4f-c4ef924cfb64

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://xelyobfvfjqeuysfzpcf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...（您的anon key）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...（您的service key）

# 功能开关
NEXT_PUBLIC_REALTIME_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_MONITORING_ENABLED=true

# 其他配置
CACHE_TTL=3600000
NEXT_PUBLIC_REALTIME_HEARTBEAT_INTERVAL=30000
NEXT_PUBLIC_REALTIME_RECONNECT_DELAY=5000
NEXT_PUBLIC_ANALYTICS_BATCH_SIZE=10
NEXT_PUBLIC_ANALYTICS_FLUSH_INTERVAL=10000
NEXT_PUBLIC_MONITORING_SAMPLE_RATE=1.0
NEXT_PUBLIC_MONITORING_REPORT_INTERVAL=60000
```

### 5. 触发重新部署

```bash
# 环境变量设置后，触发新的部署
vercel --prod
```

## 二、验证部署

### 1. 检查部署状态

```bash
vercel ls
```

### 2. 访问预览URL

部署完成后，Vercel会提供一个URL，格式如：

- 预览：`https://my-blog-xxxxx.vercel.app`
- 生产：`https://my-blog.vercel.app`

### 3. 功能测试清单

#### 基础功能

- [ ] 首页加载正常
- [ ] 文章列表显示
- [ ] 文章详情页正常
- [ ] 图片加载正常

#### 用户系统

- [ ] 登录/注册功能
- [ ] 用户资料页
- [ ] 评论功能

#### 实时功能

- [ ] 评论实时更新
- [ ] 在线用户显示
- [ ] 通知推送

#### 数据分析

- [ ] 页面浏览统计
- [ ] 热门内容展示

#### 性能监控

- [ ] Web Vitals收集
- [ ] 性能指标显示

## 三、性能优化

### 1. 启用 Edge Functions

```json
// vercel.json
{
  "functions": {
    "app/api/*/route.ts": {
      "runtime": "edge"
    }
  }
}
```

### 2. 配置缓存

```json
// next.config.ts
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=31536000, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### 3. 启用图片优化

Vercel 自动优化 Next.js Image 组件，无需额外配置。

## 四、监控与告警

### 1. Vercel Analytics

在 Dashboard 中启用：

- Web Analytics
- Real Experience Score
- Speed Insights

### 2. Supabase 监控

- Database → Monitoring
- 查看实时连接数
- 监控查询性能

### 3. 自定义告警

通过我们的监控系统：

- LCP > 4秒告警
- API错误率 > 5%告警
- 内存使用 > 85%告警

## 五、故障排查

### 常见问题

#### 1. 环境变量未生效

- 确保在 Vercel Dashboard 中正确设置
- 检查变量名是否完全一致
- 重新部署：`vercel --prod --force`

#### 2. 数据库连接失败

- 检查 Supabase URL 和密钥
- 确保 Supabase 项目处于活跃状态
- 检查 RLS 策略是否正确

#### 3. 实时功能不工作

- 确保 NEXT_PUBLIC_REALTIME_ENABLED=true
- 检查 WebSocket 连接
- 查看浏览器控制台错误

### 调试命令

```bash
# 查看部署日志
vercel logs

# 查看函数日志
vercel functions logs

# 本地模拟生产环境
vercel dev
```

## 六、生产环境配置

### 1. 自定义域名

```bash
vercel domains add yourdomain.com
```

### 2. SSL证书

Vercel 自动提供 Let's Encrypt SSL证书。

### 3. 环境分离

- Development：本地开发
- Preview：每次PR自动部署
- Production：主分支自动部署

## 七、回滚方案

如需回滚：

```bash
# 列出所有部署
vercel ls

# 回滚到指定版本
vercel rollback [deployment-url]

# 或在 Dashboard 中一键回滚
```

---

**准备就绪**：按照以上步骤即可完成部署！
