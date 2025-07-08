/**
 * 告警管理器
 * 负责监控指标告警的检测、触发和通知
 */

import { createClient } from '@/lib/supabase/server'
import { 
  MetricDataPoint, 
  MetricType,
  Alert,
  AlertRule,
  AlertChannel,
  MonitoringConfig
} from './types'
import { DEFAULT_CONFIG, DEFAULT_ALERT_RULES } from './config'

/**
 * 告警管理器
 */
export class AlertManager {
  private config: MonitoringConfig
  private supabase: any

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializeSupabase()
  }

  private async initializeSupabase() {
    this.supabase = await createClient()
  }

  /**
   * 检查告警条件
   */
  async checkAlerts(metrics: MetricDataPoint[]) {
    if (!this.config.alerting.enabled) return

    // 获取启用的告警规则
    const enabledRules = this.config.alerting.rules.filter(rule => rule.enabled)
    
    // 按指标类型分组
    const metricsByType = new Map<MetricType, MetricDataPoint[]>()
    metrics.forEach(metric => {
      if (!metricsByType.has(metric.metric_type)) {
        metricsByType.set(metric.metric_type, [])
      }
      metricsByType.get(metric.metric_type)!.push(metric)
    })

    // 检查每个规则
    for (const rule of enabledRules) {
      const typeMetrics = metricsByType.get(rule.metric_type) || []
      if (typeMetrics.length === 0) continue

      await this.evaluateRule(rule, typeMetrics)
    }
  }

  /**
   * 评估告警规则
   */
  private async evaluateRule(rule: AlertRule, metrics: MetricDataPoint[]) {
    // 计算指标值
    const values = metrics.map(m => m.value)
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length

    // 检查条件
    const triggered = this.checkCondition(avgValue, rule.condition)
    
    if (triggered) {
      // 检查是否需要持续时间验证
      if (rule.condition.duration) {
        const isConsistent = await this.checkDurationCondition(
          rule.metric_type,
          rule.condition,
          rule.condition.duration
        )
        if (!isConsistent) return
      }

      // 检查是否需要多次发生
      if (rule.condition.occurrence) {
        const occurrences = await this.checkOccurrenceCondition(
          rule.metric_type,
          rule.condition,
          rule.condition.occurrence
        )
        if (occurrences < rule.condition.occurrence) return
      }

      // 触发告警
      await this.triggerAlert(rule, avgValue, metrics)
    } else {
      // 检查是否有未解决的告警需要自动解决
      await this.checkForResolution(rule, avgValue)
    }
  }

  /**
   * 检查条件是否满足
   */
  private checkCondition(
    value: number,
    condition: AlertRule['condition']
  ): boolean {
    switch (condition.operator) {
      case 'gt':
        return value > condition.threshold
      case 'lt':
        return value < condition.threshold
      case 'gte':
        return value >= condition.threshold
      case 'lte':
        return value <= condition.threshold
      case 'eq':
        return value === condition.threshold
      case 'neq':
        return value !== condition.threshold
      default:
        return false
    }
  }

  /**
   * 检查持续时间条件
   */
  private async checkDurationCondition(
    metricType: MetricType,
    condition: AlertRule['condition'],
    duration: number
  ): Promise<boolean> {
    const startTime = new Date(Date.now() - duration * 1000)
    
    // 查询时间范围内的指标
    const { data: metrics } = await this.supabase
      .from('monitoring_metrics')
      .select('value, timestamp')
      .eq('metric_type', metricType)
      .gte('timestamp', startTime.toISOString())
      .order('timestamp', { ascending: true })

    if (!metrics || metrics.length === 0) return false

    // 检查所有值是否都满足条件
    return metrics.every((m: any) => 
      this.checkCondition(m.value, condition)
    )
  }

  /**
   * 检查发生次数条件
   */
  private async checkOccurrenceCondition(
    metricType: MetricType,
    condition: AlertRule['condition'],
    occurrence: number
  ): Promise<number> {
    const lookbackTime = new Date(Date.now() - 30 * 60 * 1000) // 30分钟内
    
    // 查询最近的指标
    const { data: metrics } = await this.supabase
      .from('monitoring_metrics')
      .select('value')
      .eq('metric_type', metricType)
      .gte('timestamp', lookbackTime.toISOString())

    if (!metrics) return 0

    // 计算满足条件的次数
    return metrics.filter((m: any) => 
      this.checkCondition(m.value, condition)
    ).length
  }

  /**
   * 触发告警
   */
  private async triggerAlert(
    rule: AlertRule,
    triggeredValue: number,
    metrics: MetricDataPoint[]
  ) {
    // 检查是否已有未解决的相同告警
    const { data: existingAlerts } = await this.supabase
      .from('monitoring_alerts')
      .select('id')
      .eq('rule_id', rule.id)
      .eq('status', 'open')
      .single()

    if (existingAlerts) {
      // 更新现有告警
      await this.supabase
        .from('monitoring_alerts')
        .update({
          triggered_value: triggeredValue,
          triggered_at: new Date().toISOString(),
        })
        .eq('id', existingAlerts.id)
      return
    }

    // 创建新告警
    const alert: Omit<Alert, 'id'> = {
      rule_id: rule.id,
      rule_name: rule.name,
      metric_type: rule.metric_type,
      severity: rule.severity,
      status: 'open',
      triggered_at: new Date(),
      triggered_value: triggeredValue,
      threshold_value: rule.condition.threshold,
      context: {
        metrics_count: metrics.length,
        affected_pages: [...new Set(metrics.map(m => m.context.page).filter(Boolean))],
        affected_endpoints: [...new Set(metrics.map(m => m.context.api_endpoint).filter(Boolean))],
      },
      notifications: [],
    }

    const { data: createdAlert, error } = await this.supabase
      .from('monitoring_alerts')
      .insert(alert)
      .select()
      .single()

    if (error) {
      console.error('Failed to create alert:', error)
      return
    }

    // 发送通知
    await this.sendNotifications(createdAlert, rule)
  }

  /**
   * 检查告警是否可以自动解决
   */
  private async checkForResolution(rule: AlertRule, currentValue: number) {
    // 查找未解决的告警
    const { data: openAlerts } = await this.supabase
      .from('monitoring_alerts')
      .select('*')
      .eq('rule_id', rule.id)
      .eq('status', 'open')

    if (!openAlerts || openAlerts.length === 0) return

    for (const alert of openAlerts) {
      // 检查值是否已恢复正常（留出10%的缓冲区）
      const buffer = Math.abs(alert.threshold_value * 0.1)
      const isResolved = !this.checkCondition(
        currentValue,
        {
          ...rule.condition,
          threshold: rule.condition.threshold - buffer,
        }
      )

      if (isResolved) {
        // 更新告警状态
        await this.supabase
          .from('monitoring_alerts')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolved_by: 'system',
          })
          .eq('id', alert.id)

        // 发送解决通知
        await this.sendResolutionNotification(alert, currentValue)
      }
    }
  }

  /**
   * 发送告警通知
   */
  private async sendNotifications(alert: Alert, rule: AlertRule) {
    const channels = this.config.alerting.channels.filter(
      channel => channel.enabled && rule.channels.includes(channel.id)
    )

    for (const channel of channels) {
      try {
        await this.sendToChannel(channel, alert, 'triggered')
        
        // 记录通知发送
        await this.supabase
          .from('monitoring_alerts')
          .update({
            notifications: [
              ...alert.notifications,
              {
                channel: channel.id,
                sent_at: new Date(),
                status: 'success',
              },
            ],
          })
          .eq('id', alert.id)
      } catch (error) {
        console.error(`Failed to send notification to ${channel.type}:`, error)
        
        // 记录失败
        await this.supabase
          .from('monitoring_alerts')
          .update({
            notifications: [
              ...alert.notifications,
              {
                channel: channel.id,
                sent_at: new Date(),
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            ],
          })
          .eq('id', alert.id)
      }
    }
  }

  /**
   * 发送解决通知
   */
  private async sendResolutionNotification(alert: Alert, currentValue: number) {
    const rule = this.config.alerting.rules.find(r => r.id === alert.rule_id)
    if (!rule) return

    const channels = this.config.alerting.channels.filter(
      channel => channel.enabled && rule.channels.includes(channel.id)
    )

    for (const channel of channels) {
      try {
        await this.sendToChannel(channel, alert, 'resolved', { currentValue })
      } catch (error) {
        console.error(`Failed to send resolution notification to ${channel.type}:`, error)
      }
    }
  }

  /**
   * 发送到特定通道
   */
  private async sendToChannel(
    channel: AlertChannel,
    alert: Alert,
    type: 'triggered' | 'resolved',
    extra?: any
  ) {
    switch (channel.type) {
      case 'email':
        await this.sendEmail(channel, alert, type, extra)
        break
      case 'slack':
        await this.sendSlack(channel, alert, type, extra)
        break
      case 'webhook':
        await this.sendWebhook(channel, alert, type, extra)
        break
      case 'pagerduty':
        await this.sendPagerDuty(channel, alert, type, extra)
        break
    }
  }

  /**
   * 发送邮件通知
   */
  private async sendEmail(
    channel: AlertChannel,
    alert: Alert,
    type: 'triggered' | 'resolved',
    extra?: any
  ) {
    const subject = type === 'triggered'
      ? `[${alert.severity.toUpperCase()}] ${alert.rule_name}`
      : `[RESOLVED] ${alert.rule_name}`

    const body = this.formatAlertMessage(alert, type, extra)

    // 调用邮件发送 API
    await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: channel.config.recipients,
        subject,
        html: body,
        priority: alert.severity === 'critical' ? 'high' : 'normal',
      }),
    })
  }

  /**
   * 发送 Slack 通知
   */
  private async sendSlack(
    channel: AlertChannel,
    alert: Alert,
    type: 'triggered' | 'resolved',
    extra?: any
  ) {
    const color = type === 'triggered'
      ? this.getSeverityColor(alert.severity)
      : '#36a64f'

    const payload = {
      channel: channel.config.channel,
      attachments: [{
        color,
        title: type === 'triggered'
          ? `🚨 ${alert.rule_name}`
          : `✅ ${alert.rule_name} (已解决)`,
        fields: [
          {
            title: '指标类型',
            value: alert.metric_type,
            short: true,
          },
          {
            title: '当前值',
            value: type === 'triggered'
              ? `${alert.triggered_value}`
              : `${extra?.currentValue || 'N/A'}`,
            short: true,
          },
          {
            title: '阈值',
            value: `${alert.threshold_value}`,
            short: true,
          },
          {
            title: '触发时间',
            value: new Date(alert.triggered_at).toLocaleString(),
            short: true,
          },
        ],
        footer: 'Monitoring System',
        ts: Math.floor(Date.now() / 1000),
      }],
    }

    await fetch(channel.config.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  /**
   * 发送 Webhook 通知
   */
  private async sendWebhook(
    channel: AlertChannel,
    alert: Alert,
    type: 'triggered' | 'resolved',
    extra?: any
  ) {
    const payload = {
      type,
      alert,
      timestamp: new Date().toISOString(),
      ...extra,
    }

    await fetch(channel.config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...channel.config.headers,
      },
      body: JSON.stringify(payload),
    })
  }

  /**
   * 发送 PagerDuty 通知
   */
  private async sendPagerDuty(
    channel: AlertChannel,
    alert: Alert,
    type: 'triggered' | 'resolved',
    extra?: any
  ) {
    const event_action = type === 'triggered' ? 'trigger' : 'resolve'
    
    const payload = {
      routing_key: channel.config.api_key,
      event_action,
      dedup_key: `${alert.rule_id}-${alert.triggered_at}`,
      payload: {
        summary: alert.rule_name,
        severity: this.mapSeverityToPagerDuty(alert.severity),
        source: 'monitoring-system',
        custom_details: {
          metric_type: alert.metric_type,
          triggered_value: alert.triggered_value,
          threshold_value: alert.threshold_value,
          context: alert.context,
        },
      },
    }

    await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  /**
   * 格式化告警消息
   */
  private formatAlertMessage(
    alert: Alert,
    type: 'triggered' | 'resolved',
    extra?: any
  ): string {
    const emoji = type === 'triggered' ? '🚨' : '✅'
    const status = type === 'triggered' ? '触发' : '已解决'
    
    return `
      <h2>${emoji} 告警${status}: ${alert.rule_name}</h2>
      
      <h3>详细信息</h3>
      <ul>
        <li><strong>指标类型:</strong> ${alert.metric_type}</li>
        <li><strong>严重程度:</strong> ${alert.severity}</li>
        <li><strong>触发值:</strong> ${alert.triggered_value}</li>
        <li><strong>阈值:</strong> ${alert.threshold_value}</li>
        <li><strong>触发时间:</strong> ${new Date(alert.triggered_at).toLocaleString()}</li>
        ${type === 'resolved' ? `<li><strong>当前值:</strong> ${extra?.currentValue || 'N/A'}</li>` : ''}
      </ul>
      
      <h3>上下文</h3>
      <pre>${JSON.stringify(alert.context, null, 2)}</pre>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/monitoring/alerts/${alert.id}">
          查看详情
        </a>
      </p>
    `
  }

  /**
   * 获取严重性颜色
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return '#ff0000'
      case 'error':
        return '#ff6b6b'
      case 'warning':
        return '#ffa500'
      case 'info':
        return '#0066cc'
      default:
        return '#808080'
    }
  }

  /**
   * 映射严重性到 PagerDuty
   */
  private mapSeverityToPagerDuty(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'critical'
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'info'
    }
  }

  /**
   * 手动确认告警
   */
  async acknowledgeAlert(alertId: string, userId: string) {
    await this.supabase
      .from('monitoring_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId,
      })
      .eq('id', alertId)
  }

  /**
   * 手动解决告警
   */
  async resolveAlert(alertId: string, userId: string) {
    await this.supabase
      .from('monitoring_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
      })
      .eq('id', alertId)
  }

  /**
   * 获取活跃告警
   */
  async getActiveAlerts() {
    const { data: alerts } = await this.supabase
      .from('monitoring_alerts')
      .select('*')
      .in('status', ['open', 'acknowledged'])
      .order('triggered_at', { ascending: false })

    return alerts || []
  }
}