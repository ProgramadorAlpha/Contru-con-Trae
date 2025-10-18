/**
 * QuickActionButton Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickActionButton } from '../QuickActionButton'
import { PlusCircle } from 'lucide-react'

describe('QuickActionButton', () => {
  it('renders with correct label', () => {
    render(
      <QuickActionButton
        label="Test Action"
        icon={<PlusCircle />}
        color="blue"
        onClick={() => {}}
      />
    )
    
    expect(screen.getByText('Test Action')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(
      <QuickActionButton
        label="Test Action"
        icon={<PlusCircle />}
        color="blue"
        onClick={onClick}
      />
    )
    
    fireEvent.click(screen.getByText('Test Action'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    const onClick = vi.fn()
    render(
      <QuickActionButton
        label="Test Action"
        icon={<PlusCircle />}
        color="blue"
        onClick={onClick}
        disabled={true}
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies correct color styles', () => {
    const { rerender } = render(
      <QuickActionButton
        label="Test"
        icon={<PlusCircle />}
        color="blue"
        onClick={() => {}}
      />
    )
    
    let button = screen.getByRole('button')
    expect(button.className).toContain('bg-blue-600')
    
    rerender(
      <QuickActionButton
        label="Test"
        icon={<PlusCircle />}
        color="red"
        onClick={() => {}}
      />
    )
    
    button = screen.getByRole('button')
    expect(button.className).toContain('bg-red-600')
  })

  it('has proper ARIA attributes', () => {
    render(
      <QuickActionButton
        label="Test Action"
        icon={<PlusCircle />}
        color="blue"
        onClick={() => {}}
        ariaLabel="Custom aria label"
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Custom aria label')
  })
})
