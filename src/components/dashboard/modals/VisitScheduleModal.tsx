import { useState, useEffect, FormEvent } from 'react'
import { X, Calendar, Clock, User, FileText } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'

interface VisitFormData {
  projectId: string
  date: string
  time: string
  visitor: string
  purpose: string
  notes: string
}

interface VisitScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  projects: Array<{ id: string; name: string }>
  onSubmit: (data: VisitFormData) => Promise<void>
}

/**
 * VisitScheduleModal - Modal for scheduling site visits
 * 
 * Features:
 * - Form validation with error messages
 * - Project selector dropdown
 * - Date and time pickers
 * - Visitor information fields
 * - Purpose and notes fields
 * - Keyboard shortcuts (Esc to close, Enter to submit)
 * - Theme-aware styling
 * - Loading states
 * - Accessibility compliant
 * 
 * @example
 * ```tsx
 * <VisitScheduleModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   projects={projectsList}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
export function VisitScheduleModal({
  isOpen,
  onClose,
  projects,
  onSubmit
}: VisitScheduleModalProps) {
  const { isDarkMode } = useDarkMode()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof VisitFormData, string>>>({})
  
  const [formData, setFormData] = useState<VisitFormData>({
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    visitor: '',
    purpose: '',
    notes: ''
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        visitor: '',
        purpose: '',
        notes: ''
      })
      setErrors({})
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof VisitFormData, string>> = {}

    if (!formData.projectId) {
      newErrors.projectId = 'Debe seleccionar un proyecto'
    }

    if (!formData.date) {
      newErrors.date = 'Debe seleccionar una fecha'
    }

    if (!formData.time) {
      newErrors.time = 'Debe seleccionar una hora'
    }

    if (!formData.visitor.trim()) {
      newErrors.visitor = 'El nombre del visitante es requerido'
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'El propósito de la visita es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error scheduling visit:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="visit-modal-title"
    >
      <div 
        className={cn(
          'w-full max-w-md rounded-lg shadow-xl transition-colors duration-200',
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h2 
              id="visit-modal-title"
              className={cn(
                'text-lg font-semibold transition-colors duration-200',
                isDarkMode ? 'text-white' : 'text-gray-900'
              )}
            >
              Agendar Visita
            </h2>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg transition-colors duration-200',
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            )}
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Selection */}
          <div>
            <label 
              htmlFor="projectId"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Proyecto *
            </label>
            <select
              id="projectId"
              value={formData.projectId}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, projectId: e.target.value }))
                if (errors.projectId) setErrors(prev => ({ ...prev, projectId: undefined }))
              }}
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.projectId
                  ? 'border-red-500'
                  : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              )}
              required
            >
              <option value="">Selecciona un proyecto</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-500">{errors.projectId}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="date"
                className={cn(
                  'block text-sm font-medium mb-1 transition-colors duration-200',
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Fecha *
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, date: e.target.value }))
                  if (errors.date) setErrors(prev => ({ ...prev, date: undefined }))
                }}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.date
                    ? 'border-red-500'
                    : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                )}
                required
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="time"
                className={cn(
                  'block text-sm font-medium mb-1 transition-colors duration-200',
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Hora *
              </label>
              <input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, time: e.target.value }))
                  if (errors.time) setErrors(prev => ({ ...prev, time: undefined }))
                }}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.time
                    ? 'border-red-500'
                    : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                )}
                required
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-500">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Visitor */}
          <div>
            <label 
              htmlFor="visitor"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Visitante *
            </label>
            <div className="relative">
              <User className={cn(
                'absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              )} />
              <input
                id="visitor"
                type="text"
                value={formData.visitor}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, visitor: e.target.value }))
                  if (errors.visitor) setErrors(prev => ({ ...prev, visitor: undefined }))
                }}
                placeholder="Nombre del visitante"
                className={cn(
                  'w-full pl-10 pr-3 py-2 rounded-lg border transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.visitor
                    ? 'border-red-500'
                    : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                )}
                required
              />
            </div>
            {errors.visitor && (
              <p className="mt-1 text-sm text-red-500">{errors.visitor}</p>
            )}
          </div>

          {/* Purpose */}
          <div>
            <label 
              htmlFor="purpose"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Propósito *
            </label>
            <input
              id="purpose"
              type="text"
              value={formData.purpose}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, purpose: e.target.value }))
                if (errors.purpose) setErrors(prev => ({ ...prev, purpose: undefined }))
              }}
              placeholder="Motivo de la visita"
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.purpose
                  ? 'border-red-500'
                  : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              )}
              required
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-500">{errors.purpose}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label 
              htmlFor="notes"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Información adicional sobre la visita"
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none',
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500',
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-white transition-colors duration-200',
                'bg-purple-600 hover:bg-purple-700',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSubmitting ? 'Agendando...' : 'Agendar Visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
