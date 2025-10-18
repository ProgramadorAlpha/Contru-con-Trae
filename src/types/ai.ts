/**
 * AI Types
 * 
 * Type definitions for AI features including chat, voice, and receipt scanning
 */

// ============================================================================
// Chat Types
// ============================================================================

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    visualData?: VisualData
    suggestions?: string[]
  }
}

export interface VisualData {
  type: 'chart' | 'table' | 'list'
  data: any
}

export interface ChatRequest {
  message: string
  conversationHistory?: AIMessage[]
}

export interface ChatResponse {
  message: string
  suggestions?: string[]
  visualData?: VisualData
}

// ============================================================================
// Voice Types
// ============================================================================

export interface VoiceTransactionRequest {
  audioBlob: Blob
  language?: 'es-MX'
}

export interface VoiceTransactionResponse {
  transcription: string
  extractedData: ExtractedTransactionData
  confidence: number
}

export interface ExtractedTransactionData {
  amount?: number
  category?: string
  project?: string
  description?: string
}

// ============================================================================
// Receipt Scanning Types
// ============================================================================

export interface ReceiptScanRequest {
  imageBase64: string
  projectContext?: Array<{ id: string; name: string }>
}

export interface ReceiptScanResponse {
  extractedData: ExtractedReceiptData
  suggestedCategory: string
  suggestedProject?: string
  confidence: number
}

export interface ExtractedReceiptData {
  total: number
  date: string
  supplier: string
  items: string[]
  rfc?: string
  invoiceNumber?: string
}

// ============================================================================
// AI Log Types
// ============================================================================

export interface AILog {
  id: string
  userId: string
  feature: 'chat' | 'voice' | 'receipt_scan' | 'semantic_search' | 'categorization'
  action: string
  inputData: any
  outputData: any
  confidence?: number
  processingTime: number
  timestamp: Date
  success: boolean
  errorMessage?: string
}

// ============================================================================
// AI Metrics Types
// ============================================================================

export interface AIMetrics {
  totalInteractions: number
  featureUsage: {
    chat: number
    voice: number
    receiptScan: number
    semanticSearch: number
    categorization: number
  }
  averageProcessingTime: number
  averageConfidence: number
  successRate: number
  topUsers: Array<{
    userId: string
    userName: string
    interactionCount: number
  }>
}

// ============================================================================
// Component State Types
// ============================================================================

export type AIView = 'welcome' | 'chat' | 'features' | 'voice' | 'receipt'

export interface AIAssistantState {
  isOpen: boolean
  currentView: AIView
  notificationCount: number
}

export type VoiceRecordingState = 'idle' | 'recording' | 'processing' | 'confirmation' | 'success' | 'error'

export type ReceiptScanState = 'camera' | 'preview' | 'analyzing' | 'extracted' | 'saved' | 'error'

// ============================================================================
// Error Types
// ============================================================================

export interface AIError {
  code: string
  message: string
  details?: any
}

export class AIServiceError extends Error {
  code: string
  details?: any

  constructor(message: string, code: string, details?: any) {
    super(message)
    this.name = 'AIServiceError'
    this.code = code
    this.details = details
  }
}
