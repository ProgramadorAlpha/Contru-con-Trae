import { useState, useEffect, useCallback, useMemo } from 'react'
import { DashboardWidget, DashboardSettings, TimeFilter } from '@/types/dashboard'
import { safeLocalStorage } from '@/lib/utils'
import { useDebouncedCallback } from './useDebounce'

interface UseDashboardSettingsReturn {
  widgets: DashboardWidget[]
  settings: DashboardSettings
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  saveSettings: (widgets: DashboardWidget[]) => void
  updateSettings: (settings: Partial<DashboardSettings>) => void
  resetToDefault: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
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
    id: 'recent-projects',
    name: 'Proyectos Recientes',
    description: 'Lista de proyectos más recientes con progreso',
    enabled: true,
    position: 3
  },
  {
    id: 'upcoming-deadlines',
    name: 'Próximos Vencimientos',
    description: 'Deadlines y fechas importantes próximas',
    enabled: true,
    position: 4
  },
  {
    id: 'quick-actions',
    name: 'Acciones Rápidas',
    description: 'Botones para operaciones frecuentes',
    enabled: true,
    position: 5
  },
  {
    id: 'team-performance',
    name: 'Rendimiento del Equipo',
    description: 'Métricas de desempeño del personal',
    enabled: false,
    position: 6
  },
  {
    id: 'budget-summary',
    name: 'Resumen de Presupuesto',
    description: 'Vista general del estado presupuestario',
    enabled: false,
    position: 7
  },
  {
    id: 'notifications-widget',
    name: 'Panel de Notificaciones',
    description: 'Notificaciones recientes en el dashboard',
    enabled: false,
    position: 8
  }
]

const DEFAULT_SETTINGS: DashboardSettings = {
  widgets: DEFAULT_WIDGETS,
  preferences: {
    defaultTimeFilter: 'month',
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    notificationsEnabled: true
  },
  layout: {
    gridColumns: 4,
    compactMode: false
  }
}

const STORAGE_KEY = 'dashboard_settings'
const WIDGETS_STORAGE_KEY = 'dashboard_widgets'

export function useDashboardSettings(): UseDashboardSettingsReturn {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS)
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS)
  const [isOpen, setIsOpen] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load widgets
        const savedWidgets = safeLocalStorage.getItem(WIDGETS_STORAGE_KEY)
        if (savedWidgets) {
          const parsedWidgets = JSON.parse(savedWidgets)
          if (Array.isArray(parsedWidgets) && parsedWidgets.length > 0) {
            // Validate widget structure
            const validWidgets = parsedWidgets.filter(widget => 
              widget.id && 
              typeof widget.name === 'string' && 
              typeof widget.enabled === 'boolean' &&
              typeof widget.position === 'number'
            )
            
            if (validWidgets.length > 0) {
              setWidgets(validWidgets)
            }
          }
        }

        // Load general settings
        const savedSettings = safeLocalStorage.getItem(STORAGE_KEY)
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings)
          setSettings(prevSettings => ({
            ...prevSettings,
            ...parsedSettings,
            widgets: widgets // Keep widgets separate
          }))
        }
      } catch (error) {
        console.error('Error loading dashboard settings:', error)
        // Reset to defaults on error
        resetToDefaults()
      }
    }

    loadSettings()
  }, [])

  // Debounced localStorage operations to reduce write frequency
  const debouncedSaveWidgets = useDebouncedCallback((widgetsToSave: DashboardWidget[]) => {
    if (widgetsToSave.length > 0) {
      safeLocalStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgetsToSave))
    }
  }, 500, [])

  const debouncedSaveSettings = useDebouncedCallback((settingsToSave: DashboardSettings) => {
    const dataToSave = {
      preferences: settingsToSave.preferences,
      layout: settingsToSave.layout
    }
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  }, 500, [])

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    debouncedSaveWidgets(widgets)
  }, [widgets, debouncedSaveWidgets])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    debouncedSaveSettings(settings)
  }, [settings, debouncedSaveSettings])

  const resetToDefaults = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS)
    setSettings(DEFAULT_SETTINGS)
    safeLocalStorage.removeItem(WIDGETS_STORAGE_KEY)
    safeLocalStorage.removeItem(STORAGE_KEY)
  }, [])

  const saveSettings = useCallback((newWidgets: DashboardWidget[]) => {
    // Validate and normalize widget positions
    const normalizedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      position: index + 1
    }))
    
    setWidgets(normalizedWidgets)
    
    // Update settings with new widgets
    setSettings(prev => ({
      ...prev,
      widgets: normalizedWidgets
    }))
  }, [])

  const updateSettings = useCallback((newSettings: Partial<DashboardSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      preferences: {
        ...prev.preferences,
        ...newSettings.preferences
      },
      layout: {
        ...prev.layout,
        ...newSettings.layout
      }
    }))
  }, [])

  const resetToDefault = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres restaurar todas las configuraciones por defecto? Se perderán todas las personalizaciones.')) {
      resetToDefaults()
    }
  }, [resetToDefaults])

  const exportSettings = useCallback((): string => {
    const exportData = {
      widgets,
      settings: {
        preferences: settings.preferences,
        layout: settings.layout
      },
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    return JSON.stringify(exportData, null, 2)
  }, [widgets, settings])

  const importSettings = useCallback((settingsJson: string): boolean => {
    try {
      const importData = JSON.parse(settingsJson)
      
      // Validate import data structure
      if (!importData.widgets || !Array.isArray(importData.widgets)) {
        throw new Error('Invalid widgets data')
      }
      
      if (!importData.settings || typeof importData.settings !== 'object') {
        throw new Error('Invalid settings data')
      }

      // Validate widgets
      const validWidgets = importData.widgets.filter((widget: any) => 
        widget.id && 
        typeof widget.name === 'string' && 
        typeof widget.enabled === 'boolean' &&
        typeof widget.position === 'number'
      )

      if (validWidgets.length === 0) {
        throw new Error('No valid widgets found in import data')
      }

      // Apply imported settings
      setWidgets(validWidgets)
      
      if (importData.settings.preferences) {
        updateSettings({
          preferences: {
            ...settings.preferences,
            ...importData.settings.preferences
          }
        })
      }
      
      if (importData.settings.layout) {
        updateSettings({
          layout: {
            ...settings.layout,
            ...importData.settings.layout
          }
        })
      }

      return true
    } catch (error) {
      console.error('Error importing settings:', error)
      return false
    }
  }, [settings, updateSettings])

  return {
    widgets,
    settings,
    isOpen,
    setIsOpen,
    saveSettings,
    updateSettings,
    resetToDefault,
    exportSettings,
    importSettings
  }
}

// Hook for widget management only (lighter version)
export function useWidgetSettings() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWidgets = () => {
      try {
        const saved = safeLocalStorage.getItem(WIDGETS_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWidgets(parsed)
          }
        }
      } catch (error) {
        console.error('Error loading widgets:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWidgets()
  }, [])

  const enabledWidgets = widgets
    .filter(widget => widget.enabled)
    .sort((a, b) => a.position - b.position)

  const toggleWidget = useCallback((id: string) => {
    setWidgets(prev => 
      prev.map(widget =>
        widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
      )
    )
  }, [])

  return {
    widgets,
    enabledWidgets,
    loading,
    toggleWidget
  }
}

// Hook for dashboard preferences only
export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState(DEFAULT_SETTINGS.preferences)

  useEffect(() => {
    const saved = safeLocalStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.preferences) {
          setPreferences(prev => ({ ...prev, ...parsed.preferences }))
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
      }
    }
  }, [])

  // Debounced preferences update
  const debouncedUpdatePreferences = useDebouncedCallback((newPreferences: Partial<typeof preferences>) => {
    const currentSettings = safeLocalStorage.getItem(STORAGE_KEY)
    let settingsToSave = { preferences: newPreferences }
    
    if (currentSettings) {
      try {
        const parsed = JSON.parse(currentSettings)
        settingsToSave = { ...parsed, preferences: { ...parsed.preferences, ...newPreferences } }
      } catch (error) {
        console.error('Error parsing current settings:', error)
      }
    }
    
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave))
  }, 500, [])

  const updatePreferences = useCallback((newPreferences: Partial<typeof preferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences }
      debouncedUpdatePreferences(updated)
      return updated
    })
  }, [debouncedUpdatePreferences])

  return {
    preferences,
    updatePreferences
  }
}