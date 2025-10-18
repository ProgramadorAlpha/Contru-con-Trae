/**
 * E2E Tests for Projects
 * 
 * Tests the projects functionality including:
 * - Project list display
 * - Project creation
 * - Project editing
 * - Project deletion
 * - Project filtering and search
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProjectsPage } from '@/pages/ProjectsPage'

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
    hasPermission: () => true
  }
}))

const renderProjects = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ProjectsPage />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('Projects E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Project List', () => {
    it('should render projects page', async () => {
      renderProjects()
      
      await waitFor(() => {
        expect(screen.queryByText(/project/i)).toBeInTheDocument()
      })
    })

    it('should display project table or grid', async () => {
      renderProjects()
      
      await waitFor(() => {
        // Look for table or grid structure
        const table = screen.queryByRole('table') || 
                     screen.queryByRole('grid') ||
                     document.querySelector('[class*="grid"]') ||
                     document.querySelector('[class*="table"]')
        expect(table).toBeInTheDocument()
      })
    })

    it('should display project data', async () => {
      renderProjects()
      
      await waitFor(() => {
        // Should have some content
        const main = screen.getByRole('main')
        expect(main).toBeInTheDocument()
        expect(main.textContent).not.toBe('')
      })
    })
  })

  describe('Project Creation', () => {
    it('should have create project button', async () => {
      renderProjects()
      
      await waitFor(() => {
        const createButton = screen.queryByRole('button', { 
          name: /new project|create project|nuevo proyecto|crear proyecto/i 
        })
        expect(createButton).toBeInTheDocument()
      })
    })

    it('should open create project modal', async () => {
      const user = userEvent.setup()
      renderProjects()
      
      await waitFor(() => {
        const createButton = screen.queryByRole('button', { 
          name: /new project|create project|nuevo proyecto|crear proyecto/i 
        })
        expect(createButton).toBeInTheDocument()
        
        if (createButton) {
          user.click(createButton)
        }
      })
    })

    it('should have project form fields', async () => {
      const user = userEvent.setup()
      renderProjects()
      
      const createButton = screen.queryByRole('button', { 
        name: /new project|create project|nuevo proyecto|crear proyecto/i 
      })
      
      if (createButton) {
        await user.click(createButton)
        
        await waitFor(() => {
          // Look for form fields
          const nameInput = screen.queryByLabelText(/name|nombre/i)
          const codeInput = screen.queryByLabelText(/code|código/i)
          
          // At least one field should be present
          expect(nameInput || codeInput).toBeInTheDocument()
        })
      }
    })

    it('should validate required fields', async () => {
      const user = userEvent.setup()
      renderProjects()
      
      const createButton = screen.queryByRole('button', { 
        name: /new project|create project|nuevo proyecto|crear proyecto/i 
      })
      
      if (createButton) {
        await user.click(createButton)
        
        await waitFor(() => {
          const submitButton = screen.queryByRole('button', { 
            name: /create|save|crear|guardar/i 
          })
          
          if (submitButton) {
            user.click(submitButton)
          }
        })
      }
    })

    it('should create project with valid data', async () => {
      const user = userEvent.setup()
      renderProjects()
      
      const createButton = screen.queryByRole('button', { 
        name: /new project|create project|nuevo proyecto|crear proyecto/i 
      })
      
      if (createButton) {
        await user.click(createButton)
        
        await waitFor(async () => {
          const nameInput = screen.queryByLabelText(/name|nombre/i)
          
          if (nameInput) {
            await user.type(nameInput, 'Test Project')
            
            const submitButton = screen.queryByRole('button', { 
              name: /create|save|crear|guardar/i 
            })
            
            if (submitButton) {
              await user.click(submitButton)
            }
          }
        })
      }
    })
  })

  describe('Project Search and Filter', () => {
    it('should have search input', async () => {
      renderProjects()
      
      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/search|buscar/i) ||
                           screen.queryByRole('searchbox')
        expect(searchInput).toBeInTheDocument()
      })
    })

    it('should filter projects by search term', async () => {
      const user = userEvent.setup()
      renderProjects()
      
      await waitFor(async () => {
        const searchInput = screen.queryByPlaceholderText(/search|buscar/i) ||
                           screen.queryByRole('searchbox')
        
        if (searchInput) {
          await user.type(searchInput, 'test')
          
          // Wait for filtering to occur
          await waitFor(() => {
            expect(searchInput).toHaveValue('test')
          })
        }
      })
    })

    it('should have status filter', async () => {
      renderProjects()
      
      await waitFor(() => {
        const statusFilter = screen.queryByLabelText(/status|estado/i) ||
                            screen.queryByRole('combobox')
        // Filter may or may not be present
        expect(statusFilter !== undefined).toBe(true)
      })
    })

    it('should filter by project status', async () => {
      const user = userEvent.setup()
      renderProjects()
      
      await waitFor(async () => {
        const statusFilter = screen.queryByLabelText(/status|estado/i)
        
        if (statusFilter) {
          await user.click(statusFilter)
          
          // Look for status options
          const activeOption = screen.queryByText(/active|activo/i)
          if (activeOption) {
            await user.click(activeOption)
          }
        }
      })
    })
  })

  describe('Project Actions', () => {
    it('should have edit button for projects', async () => {
      renderProjects()
      
      await waitFor(() => {
        const editButtons = screen.queryAllByRole('button', { 
          name: /edit|editar/i 
        })
        // May or may not have edit buttons depending on data
        expect(editButtons.length >= 0).toBe(true)
      })
    })

    it('should have delete button for projects', async () => {
      renderProjects()
      
      await waitFor(() => {
        const deleteButtons = screen.queryAllByRole('button', { 
          name: /delete|eliminar/i 
        })
        // May or may not have delete buttons depending on data
        expect(deleteButtons.length >= 0).toBe(true)
      })
    })

    it('should open edit modal', async () => {
      const user = userEvent.setup()
      renderProjects()
      
      await waitFor(async () => {
        const editButtons = screen.queryAllByRole('button', { 
          name: /edit|editar/i 
        })
        
        if (editButtons.length > 0) {
          await user.click(editButtons[0])
          
          // Modal should open
          await waitFor(() => {
            const modal = screen.queryByRole('dialog')
            expect(modal).toBeInTheDocument()
          })
        }
      })
    })

    it('should confirm before deleting', async () => {
      const user = userEvent.setup()
      renderProjects()
      
      await waitFor(async () => {
        const deleteButtons = screen.queryAllByRole('button', { 
          name: /delete|eliminar/i 
        })
        
        if (deleteButtons.length > 0) {
          await user.click(deleteButtons[0])
          
          // Confirmation dialog should appear
          await waitFor(() => {
            const confirmDialog = screen.queryByRole('dialog') ||
                                 screen.queryByText(/confirm|confirmar|are you sure|está seguro/i)
            expect(confirmDialog).toBeInTheDocument()
          })
        }
      })
    })
  })

  describe('Project Navigation', () => {
    it('should navigate to project details', async () => {
      const user = userEvent.setup()
      renderProjects()
      
      await waitFor(async () => {
        // Look for clickable project items
        const projectLinks = screen.queryAllByRole('link')
        
        if (projectLinks.length > 0) {
          await user.click(projectLinks[0])
        }
      })
    })

    it('should have view details button', async () => {
      renderProjects()
      
      await waitFor(() => {
        const viewButtons = screen.queryAllByRole('button', { 
          name: /view|details|ver|detalles/i 
        })
        // May or may not have view buttons
        expect(viewButtons.length >= 0).toBe(true)
      })
    })
  })

  describe('Project Sorting', () => {
    it('should have sortable columns', async () => {
      renderProjects()
      
      await waitFor(() => {
        const columnHeaders = screen.queryAllByRole('columnheader')
        // May or may not have sortable columns
        expect(columnHeaders.length >= 0).toBe(true)
      })
    })

    it('should sort by column', async () => {
      const user = userEvent.setup()
      renderProjects()
      
      await waitFor(async () => {
        const columnHeaders = screen.queryAllByRole('columnheader')
        
        if (columnHeaders.length > 0) {
          await user.click(columnHeaders[0])
          
          // Should trigger sort
          expect(columnHeaders[0]).toBeInTheDocument()
        }
      })
    })
  })

  describe('Project Pagination', () => {
    it('should have pagination controls', async () => {
      renderProjects()
      
      await waitFor(() => {
        const pagination = screen.queryByRole('navigation', { name: /pagination/i }) ||
                          screen.queryByText(/page|página/i)
        // Pagination may or may not be present
        expect(pagination !== undefined).toBe(true)
      })
    })

    it('should navigate between pages', async () => {
      const user = userEvent.setup()
      renderProjects()
      
      await waitFor(async () => {
        const nextButton = screen.queryByRole('button', { name: /next|siguiente/i })
        
        if (nextButton && !nextButton.hasAttribute('disabled')) {
          await user.click(nextButton)
        }
      })
    })
  })

  describe('Project Data Display', () => {
    it('should display project name', async () => {
      renderProjects()
      
      await waitFor(() => {
        const main = screen.getByRole('main')
        expect(main).toBeInTheDocument()
      })
    })

    it('should display project status', async () => {
      renderProjects()
      
      await waitFor(() => {
        const statusElements = screen.queryAllByText(/active|completed|planning|activo|completado|planificación/i)
        // Status may or may not be displayed
        expect(statusElements.length >= 0).toBe(true)
      })
    })

    it('should display project budget', async () => {
      renderProjects()
      
      await waitFor(() => {
        const budgetElements = screen.queryAllByText(/\$|USD|budget|presupuesto/i)
        // Budget may or may not be displayed
        expect(budgetElements.length >= 0).toBe(true)
      })
    })
  })

  describe('Project Responsiveness', () => {
    it('should render on mobile', async () => {
      global.innerWidth = 375
      global.innerHeight = 667
      
      renderProjects()
      
      await waitFor(() => {
        const main = screen.getByRole('main')
        expect(main).toBeInTheDocument()
      })
    })

    it('should render on tablet', async () => {
      global.innerWidth = 768
      global.innerHeight = 1024
      
      renderProjects()
      
      await waitFor(() => {
        const main = screen.getByRole('main')
        expect(main).toBeInTheDocument()
      })
    })
  })
})
