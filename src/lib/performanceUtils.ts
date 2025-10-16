/**
 * Performance optimization utilities for dashboard components
 */

// Notification batching utility
export class NotificationBatcher {
  private batch: Array<() => void> = []
  private timeoutId: NodeJS.Timeout | null = null
  private readonly batchDelay: number

  constructor(batchDelay: number = 100) {
    this.batchDelay = batchDelay
  }

  add(operation: () => void) {
    this.batch.push(operation)
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(() => {
      this.flush()
    }, this.batchDelay)
  }

  flush() {
    if (this.batch.length > 0) {
      // Execute all batched operations
      this.batch.forEach(operation => operation())
      this.batch = []
    }
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  clear() {
    this.batch = []
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
}

// Memoization utility for expensive calculations
export function createMemoizedSelector<T, R>(
  selector: (input: T) => R,
  equalityFn?: (a: T, b: T) => boolean
) {
  let lastInput: T
  let lastResult: R
  let hasResult = false

  const defaultEqualityFn = (a: T, b: T) => a === b

  return (input: T): R => {
    const isEqual = equalityFn || defaultEqualityFn
    
    if (!hasResult || !isEqual(input, lastInput)) {
      lastInput = input
      lastResult = selector(input)
      hasResult = true
    }
    
    return lastResult
  }
}

// Debounced localStorage operations
export class DebouncedStorage {
  private timeouts = new Map<string, NodeJS.Timeout>()
  private readonly delay: number

  constructor(delay: number = 500) {
    this.delay = delay
  }

  setItem(key: string, value: string) {
    // Clear existing timeout for this key
    const existingTimeout = this.timeouts.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(key, value)
        this.timeouts.delete(key)
      } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error)
      }
    }, this.delay)

    this.timeouts.set(key, timeout)
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return null
    }
  }

  removeItem(key: string) {
    // Clear any pending write
    const existingTimeout = this.timeouts.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.timeouts.delete(key)
    }

    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
    }
  }

  flush() {
    // Force all pending writes to execute immediately
    this.timeouts.forEach((timeout, key) => {
      clearTimeout(timeout)
      // Execute the write immediately
      const value = this.getItem(key)
      if (value !== null) {
        try {
          localStorage.setItem(key, value)
        } catch (error) {
          console.error(`Error flushing localStorage (${key}):`, error)
        }
      }
    })
    this.timeouts.clear()
  }

  clear() {
    // Clear all pending operations
    this.timeouts.forEach(timeout => clearTimeout(timeout))
    this.timeouts.clear()
  }
}

// Create a global debounced storage instance
export const debouncedStorage = new DebouncedStorage()

// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics = new Map<string, number[]>()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTiming(label: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, [])
      }
      
      const measurements = this.metrics.get(label)!
      measurements.push(duration)
      
      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift()
      }
      
      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`)
      }
    }
  }

  getAverageTime(label: string): number {
    const measurements = this.metrics.get(label)
    if (!measurements || measurements.length === 0) {
      return 0
    }
    
    const sum = measurements.reduce((acc, time) => acc + time, 0)
    return sum / measurements.length
  }

  getMetrics(): Record<string, { average: number; count: number; max: number }> {
    const result: Record<string, { average: number; count: number; max: number }> = {}
    
    this.metrics.forEach((measurements, label) => {
      if (measurements.length > 0) {
        const sum = measurements.reduce((acc, time) => acc + time, 0)
        const average = sum / measurements.length
        const max = Math.max(...measurements)
        
        result[label] = {
          average: Math.round(average * 100) / 100,
          count: measurements.length,
          max: Math.round(max * 100) / 100
        }
      }
    })
    
    return result
  }

  reset() {
    this.metrics.clear()
  }
}

// React performance utilities
export function shouldComponentUpdate<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  keys?: (keyof T)[]
): boolean {
  const keysToCheck = keys || Object.keys(nextProps) as (keyof T)[]
  
  return keysToCheck.some(key => prevProps[key] !== nextProps[key])
}

// Utility for creating stable references
export function createStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  // This would be used with useCallback in components
  return callback
}

// Memory usage monitoring (for development)
export function logMemoryUsage(label: string) {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory
    console.log(`Memory usage (${label}):`, {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
    })
  }
}