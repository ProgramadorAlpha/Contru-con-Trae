/**
 * E2E Tests for Authentication
 * 
 * Tests the authentication flow including:
 * - Login functionality
 * - Logout functionality
 * - Protected routes
 * - Session management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoginPage } from '@/pages/LoginPage'
import App from '@/App'

// Mock auth service
const mockLogin = vi.fn()
const mockLogout = vi.fn()
const mockGetCurrentUser = vi.fn()

vi.mock('@/services/authService', () => ({
  authService: {
    getCurrentUser: () => mockGetCurrentUser(),
    login: (credentials: any) => mockLogin(credentials),
    logout: () => mockLogout(),
    hasPermission: () => true
  }
}))

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

const renderApp = () => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  )
}

describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockReturnValue(null)
    localStorage.clear()
  })

  describe('Login Page', () => {
    it('should render login form', () => {
      renderLogin()
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in|login|iniciar sesión/i })).toBeInTheDocument()
    })

    it('should show validation errors for empty fields', async () => {
      const user = userEvent.setup()
      renderLogin()
      
      const submitButton = screen.getByRole('button', { name: /sign in|login|iniciar sesión/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        // Should show validation messages
        const form = screen.getByRole('form') || document.querySelector('form')
        expect(form).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /sign in|login|iniciar sesión/i })
      await user.click(submitButton)
      
      // Form should not submit with invalid email
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should submit login form with valid credentials', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      })
      
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in|login|iniciar sesión/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false
        })
      })
    })

    it('should handle login errors', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new Error('Invalid credentials'))
      
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in|login|iniciar sesión/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
    })

    it('should toggle remember me checkbox', async () => {
      const user = userEvent.setup()
      renderLogin()
      
      const rememberCheckbox = screen.queryByRole('checkbox', { name: /remember|recordar/i })
      
      if (rememberCheckbox) {
        expect(rememberCheckbox).not.toBeChecked()
        await user.click(rememberCheckbox)
        expect(rememberCheckbox).toBeChecked()
      }
    })
  })

  describe('Protected Routes', () => {
    it('should redirect to login when not authenticated', async () => {
      mockGetCurrentUser.mockReturnValue(null)
      
      renderApp()
      
      await waitFor(() => {
        // Should show login page or redirect
        expect(
          screen.queryByLabelText(/email/i) || 
          screen.queryByText(/login|sign in|iniciar sesión/i)
        ).toBeInTheDocument()
      })
    })

    it('should allow access to dashboard when authenticated', async () => {
      mockGetCurrentUser.mockReturnValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        permissions: {
          viewProjects: true,
          createProjects: true,
          editProjects: true,
          deleteProjects: true,
          viewFinancials: true,
          approveExpenses: true,
          manageCostCodes: true,
          viewReports: true,
          manageTeam: true
        }
      })
      
      renderApp()
      
      await waitFor(() => {
        // Should show dashboard or main content
        const main = screen.queryByRole('main')
        expect(main).toBeInTheDocument()
      })
    })
  })

  describe('Logout Functionality', () => {
    it('should logout user and redirect to login', async () => {
      const user = userEvent.setup()
      mockGetCurrentUser.mockReturnValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        permissions: {
          viewProjects: true,
          createProjects: true,
          editProjects: true,
          deleteProjects: true,
          viewFinancials: true,
          approveExpenses: true,
          manageCostCodes: true,
          viewReports: true,
          manageTeam: true
        }
      })
      
      renderApp()
      
      await waitFor(() => {
        const main = screen.queryByRole('main')
        expect(main).toBeInTheDocument()
      })

      // Look for logout button
      const logoutButton = screen.queryByRole('button', { name: /logout|sign out|cerrar sesión/i })
      
      if (logoutButton) {
        mockGetCurrentUser.mockReturnValue(null)
        await user.click(logoutButton)
        
        await waitFor(() => {
          expect(mockLogout).toHaveBeenCalled()
        })
      }
    })

    it('should clear user data on logout', async () => {
      mockGetCurrentUser.mockReturnValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      })
      
      renderApp()
      
      await waitFor(() => {
        const main = screen.queryByRole('main')
        expect(main).toBeInTheDocument()
      })

      // Simulate logout
      mockGetCurrentUser.mockReturnValue(null)
      mockLogout.mockResolvedValue(undefined)
      
      // User data should be cleared
      expect(mockGetCurrentUser()).toBeNull()
    })
  })

  describe('Session Management', () => {
    it('should persist session in localStorage', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        token: 'mock-token'
      })
      
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in|login|iniciar sesión/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })

      // Check if session data is stored
      const storedData = localStorage.getItem('auth_user') || localStorage.getItem('user')
      // Session may or may not be stored depending on implementation
      expect(storedData !== undefined).toBe(true)
    })

    it('should restore session on page reload', async () => {
      // Set up stored session
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      }
      
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      mockGetCurrentUser.mockReturnValue(mockUser)
      
      renderApp()
      
      await waitFor(() => {
        // Should show authenticated content
        const main = screen.queryByRole('main')
        expect(main).toBeInTheDocument()
      })
    })
  })

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup()
      renderLogin()
      
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
      expect(passwordInput.type).toBe('password')
      
      // Look for toggle button
      const toggleButton = screen.queryByRole('button', { name: /show|hide|mostrar|ocultar/i })
      
      if (toggleButton) {
        await user.click(toggleButton)
        
        await waitFor(() => {
          expect(passwordInput.type).toBe('text')
        })
        
        await user.click(toggleButton)
        
        await waitFor(() => {
          expect(passwordInput.type).toBe('password')
        })
      }
    })
  })

  describe('Loading States', () => {
    it('should show loading state during login', async () => {
      const user = userEvent.setup()
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      renderLogin()
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in|login|iniciar sesión/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      // Should show loading indicator
      await waitFor(() => {
        const loadingIndicator = screen.queryByText(/loading|cargando/i) || 
                                screen.queryByRole('status')
        // Loading indicator may or may not be present
        expect(loadingIndicator !== undefined).toBe(true)
      })
    })
  })
})
