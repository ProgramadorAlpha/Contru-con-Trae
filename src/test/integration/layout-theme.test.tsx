import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { simulateResize } from '@/test/utils'

// Mock child content for testing
const TestContent = () => <div data-testid="test-content">Test Content</div>

// Helper to render Layout with ThemeProvider
const renderLayoutWithTheme = (defaultTheme: 'light' | 'dark' | 'system' = 'light') => {
  return render(
    <BrowserRouter>
      <ThemeProvider defaultTheme={defaultTheme}>
        <Layout>
          <TestContent />
        </Layout>
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('Layout Theme Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Reset document class
    document.documentElement.className = ''
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  describe('Theme Application to Layout Components', () => {
    it('applies light theme classes to Layout, Header, and Sidebar by default', () => {
      renderLayoutWithTheme('light')

      // Verify Layout has light theme classes
      const layoutContainer = screen.getByTestId('test-content').closest('.flex.h-screen')
      expect(layoutContainer).toHaveClass('bg-gray-50', 'text-gray-900')

      // Verify Sidebar is rendered with light theme
      expect(screen.getByText('ConstructPro')).toBeInTheDocument()
      const sidebar = screen.getByText('ConstructPro').closest('.w-64')
      expect(sidebar).toHaveClass('bg-white')

      // Verify Header is rendered
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('applies dark theme classes to all layout components when dark mode is active', async () => {
      renderLayoutWithTheme('dark')

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark')
      })

      // Verify Layout has dark theme classes
      const layoutContainer = screen.getByTestId('test-content').closest('.flex.h-screen')
      expect(layoutContainer).toHaveClass('bg-gray-900', 'text-white')

      // Verify Sidebar has dark theme classes
      const sidebar = screen.getByText('ConstructPro').closest('.w-64')
      expect(sidebar).toHaveClass('bg-gray-800', 'border-gray-700')
    })

    it('applies theme to all navigation items in Sidebar', () => {
      renderLayoutWithTheme('light')

      // Check that navigation items are rendered
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Proyectos')).toBeInTheDocument()
      expect(screen.getByText('Presupuesto')).toBeInTheDocument()

      // Verify navigation items have proper styling
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('transition-all', 'duration-200')
    })

    it('applies active state styling correctly in both themes', async () => {
      renderLayoutWithTheme('light')

      // Dashboard should be active (current route is '/')
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('bg-blue-50', 'text-blue-700')

      // Switch to dark mode
      const themeToggle = screen.getByRole('switch', { name: /cambiar a modo oscuro/i })
      await user.click(themeToggle)

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark')
      })

      // Active state should update for dark theme
      expect(dashboardLink).toHaveClass('bg-gray-700', 'text-blue-400')
    })
  })

  describe('Theme Toggle Functionality', () => {
    it('toggles theme when clicking the dark mode toggle button', async () => {
      renderLayoutWithTheme('light')

      // Initially light mode
      expect(document.documentElement).not.toHaveClass('dark')

      // Find and click the theme toggle
      const themeToggle = screen.getByRole('switch', { name: /cambiar a modo oscuro/i })
      await user.click(themeToggle)

      // Should switch to dark mode
      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark')
      })

      // Click again to toggle back
      const lightToggle = screen.getByRole('switch', { name: /cambiar a modo claro/i })
      await user.click(lightToggle)

      // Should switch back to light mode
      await waitFor(() => {
        expect(document.documentElement).not.toHaveClass('dark')
      })
    })

    it('persists theme preference to localStorage', async () => {
      renderLayoutWithTheme('light')

      const themeToggle = screen.getByRole('switch', { name: /cambiar a modo oscuro/i })
      await user.click(themeToggle)

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'app-theme-mode',
          expect.any(String)
        )
      })
    })

    it('updates all layout components simultaneously when theme changes', async () => {
      renderLayoutWithTheme('light')

      const layoutContainer = screen.getByTestId('test-content').closest('.flex.h-screen')
      const sidebar = screen.getByText('ConstructPro').closest('.w-64')

      // Initially light theme
      expect(layoutContainer).toHaveClass('bg-gray-50')
      expect(sidebar).toHaveClass('bg-white')

      // Toggle to dark mode
      const themeToggle = screen.getByRole('switch', { name: /cambiar a modo oscuro/i })
      await user.click(themeToggle)

      // All components should update
      await waitFor(() => {
        expect(layoutContainer).toHaveClass('bg-gray-900')
        expect(sidebar).toHaveClass('bg-gray-800')
      })
    })

    it('theme toggle is keyboard accessible', () => {
      renderLayoutWithTheme('light')

      const themeToggle = screen.getByRole('switch', { name: /cambiar a modo oscuro/i })
      
      // Verify the toggle has proper keyboard accessibility attributes
      expect(themeToggle).toHaveAttribute('role', 'switch')
      expect(themeToggle).toHaveAttribute('aria-label')
      expect(themeToggle).toHaveAttribute('aria-pressed')
      
      // Verify it's a button element (keyboard accessible by default)
      expect(themeToggle.tagName).toBe('BUTTON')
    })
  })

  describe('Smooth Transitions', () => {
    it('applies transition classes to Layout container', () => {
      renderLayoutWithTheme('light')

      const layoutContainer = screen.getByTestId('test-content').closest('.flex.h-screen')
      expect(layoutContainer).toHaveClass('transition-colors', 'duration-200')
    })

    it('applies transition classes to Sidebar', () => {
      renderLayoutWithTheme('light')

      const sidebar = screen.getByText('ConstructPro').closest('.w-64')
      expect(sidebar).toHaveClass('transition-colors', 'duration-200')
    })

    it('applies transition classes to navigation items', () => {
      renderLayoutWithTheme('light')

      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('transition-all', 'duration-200')
    })

    it('applies transition classes to main content area', () => {
      renderLayoutWithTheme('light')

      const mainContent = screen.getByRole('main')
      expect(mainContent).toHaveClass('transition-colors', 'duration-200')
    })

    it('maintains smooth transitions during theme switch', async () => {
      renderLayoutWithTheme('light')

      const layoutContainer = screen.getByTestId('test-content').closest('.flex.h-screen')
      
      // Verify transition classes are present before switch
      expect(layoutContainer).toHaveClass('transition-colors', 'duration-200')

      // Toggle theme
      const themeToggle = screen.getByRole('switch', { name: /cambiar a modo oscuro/i })
      await user.click(themeToggle)

      // Verify transition classes remain after switch
      await waitFor(() => {
        expect(layoutContainer).toHaveClass('transition-colors', 'duration-200')
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('renders correctly on mobile viewport (375px)', () => {
      simulateResize(375, 667)
      renderLayoutWithTheme('light')

      // Layout should still render all components
      expect(screen.getByText('ConstructPro')).toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('renders correctly on tablet viewport (768px)', () => {
      simulateResize(768, 1024)
      renderLayoutWithTheme('light')

      expect(screen.getByText('ConstructPro')).toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('renders correctly on desktop viewport (1024px)', () => {
      simulateResize(1024, 768)
      renderLayoutWithTheme('light')

      expect(screen.getByText('ConstructPro')).toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('renders correctly on large desktop viewport (1920px)', () => {
      simulateResize(1920, 1080)
      renderLayoutWithTheme('light')

      expect(screen.getByText('ConstructPro')).toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('theme toggle remains accessible on mobile', () => {
      simulateResize(375, 667)
      renderLayoutWithTheme('light')

      const themeToggle = screen.getByRole('switch', { name: /cambiar a modo oscuro/i })
      expect(themeToggle).toBeInTheDocument()
      expect(themeToggle).toBeVisible()
    })

    it('sidebar navigation remains functional on all viewports', () => {
      const viewports = [
        { width: 375, height: 667 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1024, height: 768 },  // Desktop
        { width: 1920, height: 1080 }  // Large Desktop
      ]

      viewports.forEach(({ width, height }) => {
        simulateResize(width, height)
        const { unmount } = renderLayoutWithTheme('light')

        // All navigation items should be present
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Proyectos')).toBeInTheDocument()
        expect(screen.getByText('Presupuesto')).toBeInTheDocument()

        unmount()
      })
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels for theme toggle', () => {
      renderLayoutWithTheme('light')

      const themeToggle = screen.getByRole('switch', { name: /cambiar a modo oscuro/i })
      expect(themeToggle).toHaveAttribute('aria-label')
    })

    it('provides proper ARIA current attribute for active navigation', () => {
      renderLayoutWithTheme('light')

      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('aria-current', 'page')
    })

    it('maintains focus indicators in both themes', async () => {
      renderLayoutWithTheme('light')

      const themeToggle = screen.getByRole('switch', { name: /cambiar a modo oscuro/i })
      
      // Verify focus ring classes are present in light mode
      expect(themeToggle).toHaveClass('focus:outline-none', 'focus:ring-2')

      // Toggle to dark mode
      await user.click(themeToggle)

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark')
      })

      // Focus ring classes should still be present in dark mode
      const darkToggle = screen.getByRole('switch', { name: /cambiar a modo claro/i })
      expect(darkToggle).toHaveClass('focus:outline-none', 'focus:ring-2')
    })

    it('navigation links have proper focus states', () => {
      renderLayoutWithTheme('light')

      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('focus:outline-none', 'focus:ring-2')
    })
  })

  describe('Theme Persistence', () => {
    it('loads theme from localStorage on mount', () => {
      // Set theme in localStorage before rendering
      localStorage.setItem('app-theme-mode', JSON.stringify({ mode: 'dark' }))

      renderLayoutWithTheme('system')

      // Should load dark theme from localStorage
      waitFor(() => {
        expect(document.documentElement).toHaveClass('dark')
      })
    })

    it('respects system preference when no localStorage value exists', () => {
      // Mock system preference for dark mode
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      renderLayoutWithTheme('system')

      waitFor(() => {
        expect(document.documentElement).toHaveClass('dark')
      })
    })
  })

  describe('Content Rendering', () => {
    it('renders child content correctly', () => {
      renderLayoutWithTheme('light')

      expect(screen.getByTestId('test-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('maintains content visibility during theme changes', async () => {
      renderLayoutWithTheme('light')

      expect(screen.getByTestId('test-content')).toBeVisible()

      const themeToggle = screen.getByRole('switch', { name: /cambiar a modo oscuro/i })
      await user.click(themeToggle)

      await waitFor(() => {
        expect(screen.getByTestId('test-content')).toBeVisible()
      })
    })

    it('applies proper overflow handling to main content', () => {
      renderLayoutWithTheme('light')

      const mainContent = screen.getByRole('main')
      expect(mainContent).toHaveClass('overflow-x-hidden', 'overflow-y-auto')
    })
  })

  describe('Integration with Router', () => {
    it('highlights correct navigation item based on current route', () => {
      renderLayoutWithTheme('light')

      // Dashboard should be active (route is '/')
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('aria-current', 'page')

      // Other items should not be active
      const projectsLink = screen.getByText('Proyectos').closest('a')
      expect(projectsLink).not.toHaveAttribute('aria-current')
    })

    it('maintains theme state during navigation', async () => {
      renderLayoutWithTheme('dark')

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark')
      })

      // Click on a navigation item
      const projectsLink = screen.getByText('Proyectos')
      await user.click(projectsLink)

      // Theme should remain dark
      expect(document.documentElement).toHaveClass('dark')
    })
  })
})
