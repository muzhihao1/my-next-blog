/**
 * Supabase 数据库连接测试脚本
 * 用于验证数据库配置是否正确
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// 验证环境变量
function validateEnvVars() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missing = required.filter(key => !process.env[key] || process.env[key].includes('需要'))
  
  if (missing.length > 0) {
    console.error('❌ 缺少必要的环境变量:')
    missing.forEach(key => {
      console.error(`   - ${key}`)
    })
    console.log('\n📝 请先从 Supabase Dashboard 获取这些密钥：')
    console.log('   1. 访问 https://supabase.com/dashboard/project/xelyobfvfjqeuysfzpcf')
    console.log('   2. 进入 Settings → API')
    console.log('   3. 复制对应的密钥到 .env.local 文件')
    return false
  }
  
  return true
}

// 测试数据库连接
async function testConnection() {
  console.log('🔄 开始测试 Supabase 连接...\n')
  
  // 验证环境变量
  if (!validateEnvVars()) {
    process.exit(1)
  }
  
  try {
    // 创建 Supabase 客户端（使用 service role key）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    console.log('✅ Supabase 客户端创建成功')
    
    // 测试查询用户表
    console.log('\n📊 测试数据库查询...')
    
    // 1. 检查表是否存在
    const tables = [
      'user_profiles',
      'comments',
      'likes',
      'bookmarks',
      'user_actions'
    ]
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error(`❌ 表 ${table} 查询失败:`, error.message)
        console.log(`   提示: 请运行 scripts/supabase-init.sql 初始化数据库`)
      } else {
        console.log(`✅ 表 ${table} 存在 (记录数: ${count || 0})`)
      }
    }
    
    // 2. 测试 RLS 策略
    console.log('\n🔒 测试 RLS 策略...')
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    // 尝试查询公开数据
    const { data: publicProfiles, error: publicError } = await anonClient
      .from('user_profiles')
      .select('id, display_name')
      .limit(1)
    
    if (publicError) {
      console.log('⚠️  匿名用户无法查询 user_profiles:', publicError.message)
    } else {
      console.log('✅ RLS 策略正常工作（公开查询测试通过）')
    }
    
    // 3. 测试函数
    console.log('\n🔧 测试数据库函数...')
    const { data: stats, error: statsError } = await supabase
      .rpc('get_content_stats', { 
        p_content_id: 'test-id',
        p_content_type: 'post'
      })
    
    if (statsError) {
      console.log('⚠️  函数 get_content_stats 不存在或执行失败')
    } else {
      console.log('✅ 函数 get_content_stats 正常工作')
    }
    
    console.log('\n✨ Supabase 连接测试完成！')
    
    // 提供下一步指引
    console.log('\n📝 下一步操作：')
    console.log('1. 如果有表不存在，请在 Supabase SQL Editor 中执行 scripts/supabase-init.sql')
    console.log('2. 在 Authentication → Providers 中配置 GitHub OAuth')
    console.log('3. 开始实现认证功能（A2.2 任务）')
    
  } catch (error) {
    console.error('\n❌ 连接测试失败:', error)
    process.exit(1)
  }
}

// 运行测试
testConnection()