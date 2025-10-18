/**
 * Message Component
 * 
 * Displays individual chat messages with markdown support
 */

import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import type { AIMessage } from '@/types/ai'

interface MessageProps {
  message: AIMessage
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3 animate-fade-in', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-blue-600' : 'bg-gray-700'
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-blue-400" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn('flex-1 max-w-[80%]', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'px-4 py-3 rounded-lg',
            isUser ? 'bg-blue-600 text-white' : 'bg-[#242b3d] text-white'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                // Custom styling for markdown elements
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-blue-300">{children}</strong>,
                code: ({ children }) => (
                  <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-blue-300">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-800 p-3 rounded-lg overflow-x-auto my-2">
                    {children}
                  </pre>
                ),
                h3: ({ children }) => <h3 className="font-semibold text-base mb-2 mt-3 first:mt-0">{children}</h3>,
                h4: ({ children }) => <h4 className="font-semibold text-sm mb-1 mt-2">{children}</h4>,
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {children}
                  </a>
                ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <span className="text-xs text-gray-500 mt-1 px-1">
          {message.timestamp.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>

        {/* Suggestions (if any) */}
        {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.metadata.suggestions.map((suggestion, i) => (
              <button
                key={i}
                className="block text-xs text-left px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
