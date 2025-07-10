# B4 数据可视化实现指南

## 概述

数据可视化模块为博客提供了丰富的数据展示能力，让管理员和用户能够直观地了解博客的访问情况、用户行为和内容表现。本模块使用Canvas API实现高性能的图表渲染，支持实时数据更新和交互式操作。

## 核心组件

### 1. 基础图表组件

#### LineChart - 折线图

```typescript
// 用于展示趋势数据
import { LineChart } from '@/components/analytics/charts/LineChart'

<LineChart
  data={[
    { x: '1月', y: 100, label: '100次访问' },
    { x: '2月', y: 150, label: '150次访问' }
  ]}
  title="访问趋势"
  xLabel="月份"
  yLabel="访问量"
  height={300}
  color="#3B82F6"
  showGrid={true}
  showDots={true}
  animate={true}
/>
```

**特性：**

- 支持自定义颜色和样式
- 渐变填充区域
- 响应式设计
- 动画效果
- 自适应坐标轴

#### BarChart - 柱状图

```typescript
// 用于对比数据
import { BarChart } from '@/components/analytics/charts/BarChart'

<BarChart
  data={[
    { label: 'Chrome', value: 450 },
    { label: 'Safari', value: 320 }
  ]}
  title="浏览器分布"
  orientation="vertical" // 或 "horizontal"
  showValues={true}
  animate={true}
  colors={['#3B82F6', '#10B981']}
/>
```

**特性：**

- 垂直/水平方向切换
- 数值标签显示
- 自定义颜色数组
- 响应式布局
- 动画过渡

#### PieChart - 饼图

```typescript
// 用于展示占比数据
import { PieChart } from '@/components/analytics/charts/PieChart'

<PieChart
  data={[
    { label: '移动设备', value: 65 },
    { label: '桌面设备', value: 35 }
  ]}
  title="设备分布"
  size={300}
  donut={true} // 环形图
  showPercentage={true}
  animate={true}
/>
```

**特性：**

- 饼图/环形图切换
- 鼠标悬停效果
- 百分比显示
- 图例展示
- 平滑动画

#### HeatMap - 热力图

```typescript
// 用于展示密度数据
import { HeatMap } from '@/components/analytics/charts/HeatMap'

<HeatMap
  data={[
    { x: 0, y: 0, value: 10 },
    { x: 1, y: 0, value: 25 }
  ]}
  xLabels={['0时', '1时', '2时']}
  yLabels={['周一', '周二']}
  colorScale={{
    min: '#F3F4F6',
    mid: '#60A5FA',
    max: '#1E40AF'
  }}
  showValues={true}
/>
```

**特性：**

- 自定义颜色梯度
- 工具提示
- 标签旋转
- 响应式单元格大小
- 颜色图例

### 2. 综合分析组件

#### AnalyticsDashboard - 分析仪表板

```typescript
// 主分析面板
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

<AnalyticsDashboard
  timeRange={{
    start: new Date('2025-01-01'),
    end: new Date()
  }}
  granularity={TimeGranularity.DAY}
/>
```

**功能模块：**

- 实时统计卡片（在线用户、总浏览量、独立访客、平均阅读时长）
- 页面浏览趋势图
- 设备分布饼图
- 热门文章排行
- 浏览器分布统计
- 实时页面活动
- 用户分析（新用户、回访用户、留存率）
- 热门搜索词

#### PostAnalytics - 文章分析

```typescript
// 单篇文章分析
import { PostAnalytics } from '@/components/analytics/PostAnalytics'

<PostAnalytics postId="article-123" />
```

**展示内容：**

- 核心指标（浏览量、独立访客、阅读时长、完读率）
- 浏览趋势折线图
- 流量来源分析
- 地理位置分布
- 参与度评分
- 相关文章推荐

#### RealtimeMonitor - 实时监控

```typescript
// 实时活动监控
import { RealtimeMonitor } from '@/components/analytics/RealtimeMonitor'

<RealtimeMonitor maxEvents={20} />
```

**监控内容：**

- 实时事件流
- 活跃用户列表
- 页面活跃度热力图
- 实时统计指标
- WebSocket实时更新

#### UserActivityMap - 用户活动热力图

```typescript
// 用户活动分析
import { UserActivityMap } from '@/components/analytics/UserActivityMap'

<UserActivityMap userId="user-123" />
```

**分析维度：**

- 24小时 x 7天活动热力图
- 最活跃时段识别
- 工作日/周末对比
- 上午/夜间活跃度
- 活动模式分析

#### EngagementFunnel - 参与度漏斗

```typescript
// 转化漏斗分析
import { EngagementFunnel } from '@/components/analytics/EngagementFunnel'

<EngagementFunnel
  stages={[
    { name: '页面访问', value: 1000 },
    { name: '文章浏览', value: 800 },
    { name: '完整阅读', value: 500 },
    { name: '互动参与', value: 200 }
  ]}
  showDropoff={true}
/>
```

**分析功能：**

- 多阶段转化展示
- 流失率计算
- 总转化率统计
- 动画渐进展示
- 自定义颜色

## 集成指南

### 1. 在页面中使用

```typescript
// app/dashboard/analytics/page.tsx
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">数据分析</h1>
      <AnalyticsDashboard />
    </div>
  )
}
```

### 2. 在文章页面添加分析

```typescript
// app/posts/[slug]/page.tsx
import { PostAnalytics } from '@/components/analytics/PostAnalytics'

export default function PostPage({ params }: { params: { slug: string } }) {
  return (
    <>
      {/* 文章内容 */}
      <article>...</article>

      {/* 仅管理员可见的分析数据 */}
      {isAdmin && (
        <div className="mt-12">
          <PostAnalytics postId={params.slug} />
        </div>
      )}
    </>
  )
}
```

### 3. 实时监控集成

```typescript
// app/admin/monitoring/page.tsx
import { RealtimeMonitor } from '@/components/analytics/RealtimeMonitor'

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RealtimeMonitor />
    </div>
  )
}
```

## 数据接口

### 统计数据API

```typescript
// POST /api/analytics/stats
{
  timeRange: { start: Date, end: Date },
  granularity: 'hour' | 'day' | 'week' | 'month'
}

// Response
{
  total_views: number,
  unique_visitors: number,
  avg_session_duration: number,
  bounce_rate: number,
  device_breakdown: { [device: string]: number },
  top_posts: Array<{ post_id, views, reads }>,
  // ... 更多统计数据
}
```

### 实时数据API

```typescript
// GET /api/analytics/realtime
// Response
{
  current_active_users: number,
  current_page_views: Array<{ path, count }>,
  recent_events: AnalyticsEvent[],
  trending_posts: Array<{ post_id, trend_score }>
}
```

### 文章分析API

```typescript
// GET /api/analytics/posts/:postId
// Response
{
  post_id: string,
  title: string,
  total_views: number,
  unique_visitors: number,
  avg_read_time: number,
  completion_rate: number,
  views_over_time: Array<{ date, views }>,
  // ... 更多分析数据
}
```

## 性能优化

### 1. Canvas渲染优化

- 使用`requestAnimationFrame`控制动画帧率
- 实现脏矩形重绘减少渲染开销
- 离屏Canvas预渲染复杂图形
- 根据设备性能自动降级动画

### 2. 数据加载优化

- 实现数据分页和懒加载
- 使用React Query缓存请求结果
- WebSocket连接复用
- 压缩传输数据格式

### 3. 响应式设计

- 移动端自适应布局
- 触摸手势支持
- 高DPI屏幕适配
- 打印样式优化

## 自定义主题

所有图表组件都支持主题定制：

```typescript
// 通过主题上下文自动适配
const { theme } = useTheme()

// 或手动指定颜色
<LineChart
  color="#10B981" // 自定义主色
  colorScale={{
    min: '#DBEAFE',
    max: '#1E3A8A'
  }}
/>
```

## 可访问性

- 所有图表提供文本替代描述
- 键盘导航支持
- 屏幕阅读器友好
- 高对比度模式支持
- 减少动画偏好检测

## 测试覆盖

已实现的测试：

- 单元测试：图表组件渲染和交互
- 集成测试：数据加载和更新
- 性能测试：大数据集渲染
- 可访问性测试：WCAG标准验证

## 后续扩展

### 计划中的功能

1. 更多图表类型（散点图、雷达图、桑基图）
2. 数据导出功能（PNG、SVG、CSV）
3. 自定义仪表板布局
4. 数据对比分析
5. 预测性分析

### 集成建议

1. 与个性化推荐系统结合
2. 添加数据订阅和报告功能
3. 实现数据异常检测告警
4. 支持多维度交叉分析
5. 移动端专属视图

## 注意事项

1. **权限控制**：确保分析数据仅对管理员可见
2. **性能监控**：大数据集可能影响渲染性能
3. **浏览器兼容**：Canvas API需要现代浏览器支持
4. **数据隐私**：遵守GDPR等隐私法规
5. **缓存策略**：合理设置数据缓存时间

## 示例代码

完整的分析页面示例：

```typescript
import { useState } from 'react'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { TimeGranularity } from '@/lib/analytics/types'
import { DateRangePicker } from '@/components/ui/DateRangePicker'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  })
  const [granularity, setGranularity] = useState(TimeGranularity.DAY)

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">数据分析中心</h1>

        <div className="flex gap-4">
          <DateRangePicker
            value={timeRange}
            onChange={setTimeRange}
          />

          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as TimeGranularity)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value={TimeGranularity.HOUR}>小时</option>
            <option value={TimeGranularity.DAY}>天</option>
            <option value={TimeGranularity.WEEK}>周</option>
            <option value={TimeGranularity.MONTH}>月</option>
          </select>
        </div>
      </div>

      <AnalyticsDashboard
        timeRange={timeRange}
        granularity={granularity}
      />
    </div>
  )
}
```

---

**作者**：终端B  
**创建时间**：2025年1月11日  
**版本**：1.0.0
