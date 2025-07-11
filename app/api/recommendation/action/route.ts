/** * 用户行为记录API * 记录用户行为并更新推荐模型 */
import { NextRequest, NextResponse }
from 'next/server' 

import { RecommendationEngine }
from '@/lib/recommendation/engine' 

import { UserAction, UserActionType }
from '@/lib/recommendation/types' 

import { createClient }
from '@/lib/supabase/server' 

import { v4 as uuidv4 }
from 'uuid' 

// 创建推荐引擎实例 
const recommendationEngine = new RecommendationEngine() 

/** * POST - 记录用户行为 */
export async function POST(request: NextRequest) { 
  try { 
    const body = await request.json() 
    const { 
      action_type, 
      target_id, 
      target_type = 'post', 
      value, 
      context, 
    } = body 
    
    // 验证参数 
    if (!action_type || !Object.values(UserActionType).includes(action_type)) { 
      return NextResponse.json( 
        { error: 'Invalid action type' }, 
        { status: 400 } 
      ) 
    }
if (!target_id) { 
      return NextResponse.json( 
        { error: 'Target ID is required' }, 
        { status: 400 } 
      ) 
    }
// 获取用户ID 
    const supabase = await createClient() 
    const { data: { session } } = await supabase.auth.getSession() 
    
    if (!session?.user) { 
      return NextResponse.json( 
        { error: 'Authentication required' }, 
        { status: 401 } 
      ) 
    }
// 构建用户行为对象 
    const userAction: UserAction = { 
      id: uuidv4(), 
      user_id: session.user.id, 
      action_type, 
      target_id, 
      target_type, 
      value, 
      context: { 
        ...context, 
        session_id: request.headers.get('x-session-id') || undefined, 
        source: context?.source || request.headers.get('referer') || undefined, 
      }, 
      created_at: new Date(), 
    }
// 记录用户行为 
    await recommendationEngine.recordUserAction(userAction) 
    
    // 特殊处理：如果是浏览行为，更新文章浏览量 
    if (action_type === UserActionType.VIEW) { 
      await supabase.rpc('increment_post_views', { post_id: target_id }) 
    }
// 特殊处理：如果是点赞行为，更新点赞数 
    if (action_type === UserActionType.LIKE) { 
      await supabase.rpc('increment_post_likes', { post_id: target_id }) 
    }
// 特殊处理：如果是收藏行为，更新收藏数 
    if (action_type === UserActionType.COLLECT) { 
      await supabase.rpc('increment_post_collects', { post_id: target_id }) 
    }
return NextResponse.json({ 
      success: true, 
      action_id: userAction.id, 
    }) 
  }
catch (error) { 
    console.error('Record action error:', error) 
    return NextResponse.json( 
      { error: 'Failed to record action' }, 
      { status: 500 } 
    ) 
  }
}

/** * PUT - 批量记录用户行为 */
export async function PUT(request: NextRequest) { 
  try { 
    const body = await request.json() 
    const { actions } = body 
    
    if (!actions || !Array.isArray(actions)) { 
      return NextResponse.json( 
        { error: 'Actions array is required' }, 
        { status: 400 } 
      ) 
    }
// 获取用户ID 
    const supabase = await createClient() 
    const { data: { session } } = await supabase.auth.getSession() 
    
    if (!session?.user) { 
      return NextResponse.json( 
        { error: 'Authentication required' }, 
        { status: 401 } 
      ) 
    }
const sessionId = request.headers.get('x-session-id') || uuidv4() 
    const recordedActions: string[] = [] 
    
    // 批量记录行为 
    for (const action of actions) { 
      try { 
        const userAction: UserAction = { 
          id: uuidv4(), 
          user_id: session.user.id, 
          action_type: action.action_type, 
          target_id: action.target_id, 
          target_type: action.target_type || 'post', 
          value: action.value, 
          context: { 
            ...action.context, 
            session_id: sessionId, 
          }, 
          created_at: new Date(action.timestamp || Date.now()), 
        }
await recommendationEngine.recordUserAction(userAction) 
        recordedActions.push(userAction.id) 
      }
catch (error) { 
        console.error('Failed to record action:', error) 
      }
}
    
    return NextResponse.json({ 
      success: true, 
      recorded_count: recordedActions.length, 
      action_ids: recordedActions, 
    }) 
  }
catch (error) { 
    console.error('Batch record error:', error) 
    return NextResponse.json( 
      { error: 'Failed to record batch actions' }, 
      { status: 500 } 
    ) 
  }
}

/** * GET - 获取用户行为历史 */
export async function GET(request: NextRequest) { 
  try { 
    const { searchParams } = new URL(request.url) 
    const action_type = searchParams.get('action_type') || undefined 
    const target_type = searchParams.get('target_type') || 'post' 
    const limit = parseInt(searchParams.get('limit') || '50') 
    const offset = parseInt(searchParams.get('offset') || '0') 
    
    // 获取用户ID 
    const supabase = await createClient() 
    const { data: { session } } = await supabase.auth.getSession() 
    
    if (!session?.user) { 
      return NextResponse.json( 
        { error: 'Authentication required' }, 
        { status: 401 } 
      ) 
    }
// 构建查询 
    let query = supabase 
      .from('user_actions') 
      .select('*', { count: 'exact' }) 
      .eq('user_id', session.user.id) 
      .eq('target_type', target_type) 
      
    if (action_type) { 
      query = query.eq('action_type', action_type) 
    }
// 分页 
    query = query 
      .order('created_at', { ascending: false }) 
      .range(offset, offset + limit - 1) 
      
    const { data, error, count } = await query 
    
    if (error) { 
      console.error('Failed to fetch user actions:', error) 
      return NextResponse.json( 
        { error: 'Failed to fetch actions' }, 
        { status: 500 } 
      ) 
    }
// 获取相关内容信息 
    if (data && data.length > 0) { 
      const targetIds = [...new Set(data.map(a => a.target_id))]
const { data: posts } = await supabase 
        .from('posts') 
        .select('id, title, author, published_at, categories, tags') 
        .in('id', targetIds) 
        
      const postMap = new Map((posts || []).map(p => [p.id, p])) 
      
      const enrichedActions = data.map(action => ({ 
        ...action, 
        target: postMap.get(action.target_id) || null, 
      })) 
      
      return NextResponse.json({ 
        actions: enrichedActions, 
        pagination: { 
          total: count || 0, 
          limit, 
          offset, 
          has_more: (count || 0) > offset + limit, 
        }, 
      }) 
    }
return NextResponse.json({ 
      actions: [], 
      pagination: { 
        total: 0, 
        limit, 
        offset, 
        has_more: false, 
      }, 
    }) 
  }
catch (error) { 
    console.error('Fetch actions error:', error) 
    return NextResponse.json( 
      { error: 'Failed to fetch actions' }, 
      { status: 500 } 
    ) 
  } 
}