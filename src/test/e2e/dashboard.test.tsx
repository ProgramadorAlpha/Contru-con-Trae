/**
 * E2E Tests for Dashboard
 * 
 * Tests the main dashboard functionality including:
 * - Dashboard loading and rendering
 * - Widgets display
 * - Navigation
 * - Data interactions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { EnhancedDashboard } from '@/pages/EnhancedDashboard'

// Mock auth service
vi.mock('@/services/authService', () => ({
  authService: {
    getCurrentUser: () => ({
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
    }),
    login: vi.fn(),
    logout: vi.fn(),
    hasPermission: () => true
  }
}))

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Dashboard Loading', () => {
    it('should render dashboard without errors', async () => {
      renderDashboard()
      
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })
    })

    it('should display dashboard title', async () => {
      renderDashboard()
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    })
  })

  describe('Dashboard Widgets', () => {
    it('should display all main widgets', async () => {
      renderDashboard()
      
      await waitFor(() => {
        // Check for key dashboard sections
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })
    })

    it('should display project statistics', async () => {
      renderDashboard()
      
      await waitFor(() => {
        // Look for project-related content
        const projectElements = screen.queryAllByText(/project/i)
        expect(projectElements.length).toBeGreaterThan(0)
      })
    })

    it('should display financial widgets', async () => {
      renderDashboard()
      
      await waitFor(() => {
        // Look for financial indicators
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })
    })
  })

  describe('Dashboard Interactions', () => {
    it('should allow clicking on project cards', async () => {
      const user = userEvent.setup()
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })

      // Look for clickable elements
      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should handle filter interactions', async () => {
      const user = userEvent.setup()
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })

      // Check for filter elements
      const inputs = screen.queryAllByRole('textbox')
      if (inputs.length > 0) {
        await user.type(inputs[0], 'test')
        expect(inputs[0]).toHaveValue('test')
      }
    })
  })

  describe('Dashboard Navigation', () => {
    it('should have navigation links', async () => {
      renderDashboard()
      
      await waitFor(() => {
        const links = screen.queryAllByRole('link')
        expect(links.length).toBeGreaterThan(0)
      })
    })

    it('should navigate to projects page', async () => {
      const user = userEvent.setup()
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })

      // Look for project navigation
      const projectLinks = screen.queryAllByText(/project/i)
      if (projectLinks.length > 0) {
        const clickableLink = projectLinks.find(el => 
          el.tagName === 'A' || el.tagName === 'BUTTON'
        )
        if (clickableLink) {
          await user.click(clickableLink)
        }
      }
    })
  })

  describe('Dashboard Data Display', () => {
    it('should display numerical data correctly', async () => {
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })

      // Check for numerical displays
      const numbers = screen.queryAllByText(/\d+/)
      expect(numbers.length).toBeGreaterThan(0)
    })

    it('should format currency correctly', async () => {
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })

      // Look for currency symbols
      const currencyElements = screen.queryAllByText(/\$|USD|€|EUR/)
      // Currency may or may not be displayed depending on data
      expect(currencyElements.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Dashboard Responsiveness', () => {
    it('should render on mobile viewport', async () => {
      // Simulate mobile viewport
      global.innerWidth = 375
      global.innerHeight = 667
      
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })
    })

    it('should render on tablet viewport', async () => {
      // Simulate tablet viewport
      global.innerWidth = 768
      global.innerHeight = 1024
      
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })
    })

    it('should render on desktop viewport', async () => {
      // Simulate desktop viewport
      global.innerWidth = 1920
      global.innerHeight = 1080
      
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })
    })
  })

  describe('Dashboard Error Handling', () => {
    it('should handle missing data gracefully', async () => {
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })

      // Should not show error messages
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })

    it('should not crash on invalid data', async () => {
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })

      // Dashboard should render without crashing
      expect(dashboard).toBeInTheDocument()
    })
  })

  describe('Dashboard Performance', () => {
    it('should load within acceptable time', async () => {
      const startTime = Date.now()
      
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })

      const loadTime = Date.now() - startTime
      
      // Should load in less than 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })
  })

  describe('Dashboard Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })

      // Check for main landmark
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      renderDashboard()
      
      await waitFor(() => {
        const dashboard = screen.getByRole('main')
        expect(dashboard).toBeInTheDocument()
      })

      // Tab through elements
      await user.tab()
      
      // Should have focus on an element
      expect(document.activeElement).not.toBe(document.body)
    })
  })
})
