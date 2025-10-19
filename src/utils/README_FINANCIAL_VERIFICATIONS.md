# Financial Verifications System - Task 16.3

## Overview

The automatic financial verifications system executes comprehensive financial checks whenever key events occur in the project lifecycle. This ensures that financial alerts are generated proactively to protect cash flow and prevent financial issues.

## Requirements

- **8.1**: Verify treasury levels and create alerts when capital is insufficient
- **8.2**: Verify pending collections when phases are completed
- **8.3**: Detect cost overruns when expenses exceed budget
- **8.4**: Verify overdue payments and create alerts

## Architecture

### Components

1. **Hook**: `useFinancialVerifications.ts`
   - React hook for use in components
   - Provides callback functions for different verification scenarios

2. **Utilities**: `financial-verifications.utils.ts`
   - Service-level functions to avoid circular dependencies
   - Can be imported directly by services

3. **Integration Points**:
   - `factura.service.ts` - Executes verifications when payment is collected
   - `gasto.service.ts` - Executes verifications when expense is registered
   - `bloqueo-fases.service.ts` - Executes verifications when phase is completed

## Automatic Execution Triggers

### 1. Phase Completion (100% Progress)

**Trigger**: When a phase reaches 100% completion

**Location**: `bloqueo-fases.service.ts` → `verificarYBloquearFases()`

**Verifications Executed**:
- ✅ Treasury verification (8.1)
- ✅ Pending collections verification (8.2)
- ✅ Cost overrun detection (8.3)
- ✅ Overdue payments verification (8.4)

**Example**:
```typescript
// In bloqueo-fases.service.ts
await bloqueoFasesService.verificarYBloquearFases(proyectoId, faseNumero);
// Automatically triggers financial verifications
```

### 2. Expense Registration

**Trigger**: When a new expense is created

**Location**: `gasto.service.ts` → `createGasto()`

**Verifications Executed**:
- ✅ Treasury verification (8.1)
- ✅ Cost overrun detection (8.3) - Primary focus
- ✅ Overdue payments verification (8.4)

**Example**:
```typescript
// In gasto.service.ts
const gasto = await gastoService.createGasto({
  proyecto_id: 'proj-123',
  monto: 5000,
  categoria: 'Materiales',
  // ...
});
// Automatically triggers financial verifications
```

### 3. Payment Collection

**Trigger**: When an invoice is marked as paid

**Location**: `factura.service.ts` → `registrarCobro()`

**Verifications Executed**:
- ✅ Treasury verification (8.1) - Primary focus
- ✅ Pending collections verification (8.2)
- ✅ Cost overrun detection (8.3)
- ✅ Overdue payments verification (8.4)

**Example**:
```typescript
// In factura.service.ts
await facturaService.registrarCobro(facturaId, new Date(), 'transferencia');
// Automatically triggers financial verifications
```

## Usage in Components

### Using the Hook

```typescript
import { useFinancialVerifications } from '../hooks/useFinancialVerifications';

function MyComponent() {
  const { 
    verificarAlCompletarFase,
    verificarAlRegistrarGasto,
    verificarAlRegistrarCobro 
  } = useFinancialVerifications();

  const handlePhaseComplete = async () => {
    // Your phase completion logic
    await updatePhaseProgress(proyectoId, faseNumero, 100);
    
    // Execute verifications
    await verificarAlCompletarFase(proyectoId, faseNumero, 100);
  };

  // ...
}
```

### Using Utility Functions (in Services)

```typescript
import { ejecutarVerificacionesAlRegistrarGasto } from '../utils/financial-verifications.utils';

// In a service
async createExpense(data) {
  // Create expense logic
  const expense = await saveExpense(data);
  
  // Execute verifications
  await ejecutarVerificacionesAlRegistrarGasto(data.proyectoId, data.monto);
  
  return expense;
}
```

## Verification Logic

### Data Collection

For each verification, the system collects:

1. **Project Data**:
   - Budget information from presupuesto
   - Current phase and progress
   - Total budget

2. **Financial Data**:
   - All expenses for the project
   - All invoices and their status
   - Treasury calculation (cobros - gastos)

3. **Phase Data**:
   - Current phase number
   - Next phase cost
   - Phase completion percentage

### Alert Generation

The system calls `alertaService.ejecutarVerificaciones()` which runs:

1. **Treasury Verification** (8.1):
   - Calculates current treasury
   - Compares with 120% of next phase cost
   - Creates CRITICAL alert if insufficient

2. **Pending Collections** (8.2):
   - Checks if phase is 100% complete
   - Verifies if invoice exists and is paid
   - Creates HIGH priority alert if unpaid

3. **Cost Overrun Detection** (8.3):
   - Sums all expenses
   - Compares with budget (110% threshold)
   - Creates HIGH priority alert if exceeded

4. **Overdue Payments** (8.4):
   - Checks all invoices for due dates
   - Creates alerts based on days overdue
   - Priority: CRITICAL (>30 days), HIGH (>15 days), MEDIUM (any overdue)

## Error Handling

All verification executions are wrapped in try-catch blocks to ensure:

- ✅ Verifications never block the main operation
- ✅ Errors are logged but don't propagate
- ✅ Partial failures don't prevent other verifications

```typescript
try {
  await ejecutarVerificacionesAlRegistrarCobro(proyectoId, monto);
} catch (error) {
  console.error('Error executing financial verifications:', error);
  // Don't fail the payment registration if verifications fail
}
```

## Periodic Verifications (Optional)

The system also provides a function for periodic batch verifications:

```typescript
import { ejecutarVerificacionesPeriodicas } from '../utils/financial-verifications.utils';

// Can be called from a scheduled job or background task
await ejecutarVerificacionesPeriodicas();
// Runs verifications for all active projects
```

## Testing

### Manual Testing

1. **Test Phase Completion**:
   ```typescript
   // Complete a phase without paying invoice
   await bloqueoFasesService.verificarYBloquearFases('proj-123', 1);
   // Check: Should create "cobro_pendiente" alert
   ```

2. **Test Expense Registration**:
   ```typescript
   // Register expense that exceeds budget
   await gastoService.createGasto({
     proyecto_id: 'proj-123',
     monto: 50000, // Large amount
     categoria: 'Materiales'
   });
   // Check: Should create "sobrecosto" alert if over budget
   ```

3. **Test Payment Collection**:
   ```typescript
   // Register payment
   await facturaService.registrarCobro('fac-123', new Date(), 'transferencia');
   // Check: Should update treasury and verify levels
   ```

### Verification Logs

All verifications log their execution:

```
[Financial Verifications] Executing for project proj-123 after cobro_registrado
[Financial Verifications] Generated 2 alerts for project proj-123
[Financial Verifications] 1 CRITICAL alerts generated!
```

## Integration Checklist

- ✅ Hook created: `useFinancialVerifications.ts`
- ✅ Utilities created: `financial-verifications.utils.ts`
- ✅ Integrated in `factura.service.ts` (payment collection)
- ✅ Integrated in `gasto.service.ts` (expense registration)
- ✅ Integrated in `bloqueo-fases.service.ts` (phase completion)
- ✅ Error handling implemented
- ✅ Logging implemented
- ✅ Documentation created

## Future Enhancements

1. **Scheduled Verifications**: Set up a cron job to run periodic verifications
2. **Notification System**: Send email/SMS for critical alerts
3. **Dashboard Widget**: Show verification status in real-time
4. **Verification History**: Track when verifications were last run
5. **Custom Thresholds**: Allow users to configure alert thresholds

## Related Files

- `src/hooks/useFinancialVerifications.ts` - React hook
- `src/utils/financial-verifications.utils.ts` - Service utilities
- `src/services/alerta.service.ts` - Alert generation logic
- `src/services/factura.service.ts` - Invoice service integration
- `src/services/gasto.service.ts` - Expense service integration
- `src/services/bloqueo-fases.service.ts` - Phase blocking integration

## Support

For questions or issues with the financial verifications system, refer to:
- Task 16.3 in `.kiro/specs/budget-finance-module/tasks.md`
- Requirements 8.1, 8.2, 8.3, 8.4 in `.kiro/specs/budget-finance-module/requirements.md`
