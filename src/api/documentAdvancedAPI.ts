import { 
  Document, 
  DocumentVersion, 
  DocumentAnnotation, 
  DocumentCollaborator,
  DocumentIntegration,
  IntegrationProject,
  IntegrationTask,
  IntegrationBudget,
  SecurityRole,
  SecurityRule,
  AccessLog,
  CollaborativeAnnotation,
  CollaborativeSession,
  VersionBranch,
  VersionMerge,
  MergeConflict,
  VersionTag,
  WorkflowTemplate,
  WorkflowStage,
  WorkflowInstance,
  DocumentAnalytics,
  DocumentClassificationML,
  OCRResult,
  SmartNotification,
  DocumentBackup,
  DisasterRecoveryPlan
} from '@/types/documents';

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generar IDs únicos
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const documentAdvancedAPI = {
  // ===== INTEGRACIONES CON OTRAS HERRAMIENTAS =====
  
  // Gestión de integraciones
  async getIntegrations(documentId: string): Promise<DocumentIntegration[]> {
    await delay(300);
    return [
      {
        id: 'int-1',
        name: 'Proyecto Construcción Torre A',
        type: 'project',
        status: 'active',
        documentId,
        externalId: 'proj-123',
        externalData: {
          projectName: 'Torre A Residencial',
          projectManager: 'Juan Pérez',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        syncSettings: {
          autoSync: true,
          syncInterval: 3600,
          lastSync: new Date(),
          syncDirection: 'bidirectional'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'int-2',
        name: 'Tarea: Revisión de Planos',
        type: 'task',
        status: 'active',
        documentId,
        externalId: 'task-456',
        externalData: {
          taskName: 'Revisión de Planos Estructurales',
          assignedTo: 'María García',
          dueDate: '2024-02-15',
          priority: 'high'
        },
        syncSettings: {
          autoSync: true,
          syncInterval: 1800,
          lastSync: new Date(),
          syncDirection: 'bidirectional'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  },

  async createIntegration(integration: Partial<DocumentIntegration>): Promise<DocumentIntegration> {
    await delay(400);
    const newIntegration: DocumentIntegration = {
      id: generateId(),
      name: integration.name || '',
      type: integration.type || 'project',
      status: 'pending',
      documentId: integration.documentId || '',
      externalId: integration.externalId || '',
      externalData: integration.externalData || {},
      syncSettings: {
        autoSync: true,
        syncInterval: 3600,
        lastSync: new Date(),
        syncDirection: 'bidirectional',
        ...integration.syncSettings
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return newIntegration;
  },

  async updateIntegration(integrationId: string, updates: Partial<DocumentIntegration>): Promise<DocumentIntegration> {
    await delay(300);
    return {
      id: integrationId,
      name: updates.name || 'Updated Integration',
      type: updates.type || 'project',
      status: updates.status || 'active',
      documentId: updates.documentId || 'doc-1',
      externalId: updates.externalId || '',
      externalData: updates.externalData || {},
      syncSettings: updates.syncSettings || {
        autoSync: true,
        syncInterval: 3600,
        lastSync: new Date(),
        syncDirection: 'bidirectional'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  async deleteIntegration(integrationId: string): Promise<void> {
    await delay(300);
    console.log(`Integration ${integrationId} deleted`);
  },

  // Integración con proyectos
  async getIntegrationProjects(): Promise<IntegrationProject[]> {
    await delay(250);
    return [
      {
        id: 'proj-1',
        name: 'Proyecto Construcción Torre A',
        description: 'Construcción de torre residencial de 25 pisos',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        projectManager: 'Juan Pérez',
        budget: 5000000,
        currency: 'USD',
        progress: 35,
        documents: ['doc-1', 'doc-2', 'doc-3'],
        tasks: ['task-1', 'task-2', 'task-3'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  },

  async linkDocumentToProject(documentId: string, projectId: string): Promise<void> {
    await delay(200);
    console.log(`Document ${documentId} linked to project ${projectId}`);
  },

  // Integración con tareas
  async getIntegrationTasks(): Promise<IntegrationTask[]> {
    await delay(250);
    return [
      {
        id: 'task-1',
        title: 'Revisión de Planos Estructurales',
        description: 'Revisar y aprobar planos estructurales del proyecto',
        status: 'pending',
        priority: 'high',
        assignedTo: 'María García',
        dueDate: '2024-02-15',
        projectId: 'proj-1',
        documents: ['doc-1'],
        progress: 0,
        estimatedHours: 8,
        actualHours: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  },

  async linkDocumentToTask(documentId: string, taskId: string): Promise<void> {
    await delay(200);
    console.log(`Document ${documentId} linked to task ${taskId}`);
  },

  // Integración con presupuestos
  async getIntegrationBudgets(): Promise<IntegrationBudget[]> {
    await delay(250);
    return [
      {
        id: 'budget-1',
        name: 'Presupuesto Construcción Torre A',
        description: 'Presupuesto general del proyecto',
        totalAmount: 5000000,
        currency: 'USD',
        allocatedAmount: 1750000,
        remainingAmount: 3250000,
        projectId: 'proj-1',
        documents: ['doc-1'],
        status: 'approved',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  },

  async linkDocumentToBudget(documentId: string, budgetId: string): Promise<void> {
    await delay(200);
    console.log(`Document ${documentId} linked to budget ${budgetId}`);
  },

  // Exportación a múltiples formatos
  async exportDocument(documentId: string, format: string): Promise<Blob> {
    await delay(500);
    
    // Simular diferentes formatos de exportación
    const content = `Document content exported as ${format}`;
    return new Blob([content], { type: getMimeType(format) });
  },

  // Webhooks para notificaciones externas
  async setupWebhook(event: string, url: string, secret: string): Promise<void> {
    await delay(300);
    console.log(`Webhook setup for event ${event} to ${url}`);
  },

  // ===== SEGURIDAD Y PERMISOS AVANZADOS =====

  // Gestión de roles
  async getSecurityRoles(documentId: string): Promise<SecurityRole[]> {
    await delay(300);
    return [
      {
        id: 'role-1',
        name: 'Admin',
        description: 'Administrador con todos los permisos',
        permissions: ['read', 'write', 'delete', 'share', 'admin'],
        level: 1,
        isSystem: true,
        documentId,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'role-2',
        name: 'Manager',
        description: 'Gerente con permisos de gestión',
        permissions: ['read', 'write', 'share', 'approve'],
        level: 2,
        isSystem: false,
        documentId,
        createdAt: new Date(),
        createdBy: 'admin'
      },
      {
        id: 'role-3',
        name: 'Editor',
        description: 'Editor con permisos de edición',
        permissions: ['read', 'write'],
        level: 3,
        isSystem: false,
        documentId,
        createdAt: new Date(),
        createdBy: 'admin'
      },
      {
        id: 'role-4',
        name: 'Viewer',
        description: 'Visualizador con permisos de lectura',
        permissions: ['read'],
        level: 4,
        isSystem: false,
        documentId,
        createdAt: new Date(),
        createdBy: 'admin'
      }
    ];
  },

  async createSecurityRole(role: Partial<SecurityRole>): Promise<SecurityRole> {
    await delay(400);
    return {
      id: generateId(),
      name: role.name || '',
      description: role.description || '',
      permissions: role.permissions || ['read'],
      level: role.level || 5,
      isSystem: false,
      documentId: role.documentId || '',
      createdAt: new Date(),
      createdBy: 'current-user'
    };
  },

  // Reglas de seguridad
  async getSecurityRules(documentId: string): Promise<SecurityRule[]> {
    await delay(300);
    return [
      {
        id: 'rule-1',
        name: 'Encriptación de documentos sensibles',
        type: 'encryption',
        condition: 'document.confidentiality === "secret"',
        action: 'encrypt',
        isActive: true,
        documentId,
        createdAt: new Date(),
        createdBy: 'admin'
      },
      {
        id: 'rule-2',
        name: 'Restricción por ubicación geográfica',
        type: 'geo-restriction',
        condition: 'user.location !== "approved-country"',
        action: 'block',
        isActive: true,
        documentId,
        createdAt: new Date(),
        createdBy: 'admin'
      }
    ];
  },

  async createSecurityRule(rule: Partial<SecurityRule>): Promise<SecurityRule> {
    await delay(400);
    return {
      id: generateId(),
      name: rule.name || '',
      type: rule.type || 'access',
      condition: rule.condition || '',
      action: rule.action || 'allow',
      isActive: rule.isActive ?? true,
      documentId: rule.documentId || '',
      createdAt: new Date(),
      createdBy: 'current-user'
    };
  },

  // Auditoría de accesos
  async getAccessLogs(documentId: string, limit: number = 50): Promise<AccessLog[]> {
    await delay(300);
    return Array.from({ length: limit }, (_, i) => ({
      id: `log-${i}`,
      userId: `user-${Math.floor(Math.random() * 5) + 1}`,
      userName: ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez'][Math.floor(Math.random() * 5)],
      userEmail: ['juan@example.com', 'maria@example.com', 'carlos@example.com', 'ana@example.com', 'luis@example.com'][Math.floor(Math.random() * 5)],
      action: ['view', 'download', 'edit', 'share'][Math.floor(Math.random() * 4)],
      resource: documentId,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: {
        country: ['US', 'MX', 'ES', 'AR', 'CO'][Math.floor(Math.random() * 5)],
        city: ['New York', 'México City', 'Madrid', 'Buenos Aires', 'Bogotá'][Math.floor(Math.random() * 5)],
        coordinates: {
          latitude: Math.random() * 180 - 90,
          longitude: Math.random() * 360 - 180
        }
      },
      success: Math.random() > 0.1, // 90% de éxito
      metadata: {
        duration: Math.floor(Math.random() * 300), // 0-300 segundos
        bytesTransferred: Math.floor(Math.random() * 1000000)
      }
    }));
  },

  // Encriptación de documentos
  async encryptDocument(documentId: string, encryptionKey: string): Promise<void> {
    await delay(600);
    console.log(`Document ${documentId} encrypted with key`);
  },

  async decryptDocument(documentId: string, encryptionKey: string): Promise<Blob> {
    await delay(600);
    return new Blob(['Decrypted document content'], { type: 'application/pdf' });
  },

  // Aprobaciones multi-nivel
  async requestMultiLevelApproval(documentId: string, approvers: string[]): Promise<string> {
    await delay(400);
    return `approval-${generateId()}`;
  },

  // ===== EDICIÓN Y ANOTACIONES COLABORATIVAS =====

  // Gestión de anotaciones colaborativas
  async getCollaborativeAnnotations(documentId: string, versionId: string): Promise<CollaborativeAnnotation[]> {
    await delay(300);
    return [
      {
        id: 'collab-anno-1',
        documentId,
        versionId,
        type: 'text',
        content: 'Este es un comentario colaborativo',
        position: { x: 100, y: 200, page: 1 },
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
            annotationId: 'collab-anno-1',
            content: 'Estoy de acuerdo con este comentario',
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
      }
    ];
  },

  async createCollaborativeAnnotation(annotation: Partial<CollaborativeAnnotation>): Promise<CollaborativeAnnotation> {
    await delay(400);
    return {
      id: generateId(),
      documentId: annotation.documentId || '',
      versionId: annotation.versionId || '',
      type: annotation.type || 'text',
      content: annotation.content || '',
      position: annotation.position || { x: 0, y: 0, page: 1 },
      style: annotation.style || { color: '#FF0000' },
      author: annotation.author || {
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
  },

  async updateCollaborativeAnnotation(annotationId: string, updates: Partial<CollaborativeAnnotation>): Promise<CollaborativeAnnotation> {
    await delay(300);
    return {
      id: annotationId,
      documentId: updates.documentId || 'doc-1',
      versionId: updates.versionId || 'v1',
      type: updates.type || 'text',
      content: updates.content || 'Updated content',
      position: updates.position || { x: 0, y: 0, page: 1 },
      style: updates.style || { color: '#FF0000' },
      author: updates.author || {
        id: 'current-user',
        name: 'Usuario Actual',
        email: 'user@example.com'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      resolved: updates.resolved || false,
      replies: updates.replies || [],
      permissions: updates.permissions || {
        canEdit: true,
        canDelete: true,
        canReply: true
      }
    };
  },

  async addReplyToAnnotation(annotationId: string, reply: { content: string; author: any }): Promise<void> {
    await delay(300);
    console.log(`Reply added to annotation ${annotationId}`);
  },

  // Sesiones colaborativas en tiempo real
  async createCollaborativeSession(documentId: string, versionId: string): Promise<CollaborativeSession> {
    await delay(400);
    return {
      id: `session-${generateId()}`,
      documentId,
      versionId,
      participants: [
        {
          userId: 'user-1',
          userName: 'Juan Pérez',
          userEmail: 'juan@example.com',
          role: 'editor',
          joinedAt: new Date(),
          lastActivity: new Date(),
          cursor: { x: 100, y: 200, page: 1 }
        }
      ],
      isActive: true,
      createdAt: new Date()
    };
  },

  async joinCollaborativeSession(sessionId: string, user: any): Promise<void> {
    await delay(300);
    console.log(`User ${user.name} joined session ${sessionId}`);
  },

  async leaveCollaborativeSession(sessionId: string, userId: string): Promise<void> {
    await delay(300);
    console.log(`User ${userId} left session ${sessionId}`);
  },

  // Herramientas de dibujo avanzadas
  async saveDrawingAnnotation(annotationId: string, drawingData: string): Promise<void> {
    await delay(300);
    console.log(`Drawing annotation ${annotationId} saved`);
  },

  // Reconocimiento de firmas digitales
  async verifyDigitalSignature(documentId: string, signatureData: any): Promise<boolean> {
    await delay(800);
    return Math.random() > 0.1; // 90% de verificación exitosa
  },

  // ===== CONTROL AVANZADO DE VERSIONES =====

  // Gestión de ramas
  async getVersionBranches(documentId: string): Promise<VersionBranch[]> {
    await delay(300);
    return [
      {
        id: 'branch-1',
        name: 'main',
        documentId,
        isProtected: true,
        isDefault: true,
        lastCommit: 'v2',
        createdAt: new Date('2024-01-01'),
        createdBy: 'Juan Pérez',
        description: 'Rama principal de desarrollo'
      },
      {
        id: 'branch-2',
        name: 'feature/new-design',
        documentId,
        isProtected: false,
        isDefault: false,
        lastCommit: 'v3',
        createdAt: new Date('2024-01-20'),
        createdBy: 'Carlos López',
        description: 'Nuevo diseño de interfaz'
      }
    ];
  },

  async createVersionBranch(branch: Partial<VersionBranch>): Promise<VersionBranch> {
    await delay(400);
    return {
      id: generateId(),
      name: branch.name || '',
      documentId: branch.documentId || '',
      isProtected: branch.isProtected || false,
      isDefault: branch.isDefault || false,
      lastCommit: branch.lastCommit || '',
      createdAt: new Date(),
      createdBy: branch.createdBy || 'current-user',
      description: branch.description || ''
    };
  },

  async mergeBranches(sourceBranch: string, targetBranch: string, options: any): Promise<VersionMerge> {
    await delay(600);
    return {
      id: generateId(),
      sourceBranch,
      targetBranch,
      mergedBy: 'current-user',
      mergedAt: new Date(),
      conflicts: [],
      status: 'success',
      mergeStrategy: options.strategy || 'recursive'
    };
  },

  // Gestión de etiquetas
  async getVersionTags(documentId: string): Promise<VersionTag[]> {
    await delay(300);
    return [
      {
        id: 'tag-1',
        name: 'v1.0.0',
        description: 'Primera versión estable',
        versionId: 'v1',
        documentId,
        createdAt: new Date('2024-01-01'),
        createdBy: 'Juan Pérez'
      }
    ];
  },

  async createVersionTag(tag: Partial<VersionTag>): Promise<VersionTag> {
    await delay(400);
    return {
      id: generateId(),
      name: tag.name || '',
      description: tag.description || '',
      versionId: tag.versionId || '',
      documentId: tag.documentId || '',
      createdAt: new Date(),
      createdBy: tag.createdBy || 'current-user'
    };
  },

  // Comparación de versiones
  async compareVersions(versionId1: string, versionId2: string): Promise<any> {
    await delay(500);
    return {
      added: 3,
      modified: 5,
      deleted: 1,
      conflicts: [],
      diff: 'Version comparison result'
    };
  },

  // Rollback de versiones
  async rollbackToVersion(documentId: string, versionId: string): Promise<void> {
    await delay(800);
    console.log(`Document ${documentId} rolled back to version ${versionId}`);
  },

  // ===== ANALÍTICAS Y MACHINE LEARNING =====

  // Analytics de documentos
  async getDocumentAnalytics(documentId: string, timeRange: string): Promise<DocumentAnalytics> {
    await delay(400);
    return {
      documentId,
      timeRange,
      views: Math.floor(Math.random() * 1000),
      downloads: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50),
      annotations: Math.floor(Math.random() * 30),
      collaborators: Math.floor(Math.random() * 20),
      averageTimeSpent: Math.floor(Math.random() * 300) + 60,
      topContributors: [
        { userId: 'user-1', name: 'Juan Pérez', contributions: 25 },
        { userId: 'user-2', name: 'María García', contributions: 18 }
      ],
      usageByTime: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        views: Math.floor(Math.random() * 50)
      })),
      popularSections: [
        { section: 'Introducción', views: 150 },
        { section: 'Metodología', views: 120 },
        { section: 'Resultados', views: 200 }
      ],
      generatedAt: new Date()
    };
  },

  // Clasificación automática con ML
  async classifyDocument(documentId: string): Promise<DocumentClassificationML> {
    await delay(1000);
    return {
      documentId,
      categories: [
        { category: 'Construction', confidence: 0.85 },
        { category: 'Architecture', confidence: 0.72 },
        { category: 'Engineering', confidence: 0.68 }
      ],
      tags: [
        { tag: 'building', confidence: 0.91 },
        { tag: 'residential', confidence: 0.84 },
        { tag: 'design', confidence: 0.76 }
      ],
      confidence: 0.82,
      modelVersion: 'v2.1.0',
      processingTime: 1250,
      processedAt: new Date()
    };
  },

  async trainClassificationModel(trainingData: any[]): Promise<void> {
    await delay(2000);
    console.log('Classification model trained with', trainingData.length, 'samples');
  },

  // OCR avanzado
  async performOCR(documentId: string): Promise<OCRResult> {
    await delay(1500);
    return {
      documentId,
      text: 'Este es el texto extraído del documento mediante OCR avanzado.',
      confidence: 0.94,
      pages: [
        {
          pageNumber: 1,
          text: 'Texto de la página 1',
          confidence: 0.95
        }
      ],
      language: 'es',
      processingTime: 1450,
      processedAt: new Date(),
      searchable: true
    };
  },

  async searchInOCRText(documentId: string, query: string): Promise<any[]> {
    await delay(400);
    return [
      {
        pageNumber: 1,
        text: 'Texto encontrado',
        position: { x: 100, y: 200 },
        confidence: 0.92
      }
    ];
  },

  // ===== NOTIFICACIONES INTELIGENTES =====

  async getSmartNotifications(userId: string): Promise<SmartNotification[]> {
    await delay(300);
    return [
      {
        id: 'notif-1',
        userId,
        type: 'document-update',
        title: 'Documento actualizado',
        message: 'El documento "Planos Estructurales" ha sido actualizado',
        priority: 'medium',
        isRead: false,
        actionUrl: '/documents/doc-1',
        metadata: {
          documentId: 'doc-1',
          version: '2.0.0',
          updatedBy: 'Juan Pérez'
        },
        scheduledFor: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date()
      }
    ];
  },

  async createSmartNotification(notification: Partial<SmartNotification>): Promise<SmartNotification> {
    await delay(400);
    return {
      id: generateId(),
      userId: notification.userId || '',
      type: notification.type || 'info',
      title: notification.title || '',
      message: notification.message || '',
      priority: notification.priority || 'low',
      isRead: false,
      actionUrl: notification.actionUrl || '',
      metadata: notification.metadata || {},
      scheduledFor: notification.scheduledFor || new Date(),
      expiresAt: notification.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date()
    };
  },

  // ===== BACKUP Y RECUPERACIÓN DE DESASTRES =====

  async createBackup(documentId: string): Promise<DocumentBackup> {
    await delay(1000);
    return {
      id: `backup-${generateId()}`,
      documentId,
      backupType: 'full',
      size: Math.floor(Math.random() * 1000000) + 100000,
      location: 's3://backups/documents/',
      checksum: 'sha256:abc123def456',
      status: 'completed',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      metadata: {
        versions: ['v1', 'v2'],
        annotations: 15,
        collaborators: 5
      }
    };
  },

  async getBackupHistory(documentId: string): Promise<DocumentBackup[]> {
    await delay(400);
    return [
      {
        id: 'backup-1',
        documentId,
        backupType: 'full',
        size: 1024000,
        location: 's3://backups/documents/',
        checksum: 'sha256:abc123def456',
        status: 'completed',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
        metadata: {
          versions: ['v1', 'v2'],
          annotations: 15,
          collaborators: 5
        }
      }
    ];
  },

  async restoreFromBackup(backupId: string): Promise<void> {
    await delay(2000);
    console.log(`Document restored from backup ${backupId}`);
  },

  async getDisasterRecoveryPlan(): Promise<DisasterRecoveryPlan> {
    await delay(500);
    return {
      id: 'drp-1',
      name: 'Plan de Recuperación de Desastres Principal',
      description: 'Plan principal para recuperación ante desastres',
      rto: 4, // Recovery Time Objective: 4 horas
      rpo: 1, // Recovery Point Objective: 1 hora
      backupStrategy: '3-2-1',
      storageLocations: [
        'primary-datacenter',
        'secondary-datacenter',
        'cloud-storage'
      ],
      testingSchedule: 'monthly',
      lastTested: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      contactInfo: {
        primary: 'admin@company.com',
        secondary: 'backup-admin@company.com',
        emergency: '+1-555-0123'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  async testDisasterRecovery(): Promise<{ success: boolean; details: any }> {
    await delay(3000);
    return {
      success: true,
      details: {
        backupIntegrity: 'verified',
        restoreTime: '2.5 hours',
        dataIntegrity: '100%',
        testedComponents: ['database', 'files', 'configurations']
      }
    };
  }
};

// Función auxiliar para obtener MIME types
function getMimeType(format: string): string {
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
    'json': 'application/json',
    'xml': 'application/xml'
  };
  return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
}

// Wrappers con exports nombrados para compatibilidad con DocumentsPage

export const documentVersionAPI = {
  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    // Simulación básica de versiones
    return [
      {
        id: 'v1',
        documentId,
        version: '1.0.0',
        fileSize: 1024,
        createdAt: new Date(),
        isCurrent: false,
        status: 'published'
      },
      {
        id: 'v2',
        documentId,
        version: '1.1.0',
        fileSize: 2048,
        createdAt: new Date(),
        isCurrent: true,
        status: 'published'
      }
    ];
  },
  async restoreVersion(documentId: string, versionId: string): Promise<void> {
    // Simular restauración
    await delay(300);
    console.log(`Restore version ${versionId} for document ${documentId}`);
  },
  async compareVersions(versionId1: string, versionId2: string): Promise<any> {
    return documentAdvancedAPI.compareVersions(versionId1, versionId2);
  },
  async tagVersion(versionId: string, tag: string): Promise<VersionTag> {
    return documentAdvancedAPI.createVersionTag({ name: tag, versionId, branchId: 'main', createdBy: 'system', createdAt: new Date(), isRelease: false });
  }
};

export const documentAnnotationAPI = {
  async getAnnotations(documentId: string, versionId?: string): Promise<DocumentAnnotation[]> {
    // Adaptar a colaborativas si existe versión
    const anns = await documentAdvancedAPI.getCollaborativeAnnotations(documentId, versionId || '');
    // Convertir a DocumentAnnotation simple
    return anns.map(a => ({
      id: a.id,
      documentId: a.documentId,
      versionId: a.versionId,
      type: a.type === 'text' ? 'comment' : (a.type as any),
      content: a.content,
      position: { x: a.position.x, y: a.position.y, width: a.position.width, height: a.position.height },
      page: a.position.page,
      author: a.author.name,
      createdAt: a.createdAt,
      color: a.style?.color,
      resolved: a.resolved
    }));
  },
  async addAnnotation(documentId: string, annotation: DocumentAnnotation): Promise<DocumentAnnotation> {
    await delay(200);
    // Convertir a anotación colaborativa mínima
    await documentAdvancedAPI.createCollaborativeAnnotation({
      documentId,
      versionId: annotation.versionId,
      type: (annotation.type as any),
      content: annotation.content,
      position: { x: annotation.position.x, y: annotation.position.y, page: annotation.page },
      author: { id: 'current-user', name: annotation.author, email: '' },
      resolved: !!annotation.resolved,
      replies: [],
      permissions: { canEdit: true, canDelete: true, canReply: true },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return annotation;
  }
};

export const documentSharingAPI = {
  async getCollaborators(documentId: string): Promise<DocumentCollaborator[]> {
    // Simulación básica
    await delay(200);
    return [
      {
        id: 'collab-1',
        documentId,
        userId: 'user-1',
        userName: 'Juan Pérez',
        userEmail: 'juan@example.com',
        role: 'editor',
        permissions: { view: true, edit: true, delete: false, share: true, download: true, print: true, comment: true, annotate: true },
        grantedBy: 'system',
        grantedAt: new Date().toISOString(),
        isActive: true
      }
    ];
  },
  async addCollaborator(documentId: string, collaborator: DocumentCollaborator): Promise<void> {
    await delay(200);
    console.log('Add collaborator', documentId, collaborator);
  },
  async removeCollaborator(documentId: string, collaboratorId: string): Promise<void> {
    await delay(200);
    console.log('Remove collaborator', documentId, collaboratorId);
  }
};

export const documentSecurityAPI = {
  async getAccessLogs(documentId: string) {
    return documentAdvancedAPI.getAccessLogs(documentId);
  },
  async getSecurityRules(documentId: string) {
    return documentAdvancedAPI.getSecurityRules(documentId);
  },
  async updatePermissions(documentId: string, permissions: any): Promise<void> {
    await delay(200);
    console.log('Update permissions', documentId, permissions);
  },
  async logAccess(documentId: string, action: string): Promise<void> {
    await delay(100);
    console.log('Log access', documentId, action);
  }
};

export const documentIntegrationAPI = {
  async exportToFormat(documentId: string, format: string): Promise<Blob> {
    return documentAdvancedAPI.exportDocument(documentId, format);
  },
  async linkToProject(documentId: string, projectId: string): Promise<void> {
    return documentAdvancedAPI.linkDocumentToProject(documentId, projectId);
  },
  async linkToTask(documentId: string, taskId: string): Promise<void> {
    return documentAdvancedAPI.linkDocumentToTask(documentId, taskId);
  },
  async linkToBudget(documentId: string, budgetId: string): Promise<void> {
    return documentAdvancedAPI.linkDocumentToBudget(documentId, budgetId);
  },
  async getIntegrationStatus(documentId: string): Promise<any> {
    // Simulación
    return { documentId, lastSync: new Date() };
  }
};

export default documentAdvancedAPI;