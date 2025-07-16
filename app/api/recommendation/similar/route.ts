/** * 相似内容推荐API * 获取与指定内容相似的推荐 */
import { NextRequest, NextResponse }
from 'next/server' 

import { ContentBasedAlgorithm }
from '@/lib/recommendation/algorithms/content-based' 

import { ContentFeatures }
from '@/lib/recommendation/types' 

import { createClient }
from '@/lib/supabase/server' // 创建内容相似算法实例 
const contentAlgorithm = new ContentBasedAlgorithm() 

/** * GET - 获取相似内容 */
export async function GET(request: NextRequest) { 
  try { 
    const { searchParams } = new URL(request.url) 
    const postId = searchParams.get('post_id') 
    const count = parseInt(searchParams.get('count') || '5') 
    const excludeSameAuthor = searchParams.get('exclude_same_author') === 'true' 
    
    // 验证参数 
    if (!postId) { 
      return NextResponse.json( 
        { error: 'Post ID is required' }, 
        { status: 400 } 
      ) 
    }
if (count < 1 || count > 20) { 
      return NextResponse.json( 
        { error: 'Count must be between 1 and 20' }, 
        { status: 400 } 
      ) 
    }
const supabase = await createClient() 
    
    // 获取基准文章 
    const { data: basePost } = await supabase 
      .from('posts') 
      .select(` 
        id, 
        title, 
        author, 
        published_at, 
        categories, 
        tags, 
        summary, 
        word_count, 
        read_time, 
        quality_score, 
        views, 
        likes, 
        collects, 
        comments 
      `) 
      .eq('id', postId) 
      .single() 
      
    if (!basePost) { 
      return NextResponse.json( 
        { error: 'Post not found' }, 
        { status: 404 } 
      ) 
    }
// 获取候选文章池 
    let query = supabase 
      .from('posts') 
      .select(` 
        id, 
        title, 
        author, 
        published_at, 
        categories, 
        tags, 
        summary, 
        word_count, 
        read_time, 
        quality_score, 
        views, 
        likes, 
        collects, 
        comments, 
        image_url 
      `) 
      .eq('status', 'published') 
      .neq('id', postId) 
      
    // 排除同作者 
    if (excludeSameAuthor) { 
      query = query.neq('author', basePost.author) 
    }
// 限制候选池大小 
    query = query.limit(200) 
    const { data: candidatePosts } = await query 
    
    if (!candidatePosts || candidatePosts.length === 0) { 
      return NextResponse.json({ 
        similar_posts: [], 
        base_post: { 
          id: basePost.id, 
          title: basePost.title, 
          author: basePost.author, 
        }, 
      }) 
    }
// 转换为内容特征格式 
    const baseFeatures: ContentFeatures = { 
      post_id: basePost.id, 
      title: basePost.title, 
      author: basePost.author, 
      published_at: new Date(basePost.published_at), 
      categories: basePost.categories || [], 
      tags: basePost.tags || [], 
      keywords: [], // TODO: 从内容提取 
      summary: basePost.summary, 
      word_count: basePost.word_count || 0, 
      read_time: basePost.read_time || Math.ceil(basePost.word_count / 200), 
      quality_score: basePost.quality_score, 
      engagement: { 
        views: basePost.views || 0, 
        likes: basePost.likes || 0, 
        collects: basePost.collects || 0, 
        comments: basePost.comments || 0, 
        shares: 0, 
        avg_read_ratio: 0.7, 
      }, 
      updated_at: new Date(), 
    }
const contentPool: ContentFeatures[] = candidatePosts.map(post => ({ 
      post_id: post.id, 
      title: post.title, 
      author: post.author, 
      published_at: new Date(post.published_at), 
      categories: post.categories || [], 
      tags: post.tags || [], 
      keywords: [], 
      summary: post.summary, 
      word_count: post.word_count || 0, 
      read_time: post.read_time || Math.ceil(post.word_count / 200), 
      quality_score: post.quality_score, 
      engagement: { 
        views: post.views || 0, 
        likes: post.likes || 0, 
        collects: post.collects || 0, 
        comments: post.comments || 0, 
        shares: 0, 
        avg_read_ratio: 0.7, 
      }, 
      updated_at: new Date(), 
    })) 
    
    // 获取用户信息（如果已登录） 
    const { data: { session } } = await supabase.auth.getSession() 
    
    let userProfile = null 
    if (session?.user) { 
      const { data: profile } = await supabase 
        .from('user_profiles') 
        .select('*') 
        .eq('user_id', session.user.id) 
        .single() 
        
      if (profile) { 
        userProfile = { 
          user_id: profile.user_id, 
          interests: profile.interests || {}, 
          preferences: profile.preferences || {}, 
          stats: profile.stats || {}, 
          segments: profile.segments || [], 
          updated_at: new Date(profile.updated_at), 
        } 
      } 
    }
// 生成相似内容推荐 
    const candidates = await contentAlgorithm.generateCandidates( 
      userProfile, 
      { 
        count, 
        context: { 
          current_post_id: postId, 
        }, 
      }, 
      contentPool 
    ) 
    
    // 获取推荐的文章详情 
    const recommendedIds = candidates.map(c => c.post_id) 
    const postMap = new Map( 
      candidatePosts 
        .filter(p => recommendedIds.includes(p.id)) 
        .map(p => [p.id, p]) 
    ) 
    
    const similarPosts = candidates 
      .map((candidate, index) => { 
        const post = postMap.get(candidate.post_id) 
        if (!post) return null 
        
        return { 
          ...post, 
          similarity: { 
            rank: index + 1, 
            score: candidate.score, 
            reasons: candidate.reasons, 
            features: candidate.features, 
          }, 
        } 
      }) 
      .filter(Boolean) 
      
    return NextResponse.json({ 
      similar_posts: similarPosts, 
      base_post: { 
        id: basePost.id, 
        title: basePost.title, 
        author: basePost.author, 
        categories: basePost.categories, 
        tags: basePost.tags, 
      }, 
    }) 
  }
catch (error) { 
    console.error('Similar content error:', error) 
    return NextResponse.json( 
      { error: 'Failed to get similar content' }, 
      { status: 500 } 
    ) 
  }
}

/** * POST - 批量获取相似内容 */
export async function POST(request: NextRequest) { 
  try { 
    const body = await request.json() 
    const { post_ids, count = 3 } = body 
    
    if (!post_ids || !Array.isArray(post_ids)) { 
      return NextResponse.json( 
        { error: 'Post IDs array is required' }, 
        { status: 400 } 
      ) 
    }
if (post_ids.length > 10) { 
      return NextResponse.json( 
        { error: 'Maximum 10 posts allowed per request' }, 
        { status: 400 } 
      ) 
    }
const supabase = await createClient() 
    const results: Record<string, any[]> = {}
// 批量处理每个文章 
    for (const postId of post_ids) { 
      try { 
        // 使用GET逻辑的简化版本 
        const url = new URL(request.url) 
        url.searchParams.set('post_id', postId) 
        url.searchParams.set('count', count.toString()) 
        
        const mockRequest = new NextRequest(url) 
        const response = await GET(mockRequest) 
        const data = await response.json() 
        
        if (data.similar_posts) { 
          results[postId] = data.similar_posts 
        } else { 
          results[postId] = [] 
        } 
      } catch (error) { 
        console.error(`Failed to get similar content for ${postId}:`, error) 
        results[postId] = [] 
      } 
    }
return NextResponse.json({ 
      results, 
      requested_count: count, 
    }) 
  }
catch (error) { 
    console.error('Batch similar content error:', error) 
    return NextResponse.json( 
      { error: 'Failed to get batch similar content' }, 
      { status: 500 } 
    ) 
  } 
}