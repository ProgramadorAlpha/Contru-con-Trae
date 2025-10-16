import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UnifiedDashboard } from '@/pages/UnifiedDashboard'
import * as useDashboardDataModule from '@/hooks/useDashboardData'
import * as useNotificationsModule from '@/hooks/useNotifications'
import * as useDashboardSettingsModule from '@/hooks/useDashboardSettings'
import { createMockDashboardData } from '@/test/utils'

// Mock hooks
vi.mock('@/hooks/useDarkMode', () => ({
  useDarkMode: () => ({
    isDarkMode: false,
    theme: 'light',
    toggleDarkMode: vi.fn(),
    setDarkMode: vi.fn()
  })
}))

describe('Dashboard Export Functionality', () => {
  const mockExportData = vi.fn()
  const mockAddNotification = vi.fn()
  
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
      loadData: vi.fn()
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

  describe('Export Button', () => {
    it('renders export button in filters', async () => {
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
    })

    it('calls exportData when export button is clicked', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
      })
    })

    it('shows loading state during export', async () => {
      mockExportData.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(screen.getByText('Exportando...')).toBeInTheDocument()
      })
    })

    it('disables export button during export', async () => {
      mockExportData.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        const loadingButton = screen.getByText('Exportando...').closest('button')
        expect(loadingButton).toHaveClass('cursor-not-allowed')
      })
    })
  })

  describe('Export Success', () => {
    it('shows success notification after successful export', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          'success',
          'Exportación Completada',
          'Los datos del dashboard se han exportado exitosamente.',
          undefined
        )
      })
    })

    it('resets loading state after successful export', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalled()
      })
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
        expect(screen.queryByText('Exportando...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Export Error Handling', () => {
    it('shows error notification when export fails', async () => {
      mockExportData.mockRejectedValue(new Error('Export failed'))
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          'error',
          'Error en Exportación',
          'No se pudieron exportar los datos. Por favor, inténtalo de nuevo.',
          undefined
        )
      })
    })

    it('resets loading state after export error', async () => {
      mockExportData.mockRejectedValue(new Error('Export failed'))
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalled()
      })
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
        expect(screen.queryByText('Exportando...')).not.toBeInTheDocument()
      })
    })

    it('allows retry after export failure', async () => {
      mockExportData.mockRejectedValueOnce(new Error('Export failed'))
      mockExportData.mockResolvedValueOnce(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      // First attempt - fails
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
      
      // Second attempt - succeeds
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

  describe('Export with Different Filters', () => {
    it('exports data with current time filter applied', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Esta Semana')).toBeInTheDocument()
      })
      
      // Change filter to week
      fireEvent.click(screen.getByText('Esta Semana'))
      
      // Export
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
      })
    })

    it('exports data with custom date range', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Personalizado')).toBeInTheDocument()
      })
      
      // Change to custom filter
      fireEvent.click(screen.getByText('Personalizado'))
      
      // Export
      await waitFor(() => {
        const exportButton = screen.getByText('Exportar')
        fireEvent.click(exportButton)
      })
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
      })
    })
  })

  describe('Export Data Validation', () => {
    it('does not export when no data is available', async () => {
      vi.spyOn(useDashboardDataModule, 'useDashboardData').mockReturnValue({
        data: null,
        loading: false,
        error: null,
        currentFilter: 'month',
        exportData: mockExportData,
        loadData: vi.fn()
      })
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      // Should not call exportData when data is null
      expect(mockExportData).not.toHaveBeenCalled()
    })

    it('exports complete dashboard data', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('Exportar')
      fireEvent.click(exportButton)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
      })
    })
  })

  describe('Multiple Export Attempts', () => {
    it('prevents multiple simultaneous exports', async () => {
      mockExportData.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)))
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('Exportar')
      
      // Click multiple times
      fireEvent.click(exportButton)
      fireEvent.click(exportButton)
      fireEvent.click(exportButton)
      
      // Should only call exportData once
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledTimes(1)
      })
    })

    it('allows export after previous export completes', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      render(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      const exportButton = screen.getByText('Exportar')
      
      // First export
      fireEvent.click(exportButton)
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledTimes(1)
      })
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Exportar')).toBeInTheDocument()
      })
      
      // Second export
      fireEvent.click(exportButton)
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledTimes(2)
      })
    })
  })
})
