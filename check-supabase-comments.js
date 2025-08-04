/**
 * 检查Supabase评论系统配置
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkSupabaseComments() {
  console.log('🔍 检查Supabase评论系统...\n');
  
  // 检查环境变量
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Supabase环境变量未配置');
    console.log('   需要: NEXT_PUBLIC_SUPABASE_URL');
    console.log('   需要: NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return false;
  }
  
  console.log('✅ Supabase环境变量已配置');
  console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  try {
    // 1. 测试基本连接
    console.log('\n📊 测试Supabase连接...');
    const { data: testData, error: testError } = await supabase
      .from('comments')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ 无法连接到comments表:', testError.message);
      
      if (testError.message.includes('relation') || testError.message.includes('does not exist')) {
        console.log('   → comments表可能不存在');
        console.log('   → 请运行数据库初始化脚本创建表');
        
        // 显示创建表的SQL
        console.log('\n📝 建议运行以下SQL创建comments表:');
        console.log(`
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT DEFAULT 'post',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- 创建索引
CREATE INDEX idx_comments_content_id ON comments(content_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 启用RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS政策
CREATE POLICY "Allow public read" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow owner update" ON comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow owner delete" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
        `);
      }
      return false;
    }
    
    console.log('✅ 成功连接到comments表');
    
    // 2. 检查user_profiles表
    console.log('\n📊 检查user_profiles表...');
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (profileError) {
      console.error('❌ 无法连接到user_profiles表:', profileError.message);
      console.log('   → user_profiles表可能不存在');
      console.log('\n📝 建议运行以下SQL创建user_profiles表:');
      console.log(`
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS政策
CREATE POLICY "Allow public read" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow owner update" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
      `);
      return false;
    }
    
    console.log('✅ 成功连接到user_profiles表');
    
    // 3. 测试实际查询
    console.log('\n📊 测试评论查询...');
    const testContentId = '2411b640-00a7-8059-b731-dd025e851b7f';
    const { data: comments, error: queryError } = await supabase
      .from('comments')
      .select(`
        *,
        user_profiles!inner (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('content_id', testContentId)
      .eq('content_type', 'post')
      .is('parent_id', null);
    
    if (queryError) {
      console.error('❌ 评论查询失败:', queryError.message);
      return false;
    }
    
    console.log(`✅ 评论查询成功，找到 ${comments?.length || 0} 条评论`);
    
    // 4. 检查表结构
    console.log('\n📊 检查表结构...');
    const { data: tableInfo, error: infoError } = await supabase
      .from('comments')
      .select('*')
      .limit(0);
    
    if (!infoError) {
      console.log('✅ comments表结构正常');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ 检查过程出错:', error.message);
    return false;
  }
}

checkSupabaseComments();