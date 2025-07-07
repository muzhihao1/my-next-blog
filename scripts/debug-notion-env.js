#!/usr/bin/env node

/**
 * 调试 Notion 环境变量的脚本
 * 用于在 Vercel 部署时诊断环境变量问题
 */

// 这个脚本可以在 Vercel 函数中运行来调试环境变量
function debugNotionEnv() {
  console.log('=== Notion 环境变量调试 ===\n');
  
  // 检查环境变量是否存在
  const token = process.env.NOTION_TOKEN;
  const mainDb = process.env.NOTION_DATABASE_ID;
  const projectsDb = process.env.NOTION_PROJECTS_DB;
  const toolsDb = process.env.NOTION_TOOLS_DB;
  const booksDb = process.env.NOTION_BOOKS_DB;
  
  // Token 调试（安全地显示部分信息）
  console.log('NOTION_TOKEN:');
  if (!token) {
    console.log('  ❌ 未设置');
  } else {
    console.log('  ✅ 已设置');
    console.log(`  前缀: ${token.substring(0, 7)}...`);
    console.log(`  长度: ${token.length} 字符`);
    console.log(`  包含空格: ${token !== token.trim() ? '是' : '否'}`);
    console.log(`  格式正确: ${/^secret_[a-zA-Z0-9]{43}$/.test(token) ? '是' : '否'}`);
  }
  
  // 数据库 ID 调试函数
  function debugDatabaseId(name, value) {
    console.log(`\n${name}:`);
    if (!value) {
      console.log('  ❌ 未设置');
      return;
    }
    
    console.log('  ✅ 已设置');
    console.log(`  值: ${value}`);
    console.log(`  长度: ${value.length} 字符`);
    console.log(`  包含空格: ${value !== value.trim() ? '是' : '否'}`);
    
    // 检查是否包含 URL
    if (value.includes('notion.so') || value.includes('http')) {
      console.log('  ⚠️  警告: 包含 URL，应该只是 ID');
    }
    
    // 检查格式
    const uuidPattern = /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i;
    const compactPattern = /^[a-f0-9]{32}$/i;
    
    if (uuidPattern.test(value)) {
      console.log('  ✅ 格式: 标准 UUID 格式');
    } else if (compactPattern.test(value)) {
      console.log('  ✅ 格式: 紧凑格式（无连字符）');
    } else {
      console.log('  ❌ 格式: 不匹配预期格式');
      console.log('  期望格式示例:');
      console.log('    - 21f1b640-00a7-808c-8b4f-c4ef924cfb64 (带连字符)');
      console.log('    - 21f1b64000a7808c8b4fc4ef924cfb64 (无连字符)');
    }
  }
  
  // 调试各个数据库 ID
  debugDatabaseId('NOTION_DATABASE_ID', mainDb);
  debugDatabaseId('NOTION_PROJECTS_DB', projectsDb);
  debugDatabaseId('NOTION_TOOLS_DB', toolsDb);
  debugDatabaseId('NOTION_BOOKS_DB', booksDb);
  
  console.log('\n=== 常见问题 ===');
  console.log('1. 确保从 Notion 复制的是数据库 ID，不是页面 URL');
  console.log('2. 数据库 ID 在 Share 链接中的格式：');
  console.log('   https://notion.so/workspace/21f1b64000a7808c8b4fc4ef924cfb64?v=...');
  console.log('   数据库 ID 是: 21f1b64000a7808c8b4fc4ef924cfb64');
  console.log('3. 在 Vercel 中设置时，确保没有额外的引号或空格');
  console.log('4. Integration Token 必须以 secret_ 开头');
}

// 如果直接运行脚本
if (require.main === module) {
  debugNotionEnv();
} else {
  // 导出供其他模块使用
  module.exports = { debugNotionEnv };
}