import React, { useState, useRef } from 'react';
import { X, Camera, Check, RotateCcw, Loader2 } from 'lucide-react';
import Webcam from 'react-webcam';
import { analyzeReceipt, AnalyzeReceiptResponse } from '../../services/ai/receiptService';
import { ExtractedDataForm } from './ExtractedDataForm';
import { 
  saveScannedReceipt, 
  showSuccessNotification, 
  showErrorNotification 
} from '../../services/ai/integrationService';

type ScanState = 'camera' | 'preview' | 'analyzing' | 'extracted' | 'saved';

interface ReceiptScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

export const ReceiptScanModal: React.FC<ReceiptScanModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [state, setState] = useState<ScanState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzedData, setAnalyzedData] = useState<AnalyzeReceiptResponse | null>(null);
  const webcamRef = useRef<Webcam>(null);

  if (!isOpen) return null;

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setState('preview');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAnalyzedData(null);
    setState('camera');
  };

  const useImage = async () => {
    if (!capturedImage) return;
    
    setState('analyzing');
    try {
      const result = await analyzeReceipt(capturedImage);
      setAnalyzedData(result);
      setState('extracted');
    } catch (error) {
      console.error('Error al analizar recibo:', error);
      alert('Error al analizar el recibo. Por favor intenta de nuevo.');
      setState('preview');
    }
  };

  const handleSaveData = async (formData: any) => {
    if (!analyzedData || !capturedImage) return;

    setState('analyzing'); // Mostrar loading mientras guarda
    
    try {
      const result = await saveScannedReceipt(
        analyzedData.extractedData,
        formData,
        capturedImage
      );

      if (result.success) {
        showSuccessNotification('¡Recibo guardado exitosamente!');
        setState('saved');
        
        if (onSave) {
          onSave({ 
            ...formData, 
            image: capturedImage,
            expenseId: result.expenseId,
            documentId: result.documentId
          });
        }
      } else {
        showErrorNotification(result.error || 'Error al guardar el recibo');
        setState('extracted'); // Volver al formulario
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      showErrorNotification('Error inesperado al guardar el recibo');
      setState('extracted');
    }
  };

  const handleCancel = () => {
    retakePhoto();
  };

  const handleClose = () => {
    setState('camera');
    setCapturedImage(null);
    setAnalyzedData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-[#1a1f2e] rounded-2xl shadow-2xl border-2 border-dashed border-blue-500">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Camera className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Escanear Recibo</h2>
              <p className="text-sm text-gray-400">
                {state === 'camera' && 'Captura la imagen del recibo'}
                {state === 'preview' && 'Revisa la imagen capturada'}
                {state === 'analyzing' && 'Analizando recibo...'}
                {state === 'extracted' && 'Datos extraídos'}
                {state === 'saved' && 'Guardado exitosamente'}
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
          {/* Camera View */}
          {state === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{
                    facingMode: 'environment'
                  }}
                />
              </div>
              <button
                onClick={capturePhoto}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Capturar Foto
              </button>
            </div>
          )}

          {/* Preview View */}
          {state === 'preview' && capturedImage && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Recibo capturado"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={retakePhoto}
                  className="py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Tomar Otra
                </button>
                <button
                  onClick={useImage}
                  className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Usar Esta
                </button>
              </div>
            </div>
          )}

          {/* Analyzing View */}
          {state === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              <p className="text-lg text-white font-medium">Analizando recibo...</p>
              <p className="text-sm text-gray-400">Extrayendo datos con IA</p>
            </div>
          )}

          {/* Extracted View */}
          {state === 'extracted' && analyzedData && (
            <ExtractedDataForm
              data={analyzedData.extractedData}
              suggestedCategory={analyzedData.suggestedCategory}
              suggestedProject={analyzedData.suggestedProject}
              onSave={handleSaveData}
              onCancel={handleCancel}
            />
          )}

          {/* Saved View */}
          {state === 'saved' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-lg text-white font-medium">¡Guardado exitosamente!</p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
