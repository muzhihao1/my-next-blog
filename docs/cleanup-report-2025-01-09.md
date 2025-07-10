# 项目清理报告

日期：2025-01-09

## 清理概要

本次清理主要移除了开发过程中产生的临时文件、测试页面和重复文件，优化了项目结构。

## 清理内容

### 1. Ghost 迁移相关文件

已移动到 `/archive/ghost-migration/`：

- `ghost_all_30_articles.json`
- `ghost_articles_extracted.json`
- `browser-extract-ghost.js`
- `extract-ghost-api.js`
- `import-ghost-to-notion.js`
- `import-missing-articles.js`
- `GHOST_EXTRACTION_GUIDE.md`
- `IMPORT_GUIDE.md`
- `temp_comments.txt`

### 2. 测试和演示页面

已删除以下测试页面：

- `/app/debug/`
- `/app/demo/`
- `/app/link-test/`
- `/app/simple/`
- `/app/style-test/`
- `/app/test-links/`
- `/app/test/`

### 3. 根目录重复文件

已移动到 `/archive/root-backup/`：

- 根目录下的 `app/`、`components/`、`lib/`、`contexts/` 文件夹
- 根目录下的 `next.config.js`、`package.json`、`package-lock.json`
- 根目录下的 `node_modules/`

### 4. 备份文件

已删除：

- `middleware.backup.ts`
- `middleware.ts.bak`

### 5. 一次性脚本

已归档到 `/docs/scripts-archive/`：

- `add-supabase-env.sh`

## 项目结构优化

清理后的项目结构更加清晰：

- 所有源代码都在 `my-blog/` 目录下
- 归档文件保存在 `/archive/` 目录中，以备将来参考
- 删除了所有测试和演示页面，减少了生产环境的冗余代码

## 建议

1. 定期清理 `.next/` 构建缓存目录
2. 考虑将 `/archive/` 目录添加到 `.gitignore` 中
3. 在部署前运行 `npm run lint` 修复剩余的代码规范问题
