# Vercel 环境变量配置指南

## 📋 快速配置步骤

### 1. 获取 Notion 数据

#### 获取 Integration Token：

1. 访问 https://www.notion.so/my-integrations
2. 创建新的 Integration
3. 复制 Token（格式：`secret_xxx...`）

#### 获取数据库 ID：

1. 打开 Notion 数据库页面
2. 点击右上角 Share → Copy link
3. 从链接中提取 ID：
   ```
   https://notion.so/workspace/【这部分是数据库ID】?v=xxx
   ```

### 2. 在 Vercel 配置环境变量

1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 进入 Settings → Environment Variables
4. 添加以下变量：

```
NOTION_TOKEN=secret_你的token（不要包含引号）
NOTION_DATABASE_ID=你的32位数据库ID（不要包含URL）
```

### 3. 常见错误示例

❌ **错误示例 1** - 包含完整 URL：

```
NOTION_DATABASE_ID=https://www.notion.so/workspace/21f1b64000a7808c8b4fc4ef924cfb64?v=xxx
```

❌ **错误示例 2** - 包含空格：

```
NOTION_TOKEN= secret_xxx
```

❌ **错误示例 3** - 包含引号：

```
NOTION_TOKEN="secret_xxx"
```

✅ **正确示例**：

```
NOTION_TOKEN=secret_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890123456
NOTION_DATABASE_ID=21f1b64000a7808c8b4fc4ef924cfb64
```

### 4. 验证配置

配置完成后：

1. 点击 Redeploy
2. 等待部署完成
3. 访问 `/deployment-status` 查看状态

## 🔧 故障排除

### 如果还是看不到内容：

1. **检查 Integration 权限**：
   - 在 Notion 数据库页面
   - 点击 "..." → "Connections"
   - 确保你的 Integration 已连接

2. **检查内容状态**：
   - 确保数据库中有 Published = true 的内容

3. **查看构建日志**：
   - 在 Vercel Dashboard 查看 Build Logs
   - 查找 Notion 相关错误信息

## 📚 相关链接

- [Notion API 文档](https://developers.notion.com/)
- [Vercel 环境变量文档](https://vercel.com/docs/environment-variables)
- [项目 GitHub](https://github.com/muzhihao1/my-next-blog)
