// Types for Team Management Module

export interface Employee {
  id: string
  // Personal Information
  firstName: string
  lastName: string
  fullName: string
  documentId: string
  birthDate: string
  avatar?: string
  
  // Contact Information
  email: string
  phone: string
  address: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  
  // Work Information
  employeeNumber: string
  role: string
  department: string
  departmentId: string
  hireDate: string
  salary: number
  status: 'Activo' | 'Inactivo' | 'Vacaciones' | 'Licencia'
  
  // Skills and Certifications
  skills: string[]
  certifications: Certification[]
  
  // Performance and Availability
  availability: number // percentage
  performance: number // percentage
  projects: string[] // project IDs
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  certificateNumber: string
  status: 'Válido' | 'Expirado' | 'Pendiente'
}

export interface Department {
  id: string
  name: string
  description: string
  managerId: string
  managerName: string
  employeeCount: number
  budget: number
  status: 'Activo' | 'Inactivo'
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: string
  employeeId: string
  employeeName: string
  projectId: string
  projectName: string
  role: string
  startDate: string
  endDate?: string
  dedication: number // percentage
  status: 'Activa' | 'Completada' | 'Cancelada'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  status: 'Presente' | 'Ausente' | 'Tardanza' | 'Vacaciones' | 'Licencia'
  checkIn?: string
  checkOut?: string
  hoursWorked: number
  notes?: string
  justification?: string
}

export interface TeamStats {
  totalEmployees: number
  activeEmployees: number
  averagePerformance: number
  totalDepartments: number
  attendanceRate: number
  activeAssignments: number
}

export interface TeamFilters {
  search: string
  department: string
  role: string
  status: string
  dateFrom?: string
  dateTo?: string
  minPerformance?: number
  maxPerformance?: number
  availability?: number
}

export type TeamTab = 'employees' | 'departments' | 'performance' | 'assignments' | 'attendance'

export interface EmployeeFormData {
  firstName: string
  lastName: string
  documentId: string
  birthDate: string
  email: string
  phone: string
  address: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  employeeNumber: string
  role: string
  departmentId: string
  hireDate: string
  salary: number
  skills: string[]
  avatar?: File
}

export interface DepartmentFormData {
  name: string
  description: string
  managerId: string
  budget: number
}

export interface AssignmentFormData {
  employeeId: string
  projectId: string
  role: string
  startDate: string
  endDate?: string
  dedication: number
  notes?: string
}

export interface ValidationErrors {
  [key: string]: string
}