// Tipos principales para el sistema de gestión de documentos

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string | Date;
  category: string;
  tags: string[];
  projectName?: string;
  projectId?: string;
  securityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  status: 'approved' | 'pending' | 'rejected';
  version: number;
  versions?: DocumentVersion[];
  annotations?: DocumentAnnotation[];
  collaborators?: DocumentCollaborator[];
  permissions?: DocumentPermissions;
  metadata?: DocumentMetadata;
  url?: string;
  thumbnailUrl?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  major?: number;
  minor?: number;
  patch?: number;
  fileName?: string;
  fileSize: number;
  fileType?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  createdAt?: string | Date;
  changes?: string[];
  isCurrent?: boolean;
  tags?: string[];
  checksum?: string;
  parentVersion?: string;
  branch?: string;
  title?: string;
  type?: 'major' | 'minor' | 'draft';
  description?: string;
  author?: string;
  authorEmail?: string;
  fileHash?: string;
  parentVersionId?: string;
  status?: 'published' | 'draft' | 'archived';
}

export interface DocumentAnnotation {
  id: string;
  documentId: string;
  versionId?: string;
  type: 'highlight' | 'comment' | 'drawing' | 'stamp' | 'text';
  content: string;
  position?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  // Campos planos opcionales para compatibilidad con componentes existentes
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  page: number;
  author: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  color?: string;
  resolved?: boolean;
  replies?: {
    id: string;
    content: string;
    author: string;
    createdAt: string | Date;
  }[];
}

export interface DocumentCollaborator {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    share: boolean;
    download: boolean;
    print: boolean;
    comment: boolean;
    annotate: boolean;
  };
  expiresAt?: string;
  grantedBy: string;
  grantedAt: string;
  lastAccess?: string | Date;
  isActive: boolean;
  status?: 'active' | 'pending' | 'expired';
}

export interface DocumentPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canAnnotate: boolean;
  canDownload: boolean;
  canVersion: boolean;
}

export interface DocumentMetadata {
  title?: string;
  description?: string;
  author?: string;
  creationDate?: string | Date;
  modificationDate?: string | Date;
  language?: string;
  keywords?: string[];
  customFields?: Record<string, any>;
}

export interface SearchFilters {
  search?: string;
  category?: string;
  project?: string;
  tags?: string[];
  dateRange?: {
    start: string | Date;
    end: string | Date;
  };
  securityLevel?: string[];
  status?: string[];
  fileType?: string[];
  type?: string;
  sizeRange?: {
    min: number;
    max: number;
  };
}

export interface SearchResult {
  documents: Document[];
  document?: Document;
  score?: number;
  total: number;
  page: number;
  pageSize: number;
  filters: SearchFilters;
  suggestions?: string[];
}

export interface DocumentUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  documentId?: string;
}

export interface DocumentClassification {
  category: string;
  tags: string[];
  confidence: number;
  documentType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectPhase?: string;
}

export interface ShareSettings {
  expiresAt?: string | Date;
  password?: string;
  allowDownload: boolean;
  allowAnnotation: boolean;
  notifyOnAccess: boolean;
  maxViews?: number;
}

export interface DocumentActivity {
  id: string;
  documentId: string;
  action: 'view' | 'edit' | 'share' | 'download' | 'annotate' | 'version';
  user: string;
  timestamp: string | Date;
  details?: any;
}

// Tipos para integración con otras herramientas
export interface DocumentIntegration {
  id: string;
  documentId: string;
  type: 'project' | 'task' | 'budget' | 'external';
  targetId: string;
  targetName: string;
  targetType: string;
  status: 'linked' | 'pending' | 'failed' | 'unlinked';
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IntegrationProject {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold';
  startDate?: string | Date;
  endDate?: string | Date;
  budget?: number;
  documents?: Document[];
}

export interface IntegrationTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string | Date;
  projectId?: string;
  documents?: Document[];
}

export interface IntegrationBudget {
  id: string;
  name: string;
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  status: 'active' | 'exceeded' | 'completed';
  projectId?: string;
  documents?: Document[];
}

// Tipos para seguridad avanzada
export interface SecurityRole {
  id: string;
  name: string;
  level: number;
  permissions: {
    documents: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      share: boolean;
      annotate: boolean;
      version: boolean;
      export: boolean;
      print: boolean;
    };
    admin: {
      manageUsers: boolean;
      manageRoles: boolean;
      manageSecurity: boolean;
      viewAuditLogs: boolean;
      manageIntegrations: boolean;
    };
  };
  description?: string;
  isActive: boolean;
  createdAt: string | Date;
}

export interface SecurityRule {
  id: string;
  name: string;
  type: 'document' | 'folder' | 'global';
  targetId: string;
  conditions: {
    userRoles?: string[];
    securityLevels?: string[];
    documentTypes?: string[];
    timeRestrictions?: {
      startTime?: string;
      endTime?: string;
      daysOfWeek?: number[];
    };
    locationRestrictions?: {
      allowedCountries?: string[];
      allowedIPs?: string[];
      blockedIPs?: string[];
    };
  };
  actions: {
    allowAccess: boolean;
    requireApproval: boolean;
    requireMFA: boolean;
    encryptDocument: boolean;
    addWatermark: boolean;
    expireAfter?: number;
    maxDownloads?: number;
  };
  priority: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string | Date;
}

export interface AccessLog {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'view' | 'edit' | 'download' | 'share' | 'annotate' | 'admin';
  timestamp: string | Date;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// Tipos para edición colaborativa
export interface CollaborativeAnnotation {
  id: string;
  documentId: string;
  versionId: string;
  type: 'text' | 'highlight' | 'drawing' | 'stamp' | 'signature' | 'image';
  content: string;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    page: number;
  };
  style?: {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    opacity?: number;
    lineWidth?: number;
    lineStyle?: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string | Date;
  replies: AnnotationReply[];
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canReply: boolean;
  };
}

export interface AnnotationReply {
  id: string;
  annotationId: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface CollaborativeSession {
  id: string;
  documentId: string;
  versionId: string;
  participants: {
    userId: string;
    userName: string;
    userEmail: string;
    role: 'viewer' | 'editor' | 'admin';
    joinedAt: string | Date;
    lastActivity: string | Date;
    cursor?: {
      x: number;
      y: number;
      page: number;
    };
    selection?: {
      start: { x: number; y: number; page: number };
      end: { x: number; y: number; page: number };
    };
  }[];
  isActive: boolean;
  createdAt: string | Date;
  endedAt?: string | Date;
  metadata?: Record<string, any>;
}

// Tipos para control de versiones avanzado
export interface VersionBranch {
  id: string;
  name: string;
  documentId: string;
  parentBranch?: string;
  parentVersion?: string;
  isMain: boolean;
  isProtected: boolean;
  description?: string;
  createdBy: string;
  createdAt: string | Date;
  lastModified: string | Date;
  versions: DocumentVersion[];
}

export interface VersionMerge {
  id: string;
  sourceBranch: string;
  targetBranch: string;
  sourceVersion: string;
  targetVersion: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  conflicts: MergeConflict[];
  mergedBy?: string;
  mergedAt?: string | Date;
  description?: string;
  metadata?: Record<string, any>;
}

export interface MergeConflict {
  id: string;
  mergeId: string;
  filePath: string;
  type: 'content' | 'metadata' | 'annotation' | 'permission';
  sourceChange: any;
  targetChange: any;
  resolution?: 'source' | 'target' | 'manual' | 'custom';
  resolvedBy?: string;
  resolvedAt?: string | Date;
  customResolution?: any;
}

export interface VersionTag {
  id: string;
  name: string;
  versionId: string;
  branchId: string;
  description?: string;
  createdBy: string;
  createdAt: string | Date;
  isRelease: boolean;
  metadata?: Record<string, any>;
}

// Tipos para flujos de trabajo
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'approval' | 'review' | 'publication' | 'custom';
  stages: WorkflowStage[];
  isActive: boolean;
  createdBy: string;
  createdAt: string | Date;
}

export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  requiredApprovals: number;
  approvers: {
    userId?: string;
    roleId?: string;
    email?: string;
    isRequired: boolean;
  }[];
  actions: {
    approve: boolean;
    reject: boolean;
    requestChanges: boolean;
    delegate: boolean;
  };
  timeLimit?: number;
  autoApproveIfNoResponse?: boolean;
  notifications: {
    onStart: boolean;
    onComplete: boolean;
    onOverdue: boolean;
    recipients: string[];
  };
}

export interface WorkflowInstance {
  id: string;
  documentId: string;
  templateId: string;
  currentStage: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  initiatedBy: string;
  initiatedAt: string | Date;
  completedAt?: string | Date;
  stages: WorkflowStageInstance[];
  metadata?: Record<string, any>;
}

export interface WorkflowStageInstance {
  id: string;
  stageId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  assignedTo: {
    userId?: string;
    roleId?: string;
    email?: string;
  }[];
  decisions: WorkflowDecision[];
  startedAt: string | Date;
  completedAt?: string | Date;
  dueDate?: string | Date;
}

export interface WorkflowDecision {
  id: string;
  stageInstanceId: string;
  decision: 'approve' | 'reject' | 'request_changes' | 'delegate';
  comments?: string;
  decidedBy: string;
  decidedAt: string | Date;
  metadata?: Record<string, any>;
}

// Tipos para analytics y machine learning
export interface DocumentAnalytics {
  id: string;
  documentId: string;
  views: number;
  downloads: number;
  shares: number;
  annotations: number;
  versions: number;
  uniqueViewers: number;
  averageViewTime: number;
  lastAccessed: string | Date;
  accessByRole: Record<string, number>;
  accessByDepartment: Record<string, number>;
  peakAccessTime?: string;
  geographicAccess: {
    country: string;
    count: number;
  }[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DocumentClassificationML {
  id: string;
  documentId: string;
  predictedCategory: string;
  predictedTags: string[];
  confidence: number;
  modelVersion: string;
  features: {
    textContent?: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    metadata?: Record<string, any>;
  };
  trainingData?: boolean;
  feedback?: {
    correct: boolean;
    correctCategory?: string;
    correctTags?: string[];
    feedbackGivenBy?: string;
    feedbackGivenAt?: string | Date;
  };
  createdAt: string | Date;
}

export interface OCRResult {
  id: string;
  documentId: string;
  content: string;
  pages: {
    pageNumber: number;
    text: string;
    confidence: number;
    blocks: {
      text: string;
      confidence: number;
      bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }[];
  }[];
  language: string;
  confidence: number;
  processingTime: number;
  engine: string;
  createdAt: string | Date;
}

// Tipos para notificaciones inteligentes
export interface SmartNotification {
  id: string;
  userId: string;
  type: 'document_shared' | 'annotation_reply' | 'workflow_stage' | 'version_update' | 'security_alert' | 'deadline_approaching';
  title: string;
  message: string;
  relatedDocumentId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  actionRequired: boolean;
  expiresAt?: string | Date;
  metadata?: Record<string, any>;
  createdAt: string | Date;
}

// Tipos para backup y recuperación
export interface DocumentBackup {
  id: string;
  documentId: string;
  backupType: 'full' | 'incremental' | 'differential';
  backupSize: number;
  backupPath: string;
  checksum: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdBy: string;
  createdAt: string | Date;
  completedAt?: string | Date;
  retentionUntil?: string | Date;
  metadata?: Record<string, any>;
}

export interface DisasterRecoveryPlan {
  id: string;
  name: string;
  description?: string;
  backupSchedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time: string;
    retention: number;
  };
  recoveryTimeObjective: number;
  recoveryPointObjective: number;
  backupLocations: string[];
  isActive: boolean;
  lastTested?: string | Date;
  createdBy: string;
  createdAt: string | Date;
}