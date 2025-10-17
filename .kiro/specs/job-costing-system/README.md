# Job Costing & Subcontractor Management System

## 📋 Descripción

Esta especificación define la implementación de un sistema completo de **Job Costing** para ConstructPro, transformándolo de un dashboard genérico a un ERP específico para construcción con gestión de subcontratos, clasificación detallada de costos y automatización de gastos.

## 🎯 Objetivos

1. **Control Financiero Real**: Rastrear costos por proyecto con clasificación detallada por Cost Codes (WBS)
2. **Gestión de Subcontratos**: Controlar contratos, certificaciones de avance y retenciones (holdbacks)
3. **Automatización**: Integrar OCR/n8n para registro automático de gastos desde recibos
4. **Rentabilidad en Tiempo Real**: Dashboard con indicadores financieros y alertas automáticas

## 📁 Documentos

- **[requirements.md](./requirements.md)** - Requisitos funcionales detallados con user stories y acceptance criteria (formato EARS + INCOSE)
- **[design.md](./design.md)** - Diseño técnico completo: arquitectura, componentes, interfaces, modelos de datos
- **[tasks.md](./tasks.md)** - Plan de implementación con tareas específicas organizadas por fase
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Resumen ejecutivo con cronograma, estimaciones y métricas de éxito

## 🚀 Inicio Rápido

### Para Desarrolladores

1. **Leer primero**: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) para entender el panorama completo
2. **Revisar arquitectura**: [design.md](./design.md) sección "Architecture"
3. **Comenzar implementación**: [tasks.md](./tasks.md) - Fase 1: Foundation

### Para Product Owners / Stakeholders

1. **Leer**: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Resumen ejecutivo
2. **Revisar**: [requirements.md](./requirements.md) - Requisitos funcionales
3. **Aprobar**: Cronograma y estimaciones en IMPLEMENTATION_PLAN.md

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)            │
│  - SubcontractsPage, ProgressCertificatesPage               │
│  - CostCodesPage, ExpenseApprovalsPage                      │
│  - ProjectFinancialsPage                                     │
│  - EnhancedDashboard (extendido con widgets financieros)    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Firebase Functions)                  │
│  - POST /api/expenses/auto-create (n8n integration)        │
│  - GET  /api/projects/:id/financials                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database (Firestore)                        │
│  - subcontracts, progressCertificates, costCodes            │
│  - costCodeBudgets, holdbacks, auditLog                     │
│  - projects (extendido), expenses (extendido)               │
└─────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────┐
│              External Integration (n8n)                      │
│  Email → OCR → Parse → POST to ConstructPro API            │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Funcionalidades Principales

### 1. Gestión de Subcontratos
- Crear contratos vinculados a proyectos y subcontratistas
- Definir monto total, retención % y esquema de pagos
- Calcular automáticamente costo comprometido
- Adjuntar documentos del contrato

### 2. Certificación de Avance de Obra
- Registrar % o monto de avance completado
- Calcular automáticamente monto a pagar con retención
- Workflow de aprobación (Field Supervisor → Finance)
- Generar pago automático al aprobar

### 3. Catálogo de Cost Codes
- Catálogo jerárquico (División > Categoría > Subcategoría)
- Ejemplos: 01.01.01 - Excavación, 02.01.01 - Cimentación
- Administración de catálogo personalizado
- Validación de Cost Codes activos

### 4. Clasificación Obligatoria de Gastos
- Campos obligatorios: Proyecto + Cost Code + Proveedor
- Validación en frontend y backend
- Búsqueda y filtrado por clasificación

### 5. API para Automatización de Gastos
- Endpoint REST: `POST /api/expenses/auto-create`
- Recibe datos de OCR/n8n
- Crea borrador con estado "Pendiente de Aprobación"
- Notifica al responsable

### 6. Dashboard Financiero
- Widget "Rentabilidad por Proyecto"
- Semáforo: Verde (>15%), Amarillo (5-15%), Rojo (<5%)
- Alerta automática al exceder 90% del presupuesto
- Click para ver desglose por Cost Code

### 7. Reportes de Job Costing
- Reporte "Costo por Proyecto" con desglose por Cost Code
- Sección "Contratos Activos" con estados de pago
- Gráficos: Presupuestado vs Comprometido vs Actual
- Exportación a PDF y Excel

## 📅 Cronograma

| Fase | Duración | Entregable |
|------|----------|------------|
| 1. Foundation | 3-4 días | Estructura de datos completa |
| 2. Services Layer | 5-6 días | Lógica de negocio funcional |
| 3. Custom Hooks | 3-4 días | Hooks reutilizables |
| 4. UI Components | 8-10 días | Biblioteca de componentes |
| 5. Pages | 4-5 días | Aplicación funcional end-to-end |
| 6. API Integration | 3-4 días | Automatización funcionando |
| 7. Security & Permissions | 2-3 días | Sistema seguro y auditable |
| 8. Testing & QA | 4-5 días | Sistema testeado y estable |
| 9. Documentation | 2-3 días | Documentación completa |
| 10. Deployment | 2-3 días | Sistema en producción |
| **TOTAL** | **36-47 días** | **Sistema completo** |

## 🎯 Métricas de Éxito

### Funcionalidad
- ✅ 100% de gastos clasificados (Proyecto + Cost Code + Proveedor)
- ✅ Tiempo de certificación de avance < 5 minutos
- ✅ 80% de gastos creados automáticamente vía OCR

### Performance
- ✅ Dashboard financiero actualizado en < 2 segundos
- ✅ Reportes generados en < 5 segundos
- ✅ API OCR responde en < 3 segundos

### Adopción
- ✅ 90% de usuarios activos usando nuevas funcionalidades
- ✅ < 5% de errores de clasificación
- ✅ Satisfacción de usuarios > 4/5

## 🔐 Seguridad

### Roles Definidos
- **Admin**: Acceso completo
- **Project Manager**: Crear contratos, ver financials
- **Cost Controller**: Aprobar gastos, gestionar cost codes
- **Finance**: Aprobar pagos, liberar retenciones
- **Field Supervisor**: Certificar avances

### Audit Trail
- Log de todas las transacciones financieras
- Registro de aprobaciones y rechazos
- Trazabilidad completa de cambios

## 📚 Recursos Adicionales

### Documentación Técnica
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [n8n Documentation](https://docs.n8n.io/)

### Herramientas
- **OCR**: Google Vision API, Tesseract
- **Automatización**: n8n (self-hosted o cloud)
- **Reportes**: jsPDF, ExcelJS

## 🤝 Contribución

### Flujo de Trabajo
1. Revisar [tasks.md](./tasks.md) para ver tareas pendientes
2. Asignar tarea en el sistema de gestión de proyectos
3. Crear branch: `feature/job-costing-[nombre-tarea]`
4. Implementar siguiendo [design.md](./design.md)
5. Escribir tests (ver Phase 8 en tasks.md)
6. Crear Pull Request con referencia a requisito

### Estándares de Código
- TypeScript strict mode
- ESLint + Prettier
- Tests unitarios para services
- Tests de integración para workflows
- Documentación inline para lógica compleja

## 📞 Contacto

Para preguntas sobre esta especificación:
- **Technical Lead**: [Nombre]
- **Product Owner**: [Nombre]
- **Slack Channel**: #constructpro-job-costing

## 📝 Changelog

### Version 1.0 (2024-01-16)
- ✨ Especificación inicial completa
- 📋 10 requisitos funcionales definidos
- 🏗️ Arquitectura técnica diseñada
- 📅 Plan de implementación con 36 tareas
- 📊 Métricas de éxito establecidas

---

**Estado**: 🟡 Pendiente de Aprobación  
**Prioridad**: 🔴 Alta  
**Complejidad**: 🟠 Alta  
**Estimación**: 7-10 semanas (1 dev full-time)
