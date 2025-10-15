import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Download, Trash2, Eye, File, Image, FileSpreadsheet, FileArchive, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ToolDocument } from '../../types/tools';

interface DocumentUploadProps {
  toolId: string;
  currentDocuments: ToolDocument[];
  isOpen: boolean;
  onClose: () => void;
  onUpload: (toolId: string, file: File, documentType: string, description?: string) => Promise<void>;
  onDownload: (documentId: string) => void;
  onDelete: (documentId: string) => void;
  maxFileSize?: number; // in bytes, default 10MB
  allowedTypes?: string[];
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  toolId,
  currentDocuments,
  isOpen,
  onClose,
  onUpload,
  onDownload,
  onDelete,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.zip', '.rar']
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('manual');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { id: 'manual', label: 'Manual', icon: FileText },
    { id: 'invoice', label: 'Factura', icon: FileSpreadsheet },
    { id: 'warranty', label: 'Garantía', icon: CheckCircle },
    { id: 'certificate', label: 'Certificado', icon: CheckCircle },
    { id: 'photo', label: 'Fotografía', icon: Image },
    { id: 'report', label: 'Informe', icon: FileText },
    { id: 'other', label: 'Otro', icon: FileArchive }
  ];

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'doc':
      case 'docx':
        return <File className="w-6 h-6 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="w-6 h-6 text-purple-600" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="w-6 h-6 text-orange-600" />;
      default:
        return <File className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `El archivo excede el tamaño máximo permitido de ${formatFileSize(maxFileSize)}`;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setError('');
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    // Hoist interval handle to allow clearing in catch/finally
    let progressInterval: number | undefined;

    try {
      // Simulate upload progress
      progressInterval = window.setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressInterval !== undefined) {
              clearInterval(progressInterval);
            }
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(toolId, selectedFile, documentType, description);
      
      if (progressInterval !== undefined) {
        clearInterval(progressInterval);
      }
      setUploadProgress(100);
      
      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setDescription('');
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      if (progressInterval !== undefined) {
        clearInterval(progressInterval);
      }
      setError('Error al subir el archivo. Por favor, intente nuevamente.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este documento?')) {
      onDelete(documentId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestión de Documentos</h2>
              <p className="text-sm text-gray-600">Herramienta ID: {toolId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Upload Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir Nuevo Documento</h3>
            
            {/* Document Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {documentTypes.map(type => (
                  <label
                    key={type.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      documentType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="documentType"
                      value={type.id}
                      checked={documentType === type.id}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="mr-2"
                    />
                    <type.icon className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* File Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
                accept={allowedTypes.join(',')}
              />
              
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    {getFileIcon(selectedFile.name)}
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  
                  {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      disabled={isUploading}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'Subiendo...' : 'Subir Documento'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Arrastre y suelte su archivo aquí, o{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      seleccione un archivo
                    </button>
                  </p>
                  <p className="text-sm text-gray-500">
                    Tipos permitidos: {allowedTypes.join(', ')}. Tamaño máximo: {formatFileSize(maxFileSize)}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedFile && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Documento (Opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Proporcione una breve descripción del documento..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUploading}
                />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            )}
          </div>

          {/* Existing Documents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Documentos Existentes ({currentDocuments.length})
            </h3>
            
            {currentDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentDocuments.map(document => (
                  <div key={document.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {getFileIcon(document.name)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{document.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{document.type}</p>
                          {document.description && (
                            <p className="text-sm text-gray-500 mt-1">{document.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{formatFileSize(document.size)}</span>
                            <span>{new Date(document.uploadDate).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          onClick={() => onDownload(document.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Descargar documento"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay documentos adjuntos</p>
                <p className="text-sm text-gray-500 mt-2">
                  Los documentos subidos aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;