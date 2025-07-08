# Algolia 配置下一步

## ✅ 已完成的配置

我已经将您的 Algolia 配置添加到 `.env.local` 文件中：
- Application ID: `XOXMNX38GJ` ✅
- Search API Key: `42590dd8b12630b137b8bf8ce7b54e5d` ✅
- Index Name: `posts` ✅

## 🔑 获取 Write API Key（Admin API Key）

您还需要获取 Write API Key：

1. 在您的 Algolia Dashboard 中，找到 "Write API Key" 这一行
2. 点击右侧的**眼睛图标** 👁️ 来显示密钥
3. 复制显示的密钥
4. 将其粘贴到 `.env.local` 文件中的 `ALGOLIA_ADMIN_API_KEY=` 后面

## 📦 安装依赖

```bash
# 安装 Algolia SDK（我已经在 package.json 中添加了）
npm install
```

## 🚀 初始化搜索索引

获取 Write API Key 后，运行以下命令：

```bash
# 构建搜索索引
npm run build-search-index

# 或者使用别名
npm run search:build
```

## 🎯 验证配置

1. 脚本会自动：
   - 从 Supabase 数据库获取所有已发布的文章
   - 转换为 Algolia 格式
   - 创建搜索索引
   - 配置中文分词
   - 设置搜索规则

2. 成功后您会看到：
   ```
   ✅ 搜索索引构建完成！
   索引中共有 X 条记录
   ```

3. 在 Algolia Dashboard 中：
   - 点击左侧菜单的 "Search" → "Index"
   - 您应该能看到 "posts" 索引
   - 可以在 "Browse" 标签页查看导入的数据

## 🔍 测试搜索功能

配置完成后，搜索功能会自动在您的博客中启用：
- 导航栏会显示搜索框
- 支持实时搜索建议
- 中文搜索优化

## 💡 提示

- Write API Key 是敏感信息，请妥善保管
- 不要将其提交到 Git 仓库
- 仅在服务端使用，不要在前端暴露

---

**需要帮助？** 如果遇到任何问题，请告诉我！