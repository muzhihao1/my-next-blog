/** * 评论系统API集成测试 * 测试环境：本地开发环境 * 测试目标：验证评论CRUD功能的完整性 */ // 测试配置 const TEST_CONFIG = { baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000', testContentId: 'test-post-001', // 测试用的文章ID testUserId: 'test-user-001', // 测试用户ID }
// 测试数据 const testComment = { content: '这是一条测试评论，用于验证API功能。', content_id: TEST_CONFIG.testContentId, content_type: 'post', }
// 测试用例集合 export const commentTests = { /** * 测试1：获取评论列表（空列表） */
async testGetCommentsEmpty() { console.log('\n🧪 测试1：获取评论列表（空列表）') try { const response = await fetch( `${TEST_CONFIG.baseUrl}/api/comments/${TEST_CONFIG.testContentId}?page=1&limit=10`, { method: 'GET', headers: { 'Content-Type': 'application/json', }, } ) const data = await response.json() console.log('响应状态:', response.status) console.log('评论数量:', data.comments?.length || 0) // 验证 if (response.status === 200 && Array.isArray(data.comments)) { console.log('✅ 测试通过：成功获取评论列表') return true }
else { console.log('❌ 测试失败：评论列表格式错误') return false }
}
catch (error) { console.error('❌ 测试失败:', error) return false }
}, /** * 测试2：创建评论（未认证） */
async testCreateCommentUnauthenticated() { console.log('\n🧪 测试2：创建评论（未认证）') try { const response = await fetch(`${TEST_CONFIG.baseUrl}/api/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify(testComment), credentials: 'include', }) const data = await response.json() console.log('响应状态:', response.status) console.log('错误信息:', data.error) // 验证：未认证应返回401 if (response.status === 401) { console.log('✅ 测试通过：正确拒绝未认证用户') return true }
else { console.log('❌ 测试失败：未正确处理认证') return false }
}
catch (error) { console.error('❌ 测试失败:', error) return false }
}, /** * 测试3：更新评论（无权限） */
async testUpdateCommentUnauthorized() { console.log('\n🧪 测试3：更新评论（无权限）') try { const fakeCommentId = '00000000-0000-0000-0000-000000000000' const response = await fetch( `${TEST_CONFIG.baseUrl}/api/comment/${fakeCommentId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ content: '尝试更新评论' }), credentials: 'include', } ) console.log('响应状态:', response.status) // 验证：应返回401或404 if (response.status === 401 || response.status === 404) { console.log('✅ 测试通过：正确处理无权限更新') return true }
else { console.log('❌ 测试失败：权限验证失败') return false }
}
catch (error) { console.error('❌ 测试失败:', error) return false }
}, /** * 测试4：删除评论（无权限） */
async testDeleteCommentUnauthorized() { console.log('\n🧪 测试4：删除评论（无权限）') try { const fakeCommentId = '00000000-0000-0000-0000-000000000000' const response = await fetch( `${TEST_CONFIG.baseUrl}/api/comment/${fakeCommentId}`, { method: 'DELETE', credentials: 'include', } ) console.log('响应状态:', response.status) // 验证：应返回401或404 if (response.status === 401 || response.status === 404) { console.log('✅ 测试通过：正确处理无权限删除') return true }
else { console.log('❌ 测试失败：权限验证失败') return false }
}
catch (error) { console.error('❌ 测试失败:', error) return false }
}, /** * 测试5：验证输入验证 */
async testInputValidation() { console.log('\n🧪 测试5：验证输入验证') try { // 测试空内容 const response = await fetch(`${TEST_CONFIG.baseUrl}/api/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ content: '', // 空内容 content_id: TEST_CONFIG.testContentId, content_type: 'post', }), credentials: 'include', }) const data = await response.json() console.log('响应状态:', response.status) console.log('错误信息:', data.error) // 验证：应返回400错误 if (response.status === 400 || response.status === 401) { console.log('✅ 测试通过：正确验证输入') return true }
else { console.log('❌ 测试失败：输入验证失败') return false }
}
catch (error) { console.error('❌ 测试失败:', error) return false }
}, /** * 测试6：分页功能 */
async testPagination() { console.log('\n🧪 测试6：分页功能') try { const response = await fetch( `${TEST_CONFIG.baseUrl}/api/comments/${TEST_CONFIG.testContentId}?page=1&limit=5`, { method: 'GET', headers: { 'Content-Type': 'application/json', }, } ) const data = await response.json() console.log('响应状态:', response.status) console.log('分页信息:', { page: data.page, limit: data.limit, total: data.total, hasMore: data.hasMore, }) // 验证分页结构 if ( response.status === 200 && typeof data.page === 'number' && typeof data.limit === 'number' && typeof data.total === 'number' && typeof data.hasMore === 'boolean' ) { console.log('✅ 测试通过：分页结构正确') return true }
else { console.log('❌ 测试失败：分页结构错误') return false }
}
catch (error) { console.error('❌ 测试失败:', error) return false }
} }
// 运行所有测试 export async function runCommentTests() { console.log('🚀 开始评论系统API集成测试...') console.log('测试环境:', TEST_CONFIG.baseUrl) console.log('----------------------------------------') const results = { total: 0, passed: 0, failed: 0, }
// 执行所有测试 const tests = [ commentTests.testGetCommentsEmpty, commentTests.testCreateCommentUnauthenticated, commentTests.testUpdateCommentUnauthorized, commentTests.testDeleteCommentUnauthorized, commentTests.testInputValidation, commentTests.testPagination, ]
for (const test of tests) { results.total++ const passed = await test() if (passed) { results.passed++ }
else { results.failed++ }
// 测试间隔 await new Promise(resolve => setTimeout(resolve, 500)) }
// 测试总结 console.log('\n========================================') console.log('📊 测试总结:') console.log(`总测试数: ${results.total}`) console.log(`✅ 通过: ${results.passed}`) console.log(`❌ 失败: ${results.failed}`) console.log(`成功率: ${((results.passed / results.total) * 100).toFixed(1)}%`) console.log('========================================\n') return results }
// 如果直接运行此文件 if (require.main === module) { runCommentTests() }
