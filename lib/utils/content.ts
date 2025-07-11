/**
 * Content utility functions
 */

/**
 * Calculate word count from HTML content
 */
export function calculateWordCount(htmlContent: string): number {
  // Remove HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, '')
  
  // Remove extra whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim()
  
  // Count Chinese characters and English words separately
  const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = cleanText
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0).length
  
  // For Chinese text, each character counts as a word
  // For English text, count actual words
  return chineseChars + englishWords
}

/**
 * Calculate reading time based on word count
 * Average reading speed: 200-250 Chinese chars/min, 200-250 English words/min
 */
export function calculateReadingTime(wordCount: number): string {
  const wordsPerMinute = 225
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  
  if (minutes < 1) {
    return '少于 1 分钟'
  } else if (minutes === 1) {
    return '1 分钟'
  } else {
    return `${minutes} 分钟`
  }
}

/**
 * Format update time relative to publish time
 */
export function formatUpdateTime(publishDate: string, updateDate: string): string | null {
  const publish = new Date(publishDate)
  const update = new Date(updateDate)
  
  // Only show update time if it's significantly after publish time (> 1 day)
  const oneDayInMs = 24 * 60 * 60 * 1000
  if (update.getTime() - publish.getTime() < oneDayInMs) {
    return null
  }
  
  return formatRelativeDate(updateDate)
}

/**
 * Format date in relative terms
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return '今天'
  } else if (diffInDays === 1) {
    return '昨天'
  } else if (diffInDays < 7) {
    return `${diffInDays} 天前`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} 周前`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `${months} 个月前`
  } else {
    const years = Math.floor(diffInDays / 365)
    return `${years} 年前`
  }
}