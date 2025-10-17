# Requirements Document: Job Costing & Subcontractor Management System

## Introduction

Este documento define los requisitos para transformar ConstructPro en un sistema ERP completo para construcción con capacidades de Job Costing real, gestión de subcontratos y automatización de gastos mediante OCR/n8n.

## Glossary

- **Job Costing**: Sistema de costeo por obra que permite rastrear y controlar costos específicos por proyecto
- **Cost Code**: Código de clasificación de costos (ej: Cimentación, Estructura, Acabados)
- **Subcontract**: Contrato con un subcontratista para realizar trabajo específico en un proyecto
- **Progress Certificate**: Certificación de avance de obra que autoriza un pago parcial
- **Holdback/Retention**: Porcentaje del pago retenido hasta la finalización satisfactoria del trabajo
- **Committed Cost**: Costo comprometido mediante contratos pero aún no pagado
- **Actual Cost**: Costo real ya pagado o incurrido
- **WBS**: Work Breakdown Structure - estructura de desglose del trabajo
- **OCR**: Optical Character Recognition - reconocimiento óptico de caracteres
- **n8n**: Plataforma de automatización de flujos de trabajo

## Requirements

### Requirement 1: Gestión de Contratos de Subcontratistas

**User Story:** Como Gerente de Proyecto, quiero crear y gestionar contratos con subcontratistas vinculados a proyectos específicos, para controlar los costos comprometidos y los pagos pendientes.

#### Acceptance Criteria

1. WHEN un usuario crea un nuevo contrato de subcontratista, THE System SHALL crear un registro de contrato vinculado a un Proyecto específico y a un Subcontratista
2. THE System SHALL permitir especificar el monto total contratado, porcentaje de retención, y esquema de pagos (adelanto, avances, final)
3. THE System SHALL calcular automáticamente el costo comprometido del proyecto sumando todos los contratos activos
4. WHEN un contrato es creado, THE System SHALL actualizar el dashboard financiero mostrando el costo comprometido vs presupuesto
5. THE System SHALL permitir adjuntar documentos del contrato (PDF firmado, cotizaciones, especificaciones técnicas)

### Requirement 2: Certificación de Avance de Obra

**User Story:** Como Encargado de Proyecto, quiero certificar el avance de obra de los subcontratistas, para autorizar pagos proporcionales al trabajo completado.

#### Acceptance Criteria

1. WHEN un usuario crea una certificación de avance, THE System SHALL solicitar el porcentaje o monto de avance completado
2. THE System SHALL calcular automáticamente el monto a pagar aplicando el porcentaje de retención configurado en el contrato
3. THE System SHALL generar un registro de "Pago Pendiente" vinculado al contrato y al proyecto
4. THE System SHALL actualizar el costo actual del proyecto cuando el pago es marcado como completado
5. WHEN una certificación es aprobada, THE System SHALL enviar una notificación al departamento de finanzas

### Requirement 3: Catálogo de Cost Codes (Códigos de Costo)

**User Story:** Como Contador de Costos, quiero clasificar todos los gastos y pagos usando códigos de costo estandarizados, para generar reportes detallados de costos por partida.

#### Acceptance Criteria

1. THE System SHALL proporcionar un catálogo predefinido de Cost Codes organizados jerárquicamente (División > Categoría > Subcategoría)
2. THE System SHALL permitir al administrador crear, editar y desactivar Cost Codes personalizados
3. WHEN un usuario registra un gasto o pago, THE System SHALL requerir obligatoriamente la selección de un Cost Code
4. THE System SHALL validar que el Cost Code seleccionado esté activo y sea aplicable al tipo de transacción
5. THE System SHALL generar reportes de costos agrupados por Cost Code mostrando presupuestado vs comprometido vs actual

### Requirement 4: Registro Obligatorio de Clasificación en Transacciones

**User Story:** Como Gerente Financiero, quiero que cada transacción esté completamente clasificada (Proyecto + Cost Code + Proveedor/Subcontratista), para tener trazabilidad completa de los costos.

#### Acceptance Criteria

1. WHEN un usuario crea un gasto o pago, THE System SHALL requerir obligatoriamente los campos: Proyecto, Cost Code, y Proveedor/Subcontratista
2. THE System SHALL validar que el Proyecto seleccionado esté activo y no cerrado
3. THE System SHALL validar que el Cost Code sea aplicable al Proyecto seleccionado
4. THE System SHALL prevenir el guardado de transacciones incompletas mostrando mensajes de error específicos
5. THE System SHALL permitir búsqueda y filtrado de transacciones por cualquier combinación de Proyecto, Cost Code, o Proveedor

### Requirement 5: API Endpoint para Automatización de Gastos (OCR/n8n)

**User Story:** Como Administrador del Sistema, quiero recibir gastos automáticamente desde n8n después del procesamiento OCR, para reducir la entrada manual de datos.

#### Acceptance Criteria

1. THE System SHALL exponer un endpoint REST POST /api/expenses/auto-create que acepte JSON con datos del gasto
2. THE System SHALL validar que el request incluya: monto, fecha, proveedor, descripción, y archivo adjunto (imagen/PDF)
3. WHEN el endpoint recibe datos válidos, THE System SHALL crear un borrador de gasto con estado "Pendiente de Aprobación"
4. THE System SHALL asignar automáticamente un Proyecto y Cost Code por defecto basado en reglas configurables
5. THE System SHALL enviar una notificación al usuario responsable para revisar y aprobar el gasto
6. THE System SHALL registrar en un log de auditoría todos los gastos creados automáticamente
7. IF el request es inválido, THEN THE System SHALL retornar un error HTTP 400 con detalles específicos del problema

### Requirement 6: Dashboard Financiero con Rentabilidad en Tiempo Real

**User Story:** Como Director de Operaciones, quiero ver en el dashboard la rentabilidad de cada proyecto en tiempo real, para identificar rápidamente proyectos con problemas financieros.

#### Acceptance Criteria

1. THE System SHALL mostrar en el dashboard un widget de "Rentabilidad por Proyecto" con las columnas: Presupuesto, Comprometido, Actual, Margen
2. THE System SHALL calcular el margen como: (Presupuesto - Actual) / Presupuesto * 100
3. THE System SHALL aplicar un código de color (semáforo): Verde (margen > 15%), Amarillo (5-15%), Rojo (< 5%)
4. WHEN un proyecto excede el 90% del presupuesto, THE System SHALL generar una alerta automática
5. THE System SHALL actualizar los datos del widget cada vez que se registra un nuevo gasto o pago
6. THE System SHALL permitir hacer clic en un proyecto para ver el desglose detallado por Cost Code

### Requirement 7: Reportes de Job Costing

**User Story:** Como Gerente de Proyecto, quiero generar reportes detallados de costos por proyecto, para analizar desviaciones y tomar decisiones informadas.

#### Acceptance Criteria

1. THE System SHALL generar un reporte de "Costo por Proyecto" mostrando: Presupuesto, Comprometido, Actual, Variación, % Completado
2. THE System SHALL permitir desglosar el reporte por Cost Code mostrando el detalle de cada partida
3. THE System SHALL incluir en el reporte una sección de "Contratos Activos" listando todos los subcontratos con sus montos y estados de pago
4. THE System SHALL permitir exportar el reporte en formatos PDF y Excel
5. THE System SHALL incluir gráficos de barras comparando Presupuestado vs Comprometido vs Actual por Cost Code

### Requirement 8: Gestión de Retenciones (Holdback)

**User Story:** Como Contador, quiero rastrear las retenciones aplicadas a los pagos de subcontratistas, para liberarlas al finalizar el proyecto satisfactoriamente.

#### Acceptance Criteria

1. WHEN un pago a subcontratista es procesado, THE System SHALL calcular y registrar el monto retenido según el porcentaje configurado en el contrato
2. THE System SHALL mantener un balance de "Retenciones Acumuladas" por cada subcontratista y proyecto
3. THE System SHALL permitir liberar retenciones parcial o totalmente mediante un proceso de aprobación
4. WHEN una retención es liberada, THE System SHALL generar un pago pendiente por el monto liberado
5. THE System SHALL mostrar en el dashboard de proyecto el total de retenciones pendientes de liberar

### Requirement 9: Integración con Sistema de Proyectos Existente

**User Story:** Como Desarrollador, quiero que el nuevo sistema de Job Costing se integre sin problemas con el módulo de proyectos existente, para mantener la consistencia de datos.

#### Acceptance Criteria

1. THE System SHALL extender el modelo de datos de Project para incluir campos: totalBudget, committedCost, actualCost, marginPercentage
2. THE System SHALL actualizar automáticamente estos campos cuando se crean contratos, certificaciones o gastos
3. THE System SHALL mantener compatibilidad con las vistas y componentes existentes de ProjectsPage.tsx
4. THE System SHALL proporcionar hooks reutilizables (useProjectFinancials, useSubcontracts) para acceder a los datos financieros
5. THE System SHALL migrar datos existentes de proyectos sin pérdida de información

### Requirement 10: Seguridad y Permisos

**User Story:** Como Administrador de Sistema, quiero controlar quién puede crear contratos, certificar avances y aprobar gastos, para mantener la integridad financiera.

#### Acceptance Criteria

1. THE System SHALL definir roles: Admin, Project Manager, Cost Controller, Finance, Field Supervisor
2. THE System SHALL restringir la creación de contratos solo a usuarios con rol Project Manager o superior
3. THE System SHALL restringir la certificación de avances solo a usuarios con rol Field Supervisor o superior
4. THE System SHALL restringir la aprobación de gastos automáticos solo a usuarios con rol Cost Controller o superior
5. THE System SHALL registrar en un log de auditoría todas las acciones financieras con usuario, fecha y hora
