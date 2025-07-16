/**
 * Notion 辅助函数
 * 处理Notion API相关的工具函数
 */

/**
 * 规范化Notion ID格式
 * Notion ID有两种格式：
 * 1. 带连字符: 21f1b640-00a7-8055-a2bc-c7fb093e0f97
 * 2. 不带连字符: 21f1b64000a78055a2bcc7fb093e0f97
 * 
 * @param id 原始ID
 * @returns 规范化后的ID（带连字符格式）
 */
export function normalizeNotionId(id: string): string {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid Notion ID')
  }
  
  // 移除所有连字符
  const cleanId = id.replace(/-/g, '')
  
  // 检查长度是否为32个字符
  if (cleanId.length !== 32) {
    throw new Error(`Invalid Notion ID length: ${cleanId.length}`)
  }
  
  // 重新添加连字符到标准位置
  // 格式: 8-4-4-4-12
  const formatted = [
    cleanId.substring(0, 8),
    cleanId.substring(8, 12),
    cleanId.substring(12, 16),
    cleanId.substring(16, 20),
    cleanId.substring(20, 32)
  ].join('-')
  
  return formatted
}

/**
 * 从URL中提取Notion ID
 * @param url Notion页面或数据库URL
 * @returns 提取的ID
 */
export function extractNotionIdFromUrl(url: string): string | null {
  if (!url) return null
  
  // 匹配Notion URL中的ID（32个字符的十六进制字符串）
  const match = url.match(/([a-f0-9]{32})/i)
  
  if (match) {
    return normalizeNotionId(match[1])
  }
  
  return null
}

/**
 * 验证是否为有效的Notion ID
 * @param id 要验证的ID
 * @returns 是否有效
 */
export function isValidNotionId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  
  // 移除连字符后应该是32个十六进制字符
  const cleanId = id.replace(/-/g, '')
  return /^[a-f0-9]{32}$/i.test(cleanId)
}

/**
 * 获取规范化的环境变量ID
 * @param envKey 环境变量键名
 * @returns 规范化后的ID或undefined
 */
export function getNotionEnvId(envKey: string): string | undefined {
  const id = process.env[envKey]
  
  if (!id) {
    console.warn(`Environment variable ${envKey} is not set`)
    return undefined
  }
  
  try {
    return normalizeNotionId(id)
  } catch (error) {
    console.error(`Invalid Notion ID in ${envKey}:`, error)
    return undefined
  }
}