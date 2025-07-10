# 🔧 Vercel 部署配置与错误修复指南

## 错误分析

你的部署失败是因为 Notion API 返回了 "Invalid request URL" (400 错误)。这通常是由于环境变量格式问题导致的。

## 🎯 快速修复步骤

### 1. 验证环境变量格式

在 Vercel Dashboard 中检查你的环境变量：

#### ✅ 正确的格式示例：

```
NOTION_TOKEN=secret_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890123456
NOTION_DATABASE_ID=21f1b64000a7808c8b4fc4ef924cfb64
```

#### ❌ 常见错误：

1. **包含完整 URL**（错误）：

   ```
   NOTION_DATABASE_ID=https://www.notion.so/workspace/21f1b64000a7808c8b4fc4ef924cfb64?v=...
   ```

2. **包含额外空格**（错误）：

   ```
   NOTION_TOKEN= secret_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890123456
   ```

3. **包含引号**（错误）：
   ```
   NOTION_TOKEN="secret_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890123456"
   ```

### 2. 获取正确的数据库 ID

1. 打开你的 Notion 数据库页面
2. 点击右上角的 "Share" 按钮
3. 复制链接，格式如：
   ```
   https://www.notion.so/workspace/21f1b64000a7808c8b4fc4ef924cfb64?v=...
   ```
4. 数据库 ID 是 URL 中的这部分：`21f1b64000a7808c8b4fc4ef924cfb64`

### 3. 在 Vercel 中更新环境变量

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目 `my-next-blog`
3. 进入 Settings → Environment Variables
4. 更新以下变量（确保没有额外的空格或引号）：
   - `NOTION_TOKEN`: 你的 Integration Token
   - `NOTION_DATABASE_ID`: 博客文章数据库 ID
   - `NOTION_PROJECTS_DB`: 项目数据库 ID（可选）
   - `NOTION_TOOLS_DB`: 工具数据库 ID（可选）
   - `NOTION_BOOKS_DB`: 书籍数据库 ID（可选）

### 4. 本地验证环境变量

在推送前，先在本地测试：

```bash
# 运行验证脚本
node scripts/verify-env.js
```

所有检查应该显示 ✅ 正确。

### 5. 本地测试连接

使用本地脚本测试环境变量：

```bash
# 创建 .env.local 文件（如果还没有）
echo "NOTION_TOKEN=你的token" >> .env.local
echo "NOTION_DATABASE_ID=你的数据库ID" >> .env.local

# 运行测试脚本
node scripts/test-notion-connection.js
```

如果本地测试成功，使用相同的值在 Vercel 中配置。

## 🚀 重新部署

完成上述步骤后：

1. 在 Vercel Dashboard 中点击 "Redeploy"
2. 选择 "Redeploy with existing Build Cache"
3. 等待部署完成

## 🐛 如果仍然失败

### 检查 Notion Integration 权限

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 确保你的 Integration 有权访问所有相关数据库
3. 在每个数据库页面，点击 "..." → "Add connections" → 选择你的 Integration

### 查看详细错误日志

在 Vercel Dashboard 中：

1. 进入 Functions 标签
2. 查看函数日志，寻找具体错误信息

### 临时解决方案

如果急需部署，可以暂时使用 fallback 数据：

1. 将所有环境变量留空
2. 网站将使用 `lib/fallback-*.ts` 中的示例数据
3. 部署成功后再配置 Notion 集成

## 📝 环境变量检查清单

- [ ] NOTION*TOKEN 以 `secret*` 开头
- [ ] NOTION_TOKEN 长度为 50 个字符
- [ ] 所有数据库 ID 都是 32 位十六进制字符（可能包含连字符）
- [ ] 环境变量值前后没有空格
- [ ] 环境变量值没有引号
- [ ] Integration 有权访问所有数据库
- [ ] 数据库中有状态为 "Published" 的内容

## 🔗 相关资源

- [Notion API 文档](https://developers.notion.com/)
- [Vercel 环境变量文档](https://vercel.com/docs/environment-variables)
- [项目部署检查清单](./deployment-success-checklist.md)

---

如果按照以上步骤操作后仍有问题，请检查 Vercel 函数日志中的具体错误信息。
