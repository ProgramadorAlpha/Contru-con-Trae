import { useState, useEffect, FormEvent } from 'react'
import { X, DollarSign, TrendingUp, Search } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'
import type { CreateIncomeDTO, PaymentMethod } from '@/types/income'

interface AddIncomeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: CreateIncomeDTO) => Promise<void>
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

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'bank_transfer', label: 'Transferencia Bancaria' },
  { value: 'check', label: 'Cheque' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'credit_card', label: 'Tarjeta de Crédito' },
  { value: 'other', label: 'Otro' }
]

interface FormData {
  projectId: string
  amount: string
  date: string
  description: string
  paymentMethod: PaymentMethod | ''
  reference: string
  invoiceNumber: string
}

interface FormErrors {
  projectId?: string
  amount?: string
  date?: string
  description?: string
}

/**
 * AddIncomeModal - Modal for adding income entries
 * 
 * Features:
 * - Project selector with search functionality
 * - Amount input with currency formatting
 * - Date picker with validation (max 1 day in future)
 * - Description field with minimum length validation
 * - Optional payment method, reference, and invoice number
 * - Real-time validation
 * - Keyboard shortcuts (Esc to close, Enter to submit)
 * - Theme-aware styling
 * - Loading states
 * - Accessibility compliant
 */
export function AddIncomeModal({
  isOpen,
  onClose,
  onSuccess
}: AddIncomeModalProps) {
  const { isDarkMode } = useDarkMode()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    projectId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: '',
    reference: '',
    invoiceNumber: ''
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: '',
        reference: '',
        invoiceNumber: ''
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

    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria'
    } else {
      const selectedDate = new Date(formData.date)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(23, 59, 59, 999)

      if (selectedDate > tomorrow) {
        newErrors.date = 'La fecha no puede ser más de 1 día en el futuro'
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria'
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'La descripción debe tener al menos 5 caracteres'
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
      const submitData: CreateIncomeDTO = {
        projectId: formData.projectId,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description.trim(),
        ...(formData.paymentMethod && { paymentMethod: formData.paymentMethod as PaymentMethod }),
        ...(formData.reference.trim() && { reference: formData.reference.trim() }),
        ...(formData.invoiceNumber.trim() && { invoiceNumber: formData.invoiceNumber.trim() })
      }

      await onSuccess(submitData)
      onClose()
    } catch (error) {
      console.error('Error submitting income:', error)
      // Error will be handled by parent component
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
      aria-labelledby="add-income-modal-title"
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
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 
              id="add-income-modal-title"
              className={cn(
                'text-lg font-semibold transition-colors duration-200',
                isDarkMode ? 'text-white' : 'text-gray-900'
              )}
            >
              Añadir Ingreso
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
          {/* Project Selection with Search */}
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
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.projectId
                    ? 'border-red-500'
                    : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                )}
                aria-required="true"
                aria-invalid={!!errors.projectId}
                aria-describedby={errors.projectId ? 'project-error' : undefined}
              />
            </div>
            
            {/* Project Dropdown */}
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
              <p id="project-error" className="mt-1 text-sm text-red-500">{errors.projectId}</p>
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
                aria-required="true"
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
              />
            </div>
            {errors.amount && (
              <p id="amount-error" className="mt-1 text-sm text-red-500">{errors.amount}</p>
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
              aria-required="true"
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? 'date-error' : undefined}
            />
            {errors.date && (
              <p id="date-error" className="mt-1 text-sm text-red-500">{errors.date}</p>
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
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }))
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }))
              }}
              placeholder="Describe el ingreso (mínimo 5 caracteres)"
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200 resize-none',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.description
                  ? 'border-red-500'
                  : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              )}
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Payment Method (Optional) */}
          <div>
            <label 
              htmlFor="paymentMethod"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Método de Pago
            </label>
            <select
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod | '' }))}
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              )}
            >
              <option value="">Seleccionar (opcional)</option>
              {PAYMENT_METHODS.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reference (Optional) */}
          <div>
            <label 
              htmlFor="reference"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Referencia
            </label>
            <input
              id="reference"
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="Número de transacción, cheque, etc."
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              )}
            />
          </div>

          {/* Invoice Number (Optional) */}
          <div>
            <label 
              htmlFor="invoiceNumber"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Número de Factura
            </label>
            <input
              id="invoiceNumber"
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              placeholder="Número de factura asociada"
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
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
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                'bg-blue-600 hover:bg-blue-700',
                (isSubmitting || Object.keys(errors).length > 0) && 'opacity-50 cursor-not-allowed'
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
