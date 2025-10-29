import { Button } from '@/components/ui/button'
import { useAI } from '@/providers/AIProvider'
import { ArrowRight, Loader2 } from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type AICommandListProps = {
  command: (props: { text: string }) => void
  query: string
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
      const response = await chat([
        {
          role: 'user',
          content: props.query
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

  // Reset submitted state when query changes
  useEffect(() => {
    setSubmitted(false)
    setResult('')
    setError('')
  }, [props.query])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        if (result && !loading) {
          // Insert the result if we have one
          props.command({ text: result })
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
        <span className="text-xs text-muted-foreground">{t('Thinking...')}</span>
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
