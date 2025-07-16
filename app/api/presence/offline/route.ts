/** * 离线状态更新 API * 使用 Navigator.sendBeacon 在页面卸载时更新用户离线状态 */
import { NextRequest, NextResponse }
from 'next/server' 

import { createClient }
from '@/lib/supabase/server' 

export async function POST(request: NextRequest) { 
  try { 
    const body = await request.json() 
    const { userId } = body 
    
    if (!userId) { 
      return NextResponse.json( 
        { error: 'User ID is required' }, 
        { status: 400 } 
      ) 
    }
// 创建服务端 Supabase 客户端 
    const supabase = await createClient() 
    
    // 更新用户最后活动时间和状态 
    const { error } = await supabase 
      .from('user_profiles') 
      .update({ 
        last_seen: new Date().toISOString(), 
        online_status: 'offline', 
      }) 
      .eq('id', userId) 
      
    if (error) { 
      console.error('Failed to update offline status:', error) 
      return NextResponse.json( 
        { error: 'Failed to update status' }, 
        { status: 500 } 
      ) 
    }
// 记录用户活动日志 
    await supabase 
      .from('user_actions') 
      .insert({ 
        user_id: userId, 
        action_type: 'status_change', 
        action_data: { status: 'offline' }, 
      }) 
      
    return NextResponse.json({ success: true }) 
  }
catch (error) { 
    console.error('Error in offline status update:', error) 
    return NextResponse.json( 
      { error: 'Internal server error' }, 
      { status: 500 } 
    ) 
  } 
}