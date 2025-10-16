# API Reference - Dashboard Improvements

## 📋 Índice

1. [Componentes](#componentes)
2. [Hooks](#hooks)
3. [Tipos TypeScript](#tipos-typescript)
4. [Utilidades](#utilidades)
5. [Configuración](#configuración)

## 🧩 Componentes

### EnhancedDashboard

Componente principal del dashboard mejorado.

```tsx
import { EnhancedDashboard } from '@/pages/EnhancedDashboard'

function App() {
  return <EnhancedDashboard />
}
```

**Props:** Ninguna (componente de página)

**Características:**
- Orquesta todos los componentes del dashboard
- Maneja el estado global de la aplicación
- Implementa lazy loading automático
- Responsive design integrado

---

### DashboardCharts

Renderiza gráficos interactivos usando Recharts.

```tsx
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'

<DashboardCharts
  data={dashboardData}
  loading={false}
  error={null}
/>
```

#### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `data` | `DashboardData \| null` | ✅ | - | Datos para los gráficos |
| `loading` | `boolean` | ❌ | `false` | Estado de carga |
| `error` | `string \| null` | ❌ | `null` | Mensaje de error |

#### Tipos de Gráficos

- **AreaChart**: Utilización del presupuesto
- **BarChart**: Progreso de proyectos  
- **LineChart**: Rendimiento del equipo
- **PieChart**: Distribución de gastos

---

### DashboardFilters

Componente de filtros temporales para el dashboard.

```tsx
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'

<DashboardFilters
  currentFilter="month"
  onFilterChange={handleFilterChange}
  onExport={handleExport}
  onOpenSettings={handleOpenSettings}
  isExporting={false}
/>
```

#### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `currentFilter` | `TimeFilter` | ✅ | - | Filtro temporal actual |
| `onFilterChange` | `(filter: TimeFilter, range?: DateRange) => void` | ✅ | - | Callback al cambiar filtro |
| `onExport` | `() => void` | ✅ | - | Callback para exportar datos |
| `onOpenSettings` | `() => void` | ✅ | - | Callback para abrir configuración |
| `isExporting` | `boolean` | ❌ | `false` | Estado de exportación |

#### Filtros Disponibles

- `week`: Esta semana
- `month`: Este mes
- `quarter`: Este trimestre
- `year`: Este año
- `custom`: Rango personalizado

---

### NotificationCenter

Centro de notificaciones con filtrado y búsqueda.

```tsx
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'

<NotificationCenter
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  notifications={notifications}
  onMarkAsRead={markAsRead}
  onMarkAllAsRead={markAllAsRead}
  onRemoveNotification={removeNotification}
/>
```

#### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `isOpen` | `boolean` | ✅ | - | Estado del panel |
| `onClose` | `() => void` | ✅ | - | Callback para cerrar |
| `notifications` | `Notification[]` | ✅ | - | Array de notificaciones |
| `onMarkAsRead` | `(id: string) => void` | ✅ | - | Marcar como leída |
| `onMarkAllAsRead` | `() => void` | ✅ | - | Marcar todas como leídas |
| `onRemoveNotification` | `(id: string) => void` | ❌ | - | Eliminar notificación |

#### Funcionalidades

- Filtrado por tipo (`info`, `warning`, `success`, `error`)
- Filtrado por estado (`read`, `unread`)
- Búsqueda en tiempo real
- Acciones masivas
- Navegación por teclado

---

### DashboardSettings

Modal de configuración para personalizar widgets.

```tsx
import { DashboardSettings } from '@/components/dashboard/DashboardSettings'

<DashboardSettings
  isOpen={settingsOpen}
  onClose={() => setSettingsOpen(false)}
  widgets={widgets}
  onSaveSettings={saveSettings}
  onResetToDefault={resetToDefault}
/>
```

#### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `isOpen` | `boolean` | ✅ | - | Estado del modal |
| `onClose` | `() => void` | ✅ | - | Callback para cerrar |
| `widgets` | `DashboardWidget[]` | ✅ | - | Array de widgets |
| `onSaveSettings` | `(widgets: DashboardWidget[]) => void` | ✅ | - | Guardar configuración |
| `onResetToDefault` | `() => void` | ✅ | - | Reset a valores por defecto |

#### Pestañas Disponibles

- **Widgets**: Gestión de widgets
- **Apariencia**: Personalización visual
- **Preferencias**: Configuración general

---

### ChartErrorBoundary

Boundary para manejo de errores en gráficos.

```tsx
import { ChartErrorBoundary } from '@/components/dashboard/ChartErrorBoundary'

<ChartErrorBoundary>
  <SomeChartComponent />
</ChartErrorBoundary>
```

#### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `children` | `React.ReactNode` | ✅ | - | Componentes hijos |
| `fallback` | `React.ComponentType<ErrorInfo>` | ❌ | - | Componente de fallback personalizado |

---

### LoadingSkeletons

Componentes de skeleton para estados de carga.

```tsx
import { LoadingSkeletons } from '@/components/dashboard/LoadingSkeletons'

// Skeleton para gráficos
<LoadingSkeletons.Chart height={300} />

// Skeleton para tarjetas de estadísticas
<LoadingSkeletons.StatsCard />

// Skeleton para dashboard completo
<LoadingSkeletons.Dashboard />
```

#### Componentes Disponibles

- `Skeleton`: Skeleton base
- `Chart`: Skeleton para gráficos
- `StatsCard`: Skeleton para tarjetas
- `ListItem`: Skeleton para elementos de lista
- `Dashboard`: Skeleton para dashboard completo
- `Notification`: Skeleton para notificaciones
- `SettingsModal`: Skeleton para modal de configuración

## 🪝 Hooks

### useDashboardData

Hook principal para gestión de datos del dashboard.

```tsx
import { useDashboardData } from '@/hooks/useDashboardData'

const {
  data,
  loading,
  error,
  currentFilter,
  setFilter,
  refreshData
} = useDashboardData(options)
```

#### Parámetros

```tsx
interface UseDashboardDataOptions {
  autoRefresh?: boolean        // Default: false
  refreshInterval?: number     // Default: 30000 (30s)
  enableCache?: boolean        // Default: true
  cacheTimeout?: number        // Default: 300000 (5min)
  retryAttempts?: number       // Default: 3
  transformData?: (data: any) => DashboardData
}
```

#### Retorno

```tsx
interface UseDashboardDataReturn {
  data: DashboardData | null
  loading: boolean
  error: string | null
  currentFilter: TimeFilter
  setFilter: (filter: TimeFilter, range?: DateRange) => void
  refreshData: () => Promise<void>
}
```

#### Ejemplo Avanzado

```tsx
const { data, loading, error, setFilter } = useDashboardData({
  autoRefresh: true,
  refreshInterval: 60000, // 1 minuto
  enableCache: true,
  retryAttempts: 5,
  transformData: (rawData) => ({
    ...rawData,
    // Transformaciones personalizadas
    budgetUtilization: rawData.budget.map(item => ({
      ...item,
      percentage: Math.round(item.percentage)
    }))
  })
})
```

---

### useNotifications

Hook para el sistema de notificaciones.

```tsx
import { useNotifications } from '@/hooks/useNotifications'

const {
  notifications,
  unreadCount,
  isOpen,
  setIsOpen,
  markAsRead,
  markAllAsRead,
  addNotification,
  config,
  updateConfig
} = useNotifications(options)
```

#### Parámetros

```tsx
interface UseNotificationsOptions {
  enableRealTime?: boolean     // Default: true
  enableSound?: boolean        // Default: false
  enableDesktop?: boolean      // Default: false
  maxNotifications?: number    // Default: 50
  autoCleanupDays?: number     // Default: 7
}
```

#### Retorno

```tsx
interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  addNotification: (type: NotificationType, title: string, message: string, actionUrl?: string) => void
  config: NotificationConfig
  updateConfig: (config: Partial<NotificationConfig>) => void
}
```

#### Ejemplo de Uso

```tsx
const { addNotification, updateConfig } = useNotifications({
  enableRealTime: true,
  enableSound: true,
  maxNotifications: 100
})

// Agregar notificación personalizada
addNotification('success', 'Tarea Completada', 'La tarea se completó exitosamente')

// Configurar sonidos
updateConfig({ sound: true, desktop: true })
```

---

### useDashboardSettings

Hook para configuración persistente del dashboard.

```tsx
import { useDashboardSettings } from '@/hooks/useDashboardSettings'

const {
  widgets,
  settings,
  isOpen,
  setIsOpen,
  saveSettings,
  updateSettings,
  resetToDefault,
  exportSettings,
  importSettings
} = useDashboardSettings()
```

#### Retorno

```tsx
interface UseDashboardSettingsReturn {
  widgets: DashboardWidget[]
  settings: DashboardSettings
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  saveSettings: (widgets: DashboardWidget[]) => void
  updateSettings: (settings: Partial<DashboardSettings>) => void
  resetToDefault: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}
```

#### Ejemplo de Configuración

```tsx
const { widgets, saveSettings, updateSettings } = useDashboardSettings()

// Habilitar un widget
const updatedWidgets = widgets.map(widget =>
  widget.id === 'charts' ? { ...widget, enabled: true } : widget
)
saveSettings(updatedWidgets)

// Actualizar preferencias
updateSettings({
  preferences: {
    defaultTimeFilter: 'week',
    autoRefresh: true,
    refreshInterval: 15000
  }
})
```

---

### useDebounce

Hook para debouncing de valores y callbacks.

```tsx
import { useDebounce, useDebouncedCallback } from '@/hooks/useDebounce'

// Debounce de valores
const debouncedValue = useDebounce(value, 500)

// Debounce de callbacks
const debouncedCallback = useDebouncedCallback(
  (searchTerm: string) => {
    // Lógica de búsqueda
  },
  300,
  [dependencies]
)
```

## 📝 Tipos TypeScript

### DashboardData

```tsx
interface DashboardData {
  budgetUtilization: BudgetUtilization[]
  projectProgress: ProjectProgress[]
  teamPerformance: TeamPerformance[]
  expenseCategories: ExpenseCategory[]
}

interface BudgetUtilization {
  month: string
  budget: number
  spent: number
  percentage: number
}

interface ProjectProgress {
  project: string
  progress: number
  budget: number
  spent: number
}

interface TeamPerformance {
  month: string
  efficiency: number
  productivity: number
  quality: number
}

interface ExpenseCategory {
  category: string
  amount: number
  percentage: number
}
```

### Notification

```tsx
interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

type NotificationType = 'info' | 'warning' | 'success' | 'error'

interface NotificationConfig {
  enabled: boolean
  types: Record<NotificationType, boolean>
  sound: boolean
  desktop: boolean
}
```

### DashboardWidget

```tsx
interface DashboardWidget {
  id: string
  name: string
  description: string
  enabled: boolean
  position: number
}

interface DashboardSettings {
  widgets: DashboardWidget[]
  preferences: {
    defaultTimeFilter: TimeFilter
    autoRefresh: boolean
    refreshInterval: number
    notificationsEnabled: boolean
  }
  layout: {
    gridColumns: number
    compactMode: boolean
  }
}
```

### TimeFilter

```tsx
type TimeFilter = 'week' | 'month' | 'quarter' | 'year' | 'custom'

interface DateRange {
  startDate: Date
  endDate: Date
}
```

## 🛠️ Utilidades

### chartUtils

Utilidades para formateo y manipulación de datos de gráficos.

```tsx
import { 
  formatCurrency, 
  formatPercentage, 
  getTimeAgo,
  generateChartColors,
  transformDataForChart
} from '@/lib/chartUtils'

// Formatear moneda
const formatted = formatCurrency(150000) // "$150,000"

// Formatear porcentaje
const percentage = formatPercentage(0.85) // "85%"

// Tiempo relativo
const timeAgo = getTimeAgo(new Date()) // "hace 5 minutos"

// Colores para gráficos
const colors = generateChartColors(5) // Array de 5 colores

// Transformar datos
const chartData = transformDataForChart(rawData, 'area')
```

### notificationUtils

Utilidades para el sistema de notificaciones.

```tsx
import {
  createNotification,
  generateSampleNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  shouldShowNotification,
  playNotificationSound,
  showDesktopNotification,
  requestNotificationPermission
} from '@/lib/notificationUtils'

// Crear notificación
const notification = createNotification(
  'success',
  'Tarea Completada',
  'La tarea se completó exitosamente',
  '/tasks/123'
)

// Verificar si mostrar notificación
const shouldShow = shouldShowNotification(notification, config)

// Reproducir sonido
playNotificationSound()

// Mostrar notificación de escritorio
showDesktopNotification(notification)
```

### performanceUtils

Utilidades para optimización de performance.

```tsx
import {
  NotificationBatcher,
  createMemoizedSelector,
  DebouncedStorage,
  PerformanceMonitor
} from '@/lib/performanceUtils'

// Batching de notificaciones
const batcher = new NotificationBatcher(100)
batcher.add(() => updateNotification(data))

// Selector memoizado
const selectExpensiveData = createMemoizedSelector(
  (data: DashboardData) => data.budgetUtilization.reduce(/* cálculo costoso */)
)

// Storage con debounce
const storage = new DebouncedStorage(500)
storage.setItem('key', 'value')

// Monitor de performance
const monitor = PerformanceMonitor.getInstance()
const endTiming = monitor.startTiming('dashboard-render')
// ... código ...
endTiming()
```

## ⚙️ Configuración

### Configuración de Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['date-fns', 'lodash']
        }
      }
    }
  }
})
```

### Configuración de Testing

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts'
      ]
    }
  }
})
```

### Variables de Entorno

```env
# .env.development
VITE_API_BASE_URL=http://localhost:3001
VITE_ENABLE_MOCK_DATA=true
VITE_DEBUG_MODE=true

# .env.production
VITE_API_BASE_URL=https://api.production.com
VITE_ENABLE_MOCK_DATA=false
VITE_DEBUG_MODE=false
VITE_SENTRY_DSN=your-sentry-dsn
```

### Configuración de TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

Esta documentación de API proporciona una referencia completa para todos los componentes, hooks, tipos y utilidades del sistema de dashboard mejorado. Para ejemplos más específicos y casos de uso avanzados, consulta la [documentación principal](./DASHBOARD_IMPROVEMENTS.md).