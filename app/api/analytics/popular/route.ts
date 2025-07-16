import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContentType } from "@/types/supabase";

/**
 * GET /api/analytics/popular - 获取热门内容
 * 查询参数:
 * - contentType?: 内容类型筛选
 * - metric: 排序指标 (views|likes|bookmarks|engagement)
 * - period?: 时间范围 (day|week|month|all)
 * - limit?: 返回数量限制 (默认10)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get("contentType") as ContentType | null;
    const metric = searchParams.get("metric") || "engagement";
    const period = searchParams.get("period") || "week";
    const limit = parseInt(searchParams.get("limit") || "10");

    const adminClient = createAdminClient();
    // 计算时间范围
    let startDate: Date | null = null;
    const now = new Date();

    switch (period) {
      case "day":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        // 'all' - 不限制时间
        break;
    }
    // 获取内容的统计数据
    // 这里使用原始SQL查询来实现复杂的聚合
    let query = `
      WITH content_stats AS (
        SELECT 
          content_id,
          content_type,
          COUNT(CASE WHEN action_type = 'view' THEN 1 END) as view_count,
          COUNT(DISTINCT CASE WHEN action_type = 'view' THEN user_id END) as unique_views
        FROM user_actions
        WHERE 1=1
    `;

    if (contentType) {
      query += ` AND content_type = '${contentType}'`;
    }
    if (startDate) {
      query += ` AND created_at >= '${startDate.toISOString()}'`;
    }
    query += `
        GROUP BY content_id, content_type
      ),
      likes_stats AS (
        SELECT 
          content_id,
          content_type,
          COUNT(*) as like_count
        FROM likes
        WHERE 1=1
    `;

    if (contentType) {
      query += ` AND content_type = '${contentType}'`;
    }
    query += `
        GROUP BY content_id, content_type
      ),
      bookmarks_stats AS (
        SELECT 
          content_id,
          content_type,
          COUNT(*) as bookmark_count
        FROM bookmarks
        WHERE 1=1
    `;

    if (contentType) {
      query += ` AND content_type = '${contentType}'`;
    }
    query += `
        GROUP BY content_id, content_type
      )
      SELECT 
        COALESCE(cs.content_id, ls.content_id, bs.content_id) as content_id,
        COALESCE(cs.content_type, ls.content_type, bs.content_type) as content_type,
        COALESCE(cs.view_count, 0) as views,
        COALESCE(cs.unique_views, 0) as unique_views,
        COALESCE(ls.like_count, 0) as likes,
        COALESCE(bs.bookmark_count, 0) as bookmarks,
        -- 计算综合互动分数
        (COALESCE(cs.view_count, 0) * 1 + 
         COALESCE(ls.like_count, 0) * 5 + 
         COALESCE(bs.bookmark_count, 0) * 3) as engagement_score
      FROM content_stats cs
      FULL OUTER JOIN likes_stats ls 
        ON cs.content_id = ls.content_id AND cs.content_type = ls.content_type
      FULL OUTER JOIN bookmarks_stats bs 
        ON COALESCE(cs.content_id, ls.content_id) = bs.content_id 
        AND COALESCE(cs.content_type, ls.content_type) = bs.content_type
    `;
    // 根据指标排序
    switch (metric) {
      case "views":
        query += " ORDER BY views DESC";
        break;
      case "likes":
        query += " ORDER BY likes DESC";
        break;
      case "bookmarks":
        query += " ORDER BY bookmarks DESC";
        break;
      case "engagement":
      default:
        query += " ORDER BY engagement_score DESC";
        break;
    }
    query += ` LIMIT ${limit}`;

    const { data, error } = await adminClient.rpc("exec_sql", { sql: query });

    if (error) {
      // 如果RPC不可用，使用简化的查询
      console.warn("RPC查询失败，使用简化查询:", error);
      // 简化查询：只获取最近的互动内容
      let actionsQuery = adminClient
        .from("user_actions")
        .select("content_id, content_type");

      if (contentType) {
        actionsQuery = actionsQuery.eq("content_type", contentType);
      }
      if (startDate) {
        actionsQuery = actionsQuery.gte("created_at", startDate.toISOString());
      }
      const { data: actions } = await actionsQuery.limit(1000);
      // 手动聚合
      const contentMap = new Map<string, any>();
      actions?.forEach((action) => {
        const key = `${action.content_type}
_${action.content_id}`;
        if (!contentMap.has(key)) {
          contentMap.set(key, {
            content_id: action.content_id,
            content_type: action.content_type,
            interactions: 0,
          });
        }
        contentMap.get(key).interactions++;
      });
      // 转换为数组并排序
      const popularContent = Array.from(contentMap.values())
        .sort((a, b) => b.interactions - a.interactions)
        .slice(0, limit);

      return NextResponse.json({
        period,
        metric,
        popular: popularContent,
      });
    }
    return NextResponse.json({
      period,
      metric,
      popular: data || [],
    });
  } catch (error) {
    console.error("获取热门内容失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
