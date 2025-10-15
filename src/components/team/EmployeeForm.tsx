import React, { useState, useEffect } from 'react'
import { X, Upload, User, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Award } from 'lucide-react'
import { Employee, Department, EmployeeFormData, ValidationErrors } from '@/types/team'
import { cn } from '@/lib/utils'

interface EmployeeFormProps {
  employee?: Employee | null
  departments: Department[]
  isOpen: boolean
  onClose: () => void
  onSave: (data: EmployeeFormData) => Promise<void>
}

export function EmployeeForm({ employee, departments, isOpen, onClose, onSave }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    documentId: '',
    birthDate: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    employeeNumber: '',
    role: '',
    departmentId: '',
    hireDate: '',
    salary: 0,
    skills: []
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('personal')
  const [skillInput, setSkillInput] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Initialize form data when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        documentId: employee.documentId,
        birthDate: employee.birthDate,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        emergencyContact: employee.emergencyContact,
        employeeNumber: employee.employeeNumber,
        role: employee.role,
        departmentId: employee.departmentId,
        hireDate: employee.hireDate,
        salary: employee.salary,
        skills: employee.skills || []
      })
    } else {
      // Reset form for new employee
      setFormData({
        firstName: '',
        lastName: '',
        documentId: '',
        birthDate: '',
        email: '',
        phone: '',
        address: '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },
        employeeNumber: `EMP${Date.now().toString().slice(-6)}`,
        role: '',
        departmentId: '',
        hireDate: new Date().toISOString().split('T')[0],
        salary: 0,
        skills: []
      })
    }
    setErrors({})
    setAvatarPreview(null)
    setActiveSection('personal')
  }, [employee, isOpen])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Personal Information
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio'
    }
    if (!formData.documentId.trim()) {
      newErrors.documentId = 'El documento de identidad es obligatorio'
    }
    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria'
    }

    // Contact Information
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria'
    }

    // Work Information
    if (!formData.role.trim()) {
      newErrors.role = 'El cargo es obligatorio'
    }
    if (!formData.departmentId) {
      newErrors.departmentId = 'El departamento es obligatorio'
    }
    if (!formData.hireDate) {
      newErrors.hireDate = 'La fecha de contratación es obligatoria'
    }
    if (formData.salary <= 0) {
      newErrors.salary = 'El salario debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }))
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      setFormData(prev => ({
        ...prev,
        avatar: file
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving employee:', error)
      // Handle error (could show toast notification)
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    { id: 'personal', name: 'Personal', icon: User },
    { id: 'contact', name: 'Contacto', icon: Mail },
    { id: 'work', name: 'Laboral', icon: Briefcase },
    { id: 'skills', name: 'Habilidades', icon: Award }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {section.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              {/* Personal Information */}
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
                    
                    {/* Avatar Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto de Perfil
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          <Upload className="w-4 h-4 inline mr-2" />
                          Subir Foto
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            errors.firstName ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.firstName && (
                          <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            errors.lastName ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.lastName && (
                          <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Documento de Identidad *
                        </label>
                        <input
                          type="text"
                          value={formData.documentId}
                          onChange={(e) => handleInputChange('documentId', e.target.value)}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            errors.documentId ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.documentId && (
                          <p className="text-red-600 text-sm mt-1">{errors.documentId}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Nacimiento *
                        </label>
                        <input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            errors.birthDate ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.birthDate && (
                          <p className="text-red-600 text-sm mt-1">{errors.birthDate}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {activeSection === 'contact' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            errors.phone ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.phone && (
                          <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dirección *
                        </label>
                        <textarea
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          rows={3}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            errors.address ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.address && (
                          <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                        )}
                      </div>

                      {/* Emergency Contact */}
                      <div className="border-t pt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Contacto de Emergencia</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre
                            </label>
                            <input
                              type="text"
                              value={formData.emergencyContact.name}
                              onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Teléfono
                            </label>
                            <input
                              type="tel"
                              value={formData.emergencyContact.phone}
                              onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Relación
                            </label>
                            <select
                              value={formData.emergencyContact.relationship}
                              onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Seleccionar</option>
                              <option value="Padre">Padre</option>
                              <option value="Madre">Madre</option>
                              <option value="Esposo">Esposo</option>
                              <option value="Esposa">Esposa</option>
                              <option value="Hermano">Hermano</option>
                              <option value="Hermana">Hermana</option>
                              <option value="Hijo">Hijo</option>
                              <option value="Hija">Hija</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Work Information */}
              {activeSection === 'work' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información Laboral</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de Empleado
                        </label>
                        <input
                          type="text"
                          value={formData.employeeNumber}
                          onChange={(e) => handleInputChange('employeeNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          readOnly={!!employee}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cargo/Rol *
                        </label>
                        <input
                          type="text"
                          value={formData.role}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            errors.role ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.role && (
                          <p className="text-red-600 text-sm mt-1">{errors.role}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Departamento *
                        </label>
                        <select
                          value={formData.departmentId}
                          onChange={(e) => handleInputChange('departmentId', e.target.value)}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            errors.departmentId ? 'border-red-300' : 'border-gray-300'
                          )}
                        >
                          <option value="">Seleccionar departamento</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        {errors.departmentId && (
                          <p className="text-red-600 text-sm mt-1">{errors.departmentId}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Contratación *
                        </label>
                        <input
                          type="date"
                          value={formData.hireDate}
                          onChange={(e) => handleInputChange('hireDate', e.target.value)}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            errors.hireDate ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.hireDate && (
                          <p className="text-red-600 text-sm mt-1">{errors.hireDate}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Salario (€) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={formData.salary}
                          onChange={(e) => handleInputChange('salary', Number(e.target.value))}
                          className={cn(
                            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            errors.salary ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.salary && (
                          <p className="text-red-600 text-sm mt-1">{errors.salary}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Habilidades y Competencias</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agregar Habilidad
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                            placeholder="Ej: AutoCAD, Gestión de Proyectos..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>

                      {formData.skills.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Habilidades Actuales
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (employee ? 'Actualizar' : 'Crear')} Empleado
          </button>
        </div>
      </div>
    </div>
  )
}