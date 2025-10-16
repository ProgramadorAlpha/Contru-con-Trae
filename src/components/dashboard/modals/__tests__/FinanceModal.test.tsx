import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FinanceModal } from '../FinanceModal'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Wrapper with ThemeProvider
const renderWithTheme = (ui: React.ReactElement, { isDark = false } = {}) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  return render(
    <ThemeProvider defaultTheme={isDark ? 'dark' : 'light'}>
      {ui}
    </ThemeProvider>
  )
}

const mockProjects = [
  { id: '1', name: 'Proyecto Alpha' },
  { id: '2', name: 'Proyecto Beta' },
  { id: '3', name: 'Proyecto Gamma' }
]

describe('FinanceModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  describe('Rendering - Income Modal', () => {
    it('should render income modal when type is income', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      expect(screen.getByText('Añadir Ingreso')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
    })

    it('should show income categories for income type', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const categorySelect = screen.getByLabelText(/categoría/i)
      expect(categorySelect).toBeInTheDocument()
      
      // Check for income-specific categories
      const options = Array.from(categorySelect.querySelectorAll('option')).map(opt => opt.textContent)
      expect(options).toContain('Pago de Cliente')
      expect(options).toContain('Anticipo')
    })
  })

  describe('Rendering - Expense Modal', () => {
    it('should render expense modal when type is expense', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="expense"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      expect(screen.getByText('Registrar Gasto')).toBeInTheDocument()
    })

    it('should show expense categories for expense type', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="expense"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const categorySelect = screen.getByLabelText(/categoría/i)
      
      // Check for expense-specific categories
      const options = Array.from(categorySelect.querySelectorAll('option')).map(opt => opt.textContent)
      expect(options).toContain('Materiales')
      expect(options).toContain('Mano de Obra')
    })
  })

  describe('Form Fields', () => {
    it('should render all required form fields', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      expect(screen.getByLabelText(/proyecto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/monto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
    })

    it('should populate project dropdown with provided projects', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const projectSelect = screen.getByLabelText(/proyecto/i)
      const options = Array.from(projectSelect.querySelectorAll('option'))
      
      expect(options).toHaveLength(4) // 1 placeholder + 3 projects
      expect(options[1].textContent).toBe('Proyecto Alpha')
      expect(options[2].textContent).toBe('Proyecto Beta')
      expect(options[3].textContent).toBe('Proyecto Gamma')
    })

    it('should initialize date field with current date', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const dateInput = screen.getByLabelText(/fecha/i) as HTMLInputElement
      const today = new Date().toISOString().split('T')[0]
      
      expect(dateInput.value).toBe(today)
    })
  })

  describe('Form Validation', () => {
    it('should not submit when project is not selected', async () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const form = screen.getByRole('dialog').querySelector('form')
      if (form) {
        fireEvent.submit(form)
      }
      
      // Form should not submit without required fields
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should validate amount is greater than zero', async () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const projectSelect = screen.getByLabelText(/proyecto/i)
      fireEvent.change(projectSelect, { target: { value: '1' } })
      
      const amountInput = screen.getByLabelText(/monto/i)
      fireEvent.change(amountInput, { target: { value: '0' } })
      
      const descriptionInput = screen.getByLabelText(/descripción/i)
      fireEvent.change(descriptionInput, { target: { value: 'Test' } })
      
      const form = screen.getByRole('dialog').querySelector('form')
      if (form) {
        fireEvent.submit(form)
      }
      
      // Should not submit with zero amount
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should require description field', async () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const projectSelect = screen.getByLabelText(/proyecto/i)
      fireEvent.change(projectSelect, { target: { value: '1' } })
      
      const amountInput = screen.getByLabelText(/monto/i)
      fireEvent.change(amountInput, { target: { value: '1000' } })
      
      const form = screen.getByRole('dialog').querySelector('form')
      if (form) {
        fireEvent.submit(form)
      }
      
      // Should not submit without description
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Amount Input Formatting', () => {
    it('should allow only numbers and decimal point in amount field', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const amountInput = screen.getByLabelText(/monto/i) as HTMLInputElement
      
      fireEvent.change(amountInput, { target: { value: 'abc123.45xyz' } })
      
      expect(amountInput.value).toBe('123.45')
    })

    it('should allow only one decimal point', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const amountInput = screen.getByLabelText(/monto/i) as HTMLInputElement
      
      fireEvent.change(amountInput, { target: { value: '123.45.67' } })
      
      expect(amountInput.value).toBe('123.4567')
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const projectSelect = screen.getByLabelText(/proyecto/i)
      fireEvent.change(projectSelect, { target: { value: '1' } })
      
      const amountInput = screen.getByLabelText(/monto/i)
      fireEvent.change(amountInput, { target: { value: '5000' } })
      
      const descriptionInput = screen.getByLabelText(/descripción/i)
      fireEvent.change(descriptionInput, { target: { value: 'Pago inicial del cliente' } })
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          projectId: '1',
          amount: '5000',
          date: expect.any(String),
          description: 'Pago inicial del cliente',
          category: 'General'
        })
      })
    })

    it('should close modal after successful submission', async () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/proyecto/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '5000' } })
      fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Test' } })
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should show loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/proyecto/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '5000' } })
      fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Test' } })
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(submitButton)
      
      expect(screen.getByText('Guardando...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should disable buttons during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/proyecto/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '5000' } })
      fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Test' } })
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      
      fireEvent.click(submitButton)
      
      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Modal Controls', () => {
    it('should call onClose when cancel button is clicked', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      fireEvent.click(cancelButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when close icon is clicked', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const closeButton = screen.getByRole('button', { name: /cerrar modal/i })
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should close modal when Escape key is pressed', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not close when other keys are pressed', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'Tab' })
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Form Reset', () => {
    it('should reset form when modal is reopened', () => {
      const { rerender } = renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/proyecto/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/monto/i), { target: { value: '5000' } })
      
      // Close modal
      rerender(
        <ThemeProvider>
          <FinanceModal
            isOpen={false}
            onClose={mockOnClose}
            type="income"
            projects={mockProjects}
            onSubmit={mockOnSubmit}
          />
        </ThemeProvider>
      )
      
      // Reopen modal
      rerender(
        <ThemeProvider>
          <FinanceModal
            isOpen={true}
            onClose={mockOnClose}
            type="income"
            projects={mockProjects}
            onSubmit={mockOnSubmit}
          />
        </ThemeProvider>
      )
      
      const projectSelect = screen.getByLabelText(/proyecto/i) as HTMLSelectElement
      const amountInput = screen.getByLabelText(/monto/i) as HTMLInputElement
      
      expect(projectSelect.value).toBe('')
      expect(amountInput.value).toBe('')
    })
  })

  describe('Theme Support', () => {
    it('should apply light theme classes by default', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const title = screen.getByText('Añadir Ingreso')
      expect(title).toHaveClass('text-gray-900')
    })

    it('should apply dark theme classes when dark mode is active', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />,
        { isDark: true }
      )
      
      const title = screen.getByText('Añadir Ingreso')
      expect(title).toHaveClass('text-white')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'finance-modal-title')
    })

    it('should have labels for all form inputs', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      expect(screen.getByLabelText(/proyecto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/monto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
    })

    it('should have aria-label for close button', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={true}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      expect(screen.getByRole('button', { name: /cerrar modal/i })).toBeInTheDocument()
    })
  })

  describe('Not Rendered When Closed', () => {
    it('should not render when isOpen is false', () => {
      renderWithTheme(
        <FinanceModal
          isOpen={false}
          onClose={mockOnClose}
          type="income"
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
