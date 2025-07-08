/**
 * Algolia 搜索索引构建脚本 - 从 Notion 获取数据
 * 在 Supabase 数据库准备好之前的临时方案
 */

require('dotenv').config({ path: '.env.local' })
const { algoliasearch } = require('algoliasearch')
const { Client } = require('@notionhq/client')
const { NotionToMarkdown } = require('notion-to-md')

// 验证环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_ALGOLIA_APP_ID',
  'ALGOLIA_ADMIN_API_KEY',
  'NOTION_TOKEN',
  'NOTION_DATABASE_ID'
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`错误: 缺少环境变量 ${envVar}`)
    process.exit(1)
  }
}

// 初始化 Algolia 客户端
const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
)

// 初始化 Notion 客户端
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const n2m = new NotionToMarkdown({ notionClient: notion })

/**
 * 从 Notion 获取所有文章
 */
async function fetchPostsFromNotion() {
  console.log('正在从 Notion 获取文章...')
  
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true
        }
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending'
        }
      ]
    })
    
    console.log(`成功获取 ${response.results.length} 篇文章`)
    return response.results
  } catch (error) {
    console.error('Notion 查询错误:', error)
    throw error
  }
}

/**
 * 获取页面内容
 */
async function getPageContent(pageId) {
  try {
    const mdblocks = await n2m.pageToMarkdown(pageId)
    const mdString = n2m.toMarkdownString(mdblocks)
    return mdString.parent || ''
  } catch (error) {
    console.error(`获取页面内容失败 ${pageId}:`, error)
    return ''
  }
}

/**
 * 提取纯文本内容
 */
function extractTextFromMarkdown(markdown) {
  if (!markdown) return ''
  
  // 移除 Markdown 语法
  let text = markdown
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码
    .replace(/`[^`]*`/g, '')
    // 移除链接
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // 移除标题标记
    .replace(/#{1,6}\s+/g, '')
    // 移除列表标记
    .replace(/^\s*[-*+]\s+/gm, '')
    // 移除引用标记
    .replace(/^\s*>\s+/gm, '')
    // 移除粗体和斜体标记
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // 移除多余空白
    .replace(/\s+/g, ' ')
    .trim()
  
  return text
}

/**
 * 转换 Notion 页面为 Algolia 格式
 */
async function transformNotionToAlgolia(pages) {
  const objects = []
  
  for (const page of pages) {
    try {
      // 获取页面属性
      const properties = page.properties
      
      // 提取标题
      const title = properties.Title?.title?.[0]?.plain_text || 
                   properties.Name?.title?.[0]?.plain_text || 
                   '无标题'
      
      // 提取作者
      const author = properties.Author?.created_by?.name ||
                    properties.Author?.people?.[0]?.name ||
                    '匿名'
      
      // 提取日期
      const date = properties.Date?.date?.start || 
                  properties.Created?.created_time ||
                  page.created_time
      
      // 提取标签
      const tags = properties.Tags?.multi_select?.map(tag => tag.name) || []
      
      // 生成 slug
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      // 获取页面内容
      console.log(`正在处理: ${title}`)
      const content = await getPageContent(page.id)
      const textContent = extractTextFromMarkdown(content)
      
      // 计算阅读时间
      const readingTime = Math.max(1, Math.ceil(textContent.length / 200))
      
      // 构建 Algolia 对象
      objects.push({
        objectID: page.id,
        title,
        content: textContent.substring(0, 5000), // 限制长度
        excerpt: textContent.substring(0, 200) + '...',
        author,
        tags,
        date,
        slug,
        readingTime,
        url: page.url,
        // 排序信息
        _rankingInfo: {
          date: new Date(date).getTime()
        }
      })
      
    } catch (error) {
      console.error(`处理页面失败 ${page.id}:`, error)
    }
  }
  
  return objects
}

/**
 * 主函数：构建搜索索引
 */
async function buildSearchIndex() {
  try {
    console.log('========================================')
    console.log('开始构建 Algolia 搜索索引 (从 Notion)')
    console.log('========================================')
    
    // 1. 获取 Notion 文章
    const pages = await fetchPostsFromNotion()
    
    if (pages.length === 0) {
      console.log('没有找到已发布的文章')
      return
    }
    
    // 2. 转换数据格式
    const algoliaObjects = await transformNotionToAlgolia(pages)
    console.log(`成功转换 ${algoliaObjects.length} 篇文章`)
    
    // 3. 保存到 Algolia
    console.log('正在上传到 Algolia...')
    
    const saveResult = await algoliaClient.saveObjects({
      indexName: 'posts',
      objects: algoliaObjects
    })
    
    console.log('保存结果:', saveResult)
    
    // 等待任务完成
    if (saveResult.taskID) {
      await algoliaClient.waitForTask({ 
        indexName: 'posts', 
        taskID: saveResult.taskID 
      })
    }
    
    console.log(`成功索引 ${algoliaObjects.length} 篇文章`)
    
    // 4. 配置索引设置
    console.log('配置索引设置...')
    
    const settingsResult = await algoliaClient.setSettings({
      indexName: 'posts',
      indexSettings: {
        // 可搜索属性
        searchableAttributes: [
          'title',
          'excerpt',
          'content',
          'tags',
          'author'
        ],
        
        // 返回的属性
        attributesToRetrieve: [
          'objectID',
          'title',
          'excerpt',
          'author',
          'date',
          'tags',
          'slug',
          'readingTime',
          'url'
        ],
        
        // 自定义排序
        customRanking: ['desc(_rankingInfo.date)'],
        
        // 分面搜索
        attributesForFaceting: ['searchable(tags)', 'author'],
        
        // 中文优化
        queryLanguages: ['zh', 'en'],
        indexLanguages: ['zh'],
        
        // 高亮设置
        attributesToHighlight: ['title', 'excerpt', 'content'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        
        // 片段设置
        attributesToSnippet: ['content:50', 'excerpt:30'],
        snippetEllipsisText: '...'
      }
    })
    
    if (settingsResult.taskID) {
      await algoliaClient.waitForTask({ 
        indexName: 'posts', 
        taskID: settingsResult.taskID 
      })
    }
    console.log('索引设置配置完成')
    
    console.log('========================================')
    console.log('✅ 搜索索引构建完成！')
    console.log('========================================')
    
    // 5. 测试搜索
    console.log('\n测试搜索功能...')
    try {
      const searchResults = await algoliaClient.search({
        requests: [{
          indexName: 'posts',
          query: '',
          hitsPerPage: 1
        }]
      })
      
      if (searchResults.results && searchResults.results[0]) {
        console.log(`索引中共有 ${searchResults.results[0].nbHits} 条记录`)
        console.log('\n✅ 您现在可以在博客中使用搜索功能了！')
      }
    } catch (searchError) {
      console.log('搜索测试失败，但索引已成功创建')
      console.log('\n✅ 您现在可以在博客中使用搜索功能了！')
    }
    
  } catch (error) {
    console.error('❌ 索引构建失败:', error)
    process.exit(1)
  }
}

// 执行构建
buildSearchIndex()