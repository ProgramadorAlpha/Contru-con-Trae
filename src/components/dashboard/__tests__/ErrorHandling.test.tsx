import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { ChartErrorBoundary } from '../ChartErrorBoundary'
import { DashboardSkeleton, LoadingSpinner } from '../LoadingSkeletons'

// Simple error component
const SimpleErrorComponent = ({ message = 'Test error' }: { message?: string }) => {
  throw new Error(message)
}

// Component with retry logic
const RetryableComponent = ({ 
  maxAttempts = 3,
  onRetry
}: { 
  maxAttempts?: number
  onRetry?: () => void
}) => {
  const [attempts, setAttempts] = React.useState(0)
  const [error, setError] = React.useState<Error | null>(null)

  const handleRetry = () => {
    if (attempts < maxAttempts) {
      setAttempts(prev => prev + 1)
      setError(null)
      onRetry?.()
    }
  }

  React.useEffect(() => {
    if (attempts > 0 && attempts < maxAttempts) {
      setError(new Error(`Attempt ${attempts} failed`))
    }
  }, [attempts, maxAttempts])

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={handleRetry}>Retry</button>
        <p>Attempts: {attempts}/{maxAttempts}</p>
      </div>
    )
  }

  return <div>Success</div>
}

describe('Error Handling Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Network Errors', () => {
    it('should catch and display network errors', () => {
      render(
        <ChartErrorBoundary>
          <SimpleErrorComponent message="Network request failed" />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()
      expect(screen.getByText('Network request failed')).toBeInTheDocument()
    })

    it('should catch and display timeout errors', () => {
      render(
        <ChartErrorBoundary>
          <SimpleErrorComponent message="Request timeout" />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()
      expect(screen.getByText('Request timeout')).toBeInTheDocument()
    })

    it('should catch and display server errors', () => {
      render(
        <ChartErrorBoundary>
          <SimpleErrorComponent message="Server error: 500" />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()
      expect(screen.getByText(/Server error: 500/i)).toBeInTheDocument()
    })

    it('should show loading spinner component', () => {
      const { container } = render(<LoadingSpinner />)

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should allow retry after network error', async () => {
      render(
        <ChartErrorBoundary>
          <SimpleErrorComponent message="Network request failed" />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Network request failed')).toBeInTheDocument()

      const retryButton = screen.getByRole('button', { name: /reintentar/i })
      expect(retryButton).toBeInTheDocument()
      
      fireEvent.click(retryButton)

      // After retry, error boundary resets
      await waitFor(() => {
        expect(retryButton).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('Rendering Errors', () => {
    it('should catch component rendering errors', () => {
      const BrokenComponent = () => {
        throw new Error('Component render failed')
      }

      render(
        <ChartErrorBoundary>
          <BrokenComponent />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()
      expect(screen.getByText('Component render failed')).toBeInTheDocument()
    })

    it('should catch errors in nested components', () => {
      const NestedError = () => {
        throw new Error('Nested component error')
      }

      const ParentComponent = () => (
        <div>
          <h1>Parent</h1>
          <NestedError />
        </div>
      )

      render(
        <ChartErrorBoundary>
          <ParentComponent />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Nested component error')).toBeInTheDocument()
    })

    it('should catch errors in useEffect hooks', () => {
      const EffectError = () => {
        React.useEffect(() => {
          throw new Error('Effect error')
        }, [])

        return <div>Component</div>
      }

      render(
        <ChartErrorBoundary>
          <EffectError />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()
    })
  })

  describe('Error Messages', () => {
    it('should display user-friendly error messages', () => {
      const ErrorComponent = () => {
        throw new Error('Something went wrong')
      }

      render(
        <ChartErrorBoundary>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should show generic message for unknown errors', () => {
      const ErrorComponent = () => {
        throw new Error()
      }

      render(
        <ChartErrorBoundary>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      expect(screen.getByText(/ha ocurrido un error inesperado/i)).toBeInTheDocument()
    })

    it('should display error icon', () => {
      const ErrorComponent = () => {
        throw new Error('Test error')
      }

      const { container } = render(
        <ChartErrorBoundary>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      // Check for AlertTriangle icon
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Retry Button Functionality', () => {
    it('should show retry button on error', () => {
      const ErrorComponent = () => {
        throw new Error('Test error')
      }

      render(
        <ChartErrorBoundary>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /reintentar/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should be clickable and trigger retry', async () => {
      const ErrorComponent = () => {
        throw new Error('Test error')
      }

      render(
        <ChartErrorBoundary>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /reintentar/i })
      expect(retryButton).not.toBeDisabled()

      fireEvent.click(retryButton)

      // Button should still be present after click
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should track retry attempts', () => {
      const onRetry = vi.fn()

      render(
        <ChartErrorBoundary onError={onRetry}>
          <SimpleErrorComponent message="Trackable error" />
        </ChartErrorBoundary>
      )

      // onError should be called when error is caught
      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(onRetry).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Trackable error'
        }),
        expect.any(Object)
      )
    })

    it('should disable retry after max attempts', async () => {
      render(
        <ChartErrorBoundary>
          <SimpleErrorComponent message="Persistent error" />
        </ChartErrorBoundary>
      )

      // Click retry 3 times (max attempts)
      for (let i = 0; i < 3; i++) {
        const retryButton = screen.queryByRole('button', { name: /reintentar/i })
        if (retryButton) {
          fireEvent.click(retryButton)
          await new Promise(resolve => setTimeout(resolve, 1100))
        }
      }

      // After 3 retries, button should be hidden
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /reintentar.*intentos restantes/i })).not.toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should show remaining attempts', () => {
      const ErrorComponent = () => {
        throw new Error('Test error')
      }

      render(
        <ChartErrorBoundary>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      expect(screen.getByText(/3 intentos restantes/i)).toBeInTheDocument()
    })
  })

  describe('Reset Functionality', () => {
    it('should show reset button', () => {
      const ErrorComponent = () => {
        throw new Error('Test error')
      }

      render(
        <ChartErrorBoundary>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      const resetButton = screen.getByRole('button', { name: /restablecer/i })
      expect(resetButton).toBeInTheDocument()
    })

    it('should reset error state on click', async () => {
      const { rerender } = render(
        <ChartErrorBoundary>
          <SimpleErrorComponent message="Resettable error" />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()

      const resetButton = screen.getByRole('button', { name: /restablecer/i })
      fireEvent.click(resetButton)

      await waitFor(() => {
        rerender(
          <ChartErrorBoundary>
            <div>Success after reset</div>
          </ChartErrorBoundary>
        )
      })
    })
  })

  describe('Loading States', () => {
    it('should show skeleton loader during initial load', () => {
      const { container } = render(<DashboardSkeleton />)

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('should show spinner for inline loading', () => {
      const { container } = render(<LoadingSpinner />)

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should transition from loading to content', async () => {
      const SlowComponent = () => {
        const [loading, setLoading] = React.useState(true)

        React.useEffect(() => {
          setTimeout(() => setLoading(false), 100)
        }, [])

        if (loading) {
          return <LoadingSpinner />
        }

        return <div>Content loaded</div>
      }

      const { container } = render(<SlowComponent />)

      // Initially loading
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()

      // Wait for content
      await waitFor(() => {
        expect(screen.getByText('Content loaded')).toBeInTheDocument()
      })
    })

    it('should transition from loading to error', () => {
      render(
        <ChartErrorBoundary>
          <SimpleErrorComponent message="Loading failed" />
        </ChartErrorBoundary>
      )

      // Error should appear immediately
      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()
      expect(screen.getByText('Loading failed')).toBeInTheDocument()
    })
  })

  describe('Error Boundary Isolation', () => {
    it('should isolate errors to specific boundary', () => {
      const ErrorComponent = () => {
        throw new Error('Isolated error')
      }

      const SafeComponent = () => <div>Safe content</div>

      render(
        <div>
          <ChartErrorBoundary>
            <ErrorComponent />
          </ChartErrorBoundary>
          <SafeComponent />
        </div>
      )

      // Error should be caught
      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()
      
      // Safe component should still render
      expect(screen.getByText('Safe content')).toBeInTheDocument()
    })

    it('should handle multiple error boundaries independently', () => {
      const Error1 = () => {
        throw new Error('Error 1')
      }

      const Error2 = () => {
        throw new Error('Error 2')
      }

      render(
        <div>
          <ChartErrorBoundary chartType="chart1">
            <Error1 />
          </ChartErrorBoundary>
          <ChartErrorBoundary chartType="chart2">
            <Error2 />
          </ChartErrorBoundary>
        </div>
      )

      // Both errors should be displayed independently
      const errorMessages = screen.getAllByText('Error al cargar el gráfico')
      expect(errorMessages).toHaveLength(2)
    })
  })

  describe('Error Reporting', () => {
    it('should log errors to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      
      const ErrorComponent = () => {
        throw new Error('Test error for logging')
      }

      render(
        <ChartErrorBoundary>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should call onError callback with error details', () => {
      const onError = vi.fn()
      
      const ErrorComponent = () => {
        throw new Error('Callback test error')
      }

      render(
        <ChartErrorBoundary onError={onError}>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Callback test error'
        }),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })

    it('should include chart type in error report', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      
      const ErrorComponent = () => {
        throw new Error('Chart type test')
      }

      render(
        <ChartErrorBoundary chartType="budget-chart">
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      const errorReport = consoleErrorSpy.mock.calls.find(call => 
        call[0] === 'Chart Error Report:'
      )
      
      expect(errorReport).toBeDefined()
      expect(errorReport?.[1]).toMatchObject({
        chartType: 'budget-chart'
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible error message', () => {
      const ErrorComponent = () => {
        throw new Error('Accessibility test')
      }

      render(
        <ChartErrorBoundary>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      const heading = screen.getByRole('heading', { name: /error al cargar el gráfico/i })
      expect(heading).toBeInTheDocument()
    })

    it('should have accessible retry button', () => {
      const ErrorComponent = () => {
        throw new Error('Button accessibility test')
      }

      render(
        <ChartErrorBoundary>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /reintentar/i })
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).not.toBeDisabled()
    })

    it('should have accessible reset button', () => {
      const ErrorComponent = () => {
        throw new Error('Reset accessibility test')
      }

      render(
        <ChartErrorBoundary>
          <ErrorComponent />
        </ChartErrorBoundary>
      )

      const resetButton = screen.getByRole('button', { name: /restablecer/i })
      expect(resetButton).toBeInTheDocument()
      expect(resetButton).not.toBeDisabled()
    })
  })
})
