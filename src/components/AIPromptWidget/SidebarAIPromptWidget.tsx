import { useWidgets } from '@/providers/WidgetsProvider'
import { useAI } from '@/providers/AIProvider'
import { useFetchEvent } from '@/hooks/useFetchEvent'
import { Loader2, MessageSquare, Send, AlertCircle, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next'
import React, { useState, useRef, useEffect } from 'react'
import { Event } from 'nostr-tools'
import { cn } from '@/lib/utils'
import { getImetaInfosFromEvent } from '@/lib/event'
import { useNostr } from '@/providers/NostrProvider'
import { Link } from '@tanstack/react-router'

interface SidebarAIPromptWidgetProps {
  widgetId?: string
  eventId?: string
}

function NotePreview({ event }: { event: Event }) {
  const { t } = useTranslation()
  const imetaInfos = getImetaInfosFromEvent(event)

  // Check if note has images
  if (imetaInfos && imetaInfos.length > 0) {
    const imageUrls = imetaInfos.map(info => info.url).filter(Boolean)
    if (imageUrls.length > 0) {
      return (
        <div className="p-2 bg-muted/50 rounded-md space-y-1">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {event.content.substring(0, 100) || t('Image note')}
          </p>
          <div className="text-xs text-muted-foreground/70">
            📷 {imageUrls.length} {imageUrls.length === 1 ? 'image' : 'images'}
          </div>
        </div>
      )
    }
  }

  // Text-only note - show first line
  const firstLine = event.content.split('\n')[0].substring(0, 100)
  return (
    <div className="p-2 bg-muted/50 rounded-md">
      <p className="text-xs text-muted-foreground line-clamp-2">
        {firstLine || t('Empty note')}
      </p>
    </div>
  )
}

export default function SidebarAIPromptWidget({ widgetId, eventId }: SidebarAIPromptWidgetProps) {
  const { t } = useTranslation()
  const { getAIPromptWidget, updateAIPromptMessages, aiPromptWidgets } = useWidgets()
  const { chat, isConfigured } = useAI()
  const { pubkey } = useNostr()
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get the current AI prompt widget (there should only be one for sidebar)
  const widget = widgetId ? getAIPromptWidget(widgetId) : aiPromptWidgets[0]
  const currentEventId = eventId || widget?.eventId
  const currentWidgetId = widgetId || widget?.id
  
  const { event, isFetching } = useFetchEvent(currentEventId || '')
  const messages = widget?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading || !isConfigured || !currentWidgetId) return
    if (!event) return

    const userMessage = prompt.trim()
    setPrompt('')
    setError(null)
    setIsLoading(true)

    try {
      // Build the context from the note
      const noteContext = `Here is a Nostr note:\n\n${event.content}`

      // Build messages array
      const conversationMessages = [
        {
          role: 'system' as const,
          content: 'You are a helpful assistant analyzing Nostr notes. The user will ask questions about a specific note.'
        },
        {
          role: 'user' as const,
          content: noteContext
        },
        ...messages,
        {
          role: 'user' as const,
          content: userMessage
        }
      ]

      // Get AI response
      const response = await chat(conversationMessages, pubkey)

      // Update messages
      const newMessages = [
        ...messages,
        { role: 'user' as const, content: userMessage },
        { role: 'assistant' as const, content: response }
      ]
      updateAIPromptMessages(currentWidgetId, newMessages)
    } catch (err: any) {
      console.error('AI Prompt Error:', err)
      setError(err.message || t('Failed to get AI response'))
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // If no AI prompt widget exists or no event is selected
  if (!currentEventId || !currentWidgetId) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4" />
          <h3 className="font-semibold text-sm">{t('AI Prompt')}</h3>
        </div>
        
        {!isConfigured ? (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-yellow-600 dark:text-yellow-500 mb-2">
                {t('AI is not configured')}
              </p>
              <Link to="/settings/ai-tools">
                <Button size="sm" variant="outline" className="h-8">
                  <Settings className="h-3 w-3 mr-2" />
                  {t('Configure AI Settings')}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('Click "Prompt Note" on any note to start chatting with AI')}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <h3 className="font-semibold text-sm">{t('AI Prompt')}</h3>
        </div>
        {!isConfigured && (
          <Link to="/settings/ai-tools">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Settings className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>

      {/* Note Preview */}
      <div className="px-4 pt-4 pb-2 border-b">
        {isFetching && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isFetching && !event && (
          <div className="text-center text-sm text-muted-foreground py-4">
            {t('Note not found')}
          </div>
        )}
        {event && <NotePreview event={event} />}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 min-h-0">
        {!isConfigured && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-600 dark:text-yellow-500">
              {t('Please configure AI in settings to use this feature')}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'p-3 rounded-lg text-sm max-h-[400px] overflow-y-auto',
              message.role === 'user'
                ? 'bg-primary text-primary-foreground ml-8'
                : 'bg-muted mr-8'
            )}
          >
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mr-8">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">{t('Thinking...')}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm text-destructive">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('Ask about this note...')}
            className="resize-none min-h-[60px] max-h-[120px]"
            disabled={isLoading || !isConfigured}
          />
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading || !isConfigured}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
