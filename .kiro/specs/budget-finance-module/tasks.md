
# Implementation Plan

## Completed Foundation (Tasks 1-5)

- [x] 1. Setup base de datos y tipos
- [x] 1.1 Crear tipos TypeScript para el módulo
- [x] 1.2 Crear índices Firestore

- [x] 2. Implementar servicios de clientes
- [x] 2.1 Crear servicio de clientes
- [x] 2.2 Crear API de clientes
- [x] 2.3 Escribir tests para servicio de clientes

- [x] 3. Implementar componentes de clientes
- [x] 3.1 Crear componente ClienteSelector
- [x] 3.2 Crear componente ClienteFormModal
- [x] 3.3 Crear página de gestión de clientes

- [x] 4. Implementar servicio de IA para presupuestos
- [x] 4.1 Crear servicio de presupuesto IA
- [x] 4.2 Crear utilidades de presupuesto
- [x] 4.3 Escribir tests para servicio IA

- [x] 5. Implementar componentes de creación de presupuestos
- [x] 5.1 Crear componente IAPresupuestoChat
- [x] 5.2 Crear componente PresupuestoEditor
- [x] 5.3 Crear componentes de edición de fases y partidas (FaseEditor, PartidaEditor, PlanPagosEditor)
- [x] 5.4 Crear página de creación de presupuestos

## Core Services (Tasks 6-11)

- [x] 6. Implementar servicios de presupuestos
- [x] 6.1 Crear servicio de presupuestos
- [x] 6.2 Crear API de presupuestos
- [x] 6.3 Escribir tests para servicio de presupuestos


  - Crear `src/services/presupuesto.service.test.ts`
  - Test: crear presupuesto con estado "borrador"
  - Test: enviar presupuesto actualiza estado y fecha
  - Test: aprobar presupuesto registra fecha de aprobación
  - Test: verificar expiración marca presupuestos vencidos
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.7_

- [x] 7. Implementar dashboard y lista de presupuestos
- [x] 7.1 Crear componente PresupuestosDashboard



- [x] 7.2 Crear componente PresupuestosList

  - Crear `src/components/presupuestos/PresupuestosList.tsx`
  - Lista de presupuestos con paginación
  - Mostrar: nombre, cliente, monto, fecha, estado, fases, validez, indicador IA
  - Acciones: ver, editar, aprobar, rechazar, duplicar
  - _Requirements: 4.6_



- [x] 7.3 Crear componente PresupuestoFilters





  - Crear `src/components/presupuestos/PresupuestoFilters.tsx`
  - Filtros por: estado, cliente, rango de fechas, rango de montos
  - Aplicar filtros en tiempo real
  - _Requirements: 4.5_


- [x] 7.4 Mejorar página principal de presupuestos

  - Actualizar `src/pages/PresupuestosPage.tsx`
  - Integrar PresupuestosList y PresupuestoFilters
  - Mejorar navegación a detalle de presupuesto
  - _Requirements: 4.1, 4.5, 4.6_

- [x] 8. Implementar envío y visualización de presupuestos
- [x] 8.1 Mejorar utilidad de generación de PDF


  - Actualizar `src/utils/pdf-generator.utils.ts`
  - Instalar jsPDF y jspdf-autotable
  - Implementar `generarPDFPresupuesto()` completo con diseño profesional
  - Incluir: logo, datos cliente, fases con partidas, plan de pagos, totales
  - _Requirements: 13.1_

- [x] 8.2 Crear componente EnviarPresupuestoModal


  - Crear `src/components/presupuestos/EnviarPresupuestoModal.tsx`
  - Generar PDF del presupuesto
  - Crear link único de visualización (UUID)
  - Enviar email al cliente con PDF y link
  - Actualizar estado a "enviado"
  - _Requirements: 13.1, 13.2_

- [x] 8.3 Crear página pública de visualización


  - Crear `src/pages/public/PresupuestoPublicPage.tsx` (sin auth)
  - Mostrar presupuesto completo
  - Botones "Aprobar" y "Rechazar"
  - Campo para comentarios
  - Registrar visualización (tracking)
  - _Requirements: 13.3, 13.4, 13.7_

- [x] 8.4 Implementar aprobación/rechazo desde página pública

  - En PresupuestoPublicPage, implementar handlers para aprobar/rechazar
  - Actualizar estado del presupuesto
  - Enviar notificación al usuario
  - Guardar comentarios si rechaza
  - _Requirements: 13.5, 13.6_

- [x] 9. Implementar firma digital
- [x] 9.1 Crear componente FirmaDigitalModal



  - Crear `src/components/presupuestos/FirmaDigitalModal.tsx`
  - Permitir firmar con: dibujo (canvas), carga de imagen, firma electrónica
  - Capturar: tipo, nombre, fecha, IP, firma en base64
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 9.2 Mejorar generación de PDF firmado


  - Extender `pdf-generator.utils.ts`
  - Implementar `generarPDFPresupuestoFirmado()` completo incluyendo firmas
  - Enviar PDF firmado por email a ambas partes
  - Almacenar en Firebase Storage
  - _Requirements: 14.4, 14.5, 14.6_

- [x] 10. Implementar versionado de presupuestos
- [x] 10.1 Crear creación de versiones


  - En `presupuesto.service.ts`, agregar `crearVersionPresupuesto()`
  - Copiar todos los datos e incrementar número de versión
  - Vincular versiones entre sí
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 10.2 Crear componente de comparación de versiones


  - Crear `src/components/presupuestos/ComparadorVersiones.tsx`
  - Mostrar diferencias en partidas y montos
  - Resaltar cambios visualmente
  - _Requirements: 12.4_

- [x] 10.3 Actualizar UI para mostrar versiones

  - En PresupuestosList, mostrar número de versión
  - Al aprobar, marcar otras versiones como "Obsoletas"
  - _Requirements: 12.5, 12.6_

- [x] 11. Implementar servicio de conversión a proyecto
- [x] 11.1 Crear servicio de conversión (básico implementado)
- [x] 11.2 Mejorar generación de factura de adelanto



  - En conversion.service.ts, mejorar `crearFacturaAdelanto()`
  - Integrar con factura.service.ts
  - Asignar estado "Pendiente de pago"
  - _Requirements: 5.4, 5.5_

- [x] 11.3 Crear componente ConversionConfirmModal


  - Crear `src/components/presupuestos/ConversionConfirmModal.tsx`
  - Mostrar resumen del presupuesto
  - Confirmar conversión a proyecto
  - Mostrar progreso de conversión
  - Navegar al proyecto creado
  - _Requirements: 5.1, 5.8_

- [x] 11.4 Escribir tests para conversión





  - Crear `src/services/conversion.service.test.ts`
  - Test: conversión crea proyecto con datos correctos
  - Test: conversión crea factura de adelanto
  - Test: conversión actualiza estado de presupuesto
  - Test: no permite convertir presupuesto ya convertido
  - _Requirements: 5.1, 5.2, 5.4_

## Financial Control (Tasks 12-16)

- [x] 12. Implementar servicio de tesorería
- [x] 12.1 Mejorar servicio de tesorería


  - Actualizar `src/services/tesoreria.service.ts`
  - Implementar `calcularTesoreria()` completo: suma cobros - suma gastos pagados
  - Implementar `getIndicadorSalud()` basado en % vs próxima fase
  - Implementar `actualizarTesoreria()` al registrar cobro o gasto
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 12.2 Crear componente TesoreriaCard



  - Crear `src/components/finanzas/TesoreriaCard.tsx`
  - Mostrar tesorería actual del proyecto
  - Indicador visual de salud (verde/amarillo/rojo)
  - Comparar con costo de próxima fase
  - Desglose de cobros y gastos
  - _Requirements: 6.4, 6.5_

- [x] 12.3 Escribir tests para tesorería




  - Crear `src/services/tesoreria.service.test.ts`
  - Test: calcular tesorería correctamente (cobros - gastos)
  - Test: indicador verde cuando tesorería > 50% próxima fase
  - Test: indicador rojo cuando tesorería < 20% próxima fase
  - _Requirements: 6.1, 6.5_

- [x] 13. Implementar sistema de bloqueo de fases
- [x] 13.1 Crear servicio de bloqueo de fases


  - Crear `src/services/bloqueo-fases.service.ts`
  - Implementar `validarInicioFase()` que verifica cobro de fase anterior
  - Implementar `bloquearFase()` y `desbloquearFase()`
  - Implementar `verificarYBloquearFases()` ejecutado al completar fase
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 13.2 Integrar bloqueo en componentes de proyecto




  - Extender componentes de proyecto existentes
  - Mostrar motivo de bloqueo en fases bloqueadas
  - Deshabilitar botón "Iniciar fase" si está bloqueada
  - Permitir override con confirmación (admin)
  - _Requirements: 7.4, 7.6_

- [x] 13.3 Escribir tests para bloqueo de fases


  - Crear `src/services/bloqueo-fases.service.test.ts`
  - Test: Fase 1 puede iniciarse con adelanto cobrado
  - Test: Fase 2 bloqueada si Fase 1 no cobrada
  - Test: Fase 2 se desbloquea al cobrar Fase 1
  - _Requirements: 7.1, 7.3, 7.5_

- [x] 14. Implementar servicio de facturas
- [x] 14.1 Crear servicio de facturas (básico implementado)
- [x] 14.2 Crear API de facturas



  - Crear `src/api/facturas.api.ts`
  - Endpoints para CRUD de facturas
  - Endpoint para cambiar estados
  - Endpoint para obtener facturas por proyecto
  - _Requirements: 9.1_

- [x] 14.3 Integrar actualización de tesorería al cobrar




  - En factura.service.ts, al registrar cobro llamar a tesoreria.service
  - Actualizar tesorería del proyecto
  - Verificar y desbloquear siguiente fase si aplica
  - _Requirements: 9.7_

- [x] 14.4 Escribir tests para facturas


  - Crear `src/services/factura.service.test.ts`
  - Test: crear factura con número consecutivo
  - Test: registrar cobro actualiza tesorería
  - Test: generar factura automática al completar fase
  - _Requirements: 9.1, 9.2, 9.7_

- [x] 15. Implementar componentes de facturas
- [x] 15.1 Crear componente FacturasList


  - Crear `src/components/finanzas/FacturasList.tsx`
  - Lista de facturas con filtros por estado y proyecto
  - Mostrar: número, cliente, monto, fecha emisión, vencimiento, estado
  - Acciones: ver, editar, enviar, registrar cobro
  - _Requirements: 9.1, 9.3_

- [x] 15.2 Crear componente GenerarFacturaModal


  - Crear `src/components/finanzas/GenerarFacturaModal.tsx`
  - Formulario para crear factura manual
  - Vincular a proyecto y fase
  - Calcular fechas automáticamente
  - _Requirements: 9.1, 9.3_

- [x] 15.3 Crear componente RegistrarCobroModal



  - Crear `src/components/finanzas/RegistrarCobroModal.tsx`
  - Formulario para registrar cobro de factura
  - Campos: fecha, método de pago, referencia
  - Actualizar estado a "Cobrada"
  - _Requirements: 9.6, 9.7_

- [x] 16. Implementar sistema de alertas financieras
- [x] 16.1 Mejorar servicio de alertas



  - Actualizar `src/services/alerta.service.ts`
  - Implementar `verificarTesoreria()` completo para crear alerta si tesorería < 120% próxima fase
  - Implementar `verificarCobrosPendientes()` para alertar fase 100% sin cobro
  - Implementar `detectarSobrecostos()` para alertar si gastos > 110% presupuesto
  - Implementar `verificarPagosVencidos()` para alertar pagos vencidos
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

- [x] 16.2 Crear API de alertas




  - Crear `src/api/alertas.api.ts`
  - Endpoints para obtener alertas activas
  - Endpoint para resolver alerta
  - Endpoint para obtener alertas por proyecto
  - _Requirements: 8.5_

- [x] 16.3 Implementar ejecución automática de verificaciones




  - Crear hook o función que ejecute verificaciones periódicamente
  - Ejecutar al completar fase, registrar gasto, registrar cobro
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 16.4 Escribir tests para alertas


  - Crear `src/services/alerta.service.test.ts`
  - Test: crear alerta crítica cuando tesorería < 120% próxima fase
  - Test: crear alerta alta cuando fase 100% sin cobro
  - Test: crear alerta alta cuando sobrecosto > 10%
  - _Requirements: 8.1, 8.2, 8.3_

## Dashboard & Analytics (Tasks 17-19)

- [x] 17. Implementar componentes de alertas
- [x] 17.1 Crear componente AlertasPanel



  - Crear `src/components/finanzas/AlertasPanel.tsx`
  - Mostrar alertas agrupadas por prioridad
  - Colores: crítica (rojo), alta (naranja), media (amarillo), baja (azul)
  - Permitir marcar como resuelta con nota
  - Acciones rápidas: generar factura, enviar recordatorio
  - _Requirements: 8.5, 8.6, 8.7_

- [x] 17.2 Crear componente AlertaCard



  - Crear `src/components/finanzas/AlertaCard.tsx`
  - Mostrar título, mensaje, acción recomendada
  - Mostrar datos específicos según tipo de alerta
  - Botones de acción contextual
  - _Requirements: 8.5, 8.7_

- [x] 17.3 Integrar alertas en dashboard de finanzas



  - Actualizar FinanzasPage para mostrar resumen de alertas activas
  - Link a panel completo de alertas
  - Notificaciones in-app para alertas críticas
  - _Requirements: 10.6_

- [x] 18. Implementar dashboard de finanzas
- [x] 18.1 Crear componente FinanzasDashboard


  - Crear `src/components/finanzas/FinanzasDashboard.tsx`
  - Mostrar KPIs: ingresos totales, gastos totales, utilidad neta, variación %
  - Mostrar pagos pendientes con cantidad que vencen hoy
  - Mostrar margen bruto promedio con indicador de salud
  - Mostrar tesorería total disponible
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 18.2 Mejorar página de finanzas



  - Actualizar `src/pages/FinanzasPage.tsx`
  - Integrar FinanzasDashboard completo
  - Acceso rápido a submódulos: Control de Gastos, Facturación, Presupuestos, Reportes
  - Mostrar resumen de alertas
  - _Requirements: 10.5, 10.6_


- [x] 18.3 Implementar cálculo de métricas consolidadas

  - Crear `src/services/finanzas.service.ts`
  - Implementar `calcularMetricasFinanzas()`
  - Agregar datos de todos los proyectos activos
  - Implementar caché de 5 minutos para performance
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 19. Implementar análisis de rentabilidad




- [x] 19.1 Mejorar servicio de rentabilidad


  - Actualizar `src/services/rentabilidad.service.ts`
  - Implementar `calcularAnalisisRentabilidad()` completo al completar proyecto
  - Calcular: ingresos totales, costos directos, gastos operativos
  - Calcular: margen bruto, utilidad neta, ROI
  - Comparar cada categoría vs presupuesto original
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 19.2 Crear componente RentabilidadAnalysis


  - Crear `src/components/finanzas/RentabilidadAnalysis.tsx`
  - Mostrar análisis completo con gráficos
  - Tabla comparativa presupuesto vs real
  - Mostrar tiempo de ejecución vs planificado
  - Permitir agregar notas explicativas
  - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [x] 19.3 Implementar exportación a PDF


  - Extender pdf-generator.utils.ts
  - Implementar `generarPDFAnalisisRentabilidad()` completo
  - Incluir todos los datos y gráficos
  - _Requirements: 11.9_

## Integration & Polish (Tasks 20-22)

- [x] 20. Implementar integración con documentos



- [x] 20.1 Extender servicio de documentos


  - En documento.service.ts existente, agregar `vincularDocumentoAGasto()`
  - Permitir adjuntar múltiples documentos a un gasto
  - _Requirements: 15.1, 15.2_


- [x] 20.2 Actualizar UI de gastos

  - En componentes de gastos existentes, mostrar documentos adjuntos
  - Permitir ver preview de documentos
  - Permitir adjuntar documento al crear gasto
  - _Requirements: 15.2, 15.3_


- [x] 20.3 Integrar en análisis de rentabilidad

  - En RentabilidadAnalysis, incluir links a documentos respaldo
  - Agrupar documentos por categoría de gasto
  - _Requirements: 15.4, 15.5_

- [x] 21. Integración y navegación



- [x] 21.1 Actualizar navegación principal


  - Actualizar `src/components/Sidebar.tsx`
  - Agregar enlaces a: Presupuestos, Clientes, Finanzas
  - Agregar iconos apropiados
  - _Requirements: General UX_

- [x] 21.2 Crear rutas en App.tsx


  - Actualizar `src/App.tsx`
  - Agregar rutas para: /presupuestos, /presupuestos/crear, /presupuestos/:id
  - Agregar ruta para: /clientes, /finanzas
  - Configurar ruta pública: /presupuestos/public/:token
  - _Requirements: General UX_

- [x] 21.3 Actualizar dashboard principal


  - Actualizar `src/pages/EnhancedDashboard.tsx`
  - Agregar widgets de presupuestos y finanzas
  - Mostrar alertas financieras críticas
  - Links rápidos a crear presupuesto y ver finanzas
  - _Requirements: General UX_

- [x] 22. Instalación de dependencias

- [x] 22.1 Instalar librerías necesarias

  - Instalar jsPDF: `npm install jspdf`
  - Instalar jspdf-autotable: `npm install jspdf-autotable`
  - Instalar uuid: `npm install uuid`
  - Instalar @types/uuid: `npm install -D @types/uuid`
  - Actualizar package.json
  - _Requirements: Technical_

## Documentation (Task 23)

- [x] 23. Documentación y deployment






- [x] 23.1 Crear documentación de usuario
  - Crear `docs/PRESUPUESTOS_GUIDE.md` con guía de uso del módulo de presupuestos
  - Crear `docs/FINANZAS_GUIDE.md` con guía de uso del módulo de finanzas
  - Documentar flujo completo con screenshots
  - _Requirements: Documentation_


- [x] 23.2 Configurar reglas de seguridad Firestore

  - Actualizar firestore.rules para nuevas colecciones
  - Configurar permisos de lectura/escritura
  - Permitir acceso público a presupuestos con token válido
  - _Requirements: Security_


- [x] 23.3 Deploy de índices Firestore

  - Ejecutar comando para crear índices compuestos
  - Verificar que índices están activos en consola Firebase
  - _Requirements: Deployment_
