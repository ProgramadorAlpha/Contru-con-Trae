import { useState, useEffect, FormEvent } from 'react'
import { X, CalendarClock, Search, Clock } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'
import type { CreateVisitDTO } from '@/types/visit'

interface ScheduleVisitModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: CreateVisitDTO) => Promise<void>
}

interface Project {
  id: string
  name: string
}

// Mock projects for development
const MOCK_PROJECTS: Project[] = [
  { id: 'proj-001', name: 'Construcción Edificio Central' },
  { id: 'proj-002', name: 'Remodelación Casa Residencial' },
  { id: 'proj-003', name: 'Ampliación Oficinas Corporativas' },
  { id: 'proj-004', name: 'Construcción Centro Comercial' },
  { id: 'proj-005', name: 'Renovación Hotel Boutique' }
]

const VISIT_TYPES = [
  { value: 'inspection', label: 'Inspección' },
  { value: 'supervision', label: 'Supervisión' },
  { value: 'client_meeting', label: 'Reunión con Cliente' },
  { value: 'material_delivery', label: 'Entrega de Materiales' },
  { value: 'other', label: 'Otro' }
]

interface FormData {
  projectId: string
  date: string
  time: string
  type: string
  notes: string
}

interface FormErrors {
  projectId?: string
  date?: string
  time?: string
  type?: string
  dateTime?: string
}

/**
 * ScheduleVisitModal - Modal for scheduling project visits
 * 
 * Features:
 * - Project selector with search functionality
 * - Date picker with future date validation
 * - Time picker with future time validation
 * - Visit type selector
 * - Optional notes field
 * - Real-time validation
 * - Prevents duplicate visits
 * - Keyboard shortcuts (Esc to close, Enter to submit)
 * - Theme-aware styling
 * - Loading states
 * - Accessibility compliant
 */
export function ScheduleVisitModal({
  isOpen,
  onClose,
  onSuccess
}: ScheduleVisitModalProps) {
  const { isDarkMode } = useDarkMode()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  
  // Get tomorrow's date as minimum date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]
  
  const [formData, setFormData] = useState<FormData>({
    projectId: '',
    date: minDate,
    time: '09:00',
    type: '',
    notes: ''
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const minDate = tomorrow.toISOString().split('T')[0]
      
      setFormData({
        projectId: '',
        date: minDate,
        time: '09:00',
        type: '',
        notes: ''
      })
      setErrors({})
      setSearchTerm('')
      setShowProjectDropdown(false)
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showProjectDropdown) {
          setShowProjectDropdown(false)
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, showProjectDropdown, onClose])

  // Filter projects based on search
  const filteredProjects = MOCK_PROJECTS.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedProject = MOCK_PROJECTS.find(p => p.id === formData.projectId)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.projectId) {
      newErrors.projectId = 'El proyecto es obligatorio'
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria'
    }

    if (!formData.time) {
      newErrors.time = 'La hora es obligatoria'
    }

    // Validate that date and time are in the future
    if (formData.date && formData.time) {
      const visitDateTime = new Date(`${formData.date}T${formData.time}`)
      const now = new Date()
      
      if (visitDateTime <= now) {
        newErrors.dateTime = 'La fecha y hora deben ser futuras'
      }
    }

    if (!formData.type) {
      newErrors.type = 'El tipo de visita es obligatorio'
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
      const submitData: CreateVisitDTO = {
        projectId: formData.projectId,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        ...(formData.notes.trim() && { notes: formData.notes.trim() })
      }

      await onSuccess(submitData)
      onClose()
    } catch (error) {
      console.error('Error scheduling visit:', error)
      // Error will be handled by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProjectSelect = (projectId: string) => {
    setFormData(prev => ({ ...prev, projectId }))
    setShowProjectDropdown(false)
    setSearchTerm('')
    if (errors.projectId) {
      setErrors(prev => ({ ...prev, projectId: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-visit-modal-title"
    >
      <div 
        className={cn(
          'w-full max-w-md rounded-lg shadow-xl transition-colors duration-200 max-h-[90vh] overflow-y-auto',
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <CalendarClock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 
              id="schedule-visit-modal-title"
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
          <div className="relative">
            <label 
              htmlFor="project-search"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Proyecto *
            </label>
            <div className="relative">
              <Search className={cn(
                'absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              )} />
              <input
                id="project-search"
                type="text"
                value={selectedProject ? selectedProject.name : searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowProjectDropdown(true)
                  if (selectedProject) {
                    setFormData(prev => ({ ...prev, projectId: '' }))
                  }
                }}
                onFocus={() => setShowProjectDropdown(true)}
                placeholder="Buscar proyecto..."
                className={cn(
                  'w-full pl-10 pr-3 py-2 rounded-lg border transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500',
                  errors.projectId
                    ? 'border-red-500'
                    : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                )}
                aria-required="true"
                aria-invalid={!!errors.projectId}
              />
            </div>
            
            {showProjectDropdown && filteredProjects.length > 0 && (
              <div className={cn(
                'absolute z-20 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto',
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              )}>
                {filteredProjects.map(project => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => handleProjectSelect(project.id)}
                    className={cn(
                      'w-full text-left px-4 py-2 transition-colors duration-200',
                      isDarkMode
                        ? 'hover:bg-gray-600 text-white'
                        : 'hover:bg-gray-100 text-gray-900'
                    )}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            )}
            
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-500">{errors.projectId}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
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
                min={minDate}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, date: e.target.value }))
                  if (errors.date || errors.dateTime) {
                    setErrors(prev => ({ ...prev, date: undefined, dateTime: undefined }))
                  }
                }}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500',
                  errors.date
                    ? 'border-red-500'
                    : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                )}
                aria-required="true"
                aria-invalid={!!errors.date}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            {/* Time */}
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
              <div className="relative">
                <Clock className={cn(
                  'absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none',
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                )} />
                <input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, time: e.target.value }))
                    if (errors.time || errors.dateTime) {
                      setErrors(prev => ({ ...prev, time: undefined, dateTime: undefined }))
                    }
                  }}
                  className={cn(
                    'w-full pl-10 pr-3 py-2 rounded-lg border transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500',
                    errors.time
                      ? 'border-red-500'
                      : isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                  )}
                  aria-required="true"
                  aria-invalid={!!errors.time}
                />
              </div>
              {errors.time && (
                <p className="mt-1 text-sm text-red-500">{errors.time}</p>
              )}
            </div>
          </div>

          {/* DateTime validation error */}
          {errors.dateTime && (
            <p className="text-sm text-red-500">{errors.dateTime}</p>
          )}

          {/* Visit Type */}
          <div>
            <label 
              htmlFor="type"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Tipo de Visita *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, type: e.target.value }))
                if (errors.type) setErrors(prev => ({ ...prev, type: undefined }))
              }}
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-purple-500',
                errors.type
                  ? 'border-red-500'
                  : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              )}
              aria-required="true"
              aria-invalid={!!errors.type}
            >
              <option value="">Seleccionar tipo</option>
              {VISIT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label 
              htmlFor="notes"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Notas
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales sobre la visita (opcional)"
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200 resize-none',
                'focus:outline-none focus:ring-2 focus:ring-purple-500',
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
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-white transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500',
                'bg-purple-600 hover:bg-purple-700',
                (isSubmitting || Object.keys(errors).length > 0) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSubmitting ? 'Agendando...' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
