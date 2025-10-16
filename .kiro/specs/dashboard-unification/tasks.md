









































# Implementation Plan

## Overview

Este plan de implementación desglosa el proyecto de unificación del dashboard y modo oscuro global en tareas incrementales y manejables. Cada tarea construye sobre las anteriores y está diseñada para ser ejecutada por un agente de código con contexto completo de los documentos de requisitos y diseño.

---

## Phase 1: Auditoría y Preparación

- [x] 1. Realizar auditoría completa de dashboards existentes





  - Analizar Dashboard.tsx y documentar todas sus funcionalidades, hooks y dependencias
  - Analizar EnhancedDashboard.tsx y documentar todas sus funcionalidades, hooks y dependencias
  - Crear matriz de comparación identificando duplicaciones y diferencias
  - Documentar decisiones sobre qué mantener, eliminar o mejorar de cada versión
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

---

## Phase 2: Sistema de Tema Global

- [x] 2. Implementar sistema de tema con Context API

- [x] 2.1 Crear ThemeContext y ThemeProvider


  - Crear archivo `src/contexts/ThemeContext.tsx`
  - Implementar ThemeContext con valores: isDarkMode, theme, toggleDarkMode, setDarkMode
  - Implementar ThemeProvider que gestione el estado del tema
  - Inicializar tema desde localStorage o preferencia del sistema
  - Aplicar clase 'dark' a document.documentElement según el estado
  - Persistir cambios de tema en localStorage con clave 'app-theme-mode'
  - Escuchar cambios en prefers-color-scheme cuando mode es 'system'
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 9.2, 9.3, 9.4, 9.5_


- [x] 2.2 Crear hook useDarkMode

  - Crear archivo `src/hooks/useDarkMode.ts` (actualizar el existente si es necesario)
  - Implementar hook que consuma ThemeContext
  - Retornar: isDarkMode, theme, toggleDarkMode, setDarkMode
  - Lanzar error si se usa fuera de ThemeProvider
  - Memoizar valores de retorno para optimizar re-renders
  - _Requirements: 2.1_


- [x] 2.3 Integrar ThemeProvider en App.tsx

  - Envolver la aplicación con ThemeProvider en `src/App.tsx`
  - Configurar tema por defecto según preferencia del sistema
  - Verificar que el tema se aplica correctamente al cargar la app
  - _Requirements: 2.3, 2.4, 2.5_


- [x] 2.4 Crear componente DarkModeToggle

  - Crear archivo `src/components/DarkModeToggle.tsx`
  - Implementar variante 'compact' (solo icono) para header
  - Implementar variante 'full' (icono + label) para settings
  - Usar iconos Sun/Moon de lucide-react
  - Aplicar transiciones suaves de 200ms
  - Agregar ARIA labels para accesibilidad
  - Hacer completamente navegable por teclado
  - _Requirements: 2.6, 7.2, 7.3, 10.2, 10.3_

- [x] 2.5 Escribir tests para sistema de tema





  - Crear tests unitarios para ThemeContext
  - Crear tests unitarios para useDarkMode hook
  - Crear tests unitarios para DarkModeToggle component
  - Verificar persistencia en localStorage
  - Verificar detección de preferencia del sistema
  - Verificar aplicación de clase 'dark' al document
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

---

## Phase 3: Actualizar Componentes de Layout

- [x] 3. Aplicar tema a componentes de layout existentes

- [x] 3.1 Actualizar Layout component


  - Modificar `src/components/Layout.tsx`
  - Integrar useDarkMode hook
  - Aplicar clases condicionales de tema al contenedor raíz
  - Usar patrón: bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
  - Aplicar transition-colors duration-200 para transiciones suaves
  - Asegurar que el tema se hereda a todos los componentes hijos
  - _Requirements: 7.1, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 3.2 Actualizar Header component


  - Modificar `src/components/Header.tsx`
  - Integrar DarkModeToggle (variante compact)
  - Aplicar clases de tema: bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
  - Actualizar colores de texto y hover states
  - Hacer responsive el toggle para mobile
  - Aplicar transiciones suaves a todos los cambios de color
  - _Requirements: 7.2, 7.3, 8.1, 8.2, 8.3, 8.5_


- [x] 3.3 Actualizar Sidebar component

  - Modificar `src/components/Sidebar.tsx`
  - Aplicar clases de tema al contenedor
  - Actualizar estilos de nav items para ambos temas
  - Implementar hover states temáticos
  - Implementar active states temáticos
  - Asegurar buena legibilidad en ambos temas
  - Aplicar transiciones suaves
  - _Requirements: 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.5_

- [x] 3.4 Escribir tests de integración para layout





  - Verificar que el tema se aplica a Layout, Header y Sidebar
  - Verificar que el toggle funciona correctamente
  - Verificar transiciones suaves
  - Verificar responsive behavior
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

---

## Phase 4: Crear Estructura del Dashboard Unificado

- [x] 4. Crear estructura base del dashboard unificado

- [x] 4.1 Crear componente DashboardHeader


  - Crear archivo `src/components/dashboard/DashboardHeader.tsx`
  - Implementar título y subtítulo con estilos temáticos
  - Agregar botón de exportación con estado de loading
  - Agregar botón de configuración
  - Integrar campana de notificaciones con badge de contador
  - Integrar DarkModeToggle (compact)
  - Hacer layout responsive (stack en mobile)
  - _Requirements: 3.1, 3.3, 3.6, 7.2_


- [x] 4.2 Crear componente DashboardStats

  - Crear archivo `src/components/dashboard/DashboardStats.tsx`
  - Implementar grid responsive (1-2-4 columnas)
  - Crear StatsCard component con: título, valor, icono, trend, color
  - Implementar formateo de valores (number, currency, percentage)
  - Agregar indicadores de tendencia (flechas arriba/abajo)
  - Aplicar estilos temáticos a todas las cards
  - Implementar skeleton loaders para estado de carga
  - Renderizar condicionalmente según visibilidad de widgets
  - _Requirements: 3.3, 15.1_


- [x] 4.3 Actualizar DashboardCharts con soporte de tema


  - Modificar `src/components/dashboard/DashboardCharts.tsx`
  - Agregar esquemas de color para modo oscuro en todos los gráficos
  - Implementar ErrorBoundary para cada gráfico individual
  - Agregar skeleton loaders específicos para cada tipo de gráfico
  - Optimizar con React.memo para prevenir re-renders innecesarios
  - Hacer gráficos completamente responsive
  - _Requirements: 3.3, 3.4, 3.5, 15.2, 15.3_

- [x] 4.4 Crear componente principal UnifiedDashboard


  - Crear archivo `src/pages/Dashboard.tsx` (reemplazar el existente)
  - Integrar hooks: useDarkMode, useDashboardData, useNotifications, useDashboardSettings
  - Implementar estados locales: timeFilter, dateRange, modals visibility
  - Componer estructura: DashboardHeader + DashboardFilters + DashboardStats + DashboardCharts
  - Aplicar clases de tema al contenedor principal
  - Implementar manejo de estados de loading y error
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 4.5 Escribir tests para componentes del dashboard






  - Tests unitarios para DashboardHeader
  - Tests unitarios para DashboardStats
  - Tests unitarios para StatsCard
  - Tests de integración para UnifiedDashboard
  - Verificar renderizado condicional de widgets
  - Verificar aplicación correcta de tema
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

---

## Phase 5: Sistema de Widgets Configurables

- [x] 5. Implementar sistema de widgets dinámicos


- [x] 5.1 Crear configuración de widgets

  - Crear archivo `src/components/dashboard/config/widgetConfig.ts`
  - Definir interface WidgetConfig con: id, title, component, defaultVisible, category
  - Crear WIDGET_REGISTRY con todos los widgets disponibles
  - Definir widgets: total-budget, active-projects, team-members, budget-chart, progress-chart, etc.
  - _Requirements: 3.2, 6.2_

- [x] 5.2 Implementar lógica de visibilidad de widgets

  - Actualizar UnifiedDashboard para usar WIDGET_REGISTRY
  - Implementar filtrado de widgets según configuración de visibilidad
  - Renderizar solo widgets visibles
  - Mantener orden consistente de widgets
  - _Requirements: 3.2, 6.2_


- [x] 5.3 Crear panel de configuración de widgets

  - Actualizar `src/components/dashboard/DashboardSettings.tsx`
  - Agregar sección de configuración de widgets
  - Implementar toggles para mostrar/ocultar cada widget
  - Agrupar widgets por categoría (stats, charts, lists, actions)
  - Aplicar estilos temáticos al panel
  - _Requirements: 6.1, 6.2, 6.6_

---

## Phase 6: Modales de Gestión Financiera

- [x] 6. Implementar modales para gestión financiera

- [x] 6.1 Crear FinanceModal component


  - Crear archivo `src/components/dashboard/modals/FinanceModal.tsx`
  - Implementar modal unificado que soporte type: 'income' | 'expense'
  - Crear formulario con campos: projectId, amount, date, description, category
  - Implementar validación de formulario con mensajes de error
  - Agregar selector de proyectos con dropdown
  - Implementar formateo de moneda en input de amount
  - Agregar date picker para selección de fecha
  - Implementar botones: Submit (con loading) y Cancel
  - Agregar keyboard shortcuts: Esc para cerrar, Enter para submit
  - Aplicar estilos temáticos al modal y formulario
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6.2 Crear VisitScheduleModal component


  - Crear archivo `src/components/dashboard/modals/VisitScheduleModal.tsx`
  - Implementar formulario con campos: projectId, date, time, visitor, purpose, notes
  - Implementar validación de formulario
  - Agregar selectores de fecha y hora
  - Implementar botones de acción con estados de loading
  - Aplicar estilos temáticos
  - _Requirements: 3.1_

- [x] 6.3 Integrar modales en UnifiedDashboard

  - Agregar estados para controlar visibilidad de modales
  - Implementar handlers para abrir/cerrar modales
  - Conectar modales con funciones de submit
  - Actualizar dashboard después de operaciones exitosas
  - Mostrar notificaciones de éxito/error
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6.4 Escribir tests para modales





  - Tests unitarios para FinanceModal
  - Tests unitarios para VisitScheduleModal
  - Tests de validación de formularios
  - Tests de integración con dashboard
  - Verificar keyboard shortcuts
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

---

## Phase 7: Sistema de Notificaciones

- [x] 7. Integrar sistema de notificaciones completo

- [x] 7.1 Verificar y mejorar NotificationCenter

  - Revisar `src/components/dashboard/NotificationCenter.tsx`
  - Asegurar soporte para tipos: success, error, warning, info
  - Implementar contador de notificaciones no leídas
  - Implementar panel lateral deslizable
  - Agregar funcionalidad de marcar como leída
  - Agregar funcionalidad de marcar todas como leídas
  - Agregar funcionalidad de eliminar notificaciones
  - Aplicar estilos temáticos completos
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_


- [x] 7.2 Implementar notificaciones automáticas

  - Agregar lógica en UnifiedDashboard para detectar alertas
  - Generar notificación cuando presupuesto > 90%
  - Generar notificación cuando hay deadlines próximos (≤ 3 días)
  - Generar notificación en errores de carga de datos
  - Generar notificación en operaciones exitosas (registro de ingresos/gastos)
  - _Requirements: 5.7, 4.5, 12.4, 12.5_


- [x] 7.3 Integrar notificaciones en header

  - Actualizar DashboardHeader con icono de campana
  - Mostrar badge con contador de no leídas
  - Implementar click handler para abrir NotificationCenter
  - Aplicar estilos temáticos al icono y badge
  - _Requirements: 5.2, 5.3_

- [x] 7.4 Escribir tests para sistema de notificaciones








  - Tests unitarios para NotificationCenter
  - Tests de integración con dashboard
  - Verificar generación automática de notificaciones
  - Verificar contador de no leídas
  - Verificar funcionalidades de marcar y eliminar
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

---

## Phase 8: Configuración y Personalización

- [x] 8. Implementar panel de configuración completo

- [x] 8.1 Mejorar DashboardSettings component

  - Actualizar `src/components/dashboard/DashboardSettings.tsx`
  - Implementar sección de configuración de widgets (ya hecho en 5.3)
  - Agregar sección de configuración de auto-refresh
  - Implementar selector de intervalo: desactivado, 30s, 1min, 5min
  - Agregar sección de filtro de tiempo por defecto
  - Implementar selector: día, semana, mes, año, personalizado
  - Agregar botón "Guardar configuración"
  - Agregar botón "Restaurar valores por defecto"
  - Aplicar estilos temáticos completos
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_


- [x] 8.2 Implementar persistencia de configuración

  - Guardar configuración en localStorage con clave 'dashboard-config'
  - Cargar configuración al iniciar dashboard
  - Aplicar configuración cargada a todos los widgets y filtros
  - Sincronizar cambios automáticamente
  - _Requirements: 6.5, 9.2, 9.3, 9.4, 9.5_


- [x] 8.3 Implementar funcionalidad de restaurar por defecto

  - Definir configuración por defecto en constante
  - Implementar función para restaurar valores por defecto
  - Actualizar localStorage al restaurar
  - Actualizar UI inmediatamente después de restaurar
  - _Requirements: 6.6, 9.4_

- [x] 8.4 Escribir tests para configuración







  - Tests unitarios para DashboardSettings
  - Tests de persistencia en localStorage
  - Tests de restauración de valores por defecto
  - Tests de integración con dashboard
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

---

## Phase 9: Filtros y Exportación

- [x] 9. Implementar filtros temporales y exportación

- [x] 9.1 Mejorar DashboardFilters component

  - Revisar `src/components/dashboard/DashboardFilters.tsx`
  - Asegurar filtros predefinidos: día, semana, mes, año, personalizado
  - Implementar selectores de fecha para rango personalizado
  - Agregar validación: fecha inicio < fecha fin
  - Mostrar rango de fechas actual de forma visible
  - Aplicar estilos temáticos
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 9.2 Implementar lógica de filtrado

  - Conectar filtros con useDashboardData hook
  - Recargar datos automáticamente al cambiar filtro
  - Implementar debounce para rangos personalizados
  - Actualizar todos los widgets y gráficos con datos filtrados
  - _Requirements: 13.3_

- [x] 9.3 Implementar funcionalidad de exportación

  - Crear función exportData en UnifiedDashboard
  - Soportar formato JSON con todos los datos actuales
  - Mostrar indicador de progreso durante exportación
  - Generar notificación de éxito al completar
  - Generar notificación de error si falla
  - Descargar archivo con nombre descriptivo: dashboard-export-{date}.json
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 9.4 Escribir tests para filtros y exportación





  - Tests unitarios para DashboardFilters
  - Tests de validación de rangos de fecha
  - Tests de función de exportación
  - Tests de integración con dashboard
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 12.1, 12.2, 12.3_

---

## Phase 10: Auto-actualización de Datos


- [ ] 10. Implementar sistema de auto-actualización
- [x] 10.1 Agregar lógica de auto-refresh en UnifiedDashboard

  - Implementar useEffect que escuche cambios en autoRefresh y refreshInterval
  - Crear setInterval para recargar datos según intervalo configurado
  - Limpiar interval al desmontar o cambiar configuración
  - Mostrar indicador visual sutil durante actualización en segundo plano
  - No interrumpir interacción del usuario durante actualización
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 10.2 Optimizar recarga de datos

  - Implementar debounce para evitar recargas excesivas
  - Usar SWR o React Query para caching inteligente
  - Revalidar solo datos necesarios
  - Mantener datos anteriores mientras se cargan nuevos
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 10.3 Escribir tests para auto-actualización





  - Tests de lógica de setInterval
  - Tests de limpieza de interval
  - Tests de actualización en segundo plano
  - Verificar que no interrumpe interacción del usuario
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

---

## Phase 11: Manejo de Errores y Loading States

- [x] 11. Mejorar manejo de errores y estados de carga

- [x] 11.1 Implementar skeleton loaders específicos

  - Revisar `src/components/dashboard/LoadingSkeletons.tsx`
  - Asegurar skeletons para: StatsCard, Charts (bar, line, pie), ListItems
  - Aplicar estilos temáticos a todos los skeletons
  - Usar skeletons en todos los componentes durante carga
  - _Requirements: 15.1_


- [x] 11.2 Implementar ErrorBoundary components

  - Revisar `src/components/dashboard/ChartErrorBoundary.tsx`
  - Crear ErrorBoundary genérico reutilizable
  - Envolver cada widget crítico en ErrorBoundary
  - Envolver cada gráfico en ErrorBoundary individual
  - Implementar fallback UI con mensaje de error y botón de retry
  - _Requirements: 15.2, 15.3_


- [x] 11.3 Mejorar mensajes de error

  - Crear componente ErrorMessage reutilizable
  - Mostrar mensajes descriptivos y útiles
  - Agregar botón "Reintentar" en errores de carga
  - Aplicar estilos temáticos a mensajes de error
  - _Requirements: 15.4, 15.5_

- [x] 11.4 Escribir tests para manejo de errores






  - Tests de ErrorBoundary
  - Tests de skeleton loaders
  - Tests de mensajes de error
  - Tests de botón de retry
  - Simular errores de red y renderizado
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

---

## Phase 12: Accesibilidad y Optimización


- [x] 12. Asegurar accesibilidad y optimizar performance

- [x] 12.1 Auditoría de accesibilidad

  - Verificar contraste de colores en ambos temas (mínimo 4.5:1)
  - Agregar ARIA labels a todos los controles interactivos
  - Verificar navegación completa por teclado
  - Probar con lectores de pantalla (NVDA, JAWS)

  - Verificar focus indicators visibles
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_


- [ ] 12.2 Implementar optimizaciones de performance
  - Aplicar React.memo a componentes puros (StatsCard, ChartWidget)
  - Usar useMemo para cálculos costosos (procesamiento de datos de gráficos)
  - Usar useCallback para event handlers

  - Implementar lazy loading para modales y NotificationCenter
  - Optimizar imports (tree shaking de lodash e iconos)
  - _Requirements: 3.5_


- [ ] 12.3 Implementar code splitting
  - Lazy load DashboardSettings
  - Lazy load FinanceModal y VisitScheduleModal
  - Lazy load NotificationCenter
  - Usar React.lazy y Suspense
  - _Requirements: 3.5_

- [ ]* 12.4 Escribir tests de accesibilidad
  - Tests con jest-axe para a11y automático
  - Tests de navegación por teclado
  - Tests de ARIA labels
  - Tests de focus management
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

---

## Phase 13: Limpieza y Refactorización

- [x] 13. Limpiar código y eliminar duplicaciones


- [x] 13.1 Eliminar EnhancedDashboard.tsx


  - Eliminar archivo `src/pages/EnhancedDashboard.tsx`
  - Buscar y eliminar todas las referencias a EnhancedDashboard
  - Actualizar imports en otros archivos
  - _Requirements: 11.1, 11.2_

- [x] 13.2 Actualizar rutas del router

  - Actualizar archivo de rutas para usar UnifiedDashboard
  - Asegurar que /dashboard apunta al nuevo componente
  - Eliminar rutas obsoletas
  - Verificar que todas las navegaciones funcionan
  - _Requirements: 11.2_



- [x] 13.3 Limpiar código

  - Eliminar todos los console.log de debugging
  - Eliminar código comentado no utilizado
  - Eliminar imports no utilizados
  - Optimizar imports (agrupar, ordenar)
  - Eliminar variables y funciones no utilizadas

  - _Requirements: 11.3, 11.4, 11.5_



- [ ] 13.4 Organizar estructura de archivos
  - Asegurar que componentes están en carpetas lógicas
  - Mover widgets a src/components/dashboard/widgets/
  - Mover modales a src/components/dashboard/modals/
  - Mover config a src/components/dashboard/config/
  - Crear archivo de constantes si es necesario


  - _Requirements: 11.6_

- [x] 13.5 Agregar documentación

  - Agregar JSDoc comments a componentes principales
  - Agregar JSDoc comments a hooks personalizados
  - Documentar props y tipos TypeScript
  - Crear README en carpeta dashboard/
  - Documentar ejemplos de uso
  - _Requirements: 11.6_


---

## Phase 14: Testing Integral

- [ ] 14. Ejecutar suite completa de tests
- [x] 14.1 Ejecutar tests unitarios

  - Ejecutar todos los tests unitarios
  - Verificar cobertura mínima del 80%
  - Corregir tests fallidos
  - _Requirements: Todos_

- [x] 14.2 Ejecutar tests de integración

  - Ejecutar tests de integración del dashboard
  - Verificar flujos completos: carga de datos, cambio de tema, modales
  - Corregir issues encontrados
  - _Requirements: Todos_

- [x] 14.3 Ejecutar tests E2E

  - Ejecutar tests end-to-end con Playwright/Cypress
  - Verificar flujos críticos de usuario
  - Verificar en diferentes navegadores

  - Corregir issues encontrados
  - _Requirements: Todos_


- [x] 14.4 Realizar testing manual




  - Probar dashboard en diferentes dispositivos (desktop, tablet, mobile)
  - Probar en diferentes navegadores (Chrome, Firefox, Safari, Edge)
  - Probar todos los flujos de usuario manualmente
  - Verificar accesibilidad con herramientas (Lighthouse, axe DevTools)
  - Documentar bugs encontrados y corregir
  - _Requirements: Todos_

---

## Phase 15: Deployment y Monitoreo

- [x] 15. Preparar para producción y desplegar


- [x] 15.1 Optimizar build de producción

  - Ejecutar build de producción
  - Verificar tamaño del bundle
  - Optimizar si es necesario (code splitting adicional)
  - Verificar que no hay warnings en build
  - _Requirements: Todos_


- [x] 15.2 Realizar QA final

  - Ejecutar checklist completo de QA
  - Verificar todas las funcionalidades en build de producción
  - Verificar performance (Lighthouse score)
  - Verificar accesibilidad (Lighthouse a11y score)

  - _Requirements: Todos_


- [x] 15.3 Desplegar a producción




  - Crear backup de versión actual
  - Desplegar nueva versión
  - Verificar que el despliegue fue exitoso
  - Monitorear errores en las primeras horas
  - Estar preparado para rollback si es necesario

  - _Requirements: Todos_


- [x] 15.4 Documentar y comunicar

  - Actualizar documentación de usuario
  - Crear guía de migración si es necesario
  - Comunicar cambios al equipo
  - Documentar lecciones aprendidas
  - _Requirements: Todos_

---

## Notas Importantes

- **Orden de Ejecución**: Las tareas deben ejecutarse en el orden especificado, ya que cada fase construye sobre la anterior
- **Tests Opcionales**: Las tareas marcadas con `*` son tests opcionales que pueden omitirse para un MVP más rápido
- **Contexto Requerido**: Al ejecutar cada tarea, asegúrate de tener acceso a los documentos de requirements.md y design.md
- **Validación**: Después de cada fase, verifica que todo funciona correctamente antes de continuar
- **Rollback**: Mantén EnhancedDashboard.tsx hasta que el UnifiedDashboard esté completamente funcional y probado
