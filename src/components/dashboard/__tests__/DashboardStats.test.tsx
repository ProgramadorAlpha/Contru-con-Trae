import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardStats, StatsCard, StatCardData } from '../DashboardStats'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Calendar, TrendingUp, Users, AlertCircle } from 'lucide-react'

// Wrapper with ThemeProvider
const renderWithTheme = (ui: React.ReactElement, { isDark = false } = {}) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  return render(
    <ThemeProvider defaultTheme={isDark ? 'dark' : 'light'}>
      {ui}
    </ThemeProvider>
  )
}

describe('StatsCard', () => {
  const mockStatData: StatCardData = {
    title: 'Proyectos Activos',
    value: 12,
    icon: Calendar,
    trend: 15,
    color: 'blue',
    format: 'number'
  }

  beforeEach(() => {
    document.documentElement.classList.remove('dark')
  })

  describe('Rendering', () => {
    it('should render stat card with title and value', () => {
      renderWithTheme(<StatsCard {...mockStatData} />)
      
      expect(screen.getByText('Proyectos Activos')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
    })

    it('should render icon', () => {
      const { container } = renderWithTheme(<StatsCard {...mockStatData} />)
      
      // Check for icon container
      const iconContainer = container.querySelector('.rounded-lg.p-3')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should render trend indicator when trend is provided', () => {
      renderWithTheme(<StatsCard {...mockStatData} trend={15} />)
      
      expect(screen.getByText(/15% vs mes anterior/i)).toBeInTheDocument()
      expect(screen.getByText('↗')).toBeInTheDocument()
    })

    it('should not render trend when trend is undefined', () => {
      renderWithTheme(<StatsCard {...mockStatData} trend={undefined} />)
      
      expect(screen.queryByText(/vs mes anterior/i)).not.toBeInTheDocument()
    })
  })

  describe('Value Formatting', () => {
    it('should format number values with locale string', () => {
      renderWithTheme(
        <StatsCard {...mockStatData} value={1234567} format="number" />
      )
      
      expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })

    it('should format currency values', () => {
      renderWithTheme(
        <StatsCard {...mockStatData} value={580000} format="currency" />
      )
      
      // Check for currency formatted value (uses € symbol)
      expect(screen.getByText(/580\.000 €/)).toBeInTheDocument()
    })

    it('should format percentage values', () => {
      renderWithTheme(
        <StatsCard {...mockStatData} value={75.5} format="percentage" />
      )
      
      expect(screen.getByText('75.5%')).toBeInTheDocument()
    })

    it('should default to number format when format is not specified', () => {
      renderWithTheme(
        <StatsCard {...mockStatData} value={42} />
      )
      
      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })

  describe('Trend Indicators', () => {
    it('should show up arrow for positive trend', () => {
      renderWithTheme(<StatsCard {...mockStatData} trend={15} />)
      
      expect(screen.getByText('↗')).toBeInTheDocument()
      // Check for trend text parts
      expect(screen.getByText(/15/)).toBeInTheDocument()
      expect(screen.getByText(/% vs mes anterior/i)).toBeInTheDocument()
    })

    it('should show down arrow for negative trend', () => {
      renderWithTheme(<StatsCard {...mockStatData} trend={-8} />)
      
      expect(screen.getByText('↘')).toBeInTheDocument()
      // Check for trend text parts
      expect(screen.getByText(/8/)).toBeInTheDocument()
      expect(screen.getByText(/% vs mes anterior/i)).toBeInTheDocument()
    })

    it('should show up arrow for zero trend', () => {
      renderWithTheme(<StatsCard {...mockStatData} trend={0} />)
      
      expect(screen.getByText('↗')).toBeInTheDocument()
    })
  })

  describe('Color Variants', () => {
    it('should apply blue color classes', () => {
      const { container } = renderWithTheme(
        <StatsCard {...mockStatData} color="blue" />
      )
      
      const iconContainer = container.querySelector('.bg-blue-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should apply green color classes', () => {
      const { container } = renderWithTheme(
        <StatsCard {...mockStatData} color="green" />
      )
      
      const iconContainer = container.querySelector('.bg-green-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should apply purple color classes', () => {
      const { container } = renderWithTheme(
        <StatsCard {...mockStatData} color="purple" />
      )
      
      const iconContainer = container.querySelector('.bg-purple-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should apply orange color classes', () => {
      const { container } = renderWithTheme(
        <StatsCard {...mockStatData} color="orange" />
      )
      
      const iconContainer = container.querySelector('.bg-orange-100')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Theme Support', () => {
    it('should apply light theme classes', () => {
      const { container } = renderWithTheme(<StatsCard {...mockStatData} />)
      
      const card = container.querySelector('.bg-white')
      expect(card).toBeInTheDocument()
    })

    it('should apply dark theme classes', () => {
      const { container } = renderWithTheme(
        <StatsCard {...mockStatData} />,
        { isDark: true }
      )
      
      const card = container.querySelector('.bg-gray-800')
      expect(card).toBeInTheDocument()
    })

    it('should apply dark theme color classes for icon', () => {
      const { container } = renderWithTheme(
        <StatsCard {...mockStatData} color="blue" />,
        { isDark: true }
      )
      
      const iconContainer = container.querySelector('.bg-blue-900')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should render skeleton when loading is true', () => {
      const { container } = renderWithTheme(
        <StatsCard {...mockStatData} loading={true} />
      )
      
      // Check for skeleton loader
      const skeleton = container.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('should not render content when loading', () => {
      renderWithTheme(<StatsCard {...mockStatData} loading={true} />)
      
      expect(screen.queryByText('Proyectos Activos')).not.toBeInTheDocument()
    })
  })

  describe('Hover Effects', () => {
    it('should have hover transition classes', () => {
      const { container } = renderWithTheme(<StatsCard {...mockStatData} />)
      
      const card = container.querySelector('.hover\\:shadow-md')
      expect(card).toBeInTheDocument()
    })
  })
})

describe('DashboardStats', () => {
  const mockStats: StatCardData[] = [
    {
      title: 'Proyectos Activos',
      value: 12,
      icon: Calendar,
      trend: 15,
      color: 'blue',
      format: 'number'
    },
    {
      title: 'Presupuesto Total',
      value: 580000,
      icon: TrendingUp,
      trend: 8,
      color: 'green',
      format: 'currency'
    },
    {
      title: 'Miembros del Equipo',
      value: 8,
      icon: Users,
      trend: 5,
      color: 'purple',
      format: 'number'
    },
    {
      title: 'Tareas Pendientes',
      value: 24,
      icon: AlertCircle,
      trend: -3,
      color: 'orange',
      format: 'number'
    }
  ]

  beforeEach(() => {
    document.documentElement.classList.remove('dark')
  })

  describe('Rendering', () => {
    it('should render all stat cards', () => {
      renderWithTheme(<DashboardStats stats={mockStats} />)
      
      expect(screen.getByText('Proyectos Activos')).toBeInTheDocument()
      expect(screen.getByText('Presupuesto Total')).toBeInTheDocument()
      expect(screen.getByText('Miembros del Equipo')).toBeInTheDocument()
      expect(screen.getByText('Tareas Pendientes')).toBeInTheDocument()
    })

    it('should render correct number of cards', () => {
      renderWithTheme(<DashboardStats stats={mockStats} />)
      
      const cards = screen.getAllByText(/vs mes anterior/i)
      expect(cards).toHaveLength(4)
    })

    it('should render empty when stats array is empty', () => {
      const { container } = renderWithTheme(<DashboardStats stats={[]} />)
      
      const grid = container.querySelector('.grid')
      expect(grid?.children).toHaveLength(0)
    })
  })

  describe('Loading State', () => {
    it('should render skeleton loaders when loading', () => {
      const { container } = renderWithTheme(
        <DashboardStats stats={mockStats} loading={true} />
      )
      
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render 4 skeleton loaders by default', () => {
      const { container } = renderWithTheme(
        <DashboardStats stats={[]} loading={true} />
      )
      
      // Each skeleton has multiple animated elements, so check for skeleton cards
      const skeletonCards = container.querySelectorAll('.rounded-lg.shadow-sm.border.p-6')
      expect(skeletonCards.length).toBeGreaterThanOrEqual(4)
    })

    it('should not render actual stats when loading', () => {
      renderWithTheme(<DashboardStats stats={mockStats} loading={true} />)
      
      expect(screen.queryByText('Proyectos Activos')).not.toBeInTheDocument()
    })
  })

  describe('Visibility Control', () => {
    it('should render when isVisible is true', () => {
      renderWithTheme(<DashboardStats stats={mockStats} isVisible={true} />)
      
      expect(screen.getByText('Proyectos Activos')).toBeInTheDocument()
    })

    it('should not render when isVisible is false', () => {
      renderWithTheme(<DashboardStats stats={mockStats} isVisible={false} />)
      
      expect(screen.queryByText('Proyectos Activos')).not.toBeInTheDocument()
    })

    it('should render by default when isVisible is not specified', () => {
      renderWithTheme(<DashboardStats stats={mockStats} />)
      
      expect(screen.getByText('Proyectos Activos')).toBeInTheDocument()
    })
  })

  describe('Responsive Grid', () => {
    it('should have responsive grid classes', () => {
      const { container } = renderWithTheme(<DashboardStats stats={mockStats} />)
      
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })

    it('should have proper gap spacing', () => {
      const { container } = renderWithTheme(<DashboardStats stats={mockStats} />)
      
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('gap-6')
    })
  })

  describe('Theme Support', () => {
    it('should pass theme to all stat cards', () => {
      const { container } = renderWithTheme(
        <DashboardStats stats={mockStats} />,
        { isDark: true }
      )
      
      const darkCards = container.querySelectorAll('.bg-gray-800')
      expect(darkCards.length).toBeGreaterThan(0)
    })
  })

  describe('Data Integrity', () => {
    it('should render all stat values correctly', () => {
      renderWithTheme(<DashboardStats stats={mockStats} />)
      
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText(/580\.000 €/)).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('24')).toBeInTheDocument()
    })

    it('should render all trend values correctly', () => {
      renderWithTheme(<DashboardStats stats={mockStats} />)
      
      // Use getAllByText for repeated patterns
      const trendTexts = screen.getAllByText(/% vs mes anterior/i)
      expect(trendTexts).toHaveLength(4)
      
      // Verify trend arrows are present
      const upArrows = screen.getAllByText('↗')
      const downArrows = screen.getAllByText('↘')
      expect(upArrows.length + downArrows.length).toBe(4)
    })
  })
})
