/**
 * Voice Service
 * 
 * Handles voice transcription and transaction extraction
 */

export interface VoiceTranscriptionResult {
  transcription: string;
  extractedData: {
    amount?: number;
    category?: string;
    project?: string;
    description?: string;
  };
  confidence: number;
}

/**
 * Transcribe audio y extrae datos de transacción
 */
export async function transcribeVoice(
  audioBlob: Blob
): Promise<VoiceTranscriptionResult> {
  try {
    // Mock implementation
    if (process.env.NODE_ENV === 'development') {
      return mockTranscribeVoice();
    }

    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch('/api/claude/voice-to-text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error al transcribir audio');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en transcribeVoice:', error);
    throw error;
  }
}

/**
 * Mock implementation
 */
function mockTranscribeVoice(): Promise<VoiceTranscriptionResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transcription: 'Gasté 500 pesos en cemento para el proyecto de la casa azul',
        extractedData: {
          amount: 500,
          category: 'materiales',
          project: 'casa-azul',
          description: 'Cemento'
        },
        confidence: 0.85
      });
    }, 2000);
  });
}
