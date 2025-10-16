import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardFilters } from '../DashboardFilters'
import type { TimeFilter, DateRange } from '@/types/dashboard'

describe('DashboardFilters', () => {
  const mockOnTimeFilterChange = vi.fn()
  const mockOnDateRangeChange = vi.fn()
  const mockOnExport = vi.fn()
  const mockOnToggleNotifications = vi.fn()
  const mockOnOpenSettings = vi.fn()

  const defaultDateRange: DateRange = {
    start: '2024-01-01',
    end: '2024-01-31'
  }

  const defaultProps = {
    timeFilter: 'month' as TimeFilter,
    onTimeFilterChange: mockOnTimeFilterChange,
    dateRange: defaultDateRange,
    onDateRangeChange: mockOnDateRangeChange,
    onExport: mockOnExport,
    onToggleNotifications: mockOnToggleNotifications,
    onOpenSettings: mockOnOpenSettings,
    notificationsEnabled: true,
    isExporting: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Filter Options', () => {
    it('renders all time filter options', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      const buttonTexts = buttons.map(b => b.textContent)
      
      expect(buttonTexts).toContain('Esta Semana')
      expect(buttonTexts).toContain('Este Mes')
      expect(buttonTexts).toContain('Este Trimestre')
      expect(buttonTexts).toContain('Este Año')
      expect(buttonTexts).toContain('Personalizado')
    })

    it('highlights the current filter', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      const monthButton = buttons.find(b => b.textContent === 'Este Mes')!
      expect(monthButton).toHaveClass('bg-blue-100', 'text-blue-700')
    })

    it('calls onTimeFilterChange when a filter is clicked', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      const weekButton = screen.getByText('Esta Semana')
      fireEvent.click(weekButton)
      
      expect(mockOnTimeFilterChange).toHaveBeenCalledWith('week')
    })

    it('allows switching between different filters', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      fireEvent.click(screen.getByText('Esta Semana'))
      expect(mockOnTimeFilterChange).toHaveBeenCalledWith('week')
      
      fireEvent.click(screen.getByText('Este Trimestre'))
      expect(mockOnTimeFilterChange).toHaveBeenCalledWith('quarter')
      
      fireEvent.click(screen.getByText('Este Año'))
      expect(mockOnTimeFilterChange).toHaveBeenCalledWith('year')
    })
  })

  describe('Custom Date Range', () => {
    it('shows custom date picker when custom filter is selected', () => {
      render(<DashboardFilters {...defaultProps} timeFilter="custom" />)
      
      const dateInputs = screen.getAllByDisplayValue(/2024-\d{2}-\d{2}/)
      expect(dateInputs.length).toBeGreaterThanOrEqual(2)
    })

    it('displays current date range values', () => {
      render(<DashboardFilters {...defaultProps} timeFilter="custom" />)
      
      const inputs = screen.getAllByDisplayValue(/2024-\d{2}-\d{2}/) as HTMLInputElement[]
      expect(inputs.length).toBeGreaterThanOrEqual(2)
      expect(inputs[0].value).toBe('2024-01-01')
      expect(inputs[1].value).toBe('2024-01-31')
    })

    it('calls onDateRangeChange when start date changes', () => {
      render(<DashboardFilters {...defaultProps} timeFilter="custom" />)
      
      const inputs = screen.getAllByDisplayValue(/2024-\d{2}-\d{2}/) as HTMLInputElement[]
      const startInput = inputs[0]
      
      fireEvent.change(startInput, { target: { value: '2024-01-15' } })
      
      expect(mockOnDateRangeChange).toHaveBeenCalledWith({
        start: '2024-01-15',
        end: '2024-01-31'
      })
    })

    it('calls onDateRangeChange when end date changes', () => {
      render(<DashboardFilters {...defaultProps} timeFilter="custom" />)
      
      const inputs = screen.getAllByDisplayValue(/2024-\d{2}-\d{2}/) as HTMLInputElement[]
      const endInput = inputs[1]
      
      fireEvent.change(endInput, { target: { value: '2024-02-15' } })
      
      expect(mockOnDateRangeChange).toHaveBeenCalledWith({
        start: '2024-01-01',
        end: '2024-02-15'
      })
    })

    it('validates that start date is before end date', () => {
      const invalidRange: DateRange = {
        start: '2024-02-01',
        end: '2024-01-01'
      }
      
      render(<DashboardFilters {...defaultProps} timeFilter="custom" dateRange={invalidRange} />)
      
      expect(screen.getAllByText('Fecha inválida').length).toBeGreaterThan(0)
    })

    it('shows valid indicator when date range is correct', () => {
      render(<DashboardFilters {...defaultProps} timeFilter="custom" />)
      
      expect(screen.getByText('✓ Rango válido')).toBeInTheDocument()
    })

    it('handles quick date preset for last 7 days', () => {
      render(<DashboardFilters {...defaultProps} timeFilter="custom" />)
      
      const quickButton = screen.getByText('Últimos 7 días')
      fireEvent.click(quickButton)
      
      expect(mockOnDateRangeChange).toHaveBeenCalled()
      const call = mockOnDateRangeChange.mock.calls[0][0]
      expect(call.start).toBeTruthy()
      expect(call.end).toBeTruthy()
    })

    it('handles quick date preset for last 30 days', () => {
      render(<DashboardFilters {...defaultProps} timeFilter="custom" />)
      
      const quickButton = screen.getByText('Últimos 30 días')
      fireEvent.click(quickButton)
      
      expect(mockOnDateRangeChange).toHaveBeenCalled()
    })

    it('handles quick date preset for last 90 days', () => {
      render(<DashboardFilters {...defaultProps} timeFilter="custom" />)
      
      const quickButton = screen.getByText('Últimos 90 días')
      fireEvent.click(quickButton)
      
      expect(mockOnDateRangeChange).toHaveBeenCalled()
    })
  })

  describe('Export Functionality', () => {
    it('renders export button', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      expect(screen.getByText('Exportar')).toBeInTheDocument()
    })

    it('calls onExport when export button is clicked', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      expect(mockOnExport).toHaveBeenCalledTimes(1)
    })

    it('shows loading state during export', () => {
      render(<DashboardFilters {...defaultProps} isExporting={true} />)
      
      expect(screen.getByText('Exportando...')).toBeInTheDocument()
    })

    it('disables export button during export', () => {
      render(<DashboardFilters {...defaultProps} isExporting={true} />)
      
      const exportButton = screen.getByText('Exportando...').closest('button')
      expect(exportButton).toHaveClass('cursor-not-allowed')
    })

    it('does not call onExport when already exporting', () => {
      render(<DashboardFilters {...defaultProps} isExporting={true} />)
      
      const exportButton = screen.getByText('Exportando...').closest('button')!
      fireEvent.click(exportButton)
      
      // Should not be called because button is disabled
      expect(mockOnExport).not.toHaveBeenCalled()
    })
  })

  describe('Action Buttons', () => {
    it('calls onToggleNotifications when notification button is clicked', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      const notificationButton = screen.getByTitle(/notificaciones/i)
      fireEvent.click(notificationButton)
      
      expect(mockOnToggleNotifications).toHaveBeenCalledTimes(1)
    })

    it('calls onOpenSettings when settings button is clicked', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      const settingsButton = screen.getByTitle(/configurar dashboard/i)
      fireEvent.click(settingsButton)
      
      expect(mockOnOpenSettings).toHaveBeenCalledTimes(1)
    })

    it('shows active state for notifications when enabled', () => {
      render(<DashboardFilters {...defaultProps} notificationsEnabled={true} />)
      
      const notificationButton = screen.getByTitle(/notificaciones/i)
      expect(notificationButton).toHaveClass('bg-blue-100', 'text-blue-600')
    })

    it('shows inactive state for notifications when disabled', () => {
      render(<DashboardFilters {...defaultProps} notificationsEnabled={false} />)
      
      const notificationButton = screen.getByTitle(/notificaciones/i)
      expect(notificationButton).toHaveClass('text-gray-500')
    })
  })

  describe('Filter Summary', () => {
    it('displays current filter label', () => {
      render(<DashboardFilters {...defaultProps} timeFilter="month" />)
      
      const buttons = screen.getAllByText('Este Mes')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('displays custom date range when custom filter is active', () => {
      render(<DashboardFilters {...defaultProps} timeFilter="custom" />)
      
      expect(screen.getByText(/2024-01-01 a 2024-01-31/)).toBeInTheDocument()
    })

    it('shows last update time', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      expect(screen.getByText(/Última actualización:/)).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('renders correctly on mobile viewport', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      // Component should render without errors
      expect(screen.getByText('Período:')).toBeInTheDocument()
    })

    it('maintains functionality on small screens', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      const weekButton = screen.getByText('Esta Semana')
      fireEvent.click(weekButton)
      
      expect(mockOnTimeFilterChange).toHaveBeenCalledWith('week')
    })
  })

  describe('Integration Tests', () => {
    it('handles complete filter workflow', () => {
      const { rerender } = render(<DashboardFilters {...defaultProps} />)
      
      // Change to custom filter
      fireEvent.click(screen.getByText('Personalizado'))
      expect(mockOnTimeFilterChange).toHaveBeenCalledWith('custom')
      
      // Re-render with custom filter active
      rerender(<DashboardFilters {...defaultProps} timeFilter="custom" />)
      
      // Change date range
      const inputs = screen.getAllByDisplayValue(/2024-\d{2}-\d{2}/) as HTMLInputElement[]
      const startInput = inputs[0]
      fireEvent.change(startInput, { target: { value: '2024-02-01' } })
      
      expect(mockOnDateRangeChange).toHaveBeenCalled()
    })

    it('handles export after filter change', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      // Change filter
      fireEvent.click(screen.getByText('Esta Semana'))
      expect(mockOnTimeFilterChange).toHaveBeenCalledWith('week')
      
      // Export data
      fireEvent.click(screen.getByText('Exportar'))
      expect(mockOnExport).toHaveBeenCalled()
    })

    it('maintains state consistency across multiple interactions', () => {
      render(<DashboardFilters {...defaultProps} />)
      
      // Multiple filter changes
      const buttons = screen.getAllByRole('button')
      const weekButton = buttons.find(b => b.textContent === 'Esta Semana')!
      const monthButtons = buttons.filter(b => b.textContent === 'Este Mes')
      const yearButton = buttons.find(b => b.textContent === 'Este Año')!
      
      fireEvent.click(weekButton)
      fireEvent.click(monthButtons[0])
      fireEvent.click(yearButton)
      
      expect(mockOnTimeFilterChange).toHaveBeenCalledTimes(3)
      expect(mockOnTimeFilterChange).toHaveBeenLastCalledWith('year')
    })
  })
})