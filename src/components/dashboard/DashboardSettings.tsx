import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { X, Save, RotateCcw, Eye, EyeOff, GripVertical, Settings2, Palette, Layout } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardWidget, DashboardSettings as DashboardSettingsType } from '@/types/dashboard'

interface DashboardSettingsProps {
  isOpen: boolean
  onClose: () => void
  widgets: DashboardWidget[]
  onSaveSettings: (widgets: DashboardWidget[]) => void
  onResetToDefault: () => void
}

export const DashboardSettings = React.memo(function DashboardSettings({
  isOpen,
  onClose,
  widgets,
  onSaveSettings,
  onResetToDefault
}: DashboardSettingsProps) {
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>(widgets)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<'widgets' | 'appearance' | 'preferences'>('widgets')
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  // Sync with external widgets changes
  useEffect(() => {
    setLocalWidgets(widgets)
    setHasChanges(false)
  }, [widgets])

  // Memoize event handlers to prevent unnecessary re-renders
  const handleToggleWidget = useCallback((id: string) => {
    setLocalWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
    ))
    setHasChanges(true)
  }, [])

  const handleMoveWidget = useCallback((id: string, direction: 'up' | 'down') => {
    setLocalWidgets(prev => {
      const currentIndex = prev.findIndex(w => w.id === id)
      if (
        (direction === 'up' && currentIndex === 0) ||
        (direction === 'down' && currentIndex === prev.length - 1)
      ) {
        return prev
      }

      const newWidgets = [...prev]
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      
      // Intercambiar posiciones
      const temp = newWidgets[currentIndex]
      newWidgets[currentIndex] = newWidgets[targetIndex]
      newWidgets[targetIndex] = temp
      
      // Actualizar números de posición
      newWidgets.forEach((widget, index) => {
        widget.position = index + 1
      })

      return newWidgets
    })
    setHasChanges(true)
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null)
      return
    }

    setLocalWidgets(prev => {
      const draggedIndex = prev.findIndex(w => w.id === draggedItem)
      const targetIndex = prev.findIndex(w => w.id === targetId)

      if (draggedIndex === -1 || targetIndex === -1) {
        return prev
      }

      const newWidgets = [...prev]
      const draggedWidget = newWidgets[draggedIndex]
      
      // Remove dragged item
      newWidgets.splice(draggedIndex, 1)
      
      // Insert at new position
      newWidgets.splice(targetIndex, 0, draggedWidget)
      
      // Update positions
      newWidgets.forEach((widget, index) => {
        widget.position = index + 1
      })

      return newWidgets
    })
    
    setHasChanges(true)
    setDraggedItem(null)
  }, [draggedItem])

  const handleSave = useCallback(() => {
    onSaveSettings(localWidgets)
    setHasChanges(false)
    onClose()
  }, [localWidgets, onSaveSettings, onClose])

  const handleReset = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres restaurar la configuración por defecto? Se perderán todos los cambios personalizados.')) {
      onResetToDefault()
      setHasChanges(false)
    }
  }, [onResetToDefault])

  const handleClose = useCallback(() => {
    if (hasChanges) {
      if (window.confirm('¿Descartar los cambios no guardados?')) {
        setLocalWidgets(widgets)
        setHasChanges(false)
        onClose()
      }
    } else {
      onClose()
    }
  }, [hasChanges, widgets, onClose])

  const handleTabChange = useCallback((tab: 'widgets' | 'appearance' | 'preferences') => {
    setActiveTab(tab)
  }, [])

  // Memoize widget lists to prevent recalculation
  const { enabledWidgets, disabledWidgets } = useMemo(() => {
    const enabled = localWidgets.filter(w => w.enabled).sort((a, b) => a.position - b.position)
    const disabled = localWidgets.filter(w => !w.enabled)
    return { enabledWidgets: enabled, disabledWidgets: disabled }
  }, [localWidgets])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-4 p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-settings-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden sm:rounded-lg rounded-none sm:max-h-[85vh] max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Settings2 className="w-6 h-6 text-gray-600" aria-hidden="true" />
            <h2 id="dashboard-settings-title" className="text-xl font-semibold text-gray-900">
              Configuración del Dashboard
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors focus-visible:focus-visible"
            aria-label="Cerrar configuración del dashboard"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-8 px-6 sm:space-x-8 space-x-4 min-w-max sm:min-w-0" role="tablist" aria-label="Configuración del dashboard">
            {[
              { id: 'widgets', label: 'Widgets', icon: Layout },
              { id: 'appearance', label: 'Apariencia', icon: Palette },
              { id: 'preferences', label: 'Preferencias', icon: Settings2 }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={cn(
                    'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors focus-visible:focus-visible whitespace-nowrap min-h-[44px]',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  id={`${tab.id}-tab`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'widgets' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Gestión de Widgets
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Personaliza qué widgets se muestran en tu dashboard y su orden de aparición. 
                  Puedes arrastrar y soltar para reordenar.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enabled Widgets */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-green-600" />
                    Widgets Activos ({enabledWidgets.length})
                  </h4>
                  <div className="space-y-2 min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg p-3">
                    {enabledWidgets.map((widget, index) => (
                        <div
                          key={widget.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, widget.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, widget.id)}
                          className={cn(
                            'flex items-center justify-between p-3 border rounded-lg transition-all cursor-move',
                            'border-green-200 bg-green-50 hover:bg-green-100',
                            draggedItem === widget.id && 'opacity-50'
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                                {index + 1}
                              </span>
                              <div>
                                <h5 className="font-medium text-gray-900 text-sm">
                                  {widget.name}
                                </h5>
                                <p className="text-xs text-gray-600">
                                  {widget.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleMoveWidget(widget.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mover arriba"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => handleMoveWidget(widget.id, 'down')}
                              disabled={index === enabledWidgets.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mover abajo"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => handleToggleWidget(widget.id)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Desactivar widget"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    {enabledWidgets.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <EyeOff className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No hay widgets activos</p>
                        <p className="text-xs">Activa widgets desde la columna de la derecha</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Disabled Widgets */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <EyeOff className="w-4 h-4 mr-2 text-gray-400" />
                    Widgets Disponibles ({disabledWidgets.length})
                  </h4>
                  <div className="space-y-2 min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg p-3">
                    {disabledWidgets.map((widget) => (
                      <div
                        key={widget.id}
                        className="flex items-center justify-between p-3 border rounded-lg border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <h5 className="font-medium text-gray-700 text-sm">
                              {widget.name}
                            </h5>
                            <p className="text-xs text-gray-500">
                              {widget.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleWidget(widget.id)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Activar widget"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {disabledWidgets.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Eye className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Todos los widgets están activos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Layout className="w-4 h-4 mr-2" />
                  Vista Previa del Dashboard
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Orden de aparición de los widgets en tu dashboard:
                </p>
                <div className="flex flex-wrap gap-2">
                  {enabledWidgets.map((widget, index) => (
                      <div key={widget.id} className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-blue-200">
                        <span className="text-xs font-medium text-blue-800">
                          {index + 1}
                        </span>
                        <span className="text-xs text-blue-700">{widget.name}</span>
                      </div>
                    ))}
                  {enabledWidgets.length === 0 && (
                    <p className="text-sm text-blue-600 italic">
                      No hay widgets habilitados para mostrar
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Personalización Visual
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ajusta la apariencia visual de tu dashboard.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Tema de Color</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {['Azul', 'Verde', 'Púrpura'].map(color => (
                      <button
                        key={color}
                        className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="w-full h-8 rounded mb-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <span className="text-sm text-gray-700">{color}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Densidad de Información</h4>
                  <div className="space-y-2">
                    {['Compacto', 'Normal', 'Espacioso'].map(density => (
                      <label key={density} className="flex items-center space-x-3">
                        <input type="radio" name="density" className="text-blue-600" />
                        <span className="text-sm text-gray-700">{density}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Preferencias Generales
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configura el comportamiento del dashboard.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Actualización Automática</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="text-blue-600" defaultChecked />
                      <span className="text-sm text-gray-700">Actualizar datos automáticamente</span>
                    </label>
                    <div className="ml-6">
                      <label className="block text-sm text-gray-700 mb-1">Intervalo de actualización</label>
                      <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                        <option>30 segundos</option>
                        <option>1 minuto</option>
                        <option>5 minutos</option>
                        <option>15 minutos</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Filtro Temporal por Defecto</h4>
                  <select className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full">
                    <option>Esta Semana</option>
                    <option>Este Mes</option>
                    <option>Este Trimestre</option>
                    <option>Este Año</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar por defecto
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={cn(
                'flex items-center px-4 py-2 rounded-lg transition-colors',
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
            >
              <Save className="w-4 h-4 mr-2" />
              {hasChanges ? 'Guardar Cambios' : 'Sin Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})