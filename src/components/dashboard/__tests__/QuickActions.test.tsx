/**
 * QuickActions Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickActions } from '../QuickActions'

describe('QuickActions', () => {
  it('renders all three action buttons', () => {
    render(<QuickActions />)
    
    expect(screen.getByText('Añadir Ingreso')).toBeInTheDocument()
    expect(screen.getByText('Registrar Gasto')).toBeInTheDocument()
    expect(screen.getByText('Agendar Visita')).toBeInTheDocument()
  })

  it('calls onActionComplete when income is added successfully', async () => {
    const onActionComplete = vi.fn()
    render(<QuickActions onActionComplete={onActionComplete} />)
    
    // This would require more setup with modal interactions
    // Placeholder for actual test implementation
  })

  it('displays notification on successful action', () => {
    render(<QuickActions />)
    
    // Placeholder for notification test
  })

  it('handles errors gracefully', () => {
    render(<QuickActions />)
    
    // Placeholder for error handling test
  })
})
