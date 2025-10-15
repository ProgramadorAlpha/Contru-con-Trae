import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Download, MessageSquare, Highlighter, Type, 
  Pen, Bookmark, Trash2, Eye, EyeOff, Palette, Send,
  CheckCircle, Circle, Save, FileText
} from 'lucide-react';
import { Document, DocumentAnnotation } from '../../types/documents';

interface DocumentAnnotationEditorProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onSave: (annotations: DocumentAnnotation[]) => void;
}

export const DocumentAnnotationEditor: React.FC<DocumentAnnotationEditorProps> = ({
  document,
  isOpen,
  onClose,
  onSave
}) => {
  const [annotations, setAnnotations] = useState<DocumentAnnotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('highlight');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(5);
  const [selectedAnnotation, setSelectedAnnotation] = useState<DocumentAnnotation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [zoom, setZoom] = useState(1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tools = [
    { id: 'highlight', name: 'Resaltar', icon: Highlighter, color: '#fbbf24' },
    { id: 'comment', name: 'Comentar', icon: MessageSquare, color: '#3b82f6' },
    { id: 'text', name: 'Texto', icon: Type, color: '#10b981' },
    { id: 'stamp', name: 'Sello', icon: Bookmark, color: '#8b5cf6' },
    { id: 'drawing', name: 'Dibujar', icon: Pen, color: '#ef4444' }
  ];

  // Cargar anotaciones de ejemplo
  useEffect(() => {
    if (isOpen && document) {
      const sampleAnnotations: DocumentAnnotation[] = [
        {
          id: '1',
          documentId: document.id,
          type: 'highlight',
          content: 'Texto importante',
          x: 100,
          y: 150,
          width: 200,
          height: 30,
          page: 1,
          color: '#fbbf24',
          author: 'Usuario Actual',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          documentId: document.id,
          type: 'comment',
          content: 'Revisar esta sección',
          x: 300,
          y: 200,
          width: 20,
          height: 20,
          page: 1,
          color: '#3b82f6',
          author: 'Usuario Actual',
          createdAt: new Date(),
          updatedAt: new Date(),
          replies: [
            {
              id: 'r1',
              content: 'De acuerdo, necesita revisión',
              author: 'Juan Pérez',
              createdAt: new Date()
            }
          ]
        }
      ];
      setAnnotations(sampleAnnotations);
    }
  }, [isOpen, document]);

  // Dibujar anotaciones en el canvas
  useEffect(() => {
    if (canvasRef.current && showAnnotations) {
      drawAnnotations();
    }
  }, [annotations, currentPage, showAnnotations, zoom]);

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar anotaciones de la página actual
    const pageAnnotations = annotations.filter(ann => ann.page === currentPage);
    
    pageAnnotations.forEach(annotation => {
      switch (annotation.type) {
        case 'highlight':
          drawHighlight(ctx, annotation);
          break;
        case 'comment':
          drawComment(ctx, annotation);
          break;
        case 'text':
          drawText(ctx, annotation);
          break;
        case 'stamp':
          drawStamp(ctx, annotation);
          break;
      }
    });
  };

  const drawHighlight = (ctx: CanvasRenderingContext2D, annotation: DocumentAnnotation) => {
    ctx.fillStyle = annotation.color + '80'; // 50% opacidad
    ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
  };

  const drawComment = (ctx: CanvasRenderingContext2D, annotation: DocumentAnnotation) => {
    // Dibujar icono de comentario
    ctx.fillStyle = annotation.color;
    ctx.beginPath();
    ctx.arc(annotation.x + 10, annotation.y + 10, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Contador de respuestas
    if (annotation.replies && annotation.replies.length > 0) {
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(annotation.replies.length.toString(), annotation.x + 10, annotation.y + 14);
    }
  };

  const drawText = (ctx: CanvasRenderingContext2D, annotation: DocumentAnnotation) => {
    ctx.fillStyle = annotation.color;
    ctx.font = '14px Arial';
    ctx.fillText(annotation.content, annotation.x, annotation.y + 14);
  };

  const drawStamp = (ctx: CanvasRenderingContext2D, annotation: DocumentAnnotation) => {
    ctx.fillStyle = annotation.color + '20';
    ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
    
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
    
    ctx.fillStyle = annotation.color;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(annotation.content, annotation.x + annotation.width / 2, annotation.y + annotation.height / 2 + 4);
  };

  // Manejar clicks en el canvas
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    switch (selectedTool) {
      case 'highlight':
        createHighlightAnnotation(x, y);
        break;
      case 'comment':
        createCommentAnnotation(x, y);
        break;
      case 'text':
        createTextAnnotation(x, y);
        break;
      case 'stamp':
        createStampAnnotation(x, y);
        break;
    }
  };

  const createHighlightAnnotation = (x: number, y: number) => {
    const annotation: DocumentAnnotation = {
      id: Date.now().toString(),
      documentId: document.id,
      type: 'highlight',
      content: 'Texto resaltado',
      x: x - 100,
      y: y - 15,
      width: 200,
      height: 30,
      page: currentPage,
      color: '#fbbf24',
      author: 'Usuario Actual',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setAnnotations([...annotations, annotation]);
  };

  const createCommentAnnotation = (x: number, y: number) => {
    const annotation: DocumentAnnotation = {
      id: Date.now().toString(),
      documentId: document.id,
      type: 'comment',
      content: 'Nuevo comentario',
      x: x - 10,
      y: y - 10,
      width: 20,
      height: 20,
      page: currentPage,
      color: '#3b82f6',
      author: 'Usuario Actual',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setAnnotations([...annotations, annotation]);
    setSelectedAnnotation(annotation);
  };

  const createTextAnnotation = (x: number, y: number) => {
    const text = prompt('Ingresa el texto:');
    if (!text) return;

    const annotation: DocumentAnnotation = {
      id: Date.now().toString(),
      documentId: document.id,
      type: 'text',
      content: text,
      x: x,
      y: y,
      width: text.length * 8,
      height: 20,
      page: currentPage,
      color: '#10b981',
      author: 'Usuario Actual',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setAnnotations([...annotations, annotation]);
  };

  const createStampAnnotation = (x: number, y: number) => {
    const stamps = ['APROBADO', 'REVISADO', 'CONFIDENCIAL', 'URGENTE'];
    const stamp = prompt('Selecciona sello:\n' + stamps.join('\n'));
    if (!stamp) return;

    const annotation: DocumentAnnotation = {
      id: Date.now().toString(),
      documentId: document.id,
      type: 'stamp',
      content: stamp,
      x: x - 40,
      y: y - 15,
      width: 80,
      height: 30,
      page: currentPage,
      color: '#8b5cf6',
      author: 'Usuario Actual',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setAnnotations([...annotations, annotation]);
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
    setSelectedAnnotation(null);
  };

  const addReply = () => {
    if (!selectedAnnotation || !replyText.trim()) return;

    const updatedAnnotations = annotations.map(ann => {
      if (ann.id === selectedAnnotation.id) {
        const replies = ann.replies || [];
        return {
          ...ann,
          replies: [...replies, {
            id: Date.now().toString(),
            content: replyText,
            author: 'Usuario Actual',
            createdAt: new Date()
          }]
        };
      }
      return ann;
    });

    setAnnotations(updatedAnnotations);
    setSelectedAnnotation(updatedAnnotations.find(ann => ann.id === selectedAnnotation.id) || null);
    setReplyText('');
  };

  const handleSave = () => {
    onSave(annotations);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Anotaciones - {document.name}</h2>
              <p className="text-sm text-gray-500">Página {currentPage} de {totalPages}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`p-2 rounded ${showAnnotations ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              title={showAnnotations ? 'Ocultar anotaciones' : 'Mostrar anotaciones'}
            >
              {showAnnotations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Panel de herramientas */}
          <div className="w-64 bg-gray-50 border-r p-4 space-y-4">
            <div>
              <h3 className="font-medium mb-2">Herramientas</h3>
              <div className="space-y-1">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded text-left ${
                        selectedTool === tool.id 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: tool.color }} />
                      <span className="text-sm">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de anotaciones */}
            <div>
              <h3 className="font-medium mb-2">Anotaciones ({annotations.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    onClick={() => setSelectedAnnotation(annotation)}
                    className={`p-2 rounded border cursor-pointer ${
                      selectedAnnotation?.id === annotation.id 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: annotation.color }}
                      />
                      <span className="text-sm font-medium capitalize">{annotation.type}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnnotation(annotation.id);
                        }}
                        className="ml-auto p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">{annotation.content}</p>
                    {annotation.replies && annotation.replies.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {annotation.replies.length} respuesta{annotation.replies.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Área de visualización */}
          <div className="flex-1 bg-gray-100 p-4 overflow-auto">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Canvas de anotaciones */}
              <div className="border border-gray-300 rounded relative overflow-hidden">
                <div className="bg-white" style={{ 
                  width: '600px', 
                  height: '800px',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left'
                }}>
                  {/* Simulación de página PDF */}
                  <div className="p-8 text-gray-600">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">{document.name}</p>
                      <p className="text-sm text-gray-500 mb-4">Página {currentPage} de {totalPages}</p>
                      <p className="text-sm text-gray-400">
                        Haz clic en el documento para agregar anotaciones con la herramienta seleccionada.
                      </p>
                    </div>
                  </div>
                </div>
                <canvas
                  ref={canvasRef}
                  width={600 * zoom}
                  height={800 * zoom}
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ pointerEvents: 'none' }}
                />
                {/* Área invisible para capturar clicks */}
                <div 
                  className="absolute top-0 left-0 cursor-crosshair"
                  style={{ width: `${600 * zoom}px`, height: `${800 * zoom}px` }}
                  onClick={handleCanvasClick}
                />
              </div>
            </div>
          </div>

          {/* Panel de detalles de anotación */}
          {selectedAnnotation && (
            <div className="w-80 bg-gray-50 border-l p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Detalles de anotación</h3>
                <button
                  onClick={() => setSelectedAnnotation(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedAnnotation.color }}
                    />
                    <span className="text-sm capitalize">{selectedAnnotation.type}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                  <textarea
                    value={selectedAnnotation.content}
                    onChange={(e) => {
                      const updatedAnnotations = annotations.map(ann =>
                        ann.id === selectedAnnotation.id 
                          ? { ...ann, content: e.target.value }
                          : ann
                      );
                      setAnnotations(updatedAnnotations);
                      setSelectedAnnotation({ ...selectedAnnotation, content: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                  <p className="text-sm text-gray-600">{selectedAnnotation.author}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <p className="text-sm text-gray-600">
                    {selectedAnnotation.createdAt.toLocaleDateString()}
                  </p>
                </div>

                {/* Respuestas */}
                {selectedAnnotation.type === 'comment' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Respuestas ({selectedAnnotation.replies?.length || 0})
                    </label>
                    <div className="space-y-2 mb-3">
                      {selectedAnnotation.replies?.map((reply) => (
                        <div key={reply.id} className="bg-white p-2 rounded border text-sm">
                          <p className="font-medium text-gray-700">{reply.author}</p>
                          <p className="text-gray-600">{reply.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {reply.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Agregar respuesta..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addReply();
                          }
                        }}
                      />
                      <button
                        onClick={addReply}
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => deleteAnnotation(selectedAnnotation.id)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar anotación</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};