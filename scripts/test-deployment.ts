#!/usr/bin/env node

/**
 * 部署测试脚本
 * 验证实时交互、数据分析和性能监控功能
 */

import 'dotenv/config'
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
    const { data, error } = await supabase
      .from('comments')
      .select('count')
      .limit(1)
    
    if (error) throw error
    logTest('数据库连接', true)
  } catch (error: any) {
    logTest('数据库连接', false, error.message)
  }
}

/**
 * 2. 测试实时功能
 */
async function testRealtimeConnection() {
  return new Promise<void>((resolve) => {
    const channel = supabase
      .channel('test-channel')
      .on('presence', { event: 'sync' }, () => {
        logTest('实时连接 - Presence', true)
      })
      .on('broadcast', { event: 'test' }, (payload) => {
        logTest('实时连接 - Broadcast', true)
        channel.unsubscribe()
        resolve()
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logTest('实时连接 - 订阅', true)
          // 发送测试消息
          channel.send({
            type: 'broadcast',
            event: 'test',
            payload: { message: 'test' }
          })
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          logTest('实时连接 - 订阅', false, `Status: ${status}`)
          resolve()
        }
      })

    // 超时处理
    setTimeout(() => {
      logTest('实时连接', false, '连接超时')
      channel.unsubscribe()
      resolve()
    }, 10000)
  })
}

/**
 * 3. 测试数据分析API
 */
async function testAnalyticsAPI() {
  // 测试收集API
  try {
    const collectResponse = await fetch(`${API_BASE_URL}/api/analytics/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [{
          event_type: 'page_view',
          timestamp: new Date().toISOString(),
          session_id: 'test-session',
          anonymous_id: 'test-user',
          device: {
            type: 'desktop',
            browser: 'chrome',
            os: 'macos'
          },
          page: {
            path: '/test',
            title: 'Test Page'
          }
        }]
      })
    })

    if (!collectResponse.ok) throw new Error(`Status: ${collectResponse.status}`)
    logTest('数据分析 - 收集API', true)
  } catch (error: any) {
    logTest('数据分析 - 收集API', false, error.message)
  }

  // 测试统计API
  try {
    const statsResponse = await fetch(`${API_BASE_URL}/api/analytics/stats`)
    if (!statsResponse.ok) throw new Error(`Status: ${statsResponse.status}`)
    
    const stats = await statsResponse.json()
    logTest('数据分析 - 统计API', true)
  } catch (error: any) {
    logTest('数据分析 - 统计API', false, error.message)
  }

  // 测试热门内容API
  try {
    const popularResponse = await fetch(`${API_BASE_URL}/api/analytics/popular`)
    if (!popularResponse.ok) throw new Error(`Status: ${popularResponse.status}`)
    
    const popular = await popularResponse.json()
    logTest('数据分析 - 热门内容API', true)
  } catch (error: any) {
    logTest('数据分析 - 热门内容API', false, error.message)
  }
}

/**
 * 4. 测试性能监控API
 */
async function testMonitoringAPI() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: [{
          metric_type: 'largest_contentful_paint',
          value: 2500,
          unit: 'millisecond',
          rating: 'good',
          timestamp: new Date().toISOString(),
          context: {
            page: '/test',
            user_agent: 'test-agent'
          }
        }]
      })
    })

    if (!response.ok) throw new Error(`Status: ${response.status}`)
    logTest('性能监控 - 指标收集API', true)
  } catch (error: any) {
    logTest('性能监控 - 指标收集API', false, error.message)
  }

  // 测试查询API
  try {
    const queryResponse = await fetch(`${API_BASE_URL}/api/monitoring/metrics?metric_type=largest_contentful_paint`)
    if (!queryResponse.ok) throw new Error(`Status: ${queryResponse.status}`)
    
    const metrics = await queryResponse.json()
    logTest('性能监控 - 查询API', true)
  } catch (error: any) {
    logTest('性能监控 - 查询API', false, error.message)
  }
}

/**
 * 5. 测试通知功能
 */
async function testNotifications() {
  try {
    // 检查通知表是否存在
    const { error } = await supabase
      .from('notifications')
      .select('count')
      .limit(1)
    
    if (error) throw error
    logTest('通知系统 - 表结构', true)
  } catch (error: any) {
    logTest('通知系统 - 表结构', false, error.message)
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🧪 开始部署测试...\n')

  // 运行所有测试
  await testDatabaseConnection()
  await testRealtimeConnection()
  await testAnalyticsAPI()
  await testMonitoringAPI()
  await testNotifications()

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

  // 退出码
  process.exit(failed > 0 ? 1 : 0)
}

// 运行测试
runTests().catch(console.error)