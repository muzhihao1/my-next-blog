# 📚 博客项目文档中心

欢迎来到博客项目的文档中心！本目录包含所有必要的文档，帮助你快速了解、部署和维护这个博客系统。

## 🚀 快速开始

如果你是第一次接触这个项目，请按以下顺序阅读：

1. **[快速启动指南](./快速启动指南.md)** - 5分钟内启动博客
2. **[Notion 完整配置指南](./notion-complete-guide.md)** - 配置内容管理系统
3. **[部署指南](./deployment-guide.md)** - 部署到生产环境

## 📖 核心文档

### 使用指南

- **[博主使用指南](./blogger-guide.md)** - 📝 内容创作者的完整操作手册
- **[快速参考卡](./quick-reference.md)** - 🎯 常用操作的快速查询
- **[维护指南](./maintenance-guide.md)** - 🔧 日常维护和故障排除

### 技术文档

- **[API 设计规范](./api-standards.md)** - 接口设计标准
- **[代码审查标准](./code-review-standards.md)** - 代码质量要求
- **[文件结构说明](./file-structure.md)** - 项目目录结构

### 功能配置

- **[Giscus 评论设置](./giscus-setup.md)** - 评论系统配置
- **[RSS 订阅配置](./rss-configuration.md)** - RSS/Atom/JSON Feed 设置
- **[订阅功能设置](./subscription-setup.md)** - 邮件订阅配置
- **[监控系统设置](./monitoring-setup.md)** - Google Analytics 配置
- **[数据统计指南](./data-statistics-guide.md)** - 统计功能使用说明

### 项目管理

- **[项目交付文档](./project-handover.md)** - 正式交付清单
- **[项目完成总结](./project-completion-summary.md)** - 项目成果概览
- **[项目治理规范](./project-governance.md)** - 开发流程和规范
- **[产品需求分析](./product-requirements-analysis.md)** - 需求实现对比

## 🗂️ 文档结构

```
docs/
├── README.md                     # 本文档
├── 快速启动指南.md               # 开发者快速上手
├── notion-complete-guide.md      # Notion CMS 完整配置
├── deployment-guide.md           # 生产环境部署
├── blogger-guide.md              # 博主操作手册
├── quick-reference.md            # 快速参考卡
├── maintenance-guide.md          # 维护指南
├── api-standards.md              # API 规范
├── code-review-standards.md      # 代码规范
├── file-structure.md             # 文件结构
├── giscus-setup.md              # 评论配置
├── rss-configuration.md         # RSS 配置
├── subscription-setup.md        # 订阅配置
├── monitoring-setup.md          # 监控配置
├── data-statistics-guide.md    # 统计指南
├── product-requirements-analysis.md # 需求分析
├── project-handover.md          # 交付文档
├── project-completion-summary.md # 完成总结
├── project-governance.md        # 项目治理
└── archive/                     # 归档文档（历史版本）
```

## 🔍 文档查找

### 按用户角色

**博主/内容创作者**：
- [博主使用指南](./blogger-guide.md)
- [快速参考卡](./quick-reference.md)

**开发者**：
- [快速启动指南](./快速启动指南.md)
- [API 设计规范](./api-standards.md)
- [代码审查标准](./code-review-standards.md)

**运维人员**：
- [部署指南](./deployment-guide.md)
- [维护指南](./maintenance-guide.md)
- [监控系统设置](./monitoring-setup.md)

### 按任务类型

**初始设置**：
- [Notion 完整配置指南](./notion-complete-guide.md)
- [Giscus 评论设置](./giscus-setup.md)
- [订阅功能设置](./subscription-setup.md)

**日常使用**：
- [博主使用指南](./blogger-guide.md)
- [数据统计指南](./data-statistics-guide.md)

**问题解决**：
- [维护指南](./maintenance-guide.md)
- [快速参考卡](./quick-reference.md)

## 📌 重要提示

1. **环境变量**：所有敏感配置都通过环境变量管理，请参考 `.env.example`
2. **Notion 权限**：确保 Notion 集成有正确的数据库访问权限
3. **静态生成**：博客使用静态生成，内容更新后需要重新构建

## 🔄 文档维护

- 文档采用 Markdown 格式编写
- 更新文档时请同步更新本索引
- 过时的文档请移至 `archive/` 目录
- 归档文档包含历史版本和已完成的任务文档

## 📞 获取帮助

如果文档无法解决你的问题：

1. 查看 [维护指南](./maintenance-guide.md) 的故障排除部分
2. 检查项目的 GitHub Issues
3. 联系项目维护者

## 🗺️ 项目相关链接

- [GitHub 仓库](https://github.com/muzhihao1/my-next-blog)
- [在线演示](https://my-next-blog-cjh9.vercel.app)
- [项目根目录 README](../README.md)

---

*文档最后更新：2025-01-07*