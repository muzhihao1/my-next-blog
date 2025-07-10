# 博客维护指南

## 目录

1. [文章管理](#文章管理)
2. [样式修改](#样式修改)
3. [推荐工作流](#推荐工作流)
4. [部署更新](#部署更新)

---

## 文章管理

### 当前文章存储方式

目前文章数据直接写在代码文件中：

- 文章列表：`app/page.tsx`
- 文章内容：`app/posts/[id]/page.tsx`

### 添加新文章步骤

#### 1. 编辑文章列表 (`app/page.tsx`)

```typescript
const posts = [
  // 在数组开头添加新文章
  {
    id: 5, // 递增的ID
    title: "您的文章标题",
    excerpt: "文章摘要，一般1-2句话",
    date: "28 Nov 2024", // 发布日期
    readTime: "5 min read", // 预计阅读时间
    author: {
      name: "Zhihao Mu",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    },
    category: "Technology", // 分类：Technology/Design/Productivity等
  },
  // 其他文章...
];
```

#### 2. 添加文章内容 (`app/posts/[id]/page.tsx`)

1. 首先在 `generateStaticParams` 函数中添加新的ID：

```typescript
export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" }, // 新增
  ];
}
```

2. 在 posts 对象中添加文章内容：

```typescript
const posts = {
  // ...其他文章
  "5": {
    title: "您的文章标题",
    date: "28 Nov 2024",
    category: "Technology",
    readTime: "5 min read",
    author: {
      name: "Zhihao Mu",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    },
    content: `
      <p>文章的第一段...</p>
      
      <h2>小标题</h2>
      <p>段落内容...</p>
      
      <ul>
        <li>列表项1</li>
        <li>列表项2</li>
      </ul>
      
      <blockquote>
        <p>引用内容</p>
      </blockquote>
      
      <pre><code>代码块内容</code></pre>
    `,
  },
};
```

### 修改现有文章

直接找到对应ID的文章，修改 content 内容即可。

---

## 样式修改

### 1. 全局样式 (`app/globals.css`)

#### 修改主题颜色

```css
:root {
  --color-primary: #ec1e73; /* 主色调（粉色） */
  --color-text: #1a1a1a; /* 文字颜色 */
  --color-text-secondary: #666666; /* 次要文字 */
}
```

#### 修改文章排版

```css
.prose-blog {
  /* 修改标题大小 */
  prose-h1:text-4xl  /* 改为其他大小如 text-5xl */

  /* 修改段落间距 */
  prose-p:mb-6  /* 改为 mb-8 增加间距 */

  /* 修改链接颜色 */
  prose-a:text-pink-600  /* 改为其他颜色 */
}
```

### 2. 导航栏样式 (`app/layout.tsx`)

```tsx
// 修改导航栏背景色
<header className="bg-pink-600 text-white">  // 改为其他颜色如 bg-blue-600

// 修改logo
<a href="/" className="text-xl font-bold">无题之墨</a>  // 修改文字
```

### 3. 常用样式调整

| 元素         | 文件位置    | 类名                  |
| ------------ | ----------- | --------------------- |
| 导航栏背景   | layout.tsx  | `bg-pink-600`         |
| 按钮样式     | globals.css | `.btn-subscribe`      |
| 文章标题     | page.tsx    | `text-3xl font-light` |
| 作者头像大小 | globals.css | `.author-avatar`      |
| 内容宽度     | globals.css | `.container-narrow`   |

---

## 推荐工作流

### 方案一：使用 Markdown 文件（推荐）

#### 1. 安装必要依赖

```bash
npm install gray-matter remark remark-html
```

#### 2. 创建 Markdown 文件夹

```
my-blog/
├── content/
│   └── posts/
│       ├── my-first-post.md
│       ├── react-18-features.md
│       └── ...
```

#### 3. Markdown 文件格式

```markdown
---
title: "文章标题"
date: "2024-11-28"
category: "Technology"
excerpt: "文章摘要"
readTime: "5 min read"
---

# 文章内容

正文开始...
```

#### 4. 创建读取函数

```typescript
// lib/posts.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export function getAllPosts() {
  const postsDirectory = path.join(process.cwd(), "content/posts");
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      ...data,
      content,
    };
  });
}
```

### 方案二：使用 Notion 作为 CMS

1. 使用 Notion API 读取文章
2. 自动同步到博客
3. 保持 Notion 的编辑体验

### 方案三：添加简单的管理界面

创建一个简单的编辑页面：

```typescript
// app/admin/page.tsx
export default function Admin() {
  return (
    <div className="container-narrow py-12">
      <h1>文章编辑器</h1>
      <form>
        <input type="text" placeholder="标题" />
        <textarea placeholder="内容" />
        <button type="submit">保存</button>
      </form>
    </div>
  )
}
```

---

## 部署更新

### 每次更新后的步骤

1. **本地预览**

```bash
npm run dev
# 访问 http://localhost:3000 确认效果
```

2. **提交到 GitHub**

```bash
git add .
git commit -m "添加新文章：文章标题"
git push origin main
```

3. **自动部署**

- Vercel 会自动检测更新
- 约 1-2 分钟后网站更新完成

### 日常维护建议

1. **定期备份**：定期将文章内容备份到其他地方
2. **图片管理**：使用图床服务（如 Cloudinary）管理图片
3. **性能监控**：使用 Vercel Analytics 监控网站性能

---

## 快速参考

### 添加文章 Checklist

- [ ] 在 `app/page.tsx` 添加文章信息
- [ ] 在 `app/posts/[id]/page.tsx` 添加 ID 到 generateStaticParams
- [ ] 在 `app/posts/[id]/page.tsx` 添加文章内容
- [ ] 本地预览确认
- [ ] 提交并推送到 GitHub

### 常用 HTML 标签

```html
<p>段落</p>
<h2>二级标题</h2>
<h3>三级标题</h3>
<strong>粗体</strong>
<em>斜体</em>
<a href="#">链接</a>
<ul>
  <li>无序列表</li>
</ul>
<ol>
  <li>有序列表</li>
</ol>
<blockquote>引用</blockquote>
<pre><code>代码块</code></pre>
```

### 推荐编辑工具

1. **VS Code** - 代码编辑器
2. **Typora** - Markdown 编辑器
3. **Notion** - 在线写作工具
4. **Obsidian** - 本地 Markdown 编辑器
