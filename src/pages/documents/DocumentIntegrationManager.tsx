import React, { useState, useEffect } from 'react';
import { Link, ExternalLink, Unlink, Download, Upload, Settings, Plus, Search, Filter, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DocumentIntegration, 
  IntegrationProject, 
  IntegrationTask, 
  IntegrationBudget,
  Document 
} from '@/types/documents';

interface DocumentIntegrationManagerProps {
  document: Document;
  onIntegrationUpdate?: (integrations: DocumentIntegration[]) => void;
}

export const DocumentIntegrationManager: React.FC<DocumentIntegrationManagerProps> = ({
  document,
  onIntegrationUpdate
}) => {
  const [integrations, setIntegrations] = useState<DocumentIntegration[]>([]);
  const [projects, setProjects] = useState<IntegrationProject[]>([]);
  const [tasks, setTasks] = useState<IntegrationTask[]>([]);
  const [budgets, setBudgets] = useState<IntegrationBudget[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<DocumentIntegration | null>(null);
  const [exportFormat, setExportFormat] = useState<string>('json');

  // Cargar integraciones existentes
  useEffect(() => {
    loadIntegrations();
    loadAvailableResources();
  }, [document.id]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockIntegrations: DocumentIntegration[] = [
        {
          id: '1',
          documentId: document.id,
          type: 'project',
          targetId: 'proj-1',
          targetName: 'Proyecto Construcción Torre A',
          targetType: 'project',
          status: 'linked',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          documentId: document.id,
          type: 'task',
          targetId: 'task-1',
          targetName: 'Revisión de Planos Estructurales',
          targetType: 'task',
          status: 'linked',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableResources = async () => {
    // Cargar proyectos, tareas y presupuestos disponibles
    const mockProjects: IntegrationProject[] = [
      {
        id: 'proj-1',
        name: 'Proyecto Construcción Torre A',
        description: 'Construcción de torre residencial de 25 pisos',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 5000000
      },
      {
        id: 'proj-2',
        name: 'Renovación Centro Comercial',
        description: 'Renovación completa del centro comercial',
        status: 'active',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        budget: 2000000
      }
    ];

    const mockTasks: IntegrationTask[] = [
      {
        id: 'task-1',
        title: 'Revisión de Planos Estructurales',
        description: 'Revisar y aprobar planos estructurales del proyecto',
        status: 'in_progress',
        priority: 'high',
        assignee: 'Juan Pérez',
        dueDate: new Date('2024-02-15'),
        projectId: 'proj-1'
      },
      {
        id: 'task-2',
        title: 'Aprobación de Presupuesto',
        description: 'Revisar y aprobar presupuesto del proyecto',
        status: 'pending',
        priority: 'medium',
        assignee: 'María García',
        dueDate: new Date('2024-02-20'),
        projectId: 'proj-1'
      }
    ];

    const mockBudgets: IntegrationBudget[] = [
      {
        id: 'budget-1',
        name: 'Presupuesto Construcción Torre A',
        totalAmount: 5000000,
        usedAmount: 1500000,
        remainingAmount: 3500000,
        status: 'active',
        projectId: 'proj-1'
      },
      {
        id: 'budget-2',
        name: 'Presupuesto Renovación Centro Comercial',
        totalAmount: 2000000,
        usedAmount: 800000,
        remainingAmount: 1200000,
        status: 'active',
        projectId: 'proj-2'
      }
    ];

    setProjects(mockProjects);
    setTasks(mockTasks);
    setBudgets(mockBudgets);
  };

  const addIntegration = async (type: 'project' | 'task' | 'budget', targetId: string, targetName: string) => {
    const newIntegration: DocumentIntegration = {
      id: `int-${Date.now()}`,
      documentId: document.id,
      type,
      targetId,
      targetName,
      targetType: type,
      status: 'linked',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setIntegrations(prev => [...prev, newIntegration]);
    
    if (onIntegrationUpdate) {
      onIntegrationUpdate([...integrations, newIntegration]);
    }
  };

  const removeIntegration = async (integrationId: string) => {
    setIntegrations(prev => prev.filter(int => int.id !== integrationId));
    
    if (onIntegrationUpdate) {
      onIntegrationUpdate(integrations.filter(int => int.id !== integrationId));
    }
  };

  const exportIntegration = async (integration: DocumentIntegration, format: string) => {
    try {
      // Simular exportación
      const exportData = {
        integration,
        document,
        timestamp: new Date().toISOString()
      };

      const dataStr = format === 'json' ? JSON.stringify(exportData, null, 2) : 
                     format === 'xml' ? jsonToXml(exportData) :
                     format === 'csv' ? jsonToCsv(exportData) : '';

      const blob = new Blob([dataStr], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `integration-${integration.id}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting integration:', error);
    }
  };

  const jsonToXml = (obj: any): string => {
    // Implementación simple de JSON a XML
    return `<root>${JSON.stringify(obj)}</root>`;
  };

  const jsonToCsv = (obj: any): string => {
    // Implementación simple de JSON a CSV
    return 'data,values\n' + Object.entries(obj).map(([key, value]) => `${key},${value}`).join('\n');
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.targetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || integration.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'linked':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-100 text-blue-800';
      case 'task':
        return 'bg-green-100 text-green-800';
      case 'budget':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Integraciones del Documento</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadIntegrations()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva Integración
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Agregar Nueva Integración</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="projects" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="projects">Proyectos</TabsTrigger>
                    <TabsTrigger value="tasks">Tareas</TabsTrigger>
                    <TabsTrigger value="budgets">Presupuestos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="projects" className="space-y-4">
                    <div className="grid gap-4">
                      {projects.map(project => (
                        <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-gray-600">{project.description}</p>
                            <Badge variant="outline">{project.status}</Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              addIntegration('project', project.id, project.name);
                              setShowAddDialog(false);
                            }}
                            disabled={integrations.some(int => int.targetId === project.id)}
                          >
                            <Link className="h-4 w-4 mr-1" />
                            Vincular
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="space-y-4">
                    <div className="grid gap-4">
                      {tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{task.status}</Badge>
                              <Badge variant="secondary">{task.priority}</Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              addIntegration('task', task.id, task.title);
                              setShowAddDialog(false);
                            }}
                            disabled={integrations.some(int => int.targetId === task.id)}
                          >
                            <Link className="h-4 w-4 mr-1" />
                            Vincular
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="budgets" className="space-y-4">
                    <div className="grid gap-4">
                      {budgets.map(budget => (
                        <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{budget.name}</h4>
                            <p className="text-sm text-gray-600">
                              Total: ${budget.totalAmount.toLocaleString()} | 
                              Usado: ${budget.usedAmount.toLocaleString()} | 
                              Restante: ${budget.remainingAmount.toLocaleString()}
                            </p>
                            <Badge variant="outline">{budget.status}</Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              addIntegration('budget', budget.id, budget.name);
                              setShowAddDialog(false);
                            }}
                            disabled={integrations.some(int => int.targetId === budget.id)}
                          >
                            <Link className="h-4 w-4 mr-1" />
                            Vincular
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar integraciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="project">Proyectos</SelectItem>
              <SelectItem value="task">Tareas</SelectItem>
              <SelectItem value="budget">Presupuestos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredIntegrations.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No se encontraron integraciones. Crea una nueva integración para vincular este documento con proyectos, tareas o presupuestos.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {filteredIntegrations.map(integration => (
              <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(integration.status)}
                  <div>
                    <h4 className="font-medium">{integration.targetName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeColor(integration.type)}>
                        {integration.type === 'project' ? 'Proyecto' :
                         integration.type === 'task' ? 'Tarea' :
                         integration.type === 'budget' ? 'Presupuesto' : integration.type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Vinculado el {new Date(integration.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportIntegration(integration, exportFormat)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                  
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIntegration(integration.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">API de Integración</h4>
          <p className="text-sm text-gray-600 mb-3">
            Utiliza nuestra API REST para integraciones externas y webhooks para notificaciones.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver Documentación API
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Configurar Webhooks
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};