/**
 * AI Alerts Service
 * 
 * Manages intelligent alerts for contracts, permits, and invoices
 */

export interface AIAlert {
  id: string;
  type: 'contract_expiring' | 'permit_renewal' | 'invoice_overdue' | 'document_missing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  documentId?: string;
  projectId?: string;
  dueDate?: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * Obtiene alertas inteligentes
 */
export async function getAIAlerts(
  filters?: {
    type?: AIAlert['type'];
    severity?: AIAlert['severity'];
    isRead?: boolean;
  }
): Promise<AIAlert[]> {
  try {
    // Mock implementation
    if (process.env.NODE_ENV === 'development') {
      return mockGetAIAlerts();
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await fetch(`/api/ai/alerts?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener alertas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getAIAlerts:', error);
    throw error;
  }
}

/**
 * Marca una alerta como leída
 */
export async function markAlertAsRead(alertId: string): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Marking alert as read:', alertId);
      return;
    }

    await fetch(`/api/ai/alerts/${alertId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
  }
}

/**
 * Mock implementation
 */
function mockGetAIAlerts(): Promise<AIAlert[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'alert-1',
          type: 'contract_expiring',
          severity: 'high',
          title: 'Contrato próximo a vencer',
          message: 'El contrato con Proveedor XYZ vence en 15 días',
          documentId: 'doc-123',
          projectId: 'proj-456',
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          isRead: false
        },
        {
          id: 'alert-2',
          type: 'permit_renewal',
          severity: 'critical',
          title: 'Permiso de construcción requiere renovación',
          message: 'El permiso de construcción vence en 7 días',
          documentId: 'doc-789',
          projectId: 'proj-456',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          isRead: false
        },
        {
          id: 'alert-3',
          type: 'invoice_overdue',
          severity: 'medium',
          title: 'Factura vencida',
          message: 'La factura #12345 está vencida desde hace 3 días',
          documentId: 'doc-321',
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          isRead: true
        }
      ]);
    }, 500);
  });
}
