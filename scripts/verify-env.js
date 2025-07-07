#!/usr/bin/env node

/**
 * 验证环境变量格式的脚本
 * 用于检查 Notion 相关的环境变量是否正确配置
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

console.log('🔍 验证环境变量配置...\n');

// 验证函数
function validateEnvVar(name, value, pattern, description) {
  console.log(`检查 ${name}:`);
  
  if (!value) {
    console.log(`❌ 未设置\n`);
    return false;
  }
  
  // 检查前后空格
  if (value !== value.trim()) {
    console.log(`❌ 包含前后空格`);
    console.log(`   原始值: "${value}"`);
    console.log(`   修正值: "${value.trim()}"\n`);
    return false;
  }
  
  // 检查格式
  if (pattern && !pattern.test(value)) {
    console.log(`❌ 格式不正确`);
    console.log(`   当前值: ${value}`);
    console.log(`   期望格式: ${description}\n`);
    return false;
  }
  
  console.log(`✅ 正确`);
  console.log(`   值: ${value.substring(0, 20)}...`);
  console.log(`   长度: ${value.length} 字符\n`);
  return true;
}

// 验证 Notion Token
const tokenValid = validateEnvVar(
  'NOTION_TOKEN',
  process.env.NOTION_TOKEN,
  /^secret_[a-zA-Z0-9]{43}$/,
  'secret_ 开头，后跟 43 个字符'
);

// 验证数据库 ID
const dbIdPattern = /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i;
const dbIdDescription = '32位十六进制字符（可包含连字符）';

const mainDbValid = validateEnvVar(
  'NOTION_DATABASE_ID',
  process.env.NOTION_DATABASE_ID,
  dbIdPattern,
  dbIdDescription
);

const projectsDbValid = validateEnvVar(
  'NOTION_PROJECTS_DB',
  process.env.NOTION_PROJECTS_DB,
  dbIdPattern,
  dbIdDescription
);

const toolsDbValid = validateEnvVar(
  'NOTION_TOOLS_DB',
  process.env.NOTION_TOOLS_DB,
  dbIdPattern,
  dbIdDescription
);

const booksDbValid = validateEnvVar(
  'NOTION_BOOKS_DB',
  process.env.NOTION_BOOKS_DB,
  dbIdPattern,
  dbIdDescription
);

// 总结
console.log('\n📊 验证结果总结：');
const allValid = tokenValid && mainDbValid && projectsDbValid && toolsDbValid && booksDbValid;

if (allValid) {
  console.log('✅ 所有环境变量格式正确！');
} else {
  console.log('❌ 发现格式问题，请修正上述错误');
  console.log('\n💡 提示：');
  console.log('1. 确保数据库 ID 只包含 ID 本身，不要包含完整 URL');
  console.log('2. 删除值前后的所有空格和换行符');
  console.log('3. Token 必须以 secret_ 开头');
  console.log('4. 在 Vercel 中更新环境变量后需要重新部署');
  process.exit(1);
}

// 如果本地运行，显示示例
if (!process.env.VERCEL) {
  console.log('\n📝 正确的格式示例：');
  console.log('NOTION_TOKEN=secret_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890123456');
  console.log('NOTION_DATABASE_ID=21f1b640-00a7-808c-8b4f-c4ef924cfb64');
  console.log('NOTION_PROJECTS_DB=2291b640-00a7-8173-a212-e31b954226fc');
}