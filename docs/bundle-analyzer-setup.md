# Bundle Analyzer 安装和使用指南

**创建日期**：2025年1月10日  
**任务**：协助B3.1 Bundle优化

## 快速开始

### 1. 安装依赖

```bash
npm install --save-dev @next/bundle-analyzer
```

### 2. 运行分析

```bash
# 使用预设脚本（推荐）
npm run analyze

# 或手动运行
npm run build:analyze
```

### 3. 查看结果

分析完成后，会自动在浏览器中打开交互式报告：

- **客户端包分析**：.next/analyze/client.html
- **服务端包分析**：.next/analyze/server.html

## 已创建的文件

### 1. Bundle分析配置

**文件**：`next.config.bundle.js`

- 包含webpack优化配置
- 代码分割策略
- Tree shaking配置

### 2. 分析脚本

**文件**：`scripts/analyze-bundle.js`

- 自动备份和恢复配置
- 生成分析报告
- 提供优化建议

### 3. 优化组件示例

#### 懒加载评论组件

**文件**：`components/comments/LazyCommentSection.tsx`

- 使用Intersection Observer
- 按需加载评论
- 提供骨架屏

#### 优化的代码块组件

**文件**：`components/ui/OptimizedCodeBlock.tsx`

- 按需加载语言支持
- 减少初始bundle大小
- 提供简化版本选项

## 使用优化组件

### 1. 替换评论组件

```typescript
// 原来的做法
import { CommentSection } from '@/components/comments/CommentSection'

// 优化后
import { LazyCommentSection } from '@/components/comments/LazyCommentSection'

// 使用
<LazyCommentSection
  contentId={post.id}
  contentType="post"
  threshold={0.1} // 可见10%时开始加载
  rootMargin="100px" // 提前100px加载
/>
```

### 2. 使用优化的代码块

```typescript
// 原来的做法
import SyntaxHighlighter from 'react-syntax-highlighter'

// 优化后
import { OptimizedCodeBlock } from '@/components/ui/OptimizedCodeBlock'

// 使用
<OptimizedCodeBlock
  code={codeString}
  language="javascript"
  showLineNumbers={true}
/>

// 预加载常用语言（在app启动时）
import { preloadCommonLanguages } from '@/components/ui/OptimizedCodeBlock'
preloadCommonLanguages()
```

## 优化检查项

### 立即可做

- [ ] 安装@next/bundle-analyzer
- [ ] 运行首次分析
- [ ] 识别最大的包

### 代码优化

- [ ] 替换为LazyCommentSection
- [ ] 使用OptimizedCodeBlock
- [ ] 实施其他动态导入

### 配置优化

- [ ] 使用优化的next.config.js
- [ ] 启用webpack优化
- [ ] 配置代码分割

## 常见问题

### Q: 分析报告打不开？

A: 确保构建完成，检查 .next/analyze/ 目录是否存在

### Q: bundle大小没有减少？

A:

1. 确认使用了生产构建：`NODE_ENV=production`
2. 检查是否正确实施了代码分割
3. 验证tree shaking是否生效

### Q: 如何判断优化效果？

A:

1. 对比优化前后的bundle大小
2. 使用Lighthouse测试性能分数
3. 监控Core Web Vitals指标

## 下一步

1. **运行分析**：先了解当前状况
2. **实施优化**：根据分析结果优化
3. **持续监控**：建立性能基准线

---

需要帮助？查看完整的[Bundle优化指南](./bundle-optimization-guide.md)
