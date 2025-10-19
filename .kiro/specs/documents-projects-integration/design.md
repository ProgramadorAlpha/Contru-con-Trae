# Diseño - Integración Documentos ↔ Proyectos

## Visión General

Este documento describe el diseño técnico y de interfaz para la integración profunda entre los módulos de Documentos y Proyectos en ConstructPro, incluyendo arquitectura de datos, flujos de información, componentes de UI y servicios de backend.

## Arquitectura del Sistema

### Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Proyectos   │  │  Documentos  │  │  Finanzas    │          │
│  │  Module      │◄─┤  Module      │─►│  Module      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (REST)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ /proyectos   │  │ /documentos  │  │ /gastos      │          │
│  │ /proyectos/  │  │ /documentos/ │  │ /gastos/     │          │
│  │ :id/docs     │  │ escanear     │  │ vincular     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Proyecto    │  │  Documento   │  │  Claude      │          │
│  │  Service     │  │  Service     │  │  Service     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │  Storage     │  │  Claude API  │          │
│  │  Database    │  │  (S3/Local)  │  │  (External)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Modelo de Datos

### Esquema de Base de Datos

```sql
-- Tabla Proyectos (existente, con mejoras)
CREATE TABLE proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  codigo VARCHAR(50) UNIQUE,
  cliente VARCHAR(255),
  direccion TEXT,
  fecha_inicio DATE,
  fecha_fin_estimada DATE,
  presupuesto_total DECIMAL(15,2),
  estado VARCHAR(50) DEFAULT 'Activo',
  
  -- Límites de documentos
  limite_documentos INTEGER DEFAULT 10000,
  limite_espacio_gb INTEGER DEFAULT 100,
  
  -- Auditoría
  creado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla Documentos (mejorada)
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con proyecto (OBLIGATORIA)
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  
  -- Información básica
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL, -- 'Contrato', 'Plano', 'Factura', 'Permiso', 'Reporte', 'Certificado', 'Otro'
  
  -- Archivo
  archivo_url TEXT NOT NULL,
  archivo_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  
  -- Metadatos extraídos por IA
  procesado_ia BOOLEAN DEFAULT FALSE,
  metadatos_ia JSONB,
  confianza_ia INTEGER, -- 0-100
  
  -- Campos específicos para Facturas
  es_factura BOOLEAN DEFAULT FALSE,
  monto_factura DECIMAL(15,2),
  fecha_factura DATE,
  proveedor VARCHAR(255),
  folio VARCHAR(100),
  rfc VARCHAR(20),
  
  -- Control de versiones
  version INTEGER DEFAULT 1,
  documento_padre_id UUID REFERENCES documentos(id),
  
  -- Colaboración
  compartido_con UUID[], -- Array de user IDs
  anotaciones JSONB,
  
  -- Auditoría
  creado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT fk_documento_proyecto FOREIGN KEY (proyecto_id)
    REFERENCES proyectos(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_docs_proyecto ON documentos(proyecto_id);
CREATE INDEX idx_docs_tipo ON documentos(tipo);
CREATE INDEX idx_docs_tipo_proyecto ON documentos(proyecto_id, tipo);
CREATE INDEX idx_docs_factura ON documentos(es_factura) WHERE es_factura = TRUE;
CREATE INDEX idx_docs_fecha_factura ON documentos(fecha_factura) WHERE fecha_factura IS NOT NULL;
CREATE INDEX idx_docs_proveedor ON documentos(proveedor) WHERE proveedor IS NOT NULL;

-- Tabla Gastos (mejorada con relación a documentos)
CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  documento_id UUID REFERENCES documentos(id) ON DELETE SET NULL,
  
  -- Información del gasto
  categoria VARCHAR(100) NOT NULL,
  concepto TEXT NOT NULL,
  monto DECIMAL(15,2) NOT NULL,
  fecha DATE NOT NULL,
  proveedor VARCHAR(255),
  
  -- Pago
  metodo_pago VARCHAR(50),
  referencia VARCHAR(100),
  estado_pago VARCHAR(50) DEFAULT 'Pendiente',
  
  -- Notas
  notas TEXT,
  
  -- Auditoría
  creado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gastos_proyecto ON gastos(proyecto_id);
CREATE INDEX idx_gastos_documento ON gastos(documento_id);
CREATE INDEX idx_gastos_fecha ON gastos(fecha);

-- Vista para estadísticas de documentos por proyecto
CREATE VIEW v_proyecto_documentos_stats AS
SELECT 
  p.id as proyecto_id,
  p.nombre as proyecto_nombre,
  COUNT(d.id) as total_documentos,
  COUNT(DISTINCT d.tipo) as total_carpetas,
  SUM(d.archivo_size) as espacio_usado_bytes,
  ROUND(SUM(d.archivo_size)::numeric / 1073741824, 2) as espacio_usado_gb,
  COUNT(CASE WHEN array_length(d.compartido_con, 1) > 0 THEN 1 END) as documentos_compartidos,
  COUNT(CASE WHEN d.procesado_ia THEN 1 END) as documentos_procesados_ia,
  COUNT(CASE WHEN d.es_factura THEN 1 END) as total_facturas
FROM proyectos p
LEFT JOIN documentos d ON d.proyecto_id = p.id
GROUP BY p.id, p.nombre;
```

### Estructura de Metadatos IA (JSON)

```typescript
interface MetadatosIA {
  // Datos extraídos
  monto_total: number;
  subtotal?: number;
  iva?: number;
  fecha: string; // ISO 8601
  proveedor: string;
  rfc?: string;
  folio?: string;
  
  // Items del recibo
  items: Array<{
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    total: number;
  }>;
  
  // Clasificación
  categoria_sugerida: 'Materiales' | 'Mano de Obra' | 'Servicios' | 'Equipamiento' | 'Otros';
  
  // Información adicional
  forma_pago?: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Cheque';
  direccion_emisor?: string;
  telefono_emisor?: string;
  
  // Metadatos del procesamiento
  procesado_en: string; // ISO 8601 timestamp
  modelo_ia: string; // "claude-sonnet-4-20250514"
  tiempo_procesamiento_ms: number;
  
  // Notas adicionales
  notas?: string;
}
```

### Estructura de Sugerencia de Proyecto

```typescript
interface SugerenciaProyecto {
  proyecto_id: string;
  proyecto_nombre: string;
  confianza: number; // 0-100
  razon: string;
  factores: {
    contexto_usuario: number; // peso 0-100
    historial_proveedor: number;
    categoria_presupuesto: number;
    proyectos_activos: number;
  };
  alternativas: Array<{
    proyecto_id: string;
    proyecto_nombre: string;
    confianza: number;
  }>;
}
```

## Componentes de Frontend

### 1. ProyectoSelector

**Ubicación**: `src/components/documentos/ProyectoSelector.tsx`

**Props**:
```typescript
interface ProyectoSelectorProps {
  proyectoSeleccionado: string | null;
  onChange: (proyectoId: string | null) => void;
  mostrarTodos?: boolean; // Mostrar opción "Todos los Proyectos"
  filtrarPor?: 'activos' | 'todos' | 'completados';
  className?: string;
}
```

**Estado**:
```typescript
interface ProyectoSelectorState {
  proyectos: Proyecto[];
  loading: boolean;
  isOpen: boolean;
  searchTerm: string;
}
```

**Diseño**:
```tsx
<div className="relative">
  <button className="selector-button">
    <Building2 icon />
    <span>{proyectoActual?.nombre || 'Seleccionar Proyecto'}</span>
    <ChevronDown icon />
  </button>
  
  {isOpen && (
    <div className="dropdown">
      <input placeholder="Buscar proyecto..." />
      <div className="proyecto-list">
        {proyectos.map(proyecto => (
          <ProyectoItem
            proyecto={proyecto}
            selected={proyecto.id === proyectoSeleccionado}
            onClick={() => handleSelect(proyecto.id)}
          />
        ))}
      </div>
    </div>
  )}
</div>
```

### 2. DocumentosPage (Rediseñado)

**Ubicación**: `src/pages/DocumentosPage.tsx`

**Estado**:
```typescript
interface DocumentosPageState {
  proyectoId: string | null;
  proyectoActual: Proyecto | null;
  carpetas: CarpetaProyecto[];
  carpetaSeleccionada: string | null; // 'Contratos', 'Planos', 'Facturas', etc.
  documentos: Documento[];
  estadisticas: EstadisticasProyecto | null;
  loading: boolean;
  searchQuery: string;
  vistaActual: 'carpetas' | 'documentos'; // Vista de carpetas o lista de documentos
}

interface CarpetaProyecto {
  nombre: string;
  tipo: TipoDocumento;
  cantidad: number;
  icono: string;
  tieneIA: boolean; // Si tiene documentos procesados con IA
}

interface EstadisticasProyecto {
  totalDocumentos: number;
  totalCarpetas: number;
  espacioUsadoGB: number;
  documentosCompartidos: number;
}
```

**Layout**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ 📄 Archivo de Documentos                    [🤖 IA Assistant] [...] │
│ Gestiona y organiza todos tus documentos de proyecto                │
├─────────────────────────────────────────────────────────────────────┤
│ [🏗️ Todos los Proyectos ▼] [🔍 Buscar...] [📤 Subir ▼] [+ Carpeta] │
├─────────────────────────────────────────────────────────────────────┤
│ 🏗️ Proyecto seleccionado: Casa Los Pinos                           │
│ 👤 Cliente: Juan Pérez  |  📅 Inicio: 15/01/2024  |  ⚡ Activo     │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐│
│ │ 📄 Total     │ │ 📁 Carpetas  │ │ 💾 Espacio   │ │ 🔗 Compartid││
│ │ Documentos   │ │ Proyecto     │ │ Usado        │ │ Proyecto    ││
│ │     28       │ │      6       │ │   1.2 GB     │ │      8      ││
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│ 📁 Carpetas del Proyecto                                            │
│                                                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐│
│ │ 📁           │ │ 📁           │ │ 📁 🤖        │ │ 📁          ││
│ │ Contratos    │ │ Planos       │ │ Facturas     │ │ Permisos    ││
│ │ 3 archiv.    │ │ 12 archiv.   │ │ 8 archivos   │ │ 5 archivos  ││
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│ Acciones Rápidas IA:                                                │
│ [📷 Escanear Factura] [🎤 Registro por Voz] [🔍 Buscar Inteligente]│
└─────────────────────────────────────────────────────────────────────┘
```

**Vista de Documentos DENTRO del Proyecto**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ Proyecto: Casa Los Pinos > Documentos                               │
├─────────────────────────────────────────────────────────────────────┤
│ [Todas las Carpetas] [Contratos] [Planos] [Facturas] [Permisos] [+]│
├─────────────────────────────────────────────────────────────────────┤
│ 📁 Facturas (8 documentos)                    [📷 Escanear Recibo]  │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ 📄 Factura Cemento Cruz Azul          💰 $12,500  ✅ IA          ││
│ │ Proveedor: Cementos Cruz Azul | 05/01/2024                       ││
│ │ [Ver] [Descargar] [Vincular a Gasto]                             ││
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ 📄 Factura Materiales Eléctricos      💰 $8,300   ✅ IA          ││
│ │ Proveedor: Electricidad Total | 08/01/2024                       ││
│ │ [Ver] [Descargar] [Vincular a Gasto]                             ││
│ └──────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### 3. ScanReceiptModal (Mejorado)

**Ubicación**: `src/components/ai/ScanReceiptModal.tsx`

**Props**:
```typescript
interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReceiptData) => Promise<void>;
  proyectoIdDefault?: string | null; // Pre-seleccionar proyecto
}
```

**Estados del Modal**:
1. **camera**: Capturando foto
2. **preview**: Revisando foto capturada
3. **analyzing**: Procesando con IA
4. **project-suggestion**: Mostrando sugerencia de proyecto
5. **extracted**: Formulario con datos extraídos
6. **saved**: Confirmación de guardado

**Flujo Mejorado**:
```
1. Capturar foto
   ↓
2. Preview → [Usar esta] / [Tomar otra]
   ↓
3. Analyzing (spinner + "Analizando recibo...")
   ↓
4. Project Suggestion (si no hay proyecto pre-seleccionado)
   ┌─────────────────────────────────────┐
   │ 🏗️ Proyecto Sugerido:              │
   │ ✓ Casa Los Pinos (90%)             │
   │   Plaza Norte (15%)                │
   │   Edificio Torres (5%)             │
   │                                     │
   │ Razón: Usuario actual en este      │
   │ proyecto + historial de compras    │
   │                                     │
   │ [Cambiar] [Confirmar]              │
   └─────────────────────────────────────┘
   ↓
5. Extracted Data Form
   ↓
6. Saved Confirmation
```

### 4. ProyectoDocumentosWidget

**Ubicación**: `src/components/proyectos/ProyectoDocumentosWidget.tsx`

**Props**:
```typescript
interface ProyectoDocumentosWidgetProps {
  proyectoId: string;
  compacto?: boolean;
}
```

**Diseño** (basado en mockup):
```tsx
<div className="proyecto-card">
  <div className="card-header">
    <div className="proyecto-info">
      <h2>🏗️ Proyecto: Casa Los Pinos</h2>
      <p>Cliente: Juan Pérez | Estado: ⚡ Activo | Avance: 65%</p>
    </div>
    <button onClick={handleVerTodo}>Ver Todo</button>
  </div>
  
  <div className="proyecto-stats">
    <StatCard 
      icon="💰" 
      label="Budget" 
      value="$125K/$200K" 
    />
    <StatCard 
      icon="📄" 
      label="Docs" 
      value={28}
      onClick={handleVerDocumentos}
    />
    <StatCard 
      icon="👥" 
      label="Equipo" 
      value={12} 
    />
    <StatCard 
      icon="📊" 
      label="Reportes" 
      value={15} 
    />
  </div>
  
  <div className="proyecto-actions">
    <button onClick={handleVerDocumentos}>
      📄 Ver Documentos
    </button>
    <button onClick={handleFinanzas}>
      💰 Finanzas
    </button>
    <button onClick={handleCronograma}>
      📅 Cronograma
    </button>
    <button onClick={handleConfig}>
      ⚙️ Config
    </button>
  </div>
</div>
```

### 5. CarpetasProyectoGrid

**Ubicación**: `src/components/documentos/CarpetasProyectoGrid.tsx`

**Props**:
```typescript
interface CarpetasProyectoGridProps {
  proyectoId: string;
  onCarpetaClick: (carpeta: string) => void;
}
```

**Diseño**:
```tsx
<div className="carpetas-grid">
  <h3>📁 Carpetas del Proyecto</h3>
  <div className="grid grid-cols-4 gap-4">
    {carpetas.map(carpeta => (
      <div 
        key={carpeta.nombre}
        className="carpeta-card"
        onClick={() => onCarpetaClick(carpeta.nombre)}
      >
        <div className="carpeta-icon">
          {carpeta.icono}
          {carpeta.tieneIA && <span className="ia-badge">🤖</span>}
        </div>
        <h4>{carpeta.nombre}</h4>
        <p>{carpeta.cantidad} archivos</p>
      </div>
    ))}
  </div>
</div>
```

### 6. DocumentoCard

**Ubicación**: `src/components/documentos/DocumentoCard.tsx`

**Props**:
```typescript
interface DocumentoCardProps {
  documento: Documento;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  mostrarProyecto?: boolean; // Mostrar nombre del proyecto
}
```

**Diseño**:
```tsx
<div className="documento-card">
  <div className="card-header">
    <TipoIcon tipo={documento.tipo} />
    <span className="tipo-badge">{documento.tipo}</span>
    {documento.procesado_ia && (
      <span className="ia-badge">✨ IA</span>
    )}
  </div>
  
  <div className="card-body">
    <h4>{documento.nombre}</h4>
    {mostrarProyecto && (
      <p className="proyecto-nombre">{documento.proyecto_nombre}</p>
    )}
    {documento.es_factura && (
      <div className="factura-info">
        <span className="monto">${documento.monto_factura}</span>
        <span className="proveedor">{documento.proveedor}</span>
      </div>
    )}
    <p className="fecha">{formatDate(documento.created_at)}</p>
  </div>
  
  <div className="card-actions">
    <button onClick={() => onView(documento.id)}>Ver</button>
    <button onClick={() => onDownload(documento.id)}>Descargar</button>
    {documento.gasto_id && (
      <button onClick={() => navigateToGasto(documento.gasto_id)}>
        Ver Gasto
      </button>
    )}
  </div>
</div>
```

## Servicios de Backend

### 1. ProyectoService

**Ubicación**: `backend/services/proyecto.service.js`

**Métodos**:
```javascript
class ProyectoService {
  // Obtener proyectos del usuario
  async getProyectosUsuario(usuarioId, filtros = {})
  
  // Obtener documentos de un proyecto
  async getDocumentosProyecto(proyectoId, filtros = {})
  
  // Obtener estadísticas de documentos
  async getEstadisticasDocumentos(proyectoId)
  
  // Validar límites del proyecto
  async validarLimites(proyectoId, nuevoDocumentoSize)
  
  // Obtener proyectos activos para sugerencia
  async getProyectosActivosParaSugerencia(usuarioId)
}
```

### 2. DocumentoService

**Ubicación**: `backend/services/documento.service.js`

**Métodos**:
```javascript
class DocumentoService {
  // Subir documento con proyecto
  async subirDocumento(data, file, usuarioId)
  
  // Escanear recibo con IA
  async escanearRecibo(imageBuffer, mimeType, usuarioId, proyectoIdSugerido)
  
  // Sugerir proyecto para documento
  async sugerirProyecto(datosRecibo, usuarioId)
  
  // Buscar documentos
  async buscarDocumentos(proyectoId, query, filtros)
  
  // Obtener documento con relaciones
  async getDocumentoCompleto(documentoId)
  
  // Vincular documento con gasto
  async vincularConGasto(documentoId, gastoId)
  
  // Exportar documentos de proyecto
  async exportarDocumentosProyecto(proyectoId)
}
```

### 3. ClaudeService

**Ubicación**: `backend/services/claude.service.js`

**Métodos**:
```javascript
class ClaudeService {
  // Analizar recibo/factura
  async analizarRecibo(base64Image, mimeType)
  
  // Sugerir proyecto basado en contexto
  async sugerirProyectoParaRecibo(datosRecibo, proyectosContext)
  
  // Búsqueda semántica de documentos
  async busquedaSemantica(query, documentos)
  
  // Categorizar documento
  async categorizarDocumento(nombreArchivo, contenido)
  
  // Extraer metadatos de documento
  async extraerMetadatos(base64Content, mimeType, tipoDocumento)
}
```

## Flujos de Datos

### Flujo 1: Escaneo de Recibo con Sugerencia de Proyecto

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario abre ScanReceiptModal                            │
│    - Desde módulo Documentos (con proyecto seleccionado)    │
│    - Desde vista de Proyecto                                │
│    - Desde Dashboard (sin proyecto)                         │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Usuario captura foto del recibo                          │
│    - Webcam en desktop                                      │
│    - Cámara en móvil                                        │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Preview y confirmación                                   │
│    [Usar esta] / [Tomar otra]                               │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Enviar a backend: POST /api/documentos/escanear-recibo  │
│    Body: { imagen: File, proyectoId?: string }             │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend: ClaudeService.analizarRecibo()                 │
│    - Convertir imagen a base64                              │
│    - Llamar a Claude Vision API                             │
│    - Extraer: monto, fecha, proveedor, items, etc.         │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Backend: DocumentoService.sugerirProyecto()             │
│    (solo si no hay proyectoId en request)                   │
│    - Obtener proyectos activos del usuario                  │
│    - Obtener historial de compras similares                 │
│    - Llamar a Claude para sugerencia                        │
│    - Calcular confianza y alternativas                      │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Backend: Response                                        │
│    {                                                         │
│      datosExtraidos: { monto, fecha, proveedor, ... },     │
│      sugerenciaProyecto: {                                  │
│        proyectoId, confianza, razon, alternativas           │
│      }                                                       │
│    }                                                         │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Frontend: Mostrar sugerencia de proyecto                │
│    - Si confianza > 80%: Auto-seleccionar                   │
│    - Si confianza 50-80%: Sugerir con opción de cambio     │
│    - Si confianza < 50%: Solicitar selección manual        │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Usuario confirma proyecto y revisa datos                │
│    - Puede editar cualquier campo                           │
│    - Puede cambiar proyecto sugerido                        │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. Guardar: POST /api/documentos/guardar-recibo           │
│     Body: { proyectoId, datosExtraidos, imagen }           │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 11. Backend: Transacción completa                          │
│     BEGIN TRANSACTION;                                      │
│     - Subir imagen a storage                                │
│     - INSERT INTO documentos                                │
│     - INSERT INTO gastos                                    │
│     - UPDATE estadísticas proyecto                          │
│     COMMIT;                                                  │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 12. Frontend: Confirmación y actualización                 │
│     - Mostrar mensaje de éxito                              │
│     - Recargar lista de documentos                          │
│     - Actualizar estadísticas                               │
│     - Cerrar modal                                          │
└─────────────────────────────────────────────────────────────┘
```

### Flujo 2: Navegación Documento ↔ Gasto

```
Usuario ve Documento (Factura)
  ↓
[Ver Gasto Asociado] button
  ↓
GET /api/gastos/:gastoId
  ↓
Navegar a módulo Finanzas con gasto seleccionado
  ↓
Mostrar detalle del gasto
  ↓
[Ver Factura] button
  ↓
GET /api/documentos/:documentoId
  ↓
Abrir modal de visualización de documento
```

## Endpoints API

### Proyectos

```
GET    /api/proyectos
GET    /api/proyectos/:id
GET    /api/proyectos/:id/documentos
GET    /api/proyectos/:id/documentos/stats
GET    /api/proyectos/:id/documentos/carpetas
POST   /api/proyectos/:id/documentos/upload
POST   /api/proyectos/:id/documentos/escanear
GET    /api/proyectos/:id/documentos/export
```

**Nuevo Endpoint - Carpetas**:
```typescript
// GET /api/proyectos/:id/documentos/carpetas
// Response:
{
  carpetas: [
    {
      nombre: "Contratos",
      tipo: "Contrato",
      cantidad: 3,
      icono: "📄",
      tieneIA: false
    },
    {
      nombre: "Facturas",
      tipo: "Factura",
      cantidad: 8,
      icono: "🧾",
      tieneIA: true
    },
    // ... más carpetas
  ]
}
```

### Documentos

```
GET    /api/documentos
GET    /api/documentos/:id
POST   /api/documentos/upload
POST   /api/documentos/escanear-recibo
POST   /api/documentos/buscar
PATCH  /api/documentos/:id
DELETE /api/documentos/:id
POST   /api/documentos/:id/vincular-gasto
GET    /api/documentos/:id/download
```

### Sugerencias IA

```
POST   /api/ia/sugerir-proyecto
POST   /api/ia/analizar-recibo
POST   /api/ia/busqueda-semantica
POST   /api/ia/categorizar-documento
```

## Consideraciones de Diseño

### Performance

1. **Lazy Loading**: Cargar documentos en páginas de 50
2. **Caching**: Cachear lista de proyectos en sesión
3. **Optimistic Updates**: Actualizar UI antes de confirmar backend
4. **Image Compression**: Comprimir imágenes antes de subir (max 2MB)
5. **Debouncing**: Búsqueda con debounce de 300ms

### Seguridad

1. **Validación**: Validar proyecto_id existe y usuario tiene acceso
2. **Sanitización**: Limpiar nombres de archivo
3. **Rate Limiting**: Máximo 30 escaneos/hora por usuario
4. **File Validation**: Validar tipo MIME y extensión
5. **URL Signing**: URLs de descarga firmadas con expiración

### UX

1. **Loading States**: Mostrar skeletons mientras carga
2. **Error Handling**: Mensajes claros y accionables
3. **Confirmaciones**: Confirmar antes de eliminar
4. **Feedback**: Toasts para operaciones exitosas
5. **Accesibilidad**: Navegación por teclado, ARIA labels

### Responsive

1. **Mobile First**: Diseñar primero para móvil
2. **Touch Targets**: Botones mínimo 44x44px
3. **Gestures**: Swipe para acciones en móvil
4. **Adaptive Layout**: Grid → List en pantallas pequeñas

---

**Versión**: 1.0.0  
**Fecha**: 18 de Enero, 2024  
**Estado**: Aprobado para Implementación
