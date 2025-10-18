import { useState, useEffect, FormEvent } from 'react'
import { X, DollarSign, FileText, Search, Plus } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'
import type { CreateExpenseDTO } from '@/types/expenses'

interface RegisterExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: CreateExpenseDTO) => Promise<void>
}

interface Project {
  id: string
  name: string
}

interface CostCode {
  id: string
  code: string
  name: string
  category: string
}

interface Supplier {
  id: string
  name: string
}

// Mock data for development
const MOCK_PROJECTS: Project[] = [
  { id: 'proj-001', name: 'Construcción Edificio Central' },
  { id: 'proj-002', name: 'Remodelación Casa Residencial' },
  { id: 'proj-003', name: 'Ampliación Oficinas Corporativas' },
  { id: 'proj-004', name: 'Construcción Centro Comercial' },
  { id: 'proj-005', name: 'Renovación Hotel Boutique' }
]

const EXPENSE_CATEGORIES = [
  { value: 'materials', label: 'Materiales' },
  { value: 'labor', label: 'Mano de Obra' },
  { value: 'subcontracts', label: 'Subcontratos' },
  { value: 'equipment', label: 'Equipos' },
  { value: 'transport', label: 'Transporte' },
  { value: 'other', label: 'Otros' }
]

// Mock cost codes by category
const MOCK_COST_CODES: Record<string, CostCode[]> = {
  materials: [
    { id: 'cc-001', code: '02.01.01', name: 'Cemento', category: 'materials' },
    { id: 'cc-002', code: '02.01.02', name: 'Arena y Grava', category: 'materials' },
    { id: 'cc-003', code: '02.01.03', name: 'Acero de Refuerzo', category: 'materials' }
  ],
  labor: [
    { id: 'cc-004', code: '03.01.01', name: 'Albañilería', category: 'labor' },
    { id: 'cc-005', code: '03.01.02', name: 'Carpintería', category: 'labor' },
    { id: 'cc-006', code: '03.01.03', name: 'Electricidad', category: 'labor' }
  ],
  subcontracts: [
    { id: 'cc-007', code: '04.01.01', name: 'Instalaciones Eléctricas', category: 'subcontracts' },
    { id: 'cc-008', code: '04.01.02', name: 'Instalaciones Sanitarias', category: 'subcontracts' },
    { id: 'cc-009', code: '04.01.03', name: 'Acabados', category: 'subcontracts' }
  ],
  equipment: [
    { id: 'cc-010', code: '05.01.01', name: 'Maquinaria Pesada', category: 'equipment' },
    { id: 'cc-011', code: '05.01.02', name: 'Herramientas', category: 'equipment' },
    { id: 'cc-012', code: '05.01.03', name: 'Equipos de Seguridad', category: 'equipment' }
  ],
  transport: [
    { id: 'cc-013', code: '06.01.01', name: 'Transporte de Materiales', category: 'transport' },
    { id: 'cc-014', code: '06.01.02', name: 'Transporte de Personal', category: 'transport' }
  ],
  other: [
    { id: 'cc-015', code: '07.01.01', name: 'Gastos Administrativos', category: 'other' },
    { id: 'cc-016', code: '07.01.02', name: 'Gastos Varios', category: 'other' }
  ]
}

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup-001', name: 'Materiales Construcción SA' },
  { id: 'sup-002', name: 'Ferretería El Constructor' },
  { id: 'sup-003', name: 'Distribuidora de Cemento' },
  { id: 'sup-004', name: 'Aceros y Metales' },
  { id: 'sup-005', name: 'Equipos y Herramientas Pro' }
]

interface FormData {
  projectId: string
  category: string
  costCodeId: string
  amount: string
  date: string
  supplierId: string
  description: string
  invoiceNumber: string
}

interface FormErrors {
  projectId?: string
  category?: string
  costCodeId?: string
  amount?: string
  date?: string
  supplierId?: string
  description?: string
}

/**
 * RegisterExpenseModal - Modal for registering expenses
 * 
 * Features:
 * - Project selector with search functionality
 * - Category selector (determines available cost codes)
 * - Cost code selector (dependent on category)
 * - Supplier selector with search and quick creation
 * - Amount input with currency formatting
 * - Date picker with validation
 * - Description field with minimum length validation
 * - Optional invoice number
 * - Real-time validation
 * - Keyboard shortcuts (Esc to close, Enter to submit)
 * - Theme-aware styling
 * - Loading states
 * - Accessibility compliant
 */
export function RegisterExpenseModal({
  isOpen,
  onClose,
  onSuccess
}: RegisterExpenseModalProps) {
  const { isDarkMode } = useDarkMode()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
  const [showNewSupplierInput, setShowNewSupplierInput] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')
  
  const [formData, setFormData] = useState<FormData>({
    projectId: '',
    category: '',
    costCodeId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    supplierId: '',
    description: '',
    invoiceNumber: ''
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectId: '',
        category: '',
        costCodeId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        supplierId: '',
        description: '',
        invoiceNumber: ''
      })
      setErrors({})
      setProjectSearchTerm('')
      setSupplierSearchTerm('')
      setShowProjectDropdown(false)
      setShowSupplierDropdown(false)
      setShowNewSupplierInput(false)
      setNewSupplierName('')
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showProjectDropdown) {
          setShowProjectDropdown(false)
        } else if (showSupplierDropdown) {
          setShowSupplierDropdown(false)
        } else if (showNewSupplierInput) {
          setShowNewSupplierInput(false)
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, showProjectDropdown, showSupplierDropdown, showNewSupplierInput, onClose])

  // Reset cost code when category changes
  useEffect(() => {
    if (formData.category) {
      setFormData(prev => ({ ...prev, costCodeId: '' }))
      if (errors.costCodeId) {
        setErrors(prev => ({ ...prev, costCodeId: undefined }))
      }
    }
  }, [formData.category])

  // Filter projects based on search
  const filteredProjects = MOCK_PROJECTS.filter(project =>
    project.name.toLowerCase().includes(projectSearchTerm.toLowerCase())
  )

  // Filter suppliers based on search
  const filteredSuppliers = MOCK_SUPPLIERS.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  )

  const selectedProject = MOCK_PROJECTS.find(p => p.id === formData.projectId)
  const selectedSupplier = MOCK_SUPPLIERS.find(s => s.id === formData.supplierId)
  const availableCostCodes = formData.category ? MOCK_COST_CODES[formData.category] || [] : []
  const selectedCostCode = availableCostCodes.find(cc => cc.id === formData.costCodeId)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.projectId) {
      newErrors.projectId = 'El proyecto es obligatorio'
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es obligatoria'
    }

    if (!formData.costCodeId) {
      newErrors.costCodeId = 'El código de costo es obligatorio'
    }

    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria'
    }

    if (!formData.supplierId) {
      newErrors.supplierId = 'El proveedor es obligatorio'
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
      const submitData: CreateExpenseDTO = {
        projectId: formData.projectId,
        projectName: selectedProject!.name,
        costCodeId: formData.costCodeId,
        supplierId: formData.supplierId,
        supplierName: selectedSupplier!.name,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        invoiceDate: formData.date,
        ...(formData.invoiceNumber.trim() && { invoiceNumber: formData.invoiceNumber.trim() })
      }

      await onSuccess(submitData)
      onClose()
    } catch (error) {
      console.error('Error submitting expense:', error)
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
    setProjectSearchTerm('')
    if (errors.projectId) {
      setErrors(prev => ({ ...prev, projectId: undefined }))
    }
  }

  const handleSupplierSelect = (supplierId: string) => {
    setFormData(prev => ({ ...prev, supplierId }))
    setShowSupplierDropdown(false)
    setSupplierSearchTerm('')
    if (errors.supplierId) {
      setErrors(prev => ({ ...prev, supplierId: undefined }))
    }
  }

  const handleCreateNewSupplier = () => {
    if (newSupplierName.trim().length >= 3) {
      // In a real app, this would call an API to create the supplier
      const newSupplierId = `sup-new-${Date.now()}`
      MOCK_SUPPLIERS.push({ id: newSupplierId, name: newSupplierName.trim() })
      handleSupplierSelect(newSupplierId)
      setShowNewSupplierInput(false)
      setNewSupplierName('')
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-expense-modal-title"
    >
      <div 
        className={cn(
          'w-full max-w-2xl rounded-lg shadow-xl transition-colors duration-200 max-h-[90vh] overflow-y-auto',
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
              <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 
              id="register-expense-modal-title"
              className={cn(
                'text-lg font-semibold transition-colors duration-200',
                isDarkMode ? 'text-white' : 'text-gray-900'
              )}
            >
              Registrar Gasto
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  value={selectedProject ? selectedProject.name : projectSearchTerm}
                  onChange={(e) => {
                    setProjectSearchTerm(e.target.value)
                    setShowProjectDropdown(true)
                    if (selectedProject) {
                      setFormData(prev => ({ ...prev, projectId: '' }))
                    }
                  }}
                  onFocus={() => setShowProjectDropdown(true)}
                  placeholder="Buscar proyecto..."
                  className={cn(
                    'w-full pl-10 pr-3 py-2 rounded-lg border transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-red-500',
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

            {/* Category Selection */}
            <div>
              <label 
                htmlFor="category"
                className={cn(
                  'block text-sm font-medium mb-1 transition-colors duration-200',
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Categoría *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, category: e.target.value }))
                  if (errors.category) setErrors(prev => ({ ...prev, category: undefined }))
                }}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-red-500',
                  errors.category
                    ? 'border-red-500'
                    : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                )}
                aria-required="true"
                aria-invalid={!!errors.category}
              >
                <option value="">Seleccionar categoría</option>
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Cost Code Selection */}
            <div>
              <label 
                htmlFor="costCode"
                className={cn(
                  'block text-sm font-medium mb-1 transition-colors duration-200',
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Código de Costo *
              </label>
              <select
                id="costCode"
                value={formData.costCodeId}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, costCodeId: e.target.value }))
                  if (errors.costCodeId) setErrors(prev => ({ ...prev, costCodeId: undefined }))
                }}
                disabled={!formData.category}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-red-500',
                  errors.costCodeId
                    ? 'border-red-500'
                    : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-900 disabled:opacity-50'
                )}
                aria-required="true"
                aria-invalid={!!errors.costCodeId}
              >
                <option value="">
                  {formData.category ? 'Seleccionar código' : 'Primero selecciona categoría'}
                </option>
                {availableCostCodes.map(cc => (
                  <option key={cc.id} value={cc.id}>
                    {cc.code} - {cc.name}
                  </option>
                ))}
              </select>
              {errors.costCodeId && (
                <p className="mt-1 text-sm text-red-500">{errors.costCodeId}</p>
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
                    'focus:outline-none focus:ring-2 focus:ring-red-500',
                    errors.amount
                      ? 'border-red-500'
                      : isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  )}
                  aria-required="true"
                  aria-invalid={!!errors.amount}
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
                  'focus:outline-none focus:ring-2 focus:ring-red-500',
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
          </div>

          {/* Supplier Selection with Quick Create */}
          <div className="relative">
            <label 
              htmlFor="supplier-search"
              className={cn(
                'block text-sm font-medium mb-1 transition-colors duration-200',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Proveedor *
            </label>
            {!showNewSupplierInput ? (
              <>
                <div className="relative">
                  <Search className={cn(
                    'absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none',
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  )} />
                  <input
                    id="supplier-search"
                    type="text"
                    value={selectedSupplier ? selectedSupplier.name : supplierSearchTerm}
                    onChange={(e) => {
                      setSupplierSearchTerm(e.target.value)
                      setShowSupplierDropdown(true)
                      if (selectedSupplier) {
                        setFormData(prev => ({ ...prev, supplierId: '' }))
                      }
                    }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    placeholder="Buscar proveedor..."
                    className={cn(
                      'w-full pl-10 pr-3 py-2 rounded-lg border transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-red-500',
                      errors.supplierId
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    )}
                    aria-required="true"
                    aria-invalid={!!errors.supplierId}
                  />
                </div>
                
                {showSupplierDropdown && (
                  <div className={cn(
                    'absolute z-20 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto',
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  )}>
                    {filteredSuppliers.map(supplier => (
                      <button
                        key={supplier.id}
                        type="button"
                        onClick={() => handleSupplierSelect(supplier.id)}
                        className={cn(
                          'w-full text-left px-4 py-2 transition-colors duration-200',
                          isDarkMode
                            ? 'hover:bg-gray-600 text-white'
                            : 'hover:bg-gray-100 text-gray-900'
                        )}
                      >
                        {supplier.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setShowSupplierDropdown(false)
                        setShowNewSupplierInput(true)
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2 border-t transition-colors duration-200 flex items-center gap-2',
                        isDarkMode
                          ? 'border-gray-600 hover:bg-gray-600 text-blue-400'
                          : 'border-gray-200 hover:bg-gray-100 text-blue-600'
                      )}
                    >
                      <Plus className="w-4 h-4" />
                      Crear nuevo proveedor
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="Nombre del nuevo proveedor"
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg border transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-red-500',
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  )}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateNewSupplier}
                  disabled={newSupplierName.trim().length < 3}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-white transition-colors duration-200',
                    'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewSupplierInput(false)
                    setNewSupplierName('')
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-colors duration-200',
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  Cancelar
                </button>
              </div>
            )}
            
            {errors.supplierId && (
              <p className="mt-1 text-sm text-red-500">{errors.supplierId}</p>
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
              placeholder="Describe el gasto (mínimo 5 caracteres)"
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200 resize-none',
                'focus:outline-none focus:ring-2 focus:ring-red-500',
                errors.description
                  ? 'border-red-500'
                  : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              )}
              aria-required="true"
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
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
              placeholder="Número de factura (opcional)"
              className={cn(
                'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-red-500',
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
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
                'bg-red-600 hover:bg-red-700',
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
