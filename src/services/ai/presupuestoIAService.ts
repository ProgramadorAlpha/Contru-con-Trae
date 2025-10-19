/**
 * Presupuesto IA Service
 * 
 * Service for generating presupuestos using Claude AI.
 * Specialized in construction budgets with phases and line items.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.8
 * Task: 4.1
 */

import { chatService } from './claudeService';
import type { AIMessage } from '@/types/ai';
import type { Fase, Partida, PresupuestoGenerado } from '@/types/presupuesto.types';

const SYSTEM_PROMPT = `Eres un experto en presupuestos de construcción en España. Tu trabajo es ayudar a crear presupuestos detallados y profesionales para proyectos de construcción.

**Contexto:**
- Trabajas para una empresa constructora española
- Los presupuestos deben seguir estándares profesionales de construcción
- Debes organizar el trabajo en FASES lógicas
- Cada fase contiene PARTIDAS detalladas con precios unitarios
- Los precios deben ser realistas para el mercado español (en EUR)

**Formato de respuesta:**
Cuando generes un presupuesto, SIEMPRE responde con un objeto JSON válido con esta estructura:

\`\`\`json
{
  "fases": [
    {
      "numero": 1,
      "nombre": "Nombre de la Fase",
      "descripcion": "Descripción breve de la fase",
      "monto": 0,
      "duracionEstimada": 30,
      "porcentajeCobro": 30,
      "partidas": [
        {
          "id": "P001",
          "codigo": "01.01",
          "nombre": "Descripción de la partida",
          "unidad": "m²",
          "cantidad": 100,
          "precioUnitario": 25.50,
          "total": 2550.00
        }
      ]
    }
  ],
  "montos": {
    "subtotal": 10000,
    "iva": 2100,
    "total": 12100
  }
}
\`\`\`

**Reglas importantes:**
1. El monto de cada fase es la suma de sus partidas
2. Usa códigos de partida estándar (ej: 01.01, 01.02, 02.01)
3. Las unidades comunes son: m², m³, ml, ud, kg, h
4. El IVA en construcción en España es 21%
5. Los porcentajes de cobro deben sumar 100%
6. Sé específico en las descripciones de partidas
7. Incluye todas las partidas necesarias (materiales, mano de obra, maquinaria)

**Fases típicas en construcción:**
1. Trabajos Preliminares (5-10%)
2. Cimentación y Estructura (25-30%)
3. Albañilería y Cerramientos (20-25%)
4. Instalaciones (15-20%)
5. Acabados (20-25%)
6. Limpieza y Entrega (3-5%)

Adapta las fases según el tipo de proyecto específico.`;

interface GenerarPresupuestoParams {
  descripcionProyecto: string;
  conversacionPrevia?: AIMessage[];
  adjuntos?: Array<{
    tipo: 'plano' | 'especificacion' | 'foto' | 'otro';
    nombre: string;
    contenido?: string;
  }>;
}

interface GenerarPresupuestoResult {
  presupuesto: PresupuestoGenerado;
  respuestaIA: string;
  conversacionId: string;
  confianza: number;
  iteraciones: number;
}

/**
 * Generate a presupuesto using Claude AI
 */
export async function generarPresupuestoConIA(
  params: GenerarPresupuestoParams
): Promise<GenerarPresupuestoResult> {
  try {
    const { descripcionProyecto, conversacionPrevia = [], adjuntos = [] } = params;

    // Build the conversation history
    const conversationHistory: AIMessage[] = [
      ...conversacionPrevia
    ];

    // Add attachments context if any
    let mensaje = descripcionProyecto;
    if (adjuntos.length > 0) {
      mensaje += '\n\n**Documentos adjuntos:**\n';
      adjuntos.forEach(adj => {
        mensaje += `- ${adj.nombre} (${adj.tipo})\n`;
      });
      mensaje += '\nPor favor, considera esta información al generar el presupuesto.';
    }

    // Request the AI to generate the budget
    const response = await chatService.sendMessage({
      message: mensaje,
      conversationHistory
    });

    // Parse the JSON response
    const presupuesto = parsearRespuestaIA(response.message);

    // Calculate confidence based on completeness
    const confianza = calcularConfianza(presupuesto);

    return {
      presupuesto,
      respuestaIA: response.message,
      conversacionId: generateConversationId(),
      confianza,
      iteraciones: conversacionPrevia.length + 1
    };
  } catch (error) {
    console.error('Error generating presupuesto with IA:', error);
    throw new Error('Error al generar el presupuesto con IA');
  }
}

/**
 * Parse AI response and extract presupuesto data
 */
export function parsearRespuestaIA(respuesta: string): PresupuestoGenerado {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = respuesta.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonStr = jsonMatch ? jsonMatch[1] : respuesta;

    // Try to find JSON object in the response
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Validate and normalize the structure
    if (!parsed.fases || !Array.isArray(parsed.fases)) {
      throw new Error('Formato inválido: falta el array de fases');
    }

    // Normalize fases
    const fases: Fase[] = parsed.fases.map((fase: any, index: number) => {
      const partidas: Partida[] = (fase.partidas || []).map((partida: any, pIndex: number) => ({
        id: partida.id || `P${String(index + 1).padStart(2, '0')}${String(pIndex + 1).padStart(2, '0')}`,
        codigo: partida.codigo || `${String(index + 1).padStart(2, '0')}.${String(pIndex + 1).padStart(2, '0')}`,
        nombre: partida.nombre || partida.descripcion || 'Sin descripción',
        unidad: partida.unidad || 'ud',
        cantidad: Number(partida.cantidad) || 0,
        precioUnitario: Number(partida.precioUnitario) || 0,
        total: Number(partida.total) || (Number(partida.cantidad) * Number(partida.precioUnitario)),
        subpartidas: partida.subpartidas || []
      }));

      // Calculate fase monto from partidas
      const montoFase = partidas.reduce((sum, p) => sum + p.total, 0);

      return {
        numero: fase.numero || index + 1,
        nombre: fase.nombre || `Fase ${index + 1}`,
        descripcion: fase.descripcion || '',
        monto: Number(fase.monto) || montoFase,
        duracionEstimada: Number(fase.duracionEstimada) || 30,
        porcentajeCobro: Number(fase.porcentajeCobro) || 0,
        partidas
      };
    });

    // Calculate totals
    const subtotal = fases.reduce((sum, fase) => sum + fase.monto, 0);
    const iva = subtotal * 0.21; // 21% IVA in Spain
    const total = subtotal + iva;

    return {
      fases,
      montos: parsed.montos || {
        subtotal,
        iva,
        total
      }
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('No se pudo interpretar la respuesta de la IA. Por favor, intenta reformular tu solicitud.');
  }
}

/**
 * Calculate confidence score based on presupuesto completeness
 */
function calcularConfianza(presupuesto: PresupuestoGenerado): number {
  let score = 0;
  const maxScore = 100;

  // Has fases (30 points)
  if (presupuesto.fases && presupuesto.fases.length > 0) {
    score += 30;
  }

  // All fases have partidas (30 points)
  const fasesConPartidas = presupuesto.fases.filter(f => f.partidas && f.partidas.length > 0).length;
  if (fasesConPartidas === presupuesto.fases.length) {
    score += 30;
  } else {
    score += (fasesConPartidas / presupuesto.fases.length) * 30;
  }

  // All partidas have valid prices (20 points)
  let totalPartidas = 0;
  let partidasConPrecio = 0;
  presupuesto.fases.forEach(fase => {
    fase.partidas.forEach(partida => {
      totalPartidas++;
      if (partida.precioUnitario > 0 && partida.cantidad > 0) {
        partidasConPrecio++;
      }
    });
  });
  if (totalPartidas > 0) {
    score += (partidasConPrecio / totalPartidas) * 20;
  }

  // Has montos calculated (20 points)
  if (presupuesto.montos && presupuesto.montos.total > 0) {
    score += 20;
  }

  return Math.round(score);
}

/**
 * Generate a unique conversation ID
 */
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Refine presupuesto with additional instructions
 */
export async function refinarPresupuesto(
  presupuestoActual: PresupuestoGenerado,
  instrucciones: string,
  conversacionId: string
): Promise<GenerarPresupuestoResult> {
  try {
    const mensaje = `Tengo el siguiente presupuesto:\n\n${JSON.stringify(presupuestoActual, null, 2)}\n\nPor favor, modifícalo según estas instrucciones: ${instrucciones}\n\nResponde con el presupuesto completo actualizado en formato JSON.`;

    const response = await chatService.sendMessage({
      message: mensaje,
      conversationHistory: []
    });

    const presupuesto = parsearRespuestaIA(response.message);
    const confianza = calcularConfianza(presupuesto);

    return {
      presupuesto,
      respuestaIA: response.message,
      conversacionId,
      confianza,
      iteraciones: 1
    };
  } catch (error) {
    console.error('Error refining presupuesto:', error);
    throw new Error('Error al refinar el presupuesto');
  }
}

/**
 * Validate presupuesto structure
 */
export function validarPresupuestoIA(presupuesto: PresupuestoGenerado): {
  valido: boolean;
  errores: string[];
} {
  const errores: string[] = [];

  if (!presupuesto.fases || presupuesto.fases.length === 0) {
    errores.push('El presupuesto debe tener al menos una fase');
  }

  presupuesto.fases.forEach((fase, index) => {
    if (!fase.nombre || fase.nombre.trim() === '') {
      errores.push(`La fase ${index + 1} no tiene nombre`);
    }

    if (!fase.partidas || fase.partidas.length === 0) {
      errores.push(`La fase "${fase.nombre}" no tiene partidas`);
    }

    fase.partidas.forEach((partida, pIndex) => {
      if (!partida.nombre || partida.nombre.trim() === '') {
        errores.push(`La partida ${pIndex + 1} de la fase "${fase.nombre}" no tiene nombre`);
      }

      if (partida.cantidad <= 0) {
        errores.push(`La partida "${partida.nombre}" tiene cantidad inválida`);
      }

      if (partida.precioUnitario <= 0) {
        errores.push(`La partida "${partida.nombre}" tiene precio unitario inválido`);
      }
    });
  });

  if (presupuesto.montos) {
    if (presupuesto.montos.total <= 0) {
      errores.push('El monto total debe ser mayor a 0');
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
}

// Export service
export const presupuestoIAService = {
  generarPresupuestoConIA,
  refinarPresupuesto,
  parsearRespuestaIA,
  validarPresupuestoIA
};

export default presupuestoIAService;
