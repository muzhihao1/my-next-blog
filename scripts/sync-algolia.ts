#!/usr/bin/env tsx

/**
 * Algolia 索引同步脚本
 * 从 Notion 获取内容并同步到 Algolia
 */

import dotenv from 'dotenv'
import { getAdminClient, getIndexName } from '../lib/algolia/client'
import { batchTransform } from '../lib/algolia/transform'
import { getAllPosts } from '../lib/notion'
import { readFile } from 'fs/promises'
import { join } from 'path'

// 加载环境变量
dotenv.config({ path: '.env.local' })

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

/**
 * 从 JSON 文件加载其他类型的内容
 */
async function loadContentFromFiles() {
  try {
    // 这些文件可能不存在，所以使用 try-catch
    const projectsPath = join(process.cwd(), 'data', 'projects.json')
    const booksPath = join(process.cwd(), 'data', 'books.json')
    const toolsPath = join(process.cwd(), 'data', 'tools.json')
    
    const [projects, books, tools] = await Promise.allSettled([
      readFile(projectsPath, 'utf-8').then(JSON.parse),
      readFile(booksPath, 'utf-8').then(JSON.parse),
      readFile(toolsPath, 'utf-8').then(JSON.parse)
    ])
    
    return {
      projects: projects.status === 'fulfilled' ? projects.value : [],
      books: books.status === 'fulfilled' ? books.value : [],
      tools: tools.status === 'fulfilled' ? tools.value : []
    }
  } catch (error) {
    log('无法加载额外内容文件，将只同步博客文章', colors.yellow)
    return { projects: [], books: [], tools: [] }
  }
}

/**
 * 主同步函数
 */
async function syncToAlgolia() {
  log('\n🔄 开始 Algolia 索引同步...', colors.bright + colors.blue)
  
  // 1. 检查配置
  const client = getAdminClient()
  if (!client) {
    log('❌ Algolia 未配置，请检查环境变量', colors.red)
    log('需要设置: ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY', colors.yellow)
    process.exit(1)
  }
  
  const indexName = getIndexName()
  const index = client.initIndex(indexName)
  
  log(`📊 使用索引: ${indexName}`, colors.cyan)
  
  try {
    // 2. 获取所有内容
    log('\n📚 获取内容...', colors.blue)
    
    // 获取博客文章
    const posts = await getAllPosts()
    log(`  ✓ 博客文章: ${posts.length} 篇`, colors.green)
    
    // 获取其他内容
    const { projects, books, tools } = await loadContentFromFiles()
    if (projects.length > 0) log(`  ✓ 项目: ${projects.length} 个`, colors.green)
    if (books.length > 0) log(`  ✓ 书籍: ${books.length} 本`, colors.green)
    if (tools.length > 0) log(`  ✓ 工具: ${tools.length} 个`, colors.green)
    
    // 3. 转换数据
    log('\n🔄 转换数据格式...', colors.blue)
    const records = batchTransform({ posts, projects, books, tools })
    log(`  ✓ 总记录数: ${records.length}`, colors.green)
    
    // 4. 清空并重建索引
    log('\n🗑️  清空现有索引...', colors.yellow)
    await index.clearObjects()
    
    // 5. 批量上传记录
    log('\n📤 上传记录到 Algolia...', colors.blue)
    const batchSize = 100
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      await index.saveObjects(batch)
      log(`  ✓ 已上传: ${Math.min(i + batchSize, records.length)}/${records.length}`, colors.green)
    }
    
    // 6. 配置索引设置
    log('\n⚙️  配置索引设置...', colors.blue)
    await index.setSettings({
      // 可搜索属性（按优先级排序）
      searchableAttributes: [
        'unordered(title)',
        'unordered(description)',
        'unordered(content)',
        'unordered(tags)',
        'author'
      ],
      
      // 用于展示的属性
      attributesToRetrieve: [
        'objectID',
        'type',
        'title',
        'description',
        'author',
        'date',
        'tags',
        'url',
        'image',
        'excerpt'
      ],
      
      // 分面搜索配置
      attributesForFaceting: [
        'searchable(tags)',
        'type',
        'author'
      ],
      
      // 自定义排序
      customRanking: [
        'desc(searchPriority)',
        'desc(date)'
      ],
      
      // 高亮配置
      attributesToHighlight: [
        'title',
        'description',
        'content',
        'tags'
      ],
      
      // 摘要配置
      attributesToSnippet: [
        'content:50',
        'description:30'
      ],
      
      // 其他设置
      hitsPerPage: 20,
      snippetEllipsisText: '...',
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      
      // 拼写纠错
      typoTolerance: true,
      minWordSizefor1Typo: 4,
      minWordSizefor2Typos: 8,
      
      // 同义词
      synonyms: [
        {
          objectID: 'react-synonym',
          type: 'synonym',
          synonyms: ['react', 'reactjs', 'react.js']
        },
        {
          objectID: 'vue-synonym',
          type: 'synonym',
          synonyms: ['vue', 'vuejs', 'vue.js']
        },
        {
          objectID: 'js-synonym',
          type: 'synonym',
          synonyms: ['js', 'javascript', 'ecmascript']
        },
        {
          objectID: 'ts-synonym',
          type: 'synonym',
          synonyms: ['ts', 'typescript']
        }
      ]
    })
    
    log('  ✓ 索引设置已更新', colors.green)
    
    // 7. 获取索引统计
    const { nbHits } = await index.search('')
    log(`\n✅ 同步完成！索引中共有 ${nbHits} 条记录`, colors.bright + colors.green)
    
    // 8. 显示配置提示
    log('\n📝 环境变量配置提示:', colors.cyan)
    log('NEXT_PUBLIC_ALGOLIA_APP_ID=你的应用ID', colors.yellow)
    log('NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=你的搜索密钥', colors.yellow)
    log('ALGOLIA_ADMIN_KEY=你的管理密钥', colors.yellow)
    log(`ALGOLIA_INDEX_NAME=${indexName}`, colors.yellow)
    
  } catch (error) {
    log(`\n❌ 同步失败: ${error}`, colors.red)
    process.exit(1)
  }
}

// 执行同步
if (require.main === module) {
  syncToAlgolia()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { syncToAlgolia }