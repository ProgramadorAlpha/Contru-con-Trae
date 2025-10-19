# Requirements Document

## Introduction

Este módulo transforma el flujo operativo de la empresa constructora, integrando la creación de presupuestos asistida por IA con un sistema completo de control financiero. El objetivo es proteger el capital de trabajo, automatizar la facturación, y proporcionar visibilidad total del flujo de caja desde la cotización hasta el cierre del proyecto.

El sistema debe permitir:
1. Crear presupuestos detallados con asistencia de IA (Claude)
2. Gestionar el ciclo completo: borrador → envío → aprobación → conversión a proyecto
3. Controlar automáticamente que no se ejecuten fases sin cobros previos
4. Generar alertas financieras para proteger la tesorería
5. Analizar rentabilidad real vs presupuestada al cierre

## Glossary

- **Sistema**: La aplicación web de gestión de construcción TRAE
- **Presupuesto**: Documento detallado con partidas, costos y plan de pagos que se envía al cliente para aprobación
- **Partida**: Línea de trabajo específica dentro de un presupuesto (ej: "Excavación y movimiento de tierras")
- **Fase**: Agrupación de partidas que se ejecutan juntas (ej: "Fase 1: Cimentación")
- **Cliente**: Persona o empresa que solicita y aprueba presupuestos
- **Conversión**: Proceso automático de transformar un presupuesto aprobado en un proyecto activo
- **Tesorería**: Capital disponible en el proyecto después de restar gastos de los cobros
- **Alerta Financiera**: Notificación automática sobre situaciones que requieren atención (cobros pendientes, tesorería baja, sobrecostos)
- **Bloqueo de Fase**: Restricción automática que impide iniciar una fase hasta cumplir condiciones de cobro
- **Plan de Pagos**: Calendario de cobros vinculado a hitos del proyecto (adelanto, fin de fase, entrega final)
- **Factura**: Documento de cobro generado automáticamente según el plan de pagos
- **Margen Bruto**: Diferencia entre ingresos totales y costos directos
- **Utilidad Neta**: Ganancia final después de restar todos los costos y gastos operativos

## Requirements

### Requirement 1: Gestión de Clientes

**User Story:** Como usuario del Sistema, quiero gestionar una base de datos de clientes con su información completa, para poder reutilizar sus datos en múltiples presupuestos y proyectos

#### Acceptance Criteria

1. THE Sistema SHALL almacenar para cada Cliente: nombre, empresa, email, teléfono, CIF, dirección completa, datos bancarios y estadísticas de facturación
2. WHEN el usuario crea un Presupuesto, THE Sistema SHALL permitir seleccionar un Cliente existente o crear uno nuevo
3. THE Sistema SHALL calcular automáticamente las estadísticas del Cliente: total de presupuestos, presupuestos aprobados, total facturado, total cobrado, proyectos activos y proyectos completados
4. THE Sistema SHALL actualizar las estadísticas del Cliente cada vez que cambia el estado de un Presupuesto o se registra un cobro
5. THE Sistema SHALL permitir buscar Clientes por nombre, empresa, email o teléfono

### Requirement 2: Creación de Presupuestos con IA

**User Story:** Como usuario del Sistema, quiero crear presupuestos detallados conversando con IA, para generar rápidamente partidas profesionales sin escribir todo manualmente

#### Acceptance Criteria

1. WHEN el usuario inicia la creación de un Presupuesto, THE Sistema SHALL proporcionar una interfaz de chat con IA para describir el proyecto
2. THE Sistema SHALL permitir al usuario adjuntar archivos (planos, bocetos, especificaciones) en la conversación con IA
3. WHEN la IA genera partidas y costos, THE Sistema SHALL mostrarlas en formato editable en tiempo real
4. THE Sistema SHALL permitir al usuario editar manualmente cualquier partida, precio o descripción generada por IA
5. THE Sistema SHALL organizar automáticamente las partidas en Fases numeradas con subtotales
6. THE Sistema SHALL calcular automáticamente: subtotal, IVA (21%) y total del Presupuesto
7. THE Sistema SHALL generar automáticamente un Plan de Pagos basado en las Fases del Presupuesto
8. THE Sistema SHALL guardar el historial de conversación con IA para poder retomar la edición posteriormente
9. THE Sistema SHALL almacenar metadatos de IA: modelo utilizado, nivel de confianza, número de iteraciones

### Requirement 3: Estados y Flujo de Presupuestos

**User Story:** Como usuario del Sistema, quiero que los presupuestos tengan estados claros y transiciones controladas, para saber en qué etapa está cada cotización

#### Acceptance Criteria

1. THE Sistema SHALL asignar a cada Presupuesto uno de estos estados: borrador, enviado, aprobado, rechazado, expirado, convertido
2. WHEN el usuario guarda un Presupuesto nuevo, THE Sistema SHALL asignarle el estado "borrador"
3. WHEN el usuario envía un Presupuesto al Cliente, THE Sistema SHALL cambiar el estado a "enviado" y registrar la fecha de envío
4. WHEN un Cliente visualiza un Presupuesto enviado, THE Sistema SHALL registrar la fecha de visualización
5. WHEN un Cliente aprueba un Presupuesto, THE Sistema SHALL cambiar el estado a "aprobado" y registrar la fecha de aprobación
6. WHEN un Cliente rechaza un Presupuesto, THE Sistema SHALL cambiar el estado a "rechazado", registrar la fecha y permitir capturar el motivo
7. WHEN la fecha de validez de un Presupuesto expira sin aprobación, THE Sistema SHALL cambiar automáticamente el estado a "expirado"
8. WHEN un Presupuesto aprobado se convierte en proyecto, THE Sistema SHALL cambiar el estado a "convertido" y vincular el ID del proyecto creado

### Requirement 4: Métricas y Dashboard de Presupuestos

**User Story:** Como usuario del Sistema, quiero ver métricas consolidadas de todos mis presupuestos, para entender mi tasa de conversión y volumen de negocio

#### Acceptance Criteria

1. THE Sistema SHALL mostrar en el dashboard de Presupuestos: total de presupuestos, cantidad aprobados con porcentaje, cantidad pendientes con porcentaje, cantidad rechazados con porcentaje
2. THE Sistema SHALL mostrar el monto total facturado de presupuestos aprobados
3. THE Sistema SHALL mostrar el monto total cobrado de presupuestos convertidos a proyectos
4. THE Sistema SHALL calcular el porcentaje de cobro (cobrado / facturado * 100)
5. THE Sistema SHALL permitir filtrar presupuestos por: estado, Cliente, rango de fechas, rango de montos
6. THE Sistema SHALL mostrar para cada Presupuesto en la lista: nombre del proyecto, Cliente, monto total, fecha de creación, estado actual, número de Fases, días de validez restantes, indicador si fue creado con IA

### Requirement 5: Conversión Automática a Proyecto

**User Story:** Como usuario del Sistema, quiero que al aprobar un presupuesto se cree automáticamente el proyecto con toda su estructura financiera, para no tener que duplicar información manualmente

#### Acceptance Criteria

1. WHEN un Presupuesto cambia a estado "aprobado", THE Sistema SHALL ofrecer al usuario la opción de convertirlo a proyecto
2. WHEN el usuario confirma la conversión, THE Sistema SHALL crear un nuevo proyecto copiando: nombre, Cliente, ubicación, Fases con partidas, montos presupuestados, Plan de Pagos
3. THE Sistema SHALL asignar al proyecto nuevo el estado inicial "En Planificación"
4. THE Sistema SHALL crear automáticamente una Factura de adelanto según el porcentaje definido en el Plan de Pagos
5. THE Sistema SHALL asignar a la Factura de adelanto el estado "Pendiente de pago"
6. THE Sistema SHALL vincular bidireccionalmente el Presupuesto y el proyecto creado
7. THE Sistema SHALL crear las Fases del proyecto con estado inicial "Pendiente" para la Fase 1 y "Bloqueada" para las demás
8. THE Sistema SHALL registrar en el historial del Presupuesto la fecha y usuario que realizó la conversión

### Requirement 6: Control de Tesorería por Proyecto

**User Story:** Como usuario del Sistema, quiero que el sistema calcule automáticamente la tesorería disponible de cada proyecto, para saber cuánto capital tengo antes de autorizar gastos

#### Acceptance Criteria

1. THE Sistema SHALL calcular la Tesorería de un proyecto como: suma de cobros - suma de gastos pagados
2. WHEN se registra un cobro en un proyecto, THE Sistema SHALL actualizar inmediatamente el cálculo de Tesorería
3. WHEN se registra un gasto pagado en un proyecto, THE Sistema SHALL actualizar inmediatamente el cálculo de Tesorería
4. THE Sistema SHALL mostrar la Tesorería actual en el dashboard del proyecto
5. THE Sistema SHALL mostrar un indicador visual (verde/amarillo/rojo) según el nivel de Tesorería: verde si es mayor al 50% del presupuesto de la próxima fase, amarillo si está entre 20-50%, rojo si es menor al 20%

### Requirement 7: Bloqueo Automático de Fases sin Cobro

**User Story:** Como usuario del Sistema, quiero que el sistema bloquee automáticamente las fases que no puedo ejecutar por falta de cobro, para proteger mi capital de trabajo

#### Acceptance Criteria

1. WHEN una Fase de un proyecto alcanza 100% de progreso, THE Sistema SHALL verificar si existe una Factura vinculada a esa Fase
2. IF no existe Factura para la Fase completada, THEN THE Sistema SHALL generar automáticamente una Factura según el Plan de Pagos
3. WHEN existe una Factura pendiente de cobro para una Fase completada, THE Sistema SHALL mantener bloqueada la siguiente Fase
4. THE Sistema SHALL mostrar en la Fase bloqueada el motivo: "Pendiente cobro Fase X"
5. WHEN una Factura vinculada a una Fase cambia a estado "Cobrada", THE Sistema SHALL desbloquear automáticamente la siguiente Fase
6. THE Sistema SHALL permitir al usuario forzar el desbloqueo de una Fase con confirmación explícita y registro en auditoría

### Requirement 8: Sistema de Alertas Financieras

**User Story:** Como usuario del Sistema, quiero recibir alertas automáticas sobre situaciones financieras críticas, para tomar decisiones antes de que se conviertan en problemas

#### Acceptance Criteria

1. WHEN la Tesorería de un proyecto es menor al 120% del costo estimado de la próxima fase, THE Sistema SHALL crear una Alerta Financiera de tipo "bajo_capital" con prioridad "crítica"
2. WHEN una Fase alcanza 100% de progreso sin cobro registrado, THE Sistema SHALL crear una Alerta Financiera de tipo "cobro_pendiente" con prioridad "alta"
3. WHEN los gastos reales de un proyecto superan el presupuesto original en más del 10%, THE Sistema SHALL crear una Alerta Financiera de tipo "sobrecosto" con prioridad "alta"
4. WHEN un pago a proveedor tiene fecha de vencimiento menor a la fecha actual, THE Sistema SHALL crear una Alerta Financiera de tipo "pago_vencido" con prioridad "media"
5. THE Sistema SHALL mostrar todas las Alertas Financieras activas en el dashboard de Finanzas
6. THE Sistema SHALL permitir al usuario marcar una Alerta Financiera como "resuelta" con nota explicativa
7. THE Sistema SHALL agrupar las Alertas Financieras por prioridad: crítica (rojo), alta (naranja), media (amarillo), baja (azul)

### Requirement 9: Generación Automática de Facturas

**User Story:** Como usuario del Sistema, quiero que las facturas se generen automáticamente según el plan de pagos del proyecto, para no olvidar cobros y mantener el flujo de caja

#### Acceptance Criteria

1. WHEN un Presupuesto se convierte a proyecto, THE Sistema SHALL crear automáticamente la Factura de adelanto según el Plan de Pagos
2. WHEN una Fase alcanza 100% de progreso, THE Sistema SHALL crear automáticamente la Factura correspondiente según el Plan de Pagos
3. THE Sistema SHALL asignar a cada Factura: número consecutivo único, Cliente, proyecto vinculado, monto, fecha de emisión, fecha de vencimiento, estado inicial "Pendiente de pago"
4. THE Sistema SHALL permitir al usuario editar una Factura antes de enviarla al Cliente
5. WHEN el usuario envía una Factura, THE Sistema SHALL cambiar el estado a "Enviada" y registrar la fecha de envío
6. THE Sistema SHALL permitir al usuario marcar una Factura como "Cobrada" registrando fecha y método de pago
7. WHEN una Factura cambia a estado "Cobrada", THE Sistema SHALL actualizar automáticamente la Tesorería del proyecto

### Requirement 10: Dashboard de Finanzas

**User Story:** Como usuario del Sistema, quiero ver un dashboard consolidado con todas las métricas financieras de mi empresa, para tomar decisiones informadas sobre el negocio

#### Acceptance Criteria

1. THE Sistema SHALL mostrar en el dashboard de Finanzas: ingresos totales, gastos totales, utilidad neta, variación porcentual vs período anterior
2. THE Sistema SHALL mostrar el total de pagos pendientes a proveedores con cantidad de pagos que vencen hoy
3. THE Sistema SHALL mostrar el margen bruto promedio de todos los proyectos con indicador visual de salud (verde >25%, amarillo 15-25%, rojo <15%)
4. THE Sistema SHALL mostrar la tesorería total disponible sumando todos los proyectos activos
5. THE Sistema SHALL proporcionar acceso rápido a submódulos: Control de Gastos, Facturación, Presupuestos, Reportes, Flujo de Caja, Proveedores
6. THE Sistema SHALL mostrar un resumen de Alertas Financieras activas agrupadas por prioridad

### Requirement 11: Análisis de Rentabilidad al Cierre

**User Story:** Como usuario del Sistema, quiero ver un análisis detallado de rentabilidad cuando cierro un proyecto, para aprender qué salió bien o mal y mejorar futuros presupuestos

#### Acceptance Criteria

1. WHEN un proyecto alcanza estado "Completado", THE Sistema SHALL generar automáticamente un reporte de análisis financiero
2. THE Sistema SHALL mostrar en el análisis: presupuesto original, cambios aprobados, total facturado, total cobrado
3. THE Sistema SHALL desglosar los costos directos por categoría: subcontratistas, materiales, maquinaria
4. THE Sistema SHALL desglosar los gastos operativos por categoría: personal propio, transporte, permisos/licencias
5. THE Sistema SHALL calcular: Margen Bruto (ingresos - costos directos), Utilidad Neta (Margen Bruto - gastos operativos), ROI porcentual
6. THE Sistema SHALL comparar cada categoría de costo contra el presupuesto original mostrando variación porcentual
7. THE Sistema SHALL mostrar tiempo de ejecución real vs planificado con variación en días
8. THE Sistema SHALL permitir al usuario agregar notas explicativas sobre variaciones significativas
9. THE Sistema SHALL permitir exportar el análisis completo en formato PDF

### Requirement 12: Versionado de Presupuestos

**User Story:** Como usuario del Sistema, quiero poder crear versiones de un presupuesto cuando el cliente pide cambios, para mantener historial de negociación

#### Acceptance Criteria

1. THE Sistema SHALL asignar versión 1 a todo Presupuesto nuevo
2. WHEN el usuario crea una nueva versión de un Presupuesto existente, THE Sistema SHALL copiar todos los datos y incrementar el número de versión
3. THE Sistema SHALL mantener vinculadas todas las versiones de un mismo Presupuesto
4. THE Sistema SHALL permitir al usuario comparar dos versiones mostrando diferencias en partidas y montos
5. THE Sistema SHALL mostrar en la lista de presupuestos el número de versión actual
6. WHEN se aprueba una versión específica, THE Sistema SHALL marcar las demás versiones como "Obsoletas"

### Requirement 13: Envío y Visualización de Presupuestos

**User Story:** Como usuario del Sistema, quiero enviar presupuestos por email con un link de visualización profesional, para que el cliente pueda revisarlos fácilmente

#### Acceptance Criteria

1. WHEN el usuario envía un Presupuesto, THE Sistema SHALL generar un PDF profesional con: logo de la empresa, datos del Cliente, partidas detalladas por Fase, Plan de Pagos, condiciones, espacio para firma
2. THE Sistema SHALL enviar un email al Cliente con: PDF adjunto, link único para visualizar online, fecha de validez, instrucciones para aprobar/rechazar
3. THE Sistema SHALL crear una página web pública (sin login) accesible mediante el link único
4. THE Sistema SHALL mostrar en la página pública: presupuesto completo, botones para "Aprobar" y "Rechazar", campo para comentarios
5. WHEN el Cliente hace clic en "Aprobar", THE Sistema SHALL cambiar el estado del Presupuesto a "aprobado" y notificar al usuario
6. WHEN el Cliente hace clic en "Rechazar", THE Sistema SHALL cambiar el estado a "rechazado", guardar los comentarios y notificar al usuario
7. THE Sistema SHALL registrar cada vez que el Cliente visualiza el link (tracking de apertura)

### Requirement 14: Firma Digital de Presupuestos

**User Story:** Como usuario del Sistema, quiero que tanto yo como el cliente podamos firmar digitalmente los presupuestos aprobados, para tener validez legal sin papeles

#### Acceptance Criteria

1. WHEN un Presupuesto está en estado "aprobado", THE Sistema SHALL permitir al usuario firmarlo digitalmente
2. THE Sistema SHALL capturar para cada firma: tipo (empresa/cliente), nombre del firmante, fecha y hora, dirección IP, firma en formato base64
3. THE Sistema SHALL permitir firmar mediante: dibujo con mouse/touch, carga de imagen de firma, o firma electrónica certificada
4. WHEN ambas partes han firmado, THE Sistema SHALL generar un PDF final con las firmas incluidas
5. THE Sistema SHALL enviar automáticamente el PDF firmado por email a ambas partes
6. THE Sistema SHALL almacenar el PDF firmado en el storage del proyecto

### Requirement 15: Integración con Documentos Existentes

**User Story:** Como usuario del Sistema, quiero que los recibos y facturas escaneados con IA se vinculen automáticamente a los gastos del proyecto, para tener respaldo documental de cada transacción

#### Acceptance Criteria

1. WHEN se procesa un documento con IA y se detecta que es un gasto, THE Sistema SHALL permitir vincularlo a un proyecto existente
2. WHEN se registra un gasto en un proyecto, THE Sistema SHALL permitir adjuntar uno o más documentos como respaldo
3. THE Sistema SHALL mostrar en el detalle de cada gasto los documentos adjuntos con preview
4. WHEN se genera el análisis de rentabilidad, THE Sistema SHALL incluir links a los documentos respaldo de cada categoría de gasto
5. THE Sistema SHALL permitir buscar gastos por proyecto y filtrar por aquellos que tienen/no tienen documento adjunto
