import { useState, useEffect, FormEvent } from 'react'
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'

export type FinanceType = 'income' | 'expense'

interface FinanceFormData {
  projectId: string
  amount: string
  date: string
  description: string
  category: string
}

interface FinanceModalProps {
  isOpen: boolean
  onClose: () => void
  type: FinanceType
  projects: Array<{ id: string; name: string }>
  onSubmit: (data: FinanceFormData) => Promise<void>
}

const INCOME_CATEGORIES = [
  'General',
  'Pago de Cliente',
  'Anticipo',
  'Pago Final',
  'Otros Ingresos'
]

const EXPENSE_CATEGORIES = [
  'General',
  'Materiales',
  'Mano de Obra',
  'Equipos',
  'Transporte',
  'Servicios',
  'Otros Gastos'
]

/**
 * FinanceModal - Unified modal for income and expense registration
 * 
 * Features:
 * - Supports both income and expense types
 * - Form validation with error messages
 * - Project selector dropdown
 * - Currency formatting in amount input
 * - Date picker
 * - Category selection
 * - Keyboard shortcuts (Esc to close, Enter to submit)
 * - Theme-aware styling
 * - Loading states
 * - Accessibility compliant
 * 
 * @example
 * ```tsx
 * <FinanceModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   type="income"
 *   projects={projectsList}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
export function FinanceModal({
  isOpen,
  onClose,
  type,
  projects,
  onSubmit
}: FinanceModalProps) {
  const { isDarkMode } = useDarkMode()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FinanceFormData, string>>>({})
  
  const [formData, setFormData] = useState<FinanceFormData>({
    projectId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'General'
  })

  // Reset form when modal opens/closes or type changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'General'
      })
      setErrors({})
    }
  }, [isOpen, type])

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
    const newErrors: Partial<Record<keyof FinanceFormData, string>> = {}

    if (!formData.projectId) {
      newErrors.projectId = 'Debe seleccionar un proyecto'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    if (!formData.date) {
      newErrors.date = 'Debe seleccionar una fecha'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
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
      console.error('Error submitting finance data:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const sanitized = value.replace(/[^\d.]/g, '')
    // Ensure only one decimal point
    const parts = sanitized.split('.')
    const formatted = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : sanitized
    
    setFormData(prev => ({ ...prev, amount: formatted }))
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }))
    }
  }

  if (!isOpen) return null

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const Icon = type === 'income' ? TrendingUp : TrendingDown
  const title = type === 'income' ? 'Añadir Ingreso' : 'Registrar Gasto'
  const colorClass = type === 'income' ? 'text-green-600' : 'text-red-600'
  const bgColorClass = type === 'income' 
    ? 'bg-green-600 hover:bg-green-700' 
    : 'bg-red-600 hover:bg-red-700'

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="finance-modal-title"
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
            <div className={cn(
              'p-2 rounded-lg',
              type === 'income' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            )}>
              <Icon className={cn('w-5 h-5', colorClass)} />
            </div>
            <h2 
              id="finance-modal-title"
              className={cn(
                'text-lg font-semibold transition-colors duration-200',
                isDarkMode ? 'text-white' : 'text-gray-900'
              )}
            >
              {title}
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

          {/* Amount */}
          <div>
            <label 
              htmlFor="amount"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Monto *
            </label>
            <div className="relative">
              <DollarSign className={cn(
                'absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              )} />
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className={cn(
                  'w-full pl-10 pr-3 py-2 rounded-lg border transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.amount
                    ? 'border-red-500'
                    : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                )}
                required
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

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

          {/* Description */}
          <div>
            <label 
              htmlFor="description"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Descripción *
            </label>
            <input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }))
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }))
              }}
              placeholder="Describe el movimiento"
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.description
                  ? 'border-red-500'
                  : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              )}
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label 
              htmlFor="category"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Categoría
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              )}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
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
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                type === 'income' ? 'focus:ring-green-500' : 'focus:ring-red-500',
                bgColorClass,
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
