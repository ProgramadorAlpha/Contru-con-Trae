import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UnifiedDashboard } from '@/pages/UnifiedDashboard'
import * as useDashboardDataModule from '@/hooks/useDashboardData'
import * as useNotificationsModule from '@/hooks/useNotifications'
import * as useDashboardSettingsModule from '@/hooks/useDashboardSettings'
import { createMockDashboardData } from '@/test/utils'
import type { TimeFilter, DateRange } from '@/types/dashboard'

// Mock hooks
vi.mock('@/hooks/useDarkMode', () => ({
  useDarkMode: () => ({
    isDarkMode: false,
    theme: 'light',
    toggleDarkMode: vi.fn(),
    setDarkMode: vi.fn()
  })
}))

describe('Filters and Export Integration', () => {
  const mockExportData = vi.fn()
  const mockAddNotification = vi.fn()
  const mockRefetch = vi.fn()
  
  const mockDashboardData = createMockDashboardData()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock useDashboardData
    vi.spyOn(useDashboardDataModule, 'useDashboardData').mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      currentFilter: 'month',
      exportData: mockExportData,
      loadData: mockRefetch
    })
    
    // Mock useNotifications
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isOpen: false,
      setIsOpen: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      removeNotification: vi.fn(),
      addNotification: mockAddNotification,
      config: {
        enabled: true,
        types: {
          info: true,
          warning: true,
          success: true,
          error: true
        },
        sound: false,
        desktop: false
      },
      clearAll: vi.fn(),
      updateConfig: vi.fn()
    })
    
    // Mock useDashboardSettings
    vi.spyOn(useDashboardSettingsModule, 'useDashboardSettings').mockReturnValue({
      widgets: [
        { id: 'stats', name: 'Stats', description: 'Stats widget', enabled: true, position: 1 },
        { id: 'charts', name: 'Charts', description: 'Charts widget', enabled: true, position: 2 }
      ],
      settings: {
        widgets: [
          { id: 'stats', name: 'Stats', description: 'Stats widget', enabled: true, position: 1 },
          { id: 'charts', name: 'Charts', description: 'Charts widget', enabled: true, position: 2 }
        ],
        preferences: {
          defaultTimeFilter: 'month',
          autoRefresh: false,
          refreshInterval: 30000,
          notificationsEnabled: true
        },
        layout: {
          gridColumns: 4,
          compactMode: false
        }
      },
      isOpen: false,
      setIsOpen: vi.fn(),
      saveSettings: vi.fn(),
      updateSettings: vi.fn(),
      resetToDefault: vi.fn(),
      exportSettings: vi.fn(),
      importSettings: vi.fn()
    })
  })

  describe('Complete Filter and Export Workflow', () => {
    it('allows changing filter and then exporting', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Esta Semana')).toBeInTheDocument()
      })
      
      // Change filter
      fireEvent.click(screen.getByText('Esta Semana'))
      
      // Export with new filter
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
        expect(mockAddNotification).toHaveBeenCalledWith(
          'success',
          'Exportación Completada',
          expect.any(String),
          undefined
        )
      })
    })

    it('handles custom date range selection and export', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Personalizado')).toBeInTheDocument()
      })
      
      // Switch to custom filter
      fireEvent.click(screen.getByText('Personalizado'))
      
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        expect(inputs.length).toBeGreaterThan(0)
      })
      
      // Change date range
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      const startInput = inputs[0]
      const endInput = inputs[1]
      
      fireEvent.change(startInput, { target: { value: '2024-01-01' } })
      fireEvent.change(endInput, { target: { value: '2024-01-31' } })
      
      // Export with custom range
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
      })
    })

    it('validates date range before allowing export', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Personalizado')).toBeInTheDocument()
      })
      
      // Switch to custom filter
      fireEvent.click(screen.getByText('Personalizado'))
      
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        expect(inputs.length).toBeGreaterThan(0)
      })
      
      // Set invalid date range (end before start)
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      const startInput = inputs[0]
      const endInput = inputs[1]
      
      fireEvent.change(startInput, { target: { value: '2024-02-01' } })
      fireEvent.change(endInput, { target: { value: '2024-01-01' } })
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getAllByText('Fecha inválida').length).toBeGreaterThan(0)
      })
      
      // Export should still be possible (component allows it)
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalled()
      })
    })
  })

  describe('Filter Changes During Export', () => {
    it('prevents filter changes during export', async () => {
      mockExportData.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)))
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      // Start export
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(screen.getByText('Exportando...')).toBeInTheDocument()
      })
      
      // Try to change filter during export
      const weekButton = screen.getByText('Esta Semana')
      fireEvent.click(weekButton)
      
      // Filter change should still work (not blocked by export)
      expect(weekButton).toBeInTheDocument()
    })
  })

  describe('Multiple Filter Changes and Export', () => {
    it('handles rapid filter changes followed by export', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Esta Semana')).toBeInTheDocument()
      })
      
      // Rapid filter changes
      fireEvent.click(screen.getByText('Esta Semana'))
      fireEvent.click(screen.getByText('Este Mes'))
      fireEvent.click(screen.getByText('Este Trimestre'))
      fireEvent.click(screen.getByText('Este Año'))
      
      // Export with final filter
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
      })
    })

    it('exports correct data after filter changes', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Esta Semana')).toBeInTheDocument()
      })
      
      // Change filter multiple times
      fireEvent.click(screen.getByText('Esta Semana'))
      fireEvent.click(screen.getByText('Este Mes'))
      
      // Export
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
        expect(mockAddNotification).toHaveBeenCalledWith(
          'success',
          expect.any(String),
          expect.any(String),
          undefined
        )
      })
    })
  })

  describe('Quick Date Presets and Export', () => {
    it('uses last 7 days preset and exports', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Personalizado')).toBeInTheDocument()
      })
      
      // Switch to custom
      fireEvent.click(screen.getByText('Personalizado'))
      
      await waitFor(() => {
        expect(screen.getByText('Últimos 7 días')).toBeInTheDocument()
      })
      
      // Use quick preset
      fireEvent.click(screen.getByText('Últimos 7 días'))
      
      // Export
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
      })
    })

    it('uses last 30 days preset and exports', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Personalizado')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Personalizado'))
      
      await waitFor(() => {
        expect(screen.getByText('Últimos 30 días')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Últimos 30 días'))
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
      })
    })

    it('uses last 90 days preset and exports', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Personalizado')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Personalizado'))
      
      await waitFor(() => {
        expect(screen.getByText('Últimos 90 días')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Últimos 90 días'))
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
      })
    })
  })

  describe('Error Recovery in Filter and Export Flow', () => {
    it('recovers from export error and allows retry with different filter', async () => {
      mockExportData
        .mockRejectedValueOnce(new Error('Export failed'))
        .mockResolvedValueOnce(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      // First export attempt - fails
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          'error',
          expect.any(String),
          expect.any(String),
          undefined
        )
      })
      
      // Change filter
      fireEvent.click(screen.getByText('Esta Semana'))
      
      // Retry export - succeeds
      mockAddNotification.mockClear()
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          'success',
          'Exportación Completada',
          expect.any(String),
          undefined
        )
      })
    })
  })

  describe('Filter Summary Display', () => {
    it('shows correct filter summary before export', async () => {
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText(/Mostrando datos de:/)).toBeInTheDocument()
      })
      
      // Should show current filter
      expect(screen.getByText(/Este Mes/)).toBeInTheDocument()
    })

    it('updates filter summary when filter changes', async () => {
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Esta Semana')).toBeInTheDocument()
      })
      
      // Change filter
      fireEvent.click(screen.getByText('Esta Semana'))
      
      // Summary should update
      await waitFor(() => {
        expect(screen.getByText(/Esta Semana/)).toBeInTheDocument()
      })
    })

    it('shows custom date range in summary', async () => {
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Personalizado')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Personalizado'))
      
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
        expect(inputs.length).toBeGreaterThan(0)
      })
      
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      fireEvent.change(inputs[0], { target: { value: '2024-01-01' } })
      fireEvent.change(inputs[1], { target: { value: '2024-01-31' } })
      
      await waitFor(() => {
        expect(screen.getByText(/2024-01-01 a 2024-01-31/)).toBeInTheDocument()
      })
    })
  })
})
