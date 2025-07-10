# 代码审查标准和流程

> 终端 C 制定的代码质量保证规范

## 📋 代码审查清单

### 1. TypeScript 和类型安全

- [ ] **禁止使用 `any` 类型**
  - 使用 `unknown` 或具体类型替代
  - 必要时使用类型断言

- [ ] **所有函数必须有明确的参数和返回类型**

  ```typescript
  // ❌ 错误
  function getUser(id) {
    return users.find((u) => u.id === id);
  }

  // ✅ 正确
  function getUser(id: string): User | undefined {
    return users.find((u) => u.id === id);
  }
  ```

- [ ] **使用接口定义复杂对象**
  ```typescript
  interface BookFilter {
    status?: ReadingStatus;
    category?: string;
    rating?: number;
  }
  ```

### 2. React 组件规范

- [ ] **客户端组件必须添加 `'use client'` 指令**
  - 使用 hooks 的组件
  - 使用浏览器 API 的组件
  - 包含事件处理的组件

- [ ] **服务器组件不能包含**
  - useState, useEffect 等 hooks
  - onClick 等事件处理器
  - 浏览器专用 API

- [ ] **组件必须有 JSDoc 注释**
  ```typescript
  /**
   * 书籍卡片组件
   * @param book - 书籍信息
   * @param view - 显示模式：网格或列表
   */
  export function BookCard({ book, view }: BookCardProps) {
    // ...
  }
  ```

### 3. 错误处理和边界情况

- [ ] **所有异步操作必须有 try-catch**

  ```typescript
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return fallbackData;
  }
  ```

- [ ] **处理空值和边界情况**

  ```typescript
  // 处理空数组
  if (!items || items.length === 0) {
    return <EmptyState />
  }

  // 处理可选属性
  const imageUrl = book.cover || '/default-cover.jpg'
  ```

- [ ] **提供用户友好的错误消息**
  ```typescript
  catch (error) {
    // 日志记录详细错误
    console.error('Database connection failed:', error)
    // 用户看到友好消息
    return { error: '暂时无法加载数据，请稍后重试' }
  }
  ```

### 4. 性能优化

- [ ] **实现适当的缓存策略**

  ```typescript
  const CACHE_TTL = 3600000; // 1小时
  let cache: CacheData | null = null;

  export async function getData() {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return cache.data;
    }
    // ... 获取新数据
  }
  ```

- [ ] **使用懒加载优化性能**

  ```typescript
  // 图片懒加载
  <OptimizedImage src={url} loading="lazy" />

  // 组件懒加载
  const HeavyComponent = dynamic(() => import('./HeavyComponent'))
  ```

- [ ] **避免不必要的重渲染**

  ```typescript
  // 使用 memo 优化
  export const BookCard = memo(({ book }: Props) => {
    // ...
  });

  // 使用 useMemo 缓存计算
  const sortedBooks = useMemo(() => {
    return books.sort((a, b) => b.rating - a.rating);
  }, [books]);
  ```

### 5. 代码组织和命名

- [ ] **遵循命名约定**
  - 组件：PascalCase（如 `BookCard.tsx`）
  - 函数：camelCase（如 `getBooks`）
  - 常量：UPPER_SNAKE_CASE（如 `CACHE_TTL`）
  - 类型/接口：PascalCase（如 `BookFilter`）

- [ ] **文件组织结构**

  ```
  components/
    features/     # 功能组件
    layout/       # 布局组件
    ui/          # 通用UI组件
  lib/
    notion/      # Notion相关
    hooks/       # 自定义hooks
    utils.ts     # 工具函数
  ```

- [ ] **导入顺序**

  ```typescript
  // 1. React相关
  import { useState, useEffect } from "react";

  // 2. 第三方库
  import { motion } from "framer-motion";

  // 3. 本地模块
  import { BookCard } from "@/components/features/BookCard";

  // 4. 样式和资源
  import styles from "./page.module.css";
  ```

### 6. 注释和文档

- [ ] **函数必须有 JSDoc 注释**

  ```typescript
  /**
   * 根据状态获取书籍列表
   * @param status - 阅读状态
   * @returns 符合条件的书籍数组
   * @throws {NotionAPIError} 当 Notion API 调用失败时
   */
  export async function getBooksByStatus(
    status: ReadingStatus,
  ): Promise<Book[]> {
    // ...
  }
  ```

- [ ] **复杂逻辑需要内联注释**

  ```typescript
  // 计算阅读进度百分比
  // 考虑到可能没有总页数的情况
  const progress = book.totalPages
    ? Math.round((book.currentPage / book.totalPages) * 100)
    : 0;
  ```

- [ ] **TODO 注释必须包含负责人和日期**
  ```typescript
  // TODO(张三, 2025-01-08): 实现批量导入功能
  ```

## 🔄 代码审查流程

### 1. 自查阶段（提交前）

1. 运行 `npm run lint` 确保无 ESLint 错误
2. 运行 `npm run build` 确保构建成功
3. 运行 `npm run typecheck` 确保类型正确（如果有此命令）
4. 检查是否有 console.log 遗留
5. 确认所有新功能都有适当的错误处理

### 2. 提交规范

使用语义化提交信息：

```bash
feat: 添加书架筛选功能
fix: 修复搜索组件内存泄漏问题
docs: 更新 API 文档
style: 格式化代码
refactor: 重构 Notion 客户端
perf: 优化图片加载性能
test: 添加书籍组件测试
chore: 更新依赖版本
```

### 3. PR 审查要点

- **功能完整性**：是否完成了所有需求
- **代码质量**：是否符合上述标准
- **性能影响**：是否会影响页面加载速度
- **安全性**：是否有安全隐患
- **可维护性**：代码是否易于理解和修改

### 4. 审查反馈模板

```markdown
## 代码审查反馈

### ✅ 做得好的地方

- 类型定义完整
- 错误处理恰当

### ❌ 必须修改

- [ ] Search.tsx 第 39 行：移除对不存在 API 的调用
- [ ] ToolCard.tsx：添加 'use client' 指令

### 💡 建议改进

- 考虑为 getBooks 函数添加缓存
- 可以使用 useMemo 优化排序逻辑

### ❓ 疑问

- 为什么选择客户端渲染而不是服务端？
```

## 🚫 禁止事项

1. **禁止提交包含敏感信息的代码**
   - API 密钥
   - 密码
   - 个人隐私信息

2. **禁止使用不安全的操作**
   - eval()
   - innerHTML（使用 dangerouslySetInnerHTML 需要审查）
   - 直接操作 DOM

3. **禁止忽略 TypeScript 错误**
   - 不使用 @ts-ignore
   - 不使用 @ts-nocheck

4. **禁止提交未完成的代码**
   - 不留 TODO 而不实现
   - 不提交仅有框架的空函数

## 📊 质量指标

每次代码审查应确保：

- **类型覆盖率**：100%（无 any 类型）
- **错误处理率**：所有异步操作都有 try-catch
- **注释覆盖率**：所有公共函数都有 JSDoc
- **构建成功率**：100%
- **Lint 通过率**：100%

## 🔧 工具配置

建议在项目中配置以下工具：

1. **ESLint 规则**

   ```json
   {
     "rules": {
       "@typescript-eslint/no-explicit-any": "error",
       "@typescript-eslint/explicit-function-return-type": "warn",
       "no-console": ["warn", { "allow": ["warn", "error"] }]
     }
   }
   ```

2. **Prettier 配置**

   ```json
   {
     "semi": false,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "es5"
   }
   ```

3. **Pre-commit hooks**
   - 自动运行 lint
   - 自动格式化代码
   - 检查提交信息格式

---

_终端 C 制定于 2025-01-07_
_本标准将持续更新和完善_
