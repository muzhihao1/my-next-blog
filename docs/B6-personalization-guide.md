# 个性化界面系统使用指南

本指南介绍如何使用博客的个性化界面系统，让用户可以根据自己的喜好定制阅读体验。

## 目录

1. [系统概述](#系统概述)
2. [主题系统](#主题系统)
3. [字体设置](#字体设置)
4. [布局偏好](#布局偏好)
5. [辅助功能](#辅助功能)
6. [开发指南](#开发指南)

## 系统概述

个性化界面系统提供了全面的定制选项，包括：

- **6 个预设主题**：默认、暗夜、护眼、高对比度、紫罗兰、海洋之心
- **主题模式**：浅色、深色、跟随系统
- **字体定制**：大小调整、字体选择
- **布局密度**：紧凑、舒适、宽松
- **辅助功能**：减少动画、高对比度模式

## 主题系统

### 预设主题

#### 1. 默认主题

- 清新简洁的设计
- 专业的蓝色调
- 适合日常阅读

```typescript
// 主题配色
primary: "#3b82f6";
background: "#ffffff";
foreground: "#111827";
```

#### 2. 暗夜主题

- 深色背景保护眼睛
- 适合夜间阅读
- 柔和的对比度

```typescript
primary: "#60a5fa";
background: "#0f172a";
foreground: "#f1f5f9";
```

#### 3. 护眼主题

- 柔和的绿色调
- 降低蓝光刺激
- 长时间阅读友好

```typescript
primary: "#059669";
background: "#f7fee7";
foreground: "#1a202c";
```

#### 4. 高对比度主题

- 极强的黑白对比
- 提高可读性
- 适合视力不佳的用户

```typescript
primary: "#000000";
background: "#ffffff";
foreground: "#000000";
```

#### 5. 紫罗兰主题

- 优雅的紫色调
- 独特的视觉体验
- 适合创意工作者

```typescript
primary: "#8b5cf6";
background: "#faf5ff";
foreground: "#1e1b4b";
```

#### 6. 海洋之心主题

- 清爽的蓝色调
- 平静舒适的感觉
- 适合专注阅读

```typescript
primary: "#0ea5e9";
background: "#f0f9ff";
foreground: "#0c4a6e";
```

### 使用主题系统

```tsx
import { useTheme } from "@/lib/theme/ThemeContext";

function MyComponent() {
  const { theme, setTheme, preferences } = useTheme();

  // 切换主题
  const changeTheme = () => {
    setTheme("dark"); // 或 'default', 'eyecare' 等
  };

  // 获取当前主题信息
  console.log(theme.name); // 主题名称
  console.log(theme.colors); // 主题颜色

  return (
    <div
      style={{
        background: theme.colors.background,
        color: theme.colors.foreground,
      }}
    >
      当前主题：{theme.name}
    </div>
  );
}
```

### 主题模式

系统支持三种主题模式：

1. **浅色模式** - 固定使用浅色主题
2. **深色模式** - 固定使用深色主题
3. **跟随系统** - 根据系统设置自动切换

```tsx
const { setMode } = useTheme();

// 设置主题模式
setMode("system"); // 'light' | 'dark' | 'system'
```

## 字体设置

### 字体大小

提供三种预设大小：

- **小** - 适合信息密集的场景
- **中** - 默认大小，平衡可读性
- **大** - 适合视力不佳或大屏幕

```tsx
const { updatePreferences } = useTheme();

// 调整字体大小
updatePreferences({ fontSize: "large" }); // 'small' | 'medium' | 'large'
```

### 字体类型

支持三种字体系列：

1. **系统默认** - 使用操作系统字体

   ```css
   font-family: -apple-system, BlinkMacSystemFont, "PingFang SC";
   ```

2. **无衬线** - 现代简洁的字体

   ```css
   font-family: Inter, Roboto, "Helvetica Neue";
   ```

3. **衬线** - 传统优雅的字体
   ```css
   font-family: Georgia, "Times New Roman", "Songti SC";
   ```

## 布局偏好

### 布局密度

控制界面元素的间距：

- **紧凑** - 显示更多内容，减少空白
- **舒适** - 默认密度，平衡美观
- **宽松** - 增大间距，提升阅读体验

```tsx
// 设置布局密度
updatePreferences({ density: "spacious" });
```

### 圆角设置

控制界面元素的圆角程度：

```tsx
// 开启/关闭圆角
updatePreferences({ roundedCorners: false });
```

## 辅助功能

### 减少动画

为对动画敏感的用户提供的选项：

```tsx
// 开启减少动画
updatePreferences({ reduceMotion: true });
```

效果：

- 禁用所有过渡动画
- 立即显示/隐藏元素
- 保留必要的交互反馈

### 高对比度

增强文字和背景的对比度：

```tsx
// 开启高对比度
updatePreferences({ highContrast: true });
```

效果：

- 增强所有文字对比度
- 加深边框颜色
- 提高可读性

## 开发指南

### 创建自定义主题

```typescript
import { Theme } from "@/lib/theme/types";

const myCustomTheme: Theme = {
  name: "我的主题",
  mode: "light",
  colors: {
    primary: "#your-color",
    primaryHover: "#your-hover-color",
    primaryForeground: "#text-on-primary",
    // ... 其他颜色
  },
  fonts: {
    sans: "your-font-stack",
    // ... 其他字体设置
  },
  spacing: {
    xs: "0.5rem",
    // ... 其他间距
  },
  borderRadius: {
    sm: "0.125rem",
    // ... 其他圆角
  },
  animations: {
    duration: {
      fast: 150,
      // ... 其他动画时长
    },
  },
};
```

### 使用 CSS 变量

所有主题值都通过 CSS 变量提供：

```css
.my-component {
  /* 颜色 */
  background: var(--color-background);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);

  /* 字体 */
  font-family: var(--font-sans);
  font-size: var(--font-size-base);

  /* 间距 */
  padding: var(--spacing-md);
  margin: var(--spacing-sm);

  /* 圆角 */
  border-radius: var(--radius-lg);

  /* 动画 */
  transition-duration: var(--animation-duration-normal);
}
```

### 响应式主题

根据设备特性自动调整：

```typescript
// 性能优化配置
const config = getDeviceOptimizedConfig();

if (config.device === "mobile") {
  // 移动端优化
  updatePreferences({
    fontSize: "small",
    density: "compact",
  });
}
```

### 主题持久化

用户偏好会自动保存到本地存储：

```typescript
// 偏好设置保存在 localStorage
const STORAGE_KEY = "blog-theme-preferences";

// 手动重置偏好
const { resetTheme } = useTheme();
resetTheme(); // 恢复默认设置
```

## 最佳实践

### 1. 颜色使用

始终使用主题提供的颜色变量：

```tsx
// ✅ 正确
<div style={{ color: 'var(--color-primary)' }}>

// ❌ 错误
<div style={{ color: '#3b82f6' }}>
```

### 2. 响应用户偏好

检测并响应系统设置：

```tsx
// 检测系统主题偏好
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// 检测减少动画偏好
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
```

### 3. 渐进增强

提供合理的默认值：

```css
.component {
  /* 后备颜色 */
  background: #ffffff;
  background: var(--color-background, #ffffff);

  /* 后备字体 */
  font-family: sans-serif;
  font-family: var(--font-sans, sans-serif);
}
```

### 4. 测试所有主题

确保组件在所有主题下都能正常工作：

```tsx
// 测试工具
import { renderWithTheme } from "@/test-utils";

test("组件在所有主题下正常渲染", () => {
  const themes = ["default", "dark", "eyecare", "highcontrast"];

  themes.forEach((theme) => {
    const { container } = renderWithTheme(<MyComponent />, theme);
    expect(container).toBeInTheDocument();
  });
});
```

## 常见问题

### Q: 如何在服务端渲染时避免主题闪烁？

A: ThemeProvider 会在客户端挂载后应用主题，使用以下方式避免闪烁：

```tsx
// 在 layout.tsx 中
<body suppressHydrationWarning>
  <ThemeProvider>{children}</ThemeProvider>
</body>
```

### Q: 如何导出/导入用户的主题设置？

A: 使用主题工具函数：

```tsx
import { exportTheme, importTheme } from "@/lib/theme/utils";

// 导出当前主题
const themeJSON = exportTheme(currentTheme);

// 导入主题
const importedTheme = importTheme(themeJSON);
if (importedTheme) {
  applyTheme(importedTheme, preferences);
}
```

### Q: 如何检测用户是否修改了默认设置？

A: 比较当前偏好与默认偏好：

```tsx
const hasCustomSettings =
  JSON.stringify(preferences) !== JSON.stringify(defaultPreferences);
```

---

**最后更新**：2025年1月11日  
**维护者**：终端A

现在您的博客拥有了完整的个性化界面系统，让每个用户都能享受定制化的阅读体验！
