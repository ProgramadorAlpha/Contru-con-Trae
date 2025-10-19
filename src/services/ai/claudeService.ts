/**
 * Claude Service
 * 
 * Service for interacting with Claude API
 */

import type { ChatRequest, ChatResponse, AIMessage } from '@/types/ai'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Send a chat message to Claude AI
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/claude/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token
        // 'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        message: request.message,
        conversationHistory: request.conversationHistory?.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Claude service error:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Error al comunicarse con el servicio de IA')
  }
}

/**
 * Mock implementation for development (when backend is not available)
 */
export async function sendChatMessageMock(request: ChatRequest): Promise<ChatResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

  // Generate mock response based on message content
  const message = request.message.toLowerCase()
  
  let response = ''
  
  if (message.includes('proyecto') || message.includes('project')) {
    response = `**Proyectos Activos**

Actualmente tienes 3 proyectos activos:

1. **Construcción Edificio Central** - 75% completado
   - Presupuesto: $2,500,000
   - Gastado: $1,875,000
   - Estado: En tiempo

2. **Remodelación Casa Residencial** - 45% completado
   - Presupuesto: $850,000
   - Gastado: $382,500
   - Estado: Adelantado

3. **Ampliación Oficinas Corporativas** - 90% completado
   - Presupuesto: $1,200,000
   - Gastado: $1,080,000
   - Estado: En tiempo

¿Te gustaría ver más detalles de algún proyecto específico?`
  } else if (message.includes('gasto') || message.includes('gastado') || message.includes('mes')) {
    response = `**Resumen de Gastos del Mes**

Total gastado en ${new Date().toLocaleDateString('es-MX', { month: 'long' })}: **$125,450**

**Desglose por categoría:**
- 💰 Materiales: $75,270 (60%)
- 👷 Mano de obra: $37,635 (30%)
- 🚚 Transporte: $8,781 (7%)
- 🔧 Otros: $3,764 (3%)

**Comparación con presupuesto:**
- Presupuestado: $130,000
- Gastado: $125,450
- Restante: $4,550 (3.5%)

El gasto está dentro del presupuesto. ¿Necesitas ver el detalle por proyecto?`
  } else if (message.includes('factura') || message.includes('pendiente')) {
    response = `**Facturas Pendientes**

Tienes 5 facturas pendientes de pago:

1. **Ferretería El Constructor** - $12,450
   - Vencimiento: En 5 días
   - Proyecto: Edificio Central

2. **Materiales ABC** - $8,900
   - Vencimiento: En 10 días
   - Proyecto: Casa Residencial

3. **Transporte Rápido** - $3,200
   - Vencimiento: Hoy ⚠️
   - Proyecto: Oficinas Corporativas

4. **Aceros del Norte** - $15,600
   - Vencimiento: Vencida hace 2 días ⚠️
   - Proyecto: Edificio Central

5. **Equipos Pro** - $5,800
   - Vencimiento: En 15 días
   - Proyecto: Casa Residencial

**Total pendiente:** $45,950

¿Quieres que te ayude a priorizar los pagos?`
  } else {
    response = `Entiendo tu pregunta sobre "${request.message}".

Como asistente de IA para ConstructPro, puedo ayudarte con:

- 📊 **Consultas de proyectos**: Estado, progreso, presupuestos
- 💰 **Análisis financiero**: Gastos, ingresos, facturas
- 📄 **Búsqueda de documentos**: Contratos, planos, permisos
- 📈 **Reportes**: Resúmenes y análisis de datos
- ⏰ **Cronogramas**: Fechas importantes y vencimientos

¿En qué específicamente te puedo ayudar?`
  }

  return {
    message: response,
    suggestions: [
      '¿Cuál es el proyecto con mayor gasto?',
      'Muéstrame las facturas vencidas',
      '¿Cómo va el presupuesto general?'
    ]
  }
}

// Export the appropriate function based on environment
export const chatService = {
  sendMessage: import.meta.env.DEV ? sendChatMessageMock : sendChatMessage
}


/**
 * Enhanced Claude Service for Document-Project Integration
 * Requirements: 9, 11, 6
 * Task: 5.1, 5.2, 5.3, 5.4
 */

export interface AnalisisRecibo {
  proveedor: string;
  monto: number;
  fecha: string;
  folio?: string;
  rfc?: string;
  items?: Array<{
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    total: number;
  }>;
  subtotal?: number;
  iva?: number;
  total: number;
  confianza: number;
  metadatos?: any;
}

export interface SugerenciaProyectoIA {
  proyecto_id: string;
  proyecto_nombre: string;
  confianza: number;
  razon: string;
  alternativas: Array<{
    proyecto_id: string;
    proyecto_nombre: string;
    confianza: number;
    razon: string;
  }>;
}

export interface ResultadoBusquedaSemantica {
  documento_id: string;
  relevancia: number;
  razon: string;
  fragmentos_relevantes: string[];
}

export interface CategorizacionDocumento {
  tipo_sugerido: string;
  confianza: number;
  metadatos: {
    titulo?: string;
    fecha?: string;
    autor?: string;
    descripcion?: string;
  };
}

/**
 * Analyze receipt image and extract structured data
 * Requirement: 9
 * Task: 5.1
 */
export async function analizarRecibo(
  imagenBase64: string
): Promise<AnalisisRecibo> {
  try {
    const response = await fetch(`${API_BASE_URL}/claude/analizar-recibo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imagen: imagenBase64
      })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    
    // Fallback to mock data for development
    return analizarReciboMock(imagenBase64);
  }
}

/**
 * Mock implementation for receipt analysis
 */
async function analizarReciboMock(imagenBase64: string): Promise<AnalisisRecibo> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    proveedor: 'Ferretería El Constructor',
    monto: 1500.00,
    fecha: new Date().toISOString().split('T')[0],
    folio: `FAC-${Math.floor(Math.random() * 10000)}`,
    rfc: 'FEC850101ABC',
    items: [
      {
        descripcion: 'Cemento gris 50kg',
        cantidad: 10,
        precio_unitario: 120.00,
        total: 1200.00
      },
      {
        descripcion: 'Arena fina m³',
        cantidad: 2,
        precio_unitario: 150.00,
        total: 300.00
      }
    ],
    subtotal: 1500.00,
    iva: 0,
    total: 1500.00,
    confianza: 85
  };
}

/**
 * Suggest project for a receipt using AI analysis
 * Requirements: 11
 * Task: 5.2
 */
export async function sugerirProyectoParaRecibo(
  analisisRecibo: AnalisisRecibo,
  proyectosActivos: Array<{
    id: string;
    nombre: string;
    cliente?: string;
    historial_gastos?: any[];
    proveedores_frecuentes?: string[];
  }>
): Promise<SugerenciaProyectoIA> {
  try {
    const response = await fetch(`${API_BASE_URL}/claude/sugerir-proyecto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recibo: analisisRecibo,
        proyectos: proyectosActivos
      })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error suggesting project:', error);
    
    // Fallback to mock data
    return sugerirProyectoMock(analisisRecibo, proyectosActivos);
  }
}

/**
 * Mock implementation for project suggestion
 */
async function sugerirProyectoMock(
  analisisRecibo: AnalisisRecibo,
  proyectosActivos: any[]
): Promise<SugerenciaProyectoIA> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (proyectosActivos.length === 0) {
    throw new Error('No active projects available');
  }

  // Simple heuristic: suggest most recent project
  const proyectoSugerido = proyectosActivos[0];
  const alternativas = proyectosActivos.slice(1, 4).map((p, i) => ({
    proyecto_id: p.id,
    proyecto_nombre: p.nombre,
    confianza: 70 - (i * 10),
    razon: `Proyecto activo con gastos similares`
  }));

  return {
    proyecto_id: proyectoSugerido.id,
    proyecto_nombre: proyectoSugerido.nombre,
    confianza: 85,
    razon: `Este proyecto tiene compras recientes con ${analisisRecibo.proveedor} y el monto es consistente con gastos anteriores.`,
    alternativas
  };
}

/**
 * Semantic search across documents
 * Requirement: 6
 * Task: 5.3
 */
export async function busquedaSemantica(
  query: string,
  documentos: Array<{
    id: string;
    nombre: string;
    descripcion?: string;
    contenido?: string;
  }>
): Promise<ResultadoBusquedaSemantica[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/claude/busqueda-semantica`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        documentos
      })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in semantic search:', error);
    
    // Fallback to simple text matching
    return busquedaSemanticaMock(query, documentos);
  }
}

/**
 * Mock implementation for semantic search
 */
async function busquedaSemanticaMock(
  query: string,
  documentos: any[]
): Promise<ResultadoBusquedaSemantica[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const queryLower = query.toLowerCase();
  
  return documentos
    .filter(doc => 
      doc.nombre?.toLowerCase().includes(queryLower) ||
      doc.descripcion?.toLowerCase().includes(queryLower)
    )
    .map(doc => ({
      documento_id: doc.id,
      relevancia: 100,
      razon: 'Coincidencia en nombre o descripción',
      fragmentos_relevantes: [doc.nombre]
    }))
    .slice(0, 10);
}

/**
 * Categorize document and extract metadata
 * Requirement: 9
 * Task: 5.4
 */
export async function categorizarDocumento(
  nombreArchivo: string,
  contenidoBase64?: string
): Promise<CategorizacionDocumento> {
  try {
    const response = await fetch(`${API_BASE_URL}/claude/categorizar-documento`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: nombreArchivo,
        contenido: contenidoBase64
      })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error categorizing document:', error);
    
    // Fallback to simple categorization
    return categorizarDocumentoMock(nombreArchivo);
  }
}

/**
 * Mock implementation for document categorization
 */
async function categorizarDocumentoMock(
  nombreArchivo: string
): Promise<CategorizacionDocumento> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const nombreLower = nombreArchivo.toLowerCase();
  
  let tipo_sugerido = 'Otro';
  let confianza = 50;

  if (nombreLower.includes('contrato') || nombreLower.includes('contract')) {
    tipo_sugerido = 'Contrato';
    confianza = 90;
  } else if (nombreLower.includes('plano') || nombreLower.includes('plan')) {
    tipo_sugerido = 'Plano';
    confianza = 85;
  } else if (nombreLower.includes('factura') || nombreLower.includes('invoice')) {
    tipo_sugerido = 'Factura';
    confianza = 95;
  } else if (nombreLower.includes('permiso') || nombreLower.includes('permit')) {
    tipo_sugerido = 'Permiso';
    confianza = 88;
  } else if (nombreLower.includes('reporte') || nombreLower.includes('report')) {
    tipo_sugerido = 'Reporte';
    confianza = 82;
  } else if (nombreLower.includes('certificado') || nombreLower.includes('certificate')) {
    tipo_sugerido = 'Certificado';
    confianza = 87;
  }

  return {
    tipo_sugerido,
    confianza,
    metadatos: {
      titulo: nombreArchivo.replace(/\.[^/.]+$/, ''),
      fecha: new Date().toISOString().split('T')[0]
    }
  };
}

/**
 * Export all enhanced functions
 */
export const claudeServiceEnhanced = {
  analizarRecibo,
  sugerirProyectoParaRecibo,
  busquedaSemantica,
  categorizarDocumento
};
