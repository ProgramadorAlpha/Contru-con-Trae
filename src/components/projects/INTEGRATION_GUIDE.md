# Phase Blocking Integration Guide

## Task 13.2 - Integrar bloqueo en componentes de proyecto
**Requirements:** 7.4, 7.6

This guide explains how to integrate phase blocking functionality into existing project components.

## Overview

The phase blocking system automatically prevents phases from starting until the previous phase has been paid. This protects cash flow and ensures proper financial control.

## Quick Start

### 1. Add to Existing Project Detail Page

The simplest way to add phase blocking is to use the `ProjectPhasesSection` component:

```tsx
import { ProjectPhasesSection } from '@/components/projects';

function YourProjectDetailPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Your existing project header, metrics, etc. */}
      
      {/* Add phases section */}
      <ProjectPhasesSection
        proyectoId={projectId}
        isAdmin={isAdmin}
        onPhaseStarted={(faseNumero) => {
          // Handle phase start
          showNotification(`Fase ${faseNumero} iniciada`);
          refreshProjectData();
        }}
      />
    </div>
  );
}
```

### 2. Update Project Routes

Add the example page to your routes (optional, for testing):

```tsx
// In App.tsx or your routes file
import { ProjectPhasesExamplePage } from '@/pages/ProjectPhasesExamplePage';

<Route path="/projects/:projectId/phases" element={<ProjectPhasesExamplePage />} />
```

## Component Details

### ProjectPhasesSection

**Purpose:** High-level component that handles loading phases and integrating blocking logic.

**When to use:**
- Adding phases to an existing project detail page
- Creating a new phases-focused view
- Quick integration without custom logic

**Props:**
```typescript
{
  proyectoId: string;        // Required: Project ID
  isAdmin?: boolean;         // Optional: Enable admin features
  onPhaseStarted?: (faseNumero: number) => void;  // Optional: Callback
}
```

**Features:**
- Automatic phase loading
- Error handling with retry
- Loading states
- Integrates with bloqueoFasesService

### FasesList

**Purpose:** Displays grid of phase cards with overall progress.

**When to use:**
- Custom phase loading logic
- More control over phase data
- Custom layouts

**Props:**
```typescript
{
  proyectoId: string;
  fases: Fase[];
  onIniciarFase?: (faseNumero: number) => void;
  isAdmin?: boolean;
}
```

**Example:**
```tsx
import { FasesList } from '@/components/projects';

function CustomPhasesView() {
  const [fases, setFases] = useState([]);
  
  useEffect(() => {
    // Load phases from your service
    const loadPhases = async () => {
      const proyecto = await proyectoService.getProyectoById(projectId);
      setFases(proyecto.fases);
    };
    loadPhases();
  }, [projectId]);

  return (
    <FasesList
      proyectoId={projectId}
      fases={fases}
      onIniciarFase={handlePhaseStart}
      isAdmin={isAdmin}
    />
  );
}
```

### FaseCard

**Purpose:** Individual phase card with blocking status.

**When to use:**
- Custom phase layouts
- Single phase display
- Embedded in other components

**Props:**
```typescript
{
  proyectoId: string;
  faseNumero: number;
  faseNombre: string;
  progreso: number;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
  monto?: number;
  onIniciarFase?: () => void;
  isAdmin?: boolean;
}
```

## Integration Patterns

### Pattern 1: Tab in Project Detail

Add phases as a tab in your existing project detail page:

```tsx
function ProjectDetailPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab('overview')}>Overview</button>
          <button onClick={() => setActiveTab('phases')}>Fases</button>
          <button onClick={() => setActiveTab('financials')}>Finanzas</button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && <ProjectOverview />}
      {activeTab === 'phases' && (
        <ProjectPhasesSection proyectoId={projectId} isAdmin={isAdmin} />
      )}
      {activeTab === 'financials' && <ProjectFinancials />}
    </div>
  );
}
```

### Pattern 2: Sidebar Widget

Show phases in a sidebar:

```tsx
function ProjectDetailPage() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main content */}
      <div className="col-span-2">
        <ProjectMainContent />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <ProjectPhasesSection proyectoId={projectId} isAdmin={isAdmin} />
        <ProjectAlerts />
      </div>
    </div>
  );
}
```

### Pattern 3: Dedicated Phases Page

Create a full page for phase management:

```tsx
// pages/ProjectPhasesPage.tsx
function ProjectPhasesPage() {
  const { projectId } = useParams();

  return (
    <main className="space-y-6">
      <ProjectHeader projectId={projectId} />
      <ProjectPhasesSection 
        proyectoId={projectId} 
        isAdmin={isAdmin}
        onPhaseStarted={handlePhaseStarted}
      />
      <PhaseHistory projectId={projectId} />
    </main>
  );
}
```

## Connecting to Real Data

### Step 1: Update Proyecto Service

Add phase data to your project model:

```typescript
// services/proyecto.service.ts
export interface Proyecto {
  id: string;
  nombre: string;
  // ... other fields
  fases?: Fase[];
}

export interface Fase {
  numero: number;
  nombre: string;
  progreso: number;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
  monto?: number;
}
```

### Step 2: Load Phases from Database

```typescript
// In ProjectPhasesSection.tsx, replace mock data:
const loadFases = async () => {
  try {
    setLoading(true);
    
    // Load from your service
    const proyecto = await proyectoService.getProyectoById(proyectoId);
    
    if (proyecto.fases) {
      setFases(proyecto.fases);
    } else {
      // If no phases, create default structure
      const defaultFases = await createDefaultPhases(proyectoId);
      setFases(defaultFases);
    }
  } catch (err) {
    setError('Error al cargar fases');
  } finally {
    setLoading(false);
  }
};
```

### Step 3: Implement Phase Start

```typescript
const handleIniciarFase = async (faseNumero: number) => {
  try {
    // Validate with blocking service
    const validation = await bloqueoFasesService.validarInicioFase(
      proyectoId, 
      faseNumero
    );
    
    if (!validation.puedeIniciar) {
      alert(validation.motivo);
      return;
    }

    // Update in database
    await proyectoService.iniciarFase(proyectoId, faseNumero);
    
    // Update local state
    setFases(prev => prev.map(f => 
      f.numero === faseNumero 
        ? { ...f, estado: 'en_progreso' }
        : f
    ));

    // Show notification
    showNotification(`Fase ${faseNumero} iniciada correctamente`);
  } catch (err) {
    console.error('Error starting phase:', err);
    alert('Error al iniciar la fase');
  }
};
```

## Admin Features

### Checking Admin Status

```typescript
// Using auth context
const { user } = useAuth();
const isAdmin = user?.role === 'admin' || user?.permissions?.includes('force_unblock');

// Or from user service
const isAdmin = await userService.hasPermission('force_unblock');
```

### Force Unblock Flow

When admin clicks "Forzar Inicio" on a blocked phase:

1. `FaseCard` shows `ForzarDesbloqueoModal`
2. Admin enters reason and confirmation
3. `bloqueoFasesService.forzarDesbloqueo()` is called
4. Action is recorded in audit trail
5. Phase is unblocked and can be started

### Audit Trail

View forced unblocks:

```typescript
const auditoria = await bloqueoFasesService.getAuditoriaProyecto(proyectoId);

auditoria.forEach(registro => {
  console.log(`
    Fase ${registro.faseNumero} desbloqueada
    Por: ${registro.usuario}
    Fecha: ${registro.fecha}
    Motivo: ${registro.motivo}
    Forzado: ${registro.forzado ? 'Sí' : 'No'}
  `);
});
```

## Testing

### Test Scenario 1: Normal Flow

1. Create project with 3 phases
2. Start phase 1
3. Complete phase 1 (100% progress)
4. System generates invoice for phase 1
5. Try to start phase 2 → Should be blocked
6. Mark invoice as paid
7. Phase 2 should auto-unblock
8. Start phase 2 successfully

### Test Scenario 2: Admin Force Unblock

1. Phase 2 is blocked (phase 1 not paid)
2. Login as admin
3. Click "Forzar Inicio" on phase 2
4. Enter reason: "Cliente autorizó inicio con pago pendiente"
5. Type "DESBLOQUEAR" to confirm
6. Phase 2 starts
7. Check audit trail for record

### Test Scenario 3: Non-Admin Blocked

1. Phase 2 is blocked
2. Login as regular user
3. See blocking message
4. "Iniciar Fase" button is disabled
5. Message: "Contacta al administrador para desbloquear"

## Troubleshooting

### Phase Not Unblocking After Payment

Check:
1. Invoice status is 'cobrada'
2. Invoice is linked to correct phase
3. `bloqueoFasesService.desbloquearSiguienteFaseSiCorresponde()` is called
4. Clear localStorage and reload

### Force Unblock Not Working

Check:
1. User has admin permissions
2. Confirmation text is exactly "DESBLOQUEAR" (uppercase)
3. Reason is not empty
4. Check browser console for errors

### Phases Not Loading

Check:
1. Project ID is valid
2. Project has phases defined
3. Check network tab for API errors
4. Verify localStorage has project data

## Best Practices

1. **Always check admin status** before showing force unblock options
2. **Validate on backend** - don't rely only on frontend blocking
3. **Show clear messages** about why phases are blocked
4. **Log all force unblocks** for audit purposes
5. **Refresh data** after phase actions
6. **Handle errors gracefully** with user-friendly messages
7. **Test with real payment flow** to ensure unblocking works

## Next Steps

After integrating phase blocking:

1. Connect to real invoice payment system
2. Add real-time updates when invoices are paid
3. Implement notifications for unblocked phases
4. Add phase timeline visualization
5. Create reports on blocked phases
6. Add bulk phase operations

## Support

For issues or questions:
- Check the component README files
- Review the bloqueo-fases.service.ts implementation
- See ProjectPhasesExamplePage.tsx for working example
- Check requirements 7.4 and 7.6 in design document
