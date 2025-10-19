# Firestore Security Rules - Budget & Finance Module

## Overview

This document describes the Firestore security rules implemented for the Budget and Finance module. These rules ensure data security while allowing appropriate access for different user roles and public presupuesto viewing.

## Key Security Principles

1. **Authentication Required**: Most operations require user authentication
2. **Company Isolation**: Users can only access data from their own company
3. **Role-Based Access**: Admins have additional permissions
4. **Public Access**: Presupuestos can be viewed publicly via secure tokens
5. **Audit Trail**: All writes are logged with user information

## Helper Functions

### `isAuthenticated()`
Checks if the user is logged in.

### `isOwner(userId)`
Checks if the authenticated user matches the specified userId.

### `belongsToUserCompany()`
Verifies that the resource belongs to the same company as the authenticated user.

### `isAdmin()`
Checks if the authenticated user has admin role.

## Collection Rules

### `/clientes/{clienteId}`

**Purpose**: Store client information for presupuestos and projects.

**Permissions**:
- **Read**: Authenticated users from the same company
- **Create**: Any authenticated user
- **Update/Delete**: Authenticated users from the same company

**Security Notes**:
- Clients are company-specific
- No cross-company access
- All operations require authentication

### `/presupuestos/{presupuestoId}`

**Purpose**: Store budget/quote documents with phases, partidas, and payment plans.

**Permissions**:
- **Read**: Authenticated users from the same company
- **Create**: Any authenticated user
- **Update/Delete**: Authenticated users from the same company

**Subcollections**:
- `/historial/{cambioId}`: Change history, same permissions as parent

**Security Notes**:
- Presupuestos are private by default
- Public access is handled via separate collection (see below)
- Version history is protected

### `/presupuestos-publicos/{token}`

**Purpose**: Allow clients to view presupuestos via unique token without authentication.

**Permissions**:
- **Read**: Anyone with the token (no authentication required)
- **Write**: Only authenticated users

**Security Notes**:
- Tokens should be UUIDs (non-guessable)
- Contains minimal data: presupuesto content + metadata
- Tracks views and client actions (approve/reject)
- Write operations require authentication (for tracking)

**Implementation**:
```javascript
// When sending presupuesto to client:
const token = uuidv4();
await db.collection('presupuestos-publicos').doc(token).set({
  presupuestoId: presupuesto.id,
  presupuestoData: presupuesto,
  createdAt: Timestamp.now(),
  expiresAt: Timestamp.fromDate(validezDate),
  views: []
});

// Public URL: https://app.trae.com/presupuestos/public/{token}
```

### `/proyectos/{proyectoId}`

**Purpose**: Store project information (extended from existing collection).

**Permissions**:
- **Read**: Authenticated users from the same company
- **Create**: Any authenticated user
- **Update/Delete**: Authenticated users from the same company

**Subcollections**:
- `/fases/{faseId}`: Project phases
- `/gastos/{gastoId}`: Project expenses

**Security Notes**:
- Projects are company-specific
- Subcollections inherit parent permissions
- Finance data is protected

### `/facturas/{facturaId}`

**Purpose**: Store invoices generated from presupuestos and project phases.

**Permissions**:
- **Read**: Authenticated users from the same company
- **Create**: Any authenticated user
- **Update**: Authenticated users from the same company
- **Delete**: Admins only

**Security Notes**:
- Facturas cannot be deleted by regular users (audit trail)
- Only admins can delete (for corrections)
- All changes are tracked

### `/alertas-financieras/{alertaId}`

**Purpose**: Store automatic financial alerts (low capital, pending payments, etc.).

**Permissions**:
- **Read**: Authenticated users from the same company
- **Create**: Any authenticated user (system-generated)
- **Update**: Authenticated users from the same company
- **Delete**: Admins only

**Security Notes**:
- Alerts are company-specific
- Users can mark as resolved (update)
- Only admins can delete

### `/gastos/{gastoId}`

**Purpose**: Store expenses (global collection, not project-specific).

**Permissions**:
- **Read**: Authenticated users from the same company
- **Create**: Any authenticated user
- **Update/Delete**: Authenticated users from the same company

**Security Notes**:
- Expenses are company-specific
- Can be linked to projects
- Can be linked to documents

### `/documentos/{documentoId}`

**Purpose**: Store scanned documents (receipts, invoices, etc.).

**Permissions**:
- **Read**: Authenticated users from the same company
- **Create**: Any authenticated user
- **Update/Delete**: Authenticated users from the same company

**Security Notes**:
- Documents are company-specific
- Can be linked to expenses
- Storage URLs are protected

### `/tesoreria/{proyectoId}`

**Purpose**: Cache tesorería (treasury) calculations for performance.

**Permissions**:
- **Read**: Authenticated users from the same company
- **Write**: Authenticated users from the same company

**Security Notes**:
- Cached data, recalculated on demand
- Project-specific
- Updated automatically on financial transactions

### `/rentabilidad/{proyectoId}`

**Purpose**: Store profitability analysis results for completed projects.

**Permissions**:
- **Read**: Authenticated users from the same company
- **Write**: Authenticated users from the same company

**Security Notes**:
- Generated when project completes
- Contains sensitive financial data
- Company-specific

### `/notificaciones/{notificacionId}`

**Purpose**: Store user notifications.

**Permissions**:
- **Read**: Owner only (user who receives the notification)
- **Create**: Any authenticated user
- **Update/Delete**: Owner only

**Security Notes**:
- User-specific (not company-wide)
- Users can only see their own notifications
- Auto-generated by system

## Deployment

### Deploy Rules to Firebase

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

### Verify Deployment

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click on "Rules" tab
4. Verify the rules are active
5. Check the deployment timestamp

### Test Rules

Use Firebase Emulator for local testing:

```bash
# Start emulator
firebase emulators:start

# Run tests
npm run test:firestore-rules
```

## Security Best Practices

### 1. Token Generation

Always use cryptographically secure tokens:

```javascript
import { v4 as uuidv4 } from 'uuid';

const token = uuidv4(); // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

### 2. Token Expiration

Implement token expiration:

```javascript
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

await db.collection('presupuestos-publicos').doc(token).set({
  // ... other data
  expiresAt: Timestamp.fromDate(expiresAt)
});

// In client code, check expiration:
if (presupuestoPublico.expiresAt.toDate() < new Date()) {
  throw new Error('Este presupuesto ha expirado');
}
```

### 3. Rate Limiting

Implement rate limiting for public endpoints:

```javascript
// Track views to detect abuse
const views = presupuestoPublico.views || [];
const recentViews = views.filter(v => 
  v.timestamp.toDate() > new Date(Date.now() - 3600000) // Last hour
);

if (recentViews.length > 100) {
  throw new Error('Demasiadas solicitudes. Intente más tarde.');
}
```

### 4. Data Validation

Always validate data on the client before writing:

```javascript
// Example: Validate factura before creating
function validateFactura(factura) {
  if (!factura.proyectoId) throw new Error('proyectoId requerido');
  if (!factura.clienteId) throw new Error('clienteId requerido');
  if (factura.total <= 0) throw new Error('total debe ser positivo');
  // ... more validations
}
```

### 5. Sensitive Data

Never expose sensitive data in public collections:

```javascript
// ❌ BAD: Exposing full client data
await db.collection('presupuestos-publicos').doc(token).set({
  cliente: fullClientData // Contains CIF, bank details, etc.
});

// ✅ GOOD: Only expose necessary data
await db.collection('presupuestos-publicos').doc(token).set({
  cliente: {
    nombre: cliente.nombre,
    empresa: cliente.empresa
    // No CIF, no bank details
  }
});
```

## Monitoring and Auditing

### Enable Audit Logs

In Firebase Console:
1. Go to IAM & Admin > Audit Logs
2. Enable "Data Read" and "Data Write" for Firestore
3. Set up log exports to BigQuery for analysis

### Monitor Security Events

Set up alerts for:
- Unusual number of failed permission checks
- High volume of public presupuesto access
- Attempts to access other companies' data
- Admin operations (deletes, etc.)

### Regular Security Reviews

- Review rules quarterly
- Check for new security vulnerabilities
- Update rules as features are added
- Test rules with different user roles

## Troubleshooting

### "Permission Denied" Errors

1. **Check Authentication**: Ensure user is logged in
2. **Check Company**: Verify user's empresaId matches resource
3. **Check Role**: Some operations require admin role
4. **Check Rules**: Verify rules are deployed correctly

### Public Presupuesto Not Loading

1. **Check Token**: Verify token exists in `presupuestos-publicos`
2. **Check Expiration**: Verify presupuesto hasn't expired
3. **Check Data**: Ensure presupuestoData is complete
4. **Check Network**: Verify Firestore connection

### Performance Issues

1. **Use Indexes**: Create composite indexes for complex queries
2. **Cache Data**: Use tesoreria collection for cached calculations
3. **Limit Reads**: Implement pagination
4. **Optimize Rules**: Avoid complex get() calls in rules

## Related Documentation

- [Firestore Indexes](./firestore.indexes.json)
- [Presupuestos Guide](./docs/PRESUPUESTOS_GUIDE.md)
- [Finanzas Guide](./docs/FINANZAS_GUIDE.md)
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)

---

**Last Updated**: January 2025  
**Version**: 1.0.0
