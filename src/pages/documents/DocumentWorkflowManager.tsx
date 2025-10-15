import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  AlertCircle,
  ArrowRight,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { 
  WorkflowTemplate, 
  WorkflowStage, 
  WorkflowInstance, 
  WorkflowStageInstance,
  WorkflowDecision,
  Document 
} from '@/types/documents';

interface DocumentWorkflowManagerProps {
  document: Document;
  onWorkflowUpdate?: (workflow: WorkflowInstance) => void;
}

const DocumentWorkflowManager: React.FC<DocumentWorkflowManagerProps> = ({ 
  document, 
  onWorkflowUpdate 
}) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowInstance | null>(null);
  const [stages, setStages] = useState<WorkflowStageInstance[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const mockTemplates: WorkflowTemplate[] = [
    {
      id: '1',
      name: 'Document Review',
      description: 'Standard document review process',
      stages: [
        { id: '1', name: 'Draft', order: 1, required: true, autoApprove: false },
        { id: '2', name: 'Review', order: 2, required: true, autoApprove: false },
        { id: '3', name: 'Approval', order: 3, required: true, autoApprove: false },
        { id: '4', name: 'Final', order: 4, required: true, autoApprove: true }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Legal Approval',
      description: 'Legal document approval workflow',
      stages: [
        { id: '1', name: 'Legal Review', order: 1, required: true, autoApprove: false },
        { id: '2', name: 'Senior Review', order: 2, required: true, autoApprove: false },
        { id: '3', name: 'Final Approval', order: 3, required: true, autoApprove: false }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockWorkflow: WorkflowInstance = {
    id: 'wf1',
    documentId: document.id,
    templateId: '1',
    currentStageId: '2',
    status: 'in_progress',
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockStages: WorkflowStageInstance[] = [
    {
      id: 'stage1',
      workflowId: 'wf1',
      stageId: '1',
      status: 'completed',
      assignedTo: 'user1',
      startedAt: new Date(Date.now() - 86400000),
      completedAt: new Date(Date.now() - 82800000),
      decisions: [{
        id: 'dec1',
        stageId: 'stage1',
        decision: 'approve',
        comment: 'Initial draft completed',
        madeBy: 'user1',
        createdAt: new Date(Date.now() - 82800000)
      }]
    },
    {
      id: 'stage2',
      workflowId: 'wf1',
      stageId: '2',
      status: 'in_progress',
      assignedTo: 'user2',
      startedAt: new Date(Date.now() - 82800000),
      completedAt: null,
      decisions: []
    },
    {
      id: 'stage3',
      workflowId: 'wf1',
      stageId: '3',
      status: 'pending',
      assignedTo: 'user3',
      startedAt: null,
      completedAt: null,
      decisions: []
    }
  ];

  useEffect(() => {
    setTemplates(mockTemplates);
    setActiveWorkflow(mockWorkflow);
    setStages(mockStages);
  }, [document.id]);

  const createWorkflow = async () => {
    if (!selectedTemplate) return;
    
    setIsCreatingWorkflow(true);
    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        const newWorkflow: WorkflowInstance = {
          id: `wf_${Date.now()}`,
          documentId: document.id,
          templateId: selectedTemplate,
          currentStageId: template.stages[0]?.id || '',
          status: 'in_progress',
          startedAt: new Date(),
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const newStages: WorkflowStageInstance[] = template.stages.map(stage => ({
          id: `stage_${Date.now()}_${stage.id}`,
          workflowId: newWorkflow.id,
          stageId: stage.id,
          status: stage.order === 1 ? 'in_progress' : 'pending',
          assignedTo: '',
          startedAt: stage.order === 1 ? new Date() : null,
          completedAt: null,
          decisions: []
        }));
        
        setActiveWorkflow(newWorkflow);
        setStages(newStages);
        onWorkflowUpdate?.(newWorkflow);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  const makeDecision = async (stageId: string, decision: 'approve' | 'reject', comment?: string) => {
    const newDecision: WorkflowDecision = {
      id: `dec_${Date.now()}`,
      stageId,
      decision,
      comment: comment || '',
      madeBy: 'current-user',
      createdAt: new Date()
    };

    const updatedStages = stages.map(stage => {
      if (stage.id === stageId) {
        const updatedDecisions = [...stage.decisions, newDecision];
        const isApproved = decision === 'approve';
        
        return {
          ...stage,
          status: 'completed' as const,
          completedAt: new Date(),
          decisions: updatedDecisions
        };
      }
      return stage;
    });

    // Move to next stage
    const currentStageIndex = stages.findIndex(s => s.id === stageId);
    if (currentStageIndex < stages.length - 1 && decision === 'approve') {
      const nextStage = updatedStages[currentStageIndex + 1];
      updatedStages[currentStageIndex + 1] = {
        ...nextStage,
        status: 'in_progress' as const,
        startedAt: new Date()
      };

      if (activeWorkflow) {
        const updatedWorkflow = {
          ...activeWorkflow,
          currentStageId: nextStage.stageId
        };
        setActiveWorkflow(updatedWorkflow);
        onWorkflowUpdate?.(updatedWorkflow);
      }
    }

    setStages(updatedStages);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Document Workflow Manager
          </CardTitle>
          <CardDescription>
            Manage document approval workflows and track progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {!activeWorkflow ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No active workflow for this document</p>
                  <div className="max-w-md mx-auto">
                    <Label htmlFor="template-select">Select Workflow Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger id="template-select">
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      className="mt-4 w-full" 
                      onClick={createWorkflow}
                      disabled={!selectedTemplate || isCreatingWorkflow}
                    >
                      {isCreatingWorkflow ? 'Creating...' : 'Start Workflow'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{templates.find(t => t.id === activeWorkflow.templateId)?.name}</h3>
                      <p className="text-sm text-gray-600">Started: {activeWorkflow.startedAt.toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(activeWorkflow.status)}
                  </div>

                  <div className="space-y-3">
                    {stages.map((stage, index) => {
                      const stageTemplate = templates
                        .find(t => t.id === activeWorkflow.templateId)?.stages
                        .find(s => s.id === stage.stageId);
                      
                      return (
                        <div key={stage.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(stage.status)}
                            <span className="font-medium">{stageTemplate?.name}</span>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {stage.assignedTo || 'Unassigned'}
                            </span>
                          </div>

                          {stage.status === 'in_progress' && (
                            <div className="ml-auto flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => makeDecision(stage.id, 'approve', 'Approved')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => makeDecision(stage.id, 'reject', 'Needs changes')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-4">
                {templates.map(template => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {template.stages.map(stage => (
                          <div key={stage.id} className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{stage.order}.</span>
                            <span>{stage.name}</span>
                            {stage.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                            {stage.autoApprove && <Badge variant="secondary" className="text-xs">Auto-approve</Badge>}
                          </div>
                        ))}
                      </div>
                      <Button 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="text-center py-8 text-gray-600">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>Workflow history will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentWorkflowManager;