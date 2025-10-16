# Dashboard Unification & Global Dark Mode - Spec

## 📋 Overview

Este spec define el proyecto de unificación del dashboard y la implementación de un sistema de modo oscuro global en ConstructPro. El objetivo es consolidar Dashboard.tsx y EnhancedDashboard.tsx en un único componente robusto mientras se implementa un sistema de tema coherente en toda la aplicación.

## 🎯 Objectives

1. **Eliminar Duplicaciones**: Unificar dos componentes de dashboard en uno solo
2. **Modo Oscuro Global**: Implementar sistema de tema claro/oscuro en toda la app
3. **Mejorar UX**: Proporcionar experiencia visual coherente y personalizable
4. **Optimizar Performance**: Reducir bundle size y mejorar tiempos de carga
5. **Accesibilidad**: Cumplir con estándares WCAG AA en ambos temas

## 📚 Documents

### [requirements.md](./requirements.md)
Documento completo de requisitos con 15 user stories y criterios de aceptación detallados usando metodología EARS e INCOSE.

**Requisitos principales**:
- Auditoría y análisis de dashboards existentes
- Sistema de modo oscuro global con persistencia
- Dashboard unificado con widgets dinámicos
- Gestión financiera integrada
- Sistema de notificaciones en tiempo real
- Configuración personalizable
- Accesibilidad (WCAG AA)
- Limpieza y refactorización del código

### [design.md](./design.md)
Documento técnico de diseño con arquitectura, componentes, interfaces y estrategias de implementación.

**Secciones principales**:
- Arquitectura de alto nivel
- Sistema de temas (ThemeProvider, useDarkMode)
- Componentes del dashboard unificado
- Sistema de widgets modular
- Modales y formularios
- Modelos de datos
- Manejo de errores
- Estrategia de testing
- Optimización de performance
- Plan de migración (5 fases, 4 semanas)

### [tasks.md](./tasks.md)
Plan de implementación detallado con 15 fases y 60+ tareas incrementales.

**Fases de implementación**:
1. Auditoría y preparación
2. Sistema de tema global
3. Actualizar componentes de layout
4. Crear estructura del dashboard unificado
5. Sistema de widgets configurables
6. Modales de gestión financiera
7. Sistema de notificaciones
8. Configuración y personalización
9. Filtros y exportación
10. Auto-actualización de datos
11. Manejo de errores y loading states
12. Accesibilidad y optimización
13. Limpieza y refactorización
14. Testing integral
15. Deployment y monitoreo

## 🚀 Getting Started

### Para Ejecutar Tareas

1. **Abre el archivo tasks.md** en Kiro
2. **Haz click en "Start task"** junto a la tarea que quieres ejecutar
3. **Kiro ejecutará la tarea** con contexto completo de requirements y design
4. **Revisa los cambios** y continúa con la siguiente tarea

### Orden Recomendado

Las tareas están diseñadas para ejecutarse secuencialmente:
- **Phase 1-2**: Preparación y sistema de tema (base fundamental)
- **Phase 3**: Layout components (aplicar tema globalmente)
- **Phase 4-11**: Dashboard unificado (funcionalidades principales)
- **Phase 12-13**: Optimización y limpieza
- **Phase 14-15**: Testing y deployment

### Tests Opcionales

Las tareas marcadas con `*` son tests opcionales que pueden omitirse para un MVP más rápido. Puedes ejecutarlas más tarde cuando el core esté estable.

## 🎨 Key Features

### Theme System
- **Context API** para estado global
- **localStorage** para persistencia
- **prefers-color-scheme** para detección del sistema
- **Transiciones suaves** (200ms)
- **Toggle compacto** en header

### Unified Dashboard
- **Widgets configurables** (mostrar/ocultar)
- **Estadísticas con tendencias**
- **Gráficos interactivos** con ErrorBoundary
- **Modales** para ingresos/gastos/visitas
- **Notificaciones** en tiempo real
- **Filtros temporales** (día, semana, mes, año, custom)
- **Auto-actualización** configurable
- **Exportación** de datos (JSON)

### Accessibility
- **WCAG AA compliance** (contraste 4.5:1)
- **Keyboard navigation** completa
- **ARIA labels** descriptivos
- **Screen reader** compatible
- **Focus indicators** visibles

### Performance
- **Code splitting** (lazy loading)
- **React.memo** para componentes puros
- **useMemo/useCallback** para optimización
- **SWR/React Query** para caching
- **Tree shaking** de dependencias

## 📊 Architecture Overview

```
App (ThemeProvider)
├── Layout (theme-aware)
│   ├── Header (with DarkModeToggle)
│   ├── Sidebar (themed)
│   └── Main Content
│       └── UnifiedDashboard
│           ├── DashboardHeader
│           ├── DashboardFilters
│           ├── DashboardStats (widgets)
│           ├── DashboardCharts (graphs)
│           ├── DashboardModals (finance, visits)
│           ├── NotificationCenter
│           └── DashboardSettings
```

## 🔧 Technical Stack

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS (dark mode: class)
- **State**: Context API + Custom Hooks
- **Charts**: Recharts (existing)
- **Icons**: lucide-react
- **Storage**: localStorage
- **Testing**: Jest + React Testing Library + Playwright/Cypress

## 📈 Success Metrics

- ✅ Un solo componente de dashboard (eliminar duplicación)
- ✅ Modo oscuro funcionando en toda la app
- ✅ Persistencia de preferencias de usuario
- ✅ Contraste WCAG AA en ambos temas
- ✅ Bundle size reducido (code splitting)
- ✅ Test coverage > 80%
- ✅ Lighthouse score > 90 (performance, a11y)

## 🐛 Rollback Plan

Si surgen problemas críticos:
1. Mantener EnhancedDashboard.tsx hasta que UnifiedDashboard esté estable
2. Usar feature flag para alternar entre versiones
3. Monitorear error rates en producción
4. Rollback rápido vía cambio de ruta si es necesario

## 📝 Notes

- **Contexto Requerido**: Al ejecutar tareas, Kiro tiene acceso automático a requirements.md y design.md
- **Incremental Development**: Cada tarea construye sobre la anterior
- **Testing Strategy**: Tests opcionales marcados con `*` para MVP rápido
- **Documentation**: Agregar JSDoc comments a componentes principales

## 🎉 Next Steps

1. **Revisa los documentos** (requirements, design, tasks)
2. **Comienza con Phase 1**: Auditoría y preparación
3. **Ejecuta tareas secuencialmente**: Una a la vez
4. **Valida después de cada fase**: Asegura que todo funciona
5. **Despliega cuando esté listo**: Después de testing integral

---

**Status**: ✅ Spec Complete - Ready for Implementation

**Created**: $(date)

**Estimated Duration**: 4 weeks (15 phases)

**Priority**: High
