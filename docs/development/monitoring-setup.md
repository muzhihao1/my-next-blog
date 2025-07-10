# 监控系统配置指南

## 概述

本博客集成了 Google Analytics 4 和 Sentry，提供完整的用户行为分析和错误监控功能。

## Google Analytics 4 配置

### 1. 创建 GA4 账号

1. 访问 [Google Analytics](https://analytics.google.com)
2. 点击"开始测量"
3. 设置账号信息：
   - 账号名称：您的名称或公司名
   - 数据共享设置：根据需要选择
4. 设置媒体资源：
   - 媒体资源名称：博客名称
   - 时区：选择您所在的时区
   - 货币：选择货币类型

### 2. 创建数据流

1. 选择平台：网站
2. 输入网站信息：
   - 网站网址：https://yourdomain.com
   - 数据流名称：博客主站
3. 获取测量 ID（格式：G-XXXXXXXXXX）

### 3. 配置环境变量

在 `.env.local` 中添加：

```env
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. 集成到项目

GA 组件已创建在 `/components/analytics/GoogleAnalytics.tsx`。在 `app/layout.tsx` 中添加：

```tsx
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
```

### 5. 事件跟踪

使用预定义的事件函数：

```tsx
import { analyticsEvents } from "@/components/analytics/GoogleAnalytics";

// 跟踪文章浏览
analyticsEvents.viewArticle(post.title);

// 跟踪搜索
analyticsEvents.useSearch(query);

// 跟踪订阅
analyticsEvents.subscribeSuccess();
```

### 6. 自定义事件

创建自定义事件：

```tsx
import { trackEvent } from "@/components/analytics/GoogleAnalytics";

trackEvent("custom_action", "category", "label", value);
```

### 7. 调试模式

使用 GA4 调试器：

1. 安装 [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) 扩展
2. 在控制台查看事件

## Sentry 错误监控配置

### 1. 创建 Sentry 项目

1. 访问 [Sentry](https://sentry.io)
2. 注册或登录账号
3. 创建新项目：
   - 平台：Browser JavaScript
   - 项目名称：my-blog
   - 团队：选择或创建团队

### 2. 获取 DSN

在项目设置中找到 DSN（格式：https://xxx@xxx.ingest.sentry.io/xxx）

### 3. 配置环境变量

在 `.env.local` 中添加：

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_VERCEL_ENV=production
```

### 4. 初始化 Sentry

在 `app/layout.tsx` 或客户端组件中：

```tsx
"use client";

import { useEffect } from "react";
import { initSentry } from "@/lib/monitoring/sentry";

export default function ClientLayout({ children }) {
  useEffect(() => {
    initSentry();
  }, []);

  return <>{children}</>;
}
```

### 5. 错误边界

创建错误边界组件：

```tsx
"use client";

import { Component, ReactNode } from "react";
import { reportError } from "@/lib/monitoring/sentry";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-fallback">
            <h2>出错了</h2>
            <p>页面遇到了一些问题，请刷新重试。</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### 6. 性能监控

在 `app/layout.tsx` 中添加：

```tsx
export function reportWebVitals(metric: any) {
  // 发送到 GA
  analyticsEvents.reportWebVitals(metric);

  // 发送到 Sentry
  reportWebVitals(metric);
}
```

## 数据分析最佳实践

### 1. 关键指标

**用户行为**

- 页面浏览量（PV）
- 独立访客（UV）
- 跳出率
- 平均停留时间
- 用户流程

**内容表现**

- 热门文章
- 阅读完成率
- 分享率
- 评论参与度

**技术指标**

- 页面加载时间
- Core Web Vitals
- 错误率
- API 响应时间

### 2. 自定义报告

在 GA4 中创建自定义报告：

1. 进入"探索"
2. 创建新探索
3. 添加维度和指标
4. 设置过滤器和细分

### 3. 实时监控

设置实时告警：

- Sentry：错误率突增
- GA4：流量异常
- 性能：加载时间过长

## 隐私合规

### 1. Cookie 同意

实现 Cookie 同意横幅：

```tsx
export function CookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cookie-consent");
    if (saved) {
      setConsent(saved === "true");
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setConsent(true);
    // 启用 GA
    window.gtag("consent", "update", {
      analytics_storage: "granted",
    });
  };

  if (consent !== null) return null;

  return (
    <div className="cookie-banner">
      <p>我们使用 Cookie 来改善您的浏览体验。</p>
      <button onClick={handleAccept}>接受</button>
      <button onClick={() => setConsent(false)}>拒绝</button>
    </div>
  );
}
```

### 2. 数据匿名化

GA4 配置：

```javascript
gtag("config", "GA_MEASUREMENT_ID", {
  anonymize_ip: true,
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
});
```

### 3. 用户权利

提供数据删除选项：

- GA4：用户可以通过浏览器设置禁用
- Sentry：提供用户标识删除接口

## 性能优化

### 1. 延迟加载

仅在用户同意后加载分析脚本：

```tsx
const loadAnalytics = () => {
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);
};
```

### 2. 批量发送

减少网络请求：

```javascript
// 批量发送事件
const eventQueue = [];
const flushEvents = debounce(() => {
  eventQueue.forEach((event) => trackEvent(...event));
  eventQueue.length = 0;
}, 1000);
```

### 3. 采样率

对于高流量网站：

```javascript
// Sentry 采样
tracesSampleRate: (0.1, // 10% 采样
  // GA 采样
  gtag("config", "GA_ID", {
    sample_rate: 10, // 10% 采样
  }));
```

## 故障排除

### GA4 常见问题

1. **事件未显示**
   - 检查测量 ID
   - 使用调试模式
   - 等待 24-48 小时

2. **数据不准确**
   - 检查时区设置
   - 排除内部流量
   - 验证事件参数

### Sentry 常见问题

1. **错误未上报**
   - 检查 DSN 配置
   - 确认生产环境
   - 查看浏览器控制台

2. **源码映射**
   - 上传 source maps
   - 配置 release 版本

## 定期维护

### 每周任务

- 检查错误趋势
- 分析用户行为
- 优化慢速页面

### 每月任务

- 生成分析报告
- 更新监控规则
- 清理无用数据

### 每季度任务

- 审查隐私政策
- 更新监控策略
- 性能基准测试

---

_最后更新：2025-01-07_
