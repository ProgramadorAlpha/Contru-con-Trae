/**
 * AI Analytics Service
 * 
 * Tracks and analyzes AI feature usage
 */

export interface AILog {
  id: string;
  userId: string;
  feature: 'chat' | 'voice' | 'receipt_scan' | 'search' | 'categorization';
  action: string;
  inputData: any;
  outputData: any;
  confidence?: number;
  processingTime: number;
  timestamp: string;
}

export interface AIMetrics {
  totalUsage: number;
  usageByFeature: Record<string, number>;
  averageProcessingTime: number;
  averageConfidence: number;
  adoptionRate: number;
  topUsers: Array<{ userId: string; usageCount: number }>;
}

/**
 * Registra el uso de una funcionalidad de IA
 */
export async function logAIUsage(log: Omit<AILog, 'id' | 'timestamp'>): Promise<void> {
  try {
    // En desarrollo, solo log a consola
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Usage:', log);
      return;
    }

    await fetch('/api/ai/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(log)
    });
  } catch (error) {
    console.error('Error logging AI usage:', error);
  }
}

/**
 * Obtiene métricas de uso de IA
 */
export async function getAIMetrics(
  dateRange?: { from: string; to: string }
): Promise<AIMetrics> {
  try {
    // Mock implementation
    if (process.env.NODE_ENV === 'development') {
      return mockGetAIMetrics();
    }

    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    const response = await fetch(`/api/ai/metrics?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener métricas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getAIMetrics:', error);
    throw error;
  }
}

/**
 * Mock implementation
 */
function mockGetAIMetrics(): Promise<AIMetrics> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalUsage: 1247,
        usageByFeature: {
          chat: 523,
          receipt_scan: 412,
          voice: 198,
          search: 87,
          categorization: 27
        },
        averageProcessingTime: 1850,
        averageConfidence: 0.89,
        adoptionRate: 0.67,
        topUsers: [
          { userId: 'user-1', usageCount: 234 },
          { userId: 'user-2', usageCount: 189 },
          { userId: 'user-3', usageCount: 156 }
        ]
      });
    }, 500);
  });
}
