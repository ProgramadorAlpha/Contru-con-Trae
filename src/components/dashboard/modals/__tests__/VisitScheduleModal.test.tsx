import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VisitScheduleModal } from '../VisitScheduleModal'
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

describe('VisitScheduleModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  describe('Rendering', () => {
    it('should render visit schedule modal', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      expect(screen.getByRole('heading', { name: /agendar visita/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /agendar visita/i })).toBeInTheDocument()
    })

    it('should render all required form fields', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      expect(screen.getByLabelText(/proyecto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hora/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/visitante/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/propósito/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notas/i)).toBeInTheDocument()
    })

    it('should populate project dropdown with provided projects', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
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
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const dateInput = screen.getByLabelText(/fecha/i) as HTMLInputElement
      const today = new Date().toISOString().split('T')[0]
      
      expect(dateInput.value).toBe(today)
    })

    it('should initialize time field with default time', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const timeInput = screen.getByLabelText(/hora/i) as HTMLInputElement
      
      expect(timeInput.value).toBe('09:00')
    })
  })

  describe('Form Validation', () => {
    it('should not submit when project is not selected', async () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
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

    it('should require visitor name', async () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const projectSelect = screen.getByLabelText(/proyecto/i)
      fireEvent.change(projectSelect, { target: { value: '1' } })
      
      const purposeInput = screen.getByLabelText(/propósito/i)
      fireEvent.change(purposeInput, { target: { value: 'Inspección' } })
      
      const form = screen.getByRole('dialog').querySelector('form')
      if (form) {
        fireEvent.submit(form)
      }
      
      // Should not submit without visitor name
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should require purpose field', async () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const projectSelect = screen.getByLabelText(/proyecto/i)
      fireEvent.change(projectSelect, { target: { value: '1' } })
      
      const visitorInput = screen.getByLabelText(/visitante/i)
      fireEvent.change(visitorInput, { target: { value: 'Juan Pérez' } })
      
      const form = screen.getByRole('dialog').querySelector('form')
      if (form) {
        fireEvent.submit(form)
      }
      
      // Should not submit without purpose
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const projectSelect = screen.getByLabelText(/proyecto/i)
      fireEvent.change(projectSelect, { target: { value: '1' } })
      
      const dateInput = screen.getByLabelText(/fecha/i)
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } })
      
      const timeInput = screen.getByLabelText(/hora/i)
      fireEvent.change(timeInput, { target: { value: '14:30' } })
      
      const visitorInput = screen.getByLabelText(/visitante/i)
      fireEvent.change(visitorInput, { target: { value: 'Juan Pérez' } })
      
      const purposeInput = screen.getByLabelText(/propósito/i)
      fireEvent.change(purposeInput, { target: { value: 'Inspección de obra' } })
      
      const notesInput = screen.getByLabelText(/notas/i)
      fireEvent.change(notesInput, { target: { value: 'Revisar avance de construcción' } })
      
      const submitButton = screen.getByRole('button', { name: /agendar visita/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          projectId: '1',
          date: '2024-12-25',
          time: '14:30',
          visitor: 'Juan Pérez',
          purpose: 'Inspección de obra',
          notes: 'Revisar avance de construcción'
        })
      })
    })

    it('should submit form without optional notes', async () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      // Fill required fields only
      fireEvent.change(screen.getByLabelText(/proyecto/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/visitante/i), { target: { value: 'Juan Pérez' } })
      fireEvent.change(screen.getByLabelText(/propósito/i), { target: { value: 'Inspección' } })
      
      const submitButton = screen.getByRole('button', { name: /agendar visita/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            projectId: '1',
            visitor: 'Juan Pérez',
            purpose: 'Inspección',
            notes: ''
          })
        )
      })
    })

    it('should close modal after successful submission', async () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/proyecto/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/visitante/i), { target: { value: 'Juan Pérez' } })
      fireEvent.change(screen.getByLabelText(/propósito/i), { target: { value: 'Inspección' } })
      
      const submitButton = screen.getByRole('button', { name: /agendar visita/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should show loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/proyecto/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/visitante/i), { target: { value: 'Juan Pérez' } })
      fireEvent.change(screen.getByLabelText(/propósito/i), { target: { value: 'Inspección' } })
      
      const submitButton = screen.getByRole('button', { name: /agendar visita/i })
      fireEvent.click(submitButton)
      
      expect(screen.getByText('Agendando...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should disable buttons during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/proyecto/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/visitante/i), { target: { value: 'Juan Pérez' } })
      fireEvent.change(screen.getByLabelText(/propósito/i), { target: { value: 'Inspección' } })
      
      const submitButton = screen.getByRole('button', { name: /agendar visita/i })
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      
      fireEvent.click(submitButton)
      
      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Modal Controls', () => {
    it('should call onClose when cancel button is clicked', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
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
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
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
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not close when other keys are pressed', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
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
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/proyecto/i), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(/visitante/i), { target: { value: 'Juan Pérez' } })
      
      // Close modal
      rerender(
        <ThemeProvider>
          <VisitScheduleModal
            isOpen={false}
            onClose={mockOnClose}
            projects={mockProjects}
            onSubmit={mockOnSubmit}
          />
        </ThemeProvider>
      )
      
      // Reopen modal
      rerender(
        <ThemeProvider>
          <VisitScheduleModal
            isOpen={true}
            onClose={mockOnClose}
            projects={mockProjects}
            onSubmit={mockOnSubmit}
          />
        </ThemeProvider>
      )
      
      const projectSelect = screen.getByLabelText(/proyecto/i) as HTMLSelectElement
      const visitorInput = screen.getByLabelText(/visitante/i) as HTMLInputElement
      
      expect(projectSelect.value).toBe('')
      expect(visitorInput.value).toBe('')
    })
  })

  describe('Theme Support', () => {
    it('should apply light theme classes by default', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const title = screen.getByRole('heading', { name: /agendar visita/i })
      expect(title).toHaveClass('text-gray-900')
    })

    it('should apply dark theme classes when dark mode is active', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />,
        { isDark: true }
      )
      
      const title = screen.getByRole('heading', { name: /agendar visita/i })
      expect(title).toHaveClass('text-white')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'visit-modal-title')
    })

    it('should have labels for all form inputs', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      expect(screen.getByLabelText(/proyecto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hora/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/visitante/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/propósito/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notas/i)).toBeInTheDocument()
    })

    it('should have aria-label for close button', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      expect(screen.getByRole('button', { name: /cerrar modal/i })).toBeInTheDocument()
    })

    it('should mark optional fields appropriately', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const notesLabel = screen.getByText(/notas \(opcional\)/i)
      expect(notesLabel).toBeInTheDocument()
    })
  })

  describe('Not Rendered When Closed', () => {
    it('should not render when isOpen is false', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={false}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Date and Time Fields', () => {
    it('should allow changing date', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const dateInput = screen.getByLabelText(/fecha/i) as HTMLInputElement
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } })
      
      expect(dateInput.value).toBe('2024-12-31')
    })

    it('should allow changing time', () => {
      renderWithTheme(
        <VisitScheduleModal
          isOpen={true}
          onClose={mockOnClose}
          projects={mockProjects}
          onSubmit={mockOnSubmit}
        />
      )
      
      const timeInput = screen.getByLabelText(/hora/i) as HTMLInputElement
      fireEvent.change(timeInput, { target: { value: '15:45' } })
      
      expect(timeInput.value).toBe('15:45')
    })
  })
})
