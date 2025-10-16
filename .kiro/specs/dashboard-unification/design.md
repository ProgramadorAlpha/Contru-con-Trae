# Design Document

## Overview

Este documento describe el diseño técnico para la unificación del dashboard y la implementación del sistema de modo oscuro global en ConstructPro. El diseño se enfoca en crear una arquitectura modular, mantenible y escalable que elimine duplicaciones mientras mantiene todas las funcionalidades críticas.

### Objetivos del Diseño

1. **Consolidación**: Unificar Dashboard.tsx y EnhancedDashboard.tsx en un único componente robusto
2. **Tema Global**: Implementar un sistema de modo oscuro/claro coherente en toda la aplicación
3. **Modularidad**: Diseñar componentes reutilizables y desacoplados
4. **Performance**: Optimizar carga y renderizado con lazy loading y memoización
5. **Accesibilidad**: Cumplir con estándares WCAG AA en ambos temas
6. **Mantenibilidad**: Código limpio, documentado y fácil de extender

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│                  (ThemeProvider Context)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─────────────────────────────────────┐
                         │                                     │
                ┌────────▼────────┐                  ┌────────▼────────┐
                │  Layout.tsx     │                  │  Other Pages    │
                │  (Theme aware)  │                  │  (Theme aware)  │
                └────────┬────────┘                  └─────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │ Header  │    │ Sidebar │    │  Main   │
    │ (Toggle)│    │ (Themed)│    │ Content │
    └─────────┘    └─────────┘    └────┬────┘
                                        │
                              ┌─────────▼─────────┐
                              │ UnifiedDashboard  │
                              │   (Main Page)     │
                              └─────────┬─────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
            ┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
            │ DashboardStats│  │DashboardCharts│  │ DashboardMods │
            │   (Widgets)   │  │   (Graphs)    │  │   (Modals)    │
            └───────────────┘  └───────────────┘  └───────────────┘
```

### Theme System Architecture


```
┌──────────────────────────────────────────────────────────────┐
│                     ThemeProvider                             │
│  - Manages global theme state (light/dark)                   │
│  - Provides context to all components                        │
│  - Handles localStorage persistence                          │
│  - Detects system preferences                                │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ provides
                         │
                ┌────────▼────────────────────┐
                │   useDarkMode Hook          │
                │   - isDarkMode: boolean     │
                │   - toggleDarkMode: fn      │
                │   - setDarkMode: fn         │
                └────────┬────────────────────┘
                         │
                         │ consumed by
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
   │ Layout  │     │Dashboard│     │ Other   │
   │Components│    │Components│    │Components│
   └─────────┘     └─────────┘     └─────────┘
```

## Components and Interfaces

### 1. Theme System Components

#### ThemeProvider Component


**Purpose**: Provide global theme state management using React Context API

**Location**: `src/contexts/ThemeContext.tsx`

**Interface**:
```typescript
interface ThemeContextValue {
  isDarkMode: boolean
  theme: 'light' | 'dark' | 'system'
  toggleDarkMode: () => void
  setDarkMode: (mode: 'light' | 'dark' | 'system') => void
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark' | 'system'
}
```

**Key Responsibilities**:
- Initialize theme from localStorage or system preference
- Apply 'dark' class to document.documentElement
- Persist theme changes to localStorage
- Provide theme state to all child components
- Listen to system theme changes when mode is 'system'

#### useDarkMode Hook

**Purpose**: Custom hook to consume theme context

**Location**: `src/hooks/useDarkMode.ts`

**Interface**:
```typescript
function useDarkMode(): {
  isDarkMode: boolean
  theme: 'light' | 'dark' | 'system'
  toggleDarkMode: () => void
  setDarkMode: (mode: 'light' | 'dark' | 'system') => void
}
```

**Implementation Details**:
- Wraps useContext(ThemeContext)
- Throws error if used outside ThemeProvider
- Memoizes return value to prevent unnecessary re-renders

#### DarkModeToggle Component

**Purpose**: UI control for switching themes

**Location**: `src/components/DarkModeToggle.tsx`

**Interface**:
```typescript
interface DarkModeToggleProps {
  variant?: 'compact' | 'full'
  showLabel?: boolean
  className?: string
}
```

**Variants**:
- **compact**: Icon-only button (for header)
- **full**: Button with label and icon (for settings)

**Visual States**:
- Light mode: Sun icon (☀️) with yellow accent
- Dark mode: Moon icon (🌙) with blue accent
- Transition: 200ms ease-in-out

### 2. Unified Dashboard Component

#### UnifiedDashboard (Main Component)

**Purpose**: Main dashboard page combining all features

**Location**: `src/pages/Dashboard.tsx`

**Interface**:
```typescript
interface DashboardProps {
  // No props - uses hooks for all state management
}

interface DashboardState {
  timeFilter: TimeFilter
  dateRange: DateRange
  isExporting: boolean
  showSettings: boolean
  showIncomeModal: boolean
  showExpenseModal: boolean
  showVisitModal: boolean
}
```

**Hooks Used**:
- `useDarkMode()` - Theme state
- `useDashboardData()` - Data fetching and caching
- `useNotifications()` - Notification management
- `useDashboardSettings()` - Widget configuration
- `useDashboardConfig()` - Legacy config (to be merged)

**Component Structure**:
```tsx
<div className="dashboard-container">
  <DashboardHeader />
  <DashboardFilters />
  <DashboardStats />
  <DashboardCharts />
  <DashboardModals />
  <NotificationCenter />
  <DashboardSettings />
</div>
```

#### DashboardHeader Component

**Purpose**: Top section with title, actions, and theme toggle

**Location**: `src/components/dashboard/DashboardHeader.tsx`

**Interface**:
```typescript
interface DashboardHeaderProps {
  title: string
  subtitle?: string
  onExport: () => void
  onOpenSettings: () => void
  isExporting: boolean
}
```

**Features**:
- Title and subtitle
- Export button with loading state
- Settings button
- Notification bell with badge
- Dark mode toggle (compact variant)
- Responsive layout (stacks on mobile)



#### DashboardStats Component

**Purpose**: Display key metrics in card format

**Location**: `src/components/dashboard/DashboardStats.tsx`

**Interface**:
```typescript
interface StatsCardData {
  id: string
  title: string
  value: number
  format: 'number' | 'currency' | 'percentage'
  icon: React.ComponentType
  color: 'blue' | 'green' | 'purple' | 'orange'
  trend?: number
  trendLabel?: string
}

interface DashboardStatsProps {
  stats: StatsCardData[]
  loading: boolean
  visibleWidgets: string[]
}
```

**Features**:
- Grid layout (responsive: 1-2-4 columns)
- Skeleton loading states
- Trend indicators (up/down arrows)
- Icon with themed background
- Hover effects
- Conditional rendering based on widget visibility

#### DashboardCharts Component

**Purpose**: Display data visualizations

**Location**: `src/components/dashboard/DashboardCharts.tsx` (existing, to be enhanced)

**Enhancements Needed**:
- Add dark mode color schemes for charts
- Implement ErrorBoundary for each chart
- Add skeleton loaders
- Optimize re-renders with React.memo
- Add responsive breakpoints

**Chart Types**:
- Budget utilization (Bar chart)
- Project progress (Line chart)
- Team performance (Radar chart)
- Expenses by category (Pie chart)

#### Widget System

**Purpose**: Modular, configurable dashboard widgets

**Location**: `src/components/dashboard/widgets/`

**Base Widget Interface**:
```typescript
interface WidgetConfig {
  id: string
  title: string
  component: React.ComponentType<WidgetProps>
  defaultVisible: boolean
  minWidth?: number
  category: 'stats' | 'chart' | 'list' | 'action'
}

interface WidgetProps {
  data: any
  loading: boolean
  error?: Error
  onRefresh?: () => void
}
```

**Widget Registry**:
```typescript
const WIDGET_REGISTRY: Record<string, WidgetConfig> = {
  'total-budget': {
    id: 'total-budget',
    title: 'Presupuesto Total',
    component: BudgetWidget,
    defaultVisible: true,
    category: 'stats'
  },
  // ... more widgets
}
```

### 3. Modal Components

#### FinanceModal Component

**Purpose**: Unified modal for income/expense registration

**Location**: `src/components/dashboard/modals/FinanceModal.tsx`

**Interface**:
```typescript
interface FinanceModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'income' | 'expense'
  projects: Project[]
  onSubmit: (data: FinanceFormData) => Promise<void>
}

interface FinanceFormData {
  projectId: string
  amount: number
  date: string
  description: string
  category: string
}
```

**Features**:
- Form validation with error messages
- Project selector dropdown
- Amount input with currency formatting
- Date picker
- Category selector
- Submit with loading state
- Cancel button
- Keyboard shortcuts (Esc to close, Enter to submit)

#### VisitScheduleModal Component

**Purpose**: Schedule project visits

**Location**: `src/components/dashboard/modals/VisitScheduleModal.tsx`

**Interface**:
```typescript
interface VisitScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
  onSubmit: (data: VisitFormData) => Promise<void>
}

interface VisitFormData {
  projectId: string
  date: string
  time: string
  visitor: string
  purpose: string
  notes?: string
}
```

### 4. Layout Components

#### Layout Component

**Purpose**: Main application layout wrapper

**Location**: `src/components/Layout.tsx` (existing, to be enhanced)

**Enhancements**:
```typescript
// Add theme class to root container
<div className={cn(
  "min-h-screen transition-colors duration-200",
  isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
)}>
  <Header />
  <Sidebar />
  <main>{children}</main>
</div>
```

#### Header Component

**Purpose**: Top navigation bar

**Location**: `src/components/Header.tsx` (existing, to be enhanced)

**Enhancements**:
- Add DarkModeToggle (compact variant)
- Apply theme-aware styling
- Ensure responsive behavior

**Theme Classes**:
```typescript
className={cn(
  "header-container transition-colors duration-200",
  isDarkMode 
    ? "bg-gray-800 border-gray-700" 
    : "bg-white border-gray-200"
)}
```

#### Sidebar Component

**Purpose**: Side navigation menu

**Location**: `src/components/Sidebar.tsx` (existing, to be enhanced)

**Enhancements**:
- Apply theme-aware styling to all nav items
- Update hover/active states for both themes
- Ensure icon colors adapt to theme

**Theme Classes**:
```typescript
// Container
className={cn(
  "sidebar-container transition-colors duration-200",
  isDarkMode 
    ? "bg-gray-800 border-gray-700" 
    : "bg-white border-gray-200"
)}

// Nav items
className={cn(
  "nav-item transition-colors duration-200",
  isActive
    ? isDarkMode 
      ? "bg-gray-700 text-white" 
      : "bg-blue-50 text-blue-600"
    : isDarkMode
      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
)}
```

## Data Models

### Theme Configuration

```typescript
type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeConfig {
  mode: ThemeMode
  systemPreference: 'light' | 'dark'
  lastUpdated: string
}

interface ThemeColors {
  light: ColorScheme
  dark: ColorScheme
}

interface ColorScheme {
  background: {
    primary: string
    secondary: string
    tertiary: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
  }
  border: {
    primary: string
    secondary: string
  }
  accent: {
    blue: string
    green: string
    orange: string
    red: string
  }
}
```

### Dashboard Configuration

```typescript
interface DashboardConfig {
  widgets: WidgetVisibility
  timeFilter: TimeFilter
  autoRefresh: boolean
  refreshInterval: number // milliseconds
  layout: 'grid' | 'list'
  version: number
}

interface WidgetVisibility {
  [widgetId: string]: boolean
}

type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'custom'

interface DateRange {
  start: string // ISO date
  end: string // ISO date
}
```

### Dashboard Data

```typescript
interface DashboardData {
  stats: DashboardStats
  charts: DashboardCharts
  notifications: Notification[]
  lastUpdated: string
}

interface DashboardStats {
  totalBudget: number
  budgetUtilization: number
  activeProjects: number
  teamMembers: number
  upcomingDeadlines: Deadline[]
  recentActivity: Activity[]
}

interface DashboardCharts {
  budgetData: ChartDataPoint[]
  projectProgress: ChartDataPoint[]
  teamPerformance: ChartDataPoint[]
  expensesByCategory: ChartDataPoint[]
}

interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: Record<string, any>
}
```



## Error Handling

### Error Boundary Strategy

**Granular Error Boundaries**: Wrap each major widget/chart in its own ErrorBoundary to prevent cascade failures

```typescript
interface ErrorBoundaryProps {
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  children: React.ReactNode
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}
```

**Error Boundary Hierarchy**:
```
<Dashboard>
  <ErrorBoundary name="stats">
    <DashboardStats />
  </ErrorBoundary>
  
  <ErrorBoundary name="charts">
    <DashboardCharts>
      <ErrorBoundary name="budget-chart">
        <BudgetChart />
      </ErrorBoundary>
      <ErrorBoundary name="progress-chart">
        <ProgressChart />
      </ErrorBoundary>
    </DashboardCharts>
  </ErrorBoundary>
</Dashboard>
```

### Error Types and Handling

**Network Errors**:
- Display retry button
- Show cached data if available
- Notify user via notification system

**Validation Errors**:
- Inline form validation
- Clear error messages
- Highlight problematic fields

**Rendering Errors**:
- Caught by ErrorBoundary
- Display fallback UI
- Log to error tracking service

**Data Errors**:
- Validate data shape before rendering
- Provide safe defaults
- Show "No data available" state

### Loading States

**Skeleton Loaders**: Use specific skeleton components for each widget type

```typescript
// Stats cards
<StatsCardSkeleton count={4} />

// Charts
<ChartSkeleton type="bar" />
<ChartSkeleton type="line" />

// Lists
<ListItemSkeleton count={5} />
```

**Progressive Loading**:
1. Show skeleton immediately
2. Load critical data first (stats)
3. Load charts in background
4. Lazy load modals on demand

## Testing Strategy

### Unit Tests

**Components to Test**:
- ThemeProvider context logic
- useDarkMode hook
- DarkModeToggle component
- Dashboard widgets
- Modal forms
- Utility functions

**Test Coverage Goals**:
- Minimum 80% code coverage
- 100% coverage for critical paths (theme switching, data loading)

**Example Test Cases**:
```typescript
describe('useDarkMode', () => {
  it('should initialize from localStorage', () => {})
  it('should toggle between light and dark', () => {})
  it('should persist to localStorage', () => {})
  it('should detect system preference', () => {})
})

describe('DashboardStats', () => {
  it('should render all stat cards', () => {})
  it('should show skeleton when loading', () => {})
  it('should handle missing data gracefully', () => {})
  it('should apply theme classes correctly', () => {})
})
```

### Integration Tests

**Scenarios to Test**:
- Theme switching affects all components
- Dashboard data loading and display
- Modal workflows (open, fill, submit, close)
- Notification system integration
- Settings persistence

**Example Test**:
```typescript
describe('Dashboard Integration', () => {
  it('should load and display dashboard data', async () => {
    render(<Dashboard />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Presupuesto Total/i)).toBeInTheDocument()
    })
    
    // Verify stats are displayed
    expect(screen.getByText(/\$\d+/)).toBeInTheDocument()
  })
  
  it('should switch theme and update all components', () => {
    render(<Dashboard />)
    
    const toggle = screen.getByLabelText(/toggle dark mode/i)
    fireEvent.click(toggle)
    
    // Verify dark class is applied
    expect(document.documentElement).toHaveClass('dark')
    
    // Verify components update
    expect(screen.getByTestId('dashboard-container')).toHaveClass('bg-gray-900')
  })
})
```

### E2E Tests

**Critical User Flows**:
1. User opens dashboard → sees data
2. User switches theme → UI updates
3. User opens income modal → fills form → submits → sees success
4. User changes time filter → data refreshes
5. User opens settings → changes config → saves → persists

**Tools**: Playwright or Cypress

### Accessibility Tests

**Automated Testing**:
- Use jest-axe for automated a11y testing
- Test keyboard navigation
- Test screen reader compatibility

**Manual Testing**:
- Test with actual screen readers (NVDA, JAWS)
- Test keyboard-only navigation
- Test with high contrast mode
- Test with reduced motion preference

## Performance Optimization

### Code Splitting

**Lazy Load Components**:
```typescript
const DashboardSettings = lazy(() => import('./DashboardSettings'))
const FinanceModal = lazy(() => import('./modals/FinanceModal'))
const NotificationCenter = lazy(() => import('./NotificationCenter'))
```

**Route-based Splitting**:
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Projects = lazy(() => import('./pages/Projects'))
```

### Memoization

**React.memo for Pure Components**:
```typescript
export const StatsCard = React.memo(({ title, value, icon, trend }: StatsCardProps) => {
  // Component implementation
})

export const ChartWidget = React.memo(({ data, type }: ChartWidgetProps) => {
  // Component implementation
})
```

**useMemo for Expensive Calculations**:
```typescript
const chartData = useMemo(() => {
  return processChartData(rawData)
}, [rawData])

const filteredStats = useMemo(() => {
  return stats.filter(s => visibleWidgets[s.id])
}, [stats, visibleWidgets])
```

**useCallback for Event Handlers**:
```typescript
const handleExport = useCallback(async () => {
  await exportData('json')
}, [exportData])

const handleToggleWidget = useCallback((widgetId: string) => {
  updateWidgets({ [widgetId]: !widgets[widgetId] })
}, [widgets, updateWidgets])
```

### Data Fetching Optimization

**SWR or React Query** for data caching:
```typescript
const { data, error, isLoading, mutate } = useSWR(
  `/api/dashboard?filter=${timeFilter}`,
  fetcher,
  {
    refreshInterval: autoRefresh ? refreshInterval : 0,
    revalidateOnFocus: false,
    dedupingInterval: 5000
  }
)
```

**Debounce User Input**:
```typescript
const debouncedDateRange = useDebounce(dateRange, 500)

useEffect(() => {
  loadDashboardData(debouncedDateRange)
}, [debouncedDateRange])
```

### Bundle Size Optimization

**Tree Shaking**:
- Import only needed lodash functions: `import debounce from 'lodash/debounce'`
- Use named imports from libraries

**Icon Optimization**:
- Use lucide-react with tree shaking
- Import only used icons

**CSS Optimization**:
- Use Tailwind's purge feature
- Remove unused CSS classes

## Migration Strategy

### Phase 1: Preparation (Week 1)

**Tasks**:
1. Audit both dashboards and document differences
2. Create feature comparison matrix
3. Set up new file structure
4. Create ThemeProvider and useDarkMode hook
5. Write unit tests for theme system

**Deliverables**:
- Audit document
- Theme system implementation
- Test suite for theme system

### Phase 2: Theme Integration (Week 1-2)

**Tasks**:
1. Integrate ThemeProvider in App.tsx
2. Update Layout, Header, Sidebar with theme support
3. Create DarkModeToggle component
4. Apply theme classes to existing components
5. Test theme switching across all pages

**Deliverables**:
- Fully functional theme system
- Updated layout components
- Theme toggle in header

### Phase 3: Dashboard Unification (Week 2-3)

**Tasks**:
1. Create new unified Dashboard component
2. Migrate stats widgets from both dashboards
3. Migrate chart components
4. Implement widget configuration system
5. Add modal components
6. Integrate notification system

**Deliverables**:
- Unified Dashboard component
- All widgets functional
- Modals working
- Notifications integrated

### Phase 4: Testing and Refinement (Week 3-4)

**Tasks**:
1. Write comprehensive test suite
2. Perform accessibility audit
3. Optimize performance
4. Fix bugs and edge cases
5. Update documentation

**Deliverables**:
- Complete test coverage
- Accessibility compliance
- Performance benchmarks
- Updated documentation

### Phase 5: Cleanup and Deployment (Week 4)

**Tasks**:
1. Remove EnhancedDashboard.tsx
2. Update all routes and imports
3. Remove unused code and dependencies
4. Final QA testing
5. Deploy to production

**Deliverables**:
- Clean codebase
- Updated routes
- Production deployment

## Rollback Plan

**If Issues Arise**:
1. Keep EnhancedDashboard.tsx until unified version is stable
2. Use feature flag to toggle between old and new dashboard
3. Monitor error rates and user feedback
4. Quick rollback via route change if critical issues found

**Feature Flag Implementation**:
```typescript
const USE_UNIFIED_DASHBOARD = import.meta.env.VITE_USE_UNIFIED_DASHBOARD === 'true'

// In router
{
  path: '/dashboard',
  element: USE_UNIFIED_DASHBOARD ? <UnifiedDashboard /> : <EnhancedDashboard />
}
```

## Documentation Requirements

**Code Documentation**:
- JSDoc comments for all public components and hooks
- Inline comments for complex logic
- README for each major component directory

**User Documentation**:
- Dashboard user guide
- Theme customization guide
- Widget configuration guide

**Developer Documentation**:
- Architecture overview
- Component API reference
- Testing guide
- Contribution guidelines

