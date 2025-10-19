# Visual Component Guide - Phase Blocking

## Component Hierarchy

```
ProjectPhasesSection
│
├── FasesList
│   │
│   ├── Header (Progress Summary)
│   │   ├── Total Phases Count
│   │   ├── Completed Count
│   │   ├── Blocked Count Badge
│   │   └── Overall Progress Bar
│   │
│   ├── Phases Grid (2 columns on desktop)
│   │   │
│   │   ├── FaseCard (Phase 1)
│   │   │   ├── Status Icon (✓ Completed)
│   │   │   ├── Phase Name & Budget
│   │   │   ├── Progress Bar (100%)
│   │   │   └── Status Badge (Green)
│   │   │
│   │   ├── FaseCard (Phase 2) 
│   │   │   ├── Status Icon (🔒 Locked)
│   │   │   ├── Phase Name & Budget
│   │   │   ├── Blocking Warning Box
│   │   │   │   ├── Lock Icon
│   │   │   │   ├── "Fase bloqueada"
│   │   │   │   ├── Reason: "Pendiente cobro Fase 1"
│   │   │   │   └── Admin Note (if admin)
│   │   │   ├── Progress Bar (0%)
│   │   │   └── Action Button
│   │   │       ├── "Forzar Inicio" (if admin)
│   │   │       └── Disabled (if not admin)
│   │   │
│   │   └── FaseCard (Phase 3+)
│   │       └── ... (similar structure)
│   │
│   └── Admin Info Panel (if admin & blocked phases exist)
│       ├── Info Icon
│       └── Admin Instructions
│
└── ForzarDesbloqueoModal (when admin forces unblock)
    ├── Header
    │   ├── Warning Icon
    │   └── "Forzar Desbloqueo de Fase"
    ├── Warning Box
    │   ├── Current Blocking Reason
    │   └── Implications Warning
    ├── Reason Input (required)
    │   └── Textarea for justification
    ├── Confirmation Input (required)
    │   └── Must type "DESBLOQUEAR"
    └── Actions
        ├── Cancel Button
        └── Confirm Button
```

## Visual States

### 1. Phase Card - Normal (Not Blocked)

```
┌─────────────────────────────────────────┐
│ ✓  Fase 1: Cimentación y Estructura    │ [Completada]
│    Presupuesto: €50,000                 │
│                                         │
│ Progreso                          100%  │
│ ████████████████████████████████  100%  │
└─────────────────────────────────────────┘
```

### 2. Phase Card - Blocked (Regular User)

```
┌─────────────────────────────────────────┐
│ 🔒 Fase 2: Albañilería                 │ [Bloqueada]
│    Presupuesto: €35,000                 │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔒 Fase bloqueada                   │ │
│ │ Motivo: Pendiente cobro Fase 1      │ │
│ │ Contacta al administrador           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Progreso                            0%  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%  │
│                                         │
│ Contacta al administrador para          │
│ desbloquear esta fase                   │
└─────────────────────────────────────────┘
```

### 3. Phase Card - Blocked (Admin View)

```
┌─────────────────────────────────────────┐
│ 🔒 Fase 2: Albañilería                 │ [Bloqueada]
│    Presupuesto: €35,000                 │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔒 Fase bloqueada                   │ │
│ │ Motivo: Pendiente cobro Fase 1      │ │
│ │ Como administrador, puedes forzar   │ │
│ │ el inicio de esta fase.             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Progreso                            0%  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  🔓 Forzar Inicio                   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4. Phase Card - In Progress

```
┌─────────────────────────────────────────┐
│ ⏱  Fase 2: Albañilería                 │ [En Progreso]
│    Presupuesto: €35,000                 │
│                                         │
│ Progreso                           45%  │
│ ██████████████░░░░░░░░░░░░░░░░░░   45%  │
└─────────────────────────────────────────┘
```

### 5. Phase Card - Pending (Ready to Start)

```
┌─────────────────────────────────────────┐
│ ⚠  Fase 3: Instalaciones               │ [Pendiente]
│    Presupuesto: €28,000                 │
│                                         │
│ Progreso                            0%  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  ▶ Iniciar Fase                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Force Unblock Modal

```
┌───────────────────────────────────────────────┐
│ ⚠  Forzar Desbloqueo de Fase            [X]  │
│    Fase 2: Albañilería                        │
├───────────────────────────────────────────────┤
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ ⚠ Advertencia: Acción de Administrador   │ │
│ │                                           │ │
│ │ Esta fase está bloqueada por:             │ │
│ │ ┌───────────────────────────────────────┐ │ │
│ │ │ Pendiente cobro Fase 1                │ │ │
│ │ └───────────────────────────────────────┘ │ │
│ │                                           │ │
│ │ Forzar el desbloqueo puede afectar el     │ │
│ │ flujo de caja. Esta acción quedará        │ │
│ │ registrada en auditoría.                  │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ Motivo del desbloqueo forzado *               │
│ ┌───────────────────────────────────────────┐ │
│ │ Cliente autorizó inicio con pago          │ │
│ │ pendiente. Compromiso de pago en 5 días. │ │
│ │                                           │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ Confirmación *                                │
│ ┌───────────────────────────────────────────┐ │
│ │ DESBLOQUEAR                               │ │
│ └───────────────────────────────────────────┘ │
│ Escribe DESBLOQUEAR para confirmar           │
│                                               │
│                    [Cancelar] [🔓 Forzar]    │
└───────────────────────────────────────────────┘
```

## Color Coding

### Status Colors

- **Green** (Completada): `bg-green-100 text-green-800`
- **Blue** (En Progreso): `bg-blue-100 text-blue-800`
- **Gray** (Pendiente): `bg-gray-100 text-gray-800`
- **Red** (Bloqueada): `bg-red-100 text-red-800`

### Progress Bar Colors

- **Green**: Completed phases
- **Blue**: In progress phases
- **Red**: Blocked phases
- **Gray**: Pending phases

### Border Colors

- **Normal**: `border-gray-200`
- **Blocked**: `border-red-300`
- **Active**: `border-blue-300`

## Responsive Behavior

### Desktop (lg+)
```
┌─────────────────────────────────────────────────────┐
│ Fases del Proyecto                    [2 bloqueadas]│
│ 2 de 5 fases completadas                            │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  40%   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌──────────────────────┐  ┌──────────────────────┐ │
│ │ Fase 1               │  │ Fase 2 (Bloqueada)   │ │
│ └──────────────────────┘  └──────────────────────┘ │
│                                                     │
│ ┌──────────────────────┐  ┌──────────────────────┐ │
│ │ Fase 3               │  │ Fase 4               │ │
│ └──────────────────────┘  └──────────────────────┘ │
│                                                     │
│ ┌──────────────────────┐                           │
│ │ Fase 5               │                           │
│ └──────────────────────┘                           │
└─────────────────────────────────────────────────────┘
```

### Mobile (< lg)
```
┌─────────────────────────┐
│ Fases del Proyecto      │
│ 2 de 5 completadas      │
│ ████████░░░░░░░░░░  40% │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ Fase 1              │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Fase 2 (Bloqueada)  │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Fase 3              │ │
│ └─────────────────────┘ │
│                         │
│ ... (scrollable)        │
└─────────────────────────┘
```

## User Flows

### Flow 1: Regular User Sees Blocked Phase

```
User opens project
    ↓
Sees phases list
    ↓
Phase 2 shows red border
    ↓
Sees blocking message:
"Pendiente cobro Fase 1"
    ↓
"Iniciar Fase" button disabled
    ↓
Message: "Contacta al administrador"
```

### Flow 2: Admin Forces Unblock

```
Admin opens project
    ↓
Sees blocked phase
    ↓
Clicks "Forzar Inicio"
    ↓
Modal opens with warning
    ↓
Enters reason:
"Cliente autorizó..."
    ↓
Types "DESBLOQUEAR"
    ↓
Clicks "Forzar Desbloqueo"
    ↓
Phase unblocks
    ↓
Action logged in audit
    ↓
Phase starts
```

### Flow 3: Automatic Unblock

```
Phase 1 completed
    ↓
Invoice generated
    ↓
Phase 2 blocked
    ↓
User marks invoice paid
    ↓
System calls:
desbloquearSiguienteFase()
    ↓
Phase 2 automatically unblocks
    ↓
User sees "Iniciar Fase" enabled
    ↓
User starts Phase 2
```

## Dark Mode Variations

All components support dark mode with appropriate color adjustments:

- Background: `bg-white dark:bg-gray-800`
- Text: `text-gray-900 dark:text-white`
- Borders: `border-gray-200 dark:border-gray-700`
- Blocked: `border-red-300 dark:border-red-700`

## Accessibility Features

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ ARIA labels on all interactive elements
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ Color contrast meets WCAG AA
- ✅ Error messages announced
- ✅ Loading states announced

## Animation & Transitions

- Progress bars: `transition-all duration-300`
- Hover states: `transition-colors`
- Modal: Fade in/out
- Status changes: Smooth color transitions
- Loading spinner: Continuous rotation

## Icons Used

- 🔒 Lock (blocked)
- 🔓 Unlock (force unblock)
- ✓ CheckCircle (completed)
- ⏱ Clock (in progress)
- ⚠ AlertTriangle (pending/warning)
- ▶ Play (start phase)
- ℹ AlertCircle (info)
- ↻ RefreshCw (reload)

## Best Practices Demonstrated

1. **Clear Visual Hierarchy**: Status is immediately obvious
2. **Contextual Actions**: Buttons appear only when relevant
3. **Progressive Disclosure**: Details shown when needed
4. **Defensive Design**: Confirmation required for destructive actions
5. **Helpful Feedback**: Clear messages explain why actions are blocked
6. **Admin Transparency**: Warnings about audit trail
7. **Responsive Design**: Works on all screen sizes
8. **Accessibility First**: Keyboard and screen reader support
