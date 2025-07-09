/**
 * 测试链接功能是否恢复正常
 * 使用 Playwright 自动化测试
 */

const { chromium } = require('playwright')

async function testLinks() {
  console.log('🧪 开始测试链接功能...\n')
  
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // 1. 访问首页
    console.log('1️⃣ 访问首页...')
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // 2. 测试导航栏链接
    console.log('\n2️⃣ 测试导航栏链接...')
    const navLinks = await page.$$('nav a[href^="/"]')
    console.log(`  找到 ${navLinks.length} 个导航链接`)
    
    // 测试第一个导航链接
    if (navLinks.length > 0) {
      const firstLink = navLinks[0]
      const href = await firstLink.getAttribute('href')
      console.log(`  尝试点击链接: ${href}`)
      
      // 记录点击前的 URL
      const beforeUrl = page.url()
      
      // 点击链接
      await firstLink.click()
      
      // 等待导航
      try {
        await page.waitForURL(url => url !== beforeUrl, { timeout: 3000 })
        console.log(`  ✅ 链接点击成功！跳转到: ${page.url()}`)
      } catch (e) {
        console.log(`  ❌ 链接点击失败！仍在: ${page.url()}`)
      }
    }
    
    // 3. 返回首页
    console.log('\n3️⃣ 返回首页...')
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // 4. 测试文章列表链接（如果有）
    console.log('\n4️⃣ 测试文章列表链接...')
    const articleLinks = await page.$$('a[href^="/posts/"]')
    console.log(`  找到 ${articleLinks.length} 个文章链接`)
    
    if (articleLinks.length > 0) {
      const firstArticle = articleLinks[0]
      const href = await firstArticle.getAttribute('href')
      console.log(`  尝试点击文章链接: ${href}`)
      
      const beforeUrl = page.url()
      await firstArticle.click()
      
      try {
        await page.waitForURL(url => url !== beforeUrl, { timeout: 3000 })
        console.log(`  ✅ 文章链接点击成功！跳转到: ${page.url()}`)
      } catch (e) {
        console.log(`  ❌ 文章链接点击失败！仍在: ${page.url()}`)
      }
    }
    
    // 5. 检查控制台错误
    console.log('\n5️⃣ 检查控制台错误...')
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`  ❌ 控制台错误: ${msg.text()}`)
      }
    })
    
    // 6. 总结
    console.log('\n📊 测试总结:')
    console.log('  - 导航链接测试完成')
    console.log('  - 文章链接测试完成')
    console.log('  - 如果看到 ✅，说明链接功能已恢复正常')
    console.log('  - 如果看到 ❌，说明链接问题仍然存在')
    
  } catch (error) {
    console.error('测试过程中出错:', error)
  } finally {
    // 保持浏览器打开 10 秒以便观察
    console.log('\n⏰ 10秒后关闭浏览器...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    await browser.close()
  }
}

// 运行测试
testLinks().catch(console.error)