/**
 * Authentication and User Types
 */

export type UserRole = 'admin' | 'project_manager' | 'cost_controller' | 'viewer'

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  role: UserRole
  permissions: UserPermissions
  createdAt: string
  lastLogin?: string
  isActive: boolean
  department?: string
  phone?: string
}

export interface UserPermissions {
  // Project permissions
  canCreateProjects: boolean
  canEditProjects: boolean
  canDeleteProjects: boolean
  canViewProjects: boolean
  
  // Subcontract permissions
  canCreateSubcontracts: boolean
  canEditSubcontracts: boolean
  canApproveSubcontracts: boolean
  canViewSubcontracts: boolean
  
  // Certificate permissions
  canCreateCertificates: boolean
  canApproveCertificates: boolean
  canRejectCertificates: boolean
  canViewCertificates: boolean
  
  // Expense permissions
  canCreateExpenses: boolean
  canApproveExpenses: boolean
  canRejectExpenses: boolean
  canViewExpenses: boolean
  
  // Financial permissions
  canViewFinancials: boolean
  canExportReports: boolean
  canViewAuditLog: boolean
  
  // System permissions
  canManageUsers: boolean
  canManageSettings: boolean
}

export interface ActivityFeedItem {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  action: string
  entityType: 'project' | 'subcontract' | 'certificate' | 'expense' | 'user'
  entityId: string
  entityName: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  displayName: string
  role?: UserRole
}

export interface UpdateProfileData {
  displayName?: string
  photoURL?: string
  phone?: string
  department?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}
