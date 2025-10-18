import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Square, Loader2, Check } from 'lucide-react';
import { ExtractedDataForm } from './ExtractedDataForm';

type VoiceState = 'idle' | 'recording' | 'processing' | 'confirmation' | 'success';

interface VoiceTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

export const VoiceTransactionModal: React.FC<VoiceTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcription, setTranscription] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setState('idle');
      setTranscription('');
      setExtractedData(null);
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Detener el stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setState('recording');
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Por favor verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setState('processing');
    
    try {
      // Mock implementation - en producción llamaría al servicio real
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTranscription = 'Gasté 500 pesos en cemento para el proyecto de la casa azul';
      const mockExtracted = {
        total: 500,
        date: new Date().toISOString().split('T')[0],
        supplier: 'Ferretería',
        items: ['Cemento'],
        rfc: undefined,
        invoiceNumber: undefined
      };

      setTranscription(mockTranscription);
      setExtractedData({
        extractedData: mockExtracted,
        suggestedCategory: 'materiales',
        suggestedProject: undefined,
        confidence: 0.85
      });
      setState('confirmation');
    } catch (error) {
      console.error('Error al procesar audio:', error);
      alert('Error al procesar el audio. Por favor intenta de nuevo.');
      setState('idle');
    }
  };

  const handleSave = (formData: any) => {
    if (onSave) {
      onSave(formData);
    }
    setState('success');
  };

  const handleCancel = () => {
    setState('idle');
    setTranscription('');
    setExtractedData(null);
  };

  const handleClose = () => {
    stopRecording();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-[#1a1f2e] rounded-2xl shadow-2xl border-2 border-dashed border-purple-500">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Mic className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Transacción por Voz</h2>
              <p className="text-sm text-gray-400">
                {state === 'idle' && 'Toca para hablar'}
                {state === 'recording' && 'Grabando...'}
                {state === 'processing' && 'Procesando audio...'}
                {state === 'confirmation' && 'Confirma los datos'}
                {state === 'success' && 'Guardado exitosamente'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Idle State */}
          {state === 'idle' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <button
                onClick={startRecording}
                className="w-32 h-32 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <Mic className="w-16 h-16 text-white" />
              </button>
              <p className="text-lg text-white font-medium">Toca para hablar</p>
              <p className="text-sm text-gray-400 text-center max-w-md">
                Di algo como: "Gasté 500 pesos en cemento para el proyecto de la casa azul"
              </p>
            </div>
          )}

          {/* Recording State */}
          {state === 'recording' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <button
                  onClick={stopRecording}
                  className="w-32 h-32 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg animate-pulse"
                >
                  <Square className="w-12 h-12 text-white fill-white" />
                </button>
                {/* Waveform Animation */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-purple-500 rounded-full animate-wave"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-lg text-white font-medium mt-8">Grabando...</p>
              <p className="text-sm text-gray-400">Toca el cuadrado para detener</p>
            </div>
          )}

          {/* Processing State */}
          {state === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
              <p className="text-lg text-white font-medium">Procesando audio...</p>
              <p className="text-sm text-gray-400">Extrayendo datos con IA</p>
            </div>
          )}

          {/* Confirmation State */}
          {state === 'confirmation' && extractedData && (
            <div className="space-y-4">
              {transcription && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-sm text-purple-300 mb-1">Transcripción:</p>
                  <p className="text-white">{transcription}</p>
                </div>
              )}
              <ExtractedDataForm
                data={extractedData.extractedData}
                suggestedCategory={extractedData.suggestedCategory}
                suggestedProject={extractedData.suggestedProject}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-lg text-white font-medium">¡Gasto registrado exitosamente!</p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
