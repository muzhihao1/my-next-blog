/**
 * 数据采集API端点
 * 接收并处理来自客户端的分析事件
 */
import { NextRequest, NextResponse } from "next/server";
import { AnalyticsEvent, EventType } from "@/lib/analytics/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

/**
 * IP地址匿名化
 */
function anonymizeIP(ip: string): string {
  if (!ip) return "";
  // IPv4: 移除最后一段
  if (ip.includes(".")) {
    const parts = ip.split(".");
    parts[3] = "0";
    return parts.join(".");
  }
  // IPv6: 移除后半部分
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":") + "::";
  }
  return ip;
}

/**
 * 解析用户代理信息
 */
function parseUserAgent(ua: string) {
  const browserRegex = {
    Chrome: /Chrome\/(\d+)/,
    Safari: /Version\/(\d+).*Safari/,
    Firefox: /Firefox\/(\d+)/,
    Edge: /Edg\/(\d+)/,
  };

  const osRegex = {
    Windows: /Windows NT (\d+\.\d+)/,
    macOS: /Mac OS X (\d+[._]\d+)/,
    Linux: /Linux/,
    Android: /Android (\d+)/,
    iOS: /OS (\d+)[._](\d+)/,
  };

  let browser = "unknown";
  let browserVersion = "unknown";
  let os = "unknown";
  let osVersion = "unknown";
  // 检测浏览器
  for (const [name, regex] of Object.entries(browserRegex)) {
    const match = ua.match(regex);
    if (match) {
      browser = name;
      browserVersion = match[1];
      break;
    }
  }
  // 检测操作系统
  for (const [name, regex] of Object.entries(osRegex)) {
    const match = ua.match(regex);
    if (match) {
      os = name;
      osVersion = match[1] || "unknown";
      break;
    }
  }
  return { browser, browserVersion, os, osVersion };
}

/**
 * 获取客户端IP
 */
async function getClientIP(request: NextRequest): Promise<string> {
  const headersList = await headers();
  // 尝试各种头部
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = headersList.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "";
}

/**
 * 验证事件数据
 */
function validateEvent(event: any): event is AnalyticsEvent {
  if (!event || typeof event !== "object") {
    return false;
  }
  // 必需字段
  if (
    !event.event_type ||
    !event.timestamp ||
    !event.session_id ||
    !event.anonymous_id
  ) {
    return false;
  }
  // 验证事件类型
  if (!Object.values(EventType).includes(event.event_type)) {
    return false;
  }
  return true;
}

/**
 * 处理采集请求
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const contentType = request.headers.get("content-type");
    let body;

    if (contentType?.includes("application/json")) {
      body = await request.json();
    } else {
      // 处理 sendBeacon 的数据
      const text = await request.text();
      body = JSON.parse(text);
    }
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Invalid events data" },
        { status: 400 },
      );
    }
    // 验证事件数量限制
    if (events.length > 100) {
      return NextResponse.json(
        { error: "Too many events in batch" },
        { status: 400 },
      );
    }
    // 获取请求信息
    const clientIP = await getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "";
    const { browser, browserVersion, os, osVersion } =
      parseUserAgent(userAgent);
    // 创建 Supabase 管理客户端（用于插入分析数据）
    const supabase = createAdminClient();
    // 处理每个事件
    const processedEvents = [];
    for (const event of events) {
      // 验证事件
      if (!validateEvent(event)) {
        console.warn("Invalid event:", event);
        continue;
      }
      // 增强事件数据
      const enhancedEvent = {
        ...event,
        // 补充设备信息
        device: {
          ...event.device,
          browser: event.device?.browser || browser,
          browser_version: event.device?.browser_version || browserVersion,
          os: event.device?.os || os,
          os_version: event.device?.os_version || osVersion,
        },
        // 添加位置信息（匿名化）
        location: {
          ...event.location,
          ip: anonymizeIP(clientIP),
          // 可以集成 IP 地理位置服务
        },
        // 服务端时间戳
        server_timestamp: new Date().toISOString(),
      };

      processedEvents.push(enhancedEvent);
    }
    // 批量插入事件
    if (processedEvents.length > 0) {
      const { error } = await supabase
        .from("analytics_events")
        .insert(processedEvents);

      if (error) {
        console.error("Failed to insert analytics events:", error);
        return NextResponse.json(
          { error: "Failed to save events" },
          { status: 500 },
        );
      }
    }
    // 更新会话信息
    const sessionIds = Array.from(
      new Set(processedEvents.map((e) => e.session_id)),
    );
    for (const sessionId of sessionIds) {
      const sessionEvents = processedEvents.filter(
        (e) => e.session_id === sessionId,
      );
      const firstEvent = sessionEvents[0];

      await supabase.from("analytics_sessions").upsert(
        {
          id: sessionId,
          user_id: firstEvent.user_id,
          anonymous_id: firstEvent.anonymous_id,
          started_at: new Date(
            Math.min(
              ...sessionEvents.map((e) => new Date(e.timestamp).getTime()),
            ),
          ),
          last_activity_at: new Date(),
          page_views: sessionEvents.filter(
            (e) => e.event_type === EventType.PAGE_VIEW,
          ).length,
          events_count: sessionEvents.length,
          device_type: firstEvent.device.type,
          browser: firstEvent.device.browser,
          os: firstEvent.device.os,
          country: firstEvent.location.country,
        },
        {
          onConflict: "id",
        },
      );
    }
    // 实时更新统计
    await updateRealtimeStats(processedEvents);

    return NextResponse.json({
      success: true,
      processed: processedEvents.length,
    });
  } catch (error) {
    console.error("Analytics collection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * 更新实时统计
 */
async function updateRealtimeStats(events: AnalyticsEvent[]) {
  const supabase = createAdminClient();
  // 更新当前活跃用户
  const uniqueSessions = new Set(events.map((e) => e.session_id));
  const sessionIds = Array.from(uniqueSessions);

  for (const sessionId of sessionIds) {
    await supabase.from("realtime_active_sessions").upsert({
      session_id: sessionId,
      last_activity: new Date(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30分钟过期
    });
  }
  // 更新页面浏览计数
  const pageViews = events.filter((e) => e.event_type === EventType.PAGE_VIEW);
  for (const pv of pageViews) {
    await supabase.rpc("increment_page_view_count", {
      p_path: pv.page.path,
      p_count: 1,
    });
  }
  // 更新热门内容
  const postViews = events.filter((e) => e.event_type === EventType.POST_VIEW);
  for (const pv of postViews) {
    await supabase.rpc("update_trending_score", {
      p_post_id: pv.properties.post_id,
      p_view_weight: 1,
      p_time_decay: 0.95,
    });
  }
}

/**
 * OPTIONS 请求处理（CORS）
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
