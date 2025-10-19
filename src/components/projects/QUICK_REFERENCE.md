# Phase Blocking - Quick Reference Card

## 🚀 Quick Start (30 seconds)

```tsx
import { ProjectPhasesSection } from '@/components/projects';

<ProjectPhasesSection 
  proyectoId={projectId} 
  isAdmin={isAdmin} 
/>
```

## 📦 Components at a Glance

| Component | Use When | Props |
|-----------|----------|-------|
| `ProjectPhasesSection` | Adding to existing page | `proyectoId`, `isAdmin?`, `onPhaseStarted?` |
| `FasesList` | Custom phase loading | `proyectoId`, `fases`, `isAdmin?`, `onIniciarFase?` |
| `FaseCard` | Single phase display | `proyectoId`, `faseNumero`, `faseNombre`, `progreso`, `estado`, `monto?`, `isAdmin?` |
| `ForzarDesbloqueoModal` | Admin force unblock | `isOpen`, `onClose`, `faseNumero`, `faseNombre`, `motivoBloqueo`, `onConfirm` |

## 🔒 Blocking Rules

| Phase | Can Start When |
|-------|----------------|
| Phase 1 | Adelanto is paid |
| Phase 2+ | Previous phase invoice is paid |

## 🎨 Phase States

| Estado | Icon | Color | Description |
|--------|------|-------|-------------|
| `completada` | ✓ | Green | Phase finished |
| `en_progreso` | ⏱ | Blue | Currently active |
| `pendiente` | ⚠ | Gray | Ready to start |
| `bloqueada` | 🔒 | Red | Cannot start (payment pending) |

## 👤 User Roles

### Regular User (Blocked Phase)
- ❌ Cannot start blocked phase
- ✅ Sees blocking reason
- ✅ Message: "Contact administrator"

### Admin (Blocked Phase)
- ✅ Can force unblock
- ✅ Must provide reason
- ✅ Must type "DESBLOQUEAR"
- ✅ Action logged in audit

## 🔧 Service Methods

```typescript
// Check if phase is blocked
const status = await bloqueoFasesService.estaFaseBloqueada(proyectoId, faseNumero);
// Returns: { bloqueada: boolean, motivo?: string, puedeForza: boolean }

// Validate phase start
const validation = await bloqueoFasesService.validarInicioFase(proyectoId, faseNumero);
// Returns: { puedeIniciar: boolean, motivo?: string }

// Force unblock (admin only)
await bloqueoFasesService.forzarDesbloqueo(proyectoId, faseNumero, usuario, motivo);

// Get blocked phases
const bloqueadas = await bloqueoFasesService.getFasesBloqueadas(proyectoId);

// Get audit trail
const auditoria = await bloqueoFasesService.getAuditoriaProyecto(proyectoId);
```

## 📝 Common Patterns

### Pattern 1: Add to Tab
```tsx
{activeTab === 'phases' && (
  <ProjectPhasesSection proyectoId={projectId} isAdmin={isAdmin} />
)}
```

### Pattern 2: Sidebar Widget
```tsx
<div className="col-span-1">
  <ProjectPhasesSection proyectoId={projectId} isAdmin={isAdmin} />
</div>
```

### Pattern 3: Full Page
```tsx
<main>
  <ProjectHeader />
  <ProjectPhasesSection 
    proyectoId={projectId} 
    isAdmin={isAdmin}
    onPhaseStarted={handlePhaseStarted}
  />
</main>
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Phase not unblocking | Check invoice status is 'cobrada' |
| Force unblock not working | Verify user is admin and typed "DESBLOQUEAR" |
| Phases not loading | Check projectId is valid |
| Button disabled | Phase is blocked or already started |

## ✅ Testing Checklist

- [ ] Phase 1 can start with adelanto
- [ ] Phase 2 blocked without Phase 1 payment
- [ ] Phase 2 unblocks when Phase 1 paid
- [ ] Admin sees "Forzar Inicio" button
- [ ] Regular user sees disabled button
- [ ] Force unblock requires reason
- [ ] Force unblock requires "DESBLOQUEAR"
- [ ] Audit trail records force unblock
- [ ] Dark mode works correctly
- [ ] Mobile responsive

## 🎯 Key Files

```
src/
├── components/projects/
│   ├── FaseCard.tsx              ← Individual phase
│   ├── FasesList.tsx             ← Grid of phases
│   ├── ForzarDesbloqueoModal.tsx ← Admin force unblock
│   ├── ProjectPhasesSection.tsx  ← Easy integration
│   └── index.ts                  ← Exports
├── services/
│   └── bloqueo-fases.service.ts  ← Blocking logic
└── pages/
    └── ProjectPhasesExamplePage.tsx ← Working example
```

## 📚 Documentation

- `README.md` - Component overview
- `INTEGRATION_GUIDE.md` - Detailed integration steps
- `VISUAL_GUIDE.md` - Visual examples and flows
- `QUICK_REFERENCE.md` - This file

## 🔗 Related Requirements

- **Req 7.1**: Validate phase start based on payment
- **Req 7.2**: Generate invoice when phase completes
- **Req 7.3**: Block next phase until payment
- **Req 7.4**: Show blocking reason in UI ✅
- **Req 7.5**: Auto-unblock when invoice paid
- **Req 7.6**: Admin force unblock with audit ✅

## 💡 Pro Tips

1. Always check `isAdmin` before showing force unblock
2. Refresh phase data after payment actions
3. Use `onPhaseStarted` callback for notifications
4. Test with real payment flow
5. Check audit trail regularly
6. Handle errors gracefully
7. Show loading states
8. Validate on backend too

## 🚨 Important Notes

- ⚠️ Force unblock is logged in audit trail
- ⚠️ Blocking protects cash flow - use force sparingly
- ⚠️ Always validate on backend, not just frontend
- ⚠️ Phase 1 requires adelanto payment
- ⚠️ Confirmation text must be exact: "DESBLOQUEAR"

## 📞 Need Help?

1. Check `INTEGRATION_GUIDE.md` for detailed steps
2. See `ProjectPhasesExamplePage.tsx` for working example
3. Review `bloqueo-fases.service.ts` for logic
4. Check requirements 7.4 and 7.6 in design doc
