import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionType, ContentType } from "@/types/supabase";

interface ActionData {
  userId?: string;
  actionType: ActionType;
  contentId: string;
  contentType: ContentType;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * POST /api/analytics/actions - 批量记录用户行为
 * 请求体:
 * - actions: 行为数组
 */
export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const { actions } = (await request.json()) as { actions: ActionData[] };

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json({ error: "无效的行为数据" }, { status: 400 });
    }
    // 验证和清理数据
    const validActions = actions
      .filter((action) => {
        return (
          action.actionType &&
          action.contentId &&
          action.contentType &&
          [
            "view",
            "like",
            "unlike",
            "bookmark",
            "unbookmark",
            "comment",
            "share",
          ].includes(action.actionType)
        );
      })
      .map((action) => ({
        user_id: action.userId || "anonymous",
        action_type: action.actionType,
        content_id: action.contentId,
        content_type: action.contentType,
        metadata: action.metadata || null,
        created_at: action.timestamp || new Date().toISOString(),
      }));

    if (validActions.length === 0) {
      return NextResponse.json(
        { error: "没有有效的行为数据" },
        { status: 400 },
      );
    }
    // 批量插入行为数据
    const { error: insertError } = await adminClient
      .from("user_actions")
      .insert(validActions);

    if (insertError) {
      console.error("记录用户行为失败:", insertError);
      return NextResponse.json({ error: "记录行为失败" }, { status: 500 });
    }
    // 异步更新内容统计（不阻塞响应）
    updateContentStats(validActions).catch((error) => {
      console.error("更新内容统计失败:", error);
    });

    return NextResponse.json({ success: true, count: validActions.length });
  } catch (error) {
    console.error("处理用户行为失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

/**
 * 更新内容统计数据
 * 这是一个异步函数，不阻塞主响应
 */
async function updateContentStats(actions: any[]) {
  const adminClient = createAdminClient();
  // 按内容分组统计浏览次数
  const viewCounts = new Map<string, number>();

  actions
    .filter((action) => action.action_type === "view")
    .forEach((action) => {
      const key = `${action.content_type}
_${action.content_id}`;
      viewCounts.set(key, (viewCounts.get(key) || 0) + 1);
    });
  // TODO: 更新内容表的浏览计数
  // 这需要根据实际的内容表结构来实现
  // 例如：更新posts表的view_count字段
}
