# UI 动画系统使用指南

本指南介绍如何使用博客的 UI 动画系统，让您的界面更加生动流畅。

## 目录

1. [快速开始](#快速开始)
2. [动画组件](#动画组件)
3. [动画 Hooks](#动画-hooks)
4. [性能优化](#性能优化)
5. [最佳实践](#最佳实践)

## 快速开始

### 安装依赖

动画系统基于 Framer Motion 构建：

```bash
npm install framer-motion
```

### 基础使用

```tsx
import { AnimatedContainer, AnimatedText } from "@/lib/animation";

export function MyComponent() {
  return (
    <AnimatedContainer animation="fadeInUp">
      <AnimatedText type="typewriter">欢迎来到我的博客！</AnimatedText>
    </AnimatedContainer>
  );
}
```

## 动画组件

### 1. AnimatedContainer - 通用动画容器

```tsx
<AnimatedContainer
  animation="fadeInUp" // 动画类型
  delay={0.2} // 延迟时间
  threshold={0.1} // 触发阈值
  triggerOnce={true} // 只触发一次
>
  {children}
</AnimatedContainer>
```

支持的动画类型：

- `fadeIn` - 淡入
- `fadeInUp` - 从下往上淡入
- `scaleIn` - 缩放淡入
- `slideLeft/Right/Up/Down` - 滑入

### 2. AnimatedText - 文本动画

```tsx
<AnimatedText
  type="typewriter" // 动画类型
  delay={0.5} // 延迟时间
  as="h1" // HTML 标签
>
  动画文本内容
</AnimatedText>
```

支持的动画类型：

- `fadeIn` - 简单淡入
- `typewriter` - 打字机效果
- `wordByWord` - 逐词显示
- `letterByLetter` - 逐字母显示

### 3. AnimatedButton - 按钮动画

```tsx
<AnimatedButton
  variant="ripple" // 动画变体
  onClick={handleClick}
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  点击我
</AnimatedButton>
```

支持的变体：

- `scale` - 缩放效果
- `glow` - 发光效果
- `slide` - 滑动背景
- `ripple` - 涟漪效果

### 4. AnimatedCard - 卡片动画

```tsx
<AnimatedCard
  variant="tilt" // 动画变体
  className="p-4 bg-white rounded-lg shadow"
>
  <h3>卡片标题</h3>
  <p>卡片内容</p>
</AnimatedCard>
```

支持的变体：

- `lift` - 悬浮效果
- `tilt` - 倾斜效果
- `glow` - 发光效果
- `morph` - 变形效果

### 5. PageTransition - 页面过渡

```tsx
// 在 layout.tsx 中使用
<PageTransition>
  {children}
</PageTransition>

// 或使用特定类型
<TypedPageTransition type="slide">
  {children}
</TypedPageTransition>
```

### 6. Skeleton - 骨架屏

```tsx
// 基础骨架屏
<Skeleton variant="text" width="80%" />
<Skeleton variant="circular" size={40} />
<Skeleton variant="rectangular" height={200} />

// 预设组合
<SkeletonCard />
<SkeletonListItem />
```

### 7. LoadingSpinner - 加载动画

```tsx
// 基础加载器
<LoadingSpinner size="md" variant="spin" />

// 全屏加载遮罩
<LoadingOverlay isLoading={isLoading} text="加载中..." />
```

### 8. ProgressBar - 进度条

```tsx
// 线性进度条
<ProgressBar value={75} variant="gradient" showLabel />

// 圆形进度条
<CircularProgress value={60} size={120} />

// 步骤进度条
<StepProgress currentStep={2} totalSteps={4} />
```

### 9. ScrollProgress - 滚动进度

```tsx
// 页面顶部进度条
<ScrollProgress position="top" color="bg-blue-500" />

// 阅读进度环
<ReadingProgressRing />

// 章节进度指示器
<SectionProgress sections={[
  { id: 'intro', title: '介绍' },
  { id: 'content', title: '内容' },
]} />
```

## 动画 Hooks

### 1. useScrollAnimation - 滚动触发动画

```tsx
function MyComponent() {
  const { ref, controls } = useScrollAnimation(0.1, true);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={fadeInVariants}
    >
      滚动时显示的内容
    </motion.div>
  );
}
```

### 2. useReducedMotionPreference - 检测减少动画偏好

```tsx
function MyComponent() {
  const { shouldReduceMotion, toggleReducedMotion } =
    useReducedMotionPreference();

  if (shouldReduceMotion) {
    return <div>静态内容</div>;
  }

  return <AnimatedContainer>动画内容</AnimatedContainer>;
}
```

### 3. useParallax - 视差滚动

```tsx
function ParallaxImage() {
  const offset = useParallax(0.5);

  return <motion.img style={{ y: offset }} src="/image.jpg" />;
}
```

### 4. usePageLoadAnimation - 页面加载动画

```tsx
function Page() {
  const { controls, isLoaded } = usePageLoadAnimation();

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0 }}
      variants={pageEnterVariants}
    >
      页面内容
    </motion.div>
  );
}
```

## 性能优化

### 1. 减少动画设置

系统会自动检测用户的减少动画偏好：

```tsx
// 在组件中
const { shouldReduceMotion } = useReducedMotionPreference();

// 全局配置
animationConfig.respectReducedMotion = true;
```

### 2. 性能监控

```tsx
// 获取性能优化配置
const config = getDeviceOptimizedConfig();

// 使用防抖动画
const debouncedAnimate = debounceAnimation(animate, 300);

// 使用节流动画
const throttledScroll = throttleAnimation(handleScroll, 100);
```

### 3. 动画队列

```tsx
const queue = new AnimationQueue();

// 添加动画到队列
queue.add(async () => {
  await animateElement1();
});
queue.add(async () => {
  await animateElement2();
});
```

### 4. GPU 加速

所有动画组件都已优化 GPU 加速：

```tsx
// 自动应用
transform: translateZ(0)
will-change: transform
```

## 最佳实践

### 1. 合理使用动画

- ✅ 关键交互使用动画增强体验
- ✅ 保持动画简洁快速（通常 200-300ms）
- ❌ 避免过度使用动画
- ❌ 避免同时触发大量动画

### 2. 响应式动画

```tsx
// 使用响应式动画配置
const animConfig = useResponsiveAnimation()

<motion.div
  animate={{ x: 0 }}
  transition={{ duration: animConfig.duration }}
/>
```

### 3. 可访问性

- 始终提供非动画替代方案
- 遵循 WCAG 动画指南
- 提供暂停/停止动画的选项

### 4. 测试动画

```tsx
// 在测试环境禁用动画
if (process.env.NODE_ENV === "test") {
  animationConfig.enabled = false;
}
```

## 示例：创建自定义动画组件

```tsx
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/lib/animation";

export function CustomAnimatedSection({ children }) {
  const { ref, controls } = useScrollAnimation();

  const variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotate: -5,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className="my-8"
    >
      {children}
    </motion.section>
  );
}
```

## 常见问题

### Q: 动画不流畅怎么办？

A: 检查以下几点：

1. 使用 `transform` 和 `opacity` 而非 `width/height`
2. 启用 GPU 加速
3. 减少同时运行的动画数量
4. 在低端设备上简化动画

### Q: 如何禁用所有动画？

A: 设置全局配置：

```tsx
animationConfig.enabled = false;
```

### Q: 如何自定义动画时长？

A: 修改常量配置：

```tsx
import { duration } from "@/lib/animation/constants";
// 使用 duration.fast, duration.normal, duration.slow
```

---

**最后更新**：2025年1月11日  
**维护者**：终端A

现在您可以开始为博客添加流畅优雅的动画效果了！
