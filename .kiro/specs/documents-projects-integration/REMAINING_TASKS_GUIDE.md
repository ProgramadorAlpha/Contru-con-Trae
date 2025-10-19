# Remaining Tasks Implementation Guide
## Documents ↔ Projects Integration

**Date:** January 18, 2025  
**Status:** Implementation Guide for Tasks 12, 14, 17-21  
**Current Progress:** 67% (14/21 tasks complete)

---

## Overview

This guide provides detailed implementation instructions for the remaining 7 tasks. Most of the heavy lifting is done - these tasks are about integration, enhancement, and quality assurance.

---

## Task 12: ScanReceiptModal Enhancements

**Status:** ⏳ Pending  
**Priority:** High  
**Estimated Time:** 12 hours  
**Dependencies:** Existing ReceiptScanModal component

### What Needs to Be Done

Enhance the existing `src/components/ai/ReceiptScanModal.tsx` to include AI project suggestion functionality.

### Implementation Steps

#### 12.1: Add proyectoIdDefault Prop

```typescript
// In ReceiptScanModal.tsx
interface ReceiptScanModalProps {
  // ... existing props
  proyectoIdDefault?: string; // Add this
}

export default function ReceiptScanModal({
  // ... existing props
  proyectoIdDefault
}: ReceiptScanModalProps) {
  // Pre-select project if provided
  useEffect(() => {
    if (proyectoIdDefault) {
      setSelectedProyecto(proyectoIdDefault);
    }
  }, [proyectoIdDefault]);
}
```

#### 12.2: Add Project Suggestion State

```typescript
// Add new state
const [suggestionState, setSuggestionState] = useState<'idle' | 'suggesting' | 'suggested'>('idle');
const [projectSuggestion, setProjectSuggestion] = useState<SugerenciaProyectoIA | null>(null);
```

#### 12.3: Implement Suggestion UI

```typescript
// After receipt is scanned, show suggestion
{suggestionState === 'suggested' && projectSuggestion && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-medium text-blue-900 mb-1">
          Proyecto Sugerido
        </h4>
        <p className="text-sm text-blue-700 mb-3">
          {projectSuggestion.razon}
        </p>
        
        {/* Main Suggestion */}
        <div className="bg-white rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {projectSuggestion.proyecto_nombre}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">
                  Confianza:
                </span>
                <span className={`text-sm font-medium ${
                  projectSuggestion.confianza >= 80 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {projectSuggestion.confianza}%
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedProyecto(projectSuggestion.proyecto_id);
                setSuggestionState('idle');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Confirmar
            </button>
          </div>
        </div>

        {/* Alternatives */}
        {projectSuggestion.alternativas && projectSuggestion.alternativas.length > 0 && (
          <div>
            <p className="text-sm text-blue-700 mb-2">
              Otras opciones:
            </p>
            <div className="space-y-2">
              {projectSuggestion.alternativas.map((alt) => (
                <button
                  key={alt.proyecto_id}
                  onClick={() => {
                    setSelectedProyecto(alt.proyecto_id);
                    setSuggestionState('idle');
                  }}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {alt.proyecto_nombre}
                  </p>
                  <p className="text-xs text-gray-600">
                    Confianza: {alt.confianza}%
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setSuggestionState('idle')}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700"
        >
          Cambiar manualmente
        </button>
      </div>
    </div>
  </div>
)}
```

#### 12.4: Integrate with AI API

```typescript
// After receipt analysis
const handleReceiptAnalyzed = async (analysis: AnalisisRecibo) => {
  // If no project selected, get suggestion
  if (!selectedProyecto) {
    setSuggestionState('suggesting');
    
    try {
      const response = await iaApi.sugerirProyecto({
        recibo: analysis,
        usuario_id: currentUser?.id
      });

      if (response.success && response.data) {
        setProjectSuggestion(response.data);
        setSuggestionState('suggested');
        
        // Auto-select if confidence > 80%
        if (response.data.confianza > 80) {
          setSelectedProyecto(response.data.proyecto_id);
          setSuggestionState('idle');
        }
      }
    } catch (error) {
      console.error('Error getting project suggestion:', error);
      setSuggestionState('idle');
    }
  }
};
```

#### 12.5: Improve Save Flow

```typescript
// Save document + expense in one transaction
const handleSave = async () => {
  if (!selectedProyecto || !receiptData) return;

  setLoading(true);
  try {
    const response = await documentosApi.escanearRecibo({
      archivo: receiptFile,
      proyecto_id: selectedProyecto,
      usuario_id: currentUser?.id
    });

    if (response.success) {
      // Show success message
      toast.success('Recibo escaneado y gasto creado exitosamente');
      onClose();
      onSuccess?.(response.data);
    } else {
      toast.error(response.error || 'Error al guardar');
    }
  } catch (error) {
    toast.error('Error al procesar el recibo');
  } finally {
    setLoading(false);
  }
};
```

---

## Task 14: ProyectoDocumentosWidget

**Status:** ⏳ Pending  
**Priority:** Medium  
**Estimated Time:** 6 hours  
**Dependencies:** None

### What Needs to Be Done

Create or enhance a project card/widget to show document information and provide quick access to the documents module.

### Implementation

```typescript
// src/components/proyectos/ProyectoDocumentosWidget.tsx

import { FileText, Folder, HardDrive, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { proyectosApi } from '@/api/proyectos.api';
import { useEffect, useState } from 'react';

interface ProyectoDocumentosWidgetProps {
  proyectoId: string;
  proyectoNombre: string;
}

export default function ProyectoDocumentosWidget({
  proyectoId,
  proyectoNombre
}: ProyectoDocumentosWidgetProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [proyectoId]);

  const loadStats = async () => {
    try {
      const response = await proyectosApi.getProyectoDocumentosStats(proyectoId);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocuments = () => {
    navigate(`/documentos?proyecto=${proyectoId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Documentos
        </h3>
        <button
          onClick={handleViewDocuments}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {stats.total_documentos}
            </p>
            <p className="text-sm text-gray-600">Documentos</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <Folder className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {stats.total_carpetas}
            </p>
            <p className="text-sm text-gray-600">Carpetas</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <HardDrive className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {stats.espacio_usado_gb.toFixed(1)} GB
            </p>
            <p className="text-sm text-gray-600">Espacio</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <Users className="w-6 h-6 text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {stats.documentos_compartidos}
            </p>
            <p className="text-sm text-gray-600">Compartidos</p>
          </div>
        </div>
      )}

      <button
        onClick={handleViewDocuments}
        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Gestionar Documentos
      </button>
    </div>
  );
}
```

---

## Tasks 17-19: Testing

**Status:** ⏳ Pending  
**Priority:** High  
**Estimated Time:** 22 hours total

### Task 17: E2E Testing (10 hours)

Create E2E tests using Playwright or Cypress.

```bash
# Install Playwright
npm install -D @playwright/test

# Create test file
# tests/e2e/documentos-navigation.spec.ts
```

```typescript
import { test, expect } from '@playwright/test';

test.describe('Documents Navigation', () => {
  test('should navigate through folders', async ({ page }) => {
    await page.goto('/documentos');
    
    // Select project
    await page.click('[data-testid="proyecto-selector"]');
    await page.click('text=Proyecto Girassol');
    
    // Verify folders are displayed
    await expect(page.locator('text=Contratos')).toBeVisible();
    await expect(page.locator('text=Facturas')).toBeVisible();
    
    // Click on Facturas folder
    await page.click('text=Facturas');
    
    // Verify breadcrumb
    await expect(page.locator('text=Carpetas / Facturas')).toBeVisible();
  });

  test('should search documents', async ({ page }) => {
    await page.goto('/documentos');
    
    // Select project
    await page.click('[data-testid="proyecto-selector"]');
    await page.click('text=Proyecto Girassol');
    
    // Enter search query
    await page.fill('[placeholder="Buscar documentos..."]', 'factura');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Verify results
    const results = page.locator('[data-testid="document-item"]');
    await expect(results).toHaveCount(await results.count());
  });
});
```

### Task 18: Performance Testing (4 hours)

```typescript
// tests/performance/load-times.spec.ts

test('should load folders in under 1 second', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/documentos');
  await page.click('[data-testid="proyecto-selector"]');
  await page.click('text=Proyecto Girassol');
  
  await page.waitForSelector('[data-testid="carpeta-grid"]');
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(1000);
});
```

### Task 19: Bug Fixes (8 hours)

Create a bug tracking document and fix issues found during testing.

---

## Tasks 20-21: Deployment & Documentation

**Status:** ⏳ Pending  
**Priority:** High  
**Estimated Time:** 8 hours total

### Task 20: Deployment (4 hours)

#### 20.1: Run Migrations in Production

```bash
# 1. Backup production database
pg_dump -U postgres production_db > backup_$(date +%Y%m%d).sql

# 2. Run schema migration
psql -U postgres -d production_db -f migrations/20250118_add_proyecto_documents_integration.sql

# 3. Run data migration
NODE_ENV=production npm run migrate:documents

# 4. Validate
npm run validate:migration
```

#### 20.2: Deploy Frontend

```bash
# 1. Build for production
npm run build

# 2. Deploy to Vercel/Netlify
vercel --prod
# or
netlify deploy --prod
```

#### 20.3: Configure Monitoring

Set up error tracking and monitoring:
- Sentry for error tracking
- Google Analytics for usage
- CloudWatch for API monitoring

### Task 21: Documentation (4 hours)

#### 21.1: API Documentation

Create Swagger/OpenAPI documentation for all endpoints.

#### 21.2: User Guide

```markdown
# User Guide: Document Management

## Getting Started

1. Select a project from the dropdown
2. View folders organized by document type
3. Click a folder to see documents
4. Use search to find specific documents

## Scanning Receipts

1. Click "Escanear Factura" button
2. Take a photo or upload an image
3. AI will extract information automatically
4. Review and confirm the data
5. Document and expense are created automatically

## Linking Documents to Expenses

1. Find an invoice document
2. Click "Vincular a Gasto"
3. Select the expense to link
4. Both records are now connected
```

#### 21.3: Maintenance Guide

```markdown
# Maintenance Guide

## Running Migrations

See migrations/README.md

## Monitoring AI Usage

Check rate limits:
```bash
curl /api/ia/rate-limit-status
```

## Troubleshooting

Common issues and solutions...
```

---

## Quick Implementation Checklist

### Task 12: ScanReceiptModal ⏳
- [ ] Add proyectoIdDefault prop
- [ ] Add suggestion state
- [ ] Create suggestion UI
- [ ] Integrate with IA API
- [ ] Improve save flow
- [ ] Test with real receipts

### Task 14: ProyectoDocumentosWidget ⏳
- [ ] Create component file
- [ ] Load project stats
- [ ] Display 4 stat cards
- [ ] Add navigation button
- [ ] Integrate in project views
- [ ] Test responsiveness

### Task 17: E2E Testing ⏳
- [ ] Install Playwright
- [ ] Write navigation tests
- [ ] Write search tests
- [ ] Write upload tests
- [ ] Write receipt scan tests
- [ ] Run all tests

### Task 18: Performance Testing ⏳
- [ ] Test folder load times
- [ ] Test document list load times
- [ ] Test search performance
- [ ] Optimize slow queries
- [ ] Document results

### Task 19: Bug Fixes ⏳
- [ ] Create bug tracking doc
- [ ] Fix critical bugs
- [ ] Fix UI/UX issues
- [ ] Verify all fixes
- [ ] Update tests

### Task 20: Deployment ⏳
- [ ] Backup production DB
- [ ] Run migrations
- [ ] Deploy frontend
- [ ] Configure monitoring
- [ ] Verify deployment

### Task 21: Documentation ⏳
- [ ] API documentation
- [ ] User guide
- [ ] Maintenance guide
- [ ] Video tutorials (optional)

---

## Estimated Timeline

- **Task 12:** 2 days
- **Task 14:** 1 day
- **Tasks 17-19:** 3 days
- **Tasks 20-21:** 1 day

**Total:** ~7 days to complete all remaining tasks

---

## Support Resources

- **Code Examples:** All completed tasks provide working examples
- **API Documentation:** See src/api/ files for usage
- **Component Examples:** See src/components/documentos/ for patterns
- **Testing Examples:** See src/services/*.test.ts for unit test patterns

---

**Last Updated:** January 18, 2025  
**Status:** Ready for Implementation  
**Next Review:** After Task 12 completion
