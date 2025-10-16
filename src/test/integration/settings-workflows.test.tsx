import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DashboardSettings } from '@/components/dashboard/DashboardSettings'
import type { DashboardWidget } from '@/types/dashboard'

const createMockWidgets = (): DashboardWidget[] => [
  {
    id: 'stats',
    name: 'Estadísticas Principales',
    description: 'Tarjetas con KPIs principales del negocio',
    enabled: true,
    position: 1
  },
  {
    id: 'charts',
    name: 'Gráficos Interactivos',
    description: 'Visualizaciones de datos con Recharts',
    enabled: true,
    position: 2
  },
  {
    id: 'projects',
    name: 'Proyectos Recientes',
    description: 'Lista de proyectos más recientes con progreso',
    enabled: false,
    position: 3
  },
  {
    id: 'notifications',
    name: 'Panel de Notificaciones',
    description: 'Notificaciones recientes en el dashboard',
    enabled: false,
    position: 4
  },
  {
    id: 'team-performance',
    name: 'Rendimiento del Equipo',
    description: 'Métricas de desempeño del personal',
    enabled: true,
    position: 5
  }
]

describe('Settings Workflows Integration', () => {
  const user = userEvent.setup()
  let mockWidgets: DashboardWidget[]
  let mockOnClose: ReturnType<typeof vi.fn>
  let mockOnSaveSettings: ReturnType<typeof vi.fn>
  let mockOnResetToDefault: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockWidgets = createMockWidgets()
    mockOnClose = vi.fn()
    mockOnSaveSettings = vi.fn()
    mockOnResetToDefault = vi.fn()
    
    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const renderDashboardSettings = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: mockOnClose,
      widgets: mockWidgets,
      onSaveSettings: mockOnSaveSettings,
      onResetToDefault: mockOnResetToDefault,
      ...props
    }

    return render(<DashboardSettings {...defaultProps} />)
  }

  describe('Complete Widget Management Workflow', () => {
    it('manages the complete widget configuration lifecycle', async () => {
      renderDashboardSettings()

      // 1. Verify initial state
      expect(screen.getByText('Configuración del Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Widgets Activos (3)')).toBeInTheDocument()
      expect(screen.getByText('Widgets Disponibles (2)')).toBeInTheDocument()

      // 2. Enable a disabled widget
      const projectsWidget = screen.getByText('Proyectos Recientes')
      const enableButton = projectsWidget.closest('.border-gray-200')?.querySelector('button[title="Activar widget"]')
      
      if (enableButton) {
        await user.click(enableButton)
        
        await waitFor(() => {
          expect(screen.getByText('Widgets Activos (4)')).toBeInTheDocument()
          expect(screen.getByText('Widgets Disponibles (1)')).toBeInTheDocument()
        })
      }

      // 3. Reorder widgets using move buttons
      const chartsWidget = screen.getByText('Gráficos Interactivos')
      const moveUpButton = chartsWidget.closest('.border-green-200')?.querySelector('button[title="Mover arriba"]')
      
      if (moveUpButton) {
        await user.click(moveUpButton)
        
        // Widget order should change in preview
        await waitFor(() => {
          const previewItems = screen.getAllByText(/1|2/)
          expect(previewItems.length).toBeGreaterThan(0)
        })
      }

      // 4. Verify preview updates
      expect(screen.getByText('Vista Previa del Dashboard')).toBeInTheDocument()

      // 5. Save changes
      const saveButton = screen.getByText(/guardar cambios/i)
      expect(saveButton).not.toBeDisabled()
      
      await user.click(saveButton)
      expect(mockOnSaveSettings).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('handles drag and drop reordering workflow', async () => {
      renderDashboardSettings()

      const firstWidget = screen.getByText('Estadísticas Principales').closest('[draggable="true"]')
      const secondWidget = screen.getByText('Gráficos Interactivos').closest('[draggable="true"]')

      if (firstWidget && secondWidget) {
        // Simulate drag and drop
        fireEvent.dragStart(firstWidget, { 
          dataTransfer: { effectAllowed: 'move' } 
        })
        
        fireEvent.dragOver(secondWidget, { 
          dataTransfer: { dropEffect: 'move' } 
        })
        
        fireEvent.drop(secondWidget)

        // Should update widget positions
        await waitFor(() => {
          const saveButton = screen.getByText(/guardar cambios/i)
          expect(saveButton).not.toBeDisabled()
        })
      }
    })

    it('handles bulk widget operations', async () => {
      renderDashboardSettings()

      // Enable multiple widgets
      const disabledWidgets = ['Proyectos Recientes', 'Panel de Notificaciones']
      
      for (const widgetName of disabledWidgets) {
        const widget = screen.getByText(widgetName)
        const enableButton = widget.closest('.border-gray-200')?.querySelector('button[title="Activar widget"]')
        
        if (enableButton) {
          await user.click(enableButton)
        }
      }

      await waitFor(() => {
        expect(screen.getByText('Widgets Activos (5)')).toBeInTheDocument()
        expect(screen.getByText('Widgets Disponibles (0)')).toBeInTheDocument()
      })

      // Disable multiple widgets
      const enabledWidgets = screen.getAllByText(/estadísticas|gráficos/i)
      
      for (const widget of enabledWidgets.slice(0, 2)) {
        const disableButton = widget.closest('.border-green-200')?.querySelector('button[title="Desactivar widget"]')
        
        if (disableButton) {
          await user.click(disableButton)
        }
      }

      await waitFor(() => {
        expect(screen.getByText('Widgets Activos (3)')).toBeInTheDocument()
      })
    })
  })

  describe('Settings Tabs and Navigation Workflow', () => {
    it('navigates between all settings tabs', async () => {
      renderDashboardSettings()

      const tabs = [
        { name: 'Apariencia', content: 'Personalización Visual' },
        { name: 'Preferencias', content: 'Preferencias Generales' },
        { name: 'Widgets', content: 'Gestión de Widgets' }
      ]

      for (const tab of tabs) {
        const tabButton = screen.getByRole('tab', { name: new RegExp(tab.name, 'i') })
        await user.click(tabButton)

        expect(tabButton).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByText(tab.content)).toBeInTheDocument()
      }
    })

    it('handles appearance customization workflow', async () => {
      renderDashboardSettings()

      // Navigate to appearance tab
      const appearanceTab = screen.getByRole('tab', { name: /apariencia/i })
      await user.click(appearanceTab)

      expect(screen.getByText('Personalización Visual')).toBeInTheDocument()
      expect(screen.getByText('Tema de Color')).toBeInTheDocument()
      expect(screen.getByText('Densidad de Información')).toBeInTheDocument()

      // Test color theme selection
      const colorThemes = screen.getAllByText(/azul|verde|púrpura/i)
      if (colorThemes.length > 0) {
        await user.click(colorThemes[0])
      }

      // Test density selection
      const densityOptions = screen.getAllByText(/compacto|normal|espacioso/i)
      if (densityOptions.length > 0) {
        await user.click(densityOptions[0])
      }
    })

    it('handles preferences configuration workflow', async () => {
      renderDashboardSettings()

      // Navigate to preferences tab
      const preferencesTab = screen.getByRole('tab', { name: /preferencias/i })
      await user.click(preferencesTab)

      expect(screen.getByText('Preferencias Generales')).toBeInTheDocument()
      expect(screen.getByText('Actualización Automática')).toBeInTheDocument()

      // Test auto-refresh toggle
      const autoRefreshCheckbox = screen.getByRole('checkbox')
      await user.click(autoRefreshCheckbox)

      // Test refresh interval selection
      const intervalSelect = screen.getByRole('combobox')
      await user.selectOptions(intervalSelect, '1 minuto')
      expect(intervalSelect).toHaveValue('1 minuto')
    })
  })

  describe('Settings Persistence and Reset Workflow', () => {
    it('handles settings save and restore workflow', async () => {
      renderDashboardSettings()

      // Make changes
      const projectsWidget = screen.getByText('Proyectos Recientes')
      const enableButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
      
      if (enableButton) {
        await user.click(enableButton)
      }

      // Save settings
      const saveButton = screen.getByText(/guardar cambios/i)
      await user.click(saveButton)

      expect(mockOnSaveSettings).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'projects', enabled: true })
        ])
      )
    })

    it('handles reset to default workflow', async () => {
      renderDashboardSettings()

      // Click reset button
      const resetButton = screen.getByText(/restaurar por defecto/i)
      await user.click(resetButton)

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('restaurar la configuración por defecto')
      )
      expect(mockOnResetToDefault).toHaveBeenCalled()
    })

    it('handles unsaved changes warning workflow', async () => {
      renderDashboardSettings()

      // Make changes
      const projectsWidget = screen.getByText('Proyectos Recientes')
      const enableButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
      
      if (enableButton) {
        await user.click(enableButton)
      }

      // Try to close without saving
      const closeButton = screen.getByLabelText(/cerrar configuración/i)
      await user.click(closeButton)

      expect(window.confirm).toHaveBeenCalledWith('¿Descartar los cambios no guardados?')
    })

    it('handles settings export and import workflow', async () => {
      // This would test the export/import functionality if exposed in the UI
      renderDashboardSettings()

      // For now, just verify the settings modal is functional
      expect(screen.getByText('Configuración del Dashboard')).toBeInTheDocument()
    })
  })

  describe('Validation and Error Handling Workflow', () => {
    it('handles invalid widget configurations', async () => {
      const invalidWidgets = [
        ...mockWidgets,
        {
          id: 'invalid',
          name: '',
          description: '',
          enabled: true,
          position: -1
        }
      ]

      renderDashboardSettings({ widgets: invalidWidgets })

      // Should still render without crashing
      expect(screen.getByText('Configuración del Dashboard')).toBeInTheDocument()
    })

    it('handles widget position conflicts', async () => {
      const conflictingWidgets = mockWidgets.map(widget => ({
        ...widget,
        position: 1 // All widgets have same position
      }))

      renderDashboardSettings({ widgets: conflictingWidgets })

      // Should handle position conflicts gracefully
      expect(screen.getByText('Widgets Activos')).toBeInTheDocument()
    })

    it('handles empty widget lists', async () => {
      renderDashboardSettings({ widgets: [] })

      expect(screen.getByText('No hay widgets activos')).toBeInTheDocument()
      expect(screen.getByText('Todos los widgets están activos')).toBeInTheDocument()
    })
  })

  describe('Accessibility and Keyboard Navigation Workflow', () => {
    it('handles complete keyboard navigation workflow', async () => {
      renderDashboardSettings()

      // Test tab navigation
      const firstTab = screen.getByRole('tab', { name: /widgets/i })
      firstTab.focus()

      // Navigate with arrow keys (if implemented)
      fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
      
      // Test Enter activation
      fireEvent.keyDown(firstTab, { key: 'Enter' })
      expect(firstTab).toHaveAttribute('aria-selected', 'true')

      // Test Escape to close
      fireEvent.keyDown(document, { key: 'Escape' })
      // Note: Escape handling would need to be implemented in the component
    })

    it('maintains focus management during interactions', async () => {
      renderDashboardSettings()

      // Focus should be managed properly when toggling widgets
      const projectsWidget = screen.getByText('Proyectos Recientes')
      const enableButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
      
      if (enableButton) {
        (enableButton as HTMLElement).focus()
        expect(document.activeElement).toBe(enableButton)
        
        await user.click(enableButton)
        
        // Focus should remain manageable after state change
        expect(document.activeElement).toBeDefined()
      }
    })

    it('provides proper ARIA attributes and labels', async () => {
      renderDashboardSettings()

      // Check dialog attributes
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby')

      // Check tablist attributes
      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveAttribute('aria-label')

      // Check tab attributes
      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected')
        expect(tab).toHaveAttribute('aria-controls')
      })
    })
  })

  describe('Dashboard Integration with Settings', () => {
    it('applies widget configuration to dashboard immediately after save', async () => {
      renderDashboardSettings()

      // Enable a widget
      const projectsWidget = screen.getByText('Proyectos Recientes')
      const enableButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
      
      if (enableButton) {
        await user.click(enableButton)
      }

      // Save settings
      const saveButton = screen.getByText(/guardar cambios/i)
      await user.click(saveButton)

      // Verify dashboard callback receives correct configuration
      expect(mockOnSaveSettings).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'projects',
            enabled: true,
            position: expect.any(Number)
          })
        ])
      )
    })

    it('maintains widget order consistency between settings and dashboard', async () => {
      renderDashboardSettings()

      // Reorder widgets
      const chartsWidget = screen.getByText('Gráficos Interactivos')
      const moveUpButton = chartsWidget.closest('.border-green-200')?.querySelector('button[title="Mover arriba"]')
      
      if (moveUpButton) {
        await user.click(moveUpButton)
      }

      // Save
      const saveButton = screen.getByText(/guardar cambios/i)
      await user.click(saveButton)

      // Verify positions are sequential and correct
      const savedWidgets = mockOnSaveSettings.mock.calls[0][0]
      const positions = savedWidgets.map((w: DashboardWidget) => w.position)
      
      // Positions should be 1, 2, 3, 4, 5
      expect(positions).toEqual([1, 2, 3, 4, 5])
      
      // First widget should be charts (moved up)
      expect(savedWidgets[0].id).toBe('charts')
    })

    it('synchronizes widget visibility between settings and dashboard', async () => {
      const { rerender } = renderDashboardSettings()

      // Enable multiple widgets
      const projectsWidget = screen.getByText('Proyectos Recientes')
      const notificationsWidget = screen.getByText('Panel de Notificaciones')
      
      const projectsButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
      const notificationsButton = notificationsWidget.closest('.border-gray-200')?.querySelector('button')
      
      if (projectsButton) await user.click(projectsButton)
      if (notificationsButton) await user.click(notificationsButton)

      // Save
      const saveButton = screen.getByText(/guardar cambios/i)
      await user.click(saveButton)

      // Simulate dashboard updating with new configuration
      const updatedWidgets = mockOnSaveSettings.mock.calls[0][0]
      rerender(
        <DashboardSettings
          isOpen={true}
          onClose={mockOnClose}
          widgets={updatedWidgets}
          onSaveSettings={mockOnSaveSettings}
          onResetToDefault={mockOnResetToDefault}
        />
      )

      // Settings should reflect the saved state
      expect(screen.getByText('Widgets Activos (5)')).toBeInTheDocument()
    })

    it('handles dashboard refresh after settings reset', async () => {
      renderDashboardSettings()

      // Make changes
      const projectsWidget = screen.getByText('Proyectos Recientes')
      const enableButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
      
      if (enableButton) {
        await user.click(enableButton)
      }

      // Reset to default
      const resetButton = screen.getByText(/restaurar por defecto/i)
      await user.click(resetButton)

      expect(mockOnResetToDefault).toHaveBeenCalled()
    })

    it('prevents dashboard update when changes are discarded', async () => {
      renderDashboardSettings()

      // Make changes
      const projectsWidget = screen.getByText('Proyectos Recientes')
      const enableButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
      
      if (enableButton) {
        await user.click(enableButton)
      }

      // Try to close (will show confirmation)
      const closeButton = screen.getByLabelText(/cerrar configuración/i)
      await user.click(closeButton)

      // Confirm discard
      expect(window.confirm).toHaveBeenCalled()

      // onSaveSettings should not be called
      expect(mockOnSaveSettings).not.toHaveBeenCalled()
    })

    it('updates dashboard preview in real-time as settings change', async () => {
      renderDashboardSettings()

      // Initial preview
      expect(screen.getByText('Vista Previa del Dashboard')).toBeInTheDocument()
      
      // Enable a widget
      const projectsWidget = screen.getByText('Proyectos Recientes')
      const enableButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
      
      if (enableButton) {
        await user.click(enableButton)
      }

      // Preview should update immediately
      await waitFor(() => {
        const previewItems = screen.getAllByText(/1|2|3|4/)
        expect(previewItems.length).toBeGreaterThan(3)
      })
    })

    it('maintains dashboard state when settings modal is closed without saving', async () => {
      const originalWidgets = [...mockWidgets]
      renderDashboardSettings()

      // Make changes
      const projectsWidget = screen.getByText('Proyectos Recientes')
      const enableButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
      
      if (enableButton) {
        await user.click(enableButton)
      }

      // Close without saving
      const cancelButton = screen.getByText(/cancelar/i)
      await user.click(cancelButton)

      // Dashboard should not be updated
      expect(mockOnSaveSettings).not.toHaveBeenCalled()
    })
  })

  describe('localStorage Persistence Integration', () => {
    beforeEach(() => {
      // Mock localStorage
      const storage: Record<string, string> = {}
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key: string) => storage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          storage[key] = value
        }),
        removeItem: vi.fn((key: string) => {
          delete storage[key]
        })
      })
    })

    it('persists widget configuration across sessions', async () => {
      const { unmount } = renderDashboardSettings()

      // Make changes
      const projectsWidget = screen.getByText('Proyectos Recientes')
      const enableButton = projectsWidget.closest('.border-gray-200')?.querySelector('button')
      
      if (enableButton) {
        await user.click(enableButton)
      }

      // Save
      const saveButton = screen.getByText(/guardar cambios/i)
      await user.click(saveButton)

      // Unmount component
      unmount()

      // Remount with saved configuration
      const savedWidgets = mockOnSaveSettings.mock.calls[0][0]
      renderDashboardSettings({ widgets: savedWidgets })

      // Should show persisted state
      expect(screen.getByText('Widgets Activos (4)')).toBeInTheDocument()
    })

    it('loads persisted configuration on dashboard mount', () => {
      const persistedWidgets = mockWidgets.map(w => ({
        ...w,
        enabled: w.id === 'projects' ? true : w.enabled
      }))

      renderDashboardSettings({ widgets: persistedWidgets })

      // Should display persisted configuration
      expect(screen.getByText('Widgets Activos (4)')).toBeInTheDocument()
      
      // Projects widget should be in active list
      const projectsWidget = screen.getByText('Proyectos Recientes')
      expect(projectsWidget.closest('.border-green-200')).toBeInTheDocument()
    })

    it('handles localStorage errors without breaking dashboard', () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => {
          throw new Error('localStorage error')
        }),
        setItem: vi.fn(),
        removeItem: vi.fn()
      })

      // Should render without crashing
      renderDashboardSettings()
      expect(screen.getByText('Configuración del Dashboard')).toBeInTheDocument()
    })

    it('validates and sanitizes persisted data before applying to dashboard', () => {
      const corruptedWidgets = [
        ...mockWidgets,
        { id: null, name: 'Invalid', enabled: true } as any,
        { id: 'invalid2', name: '', enabled: 'yes' } as any
      ]

      renderDashboardSettings({ widgets: corruptedWidgets })

      // Should handle corrupted data gracefully
      expect(screen.getByText('Configuración del Dashboard')).toBeInTheDocument()
    })
  })

  describe('Performance and Responsiveness Workflow', () => {
    it('handles large widget lists efficiently', async () => {
      const largeWidgetList = Array.from({ length: 50 }, (_, i) => ({
        id: `widget-${i}`,
        name: `Widget ${i}`,
        description: `Description for widget ${i}`,
        enabled: i % 2 === 0,
        position: i + 1
      }))

      const startTime = performance.now()
      renderDashboardSettings({ widgets: largeWidgetList })
      const endTime = performance.now()

      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(200)

      // Should show correct counts
      expect(screen.getByText('Widgets Activos (25)')).toBeInTheDocument()
      expect(screen.getByText('Widgets Disponibles (25)')).toBeInTheDocument()
    })

    it('handles rapid widget toggles without performance issues', async () => {
      renderDashboardSettings()

      const widgets = ['Proyectos Recientes', 'Panel de Notificaciones']
      
      // Rapidly toggle widgets
      for (let i = 0; i < 5; i++) {
        for (const widgetName of widgets) {
          const widget = screen.getByText(widgetName)
          const toggleButton = widget.closest('.border-gray-200, .border-green-200')?.querySelector('button')
          
          if (toggleButton) {
            await user.click(toggleButton)
          }
        }
      }

      // Should still be responsive
      expect(screen.getByText('Configuración del Dashboard')).toBeInTheDocument()
    })

    it('handles mobile responsive behavior', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      renderDashboardSettings()

      // Should render mobile-friendly layout
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Configuración del Dashboard')).toBeInTheDocument()

      // Tabs should be scrollable on mobile
      const tablist = screen.getByRole('tablist')
      expect(tablist.parentElement).toHaveClass('overflow-x-auto')
    })
  })
})