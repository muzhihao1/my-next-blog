/**
 * 数据导出API
 * 支持将分析数据导出为多种格式
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAnalyticsAggregator } from "@/lib/analytics/aggregator";
import { ExportConfig, TimeGranularity } from "@/lib/analytics/types";
import * as XLSX from "xlsx";

/**
 * 转换为CSV格式
 */
function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return "";
  // 获取表头
  const keys = headers || Object.keys(data[0]);
  // 转义CSV特殊字符
  const escape = (value: any) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  // 生成CSV
  const csvRows = [
    keys.join(","),
    ...data.map((row) => keys.map((key) => escape(row[key])).join(",")),
  ];

  return csvRows.join("\n");
}

/**
 * 扁平化嵌套对象
 */
function flattenObject(obj: any, prefix = ""): Record<string, any> {
  const flattened: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      flattened[newKey] = value.join(", ");
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
}

/**
 * GET - 获取可导出的数据选项
 */
export async function GET(request: NextRequest) {
  try {
    // 返回可用的导出选项
    return NextResponse.json({
      formats: ["json", "csv", "excel"],
      metrics: [
        "page_views",
        "unique_visitors",
        "sessions",
        "bounce_rate",
        "post_views",
        "post_reads",
        "engagement_rate",
        "device_breakdown",
        "browser_breakdown",
        "country_breakdown",
        "top_posts",
        "top_searches",
        "user_paths",
        "funnel_analysis",
      ],
      time_granularities: Object.values(TimeGranularity),
      max_date_range: 90, // 最多导出90天数据
    });
  } catch (error) {
    console.error("Export options error:", error);
    return NextResponse.json(
      { error: "Failed to get export options" },
      { status: 500 },
    );
  }
}

/**
 * POST - 导出分析数据
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config: ExportConfig = {
      format: body.format || "json",
      time_range: {
        start: new Date(body.start_date),
        end: new Date(body.end_date),
      },
      metrics: body.metrics || ["all"],
      filters: body.filters || {},
      include_raw_data: body.include_raw_data || false,
    };
    // 验证日期范围
    const daysDiff =
      (config.time_range.end.getTime() - config.time_range.start.getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysDiff > 90) {
      return NextResponse.json(
        { error: "Date range cannot exceed 90 days" },
        { status: 400 },
      );
    }
    // 获取聚合数据
    const aggregator = getAnalyticsAggregator();
    const aggregatedData = await aggregator.aggregateStats(
      config.time_range.start,
      config.time_range.end,
      TimeGranularity.DAY,
    );
    // 准备导出数据
    let exportData: any = {};
    // 根据选择的指标过滤数据
    if (config.metrics.includes("all")) {
      exportData = aggregatedData;
    } else {
      config.metrics.forEach((metric) => {
        if (metric in aggregatedData) {
          exportData[metric] = (aggregatedData as any)[metric];
        }
      });
    }
    // 如果需要原始数据
    if (config.include_raw_data) {
      const supabase = createAdminClient();
      const { data: rawEvents } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("timestamp", config.time_range.start.toISOString())
        .lte("timestamp", config.time_range.end.toISOString())
        .order("timestamp", { ascending: false })
        .limit(10000);
      // 限制原始数据量

      if (rawEvents) {
        exportData.raw_events = rawEvents;
      }
    }
    // 根据格式转换数据
    switch (config.format) {
      case "json":
        return NextResponse.json(exportData, {
          headers: {
            "Content-Disposition": `attachment; filename="analytics_${Date.now()}.json"`,
            "Content-Type": "application/json",
          },
        });

      case "csv":
        // 准备CSV数据
        const csvData: any[] = [];
        // 基础指标
        if (exportData.total_views !== undefined) {
          csvData.push({ metric: "总浏览量", value: exportData.total_views });
          csvData.push({
            metric: "独立访客",
            value: exportData.unique_visitors,
          });
          csvData.push({ metric: "会话数", value: exportData.total_sessions });
          csvData.push({
            metric: "平均会话时长",
            value: `${Math.round(exportData.avg_session_duration)}秒`,
          });
          csvData.push({
            metric: "跳出率",
            value: `${(exportData.bounce_rate * 100).toFixed(2)}%`,
          });
        }
        // 设备分布
        if (exportData.device_breakdown) {
          Object.entries(exportData.device_breakdown).forEach(
            ([device, count]) => {
              csvData.push({ metric: `设备 - ${device}`, value: count });
            },
          );
        }
        // 热门文章
        if (exportData.top_posts) {
          exportData.top_posts.forEach((post: any, index: number) => {
            csvData.push({
              metric: `热门文章 #${index + 1}`,
              value: post.post_id,
              views: post.views,
              reads: post.reads,
              avg_read_time: `${Math.round(post.avg_read_time)}秒`,
            });
          });
        }
        const csv = convertToCSV(csvData);
        return new NextResponse(csv, {
          headers: {
            "Content-Disposition": `attachment; filename="analytics_${Date.now()}.csv"`,
            "Content-Type": "text/csv; charset=utf-8",
          },
        });

      case "excel":
        // 创建工作簿
        const workbook = XLSX.utils.book_new();
        // 概览表
        const overviewData = [
          ["指标", "值"],
          ["总浏览量", exportData.total_views || 0],
          ["独立访客", exportData.unique_visitors || 0],
          ["会话数", exportData.total_sessions || 0],
          [
            "平均会话时长",
            `${Math.round(exportData.avg_session_duration || 0)}秒`,
          ],
          ["跳出率", `${((exportData.bounce_rate || 0) * 100).toFixed(2)}%`],
          ["文章浏览量", exportData.total_post_views || 0],
          ["文章阅读量", exportData.total_post_reads || 0],
          ["平均阅读时间", `${Math.round(exportData.avg_read_time || 0)}秒`],
          [
            "参与率",
            `${((exportData.engagement_rate || 0) * 100).toFixed(2)}%`,
          ],
          ["新用户", exportData.new_users || 0],
          ["回访用户", exportData.returning_users || 0],
        ];
        const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
        XLSX.utils.book_append_sheet(workbook, overviewSheet, "概览");
        // 设备分布表
        if (exportData.device_breakdown) {
          const deviceData = [
            ["设备类型", "数量"],
            ...Object.entries(exportData.device_breakdown).map(
              ([device, count]) => [device, count],
            ),
          ];
          const deviceSheet = XLSX.utils.aoa_to_sheet(deviceData);
          XLSX.utils.book_append_sheet(workbook, deviceSheet, "设备分布");
        }
        // 浏览器分布表
        if (exportData.browser_breakdown) {
          const browserData = [
            ["浏览器", "数量"],
            ...Object.entries(exportData.browser_breakdown).map(
              ([browser, count]) => [browser, count],
            ),
          ];
          const browserSheet = XLSX.utils.aoa_to_sheet(browserData);
          XLSX.utils.book_append_sheet(workbook, browserSheet, "浏览器分布");
        }
        // 地理分布表
        if (exportData.country_breakdown) {
          const countryData = [
            ["国家", "数量"],
            ...Object.entries(exportData.country_breakdown).map(
              ([country, count]) => [country, count],
            ),
          ];
          const countrySheet = XLSX.utils.aoa_to_sheet(countryData);
          XLSX.utils.book_append_sheet(workbook, countrySheet, "地理分布");
        }
        // 热门文章表
        if (exportData.top_posts && exportData.top_posts.length > 0) {
          const postsData = [
            ["文章ID", "浏览量", "阅读量", "平均阅读时间"],
            ...exportData.top_posts.map((post: any) => [
              post.post_id,
              post.views,
              post.reads,
              `${Math.round(post.avg_read_time)}秒`,
            ]),
          ];
          const postsSheet = XLSX.utils.aoa_to_sheet(postsData);
          XLSX.utils.book_append_sheet(workbook, postsSheet, "热门文章");
        }
        // 热门搜索表
        if (exportData.top_searches && exportData.top_searches.length > 0) {
          const searchData = [
            ["搜索词", "搜索次数", "点击率"],
            ...exportData.top_searches.map((search: any) => [
              search.query,
              search.count,
              `${(search.click_through_rate * 100).toFixed(2)}%`,
            ]),
          ];
          const searchSheet = XLSX.utils.aoa_to_sheet(searchData);
          XLSX.utils.book_append_sheet(workbook, searchSheet, "热门搜索");
        }
        // 原始数据表（如果包含）
        if (exportData.raw_events && exportData.raw_events.length > 0) {
          const rawData = exportData.raw_events.map((event: any) =>
            flattenObject(event),
          );
          const rawSheet = XLSX.utils.json_to_sheet(rawData);
          XLSX.utils.book_append_sheet(workbook, rawSheet, "原始数据");
        }
        // 生成Excel文件
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "buffer",
        });
        return new NextResponse(excelBuffer, {
          headers: {
            "Content-Disposition": `attachment; filename="analytics_${Date.now()}.xlsx"`,
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        });

      default:
        return NextResponse.json(
          { error: "Unsupported export format" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

/**
 * 创建定期报告任务
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      schedule, // daily, weekly, monthly
      recipients,
      metrics,
      format,
    } = body;

    const supabase = createAdminClient();
    // 创建定期报告任务
    const { data, error } = await supabase
      .from("analytics_scheduled_reports")
      .insert({
        schedule,
        recipients,
        metrics,
        format,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return NextResponse.json({
      success: true,
      report_id: data?.id || "scheduled",
    });
  } catch (error) {
    console.error("Schedule report error:", error);
    return NextResponse.json(
      { error: "Failed to schedule report" },
      { status: 500 },
    );
  }
}
