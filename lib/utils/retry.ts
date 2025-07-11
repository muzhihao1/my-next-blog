/**
 * Retry utility for handling transient failures
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryableErrors?: (error: any) => boolean
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000,
  backoffFactor: 2,
  retryableErrors: (error) => {
    // Retry on network errors or specific Notion API errors
    if (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'EAI_AGAIN'
    ) {
      return true
    }
    
    // Retry on specific Notion API status codes
    if (
      error.status === 429 || // Rate limited
      error.status === 502 || // Bad gateway
      error.status === 503 || // Service unavailable
      error.status === 504    // Gateway timeout
    ) {
      return true
    }
    
    return false
  }
}

/**
 * Execute a function with exponential backoff retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: any
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry if it's the last attempt
      if (attempt === opts.maxRetries) {
        break
      }
      
      // Check if error is retryable
      if (!opts.retryableErrors(error)) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      )
      
      console.warn(
        `Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms due to:`,
        error
      )
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError
}

/**
 * Batch multiple promises with concurrency control
 */
export async function batchPromises<T>(
  items: T[],
  batchFn: (item: T) => Promise<any>,
  concurrency = 5
): Promise<any[]> {
  const results: any[] = []
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(item => batchFn(item))
    )
    results.push(...batchResults)
  }
  
  return results
}