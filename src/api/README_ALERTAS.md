# Alertas API Documentation

This API provides endpoints for managing financial alerts in the system.

## Overview

The Alertas API wraps the `alertaService` and provides a consistent interface for:
- Getting active alerts across all projects
- Getting alerts for a specific project
- Filtering alerts by type, priority, or status
- Resolving alerts with notes
- Getting alert statistics
- Running financial verifications

## API Functions

### `getAlertasActivas()`

Get all active alerts across all projects.

**Returns:** `ApiResponse<Alerta[]>`

**Example:**
```typescript
import { alertasApi } from '../api/alertas.api';

const response = await alertasApi.getAlertasActivas();
if (response.success) {
  console.log('Active alerts:', response.data);
}
```

---

### `getAlertasByProyecto(proyectoId, soloActivas?)`

Get alerts for a specific project.

**Parameters:**
- `proyectoId: string` - Project ID
- `soloActivas?: boolean` - Only return active alerts (default: true)

**Returns:** `ApiResponse<Alerta[]>`

**Example:**
```typescript
const response = await alertasApi.getAlertasByProyecto('proyecto-123', true);
if (response.success) {
  console.log('Project alerts:', response.data);
}
```

---

### `getAlertas(filtros?)`

Get alerts with optional filters.

**Parameters:**
- `filtros?: AlertasFiltros` - Optional filters
  - `proyectoId?: string`
  - `tipo?: TipoAlerta`
  - `prioridad?: PrioridadAlerta`
  - `soloActivas?: boolean`

**Returns:** `ApiResponse<Alerta[]>`

**Example:**
```typescript
const response = await alertasApi.getAlertas({
  proyectoId: 'proyecto-123',
  prioridad: 'critica',
  soloActivas: true
});
```

---

### `resolverAlerta(alertaId, request)`

Mark an alert as resolved.

**Parameters:**
- `alertaId: string` - Alert ID
- `request: ResolverAlertaRequest`
  - `usuario: string` - User who resolved the alert
  - `nota?: string` - Optional resolution note

**Returns:** `ApiResponse<Alerta>`

**Example:**
```typescript
const response = await alertasApi.resolverAlerta('alerta-123', {
  usuario: 'user@example.com',
  nota: 'Factura cobrada exitosamente'
});

if (response.success) {
  console.log('Alert resolved:', response.data);
}
```

---

### `getEstadisticasAlertas(proyectoId?)`

Get alert statistics.

**Parameters:**
- `proyectoId?: string` - Optional project ID to filter statistics

**Returns:** `ApiResponse<{ total, criticas, altas, medias, bajas, porTipo }>`

**Example:**
```typescript
const response = await alertasApi.getEstadisticasAlertas('proyecto-123');
if (response.success) {
  console.log('Statistics:', response.data);
  // { total: 5, criticas: 2, altas: 1, medias: 2, bajas: 0, porTipo: {...} }
}
```

---

### `ejecutarVerificaciones(proyectoId, datos)`

Run all financial verifications for a project.

**Parameters:**
- `proyectoId: string` - Project ID
- `datos: object` - Verification data
  - `costoProximaFase?: number`
  - `faseActual?: number`
  - `progresoFaseActual?: number`
  - `presupuestoTotal?: number`
  - `gastosReales?: number`

**Returns:** `ApiResponse<Alerta[]>` - Array of generated alerts

**Example:**
```typescript
const response = await alertasApi.ejecutarVerificaciones('proyecto-123', {
  costoProximaFase: 50000,
  faseActual: 2,
  progresoFaseActual: 100,
  presupuestoTotal: 200000,
  gastosReales: 180000
});

if (response.success) {
  console.log(`Generated ${response.data.length} alerts`);
}
```

---

### `getAlertasByPrioridad(prioridad)`

Get all active alerts of a specific priority.

**Parameters:**
- `prioridad: PrioridadAlerta` - 'critica' | 'alta' | 'media' | 'baja'

**Returns:** `ApiResponse<Alerta[]>`

**Example:**
```typescript
const response = await alertasApi.getAlertasByPrioridad('critica');
```

---

### `getAlertasByTipo(tipo)`

Get all active alerts of a specific type.

**Parameters:**
- `tipo: TipoAlerta` - Alert type

**Returns:** `ApiResponse<Alerta[]>`

**Example:**
```typescript
const response = await alertasApi.getAlertasByTipo('tesoreria_baja');
```

---

### `limpiarAlertasProyecto(proyectoId)`

Clear all alerts for a project (admin only).

**Parameters:**
- `proyectoId: string` - Project ID

**Returns:** `ApiResponse<void>`

**Example:**
```typescript
const response = await alertasApi.limpiarAlertasProyecto('proyecto-123');
if (response.success) {
  console.log('Alerts cleared');
}
```

## Usage in Components

### Example: Display Active Alerts

```typescript
import React, { useEffect, useState } from 'react';
import { alertasApi } from '../api/alertas.api';
import type { Alerta } from '../services/alerta.service';

export function AlertasView() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlertas();
  }, []);

  const loadAlertas = async () => {
    setLoading(true);
    const response = await alertasApi.getAlertasActivas();
    if (response.success && response.data) {
      setAlertas(response.data);
    }
    setLoading(false);
  };

  const handleResolverAlerta = async (alertaId: string, nota: string) => {
    const response = await alertasApi.resolverAlerta(alertaId, {
      usuario: 'current-user@example.com',
      nota
    });

    if (response.success) {
      // Reload alerts
      await loadAlertas();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Active Alerts: {alertas.length}</h2>
      {alertas.map(alerta => (
        <div key={alerta.id}>
          <h3>{alerta.titulo}</h3>
          <p>{alerta.mensaje}</p>
          <button onClick={() => handleResolverAlerta(alerta.id, 'Resolved')}>
            Resolve
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Example: Project Alerts Dashboard

```typescript
import React, { useEffect, useState } from 'react';
import { alertasApi } from '../api/alertas.api';
import { AlertasPanel } from '../components/finanzas/AlertasPanel';

export function ProjectAlertasPage({ proyectoId }: { proyectoId: string }) {
  const [alertas, setAlertas] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, [proyectoId]);

  const loadData = async () => {
    // Load alerts
    const alertasResponse = await alertasApi.getAlertasByProyecto(proyectoId);
    if (alertasResponse.success) {
      setAlertas(alertasResponse.data);
    }

    // Load statistics
    const statsResponse = await alertasApi.getEstadisticasAlertas(proyectoId);
    if (statsResponse.success) {
      setStats(statsResponse.data);
    }
  };

  const handleResolver = async (alertaId: string, nota: string) => {
    const response = await alertasApi.resolverAlerta(alertaId, {
      usuario: 'current-user',
      nota
    });

    if (response.success) {
      await loadData();
    }
  };

  return (
    <div>
      {stats && (
        <div>
          <h3>Alert Statistics</h3>
          <p>Total: {stats.total}</p>
          <p>Critical: {stats.criticas}</p>
          <p>High: {stats.altas}</p>
        </div>
      )}
      
      <AlertasPanel
        alertas={alertas}
        onResolver={handleResolver}
      />
    </div>
  );
}
```

## Response Format

All API functions return an `ApiResponse<T>` object:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

**Success Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Alert Types

- `tesoreria_baja` - Low treasury warning
- `cobro_pendiente` - Pending collection
- `sobrecosto` - Cost overrun
- `pago_vencido` - Overdue payment
- `fase_bloqueada` - Blocked phase
- `factura_vencida` - Overdue invoice

## Priority Levels

- `critica` - Critical (red)
- `alta` - High (orange)
- `media` - Medium (yellow)
- `baja` - Low (blue)

## Requirements Covered

This API implementation covers:
- **Requirement 8.5**: Endpoints for obtaining active alerts
- **Requirement 8.5**: Endpoint for resolving alerts
- **Requirement 8.5**: Endpoint for obtaining alerts by project
