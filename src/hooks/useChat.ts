/**
 * useChat Hook
 * 
 * Manages chat state and interactions with Claude AI
 */

import { useState, useCallback } from 'react'
import { chatService } from '@/services/ai/claudeService'
import type { AIMessage } from '@/types/ai'

export function useChat() {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    setIsLoading(true)
    setError(null)

    // Add user message immediately
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])

    try {
      // Send to AI service
      const response = await chatService.sendMessage({
        message: content,
        conversationHistory: messages
      })

      // Add AI response
      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          suggestions: response.suggestions,
          visualData: response.visualData
        }
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar mensaje'
      setError(errorMessage)
      console.error('Chat error:', err)
      
      // Remove user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const retryLastMessage = useCallback(() => {
    if (messages.length === 0) return
    
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
    if (lastUserMessage) {
      // Remove last AI message if it exists
      setMessages(prev => {
        const lastAiIndex = prev.findLastIndex(msg => msg.role === 'assistant')
        if (lastAiIndex !== -1) {
          return prev.slice(0, lastAiIndex)
        }
        return prev
      })
      
      // Resend last user message
      sendMessage(lastUserMessage.content)
    }
  }, [messages, sendMessage])

  return {
    messages,
    sendMessage,
    clearMessages,
    retryLastMessage,
    isLoading,
    error
  }
}
