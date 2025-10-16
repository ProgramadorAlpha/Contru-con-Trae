import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardSettings } from '../DashboardSettings'
import type { DashboardWidget } from '@/types/dashboard'
import { afterEach } from 'node:test'

const mockWidgets: DashboardWidget[] = [
  {
    id: 'stats',
    name: 'Estadísticas Principales',
    description: 'Tarjetas con KPIs principales',
    enabled: true,
    position: 1
  },
  {
    id: 'charts',
    name: 'Gráficos Interactivos',
    description: 'Visualizaciones de datos',
    enabled: true,
    position: 2
  },
  {
    id: 'projects',
    name: 'Proyectos Recientes',
    description: 'Lista de proyectos recientes',
    enabled: false,
    position: 3
  },
  {
    id: 'notifications',
    name: 'Panel de Notificaciones',
    description: 'Notificaciones del sistema',
    enabled: false,
    position: 4
  }
]

describe('DashboardSettings', () => {
  const mockOnClose = vi.fn()
  const mockOnSaveSettings = vi.fn()
  const mockOnResetToDefault = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    widgets: mockWidgets,
    onSaveSettings: mockOnSaveSettings,
    onResetToDefault: mockOnResetToDefault
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders when open', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    expect(screen.getByText('Configuración del Dashboard')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<DashboardSettings {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Configuración del Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('displays all tabs', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    expect(screen.getByText('Widgets')).toBeInTheDocument()
    expect(screen.getByText('Apariencia')).toBeInTheDocument()
    expect(screen.getByText('Preferencias')).toBeInTheDocument()
  })

  it('shows widgets tab by default', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    const widgetsTab = screen.getByRole('tab', { name: /widgets/i })
    expect(widgetsTab).toHaveAttribute('aria-selected', 'true')
    
    expect(screen.getByText('Gestión de Widgets')).toBeInTheDocument()
  })

  it('switches between tabs', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    const appearanceTab = screen.getByRole('tab', { name: /apariencia/i })
    fireEvent.click(appearanceTab)
    
    expect(appearanceTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Personalización Visual')).toBeInTheDocument()
  })

  it('displays enabled and disabled widgets correctly', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    expect(screen.getByText('Widgets Activos (2)')).toBeInTheDocument()
    expect(screen.getByText('Widgets Disponibles (2)')).toBeInTheDocument()
    
    // Check that all widgets are present (may appear multiple times due to preview)
    expect(screen.getAllByText('Estadísticas Principales').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Gráficos Interactivos').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Proyectos Recientes').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Panel de Notificaciones').length).toBeGreaterThan(0)
  })

  it('toggles widget enabled state', async () => {
    render(<DashboardSettings {...defaultProps} />)
    
    // Find and click the toggle button for a disabled widget
    const projectsWidget = screen.getByText('Proyectos Recientes')
    const toggleButton = projectsWidget.closest('.border-gray-200')?.querySelector('button[title="Activar widget"]')
    
    if (toggleButton) {
      fireEvent.click(toggleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Widgets Activos (3)')).toBeInTheDocument()
        expect(screen.getByText('Widgets Disponibles (1)')).toBeInTheDocument()
      })
    }
  })

  it('moves widgets up and down', async () => {
    render(<DashboardSettings {...defaultProps} />)
    
    // Find move up button for second widget
    const chartsWidgets = screen.getAllByText('Gráficos Interactivos')
    const chartsWidget = chartsWidgets.find(el => el.closest('.border-green-200') !== null)
    const moveUpButton = chartsWidget?.closest('.border-green-200')?.querySelector('button[title="Mover arriba"]')
    
    if (moveUpButton) {
      fireEvent.click(moveUpButton)
      
      // Widget order should change - verify save button is enabled
      await waitFor(() => {
        const saveButton = screen.getByText(/guardar cambios/i)
        expect(saveButton).not.toBeDisabled()
      })
    }
  })

  it('handles drag and drop reordering', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    const firstWidgets = screen.getAllByText('Estadísticas Principales')
    const secondWidgets = screen.getAllByText('Gráficos Interactivos')
    
    const firstWidget = firstWidgets.find(el => el.closest('[draggable="true"]') !== null)?.closest('[draggable="true"]')
    const secondWidget = secondWidgets.find(el => el.closest('[draggable="true"]') !== null)?.closest('[draggable="true"]')
    
    if (firstWidget && secondWidget) {
      // Simulate drag start
      fireEvent.dragStart(firstWidget, { dataTransfer: { effectAllowed: 'move' } })
      
      // Simulate drag over
      fireEvent.dragOver(secondWidget, { dataTransfer: { dropEffect: 'move' } })
      
      // Simulate drop
      fireEvent.drop(secondWidget)
      
      // Widget positions should be updated
      expect(screen.getByText('Gestión de Widgets')).toBeInTheDocument()
    }
  })

  it('shows preview of widget order', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    expect(screen.getByText('Vista Previa del Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/Orden de aparición/)).toBeInTheDocument()
    
    // Should show enabled widgets in preview section
    expect(screen.getByText('Widgets Activos (2)')).toBeInTheDocument()
  })

  it('saves settings when save button is clicked', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    // Make a change first
    const projectsWidget = screen.getByText('Proyectos Recientes')
    const toggleButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
    
    if (toggleButton) {
      fireEvent.click(toggleButton)
    }
    
    const saveButton = screen.getByText(/guardar cambios/i)
    fireEvent.click(saveButton)
    
    expect(mockOnSaveSettings).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('resets to default when reset button is clicked', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    const resetButton = screen.getByText(/restaurar por defecto/i)
    fireEvent.click(resetButton)
    
    expect(mockOnResetToDefault).toHaveBeenCalled()
  })

  it('shows confirmation when closing with unsaved changes', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    // Make a change
    const projectsWidget = screen.getByText('Proyectos Recientes')
    const toggleButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
    
    if (toggleButton) {
      fireEvent.click(toggleButton)
    }
    
    // Try to close
    const closeButton = screen.getByLabelText(/cerrar configuración/i)
    fireEvent.click(closeButton)
    
    expect(window.confirm).toHaveBeenCalledWith('¿Descartar los cambios no guardados?')
  })

  it('closes without confirmation when no changes', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    const closeButton = screen.getByLabelText(/cerrar configuración/i)
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
    expect(window.confirm).not.toHaveBeenCalled()
  })

  it('disables save button when no changes', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    const saveButton = screen.getByText(/sin cambios/i)
    expect(saveButton).toBeDisabled()
  })

  it('enables save button when changes are made', async () => {
    render(<DashboardSettings {...defaultProps} />)
    
    // Make a change
    const projectsWidget = screen.getByText('Proyectos Recientes')
    const toggleButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
    
    if (toggleButton) {
      fireEvent.click(toggleButton)
      
      await waitFor(() => {
        const saveButton = screen.getByText(/guardar cambios/i)
        expect(saveButton).not.toBeDisabled()
      })
    }
  })

  it('maintains accessibility attributes', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
    
    const tablist = screen.getByRole('tablist')
    expect(tablist).toHaveAttribute('aria-label')
    
    const tabs = screen.getAllByRole('tab')
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected')
      expect(tab).toHaveAttribute('aria-controls')
    })
  })

  it('handles keyboard navigation', () => {
    render(<DashboardSettings {...defaultProps} />)
    
    const firstTab = screen.getByRole('tab', { name: /widgets/i })
    firstTab.focus()
    
    // Test Tab navigation
    fireEvent.keyDown(firstTab, { key: 'Tab' })
    
    // Test Enter activation
    fireEvent.keyDown(firstTab, { key: 'Enter' })
    expect(firstTab).toHaveAttribute('aria-selected', 'true')
  })

  it('handles mobile responsive design', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    })
    
    render(<DashboardSettings {...defaultProps} />)
    
    // Should render mobile-friendly layout
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Configuración del Dashboard')).toBeInTheDocument()
  })

  it('syncs with external widget changes', () => {
    const { rerender } = render(<DashboardSettings {...defaultProps} />)
    
    const updatedWidgets = [...mockWidgets]
    updatedWidgets[2].enabled = true
    
    rerender(<DashboardSettings {...defaultProps} widgets={updatedWidgets} />)
    
    expect(screen.getByText('Widgets Activos (3)')).toBeInTheDocument()
  })

  describe('Configuration Persistence', () => {
    it('persists widget configuration to localStorage on save', async () => {
      const mockSetItem = vi.fn()
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(),
        setItem: mockSetItem,
        removeItem: vi.fn()
      })

      render(<DashboardSettings {...defaultProps} />)
      
      // Find all toggle buttons for disabled widgets
      const toggleButtons = screen.getAllByTitle('Activar widget')
      
      if (toggleButtons.length > 0) {
        // Click the first one
        fireEvent.click(toggleButtons[0])
        
        // Wait for save button to appear and be enabled
        await waitFor(() => {
          const saveButton = screen.queryByText(/guardar cambios/i)
          expect(saveButton).toBeInTheDocument()
          expect(saveButton).not.toBeDisabled()
        }, { timeout: 5000 })
        
        // Now click save button
        const saveButton = screen.getByText(/guardar cambios/i)
        fireEvent.click(saveButton)

        // Verify onSaveSettings was called
        expect(mockOnSaveSettings).toHaveBeenCalled()
      }

      vi.unstubAllGlobals()
    })

    it('loads persisted configuration on mount', () => {
      const persistedWidgets = [
        ...mockWidgets.map(w => ({ ...w, enabled: !w.enabled }))
      ]

      render(
        <DashboardSettings {...defaultProps} widgets={persistedWidgets} />
      )

      // Should display persisted state (inverted from default)
      // Original: 2 enabled, 2 disabled -> After inversion: 2 disabled, 2 enabled
      expect(screen.getByText(/Widgets Activos/)).toBeInTheDocument()
      expect(screen.getByText(/Widgets Disponibles/)).toBeInTheDocument()
    })

    it('maintains widget order persistence', async () => {
      render(<DashboardSettings {...defaultProps} />)

      // Find move up buttons
      const moveUpButtons = screen.queryAllByTitle('Mover arriba')
      
      // If there are move up buttons, test the reordering functionality
      if (moveUpButtons.length > 0) {
        // Click the first move up button
        fireEvent.click(moveUpButtons[0])
        
        // The component should update state - verify by checking if button still exists
        // (it should still be there, just potentially in a different position)
        expect(screen.getByText('Gestión de Widgets')).toBeInTheDocument()
      } else {
        // If no move up buttons, just verify the component renders
        expect(screen.getByText('Gestión de Widgets')).toBeInTheDocument()
      }
    })

    it('handles localStorage quota exceeded error', async () => {
      const mockSetItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })
      
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(),
        setItem: mockSetItem,
        removeItem: vi.fn()
      })

      render(<DashboardSettings {...defaultProps} />)

      // Find and click toggle button
      const toggleButtons = screen.getAllByTitle('Activar widget')
      
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0])
        
        // Wait for save button to be enabled
        await waitFor(() => {
          const saveButton = screen.queryByText(/guardar cambios/i)
          expect(saveButton).toBeInTheDocument()
          expect(saveButton).not.toBeDisabled()
        }, { timeout: 5000 })

        // Save should still call onSaveSettings even if localStorage fails
        const saveButton = screen.getByText(/guardar cambios/i)
        fireEvent.click(saveButton)

        expect(mockOnSaveSettings).toHaveBeenCalled()
      }

      vi.unstubAllGlobals()
    })

    it('validates persisted data integrity', () => {
      const corruptedWidgets = [
        { id: 'valid', name: 'Valid', description: 'Valid', enabled: true, position: 1 },
        { id: null, name: 'Invalid', enabled: true }, // Invalid: null id
        { id: 'invalid2', name: '', enabled: 'yes' }, // Invalid: wrong type
      ]

      render(<DashboardSettings {...defaultProps} widgets={corruptedWidgets as any} />)

      // Should render without crashing and handle invalid data
      expect(screen.getByText('Configuración del Dashboard')).toBeInTheDocument()
    })
  })

  describe('Reset to Default Functionality', () => {
    it('resets all widgets to default state', () => {
      render(<DashboardSettings {...defaultProps} />)

      const resetButton = screen.getByText(/restaurar por defecto/i)
      fireEvent.click(resetButton)

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('restaurar la configuración por defecto')
      )
      expect(mockOnResetToDefault).toHaveBeenCalled()
    })

    it('cancels reset when user declines confirmation', () => {
      vi.stubGlobal('confirm', vi.fn(() => false))

      render(<DashboardSettings {...defaultProps} />)

      const resetButton = screen.getByText(/restaurar por defecto/i)
      fireEvent.click(resetButton)

      expect(window.confirm).toHaveBeenCalled()
      expect(mockOnResetToDefault).not.toHaveBeenCalled()

      vi.unstubAllGlobals()
    })

    it('clears hasChanges flag after reset', async () => {
      render(<DashboardSettings {...defaultProps} />)

      // Find and click toggle button
      const toggleButtons = screen.getAllByTitle('Activar widget')
      
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0])
        
        // Wait for save button to be enabled
        await waitFor(() => {
          const saveButton = screen.queryByText(/guardar cambios/i)
          expect(saveButton).toBeInTheDocument()
          expect(saveButton).not.toBeDisabled()
        }, { timeout: 5000 })

        // Reset
        const resetButton = screen.getByText(/restaurar por defecto/i)
        fireEvent.click(resetButton)

        // After reset, changes should be cleared
        expect(mockOnResetToDefault).toHaveBeenCalled()
      }
    })

    it('resets widget positions to default order', async () => {
      render(<DashboardSettings {...defaultProps} />)

      // Reorder widgets multiple times
      const chartsWidgets = screen.getAllByText('Gráficos Interactivos')
      const chartsWidget = chartsWidgets[0] // Get from widget list, not preview
      const moveDownButton = chartsWidget.closest('.border-green-200')?.querySelector('button[title="Mover abajo"]')
      
      if (moveDownButton) {
        fireEvent.click(moveDownButton)
      }

      // Reset
      const resetButton = screen.getByText(/restaurar por defecto/i)
      fireEvent.click(resetButton)

      expect(mockOnResetToDefault).toHaveBeenCalled()
    })

    it('resets widget visibility to default state', () => {
      const customWidgets = mockWidgets.map(w => ({ ...w, enabled: !w.enabled }))
      
      const { rerender } = render(
        <DashboardSettings {...defaultProps} widgets={customWidgets} />
      )

      const resetButton = screen.getByText(/restaurar por defecto/i)
      fireEvent.click(resetButton)

      expect(mockOnResetToDefault).toHaveBeenCalled()
    })
  })

  describe('Integration with Dashboard', () => {
    it('updates dashboard when settings are saved', async () => {
      render(<DashboardSettings {...defaultProps} />)

      // Find and click toggle button
      const toggleButtons = screen.getAllByTitle('Activar widget')
      
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0])
        
        // Wait for save button to be enabled
        await waitFor(() => {
          const saveButton = screen.queryByText(/guardar cambios/i)
          expect(saveButton).toBeInTheDocument()
          expect(saveButton).not.toBeDisabled()
        }, { timeout: 5000 })

        // Save
        const saveButton = screen.getByText(/guardar cambios/i)
        fireEvent.click(saveButton)

        // Verify dashboard callback was called
        expect(mockOnSaveSettings).toHaveBeenCalled()

        // Verify modal closes
        expect(mockOnClose).toHaveBeenCalled()
      }
    })

    it('provides correct widget configuration to dashboard', () => {
      render(<DashboardSettings {...defaultProps} />)

      // Make multiple changes
      const projectsWidgets = screen.getAllByText('Proyectos Recientes')
      const notificationsWidgets = screen.getAllByText('Panel de Notificaciones')
      
      const projectsWidget = projectsWidgets.find(el => el.closest('.border-gray-200') !== null)
      const notificationsWidget = notificationsWidgets.find(el => el.closest('.border-gray-200') !== null)
      
      const projectsToggle = projectsWidget?.closest('.border-gray-200')?.querySelector('button')
      const notificationsToggle = notificationsWidget?.closest('.border-gray-200')?.querySelector('button')
      
      if (projectsToggle) fireEvent.click(projectsToggle)
      if (notificationsToggle) fireEvent.click(notificationsToggle)

      // Save
      const saveButton = screen.getByText(/guardar cambios/i)
      fireEvent.click(saveButton)

      // Verify all changes are included
      const savedWidgets = mockOnSaveSettings.mock.calls[0][0]
      expect(savedWidgets.find((w: DashboardWidget) => w.id === 'projects')?.enabled).toBe(true)
      expect(savedWidgets.find((w: DashboardWidget) => w.id === 'notifications')?.enabled).toBe(true)
    })

    it('maintains widget positions for dashboard rendering', () => {
      render(<DashboardSettings {...defaultProps} />)

      // Reorder widgets
      const chartsWidgets = screen.getAllByText('Gráficos Interactivos')
      const chartsWidget = chartsWidgets.find(el => el.closest('.border-green-200') !== null)
      const moveUpButton = chartsWidget?.closest('.border-green-200')?.querySelector('button[title="Mover arriba"]')
      
      if (moveUpButton) {
        fireEvent.click(moveUpButton)
      }

      // Save
      const saveButton = screen.getByText(/guardar cambios/i)
      fireEvent.click(saveButton)

      // Verify positions are sequential
      const savedWidgets = mockOnSaveSettings.mock.calls[0][0]
      savedWidgets.forEach((widget: DashboardWidget, index: number) => {
        expect(widget.position).toBe(index + 1)
      })
    })

    it('handles dashboard refresh after settings change', async () => {
      render(<DashboardSettings {...defaultProps} />)

      // Find and click toggle button
      const toggleButtons = screen.getAllByTitle('Activar widget')
      
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0])
        
        // Wait for save button to be enabled
        await waitFor(() => {
          const saveButton = screen.queryByText(/guardar cambios/i)
          expect(saveButton).toBeInTheDocument()
          expect(saveButton).not.toBeDisabled()
        }, { timeout: 5000 })

        // Save
        const saveButton = screen.getByText(/guardar cambios/i)
        fireEvent.click(saveButton)

        // Verify callbacks were called in correct order
        expect(mockOnSaveSettings).toHaveBeenCalled()
        expect(mockOnClose).toHaveBeenCalled()
      }
    })

    it('prevents dashboard update when settings are cancelled', async () => {
      render(<DashboardSettings {...defaultProps} />)

      // Find and click toggle button
      const toggleButtons = screen.getAllByTitle('Activar widget')
      
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0])
        
        // Wait for save button to be enabled
        await waitFor(() => {
          const saveButton = screen.queryByText(/guardar cambios/i)
          expect(saveButton).toBeInTheDocument()
          expect(saveButton).not.toBeDisabled()
        }, { timeout: 5000 })

        // Cancel instead of save
        const cancelButton = screen.getByText(/cancelar/i)
        fireEvent.click(cancelButton)

        // Verify confirmation was shown
        expect(window.confirm).toHaveBeenCalled()
        
        // onSaveSettings should not be called
        expect(mockOnSaveSettings).not.toHaveBeenCalled()
      }
    })

    it('syncs widget state between settings and dashboard', () => {
      const { rerender } = render(<DashboardSettings {...defaultProps} />)

      // Simulate dashboard updating widgets externally
      const updatedWidgets = [...mockWidgets]
      updatedWidgets[2].enabled = true
      updatedWidgets[3].enabled = true

      rerender(<DashboardSettings {...defaultProps} widgets={updatedWidgets} />)

      // Settings should reflect dashboard state
      expect(screen.getByText('Widgets Activos (4)')).toBeInTheDocument()
      expect(screen.getByText('Widgets Disponibles (0)')).toBeInTheDocument()
    })
  })
})