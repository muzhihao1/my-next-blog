/**
 * Algolia 搜索索引构建脚本
 * 用于初始化和更新搜索索引
 */

require('dotenv').config({ path: '.env.local' })
const { algoliasearch } = require('algoliasearch')
const { createClient } = require('@supabase/supabase-js')

// 验证环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_ALGOLIA_APP_ID',
  'ALGOLIA_ADMIN_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
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

const index = algoliaClient.initIndex('posts')

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * 从 Supabase 获取所有文章
 */
async function fetchAllPosts() {
  console.log('正在从数据库获取文章...')
  
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:author_id(name, avatar_url),
      tags:post_tags(tag:tag_id(name))
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`获取文章失败: ${error.message}`)
  }

  console.log(`成功获取 ${posts.length} 篇文章`)
  return posts
}

/**
 * 处理文章内容，提取纯文本
 */
function extractTextContent(content) {
  // 移除 HTML 标签
  const text = content.replace(/<[^>]*>/g, '')
  // 移除多余空白
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * 计算阅读时间（分钟）
 */
function calculateReadingTime(content) {
  const wordsPerMinute = 200 // 中文阅读速度
  const wordCount = content.length // 简单估算
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * 转换文章为 Algolia 格式
 */
function transformPostsForAlgolia(posts) {
  return posts.map(post => ({
    objectID: post.id,
    title: post.title,
    content: extractTextContent(post.content).substring(0, 5000), // 限制内容长度
    excerpt: post.excerpt || extractTextContent(post.content).substring(0, 200),
    author: post.author?.name || '匿名',
    authorId: post.author_id,
    tags: post.tags?.map(t => t.tag.name) || [],
    date: post.created_at,
    updatedAt: post.updated_at,
    slug: post.slug,
    coverImage: post.cover_image,
    readingTime: calculateReadingTime(post.content),
    viewCount: post.view_count || 0,
    likeCount: post.like_count || 0,
    commentCount: post.comment_count || 0,
    // 用于搜索结果排序
    _rankingInfo: {
      date: new Date(post.created_at).getTime(),
      popularity: (post.view_count || 0) + (post.like_count || 0) * 10 + (post.comment_count || 0) * 5
    }
  }))
}

/**
 * 配置 Algolia 索引设置
 */
async function configureIndex() {
  console.log('配置索引设置...')
  
  await index.setSettings({
    // 可搜索属性（按优先级排序）
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
      'authorId',
      'date',
      'tags',
      'slug',
      'coverImage',
      'readingTime',
      'viewCount',
      'likeCount',
      'commentCount'
    ],
    
    // 自定义排序规则
    customRanking: [
      'desc(_rankingInfo.popularity)',
      'desc(_rankingInfo.date)'
    ],
    
    // 分面搜索属性
    attributesForFaceting: [
      'searchable(tags)',
      'author',
      'filterOnly(authorId)'
    ],
    
    // 中文优化
    queryLanguages: ['zh', 'en'],
    indexLanguages: ['zh'],
    removeStopWords: ['zh', 'en'],
    
    // 高亮设置
    attributesToHighlight: ['title', 'excerpt', 'content'],
    highlightPreTag: '<mark class="search-highlight">',
    highlightPostTag: '</mark>',
    
    // 片段设置
    attributesToSnippet: ['content:50', 'excerpt:30'],
    snippetEllipsisText: '...',
    
    // 性能优化
    hitsPerPage: 20,
    maxValuesPerFacet: 50,
    
    // 相关性设置
    typoTolerance: true,
    minWordSizefor1Typo: 4,
    minWordSizefor2Typos: 8,
    allowTyposOnNumericTokens: false,
    
    // 同义词和复数
    ignorePlurals: ['zh'],
    removeWordsIfNoResults: 'allOptional',
    
    // 精确匹配优先
    exactOnSingleWordQuery: 'attribute',
    alternativesAsExact: ['ignorePlurals', 'singleWordSynonym']
  })
  
  console.log('索引设置配置完成')
}

/**
 * 设置搜索同义词
 */
async function configureSynonyms() {
  console.log('配置同义词...')
  
  const synonyms = [
    {
      objectID: 'js-synonyms',
      type: 'synonym',
      synonyms: ['js', 'javascript', 'es6', 'es2015', 'ecmascript']
    },
    {
      objectID: 'react-synonyms',
      type: 'synonym',  
      synonyms: ['react', 'reactjs', 'react.js']
    },
    {
      objectID: 'vue-synonyms',
      type: 'synonym',
      synonyms: ['vue', 'vuejs', 'vue.js']
    },
    {
      objectID: 'frontend-synonyms',
      type: 'synonym',
      synonyms: ['前端', 'frontend', 'front-end', 'fe']
    },
    {
      objectID: 'backend-synonyms',
      type: 'synonym',
      synonyms: ['后端', 'backend', 'back-end', 'be', '服务端']
    }
  ]
  
  await index.saveSynonyms(synonyms, { forwardToReplicas: true })
  console.log('同义词配置完成')
}

/**
 * 主函数：构建搜索索引
 */
async function buildSearchIndex() {
  try {
    console.log('========================================')
    console.log('开始构建 Algolia 搜索索引')
    console.log('========================================')
    
    // 1. 配置索引
    await configureIndex()
    
    // 2. 获取文章数据
    const posts = await fetchAllPosts()
    
    if (posts.length === 0) {
      console.log('没有找到已发布的文章')
      return
    }
    
    // 3. 转换数据格式
    const algoliaObjects = transformPostsForAlgolia(posts)
    
    // 4. 清空现有索引（可选）
    console.log('清空现有索引...')
    await index.clearObjects()
    
    // 5. 批量上传数据
    console.log(`正在上传 ${algoliaObjects.length} 篇文章到 Algolia...`)
    const { objectIDs } = await index.saveObjects(algoliaObjects)
    
    console.log(`成功索引 ${objectIDs.length} 篇文章`)
    
    // 6. 配置同义词
    await configureSynonyms()
    
    console.log('========================================')
    console.log('✅ 搜索索引构建完成！')
    console.log('========================================')
    
    // 7. 测试搜索
    console.log('\n测试搜索功能...')
    const searchResult = await index.search('', { hitsPerPage: 1 })
    console.log(`索引中共有 ${searchResult.nbHits} 条记录`)
    
  } catch (error) {
    console.error('❌ 索引构建失败:', error)
    process.exit(1)
  }
}

// 支持命令行参数
const args = process.argv.slice(2)
if (args.includes('--help')) {
  console.log(`
Algolia 搜索索引构建脚本

用法: node scripts/build-search-index.js [选项]

选项:
  --help     显示帮助信息
  --dry-run  模拟运行，不实际更新索引

环境变量:
  NEXT_PUBLIC_ALGOLIA_APP_ID       Algolia 应用 ID
  ALGOLIA_ADMIN_API_KEY           Algolia 管理员密钥
  NEXT_PUBLIC_SUPABASE_URL        Supabase URL
  SUPABASE_SERVICE_ROLE_KEY       Supabase 服务密钥
  `)
  process.exit(0)
}

// 执行构建
buildSearchIndex()