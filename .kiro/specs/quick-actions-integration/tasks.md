# Plan de Implementación

- [x] 1. Crear estructura base de componentes y tipos




- [x] 1.1 Crear tipos base para Income


  - Crear archivo `src/types/income.ts` con interfaces Income, CreateIncomeDTO, IncomeStats
  - Exportar tipos desde el archivo
  - _Requisitos: 2.1, 2.2, 2.3_

- [x] 1.2 Crear tipos base para Visit


  - Crear archivo `src/types/visit.ts` con interfaces Visit, CreateVisitDTO
  - Incluir tipos para estados de visita y tipos de visita
  - _Requisitos: 4.1, 4.2, 4.3_



- [x] 1.3 Crear componente QuickActionButton reutilizable

  - Crear archivo `src/components/dashboard/QuickActionButton.tsx`
  - Implementar props para label, icon, color, onClick, disabled
  - Aplicar estilos según color (blue, red, purple)
  - Añadir estados hover y focus


  - Implementar atributos ARIA para accesibilidad
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2_

- [x] 1.4 Crear componente QuickActions principal

  - Crear archivo `src/components/dashboard/QuickActions.tsx`

  - Renderizar tres botones usando QuickActionButton
  - Implementar gestión de estado para modales (activeModal)
  - Añadir diseño responsivo con grid CSS
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.5 Integrar QuickActions en EnhancedDashboard

  - Importar QuickActions en `src/pages/EnhancedDashboard.tsx`
  - Ubicar después del encabezado y antes de las estadísticas
  - Añadir al sistema de widgets configurables con id 'quick-actions'
  - _Requisitos: 1.1_

- [x] 2. Implementar funcionalidad de Añadir Ingreso



- [x] 2.1 Crear servicio de ingresos


  - Crear archivo `src/services/incomeService.ts`
  - Implementar método createIncome con validaciones
  - Implementar métodos getIncome, updateIncome, deleteIncome
  - Implementar método getIncomesByProject
  - Añadir mock data para desarrollo
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 2.2 Crear componente AddIncomeModal


  - Crear archivo `src/components/dashboard/modals/AddIncomeModal.tsx`
  - Implementar formulario con campos: proyecto, monto, fecha, descripción
  - Añadir selector de proyecto con búsqueda
  - Implementar input numérico con formato de moneda
  - Añadir date picker para fecha
  - Implementar validación en tiempo real
  - _Requisitos: 2.1, 2.2, 2.3, 2.4_

- [x] 2.3 Implementar validaciones y manejo de errores en AddIncomeModal

  - Validar monto mayor a 0
  - Validar fecha no futura (máximo 1 día adelante)
  - Validar descripción mínimo 5 caracteres
  - Mostrar mensajes de error específicos por campo
  - Deshabilitar botón guardar si hay errores
  - _Requisitos: 2.2, 2.3, 2.4, 5.1, 5.2, 5.3_

- [x] 2.4 Integrar AddIncomeModal con QuickActions


  - Conectar botón "Añadir Ingreso" con modal
  - Implementar apertura y cierre del modal
  - Llamar a incomeService.createIncome al enviar formulario
  - Mostrar notificación de éxito al guardar
  - Actualizar estadísticas del dashboard
  - _Requisitos: 2.5, 2.6, 5.3, 5.4_

- [x] 3. Implementar funcionalidad de Registrar Gasto



- [x] 3.1 Extender expenseService para quick actions


  - Añadir método createExpenseQuick en `src/services/expenseService.ts`
  - Simplificar validaciones para creación rápida
  - Mantener clasificación obligatoria (proyecto, costCode, supplier)
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.2 Crear componente RegisterExpenseModal


  - Crear archivo `src/components/dashboard/modals/RegisterExpenseModal.tsx`
  - Implementar formulario con campos obligatorios: proyecto, categoría, código de costo, monto, fecha, proveedor, descripción
  - Añadir selector de proyecto con búsqueda
  - Añadir selector de categoría de gasto
  - Añadir selector de código de costo (dependiente de categoría)
  - Añadir selector de proveedor con opción de creación rápida
  - _Requisitos: 3.1, 3.2, 3.3, 3.4_

- [x] 3.3 Implementar validaciones en RegisterExpenseModal

  - Validar todos los campos obligatorios
  - Validar monto mayor a 0
  - Validar descripción mínimo 5 caracteres
  - Validar que proyecto, costCode y supplier estén seleccionados
  - Mostrar mensajes de error específicos
  - _Requisitos: 3.2, 3.3, 3.4, 3.5, 5.1, 5.2_

- [x] 3.4 Integrar RegisterExpenseModal con QuickActions


  - Conectar botón "Registrar Gasto" con modal
  - Implementar apertura y cierre del modal
  - Llamar a expenseService.createExpenseQuick al enviar
  - Mostrar notificación de éxito al guardar
  - Actualizar estadísticas y gráficos del dashboard
  - _Requisitos: 3.6, 3.7, 5.3, 5.4_

- [x] 4. Implementar funcionalidad de Agendar Visita

- [x] 4.1 Crear servicio de visitas


  - Crear archivo `src/services/visitService.ts`
  - Implementar método createVisit con validaciones
  - Implementar métodos getVisit, updateVisit, cancelVisit, completeVisit
  - Implementar método getUpcomingVisits
  - Implementar método getVisitsByProject
  - Añadir mock data para desarrollo
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.2 Crear componente ScheduleVisitModal


  - Crear archivo `src/components/dashboard/modals/ScheduleVisitModal.tsx`
  - Implementar formulario con campos: proyecto, fecha, hora, tipo de visita, notas
  - Añadir selector de proyecto con búsqueda
  - Añadir date picker para fecha
  - Añadir time picker para hora
  - Añadir selector de tipo de visita
  - Añadir campo opcional de notas
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [x] 4.3 Implementar validaciones en ScheduleVisitModal

  - Validar que fecha y hora sean futuras
  - Validar que proyecto esté seleccionado
  - Validar que tipo de visita esté seleccionado
  - Prevenir visitas duplicadas (mismo proyecto, fecha y hora)
  - Mostrar mensajes de error específicos
  - _Requisitos: 4.2, 4.3, 4.4, 4.5, 5.1, 5.2_

- [x] 4.4 Integrar ScheduleVisitModal con QuickActions


  - Conectar botón "Agendar Visita" con modal
  - Implementar apertura y cierre del modal
  - Llamar a visitService.createVisit al enviar
  - Mostrar notificación de éxito al guardar
  - Actualizar lista de próximos vencimientos en dashboard
  - _Requisitos: 4.6, 4.7, 5.3, 5.4_

- [x] 5. Crear hook personalizado useQuickActions

- [x] 5.1 Implementar hook useQuickActions


  - Crear archivo `src/hooks/useQuickActions.ts`
  - Centralizar lógica de las tres acciones rápidas
  - Gestionar estados de carga (isLoading)
  - Gestionar errores (error, clearError)
  - Implementar función addIncome
  - Implementar función registerExpense
  - Implementar función scheduleVisit
  - Implementar función refreshDashboard
  - _Requisitos: 2.5, 2.6, 3.6, 3.7, 4.6, 4.7, 5.1, 5.2, 5.3_

- [x] 5.2 Refactorizar modales para usar useQuickActions


  - Actualizar AddIncomeModal para usar el hook
  - Actualizar RegisterExpenseModal para usar el hook
  - Actualizar ScheduleVisitModal para usar el hook
  - Eliminar lógica duplicada de los modales
  - _Requisitos: 5.1, 5.2, 5.3, 5.4_

- [x] 6. Implementar accesibilidad completa

- [x] 6.1 Añadir atributos ARIA a todos los componentes


  - Añadir aria-label a botones de acción rápida
  - Añadir role="dialog" y aria-modal="true" a modales
  - Añadir aria-labelledby y aria-describedby a modales
  - Añadir aria-required a campos obligatorios
  - Añadir aria-invalid y aria-errormessage a campos con error
  - _Requisitos: 6.2, 6.3_

- [x] 6.2 Implementar navegación por teclado


  - Permitir Tab para navegar entre campos
  - Permitir Enter para enviar formularios
  - Permitir Escape para cerrar modales
  - Implementar focus trap en modales abiertos
  - Restaurar foco al botón que abrió el modal al cerrar
  - _Requisitos: 6.3, 6.4_

- [x] 6.3 Verificar contraste de colores


  - Verificar ratio 4.5:1 en todos los botones
  - Verificar ratio 4.5:1 en texto sobre fondos de color
  - Ajustar colores si es necesario
  - _Requisitos: 6.1, 6.2_

- [x] 7. Optimizar rendimiento

- [x] 7.1 Implementar lazy loading de modales


  - Usar React.lazy() para cargar modales bajo demanda
  - Añadir Suspense con fallback de carga
  - Precargar modales al hacer hover sobre botones
  - _Requisitos: 1.1, 2.1, 3.1, 4.1_

- [x] 7.2 Implementar memoización


  - Memoizar QuickActionButton con React.memo()
  - Usar useMemo() para listas de proyectos
  - Usar useMemo() para listas de proveedores
  - Usar useCallback() para handlers de eventos
  - _Requisitos: 2.2, 3.2, 4.2_

- [x] 7.3 Implementar debouncing en búsquedas


  - Añadir debounce de 300ms en búsqueda de proyectos
  - Añadir debounce de 300ms en búsqueda de proveedores
  - Usar librería lodash.debounce o implementación custom
  - _Requisitos: 2.2, 3.2, 4.2_

- [x] 8. Implementar sistema de notificaciones

- [x] 8.1 Crear componente de notificación toast

  - Crear archivo `src/components/common/Toast.tsx` si no existe
  - Implementar diseño para notificaciones de éxito y error
  - Añadir animaciones de entrada y salida
  - Implementar auto-dismiss después de duración especificada
  - _Requisitos: 2.6, 3.7, 4.7, 5.3, 5.4_

- [x] 8.2 Integrar notificaciones en acciones rápidas

  - Mostrar toast de éxito al añadir ingreso
  - Mostrar toast de éxito al registrar gasto
  - Mostrar toast de éxito al agendar visita
  - Mostrar toast de error en caso de fallo
  - Incluir mensaje descriptivo en cada notificación
  - _Requisitos: 2.6, 3.7, 4.7, 5.3, 5.4_

- [x] 9. Actualizar dashboard después de acciones

- [x] 9.1 Implementar actualización de estadísticas

  - Actualizar "Presupuesto Total" después de añadir ingreso
  - Actualizar "Presupuesto Total" después de registrar gasto
  - Actualizar gráficos de gastos después de registrar gasto
  - Actualizar "Próximos Vencimientos" después de agendar visita
  - Implementar refresh selectivo para optimizar rendimiento
  - _Requisitos: 2.6, 3.7, 4.7_

- [x] 10. Añadir validaciones de seguridad

- [x] 10.1 Implementar sanitización de inputs


  - Sanitizar todos los campos de texto libre
  - Escapar HTML en descripciones y notas
  - Validar formatos de fecha y hora
  - Limitar longitud de campos de texto
  - _Requisitos: 2.3, 2.4, 3.4, 3.5, 4.4, 4.5_

- [x] 10.2 Implementar validación de permisos

  - Verificar permisos del usuario antes de mostrar botones
  - Validar permisos en servicios antes de guardar
  - Mostrar mensaje apropiado si usuario no tiene permisos
  - _Requisitos: 2.1, 3.1, 4.1_

- [x] 11. Escribir pruebas


- [x] 11.1 Escribir pruebas unitarias para componentes


  - Probar renderizado de QuickActions
  - Probar renderizado de QuickActionButton con diferentes props
  - Probar apertura y cierre de modales
  - Probar validación de formularios
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [x] 11.2 Escribir pruebas unitarias para servicios


  - Probar incomeService.createIncome con datos válidos e inválidos
  - Probar visitService.createVisit con datos válidos e inválidos
  - Probar expenseService.createExpenseQuick con datos válidos e inválidos
  - Probar validaciones de cada servicio
  - _Requisitos: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [x] 11.3 Escribir pruebas de integración

  - Probar flujo completo de añadir ingreso
  - Probar flujo completo de registrar gasto
  - Probar flujo completo de agendar visita
  - Probar actualización del dashboard después de cada acción
  - Probar manejo de errores end-to-end
  - _Requisitos: 2.5, 2.6, 3.6, 3.7, 4.6, 4.7, 5.3, 5.4_

- [x] 11.4 Escribir pruebas E2E

  - Probar interacción completa del usuario con "Añadir Ingreso"
  - Probar interacción completa del usuario con "Registrar Gasto"
  - Probar interacción completa del usuario con "Agendar Visita"
  - Probar validación de campos obligatorios
  - Probar cancelación de modales
  - Probar navegación por teclado
  - _Requisitos: 1.1, 2.1, 3.1, 4.1, 6.3, 6.4_

- [x] 12. Documentación y refinamiento final


- [x] 12.1 Documentar componentes con JSDoc


  - Añadir comentarios JSDoc a QuickActions
  - Añadir comentarios JSDoc a QuickActionButton
  - Añadir comentarios JSDoc a todos los modales
  - Documentar props e interfaces
  - _Requisitos: Todos_

- [x] 12.2 Refinar estilos y animaciones


  - Añadir transiciones suaves a botones
  - Añadir animaciones de entrada/salida a modales
  - Verificar diseño responsivo en diferentes tamaños
  - Ajustar espaciados y alineaciones
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1_

- [x] 12.3 Realizar code review y ajustes finales


  - Revisar código para mejores prácticas
  - Eliminar código duplicado
  - Optimizar imports
  - Verificar que todos los requisitos estén cumplidos
  - _Requisitos: Todos_
