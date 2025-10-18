/**
 * useAIAssistant Hook
 * 
 * Manages the state and behavior of the AI Assistant
 */

import { useState, useCallback } from 'react'
import type { AIView, AIAssistantState } from '@/types/ai'

export function useAIAssistant() {
  const [state, setState] = useState<AIAssistantState>({
    isOpen: false,
    currentView: 'welcome',
    notificationCount: 0
  })

  const openAssistant = useCallback((view: AIView = 'welcome') => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      currentView: view
    }))
  }, [])

  const closeAssistant = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  const setView = useCallback((view: AIView) => {
    setState(prev => ({
      ...prev,
      currentView: view
    }))
  }, [])

  const setNotificationCount = useCallback((count: number) => {
    setState(prev => ({
      ...prev,
      notificationCount: count
    }))
  }, [])

  const incrementNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notificationCount: prev.notificationCount + 1
    }))
  }, [])

  const clearNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notificationCount: 0
    }))
  }, [])

  return {
    ...state,
    openAssistant,
    closeAssistant,
    setView,
    setNotificationCount,
    incrementNotifications,
    clearNotifications
  }
}
