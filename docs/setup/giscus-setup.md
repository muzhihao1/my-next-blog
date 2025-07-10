# Giscus 评论系统配置指南

## 概述

Giscus 是一个基于 GitHub Discussions 的评论系统，非常适合开发者博客。它的优势包括：

- 免费且开源
- 无需数据库
- 支持 Markdown
- 内置垃圾评论过滤
- 支持表情回应
- 与 GitHub 生态系统完美集成

## 配置步骤

### 1. 准备 GitHub 仓库

1. 确保你的博客代码托管在 GitHub
2. 在仓库设置中启用 **Discussions** 功能：
   - 进入仓库 Settings
   - 在 General 页面找到 Features 部分
   - 勾选 "Discussions"

### 2. 安装 Giscus App

1. 访问 [Giscus App](https://github.com/apps/giscus)
2. 点击 "Install"
3. 选择要安装的仓库
4. 授予必要的权限

### 3. 获取配置信息

1. 访问 [Giscus 配置页面](https://giscus.app/zh-CN)
2. 填写配置信息：
   - **仓库**：输入 `your-username/your-repo`
   - **页面 ↔️ Discussion 映射关系**：选择 `pathname`
   - **Discussion 分类**：选择 `Announcements` 或创建新分类
   - **特性**：
     - ✅ 启用反应表情
     - ✅ 懒加载评论
     - ✅ 根据用户首选配色方案
   - **主题**：选择 `preferred_color_scheme`

3. 获取生成的配置值：
   - `data-repo`
   - `data-repo-id`
   - `data-category`
   - `data-category-id`

### 4. 配置环境变量

在 `.env.local` 文件中添加：

```env
# Giscus 配置
NEXT_PUBLIC_GISCUS_REPO=your-username/your-repo
NEXT_PUBLIC_GISCUS_REPO_ID=你的仓库ID
NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
NEXT_PUBLIC_GISCUS_CATEGORY_ID=你的分类ID
```

### 5. 创建 Discussion 分类（可选）

如果想为博客评论创建专门的分类：

1. 进入仓库的 Discussions 页面
2. 点击 "Categories" 旁边的齿轮图标
3. 点击 "New category"
4. 创建分类（例如：Blog Comments）
5. 设置格式为 "Announcement"（只有维护者可以创建新讨论）

### 6. 集成评论组件

评论组件已创建在 `/components/features/Comments.tsx`。在文章页面使用：

```tsx
import Comments from "@/components/features/Comments";

// 在文章底部添加
<Comments />;
```

### 7. 自定义评论样式（可选）

在 `globals.css` 中添加自定义样式：

```css
/* Giscus 评论框架 */
.giscus-wrapper {
  margin-top: 2rem;
}

.giscus-frame {
  width: 100%;
}

/* 深色模式适配 */
.dark .giscus-frame {
  color-scheme: dark;
}
```

## 管理评论

### 审核评论

1. 在 GitHub Discussions 中查看所有评论
2. 可以编辑、删除或锁定评论
3. 可以将评论标记为答案

### 备份评论

评论数据存储在 GitHub Discussions 中，可以通过以下方式备份：

1. 使用 GitHub API 导出 Discussions 数据
2. 使用 GitHub 的数据导出功能

### 迁移评论

如果需要迁移到其他评论系统：

1. 使用 GitHub GraphQL API 导出所有 Discussions
2. 转换数据格式
3. 导入到新系统

## 常见问题

### Q: 评论没有显示怎么办？

检查以下几点：

1. 确认 Discussions 已启用
2. 确认 Giscus App 已安装
3. 检查环境变量配置
4. 查看浏览器控制台错误

### Q: 如何处理垃圾评论？

1. GitHub 自带垃圾评论过滤
2. 可以在 Discussions 设置中配置评论限制
3. 可以要求评论者必须是仓库贡献者

### Q: 支持哪些 Markdown 功能？

Giscus 支持 GitHub Flavored Markdown，包括：

- 代码高亮
- 表格
- 任务列表
- 表情符号
- 数学公式（需要配置）

### Q: 如何自定义主题？

可以通过以下方式自定义：

1. 使用预设主题：
   - `light`
   - `dark`
   - `dark_dimmed`
   - `transparent_dark`
   - `preferred_color_scheme`

2. 使用自定义主题：
   - 创建自定义 CSS
   - 托管在 GitHub Pages
   - 在组件中指定主题 URL

### Q: 性能优化建议

1. 使用懒加载（`loading="lazy"`）
2. 将评论组件放在页面底部
3. 考虑使用 Intersection Observer 按需加载
4. 启用浏览器缓存

## 隐私和合规

### 数据存储

- 所有评论数据存储在 GitHub
- 遵循 GitHub 的隐私政策
- 用户需要 GitHub 账号才能评论

### GDPR 合规

- 评论者的数据由 GitHub 管理
- 提供明确的隐私政策链接
- 用户可以随时删除自己的评论

### 内容政策

- 遵循 GitHub 社区准则
- 可以设置评论审核
- 支持举报不当内容

## 故障排除

### 调试模式

在组件中添加调试信息：

```tsx
<Comments
  emitMetadata="1" // 显示元数据
/>
```

### 常见错误

1. **"Discussion not found"**
   - 确认仓库名称正确
   - 确认 mapping 方式匹配

2. **"Rate limit exceeded"**
   - GitHub API 限制
   - 考虑使用缓存

3. **主题切换不生效**
   - 检查 theme 属性
   - 确认消息监听正常

---

_最后更新：2025-01-07_
