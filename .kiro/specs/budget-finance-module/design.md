# Design Document

## Overview

El módulo de Presupuestos + Finanzas transforma el flujo operativo completo desde la cotización hasta el cierre del proyecto. Se compone de tres submódulos principales que trabajan de forma integrada:

1. **Módulo de Presupuestos**: Creación asistida por IA, gestión de estados, envío y aprobación
2. **Módulo de Conversión**: Transformación automática de presupuesto aprobado en proyecto activo con estructura financiera
3. **Módulo de Finanzas**: Control de tesorería, alertas automáticas, facturación y análisis de rentabilidad

### Flujo de Datos Principal

```
Presupuesto (IA) → Aprobación Cliente → Conversión Automática → Proyecto + Finanzas
                                                                         ↓
                                                              Alertas + Bloqueos
                                                                         ↓
                                                              Análisis Rentabilidad
```

## Architecture

### Estructura de Colecciones Firestore

```
/clientes/{clienteId}
/presupuestos/{presupuestoId}
/presupuestos/{presupuestoId}/historial/{cambioId}
/proyectos/{proyectoId}  (existente - se extiende)
/facturas/{facturaId}
/alertas-financieras/{alertaId}
/gastos/{gastoId}  (existente - se extiende)
```

### Arquitectura de Componentes

```
src/
├── pages/
│   ├── PresupuestosPage.tsx          (Lista y dashboard)
│   ├── PresupuestoCreatorPage.tsx    (Creación con IA)
│   ├── PresupuestoViewPage.tsx       (Vista detalle)
│   ├── FinanzasPage.tsx              (Dashboard financiero)
│   └── ClientesPage.tsx              (Gestión clientes)
```
├── components/
│   ├── presupuestos/
│   │   ├── PresupuestosDashboard.tsx
│   │   ├── PresupuestosList.tsx
│   │   ├── PresupuestoCard.tsx
│   │   ├── PresupuestoFilters.tsx
│   │   ├── IAPresupuestoChat.tsx
│   │   ├── PresupuestoEditor.tsx
│   │   ├── FaseEditor.tsx
│   │   ├── PartidaEditor.tsx
│   │   ├── PlanPagosEditor.tsx
│   │   ├── PresupuestoPreview.tsx
│   │   ├── EnviarPresupuestoModal.tsx
│   │   ├── FirmaDigitalModal.tsx
│   │   └── ConversionConfirmModal.tsx
│   ├── clientes/
│   │   ├── ClientesList.tsx
│   │   ├── ClienteCard.tsx
│   │   ├── ClienteFormModal.tsx
│   │   ├── ClienteSelector.tsx
│   │   └── ClienteStats.tsx
│   ├── finanzas/
│   │   ├── FinanzasDashboard.tsx
│   │   ├── TesoreriaCard.tsx
│   │   ├── AlertasPanel.tsx
│   │   ├── AlertaCard.tsx
│   │   ├── FacturasList.tsx
│   │   ├── FacturaCard.tsx
│   │   ├── GenerarFacturaModal.tsx
│   │   ├── RegistrarCobroModal.tsx
│   │   ├── RentabilidadAnalysis.tsx
│   │   └── ComparativaPresupuestoReal.tsx
│   └── shared/
│       ├── MoneyDisplay.tsx
│       ├── PercentageIndicator.tsx
│       └── StatusBadge.tsx
├── services/
│   ├── presupuesto.service.ts
│   ├── cliente.service.ts
│   ├── factura.service.ts
│   ├── alerta.service.ts
│   ├── tesoreria.service.ts
│   ├── conversion.service.ts
│   └── rentabilidad.service.ts
├── api/
│   ├── presupuestos.api.ts
│   ├── clientes.api.ts
│   ├── facturas.api.ts
│   └── finanzas.api.ts
├── types/
│   ├── presupuesto.types.ts
│   ├── cliente.types.ts
│   ├── factura.types.ts
│   └── alerta.types.ts
└── utils/
    ├── presupuesto.utils.ts
    ├── finanzas.utils.ts
    └── pdf-generator.utils.ts

## Components and Interfaces

### 1. Módulo de Presupuestos

#### PresupuestosPage (Dashboard Principal)

Página principal que muestra métricas globales y lista de presupuestos.

**Props**: Ninguno (página raíz)

**State**:
- `presupuestos: Presupuesto[]` - Lista de presupuestos
- `filtros: PresupuestoFiltros` - Filtros activos
- `metricas: PresupuestosMetricas` - KPIs calculados

**Funcionalidad**:
- Carga presupuestos desde Firestore con paginación
- Calcula métricas en tiempo real
- Permite filtrar por estado, cliente, fecha, monto
- Navega a creación o detalle de presupuesto

#### IAPresupuestoChat

Componente de chat interactivo con Claude para crear presupuestos.

**Props**:
```typescript
interface IAPresupuestoChatProps {
  presupuestoId?: string;  // Para editar existente
  clienteId?: string;      // Cliente preseleccionado
  onPresupuestoGenerated: (presupuesto: PresupuestoGenerado) => void;
}
```

**State**:
- `mensajes: Mensaje[]` - Historial de conversación
- `cargando: boolean` - Estado de generación
- `presupuestoActual: PresupuestoGenerado` - Presupuesto en construcción

**Funcionalidad**:
- Envía mensajes a Claude API
- Parsea respuestas y extrae partidas/costos
- Actualiza presupuesto en tiempo real
- Permite adjuntar archivos (planos, specs)
- Guarda conversación para retomar después

#### PresupuestoEditor

Editor visual del presupuesto con capacidad de edición manual.

**Props**:
```typescript
interface PresupuestoEditorProps {
  presupuesto: Presupuesto;
  onUpdate: (presupuesto: Presupuesto) => void;
  readonly?: boolean;
}
```

**Funcionalidad**:
- Edita información del cliente
- Gestiona fases (agregar, eliminar, reordenar)
- Edita partidas dentro de cada fase
- Calcula automáticamente subtotales y totales
- Edita plan de pagos
- Agrega notas y condiciones

#### EnviarPresupuestoModal

Modal para enviar presupuesto al cliente.

**Props**:
```typescript
interface EnviarPresupuestoModalProps {
  presupuesto: Presupuesto;
  onEnviado: () => void;
  onCancel: () => void;
}
```

**Funcionalidad**:
- Genera PDF del presupuesto
- Crea link único de visualización
- Envía email al cliente
- Actualiza estado a "enviado"

### 2. Módulo de Clientes

#### ClientesList

Lista de clientes con búsqueda y estadísticas.

**Props**: Ninguno

**State**:
- `clientes: Cliente[]`
- `busqueda: string`
- `ordenamiento: 'nombre' | 'facturado' | 'proyectos'`

**Funcionalidad**:
- Carga clientes desde Firestore
- Búsqueda por nombre, empresa, email
- Muestra estadísticas de cada cliente
- Permite crear/editar clientes

#### ClienteSelector

Selector de cliente con autocompletado para usar en presupuestos.

**Props**:
```typescript
interface ClienteSelectorProps {
  value: string | null;  // clienteId
  onChange: (clienteId: string) => void;
  allowCreate?: boolean;
}
```

**Funcionalidad**:
- Búsqueda con autocompletado
- Muestra clientes recientes
- Permite crear cliente nuevo inline

### 3. Módulo de Finanzas

#### FinanzasDashboard

Dashboard principal de finanzas con KPIs y acceso a submódulos.

**Props**: Ninguno

**State**:
- `metricas: FinanzasMetricas`
- `alertas: AlertaFinanciera[]`
- `periodo: 'mes' | 'trimestre' | 'año'`

**Funcionalidad**:
- Calcula métricas consolidadas de todos los proyectos
- Muestra alertas activas por prioridad
- Proporciona acceso rápido a submódulos
- Compara con período anterior

#### AlertasPanel

Panel de alertas financieras con acciones rápidas.

**Props**:
```typescript
interface AlertasPanelProps {
  proyectoId?: string;  // Filtrar por proyecto
  prioridad?: AlertaPrioridad;
}
```

**State**:
- `alertas: AlertaFinanciera[]`
- `filtros: AlertaFiltros`

**Funcionalidad**:
- Muestra alertas agrupadas por prioridad
- Permite marcar como resuelta
- Ejecuta acciones rápidas (generar factura, enviar recordatorio)
- Navega al contexto de la alerta

#### TesoreriaCard

Tarjeta que muestra tesorería de un proyecto con indicadores visuales.

**Props**:
```typescript
interface TesoreriaCardProps {
  proyectoId: string;
  showDetails?: boolean;
}
```

**State**:
- `tesoreria: number`
- `cobros: Cobro[]`
- `gastos: Gasto[]`
- `proximaFase: Fase | null`

**Funcionalidad**:
- Calcula tesorería en tiempo real
- Muestra indicador de salud (verde/amarillo/rojo)
- Compara con costo de próxima fase
- Muestra desglose de cobros y gastos

#### RentabilidadAnalysis

Componente de análisis de rentabilidad al cierre del proyecto.

**Props**:
```typescript
interface RentabilidadAnalysisProps {
  proyectoId: string;
  presupuestoId: string;
}
```

**State**:
- `analisis: AnalisisRentabilidad`
- `comparativa: ComparativaPresupuestoReal`

**Funcionalidad**:
- Calcula ingresos totales (facturado + cambios)
- Suma costos directos por categoría
- Suma gastos operativos
- Calcula margen bruto y utilidad neta
- Compara cada categoría vs presupuesto
- Genera gráficos de variación
- Permite exportar a PDF

## Data Models

### Cliente

```typescript
interface Cliente {
  id: string;
  nombre: string;
  empresa?: string;
  email: string;
  telefono: string;
  cif?: string;
  direccion: {
    calle: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
    pais: string;
  };
  datosBancarios?: {
    banco: string;
    iban: string;
    swift?: string;
  };
  stats: {
    totalPresupuestos: number;
    presupuestosAprobados: number;
    totalFacturado: number;
    totalCobrado: number;
    proyectosActivos: number;
    proyectosCompletados: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Presupuesto

```typescript
interface Presupuesto {
  id: string;
  numero: string;  // PRE-2025-001
  nombre: string;
  version: number;
  
  // Cliente
  cliente: {
    id: string;
    nombre: string;
    empresa?: string;
    email: string;
    telefono: string;
    direccion: Direccion;
  };
  
  // Ubicación de la obra
  ubicacionObra: {
    direccion: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
    referenciaCatastral?: string;
  };
  
  // Montos
  montos: {
    subtotal: number;
    iva: number;
    total: number;
    moneda: 'EUR' | 'USD';
    porFase: Array<{
      fase: number;
      nombre: string;
      monto: number;
    }>;
  };
  
  // Fases detalladas
  fases: Fase[];
  
  // Plan de pagos
  planPagos: PlanPago[];
  
  // Estado y flujo
  estado: 'borrador' | 'enviado' | 'aprobado' | 'rechazado' | 'expirado' | 'convertido';
  estadoDetalle: {
    enviadoCliente: boolean;
    fechaEnvio?: Timestamp;
    fechaVisualizacion?: Timestamp;
    fechaAprobacion?: Timestamp;
    fechaRechazo?: Timestamp;
    motivoRechazo?: string;
    convertidoAProyecto: boolean;
    proyectoId?: string;
    fechaConversion?: Timestamp;
  };
  
  // Validez
  fechaCreacion: Timestamp;
  fechaValidez: Timestamp;
  diasValidez: number;
  
  // IA y metadata
  creadoConIA: boolean;
  metadatosIA?: {
    modelo: string;
    confianza: number;
    iteraciones: number;
    promptInicial: string;
    conversacionId: string;
  };
  
  // Documentos adjuntos
  documentos: Array<{
    tipo: 'plano' | 'especificacion' | 'foto' | 'otro';
    nombre: string;
    url: string;
    uploadedBy: string;
    fecha: Timestamp;
  }>;
  
  // Notas y condiciones
  notas?: string;
  condiciones: string[];
  
  // Firma digital
  firmas: Array<{
    tipo: 'empresa' | 'cliente';
    firmadoPor: string;
    fecha: Timestamp;
    ip: string;
    firma: string;  // base64
  }>;
  
  // Auditoría
  creadoPor: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Fase

```typescript
interface Fase {
  numero: number;
  nombre: string;
  descripcion?: string;
  monto: number;
  duracionEstimada?: number;  // días
  porcentajeCobro: number;  // % del total a cobrar
  partidas: Partida[];
}
```

### Partida

```typescript
interface Partida {
  id: string;
  codigo: string;  // 1.1, 1.2, etc.
  nombre: string;
  unidad: string;  // m³, m², unidad, etc.
  cantidad: number;
  precioUnitario: number;
  total: number;
  subpartidas?: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    precioUnitario: number;
    total: number;
  }>;
}
```

### PlanPago

```typescript
interface PlanPago {
  numero: number;
  descripcion: string;
  porcentaje: number;
  monto: number;
  fecha?: Timestamp;  // Se llena al aprobar
  vinculadoAFase?: number;
  estado: 'pendiente' | 'facturado' | 'cobrado';
}
```

### Factura

```typescript
interface Factura {
  id: string;
  numero: string;  // FAC-2025-001
  
  // Vinculación
  proyectoId: string;
  presupuestoId: string;
  planPagoNumero: number;
  faseVinculada?: number;
  
  // Cliente
  cliente: {
    id: string;
    nombre: string;
    empresa?: string;
    email: string;
    cif?: string;
    direccion: Direccion;
  };
  
  // Montos
  subtotal: number;
  iva: number;
  total: number;
  moneda: 'EUR' | 'USD';
  
  // Fechas
  fechaEmision: Timestamp;
  fechaVencimiento: Timestamp;
  fechaEnvio?: Timestamp;
  fechaCobro?: Timestamp;
  
  // Estado
  estado: 'borrador' | 'enviada' | 'cobrada' | 'vencida' | 'cancelada';
  
  // Cobro
  metodoPago?: 'transferencia' | 'efectivo' | 'cheque' | 'tarjeta';
  referenciaPago?: string;
  
  // Documentos
  pdfUrl?: string;
  
  // Auditoría
  creadoPor: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### AlertaFinanciera

```typescript
interface AlertaFinanciera {
  id: string;
  tipo: 'cobro_pendiente' | 'bajo_capital' | 'sobrecosto' | 'pago_vencido';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  
  // Contexto
  proyectoId: string;
  proyectoNombre: string;
  faseNumero?: number;
  facturaId?: string;
  
  // Mensaje
  titulo: string;
  mensaje: string;
  accionRecomendada: string;
  
  // Datos específicos
  datos: {
    tesoreriaActual?: number;
    tesoreriaNecesaria?: number;
    montoFactura?: number;
    presupuestoOriginal?: number;
    gastoReal?: number;
    variacionPorcentaje?: number;
    proveedorNombre?: string;
    montoPago?: number;
    fechaVencimiento?: Timestamp;
  };
  
  // Estado
  estado: 'activa' | 'resuelta' | 'ignorada';
  fechaResolucion?: Timestamp;
  notaResolucion?: string;
  
  // Auditoría
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### AnalisisRentabilidad

```typescript
interface AnalisisRentabilidad {
  proyectoId: string;
  presupuestoId: string;
  
  // Ingresos
  ingresos: {
    presupuestoOriginal: number;
    cambiosAprobados: number;
    totalFacturado: number;
    totalCobrado: number;
  };
  
  // Costos directos
  costosDirectos: {
    subcontratistas: number;
    materiales: number;
    maquinaria: number;
    otros: number;
    total: number;
  };
  
  // Gastos operativos
  gastosOperativos: {
    personalPropio: number;
    transporte: number;
    permisosLicencias: number;
    otros: number;
    total: number;
  };
  
  // Resultados
  margenBruto: number;
  margenBrutoPorcentaje: number;
  utilidadNeta: number;
  utilidadNetaPorcentaje: number;
  roi: number;
  
  // Comparativa
  comparativa: Array<{
    concepto: string;
    presupuestado: number;
    real: number;
    variacion: number;
    variacionPorcentaje: number;
  }>;
  
  // Tiempo
  tiempoEjecucion: {
    planificado: number;  // días
    real: number;
    variacion: number;
  };
  
  // Notas
  notas: string[];
  
  createdAt: Timestamp;
}
```

## Error Handling

### Validaciones de Presupuesto

1. **Validación de Cliente**: Verificar que email sea válido y teléfono tenga formato correcto
2. **Validación de Montos**: Asegurar que subtotal + IVA = total, y que suma de fases = subtotal
3. **Validación de Plan de Pagos**: Verificar que suma de porcentajes = 100%
4. **Validación de Fechas**: Fecha de validez debe ser mayor a fecha de creación

### Manejo de Errores en Conversión

```typescript
async function convertirPresupuestoAProyecto(presupuestoId: string): Promise<string> {
  try {
    // 1. Verificar que presupuesto existe y está aprobado
    const presupuesto = await getPresupuesto(presupuestoId);
    if (!presupuesto) {
      throw new Error('Presupuesto no encontrado');
    }
    if (presupuesto.estado !== 'aprobado') {
      throw new Error('Solo se pueden convertir presupuestos aprobados');
    }
    
    // 2. Verificar que no fue convertido previamente
    if (presupuesto.estadoDetalle.convertidoAProyecto) {
      throw new Error('Este presupuesto ya fue convertido a proyecto');
    }
    
    // 3. Crear proyecto en transacción
    const proyectoId = await db.runTransaction(async (transaction) => {
      // Crear proyecto
      const proyecto = crearProyectoDesdePresupuesto(presupuesto);
      transaction.set(db.collection('proyectos').doc(), proyecto);
      
      // Actualizar presupuesto
      transaction.update(db.collection('presupuestos').doc(presupuestoId), {
        estado: 'convertido',
        'estadoDetalle.convertidoAProyecto': true,
        'estadoDetalle.proyectoId': proyecto.id,
        'estadoDetalle.fechaConversion': Timestamp.now()
      });
      
      // Crear factura de adelanto
      const facturaAdelanto = crearFacturaAdelanto(presupuesto, proyecto.id);
      transaction.set(db.collection('facturas').doc(), facturaAdelanto);
      
      return proyecto.id;
    });
    
    return proyectoId;
    
  } catch (error) {
    console.error('Error en conversión:', error);
    throw new Error(`No se pudo convertir el presupuesto: ${error.message}`);
  }
}
```

### Manejo de Errores en Alertas

Las alertas financieras deben ser tolerantes a fallos:

```typescript
async function verificarYCrearAlertas(proyectoId: string): Promise<void> {
  try {
    // Verificar tesorería
    await verificarTesoreria(proyectoId);
  } catch (error) {
    console.error('Error verificando tesorería:', error);
    // No bloquear otras verificaciones
  }
  
  try {
    // Verificar cobros pendientes
    await verificarCobrosPendientes(proyectoId);
  } catch (error) {
    console.error('Error verificando cobros:', error);
  }
  
  try {
    // Verificar sobrecostos
    await detectarSobrecostos(proyectoId);
  } catch (error) {
    console.error('Error detectando sobrecostos:', error);
  }
}
```

### Validación de Bloqueo de Fases

```typescript
async function validarInicioFase(proyectoId: string, faseNumero: number): Promise<boolean> {
  // Fase 1 siempre puede iniciarse (requiere adelanto)
  if (faseNumero === 1) {
    const adelantoCobrado = await verificarAdelantoCobrado(proyectoId);
    if (!adelantoCobrado) {
      throw new Error('Debe cobrar el adelanto antes de iniciar la Fase 1');
    }
    return true;
  }
  
  // Fases posteriores requieren cobro de fase anterior
  const faseAnterior = faseNumero - 1;
  const factura = await getFacturaByFase(proyectoId, faseAnterior);
  
  if (!factura) {
    throw new Error(`No existe factura para la Fase ${faseAnterior}`);
  }
  
  if (factura.estado !== 'cobrada') {
    throw new Error(`Debe cobrar la Fase ${faseAnterior} antes de iniciar la Fase ${faseNumero}`);
  }
  
  return true;
}
```

## Testing Strategy

### Unit Tests

1. **Servicios de Cálculo**:
   - `tesoreria.service.test.ts`: Cálculo de tesorería (cobros - gastos)
   - `rentabilidad.service.test.ts`: Cálculo de margen bruto, utilidad neta, ROI
   - `presupuesto.utils.test.ts`: Validación de montos, suma de fases, plan de pagos

2. **Lógica de Negocio**:
   - `conversion.service.test.ts`: Conversión de presupuesto a proyecto
   - `alerta.service.test.ts`: Creación de alertas según reglas
   - `bloqueo-fases.test.ts`: Lógica de bloqueo/desbloqueo de fases

### Integration Tests

1. **Flujo Completo de Presupuesto**:
   - Crear presupuesto → Enviar → Aprobar → Convertir
   - Verificar que se crean proyecto, factura y alertas

2. **Flujo de Facturación**:
   - Generar factura → Enviar → Registrar cobro
   - Verificar actualización de tesorería y desbloqueo de fase

3. **Sistema de Alertas**:
   - Simular tesorería baja → Verificar creación de alerta
   - Simular sobrecosto → Verificar alerta con datos correctos

### E2E Tests (Opcionales)

1. **Creación de Presupuesto con IA**:
   - Abrir chat → Enviar mensaje → Verificar generación de partidas
   - Editar partida → Verificar actualización de totales

2. **Conversión y Bloqueo**:
   - Aprobar presupuesto → Convertir a proyecto
   - Intentar iniciar Fase 2 sin cobro → Verificar bloqueo
   - Registrar cobro → Verificar desbloqueo

## Implementation Notes

### Integración con Claude API

El chat de IA para presupuestos utilizará el servicio existente `claudeService.ts`:

```typescript
// src/services/ai/presupuestoIAService.ts
import { claudeService } from './claudeService';

export async function generarPresupuestoConIA(
  prompt: string,
  historial: Mensaje[],
  archivosAdjuntos?: File[]
): Promise<PresupuestoGenerado> {
  
  const systemPrompt = `
    Eres un asistente experto en construcción que ayuda a crear presupuestos detallados.
    
    Debes generar presupuestos con:
    - Fases numeradas (Fase 1, Fase 2, etc.)
    - Partidas detalladas con código, descripción, unidad, cantidad, precio unitario
    - Subpartidas cuando sea necesario
    - Totales calculados correctamente
    
    Formato de respuesta JSON:
    {
      "fases": [
        {
          "numero": 1,
          "nombre": "Cimentación y Estructura",
          "partidas": [
            {
              "codigo": "1.1",
              "nombre": "Excavación",
              "unidad": "m³",
              "cantidad": 150,
              "precioUnitario": 23.33,
              "total": 3500
            }
          ]
        }
      ]
    }
  `;
  
  const respuesta = await claudeService.sendMessage(
    prompt,
    historial,
    systemPrompt
  );
  
  // Parsear respuesta y extraer presupuesto
  const presupuesto = parsearRespuestaIA(respuesta);
  
  return presupuesto;
}
```

### Generación de PDF

Utilizar biblioteca `jsPDF` o `react-pdf` para generar PDFs profesionales:

```typescript
// src/utils/pdf-generator.utils.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generarPDFPresupuesto(presupuesto: Presupuesto): Blob {
  const doc = new jsPDF();
  
  // Header con logo
  doc.setFontSize(20);
  doc.text('PRESUPUESTO', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(presupuesto.numero, 105, 28, { align: 'center' });
  
  // Datos del cliente
  doc.setFontSize(10);
  doc.text('CLIENTE:', 20, 40);
  doc.text(presupuesto.cliente.nombre, 20, 46);
  doc.text(presupuesto.cliente.email, 20, 52);
  
  // Fases y partidas
  let y = 70;
  presupuesto.fases.forEach(fase => {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`FASE ${fase.numero}: ${fase.nombre}`, 20, y);
    y += 8;
    
    // Tabla de partidas
    const partidas = fase.partidas.map(p => [
      p.codigo,
      p.nombre,
      p.cantidad,
      p.unidad,
      `€${p.precioUnitario.toFixed(2)}`,
      `€${p.total.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: y,
      head: [['Código', 'Descripción', 'Cant.', 'Unidad', 'P. Unit.', 'Total']],
      body: partidas,
      theme: 'grid'
    });
    
    y = (doc as any).lastAutoTable.finalY + 10;
  });
  
  // Totales
  doc.setFontSize(12);
  doc.text(`SUBTOTAL: €${presupuesto.montos.subtotal.toFixed(2)}`, 140, y);
  doc.text(`IVA (21%): €${presupuesto.montos.iva.toFixed(2)}`, 140, y + 6);
  doc.setFont(undefined, 'bold');
  doc.text(`TOTAL: €${presupuesto.montos.total.toFixed(2)}`, 140, y + 12);
  
  return doc.output('blob');
}
```

### Sistema de Notificaciones

Integrar con el sistema de notificaciones existente para alertas:

```typescript
// src/services/notificacion.service.ts
export async function notificarAlertaFinanciera(alerta: AlertaFinanciera): Promise<void> {
  // Notificación in-app
  await crearNotificacion({
    tipo: 'alerta_financiera',
    titulo: alerta.titulo,
    mensaje: alerta.mensaje,
    prioridad: alerta.prioridad,
    link: `/proyectos/${alerta.proyectoId}/finanzas`
  });
  
  // Email si es crítica
  if (alerta.prioridad === 'critica') {
    await enviarEmailAlerta(alerta);
  }
}
```

### Optimización de Consultas Firestore

Para el dashboard de finanzas que agrega datos de múltiples proyectos:

```typescript
// Usar índices compuestos
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "proyectos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "estado", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "facturas",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "estado", "order": "ASCENDING" },
        { "fieldPath": "fechaVencimiento", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "alertas-financieras",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "estado", "order": "ASCENDING" },
        { "fieldPath": "prioridad", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Caché de Métricas

Para mejorar performance del dashboard:

```typescript
// Calcular métricas en Cloud Functions y cachear
export async function calcularMetricasFinanzas(): Promise<FinanzasMetricas> {
  // Intentar obtener de caché
  const cached = await getCachedMetricas();
  if (cached && !isExpired(cached)) {
    return cached.data;
  }
  
  // Calcular desde Firestore
  const proyectos = await getProyectosActivos();
  const facturas = await getFacturas();
  const gastos = await getGastos();
  
  const metricas = {
    ingresosTotales: sumarFacturasCobradas(facturas),
    gastosTotales: sumarGastosPagados(gastos),
    utilidadNeta: calcularUtilidad(facturas, gastos),
    // ... más métricas
  };
  
  // Guardar en caché por 5 minutos
  await setCachedMetricas(metricas, 5 * 60);
  
  return metricas;
}
```

## Security Considerations

1. **Acceso a Presupuestos**: Solo usuarios autenticados pueden ver presupuestos de su empresa
2. **Link Público de Presupuesto**: Generar token único no adivinable (UUID v4)
3. **Firma Digital**: Validar que el usuario tiene permisos para firmar
4. **Modificación de Facturas**: Solo permitir editar facturas en estado "borrador"
5. **Bloqueo de Fases**: No permitir override sin permisos de administrador
6. **Datos Sensibles**: No exponer datos bancarios completos en APIs públicas

## Performance Considerations

1. **Paginación**: Implementar paginación en listas de presupuestos, facturas y alertas
2. **Lazy Loading**: Cargar detalles de presupuesto solo cuando se abre
3. **Debounce**: En búsquedas y filtros aplicar debounce de 300ms
4. **Optimistic Updates**: Actualizar UI inmediatamente y sincronizar en background
5. **Índices Firestore**: Crear índices compuestos para queries complejas
6. **Caché**: Cachear métricas del dashboard por 5 minutos
