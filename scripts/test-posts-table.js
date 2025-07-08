require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPostsTable() {
  console.log('检查 posts 表...');
  
  // 测试简单查询
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .limit(1);
  
  if (postsError) {
    console.error('Posts 表查询错误:', postsError);
    return;
  }
  
  console.log('Posts 表存在，数据数量:', posts.length);
  if (posts.length > 0) {
    console.log('示例数据结构:', Object.keys(posts[0]));
  }
  
  // 测试 users 表
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (usersError) {
    console.error('Users 表查询错误:', usersError);
  } else {
    console.log('Users 表存在');
  }
  
  // 测试 tags 表
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('*')
    .limit(1);
  
  if (tagsError) {
    console.error('Tags 表查询错误:', tagsError);
  } else {
    console.log('Tags 表存在');
  }
}

testPostsTable();