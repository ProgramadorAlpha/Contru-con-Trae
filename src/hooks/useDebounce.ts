import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook for debouncing values to prevent excessive API calls or expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for debouncing callback functions
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef<T>(callback)

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback
  }, [callback, ...deps])

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  ) as T

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Hook for throttling values (limits the rate of updates)
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * Hook for batching state updates to reduce re-renders
 */
export function useBatchedUpdates<T>(
  initialState: T,
  batchDelay: number = 100
): [T, (updater: (prev: T) => T) => void, () => void] {
  const [state, setState] = useState<T>(initialState)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const pendingUpdatesRef = useRef<Array<(prev: T) => T>>([])

  const batchUpdate = useCallback((updater: (prev: T) => T) => {
    pendingUpdatesRef.current.push(updater)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (pendingUpdatesRef.current.length > 0) {
        setState(currentState => {
          const result = pendingUpdatesRef.current.reduce((acc, update) => update(acc), currentState)
          pendingUpdatesRef.current = []
          return result
        })
      }
    }, batchDelay)
  }, [batchDelay])

  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (pendingUpdatesRef.current.length > 0) {
      setState(currentState => {
        const result = pendingUpdatesRef.current.reduce((acc, update) => update(acc), currentState)
        pendingUpdatesRef.current = []
        return result
      })
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [state, batchUpdate, flushUpdates]
}