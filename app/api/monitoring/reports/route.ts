/** * 性能报告API * 生成和管理性能分析报告 */
import { NextRequest, NextResponse } from 'next/server'
import { PerformanceReporter } from '@/lib/monitoring/reporter'
import { createClient } from '@/lib/supabase/server' 

/** * POST - 生成性能报告 */
export async function POST(request: NextRequest) { 
  try { 
    const body = await request.json() 
    const { 
      start_date, 
      end_date, 
      type = 'daily', 
      send_email = false, 
      recipients = [], 
    } = body 
    
    // 验证参数 
    if (!start_date || !end_date) { 
      return NextResponse.json( 
        { error: 'Start date and end date are required' }, 
        { status: 400 } 
      ) 
    }
    const startDate = new Date(start_date)
    const endDate = new Date(end_date) 
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) { 
      return NextResponse.json( 
        { error: 'Invalid date format' }, 
        { status: 400 } 
      ) 
    }
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      )
    }
    // 限制日期范围
    const maxDays = 90 
    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) 
    
    if (daysDiff > maxDays) { 
      return NextResponse.json( 
        { error: `Date range cannot exceed ${maxDays} days` }, 
        { status: 400 } 
      ) 
    }
    // 生成报告
    const reporter = new PerformanceReporter() 
    const report = await reporter.generateReport(startDate, endDate, type) 
    
    // 发送邮件（如果需要） 
    if (send_email && recipients.length > 0) { 
      await reporter.sendReport(report, recipients) 
    }
    return NextResponse.json({
      success: true,
      report,
    })
  }
  catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

/** * GET - 获取历史报告 */
export async function GET(request: NextRequest) { 
  try { 
    const { searchParams } = new URL(request.url) 
    const page = parseInt(searchParams.get('page') || '1') 
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) 
    const period_type = searchParams.get('period_type') 
    const start_date = searchParams.get('start_date') 
    const end_date = searchParams.get('end_date') 
    
    const supabase = await createClient() 
    
    // 构建查询 
    let query = supabase 
      .from('performance_reports') 
      .select('*', { count: 'exact' }) 
      
    // 应用过滤 
    if (period_type) { 
      query = query.eq('period_type', period_type) 
    }
if (start_date) { 
      query = query.gte('period_start', new Date(start_date).toISOString()) 
    }
if (end_date) { 
      query = query.lte('period_end', new Date(end_date).toISOString()) 
    }
// 分页 
    const offset = (page - 1) * limit 
    query = query 
      .order('created_at', { ascending: false }) 
      .range(offset, offset + limit - 1) 
      
    const { data, error, count } = await query 
    
    if (error) { 
      console.error('Failed to fetch reports:', error) 
      return NextResponse.json( 
        { error: 'Failed to fetch reports' }, 
        { status: 500 } 
      ) 
    }
return NextResponse.json({ 
      reports: data || [], 
      pagination: { 
        page, 
        limit, 
        total: count || 0, 
        pages: Math.ceil((count || 0) / limit), 
      }, 
    }) 
  }
catch (error) { 
    console.error('Fetch reports error:', error) 
    return NextResponse.json( 
      { error: 'Internal server error' }, 
      { status: 500 } 
    ) 
  }
}

/** * PUT - 创建定期报告任务 */
export async function PUT(request: NextRequest) { 
  try { 
    const body = await request.json() 
    const { 
      schedule, // hourly, daily, weekly, monthly 
      recipients, 
      enabled = true, 
    } = body 
    
    // 验证参数 
    if (!schedule || !['hourly', 'daily', 'weekly', 'monthly'].includes(schedule)) { 
      return NextResponse.json( 
        { error: 'Invalid schedule type' }, 
        { status: 400 } 
      ) 
    }
if (!recipients || !Array.isArray(recipients) || recipients.length === 0) { 
      return NextResponse.json( 
        { error: 'Recipients are required' }, 
        { status: 400 } 
      ) 
    }
const supabase = await createClient() 
    
    // 创建或更新定期报告任务 
    const { data, error } = await supabase 
      .from('monitoring_scheduled_reports') 
      .upsert({ 
        schedule, 
        recipients, 
        enabled, 
        config: { 
          metrics: ['all'], // 包含所有指标 
          format: 'html', 
        }, 
        next_run: calculateNextRun(schedule), 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString(), 
      }, { 
        onConflict: 'schedule', 
      }) 
      
    if (error) { 
      console.error('Failed to create scheduled report:', error) 
      return NextResponse.json( 
        { error: 'Failed to create scheduled report' }, 
        { status: 500 } 
      ) 
    }
return NextResponse.json({ 
      success: true, 
      scheduled_report: data, 
    }) 
  }
catch (error) { 
    console.error('Schedule report error:', error) 
    return NextResponse.json( 
      { error: 'Internal server error' }, 
      { status: 500 } 
    ) 
  }
}

/** * DELETE - 删除报告 */
export async function DELETE(request: NextRequest) { 
  try { 
    const { searchParams } = new URL(request.url) 
    const reportId = searchParams.get('id') 
    
    if (!reportId) { 
      return NextResponse.json( 
        { error: 'Report ID is required' }, 
        { status: 400 } 
      ) 
    }
const supabase = await createClient() 
    
    const { error } = await supabase 
      .from('performance_reports') 
      .delete() 
      .eq('id', reportId) 
      
    if (error) { 
      console.error('Failed to delete report:', error) 
      return NextResponse.json( 
        { error: 'Failed to delete report' }, 
        { status: 500 } 
      ) 
    }
return NextResponse.json({ 
      success: true, 
    }) 
  }
catch (error) { 
    console.error('Delete report error:', error) 
    return NextResponse.json( 
      { error: 'Internal server error' }, 
      { status: 500 } 
    ) 
  }
}

/** * 计算下次运行时间 */
function calculateNextRun(schedule: string): Date { 
  const now = new Date() 
  
  switch (schedule) { 
    case 'hourly': 
      // 下一个整点 
      return new Date( 
        now.getFullYear(), 
        now.getMonth(), 
        now.getDate(), 
        now.getHours() + 1, 
        0, 
        0, 
        0 
      ) 
      
    case 'daily': 
      // 明天凌晨2点 
      const tomorrow = new Date(now) 
      tomorrow.setDate(tomorrow.getDate() + 1) 
      tomorrow.setHours(2, 0, 0, 0) 
      return tomorrow 
      
    case 'weekly': 
      // 下周一凌晨2点 
      const nextMonday = new Date(now) 
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7 
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday) 
      nextMonday.setHours(2, 0, 0, 0) 
      return nextMonday 
      
    case 'monthly': 
      // 下月1号凌晨2点 
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 2, 0, 0, 0) 
      return nextMonth 
      
    default: 
      return new Date() 
  } 
}