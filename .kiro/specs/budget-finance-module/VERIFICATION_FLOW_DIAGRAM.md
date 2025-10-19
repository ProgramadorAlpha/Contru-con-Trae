# Financial Verifications Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATIC VERIFICATION SYSTEM                 │
│                         (Task 16.3)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      TRIGGER EVENTS                              │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
    │  Phase Complete  │    │ Expense Created  │    │ Payment Collected│
    │   (100% done)    │    │  (New Gasto)     │    │  (Invoice Paid)  │
    └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
             │                       │                       │
             │                       │                       │
             ▼                       ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
    │ bloqueo-fases    │    │  gasto.service   │    │ factura.service  │
    │   .service.ts    │    │      .ts         │    │      .ts         │
    └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
             │                       │                       │
             └───────────────────────┴───────────────────────┘
                                     │
                                     ▼
             ┌───────────────────────────────────────────────┐
             │  financial-verifications.utils.ts             │
             │                                               │
             │  • ejecutarVerificacionesAlCompletarFase()   │
             │  • ejecutarVerificacionesAlRegistrarGasto()  │
             │  • ejecutarVerificacionesAlRegistrarCobro()  │
             └───────────────────┬───────────────────────────┘
                                 │
                                 ▼
             ┌───────────────────────────────────────────────┐
             │  alertaService.ejecutarVerificaciones()       │
             │                                               │
             │  Collects project data and runs all checks   │
             └───────────────────┬───────────────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
    ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
    │ verificarTeso- │  │ verificarCobros│  │ detectarSobre- │
    │    reria()     │  │  Pendientes()  │  │   costos()     │
    │   (Req 8.1)    │  │   (Req 8.2)    │  │   (Req 8.3)    │
    └────────┬───────┘  └────────┬───────┘  └────────┬───────┘
             │                   │                   │
             └───────────────────┴───────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ verificarPagosVencidos │
                    │      (Req 8.4)         │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   ALERTS GENERATED     │
                    │                        │
                    │  • Tesorería Baja      │
                    │  • Cobro Pendiente     │
                    │  • Sobrecosto          │
                    │  • Factura Vencida     │
                    └────────────────────────┘
```

## Verification Details

### 1. Treasury Verification (8.1)
```
Input: proyectoId, costoProximaFase
  │
  ├─► Calculate: tesoreria = cobros - gastos
  │
  ├─► Calculate: umbral = costoProximaFase * 1.2 (120%)
  │
  └─► If tesoreria < umbral:
      └─► Create CRITICAL alert "Tesorería Insuficiente"
```

### 2. Pending Collections (8.2)
```
Input: proyectoId, faseNumero, progresoFase
  │
  ├─► If progresoFase < 100%: Skip
  │
  ├─► Find invoice for completed phase
  │
  └─► If invoice exists AND estado != 'cobrada':
      └─► Create HIGH alert "Cobro Pendiente de Fase Completada"
```

### 3. Cost Overrun Detection (8.3)
```
Input: proyectoId, presupuestoTotal, gastosReales
  │
  ├─► Calculate: umbral = presupuestoTotal * 1.1 (110%)
  │
  └─► If gastosReales > umbral:
      └─► Create HIGH alert "Sobrecosto Detectado"
```

### 4. Overdue Payments (8.4)
```
Input: proyectoId
  │
  ├─► Get all invoices for project
  │
  ├─► For each invoice where estado != 'cobrada':
  │   │
  │   ├─► Calculate: diasVencidos = today - fechaVencimiento
  │   │
  │   └─► If diasVencidos > 0:
  │       │
  │       ├─► If > 30 days: Create CRITICAL alert
  │       ├─► If > 15 days: Create HIGH alert
  │       └─► Else: Create MEDIUM alert
  │
  └─► Return all alerts generated
```

## Integration Flow Examples

### Example 1: Payment Collection Flow
```
User Action: Mark invoice as paid
  │
  ▼
facturaService.registrarCobro(id, fecha, metodo)
  │
  ├─► Update invoice status to 'cobrada'
  ├─► Update project treasury
  ├─► Unblock next phase if applicable
  │
  └─► Execute Financial Verifications
      │
      ├─► Collect project data
      ├─► Run all 4 verification types
      │
      └─► Results:
          ├─► Treasury sufficient → Resolve "tesoreria_baja" alerts
          ├─► Check for other pending issues
          └─► Generate new alerts if needed
```

### Example 2: Expense Registration Flow
```
User Action: Create new expense
  │
  ▼
gastoService.createGasto(data)
  │
  ├─► Create and save expense
  │
  └─► Execute Financial Verifications
      │
      ├─► Collect project data
      ├─► Calculate total expenses
      │
      └─► Results:
          ├─► If expenses > 110% budget → Create "sobrecosto" alert
          ├─► If treasury low → Create "tesoreria_baja" alert
          └─► Check for overdue invoices
```

### Example 3: Phase Completion Flow
```
User Action: Complete phase (100% progress)
  │
  ▼
bloqueoFasesService.verificarYBloquearFases(proyectoId, faseNumero)
  │
  ├─► Check if invoice exists for phase
  ├─► Block next phase if invoice not paid
  │
  └─► Execute Financial Verifications
      │
      ├─► Collect project data
      ├─► Check phase completion status
      │
      └─► Results:
          ├─► If phase 100% but not paid → Create "cobro_pendiente" alert
          ├─► Check treasury for next phase
          └─► Verify all other financial conditions
```

## Error Handling Flow

```
Try:
  │
  ├─► Import verification function
  │
  ├─► Execute verifications
  │
  └─► Log results
      │
      ├─► Success: Log alerts generated
      └─► Failure: Catch error
          │
          ├─► Log error to console
          │
          └─► Continue main operation
              (Don't fail main operation)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                              │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Presupuestos │  │   Facturas   │  │    Gastos    │  │  Proyectos   │
│ (localStorage)│  │(localStorage)│  │(localStorage)│  │(localStorage)│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                 │
       └─────────────────┴─────────────────┴─────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Data Collection       │
                    │                        │
                    │  • Budget info         │
                    │  • Phase data          │
                    │  • Invoice status      │
                    │  • Expense totals      │
                    │  • Treasury calc       │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Verification Logic    │
                    │                        │
                    │  • Compare values      │
                    │  • Check thresholds    │
                    │  • Calculate metrics   │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Alert Generation      │
                    │                        │
                    │  • Create new alerts   │
                    │  • Resolve old alerts  │
                    │  • Set priorities      │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Alertas               │
                    │  (localStorage)        │
                    └────────────────────────┘
```

## Component Usage

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT LAYER                           │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ FacturasList.tsx │    │ GastoForm.tsx    │    │ FaseCard.tsx     │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         │ useFinancialVerifications()                   │
         │                       │                       │
         ▼                       ▼                       ▼
┌──────────────────────────────────────────────────────────────┐
│  useFinancialVerifications Hook                              │
│                                                              │
│  • verificarAlCompletarFase()                               │
│  • verificarAlRegistrarGasto()                              │
│  • verificarAlRegistrarCobro()                              │
└──────────────────────────────────────────────────────────────┘
```

## Summary

The automatic verification system provides:

✅ **Automatic Execution**: Triggers on 3 key events
✅ **Comprehensive Checks**: All 4 verification types
✅ **Non-Blocking**: Never fails main operations
✅ **Intelligent Alerts**: Only when thresholds exceeded
✅ **Error Resilient**: Graceful error handling
✅ **Well Logged**: Complete audit trail

This ensures proactive financial monitoring and protection of cash flow throughout the project lifecycle.
