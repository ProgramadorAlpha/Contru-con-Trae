import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, Loader2, CheckCircle, Eye, FileCheck } from 'lucide-react';

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  suggestedCategory?: string;
  suggestedTags?: string[];
}

interface DocumentUploadAdvancedProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (files: FileWithPreview[]) => void;
  categories: string[];
  projectId?: string;
  enableAutoClassification?: boolean;
}

const DocumentUploadAdvanced: React.FC<DocumentUploadAdvancedProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  categories,
  projectId,
  enableAutoClassification = true
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [uploadMode, setUploadMode] = useState<'individual' | 'batch'>('individual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream',
    'text/plain',
    'application/vnd.autocad.dwg',
    'image/vnd.dwg'
  ];

  const ALLOWED_EXTENSIONS = [
    '.pdf', '.dwg', '.xlsx', '.xls', '.docx', '.doc', 
    '.jpg', '.jpeg', '.png', '.webp', '.zip', '.txt'
  ];

  // Auto-classification logic
  const classifyDocument = useCallback((file: File): { category: string; tags: string[] } => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    const extension = fileName.split('.').pop()?.toLowerCase();

    let category = 'General';
    const tags: string[] = [];

    // Classification by file name keywords
    if (fileName.includes('plano') || fileName.includes('drawing') || fileName.includes('blueprint')) {
      category = 'Planos';
      tags.push('arquitectura', 'diseño');
    } else if (fileName.includes('contrato') || fileName.includes('contract')) {
      category = 'Contratos';
      tags.push('legal', 'acuerdo');
    } else if (fileName.includes('factura') || fileName.includes('invoice') || fileName.includes('bill')) {
      category = 'Facturas';
      tags.push('finanzas', 'pago');
    } else if (fileName.includes('presupuesto') || fileName.includes('budget') || fileName.includes('estimate')) {
      category = 'Presupuestos';
      tags.push('costos', 'finanzas');
    } else if (fileName.includes('informe') || fileName.includes('report')) {
      category = 'Informes';
      tags.push('seguimiento', 'progreso');
    } else if (fileName.includes('foto') || fileName.includes('photo') || fileName.includes('image')) {
      category = 'Fotos';
      tags.push('obra', 'evidencia');
    }

    // Classification by file type
    if (extension === 'pdf') {
      tags.push('documento', 'formal');
    } else if (extension === 'dwg') {
      category = category === 'General' ? 'Planos' : category;
      tags.push('cad', 'técnico');
    } else if (['xlsx', 'xls'].includes(extension || '')) {
      tags.push('cálculos', 'datos');
    } else if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) {
      category = category === 'General' ? 'Fotos' : category;
      tags.push('visual', 'imagen');
    }

    return { category, tags };
  }, []);

  const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createFilePreview = (file: File): Promise<FileWithPreview> => {
    return new Promise((resolve) => {
      const fileWithPreview: FileWithPreview = {
        ...file,
        id: generateFileId(),
        status: 'pending',
        progress: 0
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          fileWithPreview.preview = reader.result as string;
          resolve(fileWithPreview);
        };
        reader.readAsDataURL(file);
      } else {
        resolve(fileWithPreview);
      }
    });
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `El archivo ${file.name} excede el tamaño máximo de 100MB`;
    }

    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension);

    if (!isValidType) {
      return `El tipo de archivo ${file.type || extension} no está permitido`;
    }

    return null;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      await processFiles(selectedFiles);
    }
  };

  const processFiles = async (newFiles: File[]) => {
    const processedFiles = await Promise.all(
      newFiles.map(async (file) => {
        const error = validateFile(file);
        const fileWithPreview = await createFilePreview(file);
        
        if (error) {
          fileWithPreview.status = 'error';
          fileWithPreview.error = error;
        } else if (enableAutoClassification) {
          const classification = classifyDocument(file);
          fileWithPreview.suggestedCategory = classification.category;
          fileWithPreview.suggestedTags = classification.tags;
        }

        return fileWithPreview;
      })
    );

    setFiles(prev => [...prev, ...processedFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const updateFileStatus = (fileId: string, status: FileWithPreview['status'], progress?: number, error?: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status, progress: progress ?? file.progress, error }
        : file
    ));
  };

  const simulateUpload = async (file: FileWithPreview): Promise<void> => {
    return new Promise((resolve) => {
      updateFileStatus(file.id, 'uploading', 0);

      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === file.id) {
            const newProgress = Math.min(f.progress + Math.random() * 15 + 5, 95);
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        updateFileStatus(file.id, 'completed', 100);
        resolve();
      }, 2000 + Math.random() * 2000);
    });
  };

  const handleUpload = async () => {
    const validFiles = files.filter(f => f.status !== 'error');
    if (validFiles.length === 0) {
      alert('No hay archivos válidos para subir');
      return;
    }

    setIsUploading(true);

    try {
      if (uploadMode === 'batch') {
        // Upload all files simultaneously
        await Promise.all(validFiles.map(file => simulateUpload(file)));
      } else {
        // Upload files one by one
        for (const file of validFiles) {
          await simulateUpload(file);
        }
      }

      const completedFiles = files.filter(f => f.status === 'completed');
      onUploadComplete(completedFiles);
      
      setTimeout(() => {
        onClose();
        setFiles([]);
      }, 1000);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir los archivos');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, status: string) => {
    const iconClass = "w-6 h-6";
    
    if (status === 'uploading') {
      return <Loader2 className={`${iconClass} text-blue-500 animate-spin`} />;
    }
    if (status === 'completed') {
      return <CheckCircle className={`${iconClass} text-green-500`} />;
    }
    if (status === 'error') {
      return <AlertCircle className={`${iconClass} text-red-500`} />;
    }

    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-500`} />;
      case 'dwg':
        return <FileText className={`${iconClass} text-blue-500`} />;
      case 'xlsx':
      case 'xls':
        return <FileText className={`${iconClass} text-green-500`} />;
      case 'docx':
      case 'doc':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        return <FileText className={`${iconClass} text-purple-500`} />;
      case 'zip':
        return <FileText className={`${iconClass} text-yellow-500`} />;
      default:
        return <FileText className={`${iconClass} text-gray-500`} />;
    }
  };

  if (!isOpen) return null;

  const validFiles = files.filter(f => f.status !== 'error');
  const errorFiles = files.filter(f => f.status === 'error');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Carga Avanzada de Documentos
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Sube múltiples documentos con clasificación automática
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isUploading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Upload Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modo de Carga
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="individual"
                    checked={uploadMode === 'individual'}
                    onChange={(e) => setUploadMode(e.target.value as 'individual')}
                    className="form-radio"
                    disabled={isUploading}
                  />
                  <span className="ml-2 text-sm">Uno por uno</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="batch"
                    checked={uploadMode === 'batch'}
                    onChange={(e) => setUploadMode(e.target.value as 'batch')}
                    className="form-radio"
                    disabled={isUploading}
                  />
                  <span className="ml-2 text-sm">Todos simultáneamente</span>
                </label>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-6 ${
                isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 text-gray-400">
                  <Upload className="w-16 h-16" />
                </div>
                <div className="text-gray-600">
                  <p className="font-medium text-lg">Arrastra y suelta archivos aquí</p>
                  <p className="text-sm text-gray-500 mt-2">
                    o{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-500 font-medium"
                      disabled={isUploading}
                    >
                      busca en tu computadora
                    </button>
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DWG, XLSX, DOCX, JPG, PNG, ZIP, TXT (máx. 100MB)
                </p>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.dwg,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png,.webp,.zip,.txt"
              disabled={isUploading}
            />

            {/* Files List */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    Archivos seleccionados ({files.length})
                  </h4>
                  <div className="text-xs text-gray-500">
                    {validFiles.length} válidos, {errorFiles.length} con errores
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getFileIcon(file.type, file.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {file.type.toUpperCase()}
                            </p>
                            
                            {file.suggestedCategory && (
                              <div className="flex items-center mt-1">
                                <FileCheck className="w-3 h-3 text-green-500 mr-1" />
                                <span className="text-xs text-green-600">
                                  Categoría sugerida: {file.suggestedCategory}
                                </span>
                              </div>
                            )}

                            {file.suggestedTags && file.suggestedTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {file.suggestedTags.map((tag, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {file.preview && (
                            <button
                              onClick={() => window.open(file.preview, '_blank')}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Vista previa"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {file.status === 'uploading' && (
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                          )}

                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            disabled={isUploading}
                            title="Eliminar archivo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {file.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          {file.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Los archivos se clasificarán automáticamente
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={validFiles.length === 0 || isUploading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir {validFiles.length} archivo{validFiles.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadAdvanced;