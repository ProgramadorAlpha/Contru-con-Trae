# Dashboard Components

Este directorio contiene todos los componentes relacionados con el dashboard unificado de la aplicación.

## Estructura

```
dashboard/
├── config/              # Configuraciones
│   └── widgetConfig.ts  # Registro de widgets disponibles
├── modals/              # Modales del dashboard
│   ├── FinanceModal.tsx # Modal para ingresos/gastos
│   └── VisitScheduleModal.tsx # Modal para agendar visitas
├── ChartErrorBoundary.tsx # Error boundary para gráficos
├── DashboardCharts.tsx  # Componente de gráficos interactivos
├── DashboardFilters.tsx # Filtros temporales y controles
├── DashboardHeader.tsx  # Header del dashboard
├── DashboardSettings.tsx # Panel de configuración
├── DashboardSettingsLazy.tsx # Versión lazy-loaded
├── DashboardStats.tsx   # Tarjetas de estadísticas
├── LoadingSkeletons.tsx # Skeleton loaders
└── NotificationCenter.tsx # Centro de notificaciones
```

## Componentes Principales

### UnifiedDashboard
Componente principal que orquesta todo el dashboard. Combina las mejores características de Dashboard.tsx y EnhancedDashboard.tsx.

**Ubicación:** `src/pages/UnifiedDashboard.tsx`

**Características:**
- Modo oscuro completo
- Sistema de notificaciones en tiempo real
- Widgets configurables
- Auto-refresh de datos
- Exportación de datos
- Skeleton loaders
- Error boundaries

### DashboardHeader
Header del dashboard con controles principales.

**Props:**
- `title`: Título del dashboard
- `subtitle`: Subtítulo opcional
- `onExport`: Callback para exportar datos
- `onOpenSettings`: Callback para abrir configuración
- `onToggleNotifications`: Callback para abrir notificaciones
- `isExporting`: Estado de exportación
- `unreadCount`: Contador de notificaciones no leídas

### DashboardStats
Grid de tarjetas de estadísticas con KPIs.

**Props:**
- `stats`: Array de datos de estadísticas
- `loading`: Estado de carga
- `isVisible`: Visibilidad del widget

**Formato de datos:**
```typescript
{
  title: string
  value: number
  icon: LucideIcon
  trend?: number
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  format?: 'number' | 'currency' | 'percentage'
}
```

### DashboardCharts
Componente de gráficos interactivos con Recharts.

**Props:**
- `budgetData`: Datos de presupuesto
- `projectProgressData`: Datos de progreso de proyectos
- `teamPerformanceData`: Datos de rendimiento del equipo
- `expensesByCategory`: Datos de gastos por categoría
- `timeFilter`: Filtro temporal actual
- `onChartInteraction`: Callback para interacciones
- `loading`: Estado de carga

**Características:**
- Soporte completo de modo oscuro
- Tooltips personalizados
- Leyendas interactivas
- Responsive design
- Error boundaries individuales

### DashboardFilters
Controles de filtrado temporal y acciones.

**Props:**
- `timeFilter`: Filtro temporal actual
- `onTimeFilterChange`: Callback para cambiar filtro
- `dateRange`: Rango de fechas personalizado
- `onDateRangeChange`: Callback para cambiar rango
- `onExport`: Callback para exportar
- `onToggleNotifications`: Callback para notificaciones
- `onOpenSettings`: Callback para configuración
- `notificationsEnabled`: Estado de notificaciones
- `isExporting`: Estado de exportación

### NotificationCenter
Panel lateral de notificaciones.

**Props:**
- `isOpen`: Estado de apertura
- `onClose`: Callback para cerrar
- `notifications`: Array de notificaciones
- `onMarkAsRead`: Callback para marcar como leída
- `onMarkAllAsRead`: Callback para marcar todas
- `onRemoveNotification`: Callback para eliminar

**Tipos de notificaciones:**
- `success`: Verde - Operaciones exitosas
- `error`: Rojo - Errores y alertas críticas
- `warning`: Amarillo - Advertencias
- `info`: Azul - Información general

## Modales

### FinanceModal
Modal unificado para registro de ingresos y gastos.

**Props:**
- `isOpen`: Estado de apertura
- `onClose`: Callback para cerrar
- `type`: 'income' | 'expense'
- `projects`: Lista de proyectos disponibles
- `onSubmit`: Callback para enviar formulario

**Características:**
- Validación de formularios
- Formateo de moneda
- Categorías predefinidas
- Keyboard shortcuts (Esc, Enter)
- Tema oscuro

### VisitScheduleModal
Modal para agendar visitas a obra.

**Props:**
- `isOpen`: Estado de apertura
- `onClose`: Callback para cerrar
- `projects`: Lista de proyectos disponibles
- `onSubmit`: Callback para enviar formulario

**Características:**
- Selectores de fecha y hora
- Validación de formularios
- Campos de visitante y propósito
- Notas opcionales
- Tema oscuro

## Configuración de Widgets

Los widgets disponibles están definidos en `config/widgetConfig.ts`.

**Categorías:**
- `stats`: Tarjetas de estadísticas
- `charts`: Gráficos y visualizaciones
- `lists`: Listas de información
- `actions`: Botones de acción rápida

**Ejemplo de uso:**
```typescript
import { WIDGET_REGISTRY, getWidgetConfig } from './config/widgetConfig'

// Obtener configuración de un widget
const statsConfig = getWidgetConfig('stats')

// Obtener widgets por categoría
const chartWidgets = getWidgetsByCategory('charts')

// Obtener widgets visibles por defecto
const defaultWidgets = getDefaultVisibleWidgets()
```

## Hooks Personalizados

### useDashboardData
Hook para gestión de datos del dashboard.

**Opciones:**
- `autoRefresh`: Habilitar auto-actualización
- `refreshInterval`: Intervalo en ms

**Retorna:**
- `data`: Datos del dashboard
- `loading`: Estado de carga
- `error`: Mensaje de error
- `exportData`: Función para exportar

### useDashboardSettings
Hook para gestión de configuración del dashboard.

**Retorna:**
- `widgets`: Array de widgets configurados
- `settings`: Configuración general
- `isOpen`: Estado del modal
- `setIsOpen`: Función para abrir/cerrar
- `saveSettings`: Función para guardar
- `resetToDefault`: Función para restaurar

### useNotifications
Hook para sistema de notificaciones.

**Opciones:**
- `enableRealTime`: Notificaciones en tiempo real
- `enableSound`: Sonidos de notificación
- `enableDesktop`: Notificaciones de escritorio
- `maxNotifications`: Máximo de notificaciones

**Retorna:**
- `notifications`: Array de notificaciones
- `unreadCount`: Contador de no leídas
- `isOpen`: Estado del panel
- `addNotification`: Función para agregar
- `markAsRead`: Función para marcar como leída
- `markAllAsRead`: Función para marcar todas
- `removeNotification`: Función para eliminar

## Skeleton Loaders

Componentes de carga para mejor UX:

- `StatsCardSkeleton`: Para tarjetas de estadísticas
- `ChartSkeleton`: Para gráficos
- `ListItemSkeleton`: Para items de lista

**Uso:**
```typescript
{loading ? (
  <StatsCardSkeleton />
) : (
  <StatsCard {...data} />
)}
```

## Error Boundaries

### ChartErrorBoundary
Error boundary específico para gráficos.

**Props:**
- `chartType`: Tipo de gráfico
- `onError`: Callback para errores

**Uso:**
```typescript
<ChartErrorBoundary chartType="budget-chart">
  <BudgetChart data={data} />
</ChartErrorBoundary>
```

## Tema Oscuro

Todos los componentes soportan modo oscuro usando el hook `useDarkMode`.

**Clases de tema:**
```typescript
// Backgrounds
isDarkMode ? 'bg-gray-800' : 'bg-white'

// Text
isDarkMode ? 'text-white' : 'text-gray-900'

// Borders
isDarkMode ? 'border-gray-700' : 'border-gray-200'

// Hover states
isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
```

## Accesibilidad

Todos los componentes siguen las mejores prácticas de accesibilidad:

- ARIA labels en controles interactivos
- Navegación completa por teclado
- Contraste de colores WCAG AA
- Focus indicators visibles
- Roles semánticos apropiados
- Tamaños mínimos de touch targets (44x44px)

## Performance

Optimizaciones implementadas:

- React.memo en componentes puros
- useMemo para cálculos costosos
- useCallback para event handlers
- Lazy loading de modales
- Code splitting
- Debouncing en operaciones frecuentes

## Testing

Los tests están organizados en:

- `__tests__/`: Tests unitarios de componentes
- `src/test/integration/`: Tests de integración
- `src/test/e2e/`: Tests end-to-end

**Ejecutar tests:**
```bash
npm test                    # Todos los tests
npm test DashboardStats     # Test específico
npm test -- --coverage      # Con cobertura
```

## Contribuir

Al agregar nuevos componentes:

1. Seguir la estructura de carpetas existente
2. Agregar soporte de tema oscuro
3. Implementar skeleton loaders
4. Agregar error boundaries cuando sea apropiado
5. Documentar props con JSDoc
6. Escribir tests unitarios
7. Verificar accesibilidad
8. Actualizar este README

## Ejemplos

Ver `src/pages/UnifiedDashboard.tsx` para un ejemplo completo de uso de todos los componentes.
