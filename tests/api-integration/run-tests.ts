#!/usr/bin/env node /** * API集成测试运行器 * 使用方法：npm run test:api */
import { config }
from 'dotenv'

import { runAuthTests }
from "./auth.test";
import { runCommentTests }
from "./comments.test";
// 加载环境变量 config({ path: '.env.local' }) // 验证必需的环境变量 function validateEnv() { const required = [ 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', ]
const missing = required.filter(key => !process.env[key]) if (missing.length > 0) { console.error('❌ 缺少必需的环境变量:') missing.forEach(key => console.error(` - ${key}`)) console.error('\n请在 .env.local 文件中设置这些变量') process.exit(1) }
}
// 主测试函数 async function runAllTests() { console.log('🔧 API集成测试套件') console.log('==========================================') console.log('环境:', process.env.NODE_ENV || 'development') console.log('时间:', new Date().toISOString()) console.log('==========================================\n') // 验证环境变量 validateEnv() const allResults = { auth: { total: 0, passed: 0, failed: 0 }, comments: { total: 0, passed: 0, failed: 0 }, }
// 1. 认证系统测试 console.log('📦 模块1：认证系统') console.log('==========================================') allResults.auth = await runAuthTests() // 2. 评论系统测试 console.log('\n📦 模块2：评论系统') console.log('==========================================') allResults.comments = await runCommentTests() // 总体报告 console.log('\n\n🎯 总体测试报告') console.log('==========================================') let totalTests = 0 let totalPassed = 0 let totalFailed = 0 Object.entries(allResults).forEach(([module, results]) => { totalTests += results.total totalPassed += results.passed totalFailed += results.failed const passRate = ((results.passed / results.total) * 100).toFixed(1) const status = results.failed === 0 ? '✅' : '❌' console.log(`${status}
${module.padEnd(10)} - 通过率: ${passRate}% (${results.passed}/${results.total})`) }) console.log('------------------------------------------') console.log(`总计: ${totalTests} 个测试`) console.log(`✅ 通过: ${totalPassed}`) console.log(`❌ 失败: ${totalFailed}`) console.log(`📊 总通过率: ${((totalPassed / totalTests) * 100).toFixed(1)}%`) console.log('==========================================\n') // 退出码 process.exit(totalFailed > 0 ? 1 : 0) }
// 处理未捕获的错误 process.on('unhandledRejection', (error) => { console.error('❌ 未处理的错误:', error) process.exit(1) }) // 运行测试 runAllTests().catch(error => { console.error('❌ 测试运行失败:', error) process.exit(1) })
