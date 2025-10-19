# Troubleshooting Guide - Documents Integration

## Issue: New DocumentsPage Not Showing

### Problem
After implementing the new DocumentsPage with project integration, the old page is still showing.

### Root Cause
The new `DocumentsPage.tsx` was created but the old one was still being imported by `App.tsx`.

### Solution Applied
1. ✅ Deleted old `src/pages/DocumentsPage.tsx`
2. ✅ Created new `src/pages/DocumentsPage.tsx` with project integration
3. ✅ Created all required components:
   - `src/components/documentos/ProyectoSelector.tsx`
   - `src/components/documentos/CarpetasProyectoGrid.tsx`
   - `src/components/documentos/DocumentoListItem.tsx`
4. ✅ Created custom hooks:
   - `src/hooks/useProyectos.ts`
   - `src/hooks/useDocumentos.ts`
   - `src/hooks/useCarpetasProyecto.ts`
5. ✅ Created utilities:
   - `src/utils/documentos.utils.ts`
6. ✅ Created API wrappers:
   - `src/api/proyectos.api.ts`
   - `src/api/documentos.api.ts`
   - `src/api/ia.api.ts`

### Current Status
- Server is running on http://localhost:5173/
- Hot Module Replacement (HMR) is working
- No TypeScript errors detected

### Verification Steps

1. **Check if page is loading:**
   - Navigate to http://localhost:5173/documents
   - You should see the new page with "Documentos" title
   - You should see a project selector dropdown

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for any errors in the Console tab
   - Common issues:
     - Import errors (missing modules)
     - Type errors
     - API call failures

3. **Check Network tab:**
   - See if API calls are being made
   - Check for 404 errors on imports

### Common Issues and Fixes

#### Issue 1: "Cannot find module '@/components/documentos/...'"
**Fix:** Check that the component files exist in the correct location.

```bash
# Verify files exist
ls src/components/documentos/
# Should show:
# - ProyectoSelector.tsx
# - CarpetasProyectoGrid.tsx
# - DocumentoListItem.tsx
```

#### Issue 2: "Cannot find module '@/hooks/...'"
**Fix:** Check that hook files exist.

```bash
# Verify files exist
ls src/hooks/
# Should show:
# - useProyectos.ts
# - useDocumentos.ts
# - useCarpetasProyecto.ts
# - index.ts
```

#### Issue 3: "Cannot find module '@/api/...'"
**Fix:** Check that API files exist.

```bash
# Verify files exist
ls src/api/
# Should show:
# - proyectos.api.ts
# - documentos.api.ts
# - ia.api.ts
```

#### Issue 4: Page shows but no data
**Cause:** The services use mock data from `mockData.js`

**Fix:** This is expected behavior. The page will show:
- Empty state when no project is selected
- Project selector with mock projects
- Empty folders/documents (since there's no real data)

#### Issue 5: TypeScript errors
**Fix:** Run type checking:

```bash
npm run check
```

If errors appear, they need to be fixed in the respective files.

### Manual Verification

If the page still doesn't show, try these steps:

1. **Hard refresh the browser:**
   - Press Ctrl+Shift+R (Windows/Linux)
   - Press Cmd+Shift+R (Mac)

2. **Clear browser cache:**
   - Open DevTools
   - Right-click on refresh button
   - Select "Empty Cache and Hard Reload"

3. **Restart the dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

4. **Check if route is correct:**
   - The route in `App.tsx` should be: `/documents`
   - Navigate to: http://localhost:5173/documents

### Expected Behavior

When working correctly, you should see:

1. **Header Section:**
   - Title: "Documentos"
   - Description: "Gestiona todos los documentos de tus proyectos en un solo lugar"
   - Project selector dropdown

2. **Empty State (no project selected):**
   - Folder icon
   - Message: "Selecciona un proyecto"

3. **After selecting a project:**
   - Project info card (blue gradient)
   - 4 statistics cards (Documents, Folders, Storage, Shared)
   - Grid of 7 folder cards (Contratos, Planos, Facturas, etc.)

4. **After clicking a folder:**
   - Breadcrumb navigation
   - Search bar
   - List of documents (or empty state)

5. **Floating Action Buttons (bottom right):**
   - "Escanear Factura" (purple)
   - "Subir Documento" (blue)
   - "Buscar Inteligente" (indigo)

### Debug Mode

To enable debug logging, add this to the browser console:

```javascript
localStorage.setItem('DEBUG', 'true');
```

Then refresh the page. You should see console logs for:
- Component mounting
- API calls
- State changes

### Contact Support

If issues persist after trying all steps above:

1. Check the browser console for specific error messages
2. Check the terminal where `npm run dev` is running
3. Take a screenshot of any errors
4. Note which step in the verification process failed

### Files to Check

If you need to manually verify the implementation:

```
src/
├── pages/
│   └── DocumentsPage.tsx          ← Main page (NEW)
├── components/
│   └── documentos/
│       ├── ProyectoSelector.tsx   ← Project dropdown (NEW)
│       ├── CarpetasProyectoGrid.tsx ← Folder grid (NEW)
│       └── DocumentoListItem.tsx  ← Document item (NEW)
├── hooks/
│   ├── useProyectos.ts           ← Projects hook (NEW)
│   ├── useDocumentos.ts          ← Documents hook (NEW)
│   ├── useCarpetasProyecto.ts    ← Folders hook (NEW)
│   └── index.ts                  ← Hooks export (NEW)
├── api/
│   ├── proyectos.api.ts          ← Projects API (NEW)
│   ├── documentos.api.ts         ← Documents API (NEW)
│   └── ia.api.ts                 ← AI API (NEW)
├── services/
│   ├── proyecto.service.ts       ← Project service (NEW)
│   ├── documento.service.ts      ← Document service (NEW)
│   └── storage.service.ts        ← Storage service (NEW)
└── utils/
    └── documentos.utils.ts       ← Utilities (NEW)
```

All files marked (NEW) were created as part of this implementation.

---

**Last Updated:** January 18, 2025  
**Status:** Troubleshooting in progress
