import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data generators for tests
export const createMockNotification = (overrides = {}) => ({
  id: Math.random().toString(),
  type: 'info' as const,
  title: 'Test Notification',
  message: 'This is a test notification',
  timestamp: new Date(),
  read: false,
  ...overrides
})

export const createMockWidget = (overrides = {}) => ({
  id: Math.random().toString(),
  name: 'Test Widget',
  description: 'This is a test widget',
  enabled: true,
  position: 1,
  ...overrides
})

export const createMockDashboardData = (overrides = {}) => ({
  stats: {
    activeProjects: 12,
    totalBudget: 150000,
    teamMembers: 8,
    pendingTasks: 24,
    availableTools: 15,
    budgetUtilization: 75,
    projectsGrowth: 12,
    budgetGrowth: 8,
    teamGrowth: 5,
    tasksGrowth: -3
  },
  budgetData: [
    { period: 'Ene', budgeted: 100000, spent: 85000 },
    { period: 'Feb', budgeted: 120000, spent: 95000 }
  ],
  projectProgressData: [
    { name: 'Test Project', progress: 75, status: 'on-track' as const }
  ],
  teamPerformanceData: [
    { period: 'Ene', performance: 85, attendance: 95 }
  ],
  expensesByCategory: [
    { name: 'Materiales', value: 450000, color: '#8884d8' }
  ],
  recentProjects: [
    {
      id: '1',
      name: 'Test Project',
      client: 'Test Client',
      progress: 75,
      status: 'En progreso',
      deadline: '2024-12-31',
      budget: 500000
    }
  ],
  upcomingDeadlines: [
    {
      id: '1',
      title: 'Test Deadline',
      date: '2024-12-31',
      type: 'project' as const,
      priority: 'high' as const
    }
  ],
  ...overrides
})

// Test utilities for async operations
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

// Mock intersection observer for components that use it
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
  
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver
  })
  
  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver
  })
}

// Helper to simulate user interactions
export const simulateKeyPress = (element: Element, key: string) => {
  const event = new KeyboardEvent('keydown', { key })
  element.dispatchEvent(event)
}

// Helper to simulate window resize
export const simulateResize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  })
  window.dispatchEvent(new Event('resize'))
}

// Helper to mock localStorage with specific data
export const mockLocalStorageWithData = (data: Record<string, any>) => {
  const mockStorage = {
    getItem: vi.fn((key: string) => {
      return data[key] ? JSON.stringify(data[key]) : null
    }),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
  Object.defineProperty(window, 'localStorage', { value: mockStorage })
  return mockStorage
}

// Helper to create mock API responses
export function createMockApiResponse<T>(data: T, delay = 0): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

// Helper to create mock API errors
export function createMockApiError(message = 'API Error', delay = 0): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay)
  })
}