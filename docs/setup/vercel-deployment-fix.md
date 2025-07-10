# Vercel 部署错误修复指南

## 🚨 错误原因

部署失败是因为 Vercel 上缺少必要的环境变量配置，特别是 Notion API 相关的配置。

## 🔧 修复步骤

### 方法一：配置环境变量（推荐）

1. **登录 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 找到项目 `my-next-blog`

2. **进入项目设置**
   - 点击项目卡片
   - 点击顶部 **Settings** 标签
   - 左侧菜单选择 **Environment Variables**

3. **添加环境变量**

   必需的变量：

   ```
   NOTION_TOKEN = secret_xxxxxxxxxx（你的 Notion Integration Token）
   NOTION_DATABASE_ID = 21f1b640-00a7-808c-8b4f-c4ef924cfb64
   ```

   推荐配置的变量：

   ```
   NOTION_BOOKS_DB = 2291b640-00a7-81fa-88f4-f255c0f58e1a
   NOTION_PROJECTS_DB = 2291b640-00a7-8173-a212-e31b954226fc
   NOTION_TOOLS_DB = 2291b640-00a7-8125-b4fa-c42b466d80bd
   NEXT_PUBLIC_BASE_URL = https://my-next-blog-cjh9.vercel.app
   CACHE_TTL = 3600000
   ```

4. **获取 Notion Token**
   - 访问 https://www.notion.so/my-integrations
   - 创建新的集成或使用现有的
   - 复制 Internal Integration Token
   - 确保集成有权访问你的数据库

5. **重新部署**
   - 返回项目主页
   - 点击 **Redeploy**
   - 等待部署完成

### 方法二：使用 Fallback 数据（临时方案）

如果暂时无法配置 Notion，可以修改代码强制使用 fallback 数据：

1. 修改 `/lib/notion.ts`，在 `validateEnv` 函数中添加条件：

   ```typescript
   function validateEnv() {
     // 在生产环境允许缺少环境变量
     if (process.env.NODE_ENV === "production" && !process.env.NOTION_TOKEN) {
       console.warn("NOTION_TOKEN not set, using fallback data");
       return false;
     }
     // ... 原有代码
   }
   ```

2. 修改 `getPosts` 相关函数，在环境变量缺失时返回 fallback 数据

### 方法三：通过 vercel.json 配置

创建 `vercel.json` 文件：

```json
{
  "env": {
    "NOTION_TOKEN": "@notion-token",
    "NOTION_DATABASE_ID": "@notion-database-id"
  },
  "build": {
    "env": {
      "NOTION_TOKEN": "@notion-token",
      "NOTION_DATABASE_ID": "@notion-database-id"
    }
  }
}
```

然后使用 Vercel CLI 设置 secrets：

```bash
vercel secrets add notion-token "your-token-here"
vercel secrets add notion-database-id "your-database-id"
```

## 📋 检查清单

- [ ] Notion Integration 已创建
- [ ] Integration 有权访问所有相关数据库
- [ ] 所有环境变量已在 Vercel 配置
- [ ] 环境变量应用到所有环境（Production、Preview、Development）
- [ ] 重新部署已触发

## 🔍 验证部署

部署成功后，访问以下页面验证：

- 首页：https://your-domain.vercel.app
- 博客列表：https://your-domain.vercel.app/blog
- 标签页面：https://your-domain.vercel.app/tags/技术

## 💡 提示

1. 环境变量名称必须完全匹配（区分大小写）
2. Notion Token 必须以 `secret_` 开头
3. 数据库 ID 是 32 位字符串（包含连字符）
4. 配置后需要重新部署才能生效

---

_最后更新：2025-01-07_
