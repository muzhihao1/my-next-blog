# Supabase MCP 安装指南

## 安装完成

Supabase MCP 已成功安装到你的 Claude Desktop 中。

## 配置详情

### 1. 配置文件位置

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### 2. 添加的配置

```json
"supabase": {
  "command": "npx",
  "args": ["-y", "@supabase/mcp-server-supabase"],
  "env": {
    "SUPABASE_URL": "https://xelyobfvfjqeuysfzpcf.supabase.co",
    "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
  }
}
```

### 3. 使用的包

- 包名：`@supabase/mcp-server-supabase`
- 这是 Supabase 官方提供的 MCP 服务器

## 验证安装

要验证 Supabase MCP 是否正确安装：

1. **重启 Claude Desktop**
   - 完全退出 Claude Desktop 应用
   - 重新打开 Claude Desktop

2. **检查 MCP 连接状态**
   - 在 Claude Desktop 中，MCP 服务器会自动连接
   - 如果配置正确，你应该能看到 Supabase 相关的工具可用

3. **测试 Supabase 功能**
   - 尝试使用 Supabase 相关的命令
   - 例如：查询数据库表、插入数据等

## 可用功能

安装 Supabase MCP 后，你可以：

1. **数据库操作**
   - 查询表数据
   - 插入、更新、删除记录
   - 执行 SQL 查询

2. **存储管理**
   - 上传文件
   - 下载文件
   - 管理存储桶

3. **认证管理**
   - 创建用户
   - 管理用户权限
   - 处理认证流程

## 故障排除

如果遇到问题：

1. **检查日志**

   ```bash
   # 查看 Claude Desktop 日志
   tail -f ~/Library/Logs/Claude/claude.log
   ```

2. **验证配置**
   - 确保 URL 和密钥正确
   - 确保 JSON 格式正确

3. **网络连接**
   - 确保可以访问 Supabase 服务器
   - 检查防火墙设置

## 安全注意事项

- Service Role Key 具有完全的数据库访问权限
- 请勿将此密钥泄露给他人
- 定期轮换密钥以保证安全

## 下一步

现在你可以使用 Claude 直接与你的 Supabase 数据库交互了！
