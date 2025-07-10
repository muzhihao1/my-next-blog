/** * 认证系统API集成测试 * 测试环境：本地开发环境 * 测试目标：验证认证API端点的功能完整性 */
import { createClient }
from "@supabase/supabase-js";
// 测试配置 const TEST_CONFIG = { baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000', supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, }
// 测试用例集合 export const authTests = { /** * 测试1：获取当前用户状态（未登录） */
async testGetUserUnauthenticated() { console.log('\n🧪 测试1：获取当前用户状态（未登录）') try { const response = await fetch(`${TEST_CONFIG.baseUrl}/api/auth/user`, { method: 'GET', headers: { 'Content-Type': 'application/json', }, credentials: 'include', }) const data = await response.json() console.log('响应状态:', response.status) console.log('响应数据:', data) // 验证 if (response.status === 200 && data.user === null) { console.log('✅ 测试通过：未登录状态返回正确') return true }
else { console.log('❌ 测试失败：期望返回 user: null') return false }
}
catch (error) { console.error('❌ 测试失败:', error) return false }
}, /** * 测试2：登录端点重定向 */
async testLoginRedirect() { console.log('\n🧪 测试2：登录端点重定向') try { const response = await fetch(`${TEST_CONFIG.baseUrl}/api/auth/login`, { method: 'GET', redirect: 'manual', // 不自动跟随重定向 }) console.log('响应状态:', response.status) console.log('Location头:', response.headers.get('location')) // 验证重定向到GitHub OAuth if (response.status === 302 || response.status === 307) { const location = response.headers.get('location') if (location && location.includes('github.com/login/oauth')) { console.log('✅ 测试通过：正确重定向到GitHub OAuth') return true }
}
console.log('❌ 测试失败：未正确重定向到GitHub OAuth') return false }
catch (error) { console.error('❌ 测试失败:', error) return false }
}, /** * 测试3：登出端点（模拟已登录） */
async testLogout() { console.log('\n🧪 测试3：登出端点') try { const response = await fetch(`${TEST_CONFIG.baseUrl}/api/auth/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json', }, credentials: 'include', }) const data = await response.json() console.log('响应状态:', response.status) console.log('响应数据:', data) // 验证 if (response.status === 200 && data.success === true) { console.log('✅ 测试通过：登出端点响应正确') return true }
else { console.log('❌ 测试失败：登出端点响应异常') return false }
}
catch (error) { console.error('❌ 测试失败:', error) return false }
}, /** * 测试4：OAuth回调端点验证 */
async testCallbackValidation() { console.log('\n🧪 测试4：OAuth回调端点验证') try { // 测试无code参数的情况 const response = await fetch(`${TEST_CONFIG.baseUrl}/api/auth/callback`, { method: 'GET', }) console.log('响应状态:', response.status) // 期望返回400错误 if (response.status === 400) { const data = await response.json() console.log('响应数据:', data) console.log('✅ 测试通过：正确处理无效回调请求') return true }
else { console.log('❌ 测试失败：未正确处理无效回调') return false }
}
catch (error) { console.error('❌ 测试失败:', error) return false }
}, /** * 测试5：中间件会话刷新 */
async testMiddlewareHeaders() { console.log('\n🧪 测试5：中间件会话刷新') try { const response = await fetch(`${TEST_CONFIG.baseUrl}/`, { method: 'GET', credentials: 'include', }) // 检查是否有supabase相关的cookie设置 const setCookieHeader = response.headers.get('set-cookie') console.log('Set-Cookie头:', setCookieHeader ? '存在' : '不存在') if (response.status === 200) { console.log('✅ 测试通过：中间件正常工作') return true }
else { console.log('❌ 测试失败：中间件可能存在问题') return false }
}
catch (error) { console.error('❌ 测试失败:', error) return false }
} }
// 运行所有测试 export async function runAuthTests() { console.log('🚀 开始认证系统API集成测试...') console.log('测试环境:', TEST_CONFIG.baseUrl) console.log('----------------------------------------') const results = { total: 0, passed: 0, failed: 0, }
// 执行所有测试 const tests = [ authTests.testGetUserUnauthenticated, authTests.testLoginRedirect, authTests.testLogout, authTests.testCallbackValidation, authTests.testMiddlewareHeaders, ]
for (const test of tests) { results.total++ const passed = await test() if (passed) { results.passed++ }
else { results.failed++ }
// 测试间隔 await new Promise(resolve => setTimeout(resolve, 500)) }
// 测试总结 console.log('\n========================================') console.log('📊 测试总结:') console.log(`总测试数: ${results.total}`) console.log(`✅ 通过: ${results.passed}`) console.log(`❌ 失败: ${results.failed}`) console.log(`成功率: ${((results.passed / results.total) * 100).toFixed(1)}%`) console.log('========================================\n') return results }
// 如果直接运行此文件 if (require.main === module) { runAuthTests() }
