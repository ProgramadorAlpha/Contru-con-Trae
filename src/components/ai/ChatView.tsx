/**
 * ChatView
 * 
 * Chat interface for conversational AI interactions
 */

import { useState, useRef, useEffect, FormEvent } from 'react'
import { Send, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChat } from '@/hooks/useChat'
import { Message } from './Message'

interface ChatViewProps {
  onBack?: () => void
}

export function ChatView({ onBack }: ChatViewProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, isLoading, error } = useChat()

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
      {/* Header with back button */}
      {onBack && (
        <div className="p-4 border-b border-gray-700 flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <span className="text-gray-400 text-sm">Chat con IA</span>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg mb-2">¡Hola! ¿En qué puedo ayudarte hoy?</p>
            <p className="text-sm">
              Pregunta sobre proyectos, presupuestos, cronogramas y más
            </p>
            
            {/* Suggested questions */}
            <div className="mt-8 space-y-2">
              <p className="text-xs text-gray-500 mb-3">Preguntas sugeridas:</p>
              {[
                '¿Cuál es el estado de mis proyectos activos?',
                '¿Cuánto hemos gastado este mes?',
                'Muéstrame las facturas pendientes'
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="block w-full max-w-md mx-auto px-4 py-2 text-sm text-left bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
            </div>
            <span className="ml-2 text-sm">IA está escribiendo...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta..."
            rows={1}
            className={cn(
              'flex-1 px-4 py-3',
              'bg-[#242b3d] text-white',
              'rounded-lg resize-none',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'placeholder:text-gray-500',
              'max-h-32'
            )}
            disabled={isLoading}
            style={{
              minHeight: '48px',
              height: 'auto'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = target.scrollHeight + 'px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              'p-3 rounded-lg',
              'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
              'disabled:bg-gray-600 disabled:cursor-not-allowed',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'flex-shrink-0'
            )}
            aria-label="Enviar mensaje"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Presiona Enter para enviar, Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}
