import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAI } from '@/providers/AIProvider'
import { ArrowRight, Loader2 } from 'lucide-react'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type AICommandListProps = {
  command: (props: { text: string }) => void
  clientRect?: (() => DOMRect | null) | null
}

export type AICommandListHandle = {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean
}

const AICommandList = forwardRef<AICommandListHandle, AICommandListProps>((props, ref) => {
  const { t } = useTranslation()
  const { chat, isConfigured } = useAI()
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Calculate width from clientRect
  const editorWidth = props.clientRect ? props.clientRect()?.width : undefined

  const handleSubmit = async () => {
    if (!prompt || prompt.trim().length === 0) {
      return
    }

    if (!isConfigured) {
      setError(t('AI is not configured. Please configure it in settings.'))
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await chat([
        {
          role: 'user',
          content: prompt
        }
      ])
      setResult(response)
    } catch (err: any) {
      console.error('AI Command Error:', err)
      setError(err.message || t('Failed to get AI response'))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Stop propagation to prevent editor from handling these keys
    e.stopPropagation()

    if (e.key === 'Enter') {
      e.preventDefault()
      if (result && !loading) {
        // Insert the result if we already have one
        props.command({ text: result })
      } else if (prompt && !loading) {
        // Submit the prompt if we don't have a result yet
        handleSubmit()
      }
    }
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      // Always capture Enter key in this component
      if (event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        return true
      }
      return false
    }
  }))

  if (!isConfigured) {
    return (
      <div
        className="border rounded-lg bg-background z-50 pointer-events-auto p-3"
        style={{ width: editorWidth ? `${editorWidth}px` : '100%' }}
      >
        <p className="text-sm text-destructive">
          {t('AI is not configured. Please configure it in settings.')}
        </p>
      </div>
    )
  }

  return (
    <div
      className="border rounded-lg bg-background z-50 pointer-events-auto p-3 space-y-3"
      style={{ width: editorWidth ? `${editorWidth}px` : '100%' }}
    >
      {/* Input Section */}
      <div
        className="flex gap-2"
        onClick={(e) => {
          e.stopPropagation()
          inputRef.current?.focus()
        }}
      >
        <Input
          ref={inputRef}
          type="text"
          placeholder={t('Ask AI anything...')}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          disabled={loading}
          className="flex-1"
          autoFocus
        />
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleSubmit()
          }}
          disabled={!prompt || loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">{t('Thinking...')}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-2 bg-destructive/10 text-destructive rounded text-sm">
          {error}
        </div>
      )}

      {/* Result Section */}
      {result && !loading && (
        <div className="space-y-2">
          <div className="text-sm">
            <div className="font-medium mb-1">{t('AI Result:')}</div>
            <div className="bg-muted p-2 rounded max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
              {result}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => props.command({ text: result })}
              className="flex-1"
            >
              {t('Insert')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Copy to clipboard
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
      )}
    </div>
  )
})

AICommandList.displayName = 'AICommandList'
export default AICommandList
