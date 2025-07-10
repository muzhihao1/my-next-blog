# 订阅功能配置指南

## 概述

本博客使用 ConvertKit 作为邮件订阅服务。由于项目采用静态导出，订阅功能通过客户端 JavaScript 实现，使用 ConvertKit 的公开表单端点，无需暴露 API 密钥。

## 配置步骤

### 1. 注册 ConvertKit 账号

1. 访问 [ConvertKit](https://convertkit.com)
2. 注册免费账号（支持最多 1000 个订阅者）
3. 完成账号设置

### 2. 创建订阅表单

1. 登录 ConvertKit 后台
2. 进入 **Forms** 页面
3. 点击 **Create New Form**
4. 选择 **Inline** 类型
5. 设置表单名称为 "Blog Subscription"
6. 自定义表单字段（建议只保留 Email）

### 3. 获取表单 ID

1. 进入 **Forms** 页面
2. 点击你创建的表单
3. 在 URL 或表单设置中找到 Form ID
   - 例如：https://app.convertkit.com/forms/1234567
   - Form ID 就是 1234567

### 4. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# ConvertKit 配置
NEXT_PUBLIC_CONVERTKIT_FORM_ID=your_form_id_here
```

**安全说明**：

- 新的实现使用 ConvertKit 的公开表单端点
- 不需要 API Key，避免了安全风险
- 表单 ID 是公开的，可以安全地在客户端使用

### 5. 使用订阅组件

订阅组件已经创建在 `/components/features/SubscribeForm.tsx`，支持两种模式：

#### 完整模式（文章底部）

```tsx
import SubscribeForm from "@/components/features/SubscribeForm";

// 在文章底部使用
<SubscribeForm />;
```

#### 紧凑模式（侧边栏）

```tsx
import SubscribeForm from "@/components/features/SubscribeForm";

// 在侧边栏使用
<SubscribeForm compact />;
```

### 6. 自定义订阅确认邮件

1. 在 ConvertKit 后台进入 **Automations**
2. 创建新的 Automation
3. 设置触发器为 "Subscribes to a form"
4. 添加 "Send email" 动作
5. 自定义邮件内容：

```
主题：欢迎订阅我的博客！

亲爱的订阅者，

感谢您订阅我的博客！我会定期分享关于技术、设计和生活的深度思考。

您可以期待：
- 每周最多一封邮件
- 精选的技术文章和教程
- 项目经验分享
- 读书笔记和工具推荐

如果您有任何问题或建议，欢迎直接回复此邮件。

祝好！
[您的名字]

P.S. 如果您想取消订阅，可以点击邮件底部的取消订阅链接。
```

### 7. 设置订阅者标签

为了更好地管理订阅者，建议设置标签系统：

1. 在 ConvertKit 创建以下标签：
   - `blog-subscriber`（默认）
   - `active-reader`（经常打开邮件的读者）
   - `tech-interested`（对技术内容感兴趣）
   - `design-interested`（对设计内容感兴趣）

2. 可以根据用户行为自动添加标签

### 8. 监控和分析

ConvertKit 提供了详细的分析功能：

- 订阅者增长趋势
- 邮件打开率
- 点击率
- 取消订阅率

定期查看这些数据，优化内容策略。

## 安全说明

### 1. 当前实现的安全性

当前实现使用 ConvertKit 的公开表单提交端点：

- 不需要 API Key，避免了密钥暴露风险
- 使用 `https://app.convertkit.com/forms/{formId}/subscriptions` 端点
- 这是 ConvertKit 官方支持的安全方式

### 2. 可选的增强方案

如果需要更多控制（如自定义标签、段等），可以考虑：

- 使用 Netlify Functions 或 Vercel Functions
- 使用第三方表单服务（如 Formspree）
- 自建简单的订阅服务

### 2. 实施速率限制

防止恶意订阅：

- 限制每个 IP 的订阅频率
- 实施 reCAPTCHA 验证
- 添加蜜罐字段防止机器人

### 3. GDPR 合规

确保订阅流程符合 GDPR 要求：

- 明确说明数据用途
- 提供隐私政策链接
- 实施双重确认（double opt-in）
- 提供清晰的取消订阅选项

## 测试清单

- [ ] 订阅表单正常显示
- [ ] 输入验证工作正常
- [ ] 订阅成功后显示确认信息
- [ ] 确认邮件正常发送
- [ ] 取消订阅链接有效
- [ ] 错误处理正常工作
- [ ] 移动端响应式正常

## 常见问题

### Q: 订阅失败怎么办？

A: 检查以下几点：

1. API Key 和 Form ID 是否正确
2. ConvertKit 账号是否激活
3. 是否达到免费账号限制
4. 网络连接是否正常

### Q: 如何迁移到其他邮件服务？

A: 订阅组件设计为易于替换：

1. 修改 `SubscribeForm.tsx` 中的 API 调用
2. 更新环境变量
3. 调整返回数据处理逻辑

支持的替代服务：

- Mailchimp
- SendGrid
- EmailOctopus
- Buttondown

### Q: 如何导出订阅者列表？

A: 在 ConvertKit 后台：

1. 进入 **Subscribers**
2. 点击 **Export**
3. 选择格式（CSV 或 JSON）
4. 下载文件

---

_最后更新：2025-01-07_
