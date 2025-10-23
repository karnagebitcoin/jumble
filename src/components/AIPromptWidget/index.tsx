import WidgetContainer from '@/components/WidgetContainer'
import { useWidgets } from '@/providers/WidgetsProvider'
import { useAI } from '@/providers/AIProvider'
import { useFetchEvent } from '@/hooks/useFetchEvent'
import { Loader2, MessageSquare, X, Send, AlertCircle } from 'lucide-react'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next'
import React, { useState, useRef, useEffect } from 'react'
import { Event } from 'nostr-tools'
import { cn } from '@/lib/utils'
import Image from '@/components/Image'
import { getImetaInfosFromEvent } from '@/lib/event'

interface AIPromptWidgetProps {
  widgetId: string
  eventId: string
}

function NotePreview({ event }: { event: Event }) {
  const { t } = useTranslation()
  const imetaInfos = getImetaInfosFromEvent(event)

  // Check if note has images
  if (imetaInfos && imetaInfos.length > 0) {
    const firstImage = imetaInfos[0]
    if (firstImage && firstImage.url) {
      return (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
            <Image
              src={firstImage.url}
              alt="Note preview"
              className="w-full h-full object-cover"
              blurHash={firstImage.blurHash}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {event.content.substring(0, 100) || t('Image note')}
            </p>
          </div>
        </div>
      )
    }
  }

  // Text-only note - show first line
  const firstLine = event.content.split('\n')[0].substring(0, 100)
  return (
    <div className="p-2 bg-muted/50 rounded-md">
      <p className="text-xs text-muted-foreground truncate">
        {firstLine || t('Empty note')}
      </p>
    </div>
  )
}

export default function AIPromptWidget({ widgetId, eventId }: AIPromptWidgetProps) {
  const { t } = useTranslation()
  const { closeAIPrompt, getAIPromptWidget, updateAIPromptMessages } = useWidgets()
  const { chat, isConfigured } = useAI()
  const { event, isFetching } = useFetchEvent(eventId)
  const [isHovered, setIsHovered] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const widget = getAIPromptWidget(widgetId)
  const messages = widget?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleClose = () => {
    closeAIPrompt(widgetId)
  }

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading || !isConfigured) return
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
      const response = await chat(conversationMessages)

      // Update messages
      const newMessages = [
        ...messages,
        { role: 'user' as const, content: userMessage },
        { role: 'assistant' as const, content: response }
      ]
      updateAIPromptMessages(widgetId, newMessages)
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

  return (
    <WidgetContainer>
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 border-b group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardTitle className="font-semibold text-muted-foreground flex items-center gap-2" style={{ fontSize: '14px' }}>
          <MessageSquare className="h-4 w-4" />
          {t('AI Prompt')}
        </CardTitle>
        {isHovered && (
          <button
            className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            onClick={handleClose}
            title={t('Close AI Prompt')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </CardHeader>

      <div className="flex flex-col h-[500px]">
        {/* Note Preview */}
        <div className="px-4 pt-4 pb-2">
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
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
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
                'p-3 rounded-lg text-sm',
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
        <div className="p-4 border-t">
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
    </WidgetContainer>
  )
}
