import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DarkModeToggle } from '../DarkModeToggle'
import { ThemeProvider } from '@/contexts/ThemeContext'
import React from 'react'

describe('DarkModeToggle', () => {
  let localStorageMock: Record<string, string>
  let matchMediaMock: any

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock = {}
    Storage.prototype.getItem = vi.fn((key: string) => localStorageMock[key] || null)
    Storage.prototype.setItem = vi.fn((key: string, value: string) => {
      localStorageMock[key] = value
    })

    // Reset matchMedia mock
    matchMediaMock = {
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
    window.matchMedia = vi.fn(() => matchMediaMock)

    // Reset document
    document.documentElement.className = ''
    document.documentElement.style.colorScheme = ''
  })

  const renderWithTheme = (ui: React.ReactElement, defaultTheme: 'light' | 'dark' | 'system' = 'light') => {
    return render(
      <ThemeProvider defaultTheme={defaultTheme}>
        {ui}
      </ThemeProvider>
    )
  }

  describe('Compact variant', () => {
    it('should render compact toggle button', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />)
      
      const button = screen.getByRole('switch')
      expect(button).toBeInTheDocument()
    })

    it('should show sun icon in light mode', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      const button = screen.getByRole('switch')
      expect(button).toHaveAttribute('aria-label', 'Cambiar a modo oscuro')
    })

    it('should show moon icon in dark mode', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'dark')
      
      const button = screen.getByRole('switch')
      expect(button).toHaveAttribute('aria-label', 'Cambiar a modo claro')
    })

    it('should toggle theme when clicked', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      const button = screen.getByRole('switch')
      expect(button).toHaveAttribute('aria-pressed', 'false')
      
      fireEvent.click(button)
      
      expect(button).toHaveAttribute('aria-pressed', 'true')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should have minimum touch target size', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />)
      
      const button = screen.getByRole('switch')
      expect(button.className).toContain('min-h-[44px]')
      expect(button.className).toContain('min-w-[44px]')
    })
  })

  describe('Full variant', () => {
    it('should render full toggle button with label', () => {
      renderWithTheme(<DarkModeToggle variant="full" />, 'light')
      
      const button = screen.getByRole('switch')
      expect(button).toBeInTheDocument()
      expect(screen.getByText('Modo Claro')).toBeInTheDocument()
    })

    it('should show correct label in dark mode', () => {
      renderWithTheme(<DarkModeToggle variant="full" />, 'dark')
      
      expect(screen.getByText('Modo Oscuro')).toBeInTheDocument()
    })

    it('should show correct label in light mode', () => {
      renderWithTheme(<DarkModeToggle variant="full" />, 'light')
      
      expect(screen.getByText('Modo Claro')).toBeInTheDocument()
    })

    it('should toggle theme when clicked', () => {
      renderWithTheme(<DarkModeToggle variant="full" />, 'light')
      
      const button = screen.getByRole('switch')
      fireEvent.click(button)
      
      expect(screen.getByText('Modo Oscuro')).toBeInTheDocument()
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should have minimum touch target size', () => {
      renderWithTheme(<DarkModeToggle variant="full" />)
      
      const button = screen.getByRole('switch')
      expect(button.className).toContain('min-h-[44px]')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      const button = screen.getByRole('switch')
      expect(button).toHaveAttribute('aria-label', 'Cambiar a modo oscuro')
      expect(button).toHaveAttribute('aria-pressed', 'false')
      expect(button).toHaveAttribute('role', 'switch')
    })

    it('should update ARIA attributes when theme changes', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      const button = screen.getByRole('switch')
      fireEvent.click(button)
      
      expect(button).toHaveAttribute('aria-label', 'Cambiar a modo claro')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    it('should have title attribute for tooltip', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      const button = screen.getByRole('switch')
      expect(button).toHaveAttribute('title', 'Cambiar a modo oscuro')
    })

    it('should be keyboard navigable with Enter key', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      const button = screen.getByRole('switch')
      button.focus()
      
      fireEvent.keyDown(button, { key: 'Enter' })
      
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should be keyboard navigable with Space key', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      const button = screen.getByRole('switch')
      button.focus()
      
      fireEvent.keyDown(button, { key: ' ' })
      
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should not trigger on other keys', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      const button = screen.getByRole('switch')
      button.focus()
      
      fireEvent.keyDown(button, { key: 'a' })
      
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should have focus ring styles', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />)
      
      const button = screen.getByRole('switch')
      expect(button.className).toContain('focus:outline-none')
      expect(button.className).toContain('focus:ring-2')
    })
  })

  describe('Visual transitions', () => {
    it('should have transition classes', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />)
      
      const button = screen.getByRole('switch')
      expect(button.className).toContain('transition-all')
      expect(button.className).toContain('duration-200')
    })

    it('should have hover scale effect', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />)
      
      const button = screen.getByRole('switch')
      expect(button.className).toContain('hover:scale-110')
    })

    it('should have active scale effect', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />)
      
      const button = screen.getByRole('switch')
      expect(button.className).toContain('active:scale-95')
    })
  })

  describe('Theme-aware styling', () => {
    it('should apply light mode styles', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      const button = screen.getByRole('switch')
      expect(button.className).toContain('bg-gray-100')
    })

    it('should apply dark mode styles', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'dark')
      
      const button = screen.getByRole('switch')
      expect(button.className).toContain('bg-gray-800')
    })
  })

  describe('Custom className', () => {
    it('should accept and apply custom className', () => {
      renderWithTheme(<DarkModeToggle variant="compact" className="custom-class" />)
      
      const button = screen.getByRole('switch')
      expect(button.className).toContain('custom-class')
    })

    it('should merge custom className with default classes', () => {
      renderWithTheme(<DarkModeToggle variant="compact" className="custom-class" />)
      
      const button = screen.getByRole('switch')
      expect(button.className).toContain('custom-class')
      expect(button.className).toContain('transition-all')
    })
  })

  describe('Integration with theme system', () => {
    it('should update document class when toggled', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      
      const button = screen.getByRole('switch')
      fireEvent.click(button)
      
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should persist theme to localStorage when toggled', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      const button = screen.getByRole('switch')
      fireEvent.click(button)
      
      expect(localStorage.setItem).toHaveBeenCalledWith('app-theme-mode', 'dark')
    })

    it('should toggle multiple times correctly', () => {
      renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      const button = screen.getByRole('switch')
      
      fireEvent.click(button)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      
      fireEvent.click(button)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      
      fireEvent.click(button)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('System preference handling', () => {
    it('should respect system preference when theme is system', () => {
      matchMediaMock.matches = true
      
      renderWithTheme(<DarkModeToggle variant="compact" />, 'system')
      
      const button = screen.getByRole('switch')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    it('should switch from system to explicit mode when toggled', () => {
      matchMediaMock.matches = false
      
      renderWithTheme(<DarkModeToggle variant="compact" />, 'system')
      
      const button = screen.getByRole('switch')
      expect(button).toHaveAttribute('aria-pressed', 'false')
      
      fireEvent.click(button)
      
      expect(button).toHaveAttribute('aria-pressed', 'true')
      expect(localStorage.setItem).toHaveBeenCalledWith('app-theme-mode', 'dark')
    })
  })

  describe('Icon animations', () => {
    it('should show correct icon opacity in light mode', () => {
      const { container } = renderWithTheme(<DarkModeToggle variant="compact" />, 'light')
      
      // Sun icon should be visible (opacity-100)
      const icons = container.querySelectorAll('svg')
      const sunIcon = Array.from(icons).find(icon => {
        const className = icon.getAttribute('class') || ''
        return className.includes('opacity-100')
      })
      expect(sunIcon).toBeTruthy()
    })

    it('should show correct icon opacity in dark mode', () => {
      const { container } = renderWithTheme(<DarkModeToggle variant="compact" />, 'dark')
      
      // Moon icon should be visible (opacity-100)
      const icons = container.querySelectorAll('svg')
      const moonIcon = Array.from(icons).find(icon => {
        const className = icon.getAttribute('class') || ''
        return className.includes('opacity-100')
      })
      expect(moonIcon).toBeTruthy()
    })
  })

  describe('Error handling', () => {
    it('should throw error when used outside ThemeProvider', () => {
      const consoleError = console.error
      console.error = vi.fn()

      expect(() => {
        render(<DarkModeToggle variant="compact" />)
      }).toThrow()

      console.error = consoleError
    })
  })
})
