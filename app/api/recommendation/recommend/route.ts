/** * 推荐API * 获取个性化推荐内容 */
import {
  NextRequest,
  NextResponse,
}
from "next/server";
import { RecommendationEngine }
from "@/lib/recommendation/engine";
import { RecommendationRequest }
from "@/lib/recommendation/types";
import { createClient }
from "@/lib/supabase/server";
// 创建推荐引擎实例 
const recommendationEngine = new RecommendationEngine() 

/** * GET - 获取推荐内容 */
export async function GET(request: NextRequest) { 
  try { 
    const { searchParams } = new URL(request.url) 
    
    // 解析请求参数 
    const count = parseInt(searchParams.get('count') || '10') 
    const offset = parseInt(searchParams.get('offset') || '0') 
    const currentPostId = searchParams.get('current_post_id') || undefined 
    const source = searchParams.get('source') || undefined 
    
    // 验证参数 
    if (count < 1 || count > 50) { 
      return NextResponse.json( 
        { error: 'Count must be between 1 and 50' }, 
        { status: 400 } 
      ) 
    }
if (offset < 0) { 
      return NextResponse.json( 
        { error: 'Offset must be non-negative' }, 
        { status: 400 } 
      ) 
    }
// 获取用户ID（如果已登录） 
    const supabase = await createClient() 
    const { data: { session } } = await supabase.auth.getSession() 
    const userId = session?.user?.id 
    
    // 获取已浏览的文章ID（用于去重） 
    const excludeIds: string[] = []
if (userId) { 
      const { data: viewedPosts } = await supabase 
        .from('user_actions') 
        .select('target_id') 
        .eq('user_id', userId) 
        .eq('action_type', 'view') 
        .order('created_at', { ascending: false }) 
        .limit(100) 
        
      if (viewedPosts) { 
        excludeIds.push(...viewedPosts.map(p => p.target_id)) 
      }
}
    
    // 构建推荐请求 
    const recommendationRequest: RecommendationRequest = { 
      user_id: userId, 
      count, 
      offset, 
      exclude_ids: excludeIds, 
      context: { 
        current_post_id: currentPostId, 
        source, 
        session_id: request.headers.get('x-session-id') || undefined, 
        device_type: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop', 
      }, 
    }
// 获取推荐结果 
    const response = await recommendationEngine.recommend(recommendationRequest) 
    
    // 获取推荐文章的详细信息 
    if (response.recommendations.length > 0) { 
      const postIds = response.recommendations.map(r => r.post_id) 
      
      const { data: posts } = await supabase 
        .from('posts') 
        .select(` 
          id, 
          title, 
          author, 
          published_at, 
          summary, 
          categories, 
          tags, 
          read_time, 
          views, 
          likes, 
          image_url 
        `) 
        .in('id', postIds) 
        .eq('status', 'published') 
        
      if (posts) { 
        // 按推荐顺序排序 
        const postMap = new Map(posts.map(p => [p.id, p])) 
        const sortedPosts = response.recommendations 
          .map(rec => { 
            const post = postMap.get(rec.post_id) 
            if (post) { 
              return { 
                ...post, 
                recommendation: { 
                  rank: rec.rank, 
                  score: rec.score, 
                  reason: rec.reason, 
                  source: rec.source, 
                }, 
              }
}
            return null 
          }) 
          .filter(Boolean) 
          
        return NextResponse.json({ 
          recommendations: sortedPosts, 
          session_id: response.session_id, 
          has_more: sortedPosts.length === count, 
          debug: response.debug, 
        }) 
      }
}
    
    return NextResponse.json({ 
      recommendations: [], 
      session_id: response.session_id, 
      has_more: false, 
      debug: response.debug, 
    }) 
  }
catch (error) { 
    console.error('Recommendation API error:', error) 
    return NextResponse.json( 
      { error: 'Failed to get recommendations' }, 
      { status: 500 } 
    ) 
  }
}

/** * POST - 批量获取推荐（支持多个场景） */
export async function POST(request: NextRequest) { 
  try { 
    const body = await request.json() 
    const { scenarios } = body 
    
    if (!scenarios || !Array.isArray(scenarios)) { 
      return NextResponse.json( 
        { error: 'Scenarios array is required' }, 
        { status: 400 } 
      ) 
    }
// 获取用户ID 
    const supabase = await createClient() 
    const { data: { session }
} = await supabase.auth.getSession() 
    const userId = session?.user?.id 
    
    // 批量获取推荐 
    const results: Record<string, any> = {}
for (const scenario of scenarios) { 
      const { key, count = 10, context } = scenario 
      
      const recommendationRequest: RecommendationRequest = { 
        user_id: userId, 
        count, 
        context: { 
          ...context, 
          session_id: request.headers.get('x-session-id') || undefined, 
        }, 
      }
try { 
        const response = await recommendationEngine.recommend(recommendationRequest) 
        
        // 获取文章信息 
        if (response.recommendations.length > 0) { 
          const postIds = response.recommendations.map(r => r.post_id) 
          const { data: posts } = await supabase 
            .from('posts') 
            .select(` 
              id, 
              title, 
              author, 
              published_at, 
              summary, 
              categories, 
              tags, 
              read_time, 
              image_url 
            `) 
            .in('id', postIds) 
            .eq('status', 'published') 
            
          if (posts) { 
            const postMap = new Map(posts.map(p => [p.id, p])) 
            results[key] = response.recommendations 
              .map(rec => { 
                const post = postMap.get(rec.post_id) 
                return post ? { ...post, ...rec } : null 
              }) 
              .filter(Boolean) 
          }
} else { 
          results[key] = []
}
}
catch (error) { 
        console.error(`Failed to get recommendations for scenario ${key}:`, error) 
        results[key] = []
}
    }
    
    return NextResponse.json({ 
      results, 
      session_id: request.headers.get('x-session-id'), 
    }) 
  }
catch (error) { 
    console.error('Batch recommendation error:', error) 
    return NextResponse.json( 
      { error: 'Failed to get batch recommendations' }, 
      { status: 500 } 
    ) 
  }
}
