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
        documentId,
        type: 'project',
        targetId: 'proj-123',
        targetName: 'Proyecto Construcción Torre A',
        targetType: 'project',
        status: 'linked',
        metadata: {
          projectName: 'Torre A Residencial',
          projectManager: 'Juan Pérez',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'int-2',
        documentId,
        type: 'task',
        targetId: 'task-456',
        targetName: 'Tarea: Revisión de Planos',
        targetType: 'task',
        status: 'linked',
        metadata: {
          taskName: 'Revisión de Planos Estructurales',
          assignedTo: 'María García',
          dueDate: '2024-02-15',
          priority: 'high'
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
      documentId: integration.documentId || '',
      type: integration.type || 'project',
      targetId: integration.targetId || '',
      targetName: integration.targetName || '',
      targetType: integration.targetType || 'project',
      status: 'pending',
      metadata: integration.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return newIntegration;
  },

  async updateIntegration(integrationId: string, updates: Partial<DocumentIntegration>): Promise<DocumentIntegration> {
    await delay(300);
    return {
      id: integrationId,
      documentId: updates.documentId || 'doc-1',
      type: updates.type || 'project',
      targetId: updates.targetId || '',
      targetName: updates.targetName || 'Updated Integration',
      targetType: updates.targetType || 'project',
      status: updates.status || 'linked',
      metadata: updates.metadata || {},
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
        budget: 5000000,
        documents: []
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
        assignee: 'María García',
        dueDate: '2024-02-15',
        projectId: 'proj-1',
        documents: []
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
        totalAmount: 5000000,
        usedAmount: 1750000,
        remainingAmount: 3250000,
        status: 'active',
        projectId: 'proj-1',
        documents: []
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
        level: 1,
        permissions: {
          documents: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            share: true,
            annotate: true,
            version: true,
            export: true,
            print: true
          },
          admin: {
            manageUsers: true,
            manageRoles: true,
            manageSecurity: true,
            viewAuditLogs: true,
            manageIntegrations: true
          }
        },
        description: 'Administrador con todos los permisos',
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'role-2',
        name: 'Manager',
        level: 2,
        permissions: {
          documents: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            share: true,
            annotate: true,
            version: true,
            export: true,
            print: true
          },
          admin: {
            manageUsers: false,
            manageRoles: false,
            manageSecurity: false,
            viewAuditLogs: true,
            manageIntegrations: false
          }
        },
        description: 'Gerente con permisos de gestión',
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'role-3',
        name: 'Editor',
        level: 3,
        permissions: {
          documents: {
            view: true,
            create: true,
            edit: true,
            delete: false,
            share: false,
            annotate: true,
            version: false,
            export: true,
            print: true
          },
          admin: {
            manageUsers: false,
            manageRoles: false,
            manageSecurity: false,
            viewAuditLogs: false,
            manageIntegrations: false
          }
        },
        description: 'Editor con permisos de edición',
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'role-4',
        name: 'Viewer',
        level: 4,
        permissions: {
          documents: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            share: false,
            annotate: false,
            version: false,
            export: false,
            print: true
          },
          admin: {
            manageUsers: false,
            manageRoles: false,
            manageSecurity: false,
            viewAuditLogs: false,
            manageIntegrations: false
          }
        },
        description: 'Visualizador con permisos de lectura',
        isActive: true,
        createdAt: new Date()
      }
    ];
  },

  async createSecurityRole(role: Partial<SecurityRole>): Promise<SecurityRole> {
    await delay(400);
    return {
      id: generateId(),
      name: role.name || '',
      level: role.level || 5,
      permissions: role.permissions || {
        documents: {
          view: true,
          create: false,
          edit: false,
          delete: false,
          share: false,
          annotate: false,
          version: false,
          export: false,
          print: false
        },
        admin: {
          manageUsers: false,
          manageRoles: false,
          manageSecurity: false,
          viewAuditLogs: false,
          manageIntegrations: false
        }
      },
      description: role.description || '',
      isActive: true,
      createdAt: new Date()
    };
  },

  // Reglas de seguridad
  async getSecurityRules(documentId: string): Promise<SecurityRule[]> {
    await delay(300);
    return [
      {
        id: 'rule-1',
        name: 'Encriptación de documentos sensibles',
        type: 'document',
        targetId: documentId,
        conditions: {
          securityLevels: ['confidential', 'restricted']
        },
        actions: {
          allowAccess: true,
          requireApproval: false,
          requireMFA: true,
          encryptDocument: true,
          addWatermark: true
        },
        priority: 1,
        isActive: true,
        createdBy: 'admin',
        createdAt: new Date()
      },
      {
        id: 'rule-2',
        name: 'Restricción por ubicación geográfica',
        type: 'global',
        targetId: 'global',
        conditions: {
          locationRestrictions: {
            allowedCountries: ['US', 'MX', 'ES']
          }
        },
        actions: {
          allowAccess: false,
          requireApproval: true,
          requireMFA: false,
          encryptDocument: false,
          addWatermark: false
        },
        priority: 2,
        isActive: true,
        createdBy: 'admin',
        createdAt: new Date()
      }
    ];
  },

  async createSecurityRule(rule: Partial<SecurityRule>): Promise<SecurityRule> {
    await delay(400);
    return {
      id: generateId(),
      name: rule.name || '',
      type: rule.type || 'document',
      targetId: rule.targetId || '',
      conditions: rule.conditions || {},
      actions: rule.actions || {
        allowAccess: true,
        requireApproval: false,
        requireMFA: false,
        encryptDocument: false,
        addWatermark: false
      },
      priority: rule.priority || 10,
      isActive: rule.isActive ?? true,
      createdBy: rule.createdBy || 'current-user',
      createdAt: new Date()
    };
  },

  // Auditoría de accesos
  async getAccessLogs(documentId: string, limit: number = 50): Promise<AccessLog[]> {
    await delay(300);
    return Array.from({ length: limit }, (_, i) => ({
      id: `log-${i}`,
      documentId,
      userId: `user-${Math.floor(Math.random() * 5) + 1}`,
      userName: ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez'][Math.floor(Math.random() * 5)],
      userEmail: ['juan@example.com', 'maria@example.com', 'carlos@example.com', 'ana@example.com', 'luis@example.com'][Math.floor(Math.random() * 5)],
      action: ['view', 'download', 'edit', 'share'][Math.floor(Math.random() * 4)] as 'view' | 'edit' | 'download' | 'share',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: {
        country: ['US', 'MX', 'ES', 'AR', 'CO'][Math.floor(Math.random() * 5)],
        city: ['New York', 'México City', 'Madrid', 'Buenos Aires', 'Bogotá'][Math.floor(Math.random() * 5)],
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180
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
        isMain: true,
        isProtected: true,
        createdAt: new Date('2024-01-01'),
        createdBy: 'Juan Pérez',
        lastModified: new Date(),
        description: 'Rama principal de desarrollo',
        versions: []
      },
      {
        id: 'branch-2',
        name: 'feature/new-design',
        documentId,
        isMain: false,
        isProtected: false,
        createdAt: new Date('2024-01-20'),
        createdBy: 'Carlos López',
        lastModified: new Date(),
        description: 'Nuevo diseño de interfaz',
        versions: []
      }
    ];
  },

  async createVersionBranch(branch: Partial<VersionBranch>): Promise<VersionBranch> {
    await delay(400);
    return {
      id: generateId(),
      name: branch.name || '',
      documentId: branch.documentId || '',
      isMain: branch.isMain || false,
      isProtected: branch.isProtected || false,
      createdAt: new Date(),
      createdBy: branch.createdBy || 'current-user',
      lastModified: new Date(),
      description: branch.description || '',
      versions: branch.versions || []
    };
  },

  async mergeBranches(sourceBranch: string, targetBranch: string, options: any): Promise<VersionMerge> {
    await delay(600);
    return {
      id: generateId(),
      sourceBranch,
      targetBranch,
      sourceVersion: options.sourceVersion || 'v1',
      targetVersion: options.targetVersion || 'v2',
      mergedBy: 'current-user',
      mergedAt: new Date(),
      conflicts: [],
      status: 'completed'
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
        branchId: 'branch-1',
        createdAt: new Date('2024-01-01'),
        createdBy: 'Juan Pérez',
        isRelease: true
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
      branchId: tag.branchId || '',
      createdAt: new Date(),
      createdBy: tag.createdBy || 'current-user',
      isRelease: tag.isRelease || false
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
      id: generateId(),
      documentId,
      views: Math.floor(Math.random() * 1000),
      downloads: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50),
      annotations: Math.floor(Math.random() * 30),
      versions: Math.floor(Math.random() * 10),
      uniqueViewers: Math.floor(Math.random() * 50),
      averageViewTime: Math.floor(Math.random() * 300) + 60,
      lastAccessed: new Date(),
      accessByRole: {
        'admin': 25,
        'editor': 18,
        'viewer': 42
      },
      accessByDepartment: {
        'Engineering': 30,
        'Architecture': 25,
        'Management': 15
      },
      peakAccessTime: '14:00',
      geographicAccess: [
        { country: 'US', count: 50 },
        { country: 'MX', count: 30 },
        { country: 'ES', count: 20 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  // Clasificación automática con ML
  async classifyDocument(documentId: string): Promise<DocumentClassificationML> {
    await delay(1000);
    return {
      id: generateId(),
      documentId,
      predictedCategory: 'Construction',
      predictedTags: ['building', 'residential', 'design'],
      confidence: 0.82,
      modelVersion: 'v2.1.0',
      features: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000
      },
      createdAt: new Date()
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
      id: generateId(),
      documentId,
      content: 'Este es el texto extraído del documento mediante OCR avanzado.',
      pages: [
        {
          pageNumber: 1,
          text: 'Texto de la página 1',
          confidence: 0.95,
          blocks: [
            {
              text: 'Texto de la página 1',
              confidence: 0.95,
              bbox: { x: 0, y: 0, width: 100, height: 20 }
            }
          ]
        }
      ],
      language: 'es',
      confidence: 0.94,
      processingTime: 1450,
      engine: 'Tesseract',
      createdAt: new Date()
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
        type: 'version_update',
        title: 'Documento actualizado',
        message: 'El documento "Planos Estructurales" ha sido actualizado',
        relatedDocumentId: 'doc-1',
        priority: 'medium',
        isRead: false,
        actionRequired: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: {
          version: '2.0.0',
          updatedBy: 'Juan Pérez'
        },
        createdAt: new Date()
      }
    ];
  },

  async createSmartNotification(notification: Partial<SmartNotification>): Promise<SmartNotification> {
    await delay(400);
    return {
      id: generateId(),
      userId: notification.userId || '',
      type: notification.type || 'document_shared',
      title: notification.title || '',
      message: notification.message || '',
      relatedDocumentId: notification.relatedDocumentId || '',
      priority: notification.priority || 'low',
      isRead: false,
      actionRequired: notification.actionRequired || false,
      expiresAt: notification.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
      metadata: notification.metadata || {},
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
      backupSize: Math.floor(Math.random() * 1000000) + 100000,
      backupPath: 's3://backups/documents/',
      checksum: 'sha256:abc123def456',
      status: 'completed',
      createdBy: 'system',
      createdAt: new Date(),
      completedAt: new Date(),
      retentionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
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
        backupSize: 1024000,
        backupPath: 's3://backups/documents/',
        checksum: 'sha256:abc123def456',
        status: 'completed',
        createdBy: 'system',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60000),
        retentionUntil: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
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
      backupSchedule: {
        frequency: 'daily',
        time: '02:00',
        retention: 30
      },
      recoveryTimeObjective: 4, // Recovery Time Objective: 4 horas
      recoveryPointObjective: 1, // Recovery Point Objective: 1 hora
      backupLocations: [
        'primary-datacenter',
        'secondary-datacenter',
        'cloud-storage'
      ],
      isActive: true,
      lastTested: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdBy: 'admin',
      createdAt: new Date('2024-01-01')
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