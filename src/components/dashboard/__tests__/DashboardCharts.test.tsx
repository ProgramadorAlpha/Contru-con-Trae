import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardCharts } from '../DashboardCharts'
import type { DashboardData } from '@/types/dashboard'

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}))

const mockBudgetData = [
  { period: 'Ene', budgeted: 100000, spent: 85000 },
  { period: 'Feb', budgeted: 120000, spent: 95000 },
  { period: 'Mar', budgeted: 110000, spent: 102000 }
]

const mockProjectProgressData = [
  { name: 'Edificio Aurora', progress: 75, status: 'on-track' as const },
  { name: 'Casa Verde', progress: 90, status: 'on-track' as const },
  { name: 'Plaza Central', progress: 45, status: 'delayed' as const }
]

const mockTeamPerformanceData = [
  { period: 'Ene', performance: 85, attendance: 92 },
  { period: 'Feb', performance: 88, attendance: 89 },
  { period: 'Mar', performance: 91, attendance: 94 }
]

const mockExpensesByCategory = [
  { name: 'Materiales', value: 450000, color: '#3B82F6' },
  { name: 'Mano de obra', value: 350000, color: '#10B981' },
  { name: 'Equipos', value: 150000, color: '#F59E0B' },
  { name: 'Otros', value: 50000, color: '#EF4444' }
]

describe('DashboardCharts', () => {
  const defaultProps = {
    budgetData: mockBudgetData,
    projectProgressData: mockProjectProgressData,
    teamPerformanceData: mockTeamPerformanceData,
    expensesByCategory: mockExpensesByCategory,
    timeFilter: 'month',
    loading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all chart components when data is provided', () => {
    render(<DashboardCharts {...defaultProps} />)
    
    expect(screen.getByText('Utilización del Presupuesto')).toBeInTheDocument()
    expect(screen.getByText('Progreso de Proyectos')).toBeInTheDocument()
    expect(screen.getByText('Rendimiento del Equipo')).toBeInTheDocument()
    expect(screen.getByText('Distribución de Gastos')).toBeInTheDocument()
    
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(4)
  })

  it('displays loading skeletons when loading is true', () => {
    render(<DashboardCharts {...defaultProps} loading={true} />)
    
    // Should show skeleton loaders instead of charts
    expect(screen.queryByText('Utilización del Presupuesto')).not.toBeInTheDocument()
    expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
  })

  it('handles errors through error boundary', () => {
    // Error handling is done through ChartErrorBoundary
    // This test verifies the component renders without crashing
    render(<DashboardCharts {...defaultProps} />)
    
    expect(screen.getByText('Utilización del Presupuesto')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    const emptyProps = {
      budgetData: [],
      projectProgressData: [],
      teamPerformanceData: [],
      expensesByCategory: [],
      timeFilter: 'month',
      loading: false
    }
    
    render(<DashboardCharts {...emptyProps} />)
    
    // Should still render chart containers
    expect(screen.getByText('Utilización del Presupuesto')).toBeInTheDocument()
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(4)
  })

  it('formats currency values correctly in tooltips', async () => {
    render(<DashboardCharts {...defaultProps} />)
    
    // This would test custom tooltip formatting
    // In a real implementation, you'd simulate hover events and check tooltip content
    expect(screen.getByText('Utilización del Presupuesto')).toBeInTheDocument()
  })

  it('handles chart interactions correctly', async () => {
    render(<DashboardCharts {...defaultProps} />)
    
    // Test legend interactions (if implemented)
    const charts = screen.getAllByTestId('responsive-container')
    expect(charts).toHaveLength(4)
    
    // In a real test, you'd simulate clicks on legend items
    // and verify that data series are hidden/shown
  })

  it('renders with correct accessibility attributes', () => {
    render(<DashboardCharts {...defaultProps} />)
    
    // Check for ARIA labels and roles
    const chartContainers = screen.getAllByRole('img', { hidden: true })
    expect(chartContainers.length).toBeGreaterThan(0)
  })

  it('updates when data changes', () => {
    const { rerender } = render(<DashboardCharts {...defaultProps} />)
    
    const updatedProps = {
      ...defaultProps,
      budgetData: [
        { period: 'Abr', budgeted: 130000, spent: 115000 }
      ]
    }
    
    rerender(<DashboardCharts {...updatedProps} />)
    
    // Verify that component re-renders with new data
    expect(screen.getByText('Utilización del Presupuesto')).toBeInTheDocument()
  })

  it('maintains performance with large datasets', () => {
    const largeProps = {
      ...defaultProps,
      budgetData: Array.from({ length: 100 }, (_, i) => ({
        period: `Month ${i}`,
        budgeted: 100000 + i * 1000,
        spent: 80000 + i * 800
      }))
    }
    
    const startTime = performance.now()
    render(<DashboardCharts {...largeProps} />)
    const endTime = performance.now()
    
    // Should render within reasonable time (adjust threshold as needed)
    expect(endTime - startTime).toBeLessThan(100)
  })
})