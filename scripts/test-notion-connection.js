/**
 * Notion API 连接测试脚本
 * 用于验证 Notion 集成配置是否正确
 */

const { Client } = require('@notionhq/client')
require('dotenv').config({ path: '.env.local' })

// ANSI 颜色代码
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

// 初始化 Notion 客户端
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

/**
 * 测试基本 API 连接
 */
async function testBasicConnection() {
  console.log(`\n${colors.blue}🔍 测试基本 API 连接...${colors.reset}`)
  
  try {
    const response = await notion.users.list({})
    console.log(`${colors.green}✅ API 连接成功！${colors.reset}`)
    console.log(`   找到 ${response.results.length} 个用户`)
    
    if (response.results.length > 0) {
      const user = response.results[0]
      console.log(`   第一个用户: ${user.name || '未命名'}`)
    }
    
    return true
  } catch (error) {
    console.error(`${colors.red}❌ API 连接失败: ${error.message}${colors.reset}`)
    return false
  }
}

/**
 * 测试数据库访问
 */
async function testDatabaseAccess(databaseId, databaseName) {
  if (!databaseId) {
    console.log(`${colors.yellow}⚠️  ${databaseName} ID 未配置，跳过测试${colors.reset}`)
    return null
  }
  
  console.log(`\n${colors.blue}🔍 测试 ${databaseName} 数据库访问...${colors.reset}`)
  
  try {
    // 获取数据库信息
    const database = await notion.databases.retrieve({
      database_id: databaseId
    })
    
    const title = database.title[0]?.plain_text || '未命名数据库'
    console.log(`${colors.green}✅ 数据库连接成功！${colors.reset}`)
    console.log(`   数据库名称: ${title}`)
    
    // 查询数据库内容
    const query = await notion.databases.query({
      database_id: databaseId,
      page_size: 5
    })
    
    console.log(`   找到 ${query.results.length} 条记录`)
    
    // 显示数据库属性
    console.log(`   数据库属性:`)
    Object.entries(database.properties).forEach(([key, prop]) => {
      console.log(`     - ${key} (${prop.type})`)
    })
    
    return true
  } catch (error) {
    console.error(`${colors.red}❌ 数据库访问失败: ${error.message}${colors.reset}`)
    
    // 提供具体的错误指导
    if (error.code === 'object_not_found') {
      console.log(`${colors.yellow}   提示: 请检查数据库 ID 是否正确，并确保集成已被邀请到该数据库${colors.reset}`)
    } else if (error.code === 'unauthorized') {
      console.log(`${colors.yellow}   提示: 请检查 API Token 是否正确，或集成权限是否足够${colors.reset}`)
    }
    
    return false
  }
}

/**
 * 测试文章内容获取
 */
async function testContentRetrieval() {
  const databaseId = process.env.NOTION_DATABASE_ID
  
  if (!databaseId) {
    console.log(`${colors.yellow}⚠️  主数据库 ID 未配置，跳过内容测试${colors.reset}`)
    return
  }
  
  console.log(`\n${colors.blue}🔍 测试文章内容获取...${colors.reset}`)
  
  try {
    // 查询已发布的文章
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true
        }
      },
      page_size: 1
    })
    
    if (response.results.length === 0) {
      console.log(`${colors.yellow}⚠️  没有找到已发布的文章${colors.reset}`)
      return
    }
    
    const page = response.results[0]
    const title = page.properties.Title?.title[0]?.plain_text || '未命名'
    
    console.log(`${colors.green}✅ 成功获取文章: ${title}${colors.reset}`)
    
    // 获取页面内容
    const blocks = await notion.blocks.children.list({
      block_id: page.id,
      page_size: 5
    })
    
    console.log(`   文章包含 ${blocks.results.length} 个内容块`)
    
  } catch (error) {
    console.error(`${colors.red}❌ 内容获取失败: ${error.message}${colors.reset}`)
  }
}

/**
 * 生成测试报告
 */
async function generateReport(results) {
  console.log(`\n${colors.blue}📊 测试报告${colors.reset}`)
  console.log('=' * 50)
  
  const total = Object.keys(results).length
  const passed = Object.values(results).filter(r => r === true).length
  const failed = Object.values(results).filter(r => r === false).length
  const skipped = Object.values(results).filter(r => r === null).length
  
  console.log(`总测试项: ${total}`)
  console.log(`${colors.green}通过: ${passed}${colors.reset}`)
  console.log(`${colors.red}失败: ${failed}${colors.reset}`)
  console.log(`${colors.yellow}跳过: ${skipped}${colors.reset}`)
  
  if (failed > 0) {
    console.log(`\n${colors.red}❌ 部分测试失败，请检查配置${colors.reset}`)
  } else if (passed === total) {
    console.log(`\n${colors.green}✅ 所有测试通过！Notion 集成配置正确${colors.reset}`)
  } else {
    console.log(`\n${colors.yellow}⚠️  部分功能未配置，但已配置的功能正常${colors.reset}`)
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log(`${colors.blue}🚀 开始 Notion API 连接测试${colors.reset}`)
  console.log('=' * 50)
  
  // 检查环境变量
  if (!process.env.NOTION_TOKEN) {
    console.error(`${colors.red}❌ 错误: NOTION_TOKEN 环境变量未设置${colors.reset}`)
    console.log(`${colors.yellow}请在 .env.local 文件中设置 NOTION_TOKEN${colors.reset}`)
    process.exit(1)
  }
  
  const results = {}
  
  // 运行测试
  results['API连接'] = await testBasicConnection()
  
  if (results['API连接']) {
    results['主数据库'] = await testDatabaseAccess(
      process.env.NOTION_DATABASE_ID, 
      '博客文章'
    )
    
    results['书籍数据库'] = await testDatabaseAccess(
      process.env.NOTION_BOOKS_DB,
      '书籍'
    )
    
    results['项目数据库'] = await testDatabaseAccess(
      process.env.NOTION_PROJECTS_DB,
      '项目'
    )
    
    results['工具数据库'] = await testDatabaseAccess(
      process.env.NOTION_TOOLS_DB,
      '工具'
    )
    
    await testContentRetrieval()
  }
  
  // 生成报告
  await generateReport(results)
}

// 运行测试
runTests().catch(error => {
  console.error(`${colors.red}测试过程中发生错误: ${error.message}${colors.reset}`)
  process.exit(1)
})