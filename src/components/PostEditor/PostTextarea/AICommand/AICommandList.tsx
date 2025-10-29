import { Button } from '@/components/ui/button'
import { useAI } from '@/providers/AIProvider'
import { useFetchWebMetadata } from '@/hooks/useFetchWebMetadata'
import Image from '@/components/Image'
import { ArrowRight, Loader2 } from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Event } from 'nostr-tools'
import aiService from '@/services/ai.service'

export type AICommandListProps = {
  command: (props: { text: string }) => void
  query: string
  parentEvent?: Event
}

export type AICommandListHandle = {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean
}

const AICommandList = forwardRef<AICommandListHandle, AICommandListProps>((props, ref) => {
  const { t } = useTranslation()
  const { chat, isConfigured } = useAI()
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // Extract URL from result if present
  const extractedUrl = useMemo(() => {
    if (!result) return null

    // Look for URLs in the result
    const urlRegex = /(https?:\/\/[^\s]+)/gi
    const matches = result.match(urlRegex)

    if (matches && matches.length > 0) {
      // Return the first URL found
      return matches[0].replace(/[.,;!?)]$/, '') // Remove trailing punctuation
    }

    return null
  }, [result])

  // Check if the extracted URL is an image
  const isImageUrl = useMemo(() => {
    if (!extractedUrl) return false
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i
    return imageExtensions.test(extractedUrl) || isGeneratingImage
  }, [extractedUrl, isGeneratingImage])

  // Fetch metadata if we have a URL
  const { title, description, image } = useFetchWebMetadata(extractedUrl || '')

  const hostname = useMemo(() => {
    if (!extractedUrl) return ''
    try {
      return new URL(extractedUrl).hostname
    } catch {
      return ''
    }
  }, [extractedUrl])

  const handleSubmit = async () => {
    if (!props.query || props.query.trim().length === 0) {
      return
    }

    if (!isConfigured) {
      setError(t('AI is not configured. Please configure it in settings.'))
      return
    }

    setSubmitted(true)
    setLoading(true)
    setError('')
    setResult('')

    try {
      // Check if the query is asking for an image
      const isImageQuery = /\b(image|picture|photo|drawing|illustration|generate|create|make|draw|paint)\b/i.test(props.query) &&
                          /\b(of|about|for|showing|depicting)\b/i.test(props.query)

      // Check if the query is asking for a link/URL
      const isLinkQuery = /\b(link|url|website|page|find|search|get|fetch)\b/i.test(props.query)

      let systemPrompt = 'Be concise and direct. Provide only the essential information without extra wording, explanations, or formatting.'
      let userPrompt = props.query

      // If we have a parent event (replying to a note), include its content as context
      if (props.parentEvent) {
        const parentContent = props.parentEvent.content
        userPrompt = `Context (the note I'm replying to): "${parentContent}"\n\nMy question: ${props.query}`
        systemPrompt += ' Use the provided context to give a more relevant and informed response.'
      }

      if (isLinkQuery) {
        // For link queries, be extra strict about returning only the URL
        systemPrompt = 'Return ONLY the URL/link without any additional text, explanation, markdown formatting, or commentary. Just the plain URL.'
        if (props.parentEvent) {
          const parentContent = props.parentEvent.content
          systemPrompt += ` Use the context from the note being replied to if relevant: "${parentContent}"`
        }
      }

      // Handle image generation requests
      if (isImageQuery) {
        setIsGeneratingImage(true)
        const config = aiService.getConfig()

        if (!config.apiKey) {
          throw new Error('API key not configured')
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Jumble'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image',
            messages: [
              {
                role: 'user',
                content: userPrompt
              }
            ]
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Failed to generate image')
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content

        if (!content) {
          throw new Error('No response from AI')
        }

        setResult(content.trim())
      } else {
        setIsGeneratingImage(false)
        // Use the regular chat function for non-image queries
        const response = await chat([
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ])
        setResult(response.trim())
      }
    } catch (err: any) {
      console.error('AI Command Error:', err)
      setError(err.message || t('Failed to get AI response'))
    } finally {
      setLoading(false)
    }
  }

  // Reset submitted state when query changes
  useEffect(() => {
    setSubmitted(false)
    setResult('')
    setError('')
    setIsGeneratingImage(false)
  }, [props.query])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        if (result && !loading) {
          // Insert the URL if we extracted one, otherwise insert the full result
          const textToInsert = extractedUrl || result
          props.command({ text: textToInsert })
        } else if (props.query && !loading && !submitted) {
          // Submit the query if we haven't submitted yet
          handleSubmit()
        }
        return true
      }
      return false
    }
  }))

  // Show prompt input helper if no query yet
  if (!props.query || props.query.trim().length === 0) {
    return (
      <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
        {t('Type your prompt...')}
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="border rounded-lg bg-background z-50 pointer-events-auto p-2 max-w-md">
        <p className="text-xs text-destructive">
          {t('AI is not configured. Please configure it in settings.')}
        </p>
      </div>
    )
  }

  // Show submit button if not yet submitted
  if (!submitted) {
    return (
      <div className="inline-flex items-center gap-2 z-50 pointer-events-auto">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleSubmit()
          }}
          disabled={loading}
          className="h-7 w-7 rounded-full p-0"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
        </Button>
        <span className="text-xs text-muted-foreground">
          {t('Press Enter or click to submit')}
        </span>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full z-50 pointer-events-auto">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="text-xs text-muted-foreground">
          {isGeneratingImage ? t('Generating...') : t('Thinking...')}
        </span>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="border rounded-lg bg-background z-50 pointer-events-auto p-2 max-w-md">
        <p className="text-xs text-destructive">{error}</p>
      </div>
    )
  }

  // Show result with insert options
  if (result) {
    // If we have an image URL, show the image preview
    if (extractedUrl && isImageUrl) {
      return (
        <div className="border rounded-lg bg-background z-50 pointer-events-auto p-3 max-w-md space-y-2">
          <div className="text-xs text-muted-foreground mb-2">{t('Generated Image:')}</div>

          {/* Image Preview */}
          <div className="w-full border rounded-lg overflow-hidden">
            <Image
              image={{ url: extractedUrl }}
              className="w-full h-auto max-h-96 object-contain"
              hideIfError
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                props.command({ text: extractedUrl })
              }}
              className="flex-1"
            >
              {t('Insert Image')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(extractedUrl)
              }}
            >
              {t('Copy URL')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('Press Enter to insert image')}
          </p>
        </div>
      )
    }

    // If we have a URL and metadata (non-image), show link preview card
    if (extractedUrl && title) {
      return (
        <div className="border rounded-lg bg-background z-50 pointer-events-auto p-3 max-w-md space-y-2">
          <div className="text-xs text-muted-foreground mb-2">{t('AI Result:')}</div>

          {/* Link Preview Card */}
          <div
            className="p-2 flex gap-2 w-full border rounded-lg overflow-hidden cursor-pointer hover:bg-accent transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              window.open(extractedUrl, '_blank')
            }}
          >
            {image && (
              <Image image={{ url: image }} className="w-10 h-10 rounded flex-shrink-0" hideIfError />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold line-clamp-1 text-sm">{title}</div>
              {description && (
                <div className="text-xs text-muted-foreground line-clamp-2">{description}</div>
              )}
              <div className="text-xs text-muted-foreground mt-0.5">{hostname}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                props.command({ text: extractedUrl })
              }}
              className="flex-1"
            >
              {t('Insert Link')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(extractedUrl)
              }}
            >
              {t('Copy')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('Press Enter to insert link')}
          </p>
        </div>
      )
    }

    // Otherwise show text result
    return (
      <div className="border rounded-lg bg-background z-50 pointer-events-auto p-3 max-w-2xl space-y-2">
        <div className="text-sm">
          <div className="font-medium mb-1 text-xs text-muted-foreground">{t('AI Result:')}</div>
          <div className="bg-muted p-2 rounded max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-sm">
            {result}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              props.command({ text: result })
            }}
            className="flex-1"
          >
            {t('Insert')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(result)
            }}
          >
            {t('Copy')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('Press Enter to insert')}
        </p>
      </div>
    )
  }

  return null
})

AICommandList.displayName = 'AICommandList'
export default AICommandList
