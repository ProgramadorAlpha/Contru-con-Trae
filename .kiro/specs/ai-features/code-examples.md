# Ejemplos de Código - Funcionalidades IA

Este documento contiene ejemplos de código para facilitar la implementación de las funcionalidades de IA.

## 1. Configuración de Claude API

### Variables de Entorno

```env
# .env
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=1024
```

### Cliente de Anthropic

```typescript
// src/config/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const CLAUDE_CONFIG = {
  model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '1024'),
}
```

## 2. Componentes de Frontend

### AIAssistantButton

```typescript
// src/components/ai/AIAssistantButton.tsx
import { Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIAssistantButtonProps {
  notificationCount?: number
  onClick: () => void
}

export function AIAssistantButton({ notificationCount = 0, onClick }: AIAssistantButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-16 h-16 rounded-full',
        'bg-blue-600 hover:bg-blue-700',
        'shadow-lg hover:shadow-xl',
        'transition-all duration-300',
        'flex items-center justify-center',
        'animate-pulse-subtle',
        'group'
      )}
      aria-label="Abrir IA Assistant"
    >
      <div className="relative">
        <Bot className="w-8 h-8 text-white" />
        <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-sparkle" />
      </div>
      
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </button>
  )
}
```

### AIAssistantModal

```typescript
// src/components/ai/AIAssistantModal.tsx
import { useState } from 'react'
import { X, Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WelcomeView } from './WelcomeView'
import { ChatView } from './ChatView'
import { FeaturesView } from './FeaturesView'

type View = 'welcome' | 'chat' | 'features'

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: View
}

export function AIAssistantModal({ isOpen, onClose, initialView = 'welcome' }: AIAssistantModalProps) {
  const [currentView, setCurrentView] = useState<View>(initialView)

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div 
        className={cn(
          'w-full max-w-2xl h-[700px]',
          'bg-[#1a1f2e] rounded-2xl',
          'border-2 border-dashed border-blue-500',
          'shadow-2xl',
          'flex flex-col',
          'animate-fade-in-up'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-8 h-8 text-blue-400" />
              <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-sparkle" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">IA Assistant</h2>
              <p className="text-sm text-gray-400">Análisis inteligente disponible</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'welcome' && (
            <WelcomeView onStartChat={() => setCurrentView('chat')} />
          )}
          {currentView === 'chat' && (
            <ChatView onBack={() => setCurrentView('welcome')} />
          )}
          {currentView === 'features' && (
            <FeaturesView onBack={() => setCurrentView('welcome')} />
          )}
        </div>
      </div>
    </div>
  )
}
```

### ChatView

```typescript
// src/components/ai/ChatView.tsx
import { useState, useRef, useEffect } from 'react'
import { Send, Mic } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { Message } from './Message'

interface ChatViewProps {
  onBack: () => void
}

export function ChatView({ onBack }: ChatViewProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, isLoading } = useChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    await sendMessage(input)
    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p>¡Hola! ¿En qué puedo ayudarte hoy?</p>
            <p className="text-sm mt-2">Pregunta sobre proyectos, presupuestos, cronogramas y más</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
            <span className="ml-2">IA está escribiendo...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-4 py-3 bg-[#242b3d] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            aria-label="Enviar mensaje"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Message Component

```typescript
// src/components/ai/Message.tsx
import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface MessageProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-blue-600' : 'bg-gray-700'
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-blue-400" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        'flex-1 max-w-[80%]',
        isUser && 'flex flex-col items-end'
      )}>
        <div className={cn(
          'px-4 py-3 rounded-lg',
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-[#242b3d] text-white'
        )}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        <span className="text-xs text-gray-500 mt-1">
          {message.timestamp.toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  )
}
```

## 3. Hooks Personalizados

### useChat Hook

```typescript
// src/hooks/useChat.ts
import { useState, useCallback } from 'react'
import { sendChatMessage } from '@/services/ai/claudeService'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true)
    setError(null)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      // Send to backend
      const response = await sendChatMessage({
        message: content,
        conversationHistory: messages
      })

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje')
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    error
  }
}
```

## 4. Servicios de Backend

### Claude Service

```typescript
// src/services/ai/claudeService.ts
import { anthropic, CLAUDE_CONFIG } from '@/config/anthropic'

interface ChatRequest {
  message: string
  conversationHistory?: Array<{ role: string; content: string }>
}

interface ChatResponse {
  message: string
  suggestions?: string[]
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Build conversation history
    const messages = [
      ...(request.conversationHistory || []),
      { role: 'user', content: request.message }
    ]

    // Call Claude API
    const response = await anthropic.messages.create({
      model: CLAUDE_CONFIG.model,
      max_tokens: CLAUDE_CONFIG.maxTokens,
      system: buildSystemPrompt(),
      messages: messages as any
    })

    const aiMessage = response.content[0].text

    return {
      message: aiMessage,
      suggestions: extractSuggestions(aiMessage)
    }
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error('Error al comunicarse con IA')
  }
}

function buildSystemPrompt(): string {
  return `Eres un asistente de IA para ConstructPro, una aplicación de gestión de obras de construcción.

Tu rol es ayudar a los usuarios con:
- Consultas sobre proyectos activos
- Análisis de presupuestos y gastos
- Revisión de cronogramas
- Búsqueda de documentos
- Resúmenes financieros

Responde siempre en español de México.
Sé conciso pero informativo.
Usa formato markdown para estructurar tus respuestas.
Si no tienes información suficiente, pide aclaraciones.`
}

function extractSuggestions(message: string): string[] {
  // Extract potential follow-up questions
  // This is a simple implementation, can be enhanced
  return []
}
```

### Receipt Analysis Service

```typescript
// src/services/ai/receiptService.ts
import { anthropic, CLAUDE_CONFIG } from '@/config/anthropic'

interface AnalyzeReceiptRequest {
  imageBase64: string
  projectContext?: Array<{ id: string; name: string }>
}

interface ExtractedData {
  total: number
  date: string
  supplier: string
  items: string[]
  rfc?: string
  invoiceNumber?: string
}

interface AnalyzeReceiptResponse {
  extractedData: ExtractedData
  suggestedCategory: string
  suggestedProject?: string
  confidence: number
}

export async function analyzeReceipt(
  request: AnalyzeReceiptRequest
): Promise<AnalyzeReceiptResponse> {
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_CONFIG.model,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: request.imageBase64
            }
          },
          {
            type: 'text',
            text: `Analiza este recibo/factura y extrae la siguiente información en formato JSON:

{
  "total": número (monto total),
  "date": "YYYY-MM-DD" (fecha de emisión),
  "supplier": "string" (nombre del proveedor/comercio),
  "items": ["item1", "item2"] (lista de conceptos/productos),
  "rfc": "string" (RFC si está visible, null si no),
  "invoiceNumber": "string" (número de folio/factura, null si no)
}

Devuelve SOLO el JSON, sin texto adicional.`
          }
        ]
      }]
    })

    const jsonText = response.content[0].text
    const extractedData: ExtractedData = JSON.parse(jsonText)

    // Suggest category based on items
    const suggestedCategory = categorizePurchase(extractedData.items)

    // Suggest project if possible
    const suggestedProject = matchProject(extractedData, request.projectContext)

    // Calculate confidence
    const confidence = calculateConfidence(extractedData)

    return {
      extractedData,
      suggestedCategory,
      suggestedProject,
      confidence
    }
  } catch (error) {
    console.error('Receipt analysis error:', error)
    throw new Error('Error al analizar el recibo')
  }
}

function categorizePurchase(items: string[]): string {
  const itemsText = items.join(' ').toLowerCase()
  
  if (itemsText.includes('cemento') || itemsText.includes('arena') || itemsText.includes('varilla')) {
    return 'materials'
  }
  if (itemsText.includes('herramienta') || itemsText.includes('equipo')) {
    return 'equipment'
  }
  if (itemsText.includes('transporte') || itemsText.includes('flete')) {
    return 'transport'
  }
  
  return 'other'
}

function matchProject(
  data: ExtractedData, 
  projects?: Array<{ id: string; name: string }>
): string | undefined {
  if (!projects || projects.length === 0) return undefined
  
  // Simple matching based on supplier or items
  // Can be enhanced with more sophisticated logic
  return undefined
}

function calculateConfidence(data: ExtractedData): number {
  let confidence = 0
  
  if (data.total > 0) confidence += 0.3
  if (data.date) confidence += 0.2
  if (data.supplier) confidence += 0.2
  if (data.items.length > 0) confidence += 0.2
  if (data.invoiceNumber) confidence += 0.1
  
  return confidence
}
```

## 5. API Endpoints

### Chat Endpoint

```typescript
// src/api/routes/claude.ts
import express from 'express'
import { sendChatMessage } from '@/services/ai/claudeService'
import { authenticateUser } from '@/middleware/auth'
import { rateLimit } from '@/middleware/rateLimit'

const router = express.Router()

router.post('/chat', 
  authenticateUser,
  rateLimit({ maxRequests: 100, windowMs: 60 * 60 * 1000 }), // 100 req/hour
  async (req, res) => {
    try {
      const { message, conversationHistory } = req.body

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' })
      }

      // Get user context
      const userId = req.user.id
      const context = await getUserContext(userId)

      // Send to Claude
      const response = await sendChatMessage({
        message,
        conversationHistory,
        context
      })

      // Log interaction
      await logAIInteraction({
        userId,
        feature: 'chat',
        input: message,
        output: response.message
      })

      res.json(response)
    } catch (error) {
      console.error('Chat endpoint error:', error)
      res.status(500).json({ error: 'Error al procesar mensaje' })
    }
  }
)

export default router
```

## 6. Utilidades

### Image Compression

```typescript
// src/utils/imageCompression.ts
export async function compressImage(
  file: File, 
  maxWidth: number = 1024, 
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        const base64 = canvas.toDataURL('image/jpeg', quality)
        resolve(base64.split(',')[1]) // Remove data:image/jpeg;base64, prefix
      }

      img.onerror = reject
      img.src = e.target?.result as string
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

### Audio Recording

```typescript
// src/utils/audioRecording.ts
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []

  async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(stream)
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data)
      }

      this.mediaRecorder.start()
    } catch (error) {
      console.error('Error starting recording:', error)
      throw new Error('No se pudo acceder al micrófono')
    }
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
    })
  }
}
```

## 7. Animaciones CSS

```css
/* src/styles/animations.css */

@keyframes pulse-subtle {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 3s ease-in-out infinite;
}

.animate-sparkle {
  animation: sparkle 1.5s ease-in-out infinite;
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}
```

---

Estos ejemplos proporcionan una base sólida para comenzar la implementación. Cada componente puede ser extendido y personalizado según las necesidades específicas del proyecto.
