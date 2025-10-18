/**
 * AIAssistantButton
 * 
 * Floating button that provides quick access to AI Assistant from anywhere in the app
 */

import { Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIAssistantButtonProps {
  notificationCount?: number
  onClick: () => void
  className?: string
}

export function AIAssistantButton({ 
  notificationCount = 0, 
  onClick,
  className 
}: AIAssistantButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Position
        'fixed bottom-6 right-6 z-[1000]',
        // Size
        'w-16 h-16',
        // Style
        'rounded-full',
        'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
        'shadow-lg hover:shadow-xl',
        // Animation
        'transition-all duration-300',
        'hover:scale-110 active:scale-95',
        // Flex
        'flex items-center justify-center',
        // Group for child animations
        'group',
        // Accessibility
        'focus:outline-none focus:ring-4 focus:ring-blue-500/50',
        className
      )}
      aria-label={`Abrir IA Assistant${notificationCount > 0 ? ` (${notificationCount} notificaciones)` : ''}`}
      style={{
        animation: 'pulse-subtle 3s ease-in-out infinite'
      }}
    >
      {/* Icon Container */}
      <div className="relative">
        {/* Robot Icon */}
        <Bot className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
        
        {/* Sparkles Icon */}
        <Sparkles 
          className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 transition-all group-hover:scale-125" 
          style={{
            animation: 'sparkle 1.5s ease-in-out infinite'
          }}
        />
      </div>
      
      {/* Notification Badge */}
      {notificationCount > 0 && (
        <span 
          className={cn(
            'absolute -top-1 -right-1',
            'w-6 h-6',
            'bg-red-500',
            'rounded-full',
            'flex items-center justify-center',
            'text-white text-xs font-bold',
            'shadow-md',
            'animate-bounce'
          )}
          aria-label={`${notificationCount} notificaciones`}
        >
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </button>
  )
}

// Add these animations to your global CSS or tailwind config
// @keyframes pulse-subtle {
//   0%, 100% { transform: scale(1); }
//   50% { transform: scale(1.05); }
// }
//
// @keyframes sparkle {
//   0%, 100% { opacity: 1; transform: scale(1); }
//   50% { opacity: 0.5; transform: scale(1.2); }
// }
