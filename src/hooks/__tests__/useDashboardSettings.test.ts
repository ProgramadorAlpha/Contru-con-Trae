import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDashboardSettings } from '../useDashboardSettings'
import type { DashboardWidget } from '@/types/dashboard'
import { afterEach } from 'node:test'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
vi.stubGlobal('localStorage', mockLocalStorage)

// Mock window.confirm
vi.stubGlobal('confirm', vi.fn(() => true))

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
  }
]

const mockSettings = {
  widgets: mockWidgets,
  preferences: {
    defaultTimeFilter: 'month' as const,
    autoRefresh: true,
    refreshInterval: 30000,
    notificationsEnabled: true
  },
  layout: {
    gridColumns: 4,
    compactMode: false
  }
}

describe('useDashboardSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('initializes with default values', () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    expect(result.current.widgets).toHaveLength(8) // DEFAULT_WIDGETS length
    expect(result.current.isOpen).toBe(false)
    expect(result.current.settings.preferences.defaultTimeFilter).toBe('month')
  })

  it('loads settings from localStorage on mount', () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce(JSON.stringify(mockWidgets)) // widgets
      .mockReturnValueOnce(JSON.stringify({ preferences: mockSettings.preferences })) // settings
    
    const { result } = renderHook(() => useDashboardSettings())
    
    // Should load the mock widgets from localStorage
    expect(result.current.widgets).toHaveLength(mockWidgets.length)
    expect(result.current.widgets[0].id).toBe(mockWidgets[0].id)
  })

  it('saves widgets to localStorage when they change', () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    const newWidgets = [...mockWidgets, {
      id: 'new-widget',
      name: 'New Widget',
      description: 'A new widget',
      enabled: true,
      position: 4
    }]
    
    act(() => {
      result.current.saveSettings(newWidgets)
    })
    
    // Fast-forward to trigger debounced save
    act(() => {
      vi.advanceTimersByTime(600)
    })
    
    // Check that setItem was called
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'dashboard_widgets',
      expect.stringContaining('"name":"New Widget"')
    )
  })

  it('normalizes widget positions when saving', () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    const widgetsWithBadPositions = [
      { ...mockWidgets[0], position: 5 },
      { ...mockWidgets[1], position: 10 },
      { ...mockWidgets[2], position: 1 }
    ]
    
    act(() => {
      result.current.saveSettings(widgetsWithBadPositions)
    })
    
    expect(result.current.widgets[0].position).toBe(1)
    expect(result.current.widgets[1].position).toBe(2)
    expect(result.current.widgets[2].position).toBe(3)
  })

  it('updates settings', async () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    act(() => {
      result.current.updateSettings({
        preferences: {
          defaultTimeFilter: 'week',
          autoRefresh: false,
          refreshInterval: 60000,
          notificationsEnabled: false
        }
      })
    })
    
    expect(result.current.settings.preferences.defaultTimeFilter).toBe('week')
    expect(result.current.settings.preferences.autoRefresh).toBe(false)
  })

  it('resets to default settings', () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    // First modify settings
    act(() => {
      result.current.updateSettings({
        preferences: { 
          defaultTimeFilter: 'year',
          autoRefresh: false,
          refreshInterval: 30000,
          notificationsEnabled: true
        }
      })
    })
    
    // Then reset
    act(() => {
      result.current.resetToDefault()
    })
    
    expect(window.confirm).toHaveBeenCalled()
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('dashboard_widgets')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('dashboard_settings')
  })

  it('exports settings as JSON', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWidgets))
    
    const { result } = renderHook(() => useDashboardSettings())
    
    const exported = result.current.exportSettings()
    const parsed = JSON.parse(exported)
    
    expect(parsed).toHaveProperty('widgets')
    expect(parsed).toHaveProperty('settings')
    expect(parsed).toHaveProperty('exportDate')
    expect(parsed).toHaveProperty('version')
  })

  it('imports settings from JSON', () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    const importData = {
      widgets: mockWidgets,
      settings: {
        preferences: mockSettings.preferences,
        layout: mockSettings.layout
      },
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    act(() => {
      const success = result.current.importSettings(JSON.stringify(importData))
      expect(success).toBe(true)
    })
    
    // Should have imported the mock widgets
    expect(result.current.widgets).toHaveLength(mockWidgets.length)
    expect(result.current.widgets[0].id).toBe(mockWidgets[0].id)
  })

  it('handles invalid import data', () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    const invalidData = { invalid: 'data' }
    const success = result.current.importSettings(JSON.stringify(invalidData))
    
    expect(success).toBe(false)
  })

  it('handles malformed JSON in import', () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    const success = result.current.importSettings('invalid json')
    
    expect(success).toBe(false)
  })

  it('toggles modal open state', () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    expect(result.current.isOpen).toBe(false)
    
    act(() => {
      result.current.setIsOpen(true)
    })
    
    expect(result.current.isOpen).toBe(true)
  })

  it('validates widget structure on load', () => {
    const invalidWidgets = [
      { id: 'valid', name: 'Valid Widget', enabled: true, position: 1 },
      { id: 'invalid1' }, // missing required fields
      { name: 'Invalid2', enabled: true }, // missing id
      { id: 'invalid3', name: 'Invalid3', enabled: 'not-boolean' } // wrong type
    ]
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(invalidWidgets))
    
    const { result } = renderHook(() => useDashboardSettings())
    
    // Should only load valid widgets
    const validWidgets = result.current.widgets.filter(w => w.id === 'valid')
    expect(validWidgets).toHaveLength(1)
  })

  it('handles localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })
    
    const { result } = renderHook(() => useDashboardSettings())
    
    // Should not crash and should use defaults
    expect(result.current.widgets).toBeDefined()
    expect(result.current.settings).toBeDefined()
  })

  it('debounces localStorage operations', () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    // Make multiple rapid changes
    act(() => {
      result.current.updateSettings({ 
        preferences: { 
          defaultTimeFilter: 'week',
          autoRefresh: true,
          refreshInterval: 30000,
          notificationsEnabled: true
        } 
      })
      result.current.updateSettings({ 
        preferences: { 
          defaultTimeFilter: 'month',
          autoRefresh: true,
          refreshInterval: 30000,
          notificationsEnabled: true
        } 
      })
      result.current.updateSettings({ 
        preferences: { 
          defaultTimeFilter: 'year',
          autoRefresh: true,
          refreshInterval: 30000,
          notificationsEnabled: true
        } 
      })
    })
    
    // Should not save immediately
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    
    // Fast-forward to trigger debounced save
    act(() => {
      vi.advanceTimersByTime(600)
    })
    
    // Should have saved after debounce
    expect(mockLocalStorage.setItem).toHaveBeenCalled()
  })

  it('merges partial settings updates correctly', () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    act(() => {
      result.current.updateSettings({
        preferences: { 
          defaultTimeFilter: 'week',
          autoRefresh: true,
          refreshInterval: 30000,
          notificationsEnabled: true
        }
      })
    })
    
    // Should preserve other preference values
    expect(result.current.settings.preferences.autoRefresh).toBe(true)
    expect(result.current.settings.preferences.defaultTimeFilter).toBe('week')
  })

  it('maintains widget order consistency', () => {
    const { result } = renderHook(() => useDashboardSettings())
    
    const reorderedWidgets = [
      { ...mockWidgets[2], position: 1 },
      { ...mockWidgets[0], position: 2 },
      { ...mockWidgets[1], position: 3 }
    ]
    
    act(() => {
      result.current.saveSettings(reorderedWidgets)
    })
    
    // Positions should be normalized to 1, 2, 3
    expect(result.current.widgets[0].position).toBe(1)
    expect(result.current.widgets[1].position).toBe(2)
    expect(result.current.widgets[2].position).toBe(3)
  })

  describe('localStorage Persistence', () => {
    it('persists widgets separately from general settings', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      act(() => {
        result.current.saveSettings(mockWidgets)
      })

      act(() => {
        result.current.updateSettings({
          preferences: { 
            defaultTimeFilter: 'week',
            autoRefresh: true,
            refreshInterval: 30000,
            notificationsEnabled: true
          }
        })
      })

      // Fast-forward debounce
      act(() => {
        vi.advanceTimersByTime(600)
      })

      // Should save to different keys
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'dashboard_widgets',
        expect.any(String)
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'dashboard_settings',
        expect.any(String)
      )
    })

    it('loads widgets and settings independently', () => {
      const savedWidgets = JSON.stringify(mockWidgets)
      const savedSettings = JSON.stringify({
        preferences: { defaultTimeFilter: 'year', autoRefresh: false }
      })

      mockLocalStorage.getItem
        .mockImplementation((key: string) => {
          if (key === 'dashboard_widgets') return savedWidgets
          if (key === 'dashboard_settings') return savedSettings
          return null
        })

      const { result } = renderHook(() => useDashboardSettings())

      expect(result.current.widgets).toEqual(mockWidgets)
      expect(result.current.settings.preferences.defaultTimeFilter).toBe('year')
      expect(result.current.settings.preferences.autoRefresh).toBe(false)
    })

    it('handles partial localStorage data', () => {
      // Only widgets saved, no settings
      mockLocalStorage.getItem
        .mockImplementation((key: string) => {
          if (key === 'dashboard_widgets') return JSON.stringify(mockWidgets)
          return null
        })

      const { result } = renderHook(() => useDashboardSettings())

      expect(result.current.widgets).toEqual(mockWidgets)
      expect(result.current.settings.preferences.defaultTimeFilter).toBe('month') // default
    })

    it('persists widget visibility changes', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      const updatedWidgets = mockWidgets.map(w => 
        w.id === 'projects' ? { ...w, enabled: true } : w
      )

      act(() => {
        result.current.saveSettings(updatedWidgets)
      })

      act(() => {
        vi.advanceTimersByTime(600)
      })

      const savedData = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === 'dashboard_widgets'
      )
      expect(savedData).toBeDefined()
      const parsedData = JSON.parse(savedData![1])
      expect(parsedData.find((w: any) => w.id === 'projects').enabled).toBe(true)
    })

    it('persists widget order changes', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      const reorderedWidgets = [
        { ...mockWidgets[1], position: 1 },
        { ...mockWidgets[0], position: 2 },
        { ...mockWidgets[2], position: 3 }
      ]

      act(() => {
        result.current.saveSettings(reorderedWidgets)
      })

      act(() => {
        vi.advanceTimersByTime(600)
      })

      const savedData = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === 'dashboard_widgets'
      )
      expect(savedData).toBeDefined()
      const parsedData = JSON.parse(savedData![1])
      expect(parsedData[0].id).toBe('charts')
      expect(parsedData[1].id).toBe('stats')
    })

    it('handles localStorage write failures gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const { result } = renderHook(() => useDashboardSettings())
      
      // Should not crash when localStorage fails
      act(() => {
        result.current.saveSettings(mockWidgets)
      })

      act(() => {
        vi.advanceTimersByTime(600)
      })

      // State should still be updated in memory
      expect(result.current.widgets).toEqual(mockWidgets)
    })

    it('clears localStorage on reset', async () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      act(() => {
        result.current.resetToDefault()
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('dashboard_widgets')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('dashboard_settings')
    })

    it('validates localStorage data structure on load', () => {
      const invalidData = JSON.stringify({ invalid: 'structure' })
      mockLocalStorage.getItem.mockReturnValue(invalidData)

      const { result } = renderHook(() => useDashboardSettings())

      // Should fall back to defaults
      expect(result.current.widgets).toBeDefined()
      expect(Array.isArray(result.current.widgets)).toBe(true)
    })

    it('handles corrupted JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('{ invalid json }')

      const { result } = renderHook(() => useDashboardSettings())

      // Should not crash and use defaults
      expect(result.current.widgets).toBeDefined()
      expect(result.current.settings).toBeDefined()
    })

    it('persists preferences independently', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      act(() => {
        result.current.updateSettings({
          preferences: {
            defaultTimeFilter: 'week',
            autoRefresh: false,
            refreshInterval: 60000,
            notificationsEnabled: false
          }
        })
      })

      act(() => {
        vi.advanceTimersByTime(600)
      })

      const savedData = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === 'dashboard_settings'
      )
      expect(savedData).toBeDefined()
      const parsedData = JSON.parse(savedData![1])
      expect(parsedData.preferences.defaultTimeFilter).toBe('week')
      expect(parsedData.preferences.autoRefresh).toBe(false)
    })

    it('persists layout settings', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      act(() => {
        result.current.updateSettings({
          layout: {
            gridColumns: 3,
            compactMode: true
          }
        })
      })

      act(() => {
        vi.advanceTimersByTime(600)
      })

      const savedData = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === 'dashboard_settings'
      )
      expect(savedData).toBeDefined()
      const parsedData = JSON.parse(savedData![1])
      expect(parsedData.layout.gridColumns).toBe(3)
      expect(parsedData.layout.compactMode).toBe(true)
    })
  })

  describe('Reset to Default Functionality', () => {
    it('resets widgets to default state', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      // Modify widgets
      act(() => {
        result.current.saveSettings([
          { ...mockWidgets[0], enabled: false }
        ])
      })

      // Reset
      act(() => {
        result.current.resetToDefault()
      })

      expect(result.current.widgets).toHaveLength(8) // DEFAULT_WIDGETS length
    })

    it('resets preferences to default values', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      // Modify preferences
      act(() => {
        result.current.updateSettings({
          preferences: {
            defaultTimeFilter: 'year',
            autoRefresh: false,
            refreshInterval: 120000,
            notificationsEnabled: false
          }
        })
      })

      // Reset
      act(() => {
        result.current.resetToDefault()
      })

      expect(result.current.settings.preferences.defaultTimeFilter).toBe('month')
      expect(result.current.settings.preferences.autoRefresh).toBe(true)
      expect(result.current.settings.preferences.refreshInterval).toBe(30000)
    })

    it('resets layout to default configuration', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      // Modify layout
      act(() => {
        result.current.updateSettings({
          layout: {
            gridColumns: 2,
            compactMode: true
          }
        })
      })

      // Reset
      act(() => {
        result.current.resetToDefault()
      })

      expect(result.current.settings.layout.gridColumns).toBe(4)
      expect(result.current.settings.layout.compactMode).toBe(false)
    })

    it('requires confirmation before reset', () => {
      const mockConfirm = vi.fn(() => false)
      vi.stubGlobal('confirm', mockConfirm)

      const { result } = renderHook(() => useDashboardSettings())
      
      act(() => {
        result.current.resetToDefault()
      })

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringContaining('restaurar todas las configuraciones por defecto')
      )

      vi.unstubAllGlobals()
    })

    it('does not reset if user cancels confirmation', () => {
      vi.stubGlobal('confirm', vi.fn(() => false))

      const { result } = renderHook(() => useDashboardSettings())
      
      // Modify settings
      act(() => {
        result.current.updateSettings({
          preferences: { 
            defaultTimeFilter: 'year',
            autoRefresh: false,
            refreshInterval: 30000,
            notificationsEnabled: true
          }
        })
      })

      const beforeReset = result.current.settings.preferences.defaultTimeFilter

      // Try to reset
      act(() => {
        result.current.resetToDefault()
      })

      // Should not change
      expect(result.current.settings.preferences.defaultTimeFilter).toBe(beforeReset)

      vi.unstubAllGlobals()
    })
  })

  describe('Export and Import Functionality', () => {
    it('exports complete configuration', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWidgets))
      
      const { result } = renderHook(() => useDashboardSettings())
      
      const exported = result.current.exportSettings()
      const parsed = JSON.parse(exported)
      
      expect(parsed.widgets).toBeDefined()
      expect(parsed.settings.preferences).toBeDefined()
      expect(parsed.settings.layout).toBeDefined()
      expect(parsed.exportDate).toBeDefined()
      expect(parsed.version).toBe('1.0')
    })

    it('imports valid configuration', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      const importData = {
        widgets: mockWidgets,
        settings: {
          preferences: {
            defaultTimeFilter: 'week' as const,
            autoRefresh: false,
            refreshInterval: 60000,
            notificationsEnabled: false
          },
          layout: {
            gridColumns: 3,
            compactMode: true
          }
        },
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      act(() => {
        const success = result.current.importSettings(JSON.stringify(importData))
        expect(success).toBe(true)
      })
      
      expect(result.current.widgets).toHaveLength(mockWidgets.length)
      expect(result.current.widgets[0].id).toBe(mockWidgets[0].id)
      expect(result.current.settings.preferences.defaultTimeFilter).toBe('week')
      expect(result.current.settings.layout.gridColumns).toBe(3)
    })

    it('rejects import with missing widgets', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      const invalidData = {
        settings: { preferences: {}, layout: {} }
      }
      
      const success = result.current.importSettings(JSON.stringify(invalidData))
      
      expect(success).toBe(false)
    })

    it('rejects import with invalid widget structure', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      const invalidData = {
        widgets: [{ invalid: 'widget' }],
        settings: { preferences: {}, layout: {} }
      }
      
      const success = result.current.importSettings(JSON.stringify(invalidData))
      
      expect(success).toBe(false)
    })

    it('filters out invalid widgets during import', () => {
      const { result } = renderHook(() => useDashboardSettings())
      
      const mixedData = {
        widgets: [
          { id: 'valid', name: 'Valid', description: 'Valid', enabled: true, position: 1 },
          { invalid: 'widget' },
          { id: 'valid2', name: 'Valid2', description: 'Valid2', enabled: false, position: 2 }
        ],
        settings: {
          preferences: mockSettings.preferences,
          layout: mockSettings.layout
        }
      }
      
      act(() => {
        const success = result.current.importSettings(JSON.stringify(mixedData))
        expect(success).toBe(true)
      })
      
      // Should only import valid widgets
      const validWidgets = result.current.widgets.filter(w => w.id === 'valid' || w.id === 'valid2')
      expect(validWidgets).toHaveLength(2)
    })
  })
})