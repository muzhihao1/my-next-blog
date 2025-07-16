/** * 用户画像API * 获取和管理用户画像 */
import {
  NextRequest,
  NextResponse,
}
from "next/server";
import { createClient }
from "@/lib/supabase/server";
import { UserProfileBuilder }
from "@/lib/recommendation/user-profile";
import { UserAction, ContentFeatures }
from "@/lib/recommendation/types";

// 创建用户画像构建器
const profileBuilder = new UserProfileBuilder()

/** 
 * GET - 获取用户画像 
 */
export async function GET(request: NextRequest) { 
  try { 
    const { searchParams } = new URL(request.url) 
    const targetUserId = searchParams.get('user_id') 
    
    // 获取当前用户 
    const supabase = await createClient() 
    const { data: { session } } = await supabase.auth.getSession() 
    
    if (!session?.user) { 
      return NextResponse.json( 
        { error: 'Authentication required' }, 
        { status: 401 } 
      ) 
    }
// 确定要查询的用户ID 
    const userId = targetUserId || session.user.id 
    
    // 检查权限（只能查看自己的画像，除非是管理员） 
    if (userId !== session.user.id) { 
      // TODO: 检查管理员权限 
      return NextResponse.json( 
        { error: 'Permission denied' }, 
        { status: 403 } 
      ) 
    }
// 获取保存的用户画像 
    const { data: profile } = await supabase 
      .from('user_profiles') 
      .select('*') 
      .eq('user_id', userId) 
      .single() 
      
    if (profile) { 
      return NextResponse.json({ 
        profile: { 
          user_id: profile.user_id, 
          interests: profile.interests || {}, 
          preferences: profile.preferences || {}, 
          stats: profile.stats || {}, 
          segments: profile.segments || [], 
          updated_at: profile.updated_at, 
        }, 
      }) 
    }
// 如果没有保存的画像，尝试构建 
    const builtProfile = await buildUserProfile(userId, supabase) 
    
    if (builtProfile) { 
      return NextResponse.json({ profile: builtProfile }) 
    }
return NextResponse.json({ 
      profile: null, 
      message: 'No profile data available', 
    }) 
  }
catch (error) { 
    console.error('Get profile error:', error) 
    return NextResponse.json( 
      { error: 'Failed to get user profile' }, 
      { status: 500 } 
    ) 
  }
}

/** * POST - 刷新用户画像 */
export async function POST(request: NextRequest) { 
  try { 
    // 获取当前用户 
    const supabase = await createClient() 
    const { data: { session } } = await supabase.auth.getSession() 
    
    if (!session?.user) { 
      return NextResponse.json( 
        { error: 'Authentication required' }, 
        { status: 401 } 
      ) 
    }
const userId = session.user.id;
    
    // 重新构建用户画像 
    const profile = await buildUserProfile(userId, supabase) 
    
    if (profile) { 
      // 保存更新后的画像 
      const { error } = await supabase 
        .from('user_profiles') 
        .upsert({ 
          user_id: profile.user_id, 
          interests: profile.interests, 
          preferences: profile.preferences, 
          stats: profile.stats, 
          segments: profile.segments, 
          updated_at: profile.updated_at, 
        }) 
        
      if (error) { 
        console.error('Failed to save profile:', error) 
      }
return NextResponse.json({ 
        profile, 
        refreshed: true, 
      }) 
    }
return NextResponse.json({ 
      profile: null, 
      refreshed: false, 
      message: 'Insufficient data to build profile', 
    }) 
  }
catch (error) { 
    console.error('Refresh profile error:', error) 
    return NextResponse.json( 
      { error: 'Failed to refresh profile' }, 
      { status: 500 } 
    ) 
  }
}

/** * DELETE - 删除用户画像 */
export async function DELETE(request: NextRequest) { 
  try { 
    // 获取当前用户 
    const supabase = await createClient() 
    const { data: { session } } = await supabase.auth.getSession() 
    
    if (!session?.user) { 
      return NextResponse.json( 
        { error: 'Authentication required' }, 
        { status: 401 } 
      ) 
    }
// 删除用户画像 
    const { error } = await supabase 
      .from('user_profiles') 
      .delete() 
      .eq('user_id', session.user.id) 
      
    if (error) { 
      console.error('Failed to delete profile:', error) 
      return NextResponse.json( 
        { error: 'Failed to delete profile' }, 
        { status: 500 } 
      ) 
    }
// 可选：同时删除用户行为数据 
    const body = await request.json().catch(() => ({})) 
    if (body.delete_actions) { 
      await supabase 
        .from('user_actions') 
        .delete() 
        .eq('user_id', session.user.id) 
    }
return NextResponse.json({ 
      success: true, 
      message: 'Profile deleted successfully', 
    }) 
  }
catch (error) { 
    console.error('Delete profile error:', error) 
    return NextResponse.json( 
      { error: 'Failed to delete profile' }, 
      { status: 500 } 
    ) 
  }
}

/** * 构建用户画像 */
async function buildUserProfile(userId: string, supabase: any) { 
  try { 
    // 获取用户行为历史 
    const { data: actions } = await supabase 
      .from('user_actions') 
      .select('*') 
      .eq('user_id', userId) 
      .order('created_at', { ascending: false }) 
      .limit(1000) 
      
    if (!actions || actions.length === 0) { 
      return null 
    }
// 获取相关内容特征 
    const contentIds = [...new Set(actions.map((a: any) => a.target_id))]
const { data: posts } = await supabase 
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
      .in('id', contentIds) 
      
    if (!posts) { 
      return null 
    }
// 转换为所需格式 
    const userActions: UserAction[] = actions.map((a: any) => ({ 
      id: a.id, 
      user_id: a.user_id, 
      action_type: a.action_type, 
      target_id: a.target_id, 
      target_type: a.target_type, 
      value: a.value, 
      context: a.context, 
      created_at: new Date(a.created_at), 
    }))

const contentFeatures = new Map<string, ContentFeatures>( 
      posts.map((post: any) => [ 
        post.id, 
        { 
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
        }, 
      ]) 
    ) 
    
    // 构建画像 
    return await profileBuilder.buildProfile(userId, userActions, contentFeatures) 
  }
catch (error) { 
    console.error('Failed to build user profile:', error) 
    return null 
  }
}
