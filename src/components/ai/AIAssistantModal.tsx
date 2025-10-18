/**
 * AIAssistantModal
 * 
 * Main modal for AI Assistant with multiple views
 */

import { useState, useEffect } from 'react'
import { X, Bot, Sparkles, Camera, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatView } from './ChatView'
import { ReceiptScanModal } from './ReceiptScanModal'
import { VoiceTransactionModal } from './VoiceTransactionModal'
import type { AIView } from '@/types/ai'

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: AIView
}

export function AIAssistantModal({ 
  isOpen, 
  onClose, 
  initialView = 'welcome' 
}: AIAssistantModalProps) {
  const [currentView, setCurrentView] = useState<AIView>(initialView)
  const [isReceiptScanOpen, setIsReceiptScanOpen] = useState(false)
  const [isVoiceTransactionOpen, setIsVoiceTransactionOpen] = useState(false)

  // Reset view when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setCurrentView('welcome'), 300)
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
    >
      <div 
        className={cn(
          'w-full max-w-2xl h-[700px] max-h-[90vh]',
          'bg-[#1a1f2e] rounded-2xl',
          'border-2 border-dashed border-blue-500',
          'shadow-2xl',
          'flex flex-col',
          'animate-fade-in-up',
          'overflow-hidden'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-8 h-8 text-blue-400" />
              <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-sparkle" />
            </div>
            <div>
              <h2 
                id="ai-assistant-title"
                className="text-xl font-bold text-white"
              >
                IA Assistant
              </h2>
              <p className="text-sm text-gray-400">
                Análisis inteligente disponible
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg',
              'hover:bg-gray-800 active:bg-gray-700',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Body - Dynamic content based on view */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'welcome' && (
            <WelcomeView 
              onStartChat={() => setCurrentView('chat')}
              onScanReceipt={() => setIsReceiptScanOpen(true)}
              onVoiceTransaction={() => setIsVoiceTransactionOpen(true)}
            />
          )}
          {currentView === 'chat' && (
            <ChatView onBack={() => setCurrentView('welcome')} />
          )}
          {currentView === 'features' && (
            <div className="h-full flex items-center justify-center text-white">
              <p>Features View - Coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Scan Modal */}
      <ReceiptScanModal
        isOpen={isReceiptScanOpen}
        onClose={() => setIsReceiptScanOpen(false)}
        onSave={(data) => {
          console.log('Recibo guardado:', data);
          setIsReceiptScanOpen(false);
        }}
      />

      {/* Voice Transaction Modal */}
      <VoiceTransactionModal
        isOpen={isVoiceTransactionOpen}
        onClose={() => setIsVoiceTransactionOpen(false)}
        onSave={(data) => {
          console.log('Transacción por voz guardada:', data);
          setIsVoiceTransactionOpen(false);
        }}
      />
    </div>
  )
}

// Temporary WelcomeView component (will be moved to separate file)
function WelcomeView({ 
  onStartChat, 
  onScanReceipt,
  onVoiceTransaction
}: { 
  onStartChat: () => void
  onScanReceipt: () => void
  onVoiceTransaction: () => void
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
      {/* Robot Icon */}
      <div className="relative mb-6">
        <div className="w-32 h-32 rounded-full bg-blue-600/20 flex items-center justify-center">
          <Bot className="w-20 h-20 text-blue-400" />
        </div>
        <Sparkles className="w-8 h-8 text-yellow-300 absolute top-0 right-0 animate-sparkle" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-2">
        IA Assistant
      </h3>
      <p className="text-gray-400 mb-8">
        Análisis inteligente disponible
      </p>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-6">
        <button
          onClick={onStartChat}
          className={cn(
            'px-6 py-4',
            'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
            'text-white font-semibold',
            'rounded-xl',
            'shadow-lg hover:shadow-xl',
            'transition-all duration-200',
            'hover:scale-105 active:scale-95',
            'focus:outline-none focus:ring-4 focus:ring-blue-500/50',
            'flex items-center justify-center gap-2'
          )}
        >
          <span>💬</span>
          Iniciar Chat
        </button>

        <button
          onClick={onScanReceipt}
          className={cn(
            'px-6 py-4',
            'bg-green-600 hover:bg-green-700 active:bg-green-800',
            'text-white font-semibold',
            'rounded-xl',
            'shadow-lg hover:shadow-xl',
            'transition-all duration-200',
            'hover:scale-105 active:scale-95',
            'focus:outline-none focus:ring-4 focus:ring-green-500/50',
            'flex items-center justify-center gap-2'
          )}
        >
          <Camera className="w-5 h-5" />
          Escanear Recibo
        </button>

        <button
          onClick={onVoiceTransaction}
          className={cn(
            'px-6 py-4',
            'bg-purple-600 hover:bg-purple-700 active:bg-purple-800',
            'text-white font-semibold',
            'rounded-xl',
            'shadow-lg hover:shadow-xl',
            'transition-all duration-200',
            'hover:scale-105 active:scale-95',
            'focus:outline-none focus:ring-4 focus:ring-purple-500/50',
            'flex items-center justify-center gap-2'
          )}
        >
          <Mic className="w-5 h-5" />
          Voz
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-400 max-w-lg text-center">
        Pregunta sobre proyectos, escanea recibos o registra gastos por voz
      </p>

      {/* Capabilities List */}
      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-lg text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-blue-400">✓</span>
          <span>Consultas de proyectos</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-blue-400">✓</span>
          <span>Análisis financiero</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-blue-400">✓</span>
          <span>Escaneo de recibos</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-blue-400">✓</span>
          <span>Transacciones por voz</span>
        </div>
      </div>
    </div>
  )
}
