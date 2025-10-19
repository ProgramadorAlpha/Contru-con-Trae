# Gastos con Documentos - Guía de Uso

## Descripción General

Este módulo permite gestionar gastos con soporte completo para adjuntar y visualizar documentos de respaldo. Los documentos se agrupan por categoría de gasto y están disponibles en el análisis de rentabilidad.

## Componentes

### 1. GastoCard
Tarjeta que muestra un gasto individual con sus documentos adjuntos.

**Características:**
- Información del gasto (concepto, monto, fecha, proveedor)
- Estado de aprobación
- Lista de documentos adjuntos
- Vista previa de documentos (imágenes y PDFs)
- Descarga de documentos
- Acciones: editar, eliminar, aprobar

**Uso:**
```tsx
import { GastoCard } from './components/finanzas/GastoCard';

<GastoCard
  gasto={gasto}
  onEdit={(g) => handleEdit(g)}
  onDelete={(id) => handleDelete(id)}
  onApprove={(id) => handleApprove(id)}
/>
```

### 2. GastoFormModal
Modal para crear o editar gastos con capacidad de adjuntar documentos.

**Características:**
- Formulario completo de gasto
- Selección de categoría
- Campos de proveedor y factura
- Área de carga de archivos (drag & drop)
- Múltiples archivos
- Vista de documentos existentes
- Validación de formulario

**Uso:**
```tsx
import { GastoFormModal } from './components/finanzas/GastoFormModal';

<GastoFormModal
  gasto={editingGasto} // undefined para nuevo
  proyectoId={proyectoId}
  onClose={() => setShowModal(false)}
  onSuccess={() => reloadGastos()}
/>
```

### 3. GastosList
Lista completa de gastos con filtros y búsqueda.

**Características:**
- Tarjetas de resumen (total, aprobados, pendientes)
- Filtros por categoría y estado
- Búsqueda por texto
- Botón crear nuevo gasto
- Integra GastoCard y GastoFormModal

**Uso:**
```tsx
import { GastosList } from './components/finanzas/GastosList';

<GastosList proyectoId={proyectoId} />
```

### 4. RentabilidadAnalysis (Actualizado)
Análisis de rentabilidad con sección de documentos respaldo.

**Nuevas características:**
- Columna "Documentos" en tabla comparativa
- Sección "Documentos Respaldo" con tarjetas por categoría
- Modal para ver documentos de una categoría
- Contador de documentos por categoría

## Flujo de Trabajo

### Crear Gasto con Documentos

1. Usuario hace clic en "Nuevo Gasto"
2. Se abre GastoFormModal
3. Usuario llena el formulario:
   - Categoría (Materiales, Mano de obra, etc.)
   - Concepto
   - Monto y fecha
   - Proveedor y folio
4. Usuario adjunta documentos:
   - Hace clic en área de carga
   - Selecciona uno o más archivos
   - Ve preview de archivos seleccionados
5. Usuario hace clic en "Crear Gasto"
6. Sistema:
   - Crea el gasto
   - Sube los documentos
   - Vincula documentos al gasto
7. Lista se actualiza mostrando el nuevo gasto con sus documentos

### Ver Documentos de un Gasto

1. En GastoCard, usuario ve sección "Documentos adjuntos"
2. Lista muestra cada documento con:
   - Nombre del archivo
   - Tamaño
   - Botones de acción (preview, descargar)
3. Usuario hace clic en botón "Vista previa" (ojo)
4. Se abre modal con:
   - Preview del documento (si es imagen o PDF)
   - Información del documento
   - Botón de descarga
5. Usuario puede cerrar el modal o descargar

### Ver Documentos en Análisis de Rentabilidad

1. Usuario abre análisis de rentabilidad de un proyecto
2. En tabla comparativa, ve columna "Documentos"
3. Cada categoría muestra:
   - Número de documentos adjuntos
   - Botón para ver documentos
4. Usuario hace clic en botón de documentos
5. Se abre modal mostrando todos los documentos de esa categoría
6. Usuario puede:
   - Ver detalles de cada documento
   - Descargar documentos
   - Cerrar modal

## Estructura de Datos

### Gasto
```typescript
interface Gasto {
  id: string;
  proyecto_id: string;
  documento_id?: string; // Legacy, no usado
  categoria: string;
  concepto: string;
  monto: number;
  fecha: string;
  proveedor?: string;
  folio?: string;
  metodo_pago?: string;
  referencia?: string;
  aprobado?: boolean;
  aprobado_por?: string;
  fecha_aprobacion?: string;
  creado_por?: string;
  created_at: string;
  updated_at: string;
}
```

### Documento (con vinculación a Gasto)
```typescript
interface Documento {
  id: string;
  proyecto_id: string;
  nombre: string;
  tipo: string;
  archivo_url: string;
  archivo_size: number;
  mime_type: string;
  
  // Vinculación a gasto
  metadatos_ia?: {
    gasto_id?: string; // ID del gasto vinculado
    // ... otros metadatos
  };
  
  // ... otros campos
}
```

## Métodos del Servicio

### documentoService

```typescript
// Vincular un documento a un gasto
await documentoService.vincularDocumentoAGasto(documentoId, gastoId);

// Vincular múltiples documentos a un gasto
await documentoService.vincularDocumentosAGasto([doc1Id, doc2Id], gastoId);

// Obtener documentos de un gasto
const documentos = await documentoService.getDocumentosPorGasto(gastoId);

// Desvincular documento de gasto
await documentoService.desvincularDeGasto(documentoId);

// Obtener documentos agrupados por categoría
const agrupados = await documentoService.getDocumentosAgrupadosPorCategoria(
  proyectoId,
  gastos.map(g => ({ id: g.id, categoria: g.categoria }))
);
```

## Categorías de Gastos

Las categorías disponibles son:
- **Materiales**: Compra de materiales de construcción
- **Mano de obra**: Pago a trabajadores
- **Subcontratistas**: Servicios subcontratados
- **Maquinaria**: Alquiler o compra de maquinaria
- **Transporte**: Gastos de transporte
- **Permisos/Licencias**: Permisos y licencias oficiales
- **Otros**: Otros gastos no clasificados

## Tipos de Documentos Soportados

### Con Preview:
- **Imágenes**: .jpg, .jpeg, .png
- **PDFs**: .pdf

### Sin Preview (solo descarga):
- Otros tipos de archivo

## Validaciones

### Formulario de Gasto:
- Concepto: mínimo 3 caracteres
- Monto: mayor a 0
- Fecha: requerida
- Categoría: requerida

### Documentos:
- Tamaño máximo: 10MB por archivo
- Formatos aceptados: PDF, JPG, JPEG, PNG
- Sin límite de cantidad de archivos

## Estilos y UI

### Colores de Estado:
- **Aprobado**: Verde (bg-green-100, text-green-800)
- **Pendiente**: Amarillo (bg-yellow-100, text-yellow-800)
- **Documentos**: Azul (bg-blue-50, text-blue-600)

### Iconos:
- Gasto: DollarSign
- Documento: FileText, Paperclip
- Vista previa: Eye
- Descarga: Download
- Aprobado: CheckCircle
- Pendiente: AlertCircle

## Ejemplo Completo

```tsx
import React, { useState } from 'react';
import { GastosList } from './components/finanzas/GastosList';
import { RentabilidadAnalysis } from './components/finanzas/RentabilidadAnalysis';

function ProyectoFinanzasPage({ proyectoId, presupuestoId }) {
  const [vistaActual, setVistaActual] = useState<'gastos' | 'rentabilidad'>('gastos');

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setVistaActual('gastos')}
          className={`px-4 py-2 rounded-lg ${
            vistaActual === 'gastos'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Gastos
        </button>
        <button
          onClick={() => setVistaActual('rentabilidad')}
          className={`px-4 py-2 rounded-lg ${
            vistaActual === 'rentabilidad'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Análisis de Rentabilidad
        </button>
      </div>

      {/* Content */}
      {vistaActual === 'gastos' ? (
        <GastosList proyectoId={proyectoId} />
      ) : (
        <RentabilidadAnalysis
          proyectoId={proyectoId}
          presupuestoId={presupuestoId}
        />
      )}
    </div>
  );
}
```

## Notas Técnicas

1. **LocalStorage**: Los documentos se almacenan en localStorage con clave 'documentos'
2. **Vinculación**: Se usa metadatos_ia.gasto_id para vincular documentos a gastos
3. **Agrupación**: Los documentos se agrupan por la categoría del gasto al que están vinculados
4. **Preview**: Solo funciona para imágenes y PDFs, otros tipos solo permiten descarga
5. **Persistencia**: Todos los cambios se persisten automáticamente en localStorage

## Troubleshooting

### Los documentos no aparecen en el gasto
- Verificar que el gasto tenga documentos vinculados
- Revisar que metadatos_ia.gasto_id esté correctamente asignado
- Comprobar que el proyecto_id coincida

### El preview no funciona
- Verificar que el archivo sea imagen o PDF
- Comprobar que archivo_url sea válido
- Revisar que mime_type esté correctamente asignado

### Los documentos no se agrupan correctamente
- Verificar que los gastos tengan categoría asignada
- Comprobar que los documentos estén vinculados a gastos
- Revisar que el proyecto_id sea correcto

## Mejoras Futuras

1. **Drag & Drop**: Implementar drag & drop para adjuntar archivos
2. **Compresión**: Comprimir imágenes antes de subir
3. **OCR**: Extraer datos automáticamente de facturas
4. **Búsqueda**: Buscar dentro de documentos
5. **Etiquetas**: Agregar etiquetas a documentos
6. **Compartir**: Compartir documentos con otros usuarios
7. **Versiones**: Mantener versiones de documentos
8. **Firma**: Firmar documentos digitalmente

---

**Última actualización**: 2025-01-19
**Versión**: 1.0.0
