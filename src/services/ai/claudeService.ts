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
