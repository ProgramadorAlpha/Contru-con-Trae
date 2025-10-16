import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChartErrorBoundary, withChartErrorBoundary } from '../ChartErrorBoundary'
import React from 'react'

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Success</div>
}

// Component for testing retry functionality
const UnstableComponent = ({ failCount = 1 }: { failCount?: number }) => {
  const [attempts, setAttempts] = React.useState(0)
  
  React.useEffect(() => {
    setAttempts(prev => prev + 1)
  }, [])
  
  if (attempts < failCount) {
    throw new Error(`Attempt ${attempts} failed`)
  }
  
  return <div>Success after {attempts} attempts</div>
}

describe('ChartErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Error Catching', () => {
    it('should render children when no error occurs', () => {
      render(
        <ChartErrorBoundary>
          <div>Test content</div>
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should catch rendering errors and display error UI', () => {
      render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()
      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should display error icon when error occurs', () => {
      const { container } = render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      // Check for SVG icon (AlertTriangle)
      const errorIcon = container.querySelector('svg')
      expect(errorIcon).toBeInTheDocument()
      expect(errorIcon).toHaveClass('lucide-triangle-alert')
    })

    it('should call onError callback when error is caught', () => {
      const onError = vi.fn()
      
      render(
        <ChartErrorBoundary onError={onError}>
          <ThrowError />
        </ChartErrorBoundary>
      )

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })
  })

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>
      
      render(
        <ChartErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('Error al cargar el gráfico')).not.toBeInTheDocument()
    })
  })

  describe('Retry Functionality', () => {
    it('should display retry button when error occurs', () => {
      render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /reintentar/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should show remaining retry attempts', () => {
      render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      expect(screen.getByText(/3 intentos restantes/i)).toBeInTheDocument()
    })

    it('should reset error state when retry button is clicked', async () => {
      const { rerender } = render(
        <ChartErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()

      const retryButton = screen.getByRole('button', { name: /reintentar/i })
      fireEvent.click(retryButton)

      // Wait for retry timeout
      await waitFor(() => {
        rerender(
          <ChartErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ChartErrorBoundary>
        )
      }, { timeout: 2000 })
    })

    it('should decrement retry count on each retry', async () => {
      render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      expect(screen.getByText(/3 intentos restantes/i)).toBeInTheDocument()

      const retryButton = screen.getByRole('button', { name: /reintentar/i })
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText(/2 intentos restantes/i)).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should hide retry button after max retries', async () => {
      render(
        <ChartErrorBoundary>
          <ThrowError />
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

    it('should show max retries message after exhausting attempts', async () => {
      render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      // Exhaust all retries
      for (let i = 0; i < 3; i++) {
        const retryButton = screen.queryByRole('button', { name: /reintentar/i })
        if (retryButton) {
          fireEvent.click(retryButton)
          await new Promise(resolve => setTimeout(resolve, 1100))
        }
      }

      // Check for max retries message
      await waitFor(() => {
        expect(screen.getByText(/se han agotado los intentos/i)).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('Reset Functionality', () => {
    it('should display reset button when error occurs', () => {
      render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      const resetButton = screen.getByRole('button', { name: /restablecer/i })
      expect(resetButton).toBeInTheDocument()
    })

    it('should reset error state and retry count when reset is clicked', async () => {
      const { rerender } = render(
        <ChartErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ChartErrorBoundary>
      )

      // Click retry a few times to increase retry count
      const retryButton = screen.getByRole('button', { name: /reintentar/i })
      fireEvent.click(retryButton)
      await waitFor(() => {}, { timeout: 1100 })

      const resetButton = screen.getByRole('button', { name: /restablecer/i })
      fireEvent.click(resetButton)

      await waitFor(() => {
        rerender(
          <ChartErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ChartErrorBoundary>
        )
      })
    })
  })

  describe('Chart Type', () => {
    it('should include chart type in error report', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error')
      
      render(
        <ChartErrorBoundary chartType="bar-chart">
          <ThrowError />
        </ChartErrorBoundary>
      )

      expect(consoleErrorSpy).toHaveBeenCalled()
      const errorReport = consoleErrorSpy.mock.calls.find(call => 
        call[0] === 'Chart Error Report:'
      )
      expect(errorReport).toBeDefined()
      expect(errorReport?.[1]).toMatchObject({
        chartType: 'bar-chart'
      })
    })
  })

  describe('Development Mode', () => {
    it('should show error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Ver detalles del error')).toBeInTheDocument()

      process.env.NODE_ENV = originalEnv
    })

    it('should hide error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      expect(screen.queryByText('Ver detalles del error')).not.toBeInTheDocument()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('withChartErrorBoundary HOC', () => {
    it('should wrap component with error boundary', () => {
      const TestComponent = () => <div>Test Component</div>
      const WrappedComponent = withChartErrorBoundary(TestComponent, 'test-chart')

      render(<WrappedComponent />)

      expect(screen.getByText('Test Component')).toBeInTheDocument()
    })

    it('should catch errors in wrapped component', () => {
      const WrappedComponent = withChartErrorBoundary(ThrowError, 'test-chart')

      render(<WrappedComponent />)

      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument()
    })

    it('should set display name for wrapped component', () => {
      const TestComponent = () => <div>Test</div>
      TestComponent.displayName = 'TestComponent'
      
      const WrappedComponent = withChartErrorBoundary(TestComponent)

      expect(WrappedComponent.displayName).toBe('withChartErrorBoundary(TestComponent)')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible error message', () => {
      render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      const heading = screen.getByRole('heading', { name: /error al cargar el gráfico/i })
      expect(heading).toBeInTheDocument()
    })

    it('should have accessible buttons', () => {
      render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /reintentar/i })
      const resetButton = screen.getByRole('button', { name: /restablecer/i })

      expect(retryButton).toBeInTheDocument()
      expect(resetButton).toBeInTheDocument()
    })
  })

  describe('Cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { unmount } = render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /reintentar/i })
      fireEvent.click(retryButton)

      unmount()

      // If timeout wasn't cleared, this would cause issues
      // No assertion needed - just ensuring no errors occur
    })
  })
})
