import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, FileText, Edit, Copy, CheckCircle, XCircle } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'
import { PresupuestoEditor } from '@/components/presupuestos/PresupuestoEditor'
import { EnviarPresupuestoModal } from '@/components/presupuestos/EnviarPresupuestoModal'
import { ConversionConfirmModal } from '@/components/presupuestos/ConversionConfirmModal'
import { ComparadorVersiones } from '@/components/presupuestos/ComparadorVersiones'
import { presupuestoService } from '@/services/presupuesto.service'
import type { Presupuesto, Fase } from '@/types/presupuesto.types'

/**
 * PresupuestoViewPage - Vista detallada de un presupuesto
 * 
 * Permite:
 * - Ver y editar presupuesto
 * - Enviar al cliente
 * - Crear versiones
 * - Convertir a proyecto (si está aprobado)
 * - Comparar versiones
 */
export function PresupuestoViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isDarkMode } = useDarkMode()
  
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showEnviarModal, setShowEnviarModal] = useState(false)
  const [showConversionModal, setShowConversionModal] = useState(false)
  const [showComparador, setShowComparador] = useState(false)

  useEffect(() => {
    loadPresupuesto()
  }, [id])

  const loadPresupuesto = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const data = await presupuestoService.getPresupuesto(id)
      setPresupuesto(data)
    } catch (error) {
      console.error('Error loading presupuesto:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFasesChange = async (fases: Fase[]) => {
    if (!presupuesto) return
    
    try {
      setSaving(true)
      const updated = { ...presupuesto, fases }
      await presupuestoService.updatePresupuesto(updated.id, updated)
      setPresupuesto(updated)
    } catch (error) {
      console.error('Error updating presupuesto:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCrearVersion = async () => {
    if (!presupuesto) return
    
    try {
      const nuevaVersion = await presupuestoService.crearVersionPresupuesto(presupuesto.id)
      navigate(`/presupuestos/${nuevaVersion.id}`)
    } catch (error) {
      console.error('Error creating version:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!presupuesto) {
    return (
      <div className="text-center py-12">
        <p className={cn('text-lg', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
          Presupuesto no encontrado
        </p>
        <button
          onClick={() => navigate('/presupuestos')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver a Presupuestos
        </button>
      </div>
    )
  }

  const canEdit = presupuesto.estado === 'borrador'
  const canSend = presupuesto.estado === 'borrador'
  const canConvert = presupuesto.estado === 'aprobado' && !presupuesto.estadoDetalle.convertidoAProyecto

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/presupuestos')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={cn('text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {presupuesto.nombre}
            </h1>
            <p className={cn('text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
              {presupuesto.numero} - Versión {presupuesto.version}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                isEditing
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              <Edit className="w-4 h-4" />
              <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
            </button>
          )}

          {canSend && (
            <button
              onClick={() => setShowEnviarModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          )}

          {canConvert && (
            <button
              onClick={() => setShowConversionModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Convertir a Proyecto</span>
            </button>
          )}

          <button
            onClick={handleCrearVersion}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
              isDarkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            <Copy className="w-4 h-4" />
            <span>Nueva Versión</span>
          </button>

          {presupuesto.version > 1 && (
            <button
              onClick={() => setShowComparador(true)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
            >
              <FileText className="w-4 h-4" />
              <span>Comparar Versiones</span>
            </button>
          )}
        </div>
      </div>

      {/* Estado Badge */}
      <div className="flex items-center space-x-2">
        <span
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            presupuesto.estado === 'borrador' && 'bg-gray-200 text-gray-700',
            presupuesto.estado === 'enviado' && 'bg-blue-100 text-blue-700',
            presupuesto.estado === 'aprobado' && 'bg-green-100 text-green-700',
            presupuesto.estado === 'rechazado' && 'bg-red-100 text-red-700',
            presupuesto.estado === 'expirado' && 'bg-orange-100 text-orange-700',
            presupuesto.estado === 'convertido' && 'bg-purple-100 text-purple-700'
          )}
        >
          {presupuesto.estado.charAt(0).toUpperCase() + presupuesto.estado.slice(1)}
        </span>
      </div>

      {/* Editor */}
      <div className={cn(
        'rounded-lg border p-6',
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      )}>
        <PresupuestoEditor
          fases={presupuesto.fases}
          cliente={presupuesto.cliente}
          onChange={handleFasesChange}
        />
      </div>

      {/* Modals */}
      {showEnviarModal && (
        <EnviarPresupuestoModal
          presupuesto={presupuesto}
          isOpen={showEnviarModal}
          onClose={() => setShowEnviarModal(false)}
          onEnviar={async (token, pdfBlob) => {
            // Handle sending logic - the service will update the status
            await presupuestoService.enviarPresupuesto(presupuesto.id)
            setShowEnviarModal(false)
            loadPresupuesto()
          }}
        />
      )}

      {showConversionModal && (
        <ConversionConfirmModal
          presupuesto={presupuesto}
          isOpen={showConversionModal}
          onClose={() => setShowConversionModal(false)}
          onSuccess={(proyectoId) => {
            setShowConversionModal(false)
            navigate(`/projects/${proyectoId}`)
          }}
        />
      )}

      {showComparador && presupuesto.version > 1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={cn(
            'max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-lg',
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          )}>
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className={cn('text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                Comparar Versiones
              </h2>
              <button
                onClick={() => setShowComparador(false)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                )}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className={cn('text-sm mb-4', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                Comparación de versiones disponible próximamente. Por ahora, puedes ver el historial de cambios en cada versión.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
