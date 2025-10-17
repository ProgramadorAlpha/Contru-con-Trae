# Plan de Implementación: Sistema de Job Costing para ConstructPro

## Resumen Ejecutivo

Este documento presenta el plan detallado para transformar ConstructPro en un sistema ERP completo para construcción con capacidades de **Job Costing real**, gestión de subcontratos y automatización de gastos mediante OCR/n8n.

## Objetivos Principales

1. **Job Costing Completo**: Rastrear costos por proyecto con clasificación detallada por Cost Codes
2. **Gestión de Subcontratos**: Controlar contratos, certificaciones de avance y retenciones
3. **Automatización de Gastos**: Integrar OCR/n8n para registro automático de gastos
4. **Rentabilidad en Tiempo Real**: Dashboard con indicadores financieros y alertas

## Arquitectura Propuesta

### Nuevos Módulos

```
src/
├── types/
│   ├── subcontracts.ts          ✨ NUEVO
│   ├── progressCertificates.ts  ✨ NUEVO
│   ├── costCodes.ts             ✨ NUEVO
│   ├── projectFinancials.ts     ✨ NUEVO
│   ├── holdbacks.ts             ✨ NUEVO
│   └── expenses.ts              🔧 EXTENDIDO
│
├── services/
│   ├── subcontractService.ts           ✨ NUEVO
│   ├── progressCertificateService.ts   ✨ NUEVO
│   ├── costCodeService.ts              ✨ NUEVO
│   ├── projectFinancialsService.ts     ✨ NUEVO
│   └── expenseService.ts               🔧 EXTENDIDO
│
├── hooks/
│   ├── useSubcontracts.ts          ✨ NUEVO
│   ├── useProgressCertificates.ts  ✨ NUEVO
│   ├── useCostCodes.ts             ✨ NUEVO
│   ├── useProjectFinancials.ts     ✨ NUEVO
│   └── useExpenseApprovals.ts      ✨ NUEVO
│
├── components/
│   ├── subcontracts/
│   │   ├── SubcontractForm.tsx         ✨ NUEVO
│   │   ├── SubcontractList.tsx         ✨ NUEVO
│   │   └── PaymentScheduleEditor.tsx   ✨ NUEVO
│   │
│   ├── certificates/
│   │   ├── ProgressCertificateForm.tsx  ✨ NUEVO
│   │   ├── CertificateApprovalCard.tsx  ✨ NUEVO
│   │   └── RetentionCalculator.tsx      ✨ NUEVO
│   │
│   ├── costCodes/
│   │   ├── CostCodeSelector.tsx         ✨ NUEVO
│   │   ├── CostCodeManager.tsx          ✨ NUEVO
│   │   └── CostCodeBudgetForm.tsx       ✨ NUEVO
│   │
│   ├── expenses/
│   │   ├── ExpenseClassificationForm.tsx  ✨ NUEVO
│   │   ├── ExpenseApprovalQueue.tsx       ✨ NUEVO
│   │   └── OCRExpenseReview.tsx           ✨ NUEVO
│   │
│   └── financials/
│       ├── ProfitabilityWidget.tsx      ✨ NUEVO
│       ├── CommittedCostWidget.tsx      ✨ NUEVO
│       ├── CostCodeBreakdown.tsx        ✨ NUEVO
│       └── JobCostingReport.tsx         ✨ NUEVO
│
└── pages/
    ├── SubcontractsPage.tsx           ✨ NUEVO
    ├── ProgressCertificatesPage.tsx   ✨ NUEVO
    ├── CostCodesPage.tsx              ✨ NUEVO
    ├── ExpenseApprovalsPage.tsx       ✨ NUEVO
    ├── ProjectFinancialsPage.tsx      ✨ NUEVO
    ├── ProjectsPage.tsx               🔧 EXTENDIDO
    └── EnhancedDashboard.tsx          🔧 EXTENDIDO
```

### Backend (Firebase Functions)

```
functions/src/
└── api/
    └── expenses/
        └── autoCreate.ts  ✨ NUEVO - Endpoint para n8n/OCR
```

### Base de Datos (Firestore)

```
Firestore Collections:
├── projects/              🔧 EXTENDIDO (+ campos financieros)
├── subcontracts/          ✨ NUEVO
├── progressCertificates/  ✨ NUEVO
├── costCodes/             ✨ NUEVO
├── costCodeBudgets/       ✨ NUEVO
├── expenses/              🔧 EXTENDIDO (+ clasificación)
├── holdbacks/             ✨ NUEVO
└── auditLog/              ✨ NUEVO
```

## Funcionalidades Clave

### 1. Gestión de Subcontratos

**Problema Resuelto**: Actualmente no hay forma de rastrear contratos con subcontratistas ni calcular costos comprometidos.

**Solución**:
- Crear contratos vinculados a proyectos y subcontratistas
- Definir monto total, retención % y esquema de pagos
- Calcular automáticamente costo comprometido
- Adjuntar documentos del contrato

**Archivos Nuevos**:
- `src/types/subcontracts.ts`
- `src/services/subcontractService.ts`
- `src/hooks/useSubcontracts.ts`
- `src/components/subcontracts/SubcontractForm.tsx`
- `src/pages/SubcontractsPage.tsx`

**Modificaciones**:
- `src/types/dashboard.ts` - Agregar `committedCost` a Project
- `src/pages/ProjectsPage.tsx` - Mostrar costos comprometidos

### 2. Certificación de Avance de Obra

**Problema Resuelto**: No hay proceso formal para certificar avances y autorizar pagos parciales.

**Solución**:
- Registrar % o monto de avance completado
- Calcular automáticamente monto a pagar con retención
- Workflow de aprobación (Field Supervisor → Finance)
- Generar pago automático al aprobar

**Archivos Nuevos**:
- `src/types/progressCertificates.ts`
- `src/services/progressCertificateService.ts`
- `src/hooks/useProgressCertificates.ts`
- `src/components/certificates/ProgressCertificateForm.tsx`
- `src/pages/ProgressCertificatesPage.tsx`

### 3. Catálogo de Cost Codes

**Problema Resuelto**: Los gastos no están clasificados de forma estandarizada, imposibilitando análisis detallado.

**Solución**:
- Catálogo jerárquico de Cost Codes (División > Categoría > Subcategoría)
- Ejemplos: 01.01.01 - Excavación, 02.01.01 - Cimentación, 03.01.01 - Estructura
- Administración de catálogo personalizado
- Validación de Cost Codes activos

**Archivos Nuevos**:
- `src/types/costCodes.ts`
- `src/services/costCodeService.ts`
- `src/hooks/useCostCodes.ts`
- `src/components/costCodes/CostCodeSelector.tsx`
- `src/components/costCodes/CostCodeManager.tsx`
- `src/pages/CostCodesPage.tsx`

**Catálogo Inicial Propuesto**:
```
01 - Preliminares
  01.01 - Movimiento de Tierras
    01.01.01 - Excavación
    01.01.02 - Relleno
  01.02 - Demoliciones

02 - Cimentación
  02.01 - Zapatas
  02.02 - Vigas de Cimentación

03 - Estructura
  03.01 - Columnas
  03.02 - Vigas
  03.03 - Losas

04 - Albañilería
  04.01 - Muros
  04.02 - Tabiques

05 - Instalaciones Eléctricas
  05.01 - Cableado
  05.02 - Tableros

06 - Instalaciones Sanitarias
  06.01 - Agua Potable
  06.02 - Desagüe

07 - Acabados
  07.01 - Pisos
  07.02 - Pintura
  07.03 - Carpintería
```

### 4. Clasificación Obligatoria de Gastos

**Problema Resuelto**: Los gastos no están vinculados a proyectos y partidas específicas.

**Solución**:
- Campos obligatorios: Proyecto + Cost Code + Proveedor/Subcontratista
- Validación en frontend y backend
- Mensajes de error específicos
- Búsqueda y filtrado por clasificación

**Modificaciones**:
- `src/types/expenses.ts` - Agregar campos de clasificación
- `src/services/expenseService.ts` - Agregar validación
- `src/components/expenses/ExpenseClassificationForm.tsx` - Nuevo formulario

### 5. API para Automatización de Gastos (OCR/n8n)

**Problema Resuelto**: Entrada manual de gastos es lenta y propensa a errores.

**Solución**:
- Endpoint REST: `POST /api/expenses/auto-create`
- Recibe: monto, fecha, proveedor, descripción, archivo (imagen/PDF)
- Crea borrador con estado "Pendiente de Aprobación"
- Asigna proyecto y cost code por defecto
- Notifica al responsable

**Archivos Nuevos**:
- `functions/src/api/expenses/autoCreate.ts`
- `src/components/expenses/OCRExpenseReview.tsx`
- `src/components/expenses/ExpenseApprovalQueue.tsx`
- `src/pages/ExpenseApprovalsPage.tsx`

**Flujo n8n Propuesto**:
```
1. Gmail Trigger (recibe email con recibo)
   ↓
2. Extract Attachment (extrae PDF/imagen)
   ↓
3. OCR Processing (Google Vision API o similar)
   ↓
4. Parse Data (extrae monto, fecha, proveedor)
   ↓
5. HTTP Request POST a ConstructPro API
   ↓
6. Success/Error Notification
```

**Request Format**:
```json
{
  "amount": 1500.00,
  "date": "2024-01-15",
  "supplier": "Ferretería Central",
  "description": "Materiales de construcción",
  "invoiceNumber": "FC-001234",
  "file": {
    "name": "recibo.pdf",
    "data": "base64_encoded_file",
    "mimeType": "application/pdf"
  },
  "ocrData": {
    "rawText": "...",
    "confidence": 0.95
  }
}
```

### 6. Dashboard Financiero con Rentabilidad

**Problema Resuelto**: No hay visibilidad en tiempo real de la rentabilidad por proyecto.

**Solución**:
- Widget "Rentabilidad por Proyecto" en dashboard
- Columnas: Presupuesto | Comprometido | Actual | Margen
- Semáforo: Verde (>15%), Amarillo (5-15%), Rojo (<5%)
- Alerta automática al exceder 90% del presupuesto
- Click para ver desglose por Cost Code

**Archivos Nuevos**:
- `src/types/projectFinancials.ts`
- `src/services/projectFinancialsService.ts`
- `src/hooks/useProjectFinancials.ts`
- `src/components/financials/ProfitabilityWidget.tsx`
- `src/components/financials/CommittedCostWidget.tsx`

**Modificaciones**:
- `src/pages/EnhancedDashboard.tsx` - Agregar widgets financieros

**Cálculos**:
```typescript
// Margen = (Presupuesto - Actual) / Presupuesto * 100
margin = (totalBudget - actualCost) / totalBudget * 100

// Costo Comprometido = Suma de contratos activos
committedCost = sum(activeSubcontracts.totalAmount)

// Costo Actual = Suma de gastos y pagos
actualCost = sum(expenses.amount) + sum(payments.amount)

// Semáforo
if (margin > 15) status = 'green'
else if (margin >= 5) status = 'yellow'
else status = 'red'
```

### 7. Reportes de Job Costing

**Problema Resuelto**: No hay reportes detallados de costos por proyecto y partida.

**Solución**:
- Reporte "Costo por Proyecto" con desglose por Cost Code
- Sección "Contratos Activos" con estados de pago
- Gráficos: Presupuestado vs Comprometido vs Actual
- Exportación a PDF y Excel

**Archivos Nuevos**:
- `src/components/financials/JobCostingReport.tsx`
- `src/components/financials/CostCodeBreakdown.tsx`
- `src/pages/ProjectFinancialsPage.tsx`

## Cronograma de Implementación

### Fase 1: Foundation (Semana 1-2)
- ✅ Crear todos los tipos TypeScript
- ✅ Extender modelo de Project
- ✅ Configurar colecciones Firestore

**Entregable**: Estructura de datos completa y documentada

### Fase 2: Services Layer (Semana 2-3)
- ✅ Implementar SubcontractService
- ✅ Implementar ProgressCertificateService
- ✅ Implementar CostCodeService
- ✅ Extender ExpenseService
- ✅ Implementar ProjectFinancialsService

**Entregable**: Lógica de negocio funcional con tests unitarios

### Fase 3: Custom Hooks (Semana 3-4)
- ✅ Crear todos los hooks personalizados
- ✅ Implementar state management
- ✅ Implementar real-time subscriptions

**Entregable**: Hooks reutilizables para componentes

### Fase 4: UI Components (Semana 4-6)
- ✅ Crear componentes de subcontratos
- ✅ Crear componentes de certificaciones
- ✅ Crear componentes de cost codes
- ✅ Crear componentes de gastos
- ✅ Crear componentes financieros

**Entregable**: Biblioteca de componentes UI completa

### Fase 5: Pages (Semana 6-7)
- ✅ Crear todas las páginas nuevas
- ✅ Extender páginas existentes
- ✅ Integrar componentes

**Entregable**: Aplicación funcional end-to-end

### Fase 6: API Integration (Semana 7-8)
- ✅ Implementar endpoint OCR
- ✅ Crear documentación API
- ✅ Configurar n8n workflow
- ✅ Testing de integración

**Entregable**: Automatización de gastos funcionando

### Fase 7: Security & Permissions (Semana 8)
- ✅ Implementar RBAC
- ✅ Implementar audit logging
- ✅ Testing de seguridad

**Entregable**: Sistema seguro y auditable

### Fase 8: Testing & QA (Semana 9)
- ✅ Tests unitarios
- ✅ Tests de integración
- ✅ Tests E2E
- ✅ Bug fixing

**Entregable**: Sistema testeado y estable

### Fase 9: Documentation (Semana 9-10)
- ✅ Documentación de usuario
- ✅ Documentación técnica
- ✅ Videos tutoriales

**Entregable**: Documentación completa

### Fase 10: Deployment (Semana 10)
- ✅ Migración de datos
- ✅ Deployment a producción
- ✅ Training de usuarios
- ✅ Rollout gradual

**Entregable**: Sistema en producción

## Estimación de Esfuerzo

| Fase | Tareas | Días | Complejidad |
|------|--------|------|-------------|
| 1. Foundation | 6 | 3-4 | Media |
| 2. Services | 7 | 5-6 | Alta |
| 3. Hooks | 5 | 3-4 | Media |
| 4. Components | 17 | 8-10 | Alta |
| 5. Pages | 6 | 4-5 | Media |
| 6. API | 4 | 3-4 | Media |
| 7. Security | 5 | 2-3 | Media |
| 8. Testing | 5 | 4-5 | Alta |
| 9. Documentation | 4 | 2-3 | Baja |
| 10. Deployment | 4 | 2-3 | Media |
| **TOTAL** | **63** | **36-47** | - |

**Estimación Total**: 7-10 semanas (1 desarrollador full-time)

## Riesgos y Mitigaciones

### Riesgo 1: Complejidad de Cálculos Financieros
**Mitigación**: Tests exhaustivos, validación con contador

### Riesgo 2: Integración OCR/n8n
**Mitigación**: Prototipo temprano, fallback manual

### Riesgo 3: Migración de Datos Existentes
**Mitigación**: Scripts de migración testeados, backup completo

### Riesgo 4: Adopción de Usuarios
**Mitigación**: Training extensivo, rollout gradual, soporte dedicado

## Métricas de Éxito

1. **Funcionalidad**:
   - ✅ 100% de gastos clasificados (Proyecto + Cost Code + Proveedor)
   - ✅ Tiempo de certificación de avance < 5 minutos
   - ✅ 80% de gastos creados automáticamente vía OCR

2. **Performance**:
   - ✅ Dashboard financiero actualizado en < 2 segundos
   - ✅ Reportes generados en < 5 segundos
   - ✅ API OCR responde en < 3 segundos

3. **Adopción**:
   - ✅ 90% de usuarios activos usando nuevas funcionalidades
   - ✅ < 5% de errores de clasificación
   - ✅ Satisfacción de usuarios > 4/5

## Próximos Pasos

1. **Revisar y aprobar** este plan de implementación
2. **Priorizar** funcionalidades si se requiere MVP más rápido
3. **Asignar recursos** (desarrolladores, testers, usuarios piloto)
4. **Iniciar Fase 1** - Foundation (tipos y modelos de datos)
5. **Configurar entorno** de desarrollo y staging

## Contacto y Soporte

Para preguntas sobre este plan de implementación, contactar al equipo de desarrollo.

---

**Documento creado**: 2024-01-16  
**Última actualización**: 2024-01-16  
**Versión**: 1.0  
**Estado**: Pendiente de Aprobación
