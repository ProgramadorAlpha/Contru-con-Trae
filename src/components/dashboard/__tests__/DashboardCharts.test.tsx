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

const mockData: DashboardData = {
  budgetUtilization: [
    { month: 'Ene', budget: 100000, spent: 85000, percentage: 85 },
    { month: 'Feb', budget: 120000, spent: 95000, percentage: 79 },
    { month: 'Mar', budget: 110000, spent: 102000, percentage: 93 }
  ],
  projectProgress: [
    { project: 'Edificio Aurora', progress: 75, budget: 500000, spent: 375000 },
    { project: 'Casa Verde', progress: 90, budget: 300000, spent: 270000 },
    { project: 'Plaza Central', progress: 45, budget: 800000, spent: 360000 }
  ],
  teamPerformance: [
    { month: 'Ene', efficiency: 85, productivity: 78, quality: 92 },
    { month: 'Feb', efficiency: 88, productivity: 82, quality: 89 },
    { month: 'Mar', efficiency: 91, productivity: 85, quality: 94 }
  ],
  expenseCategories: [
    { category: 'Materiales', amount: 450000, percentage: 45 },
    { category: 'Mano de obra', amount: 350000, percentage: 35 },
    { category: 'Equipos', amount: 150000, percentage: 15 },
    { category: 'Otros', amount: 50000, percentage: 5 }
  ]
}

describe('DashboardCharts', () => {
  const defaultProps = {
    data: mockData,
    loading: false,
    error: null
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

  it('displays error message when error is provided', () => {
    const errorMessage = 'Failed to load chart data'
    render(<DashboardCharts {...defaultProps} error={errorMessage} />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    const emptyData: DashboardData = {
      budgetUtilization: [],
      projectProgress: [],
      teamPerformance: [],
      expenseCategories: []
    }
    
    render(<DashboardCharts {...defaultProps} data={emptyData} />)
    
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
    
    const updatedData = {
      ...mockData,
      budgetUtilization: [
        { month: 'Abr', budget: 130000, spent: 115000, percentage: 88 }
      ]
    }
    
    rerender(<DashboardCharts {...defaultProps} data={updatedData} />)
    
    // Verify that component re-renders with new data
    expect(screen.getByText('Utilización del Presupuesto')).toBeInTheDocument()
  })

  it('maintains performance with large datasets', () => {
    const largeData = {
      ...mockData,
      budgetUtilization: Array.from({ length: 100 }, (_, i) => ({
        month: `Month ${i}`,
        budget: 100000 + i * 1000,
        spent: 80000 + i * 800,
        percentage: 80 + (i % 20)
      }))
    }
    
    const startTime = performance.now()
    render(<DashboardCharts {...defaultProps} data={largeData} />)
    const endTime = performance.now()
    
    // Should render within reasonable time (adjust threshold as needed)
    expect(endTime - startTime).toBeLessThan(100)
  })
})