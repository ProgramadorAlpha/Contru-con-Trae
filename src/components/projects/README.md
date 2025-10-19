# Project Components - Phase Blocking Integration

## Overview

This directory contains components for managing project phases with automatic blocking based on payment status. These components implement Requirements 7.4 and 7.6 from the budget-finance-module specification.

## Components

### FaseCard

Displays individual phase information with blocking status and controls.

**Features:**
- Shows phase progress and status
- Displays blocking warning with reason
- Allows admin to force unblock with confirmation
- Disables "Start Phase" button when blocked
- Visual indicators for different states (completed, in progress, pending, blocked)

**Props:**
```typescript
interface FaseCardProps {
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

### FasesList

Displays a grid of all project phases with overall progress.

**Features:**
- Shows all phases in a responsive grid
- Displays overall project progress
- Shows count of blocked phases
- Admin information panel
- Automatic refresh after phase actions

**Props:**
```typescript
interface FasesListProps {
  proyectoId: string;
  fases: Fase[];
  onIniciarFase?: (faseNumero: number) => void;
  isAdmin?: boolean;
}
```

### ForzarDesbloqueoModal

Modal for administrators to force unblock a phase with confirmation.

**Features:**
- Requires reason for forced unblock
- Confirmation text input ("DESBLOQUEAR")
- Shows blocking reason
- Warning about audit trail
- Prevents accidental force unblocks

**Props:**
```typescript
interface ForzarDesbloqueoModalProps {
  isOpen: boolean;
  onClose: () => void;
  faseNumero: number;
  faseNombre: string;
  motivoBloqueo: string;
  onConfirm: (motivo: string) => void;
  loading?: boolean;
}
```

### ProjectPhasesSection

High-level section component that can be integrated into any project detail page.

**Features:**
- Loads phases for a project
- Handles phase start actions
- Error handling and loading states
- Easy integration into existing pages

**Props:**
```typescript
interface ProjectPhasesSectionProps {
  proyectoId: string;
  isAdmin?: boolean;
  onPhaseStarted?: (faseNumero: number) => void;
}
```

## Integration Guide

### Basic Integration

Add the phases section to any project detail page:

```tsx
import { ProjectPhasesSection } from '@/components/projects';

function ProjectDetailPage() {
  const { projectId } = useParams();
  const isAdmin = useAuth().user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Other project sections */}
      
      <ProjectPhasesSection
        proyectoId={projectId}
        isAdmin={isAdmin}
        onPhaseStarted={(faseNumero) => {
          console.log(`Phase ${faseNumero} started`);
          // Refresh project data, show notification, etc.
        }}
      />
    </div>
  );
}
```

### Custom Integration

For more control, use the individual components:

```tsx
import { FasesList } from '@/components/projects';

function CustomProjectView() {
  const [fases, setFases] = useState([]);
  
  // Load phases from your service
  useEffect(() => {
    loadProjectPhases();
  }, []);

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

## Phase Blocking Logic

The components integrate with `bloqueoFasesService` which implements the following rules:

1. **Phase 1**: Can always start (only requires adelanto payment)
2. **Subsequent Phases**: Blocked until previous phase invoice is paid
3. **Automatic Blocking**: When a phase reaches 100%, next phase is blocked until payment
4. **Automatic Unblocking**: When invoice is marked as paid, next phase is unblocked
5. **Force Unblock**: Admins can force unblock with reason (recorded in audit trail)

## Blocking States

- **Bloqueada**: Phase cannot be started due to unpaid previous phase
- **Pendiente**: Phase is ready to start (no blocking)
- **En Progreso**: Phase is currently active
- **Completada**: Phase is finished

## Admin Features

When `isAdmin={true}`:
- Can see "Force Unblock" button on blocked phases
- Sees admin information panel with warnings
- Force unblock requires:
  - Written reason/justification
  - Confirmation text ("DESBLOQUEAR")
  - Action is recorded in audit trail

## Styling

All components support dark mode and use Tailwind CSS classes. They follow the existing design system with:
- Consistent spacing and borders
- Color-coded status indicators
- Responsive layouts
- Accessible focus states

## Testing

To test the phase blocking integration:

1. Create a project with multiple phases
2. Complete phase 1 without marking invoice as paid
3. Try to start phase 2 - should be blocked
4. Mark phase 1 invoice as paid
5. Phase 2 should automatically unblock
6. Test admin force unblock with proper confirmation

## Future Enhancements

- Real-time updates when invoices are paid
- Notifications when phases are unblocked
- Phase timeline visualization
- Bulk phase operations
- Phase dependencies beyond sequential
