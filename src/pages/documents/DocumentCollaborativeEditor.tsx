import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Type, 
  Highlighter, 
  Circle, 
  Square, 
  ArrowRight, 
  Image, 
  Signature, 
  MessageSquare, 
  Users, 
  Eye, 
  EyeOff, 
  Palette, 
  Save, 
  Share2, 
  Settings, 
  Download, 
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Maximize2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Send,
  Edit3,
  Trash2,
  Lock,
  Unlock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  CollaborativeAnnotation, 
  CollaborativeSession,
  Document,
  DocumentVersion
} from '@/types/documents';

interface DocumentCollaborativeEditorProps {
  document: Document;
  version: DocumentVersion;
  onAnnotationUpdate?: (annotations: CollaborativeAnnotation[]) => void;
  onSessionUpdate?: (session: CollaborativeSession) => void;
}

interface AnnotationTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'text' | 'highlight' | 'drawing' | 'stamp' | 'signature' | 'image';
  cursor?: string;
}

interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

export const DocumentCollaborativeEditor: React.FC<DocumentCollaborativeEditorProps> = ({
  document,
  version,
  onAnnotationUpdate,
  onSessionUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [annotations, setAnnotations] = useState<CollaborativeAnnotation[]>([]);
  const [session, setSession] = useState<CollaborativeSession | null>(null);
  const [selectedTool, setSelectedTool] = useState<AnnotationTool | null>(null);
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<DrawingPoint[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<CollaborativeAnnotation | null>(null);
  const [showParticipants, setShowParticipants] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isRealTime, setIsRealTime] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);

  const annotationTools: AnnotationTool[] = [
    {
      id: 'text',
      name: 'Texto',
      icon: <Type className="h-4 w-4" />,
      type: 'text',
      cursor: 'text'
    },
    {
      id: 'highlight',
      name: 'Resaltar',
      icon: <Highlighter className="h-4 w-4" />,
      type: 'highlight',
      cursor: 'crosshair'
    },
    {
      id: 'circle',
      name: 'Círculo',
      icon: <Circle className="h-4 w-4" />,
      type: 'drawing',
      cursor: 'crosshair'
    },
    {
      id: 'rectangle',
      name: 'Rectángulo',
      icon: <Square className="h-4 w-4" />,
      type: 'drawing',
      cursor: 'crosshair'
    },
    {
      id: 'arrow',
      name: 'Flecha',
      icon: <ArrowRight className="h-4 w-4" />,
      type: 'drawing',
      cursor: 'crosshair'
    },
    {
      id: 'signature',
      name: 'Firma',
      icon: <Signature className="h-4 w-4" />,
      type: 'signature',
      cursor: 'crosshair'
    },
    {
      id: 'stamp',
      name: 'Sello',
      icon: <CheckCircle className="h-4 w-4" />,
      type: 'stamp',
      cursor: 'crosshair'
    },
    {
      id: 'image',
      name: 'Imagen',
      icon: <Image className="h-4 w-4" />,
      type: 'image',
      cursor: 'crosshair'
    }
  ];

  // Inicializar sesión y cargar anotaciones
  useEffect(() => {
    initializeSession();
    loadAnnotations();
  }, [document.id, version.id]);

  // Auto-guardado
  useEffect(() => {
    if (autoSave) {
      const interval = setInterval(() => {
        saveAnnotations();
      }, 30000); // Guardar cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoSave, annotations]);

  const initializeSession = async () => {
    const mockSession: CollaborativeSession = {
      id: `session-${Date.now()}`,
      documentId: document.id,
      versionId: version.id,
      participants: [
        {
          userId: 'user-1',
          userName: 'Juan Pérez',
          userEmail: 'juan@example.com',
          role: 'editor',
          joinedAt: new Date(),
          lastActivity: new Date(),
          cursor: { x: 100, y: 200, page: 1 }
        },
        {
          userId: 'user-2',
          userName: 'María García',
          userEmail: 'maria@example.com',
          role: 'viewer',
          joinedAt: new Date(Date.now() - 300000),
          lastActivity: new Date(Date.now() - 60000),
          cursor: { x: 300, y: 150, page: 1 }
        }
      ],
      isActive: true,
      createdAt: new Date()
    };

    setSession(mockSession);
    if (onSessionUpdate) {
      onSessionUpdate(mockSession);
    }
  };

  const loadAnnotations = async () => {
    // Simular carga de anotaciones
    const mockAnnotations: CollaborativeAnnotation[] = [
      {
        id: 'anno-1',
        documentId: document.id,
        versionId: version.id,
        type: 'text',
        content: 'Este es un comentario importante sobre esta sección del documento.',
        position: { x: 150, y: 100, page: 1 },
        style: {
          color: '#FF0000',
          fontSize: 12,
          fontFamily: 'Arial'
        },
        author: {
          id: 'user-1',
          name: 'Juan Pérez',
          email: 'juan@example.com'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        resolved: false,
        replies: [
          {
            id: 'reply-1',
            annotationId: 'anno-1',
            content: 'Estoy de acuerdo con este comentario.',
            author: {
              id: 'user-2',
              name: 'María García',
              email: 'maria@example.com'
            },
            createdAt: new Date(Date.now() + 300000)
          }
        ],
        permissions: {
          canEdit: true,
          canDelete: true,
          canReply: true
        }
      },
      {
        id: 'anno-2',
        documentId: document.id,
        versionId: version.id,
        type: 'highlight',
        content: 'Texto importante',
        position: { x: 50, y: 200, width: 200, height: 30, page: 1 },
        style: {
          color: '#FFFF00',
          opacity: 0.5
        },
        author: {
          id: 'user-2',
          name: 'María García',
          email: 'maria@example.com'
        },
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000),
        resolved: true,
        resolvedBy: 'user-1',
        resolvedAt: new Date(),
        replies: [],
        permissions: {
          canEdit: false,
          canDelete: false,
          canReply: true
        }
      }
    ];

    setAnnotations(mockAnnotations);
    if (onAnnotationUpdate) {
      onAnnotationUpdate(mockAnnotations);
    }
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    const finalX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
    const finalY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;

    setIsDrawing(true);

    if (selectedTool.type === 'drawing') {
      setDrawingPoints([{ x: finalX, y: finalY }]);
    } else if (selectedTool.type === 'text') {
      createTextAnnotation(finalX, finalY);
    } else if (selectedTool.type === 'highlight') {
      createHighlightAnnotation(finalX, finalY);
    } else if (selectedTool.type === 'signature') {
      createSignatureAnnotation(finalX, finalY);
    } else if (selectedTool.type === 'stamp') {
      createStampAnnotation(finalX, finalY);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !selectedTool || selectedTool.type !== 'drawing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    const finalX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
    const finalY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;

    setDrawingPoints(prev => [...prev, { x: finalX, y: finalY }]);
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && selectedTool && selectedTool.type === 'drawing') {
      createDrawingAnnotation();
    }
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  const createTextAnnotation = (x: number, y: number) => {
    const newAnnotation: CollaborativeAnnotation = {
      id: `anno-${Date.now()}`,
      documentId: document.id,
      versionId: version.id,
      type: 'text',
      content: 'Nuevo texto',
      position: { x, y, page: 1 },
      style: {
        color: currentColor,
        fontSize: 14,
        fontFamily: 'Arial'
      },
      author: {
        id: 'current-user',
        name: 'Usuario Actual',
        email: 'user@example.com'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      resolved: false,
      replies: [],
      permissions: {
        canEdit: true,
        canDelete: true,
        canReply: true
      }
    };

    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const createHighlightAnnotation = (x: number, y: number) => {
    const newAnnotation: CollaborativeAnnotation = {
      id: `anno-${Date.now()}`,
      documentId: document.id,
      versionId: version.id,
      type: 'highlight',
      content: 'Texto resaltado',
      position: { x, y, width: 100, height: 20, page: 1 },
      style: {
        color: currentColor,
        opacity: 0.3
      },
      author: {
        id: 'current-user',
        name: 'Usuario Actual',
        email: 'user@example.com'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      resolved: false,
      replies: [],
      permissions: {
        canEdit: true,
        canDelete: true,
        canReply: true
      }
    };

    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const createDrawingAnnotation = () => {
    if (drawingPoints.length < 2) return;

    const newAnnotation: CollaborativeAnnotation = {
      id: `anno-${Date.now()}`,
      documentId: document.id,
      versionId: version.id,
      type: 'drawing',
      content: JSON.stringify(drawingPoints),
      position: { 
        x: Math.min(...drawingPoints.map(p => p.x)),
        y: Math.min(...drawingPoints.map(p => p.y)),
        width: Math.max(...drawingPoints.map(p => p.x)) - Math.min(...drawingPoints.map(p => p.x)),
        height: Math.max(...drawingPoints.map(p => p.y)) - Math.min(...drawingPoints.map(p => p.y)),
        page: 1 
      },
      style: {
        color: currentColor,
        lineWidth,
        opacity
      },
      author: {
        id: 'current-user',
        name: 'Usuario Actual',
        email: 'user@example.com'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      resolved: false,
      replies: [],
      permissions: {
        canEdit: true,
        canDelete: true,
        canReply: true
      }
    };

    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const createSignatureAnnotation = (x: number, y: number) => {
    const newAnnotation: CollaborativeAnnotation = {
      id: `anno-${Date.now()}`,
      documentId: document.id,
      versionId: version.id,
      type: 'signature',
      content: 'Firma digital',
      position: { x, y, width: 150, height: 50, page: 1 },
      style: {
        color: currentColor,
        opacity: 1
      },
      author: {
        id: 'current-user',
        name: 'Usuario Actual',
        email: 'user@example.com'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      resolved: false,
      replies: [],
      permissions: {
        canEdit: true,
        canDelete: true,
        canReply: true
      }
    };

    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const createStampAnnotation = (x: number, y: number) => {
    const newAnnotation: CollaborativeAnnotation = {
      id: `anno-${Date.now()}`,
      documentId: document.id,
      versionId: version.id,
      type: 'stamp',
      content: 'APROBADO',
      position: { x, y, width: 80, height: 30, page: 1 },
      style: {
        color: currentColor,
        opacity: 1
      },
      author: {
        id: 'current-user',
        name: 'Usuario Actual',
        email: 'user@example.com'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      resolved: false,
      replies: [],
      permissions: {
        canEdit: true,
        canDelete: true,
        canReply: true
      }
    };

    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const addReply = (annotationId: string, content: string) => {
    setAnnotations(prev => prev.map(annotation => {
      if (annotation.id === annotationId) {
        const newReply = {
          id: `reply-${Date.now()}`,
          annotationId,
          content,
          author: {
            id: 'current-user',
            name: 'Usuario Actual',
            email: 'user@example.com'
          },
          createdAt: new Date()
        };
        return {
          ...annotation,
          replies: [...annotation.replies, newReply]
        };
      }
      return annotation;
    }));
    setReplyText('');
  };

  const resolveAnnotation = (annotationId: string) => {
    setAnnotations(prev => prev.map(annotation => {
      if (annotation.id === annotationId) {
        return {
          ...annotation,
          resolved: true,
          resolvedBy: 'current-user',
          resolvedAt: new Date()
        };
      }
      return annotation;
    }));
  };

  const deleteAnnotation = (annotationId: string) => {
    setAnnotations(prev => prev.filter(annotation => annotation.id !== annotationId));
    setSelectedAnnotation(null);
  };

  const saveAnnotations = async () => {
    if (onAnnotationUpdate) {
      onAnnotationUpdate(annotations);
    }
    // Aquí se guardarían las anotaciones en el servidor
    console.log('Anotaciones guardadas:', annotations);
  };

  const exportAnnotations = () => {
    const exportData = {
      documentId: document.id,
      versionId: version.id,
      annotations,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `annotations-${document.id}-${version.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importAnnotations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.annotations && Array.isArray(data.annotations)) {
          setAnnotations(data.annotations);
        }
      } catch (error) {
        console.error('Error importing annotations:', error);
      }
    };
    reader.readAsText(file);
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'highlight':
        return <Highlighter className="h-4 w-4" />;
      case 'drawing':
        return <Edit3 className="h-4 w-4" />;
      case 'signature':
        return <Signature className="h-4 w-4" />;
      case 'stamp':
        return <CheckCircle className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Panel de herramientas */}
      <div className="w-80 bg-gray-50 border-r flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Editor Colaborativo
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* Herramientas de anotación */}
          <div>
            <h3 className="font-medium mb-2">Herramientas</h3>
            <div className="grid grid-cols-2 gap-2">
              {annotationTools.map(tool => (
                <Button
                  key={tool.id}
                  variant={selectedTool?.id === tool.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTool(tool)}
                  className="justify-start"
                >
                  {tool.icon}
                  <span className="ml-2 text-xs">{tool.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Configuración de estilo */}
          <div>
            <h3 className="font-medium mb-2">Estilo</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="color" className="text-sm">Color</Label>
                <div className="flex gap-2 mt-1">
                  {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000'].map(color => (
                    <Button
                      key={color}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      style={{ backgroundColor: color }}
                      onClick={() => setCurrentColor(color)}
                    />
                  ))}
                </div>
                <Input
                  id="color"
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="lineWidth" className="text-sm">Grosor de línea</Label>
                <Slider
                  id="lineWidth"
                  value={[lineWidth]}
                  onValueChange={(value) => setLineWidth(value[0])}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>

              <div>
                <Label htmlFor="opacity" className="text-sm">Opacidad</Label>
                <Slider
                  id="opacity"
                  value={[opacity * 100]}
                  onValueChange={(value) => setOpacity(value[0] / 100)}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            </div>
          </div>

          {/* Opciones de visualización */}
          <div>
            <h3 className="font-medium mb-2">Visualización</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showAnnotations" className="text-sm">Mostrar anotaciones</Label>
                <Switch
                  id="showAnnotations"
                  checked={showAnnotations}
                  onCheckedChange={setShowAnnotations}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showParticipants" className="text-sm">Mostrar participantes</Label>
                <Switch
                  id="showParticipants"
                  checked={showParticipants}
                  onCheckedChange={setShowParticipants}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showGrid" className="text-sm">Mostrar cuadrícula</Label>
                <Switch
                  id="showGrid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="snapToGrid" className="text-sm">Ajustar a cuadrícula</Label>
                <Switch
                  id="snapToGrid"
                  checked={snapToGrid}
                  onCheckedChange={setSnapToGrid}
                />
              </div>
            </div>
          </div>

          {/* Participantes */}
          {showParticipants && session && (
            <div>
              <h3 className="font-medium mb-2">Participantes ({session.participants.length})</h3>
              <div className="space-y-2">
                {session.participants.map(participant => (
                  <div key={participant.userId} className="flex items-center gap-2 p-2 bg-white rounded border">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{participant.userName}</div>
                      <div className="text-xs text-gray-600">{participant.role}</div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div>
            <h3 className="font-medium mb-2">Acciones</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={saveAnnotations} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button variant="outline" size="sm" onClick={exportAnnotations} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <label className="flex items-center cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                  <input
                    type="file"
                    accept=".json"
                    onChange={importAnnotations}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Área de trabajo principal */}
      <div className="flex-1 flex flex-col">
        {/* Barra de herramientas superior */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">{document.name}</h2>
            <Badge variant="outline">Versión {version.version}</Badge>
            {isRealTime && <Badge variant="default" className="bg-green-500">En tiempo real</Badge>}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setRotation(rotation - 90)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRotation(rotation + 90)}>
              <RotateCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas de anotaciones */}
        <div className="flex-1 bg-gray-100 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg mx-auto" style={{ width: '800px', height: '600px', transform: `scale(${zoom}) rotate(${rotation}deg)` }}>
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className={`border ${selectedTool?.cursor || 'default'}`}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              style={{
                cursor: selectedTool?.cursor || 'default',
                backgroundImage: showGrid ? `radial-gradient(circle, #ccc 1px, transparent 1px)` : 'none',
                backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : 'auto'
              }}
            />
            
            {/* Renderizar anotaciones existentes */}
            {showAnnotations && annotations.map(annotation => (
              <div
                key={annotation.id}
                className={`absolute border-2 cursor-pointer ${
                  selectedAnnotation?.id === annotation.id ? 'border-blue-500' : 'border-transparent'
                }`}
                style={{
                  left: annotation.position.x,
                  top: annotation.position.y,
                  width: annotation.position.width || 100,
                  height: annotation.position.height || 30,
                  color: annotation.style?.color || '#000000',
                  fontSize: annotation.style?.fontSize || 12,
                  opacity: annotation.style?.opacity || 1,
                  backgroundColor: annotation.type === 'highlight' ? annotation.style?.color : 'transparent'
                }}
                onClick={() => setSelectedAnnotation(annotation)}
              >
                {annotation.type === 'text' && (
                  <div className="p-2 bg-yellow-100 rounded">
                    {annotation.content}
                  </div>
                )}
                {annotation.type === 'highlight' && (
                  <div className="w-full h-full bg-opacity-30" />
                )}
                {annotation.type === 'stamp' && (
                  <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                    {annotation.content}
                  </div>
                )}
                {annotation.type === 'signature' && (
                  <div className="border-2 border-dashed border-gray-400 p-2 text-center">
                    <Signature className="h-8 w-8 mx-auto" />
                    <div className="text-xs">Firma digital</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel de anotaciones y comentarios */}
      <div className="w-80 bg-gray-50 border-l flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Anotaciones ({annotations.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {selectedAnnotation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Detalles de Anotación</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAnnotation(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    {getAnnotationIcon(selectedAnnotation.type)}
                    <span className="font-medium capitalize">{selectedAnnotation.type}</span>
                    {selectedAnnotation.resolved && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resuelto
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Por {selectedAnnotation.author.name} el {new Date(selectedAnnotation.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Contenido</Label>
                  <div className="mt-1 p-2 bg-white rounded border">
                    {selectedAnnotation.content}
                  </div>
                </div>

                {!selectedAnnotation.resolved && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => resolveAnnotation(selectedAnnotation.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolver
                    </Button>
                    {selectedAnnotation.permissions.canDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAnnotation(selectedAnnotation.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}

                {selectedAnnotation.replies.length > 0 && (
                  <div>
                    <Label className="text-sm">Respuestas ({selectedAnnotation.replies.length})</Label>
                    <div className="mt-2 space-y-2">
                      {selectedAnnotation.replies.map(reply => (
                        <div key={reply.id} className="p-2 bg-white rounded border">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3" />
                            <span className="text-sm font-medium">{reply.author.name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm">{reply.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAnnotation.permissions.canReply && (
                  <div>
                    <Label className="text-sm">Agregar respuesta</Label>
                    <div className="mt-2 space-y-2">
                      <Textarea
                        placeholder="Escribe tu respuesta..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                      />
                      <Button
                        size="sm"
                        onClick={() => addReply(selectedAnnotation.id, replyText)}
                        disabled={!replyText.trim()}
                        className="w-full"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {annotations.map(annotation => (
                <div
                  key={annotation.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-100 ${
                    annotation.resolved ? 'opacity-60' : ''
                  }`}
                  onClick={() => setSelectedAnnotation(annotation)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getAnnotationIcon(annotation.type)}
                      <span className="font-medium text-sm capitalize">{annotation.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {annotation.resolved && <CheckCircle className="h-3 w-3 text-green-500" />}
                      <span className="text-xs text-gray-500">
                        {new Date(annotation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    {annotation.content.length > 50 
                      ? `${annotation.content.substring(0, 50)}...` 
                      : annotation.content}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{annotation.author.name}</span>
                    <span>{annotation.replies.length} respuestas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
};