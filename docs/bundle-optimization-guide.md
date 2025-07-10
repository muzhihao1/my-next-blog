# Bundle优化指南

**创建日期**：2025年1月10日  
**负责人**：终端A  
**任务编号**：B3.1（协助）

## 一、准备工作

### 1. 安装Bundle Analyzer

```bash
npm install --save-dev @next/bundle-analyzer
# 或
yarn add -D @next/bundle-analyzer
```

### 2. 运行分析

```bash
# 使用我们创建的脚本
node scripts/analyze-bundle.js

# 或手动运行
ANALYZE=true npm run build
```

## 二、Bundle优化策略

### 1. 代码分割优化

#### 动态导入大型组件

```typescript
// ❌ 不好的做法
import HeavyComponent from '@/components/HeavyComponent'

// ✅ 推荐做法
import dynamic from 'next/dynamic'
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>加载中...</div>,
  ssr: false // 如果不需要SSR
})
```

#### 路由级别代码分割

Next.js已自动处理，但可以进一步优化：

```typescript
// 对于大型页面组件，使用动态导入
const ComplexPage = dynamic(() => import("./ComplexPage"));
```

### 2. 依赖优化

#### 按需导入

```typescript
// ❌ 导入整个库
import _ from "lodash";

// ✅ 只导入需要的函数
import debounce from "lodash/debounce";
// 或
import { debounce } from "lodash-es";
```

#### 使用轻量替代品

| 原始库            | 轻量替代                 | 大小对比 |
| ----------------- | ------------------------ | -------- |
| moment.js (280KB) | date-fns (75KB)          | -73%     |
| lodash (71KB)     | lodash-es + tree-shaking | -80%     |
| axios (53KB)      | native fetch             | -100%    |

### 3. 图片优化

#### 使用Next.js Image组件

```typescript
import Image from 'next/image'

// 自动优化
<Image
  src="/large-image.jpg"
  alt="Description"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

#### 响应式图片

```typescript
<Image
  src="/hero.jpg"
  alt="Hero"
  sizes="(max-width: 768px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
  fill
/>
```

### 4. 字体优化

#### 使用next/font

```typescript
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // 防止FOIT
  preload: true,
  fallback: ["system-ui", "arial"],
});
```

### 5. React优化

#### 使用React.memo

```typescript
// 对于纯展示组件
export default React.memo(ExpensiveComponent);

// 自定义比较函数
export default React.memo(Component, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
```

#### 使用useMemo和useCallback

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

## 三、具体优化建议

### 1. 评论系统优化

```typescript
// 延迟加载评论组件
const CommentSection = dynamic(
  () => import('@/components/comments/CommentSection'),
  {
    loading: () => <CommentSkeleton />,
    ssr: false
  }
)

// 使用Intersection Observer延迟加载
const [shouldLoadComments, setShouldLoadComments] = useState(false)

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoadComments(true)
      }
    },
    { threshold: 0.1 }
  )

  const target = document.querySelector('#comments-trigger')
  if (target) observer.observe(target)

  return () => observer.disconnect()
}, [])
```

### 2. Syntax Highlighter优化

```typescript
// 按需加载语言支持
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import ts from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("typescript", ts);
```

### 3. Supabase SDK优化

```typescript
// 创建单例实例
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

// 按需导入功能
const { auth } = getSupabaseClient();
```

## 四、监控和度量

### 1. Core Web Vitals监控

```typescript
// 在 _app.tsx 中添加
export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (metric.label === "web-vital") {
    console.log(metric); // 发送到分析服务
  }
}
```

### 2. Bundle大小预算

在 `package.json` 中设置：

```json
{
  "bundlesize": [
    {
      "path": ".next/static/chunks/main-*.js",
      "maxSize": "50 kB"
    },
    {
      "path": ".next/static/chunks/commons-*.js",
      "maxSize": "100 kB"
    }
  ]
}
```

### 3. Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      http://localhost:3000
      http://localhost:3000/posts/sample
    budgetPath: ./lighthouse-budget.json
```

## 五、Webpack配置优化

### 1. 压缩优化

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimize = true;
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ["console.log"],
            },
          },
        }),
      );
    }
    return config;
  },
};
```

### 2. 模块解析优化

```javascript
config.resolve.alias = {
  ...config.resolve.alias,
  // 避免重复打包
  react: path.resolve("./node_modules/react"),
  "react-dom": path.resolve("./node_modules/react-dom"),
};
```

## 六、检查清单

### 初始优化

- [ ] 安装并运行bundle analyzer
- [ ] 识别最大的依赖包
- [ ] 检查重复的依赖
- [ ] 审查未使用的导入

### 代码层面

- [ ] 实现动态导入
- [ ] 优化图片加载
- [ ] 配置字体优化
- [ ] 添加React优化

### 构建配置

- [ ] 配置webpack优化
- [ ] 设置bundle预算
- [ ] 启用压缩

### 监控

- [ ] 设置性能监控
- [ ] 配置CI检查
- [ ] 定期审查bundle大小

## 七、预期效果

### 优化前（估计）

- Main bundle: ~200KB
- Vendor bundle: ~300KB
- 总大小: ~500KB

### 优化后（目标）

- Main bundle: ~80KB (-60%)
- Vendor chunks: ~200KB (-33%)
- 总大小: ~280KB (-44%)

### 性能提升

- First Load JS: -40%
- LCP: -30%
- TTI: -25%

## 八、注意事项

1. **渐进式优化**：不要一次性改动太多，逐步优化并测试
2. **功能优先**：确保优化不影响功能
3. **持续监控**：优化后要持续监控性能
4. **文档记录**：记录每次优化的效果

## 九、后续建议

### 短期（1周）

1. 完成基础bundle分析
2. 实施动态导入
3. 优化大型依赖

### 中期（2周）

1. 实现高级代码分割
2. 配置CDN
3. 优化构建流程

### 长期（1月）

1. 建立性能基准
2. 自动化性能测试
3. 持续优化迭代

---

**相关资源**：

- [Next.js优化文档](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev性能指南](https://web.dev/performance/)
- [Bundle Phobia](https://bundlephobia.com/) - 检查npm包大小
