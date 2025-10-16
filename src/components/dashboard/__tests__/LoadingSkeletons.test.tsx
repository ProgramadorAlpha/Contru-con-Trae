import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Skeleton,
  ChartSkeleton,
  StatsCardSkeleton,
  ListItemSkeleton,
  DashboardSkeleton,
  LoadingSpinner,
  ProgressBar,
  ButtonLoading,
  NotificationSkeleton,
  SettingsModalSkeleton
} from '../LoadingSkeletons'

describe('LoadingSkeletons', () => {
  describe('Skeleton', () => {
    it('should render base skeleton component', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement
      
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should apply custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />)
      const skeleton = container.firstChild as HTMLElement
      
      expect(skeleton).toHaveClass('custom-class')
    })

    it('should have shimmer animation classes', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement
      
      expect(skeleton).toHaveClass('animate-pulse')
      expect(skeleton.className).toContain('bg-gradient-to-r')
    })
  })

  describe('ChartSkeleton', () => {
    it('should render chart skeleton with default height', () => {
      const { container } = render(<ChartSkeleton />)
      
      expect(container.querySelector('.bg-white')).toBeInTheDocument()
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument()
    })

    it('should render with custom height', () => {
      const { container } = render(<ChartSkeleton height={400} />)
      const chartArea = container.querySelector('[style*="height"]') as HTMLElement
      
      expect(chartArea).toBeInTheDocument()
      expect(chartArea.style.height).toBe('400px')
    })

    it('should render with title', () => {
      render(<ChartSkeleton title="Test Chart" />)
      
      // Title skeleton should be present
      const skeletons = screen.getAllByRole('generic')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render chart elements (bars)', () => {
      const { container } = render(<ChartSkeleton />)
      
      // Should have 8 bar elements
      const bars = container.querySelectorAll('.flex-1')
      expect(bars.length).toBe(8)
    })

    it('should render Y-axis labels', () => {
      const { container } = render(<ChartSkeleton />)
      
      // Should have 5 Y-axis labels
      const yAxisLabels = container.querySelectorAll('.absolute.left-0 .h-3.w-12')
      expect(yAxisLabels.length).toBe(5)
    })

    it('should render legend', () => {
      const { container } = render(<ChartSkeleton />)
      
      // Should have legend items
      const legendItems = container.querySelectorAll('.flex.items-center.space-x-2')
      expect(legendItems.length).toBeGreaterThan(0)
    })

    it('should apply custom className', () => {
      const { container } = render(<ChartSkeleton className="custom-chart" />)
      
      expect(container.querySelector('.custom-chart')).toBeInTheDocument()
    })
  })

  describe('StatsCardSkeleton', () => {
    it('should render stats card skeleton', () => {
      const { container } = render(<StatsCardSkeleton />)
      
      expect(container.querySelector('.bg-white')).toBeInTheDocument()
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument()
    })

    it('should render all skeleton elements', () => {
      const { container } = render(<StatsCardSkeleton />)
      
      // Should have multiple skeleton elements for title, value, trend, and icon
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(3)
    })

    it('should apply custom className', () => {
      const { container } = render(<StatsCardSkeleton className="custom-stats" />)
      
      expect(container.querySelector('.custom-stats')).toBeInTheDocument()
    })
  })

  describe('ListItemSkeleton', () => {
    it('should render list item skeleton', () => {
      const { container } = render(<ListItemSkeleton />)
      
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render without progress by default', () => {
      const { container } = render(<ListItemSkeleton />)
      
      // Should have basic skeletons but not progress-specific ones
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(2) // Title and subtitle
    })

    it('should render with progress when showProgress is true', () => {
      const { container } = render(<ListItemSkeleton showProgress={true} />)
      
      // Should have additional skeletons for progress
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(2)
    })
  })

  describe('DashboardSkeleton', () => {
    it('should render complete dashboard skeleton', () => {
      const { container } = render(<DashboardSkeleton />)
      
      expect(container.querySelector('.space-y-6')).toBeInTheDocument()
    })

    it('should render header skeleton', () => {
      const { container } = render(<DashboardSkeleton />)
      
      // Header should have title and subtitle skeletons
      const headerSkeletons = container.querySelectorAll('.space-y-2 .animate-pulse')
      expect(headerSkeletons.length).toBeGreaterThan(0)
    })

    it('should render filters skeleton', () => {
      const { container } = render(<DashboardSkeleton />)
      
      // Should have filter section
      const filterSection = container.querySelector('.bg-white.rounded-lg')
      expect(filterSection).toBeInTheDocument()
    })

    it('should render 4 stats card skeletons', () => {
      const { container } = render(<DashboardSkeleton />)
      
      // Should have grid with 4 stats cards
      const statsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')
      expect(statsGrid).toBeInTheDocument()
      expect(statsGrid?.children.length).toBe(4)
    })

    it('should render chart skeletons', () => {
      const { container } = render(<DashboardSkeleton />)
      
      // Should have charts grid
      const chartsGrid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2')
      expect(chartsGrid).toBeInTheDocument()
    })

    it('should render additional widgets', () => {
      const { container } = render(<DashboardSkeleton />)
      
      // Should have multiple widget sections
      const widgets = container.querySelectorAll('.bg-white.rounded-lg.shadow-sm')
      expect(widgets.length).toBeGreaterThan(4)
    })
  })

  describe('LoadingSpinner', () => {
    it('should render spinner with default size', () => {
      const { container } = render(<LoadingSpinner />)
      const spinner = container.firstChild as HTMLElement
      
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
      expect(spinner).toHaveClass('w-6', 'h-6')
    })

    it('should render small spinner', () => {
      const { container } = render(<LoadingSpinner size="sm" />)
      const spinner = container.firstChild as HTMLElement
      
      expect(spinner).toHaveClass('w-4', 'h-4')
    })

    it('should render large spinner', () => {
      const { container } = render(<LoadingSpinner size="lg" />)
      const spinner = container.firstChild as HTMLElement
      
      expect(spinner).toHaveClass('w-8', 'h-8')
    })

    it('should apply custom className', () => {
      const { container } = render(<LoadingSpinner className="custom-spinner" />)
      const spinner = container.firstChild as HTMLElement
      
      expect(spinner).toHaveClass('custom-spinner')
    })

    it('should have spinning animation', () => {
      const { container } = render(<LoadingSpinner />)
      const spinner = container.firstChild as HTMLElement
      
      expect(spinner).toHaveClass('animate-spin')
      expect(spinner).toHaveClass('rounded-full')
    })
  })

  describe('ProgressBar', () => {
    it('should render progress bar with correct width', () => {
      const { container } = render(<ProgressBar progress={50} />)
      const progressFill = container.querySelector('.bg-blue-600') as HTMLElement
      
      expect(progressFill).toBeInTheDocument()
      expect(progressFill.style.width).toBe('50%')
    })

    it('should clamp progress to 0-100 range', () => {
      const { container: container1 } = render(<ProgressBar progress={-10} />)
      const progressFill1 = container1.querySelector('.bg-blue-600') as HTMLElement
      expect(progressFill1.style.width).toBe('0%')

      const { container: container2 } = render(<ProgressBar progress={150} />)
      const progressFill2 = container2.querySelector('.bg-blue-600') as HTMLElement
      expect(progressFill2.style.width).toBe('100%')
    })

    it('should show percentage by default', () => {
      render(<ProgressBar progress={75} />)
      
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should hide percentage when showPercentage is false', () => {
      render(<ProgressBar progress={75} showPercentage={false} />)
      
      expect(screen.queryByText('75%')).not.toBeInTheDocument()
    })

    it('should display label when provided', () => {
      render(<ProgressBar progress={50} label="Loading data..." />)
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<ProgressBar progress={50} className="custom-progress" />)
      
      expect(container.querySelector('.custom-progress')).toBeInTheDocument()
    })

    it('should have smooth transition', () => {
      const { container } = render(<ProgressBar progress={50} />)
      const progressFill = container.querySelector('.bg-blue-600') as HTMLElement
      
      expect(progressFill.className).toContain('transition-all')
      expect(progressFill.className).toContain('duration-300')
    })
  })

  describe('ButtonLoading', () => {
    it('should render button with children when not loading', () => {
      render(<ButtonLoading loading={false}>Click me</ButtonLoading>)
      
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should show loading state when loading is true', () => {
      render(<ButtonLoading loading={true}>Click me</ButtonLoading>)
      
      expect(screen.getByText('Cargando...')).toBeInTheDocument()
      expect(screen.queryByText('Click me')).not.toBeInTheDocument()
    })

    it('should show custom loading text', () => {
      render(<ButtonLoading loading={true} loadingText="Processing...">Click me</ButtonLoading>)
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('should disable button when loading', () => {
      render(<ButtonLoading loading={true}>Click me</ButtonLoading>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should respect disabled prop', () => {
      render(<ButtonLoading loading={false} disabled={true}>Click me</ButtonLoading>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should render spinner when loading', () => {
      const { container } = render(<ButtonLoading loading={true}>Click me</ButtonLoading>)
      
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('NotificationSkeleton', () => {
    it('should render notification skeleton', () => {
      const { container } = render(<NotificationSkeleton />)
      
      expect(container.querySelector('.p-4')).toBeInTheDocument()
      expect(container.querySelector('.border-b')).toBeInTheDocument()
    })

    it('should render avatar skeleton', () => {
      const { container } = render(<NotificationSkeleton />)
      
      const avatar = container.querySelector('.w-8.h-8.rounded-full')
      expect(avatar).toBeInTheDocument()
    })

    it('should render content skeletons', () => {
      const { container } = render(<NotificationSkeleton />)
      
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(3)
    })
  })

  describe('SettingsModalSkeleton', () => {
    it('should render settings modal skeleton', () => {
      const { container } = render(<SettingsModalSkeleton />)
      
      expect(container.querySelector('.bg-white.rounded-lg')).toBeInTheDocument()
    })

    it('should render header section', () => {
      const { container } = render(<SettingsModalSkeleton />)
      
      const header = container.querySelector('.p-6.border-b')
      expect(header).toBeInTheDocument()
    })

    it('should render tabs section', () => {
      const { container } = render(<SettingsModalSkeleton />)
      
      const tabs = container.querySelector('.border-b.border-gray-200')
      expect(tabs).toBeInTheDocument()
    })

    it('should render 3 tab skeletons', () => {
      const { container } = render(<SettingsModalSkeleton />)
      
      const tabItems = container.querySelectorAll('.py-4')
      expect(tabItems.length).toBe(3)
    })

    it('should render content section', () => {
      const { container } = render(<SettingsModalSkeleton />)
      
      const content = container.querySelector('.p-6.space-y-6')
      expect(content).toBeInTheDocument()
    })

    it('should render footer section', () => {
      const { container } = render(<SettingsModalSkeleton />)
      
      const footer = container.querySelector('.border-t.border-gray-200')
      expect(footer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not interfere with screen readers', () => {
      const { container } = render(<DashboardSkeleton />)
      
      // Skeletons should be presentational and not have interactive elements
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBe(0)
    })

    it('should have appropriate ARIA attributes for loading states', () => {
      render(<ButtonLoading loading={true}>Submit</ButtonLoading>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Performance', () => {
    it('should render large dashboard skeleton without errors', () => {
      const { container } = render(<DashboardSkeleton />)
      
      // Should render without throwing errors
      expect(container).toBeInTheDocument()
      
      // Should have reasonable number of elements
      const allElements = container.querySelectorAll('*')
      expect(allElements.length).toBeLessThan(500) // Reasonable limit
    })

    it('should render multiple skeletons efficiently', () => {
      const { container } = render(
        <div>
          {Array.from({ length: 10 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      )
      
      expect(container.querySelectorAll('.bg-white').length).toBe(10)
    })
  })
})
