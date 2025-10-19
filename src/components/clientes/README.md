# Clientes Components

This directory contains all components related to cliente (client) management.

## Components

### ClienteSelector
**File:** `ClienteSelector.tsx`  
**Purpose:** Autocomplete selector for choosing or creating a cliente  
**Requirements:** 1.2, 1.5

**Features:**
- Search with autocomplete
- Show recent clientes (last 5)
- Create new cliente inline
- Display selected cliente with company/user icon
- Dropdown with filtered results

**Props:**
```typescript
interface ClienteSelectorProps {
  value: string | null;           // Selected cliente ID
  onChange: (clienteId: string) => void;
  allowCreate?: boolean;          // Show "Create new" button
  onCreateClick?: () => void;     // Handler for create button
  placeholder?: string;
  className?: string;
}
```

**Usage:**
```tsx
import { ClienteSelector } from './components/clientes';

<ClienteSelector
  value={selectedClienteId}
  onChange={(id) => setSelectedClienteId(id)}
  allowCreate={true}
  onCreateClick={() => setShowModal(true)}
/>
```

---

### ClienteFormModal
**File:** `ClienteFormModal.tsx`  
**Purpose:** Modal form for creating or editing a cliente  
**Requirements:** 1.1

**Features:**
- Complete form with validation
- Fields: nombre, empresa, email, teléfono, CIF, dirección, datos bancarios
- Email format validation
- IBAN format validation
- Optional banking information section
- Create or edit mode

**Props:**
```typescript
interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Cliente) => void;
  cliente?: Cliente | null;  // If provided, edit mode
}
```

**Usage:**
```tsx
import { ClienteFormModal } from './components/clientes';

<ClienteFormModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={(cliente) => {
    console.log('Cliente saved:', cliente);
    loadClientes();
  }}
  cliente={selectedCliente}  // null for create, Cliente for edit
/>
```

---

## Page

### ClientesPage
**File:** `../pages/ClientesPage.tsx`  
**Purpose:** Main page for managing clientes  
**Requirements:** 1.1, 1.3, 1.5

**Features:**
- List of clientes with search
- Summary statistics cards (total, active, facturado, cobrado)
- Search by nombre, empresa, or email
- Sort by nombre, empresa, totalFacturado, or createdAt
- Create/edit/delete clientes
- Show cliente statistics (presupuestos, aprobados, facturado, cobrado)
- Prevent deletion of clientes with active projects

**Route:**
```tsx
// Add to App.tsx or router configuration
<Route path="/clientes" element={<ClientesPage />} />
```

---

## Services Used

All components use the `clienteService` from `src/services/cliente.service.ts`:

- `getClientesAll()` - Get all clientes
- `getClientesRecientes(limit)` - Get recent clientes
- `searchClientes(query)` - Search clientes
- `getCliente(id)` - Get single cliente
- `createCliente(data)` - Create new cliente
- `updateCliente(id, data)` - Update cliente
- `deleteCliente(id)` - Delete cliente

---

## Styling

All components follow the existing design system:
- Tailwind CSS with dark mode support
- Green accent color (`green-600`)
- Lucide React icons
- Consistent spacing and borders
- Responsive design (mobile-first)

---

## Validation

### ClienteFormModal Validations:
1. **Nombre** - Required, non-empty
2. **Email** - Required, valid email format
3. **Teléfono** - Required, non-empty
4. **IBAN** - Optional, but if provided must match format `[A-Z]{2}[0-9]{2}[A-Z0-9]+`

### ClienteService Validations:
1. Email uniqueness check
2. Cannot delete cliente with active projects
3. Email format validation

---

## Future Enhancements

Potential improvements for future iterations:
- Pagination for large cliente lists
- Export to CSV/Excel
- Bulk operations (import, delete)
- Advanced filters (by stats, date ranges)
- Cliente detail page with full history
- Integration with presupuestos and proyectos
