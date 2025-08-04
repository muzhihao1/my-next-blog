/**
 * 修复中文Slug问题
 */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('@notionhq/client');

async function fixChineseSlug() {
  console.log('🔧 修复中文Slug问题...\n');
  
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });
  
  // 问题文章的Page ID
  const pageId = '22b1b640-00a7-8115-9b64-d85bdeb94418';
  const newSlug = '4-hours-daily-efficiency-boost';
  
  try {
    // 先获取当前文章信息
    console.log('📄 获取文章当前信息...');
    const currentPage = await notion.pages.retrieve({ page_id: pageId });
    const currentSlug = currentPage.properties?.Slug?.rich_text?.[0]?.plain_text;
    const title = currentPage.properties?.Title?.title?.[0]?.plain_text;
    
    console.log(`   标题: ${title}`);
    console.log(`   当前Slug: "${currentSlug}"`);
    console.log(`   新Slug: "${newSlug}"`);
    console.log('');
    
    // 更新Slug
    console.log('⏳ 正在更新Slug...');
    const updateResponse = await notion.pages.update({
      page_id: pageId,
      properties: {
        Slug: {
          rich_text: [
            {
              text: {
                content: newSlug
              }
            }
          ]
        }
      }
    });
    
    console.log('✅ Slug更新成功!');
    console.log(`   更新时间: ${updateResponse.last_edited_time}`);
    
    // 验证更新结果
    console.log('\n🔍 验证更新结果...');
    const updatedPage = await notion.pages.retrieve({ page_id: pageId });
    const verifySlug = updatedPage.properties?.Slug?.rich_text?.[0]?.plain_text;
    
    if (verifySlug === newSlug) {
      console.log('✅ 验证成功! 新Slug已生效');
      console.log(`   新的文章URL: /posts/${newSlug}`);
    } else {
      console.log('❌ 验证失败! Slug可能未正确更新');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    return false;
  }
}

fixChineseSlug();