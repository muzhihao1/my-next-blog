#!/usr/bin/env node

/**
 * 简化版部署测试脚本
 * 跳过需要 Replication 的功能
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

// 创建 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 测试结果
const testResults: { test: string; passed: boolean; error?: string }[] = []

/**
 * 记录测试结果
 */
function logTest(test: string, passed: boolean, error?: string) {
  testResults.push({ test, passed, error })
  console.log(`${passed ? '✅' : '❌'} ${test}`)
  if (error) console.error(`   └─ ${error}`)
}

/**
 * 1. 测试数据库连接
 */
async function testDatabaseConnection() {
  try {
    // 测试查询 notifications 表
    const { data, error } = await supabase
      .from('notifications')
      .select('count')
      .limit(1)
    
    if (error) throw error
    logTest('数据库连接 - notifications表', true)
  } catch (error: any) {
    logTest('数据库连接 - notifications表', false, error.message)
  }

  try {
    // 测试查询 analytics_events 表
    const { data, error } = await supabase
      .from('analytics_events')
      .select('count')
      .limit(1)
    
    if (error) throw error
    logTest('数据库连接 - analytics_events表', true)
  } catch (error: any) {
    logTest('数据库连接 - analytics_events表', false, error.message)
  }

  try {
    // 测试查询 monitoring_metrics 表
    const { data, error } = await supabase
      .from('monitoring_metrics')
      .select('count')
      .limit(1)
    
    if (error) throw error
    logTest('数据库连接 - monitoring_metrics表', true)
  } catch (error: any) {
    logTest('数据库连接 - monitoring_metrics表', false, error.message)
  }
}

/**
 * 2. 测试 API 端点（本地）
 */
async function testAPIs() {
  console.log('\n📡 测试 API 端点...')
  
  // 测试数据分析 API
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/stats`)
    if (response.ok) {
      logTest('数据分析 API - /api/analytics/stats', true)
    } else {
      logTest('数据分析 API - /api/analytics/stats', false, `Status: ${response.status}`)
    }
  } catch (error: any) {
    logTest('数据分析 API - /api/analytics/stats', false, error.message)
  }

  // 测试性能监控 API
  try {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/metrics`)
    if (response.ok) {
      logTest('性能监控 API - /api/monitoring/metrics', true)
    } else {
      logTest('性能监控 API - /api/monitoring/metrics', false, `Status: ${response.status}`)
    }
  } catch (error: any) {
    logTest('性能监控 API - /api/monitoring/metrics', false, error.message)
  }
}

/**
 * 3. 测试环境变量
 */
function testEnvironmentVariables() {
  console.log('\n🔧 检查环境变量...')
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NOTION_TOKEN',
    'NOTION_DATABASE_ID'
  ]

  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      logTest(`环境变量 - ${varName}`, true)
    } else {
      logTest(`环境变量 - ${varName}`, false, '未设置')
    }
  })

  // 检查功能开关
  const featureFlags = [
    'NEXT_PUBLIC_REALTIME_ENABLED',
    'NEXT_PUBLIC_ANALYTICS_ENABLED',
    'NEXT_PUBLIC_MONITORING_ENABLED'
  ]

  featureFlags.forEach(flag => {
    const value = process.env[flag]
    logTest(`功能开关 - ${flag}`, value === 'true', value === 'true' ? '已启用' : '未启用')
  })
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🧪 开始部署测试（简化版）...\n')

  // 测试环境变量
  testEnvironmentVariables()

  // 测试数据库连接
  console.log('\n💾 测试数据库连接...')
  await testDatabaseConnection()

  // 如果是本地开发环境，测试 API
  if (API_BASE_URL.includes('localhost')) {
    await testAPIs()
  } else {
    console.log('\n⏩ 跳过 API 测试（非本地环境）')
  }

  // 输出测试结果
  console.log('\n📊 测试结果汇总：')
  const passed = testResults.filter(r => r.passed).length
  const failed = testResults.filter(r => !r.passed).length
  
  console.log(`总计：${testResults.length} 项`)
  console.log(`✅ 通过：${passed} 项`)
  console.log(`❌ 失败：${failed} 项`)

  if (failed > 0) {
    console.log('\n失败的测试：')
    testResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`- ${r.test}: ${r.error}`)
      })
  }

  // 部署建议
  console.log('\n📝 部署建议：')
  if (failed === 0) {
    console.log('✅ 所有测试通过，可以进行部署！')
  } else {
    console.log('⚠️  部分测试失败，请检查：')
    console.log('1. 确保 .env.local 中的 Supabase 密钥正确')
    console.log('2. 确保数据库迁移脚本已执行')
    console.log('3. 如果是本地测试，确保开发服务器正在运行')
  }

  // 退出码
  process.exit(failed > 0 ? 1 : 0)
}

// 运行测试
runTests().catch(console.error)