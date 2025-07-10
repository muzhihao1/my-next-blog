# Supabase MCP for Claude Code 安装指南

## ✅ 安装完成

Supabase MCP 已成功配置到 Claude Code 中。

## 配置详情

### 1. 配置文件位置

```
~/.claude/mcp.json
```

### 2. 添加的配置

```json
"supabase": {
  "command": "npx",
  "args": ["-y", "@supabase/mcp-server-supabase"],
  "env": {
    "SUPABASE_URL": "https://xelyobfvfjqeuysfzpcf.supabase.co",
    "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
  },
  "start_on_launch": true
}
```

### 3. 配置说明

- **command**: 使用 `npx` 运行 MCP 服务器
- **args**: `-y` 参数自动确认安装，避免交互提示
- **env**: 环境变量配置，包含 Supabase 连接信息
- **start_on_launch**: 设置为 `true`，在 Claude Code 启动时自动启动

## 使用方法

### 重启 Claude Code

配置完成后，需要重启 Claude Code 才能生效：

1. 使用 `Cmd+Q` 完全退出 Claude Code
2. 重新打开 Claude Code

### 验证安装

重启后，Supabase MCP 服务器会自动启动。你可以通过以下方式验证：

1. 在 Claude Code 中查看可用的工具
2. Supabase 相关的工具应该已经可用

## 可用功能

安装后，你可以通过 Claude Code 直接操作 Supabase：

### 数据库操作

- 查询表数据
- 插入、更新、删除记录
- 执行原始 SQL 查询
- 管理数据库架构

### 存储操作

- 上传文件到存储桶
- 下载文件
- 管理存储桶权限
- 列出和删除文件

### 认证管理

- 创建和管理用户
- 处理用户登录/登出
- 管理用户权限
- 重置密码

### 实时功能

- 订阅数据变化
- 处理实时事件
- 管理实时连接

## 故障排除

### 如果 MCP 未正确加载

1. 检查 `~/.claude/mcp.json` 文件格式是否正确
2. 确保 JSON 语法无误（注意逗号和引号）
3. 验证 Supabase URL 和密钥是否正确

### 查看日志

```bash
# 查看 Claude Code 日志
ls -la ~/.claude/logs/
```

### 常见问题

1. **权限错误**: 确保 Service Role Key 有足够的权限
2. **网络问题**: 检查是否能访问 Supabase URL
3. **配置错误**: 验证环境变量是否正确设置

## 安全提醒

- Service Role Key 具有完全的数据库访问权限
- 请勿将密钥分享给他人或提交到版本控制
- 定期轮换密钥以保证安全

## 完成！

现在你可以在 Claude Code 中直接使用 Supabase 功能了。
