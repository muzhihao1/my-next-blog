/**
 * 检查Notion数据库中的中文Slug问题
 */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('@notionhq/client');

async function checkChineseSlugs() {
  console.log('🔍 检查中文Slug问题...\n');
  
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });
  
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      sorts: [
        {
          property: 'Date',
          direction: 'descending'
        }
      ]
    });
    
    console.log('📋 文章Slug检查结果:\n');
    
    let chineseSlugCount = 0;
    let problemSlugs = [];
    
    response.results.forEach((post, index) => {
      const title = post.properties?.Title?.title?.[0]?.plain_text || 'Untitled';
      const slug = post.properties?.Slug?.rich_text?.[0]?.plain_text || 'no-slug';
      const published = post.properties?.Published?.checkbox || false;
      
      // 检查是否包含中文字符
      const hasChinese = /[\u4e00-\u9fa5]/.test(slug);
      const hasSpecialChars = /[^a-zA-Z0-9\-_]/.test(slug);
      
      let status = '✅ 正常';
      if (hasChinese) {
        status = '❌ 包含中文';
        chineseSlugCount++;
        problemSlugs.push({
          title,
          slug,
          pageId: post.id,
          published,
          issue: 'chinese'
        });
      } else if (hasSpecialChars) {
        status = '⚠️ 特殊字符';
        problemSlugs.push({
          title,
          slug,
          pageId: post.id,
          published,
          issue: 'special'
        });
      }
      
      if (hasChinese || hasSpecialChars || index < 10) {
        console.log(`${index + 1}. ${title.substring(0, 40)}...`);
        console.log(`   Slug: "${slug}"`);
        console.log(`   状态: ${status}`);
        console.log(`   发布: ${published ? '✅' : '❌'}`);
        console.log('');
      }
    });
    
    console.log(`\n📊 统计结果:`);
    console.log(`   总文章数: ${response.results.length}`);
    console.log(`   中文Slug数: ${chineseSlugCount}`);
    console.log(`   问题Slug数: ${problemSlugs.length}`);
    
    if (problemSlugs.length > 0) {
      console.log(`\n🚨 需要修复的文章:`);
      problemSlugs.forEach((article, index) => {
        console.log(`${index + 1}. "${article.title}"`);
        console.log(`   当前Slug: "${article.slug}"`);
        console.log(`   页面ID: ${article.pageId}`);
        console.log(`   问题类型: ${article.issue === 'chinese' ? '中文字符' : '特殊字符'}`);
        
        // 建议新的slug
        let suggestedSlug = article.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // 移除特殊字符
          .replace(/\s+/g, '-')     // 空格替换为连字符
          .substring(0, 50);        // 限制长度
        
        // 如果全是中文，使用拼音或英文翻译
        if (/^[\u4e00-\u9fa5\s-]+$/.test(article.title)) {
          // 针对特定文章提供建议
          if (article.title.includes('每天只需4小时')) {
            suggestedSlug = '4-hours-daily-efficiency';
          } else if (article.title.includes('总结')) {
            suggestedSlug = article.slug.replace(/[\u4e00-\u9fa5]/g, '').replace(/[^a-zA-Z0-9-]/g, '') || 'summary';
          }
        }
        
        console.log(`   建议Slug: "${suggestedSlug}"`);
        console.log('');
      });
    }
    
    return problemSlugs;
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    return [];
  }
}

checkChineseSlugs();