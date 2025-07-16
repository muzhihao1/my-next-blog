import { NextRequest, NextResponse }
from 'next/server';
import { getPostStatistics, getSiteStatistics }
from '@/lib/statistics'; /** * @api {get} /api/statistics Get site and post statistics * @apiName GetStatistics * @apiGroup Statistics * * @apiDescription Retrieves comprehensive statistics about the blog, including: * - Total number of posts * - Total views across all posts * - Most popular posts * - Tag distribution * - Recent activity trends * * @apiQuery {string} [type='site']
Type of statistics to retrieve ('site' or 'posts') * @apiQuery {number} [limit=10]
Maximum number of items for lists (e.g., popular posts) * @apiQuery {string} [period='all']
Time period for statistics ('day', 'week', 'month', 'year', 'all') * * @apiSuccess {Object}
data Statistics data object * @apiSuccess {number}
data.totalPosts Total number of published posts * @apiSuccess {number}
data.totalViews Total views across all posts * @apiSuccess {number}
data.totalTags Number of unique tags * @apiSuccess {Array}
data.popularPosts List of most viewed posts * @apiSuccess {Object}
data.tagDistribution Tag usage frequency * @apiSuccess {Object}
data.viewsTrend Views trend over time * * @apiError {Object}
error Error object with message * @apiError {string}
error.message Error description * * @apiExample {curl}
Example usage: * curl -i https://blog.example.com/api/statistics?type=site&limit=5 */
export async function GET(request: NextRequest) { try { const searchParams = request.nextUrl.searchParams;
const type = searchParams.get('type') || 'site';
const limit = parseInt(searchParams.get('limit') || '10', 10);
const period = searchParams.get('period') || 'all';
let data; 

    if (type === 'posts') { 
      // Get detailed post statistics 
      data = await getPostStatistics({ limit, period }); 
    } else { 
      // Get general site statistics 
      data = await getSiteStatistics({ limit, period }); 
    }
return NextResponse.json({ success: true, data, meta: { type, limit, period, timestamp: new Date().toISOString() }
}); }
catch (error) { console.error('Error fetching statistics:', error); return NextResponse.json( { success: false, error: { message: error instanceof Error ? error.message : 'Failed to fetch statistics', code: 'STATISTICS_ERROR' }
}, { status: 500 } ); }
}/** * @api {post} /api/statistics Track custom statistics event * @apiName TrackStatistics * @apiGroup Statistics * * @apiDescription Records custom statistical events for tracking purposes * * @apiBody {string}
event Event name to track * @apiBody {Object} [data]
Additional event data * @apiBody {string} [sessionId]
Session identifier for grouping events * * @apiSuccess {boolean}
success Operation success status * @apiSuccess {string}
message Success message * * @apiError {Object}
error Error object * @apiError {string}
error.message Error description */
export async function POST(request: NextRequest) { 
  try { 
    const body = await request.json();
    const { event, data, sessionId } = body; 
    
    if (!event) { 
      return NextResponse.json( 
        { 
          success: false, 
          error: { 
            message: 'Event name is required', 
            code: 'MISSING_EVENT' 
          }
        }, 
        { status: 400 } 
      ); 
    }
    
    // Here you would typically log the event to your analytics system 
    // For now, we'll just acknowledge receipt 
    console.log('Statistics event:', { event, data, sessionId }); 
    
    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked successfully' 
    }); 
  }
  catch (error) { 
    console.error('Error tracking statistics:', error); 
    return NextResponse.json( 
      { 
        success: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to track event', 
          code: 'TRACKING_ERROR' 
        }
      }, 
      { status: 500 } 
    ); 
  } 
}