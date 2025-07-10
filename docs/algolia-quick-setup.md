# Algolia 快速配置指南

## 🚀 快速开始（5分钟完成）

### 第1步：注册 Algolia（2分钟）

1. 访问 https://www.algolia.com
2. 点击 "Start Free" 选择免费套餐
3. 使用 Google/GitHub 快速注册

### 第2步：创建应用（1分钟）

1. 登录后点击 "Create Application"
2. 名称填写：`my-blog`
3. 选择免费套餐和 Asia-Pacific 区域

### 第3步：获取密钥（1分钟）

进入应用后，点击左侧 "API Keys"，复制以下三个值：

- **Application ID**（页面顶部）
- **Search-Only API Key**（Public API keys 部分）
- **Admin API Key**（Admin API keys 部分，⚠️保密）

### 第4步：配置环境变量（1分钟）

#### 本地开发

编辑 `.env.local` 添加：

```env
# Algolia 配置
NEXT_PUBLIC_ALGOLIA_APP_ID=你复制的Application_ID
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=你复制的Search_Only_API_Key
ALGOLIA_ADMIN_API_KEY=你复制的Admin_API_Key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=posts
```

#### Vercel 生产环境

1. 进入 Vercel Dashboard → Settings → Environment Variables
2. 添加相同的4个环境变量

### 第5步：初始化搜索索引

```bash
# 安装依赖
npm install

# 构建搜索索引
npm run build-search-index
```

## ✅ 完成！

配置完成后，您的搜索功能就可以使用了：

- 搜索框会自动出现在导航栏
- 支持中文分词和模糊搜索
- 实时搜索建议

## 常见问题

**Q: 提示缺少环境变量？**
A: 确保 `.env.local` 文件中的变量名完全正确，注意大小写

**Q: 搜索没有结果？**
A: 运行 `npm run build-search-index` 重新构建索引

**Q: 如何更新搜索索引？**
A: 发布新文章后运行 `npm run search:sync`

---

需要详细说明？查看[完整配置指南](./algolia-setup-guide.md)
