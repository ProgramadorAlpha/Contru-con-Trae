/**
 * Authentication Service
 * 
 * Handles user authentication, profile management, and permissions.
 * In production, this would integrate with Firebase Auth or similar.
 */

import type {
  User,
  UserRole,
  UserPermissions,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  ActivityFeedItem
} from '@/types/auth'

// Role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canViewProjects: true,
    canCreateSubcontracts: true,
    canEditSubcontracts: true,
    canApproveSubcontracts: true,
    canViewSubcontracts: true,
    canCreateCertificates: true,
    canApproveCertificates: true,
    canRejectCertificates: true,
    canViewCertificates: true,
    canCreateExpenses: true,
    canApproveExpenses: true,
    canRejectExpenses: true,
    canViewExpenses: true,
    canViewFinancials: true,
    canExportReports: true,
    canViewAuditLog: true,
    canManageUsers: true,
    canManageSettings: true
  },
  project_manager: {
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canViewProjects: true,
    canCreateSubcontracts: true,
    canEditSubcontracts: true,
    canApproveSubcontracts: true,
    canViewSubcontracts: true,
    canCreateCertificates: true,
    canApproveCertificates: true,
    canRejectCertificates: true,
    canViewCertificates: true,
    canCreateExpenses: true,
    canApproveExpenses: false,
    canRejectExpenses: false,
    canViewExpenses: true,
    canViewFinancials: true,
    canExportReports: true,
    canViewAuditLog: true,
    canManageUsers: false,
    canManageSettings: false
  },
  cost_controller: {
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewProjects: true,
    canCreateSubcontracts: false,
    canEditSubcontracts: false,
    canApproveSubcontracts: false,
    canViewSubcontracts: true,
    canCreateCertificates: false,
    canApproveCertificates: true,
    canRejectCertificates: true,
    canViewCertificates: true,
    canCreateExpenses: true,
    canApproveExpenses: true,
    canRejectExpenses: true,
    canViewExpenses: true,
    canViewFinancials: true,
    canExportReports: true,
    canViewAuditLog: true,
    canManageUsers: false,
    canManageSettings: false
  },
  viewer: {
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewProjects: true,
    canCreateSubcontracts: false,
    canEditSubcontracts: false,
    canApproveSubcontracts: false,
    canViewSubcontracts: true,
    canCreateCertificates: false,
    canApproveCertificates: false,
    canRejectCertificates: false,
    canViewCertificates: true,
    canCreateExpenses: false,
    canApproveExpenses: false,
    canRejectExpenses: false,
    canViewExpenses: true,
    canViewFinancials: true,
    canExportReports: false,
    canViewAuditLog: false,
    canManageUsers: false,
    canManageSettings: false
  }
}

// Mock users for development
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@constructpro.com',
    displayName: 'Admin User',
    photoURL: 'https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff',
    role: 'admin',
    permissions: ROLE_PERMISSIONS.admin,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    isActive: true,
    department: 'Administration',
    phone: '+1234567890'
  },
  {
    id: 'user-2',
    email: 'pm@constructpro.com',
    displayName: 'Project Manager',
    photoURL: 'https://ui-avatars.com/api/?name=Project+Manager&background=10b981&color=fff',
    role: 'project_manager',
    permissions: ROLE_PERMISSIONS.project_manager,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    isActive: true,
    department: 'Projects',
    phone: '+1234567891'
  },
  {
    id: 'user-3',
    email: 'cost@constructpro.com',
    displayName: 'Cost Controller',
    photoURL: 'https://ui-avatars.com/api/?name=Cost+Controller&background=f59e0b&color=fff',
    role: 'cost_controller',
    permissions: ROLE_PERMISSIONS.cost_controller,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    isActive: true,
    department: 'Finance',
    phone: '+1234567892'
  }
]

// Mock activity feed
let mockActivityFeed: ActivityFeedItem[] = [
  {
    id: 'activity-1',
    userId: 'user-1',
    userName: 'Admin User',
    userAvatar: 'https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff',
    action: 'created',
    entityType: 'project',
    entityId: 'proj-1',
    entityName: 'Torre Residencial Norte',
    description: 'Created new project',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'activity-2',
    userId: 'user-2',
    userName: 'Project Manager',
    userAvatar: 'https://ui-avatars.com/api/?name=Project+Manager&background=10b981&color=fff',
    action: 'approved',
    entityType: 'certificate',
    entityId: 'cert-1',
    entityName: 'Certificate #001',
    description: 'Approved progress certificate for $50,000',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'activity-3',
    userId: 'user-3',
    userName: 'Cost Controller',
    userAvatar: 'https://ui-avatars.com/api/?name=Cost+Controller&background=f59e0b&color=fff',
    action: 'approved',
    entityType: 'expense',
    entityId: 'exp-1',
    entityName: 'Materials Purchase',
    description: 'Approved expense for $15,000',
    timestamp: new Date(Date.now() - 10800000).toISOString()
  }
]

// Current user (simulated session)
let currentUser: User | null = null

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = mockUsers.find(u => u.email === credentials.email)
    
    if (!user) {
      throw new Error('Invalid email or password')
    }

    // In production, verify password with backend
    if (credentials.password !== 'password123') {
      throw new Error('Invalid email or password')
    }

    // Update last login
    user.lastLogin = new Date().toISOString()
    currentUser = user

    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user))

    // Log activity
    this.logActivity({
      userId: user.id,
      userName: user.displayName,
      userAvatar: user.photoURL,
      action: 'logged_in',
      entityType: 'user',
      entityId: user.id,
      entityName: user.displayName,
      description: 'Logged in to the system'
    })

    return user
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if email already exists
    if (mockUsers.find(u => u.email === data.email)) {
      throw new Error('Email already registered')
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      displayName: data.displayName,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName)}&background=random&color=fff`,
      role: data.role || 'viewer',
      permissions: ROLE_PERMISSIONS[data.role || 'viewer'],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true
    }

    mockUsers.push(newUser)
    currentUser = newUser

    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(newUser))

    return newUser
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    if (currentUser) {
      // Log activity
      this.logActivity({
        userId: currentUser.id,
        userName: currentUser.displayName,
        userAvatar: currentUser.photoURL,
        action: 'logged_out',
        entityType: 'user',
        entityId: currentUser.id,
        entityName: currentUser.displayName,
        description: 'Logged out from the system'
      })
    }

    currentUser = null
    localStorage.removeItem('currentUser')
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    if (currentUser) {
      return currentUser
    }

    // Try to restore from localStorage
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      try {
        currentUser = JSON.parse(stored)
        return currentUser
      } catch {
        localStorage.removeItem('currentUser')
      }
    }

    return null
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      ...data
    }

    mockUsers[userIndex] = updatedUser

    if (currentUser?.id === userId) {
      currentUser = updatedUser
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    }

    // Log activity
    this.logActivity({
      userId: updatedUser.id,
      userName: updatedUser.displayName,
      userAvatar: updatedUser.photoURL,
      action: 'updated',
      entityType: 'user',
      entityId: updatedUser.id,
      entityName: updatedUser.displayName,
      description: 'Updated profile information'
    })

    return updatedUser
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In production, upload to Firebase Storage or similar
    // For now, use a placeholder
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(file.name)}&background=random&color=fff&size=200`

    await this.updateProfile(userId, { photoURL: avatarUrl })

    return avatarUrl
  }

  /**
   * Change password
   */
  async changePassword(userId: string, data: ChangePasswordData): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // In production, verify current password and update
    if (data.currentPassword !== 'password123') {
      throw new Error('Current password is incorrect')
    }

    if (data.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters')
    }

    // Log activity
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      this.logActivity({
        userId: user.id,
        userName: user.displayName,
        userAvatar: user.photoURL,
        action: 'changed_password',
        entityType: 'user',
        entityId: user.id,
        entityName: user.displayName,
        description: 'Changed account password'
      })
    }
  }

  /**
   * Get activity feed
   */
  async getActivityFeed(limit: number = 20): Promise<ActivityFeedItem[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))

    return mockActivityFeed
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  /**
   * Log activity
   */
  private logActivity(activity: Omit<ActivityFeedItem, 'id' | 'timestamp'>): void {
    const newActivity: ActivityFeedItem = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date().toISOString()
    }

    mockActivityFeed.unshift(newActivity)

    // Keep only last 100 activities
    if (mockActivityFeed.length > 100) {
      mockActivityFeed = mockActivityFeed.slice(0, 100)
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: User | null, permission: keyof UserPermissions): boolean {
    if (!user) return false
    return user.permissions[permission]
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))

    return mockUsers.filter(u => u.isActive)
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      role,
      permissions: ROLE_PERMISSIONS[role]
    }

    mockUsers[userIndex] = updatedUser

    return updatedUser
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(userId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    mockUsers[userIndex].isActive = false
  }
}

export const authService = new AuthService()
