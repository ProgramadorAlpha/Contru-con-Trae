import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  chartType?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

export class ChartErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error for debugging
    console.error('Chart Error Boundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report error to monitoring service (in a real app)
    this.reportError(error, errorInfo)
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error monitoring service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      chartType: this.props.chartType,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // For now, just log to console
    console.error('Chart Error Report:', errorReport)
    
    // In production, you would do something like:
    // errorMonitoringService.captureException(error, { extra: errorReport })
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))

      // Add a small delay before retry to prevent immediate re-error
      this.retryTimeout = setTimeout(() => {
        // Force a re-render by updating state
        this.forceUpdate()
      }, 1000)
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg min-h-[300px]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Error al cargar el gráfico
            </h3>
            <p className="text-red-700 mb-4 max-w-md">
              {this.state.error?.message || 'Ha ocurrido un error inesperado al renderizar el gráfico.'}
            </p>
            
            {/* Error details for development */}
            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                  Ver detalles del error
                </summary>
                <pre className="mt-2 p-3 bg-red-100 rounded text-xs text-red-800 overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className={cn(
                    'flex items-center px-4 py-2 rounded-md transition-colors',
                    'bg-red-600 text-white hover:bg-red-700',
                    'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                  )}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar ({this.maxRetries - this.state.retryCount} intentos restantes)
                </button>
              )}
              
              <button
                onClick={this.handleReset}
                className={cn(
                  'flex items-center px-4 py-2 rounded-md transition-colors',
                  'bg-gray-600 text-white hover:bg-gray-700',
                  'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                )}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Restablecer
              </button>
            </div>

            {this.state.retryCount >= this.maxRetries && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Se han agotado los intentos de reintento. Por favor, recarga la página o contacta al soporte técnico.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export const useChartErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    console.error('Chart error:', error)
  }, [])

  return {
    error,
    resetError,
    handleError,
    hasError: error !== null
  }
}

// Higher-order component for wrapping charts with error boundary
export const withChartErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  chartType?: string
) => {
  const WithErrorBoundary = (props: P) => (
    <ChartErrorBoundary chartType={chartType}>
      <WrappedComponent {...props} />
    </ChartErrorBoundary>
  )

  WithErrorBoundary.displayName = `withChartErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return WithErrorBoundary
}