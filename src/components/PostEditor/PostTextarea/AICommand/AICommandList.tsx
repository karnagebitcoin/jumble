import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAI } from '@/providers/AIProvider'
import { Loader2 } from 'lucide-react'
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

  useEffect(() => {
    const fetchResult = async () => {
      if (!props.query || props.query.trim().length === 0) {
        setResult('')
        setError('')
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

    // Debounce the AI call
    const timer = setTimeout(() => {
      fetchResult()
    }, 500)

    return () => clearTimeout(timer)
  }, [props.query, chat, isConfigured, t])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'Enter' && result && !loading) {
        event.preventDefault()
        props.command({ text: result })
        return true
      }
      return false
    }
  }))

  if (!props.query || props.query.trim().length === 0) {
    return (
      <Card className="p-3 max-w-md">
        <p className="text-sm text-muted-foreground">
          {t('Type your prompt after /ai. Examples:')}
        </p>
        <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
          <li>{t('find me the link to madonna die another day')}</li>
          <li>{t('write a joke about bitcoin')}</li>
          <li>{t('translate "hello world" to japanese')}</li>
        </ul>
      </Card>
    )
  }

  if (!isConfigured) {
    return (
      <Card className="p-3 max-w-md">
        <p className="text-sm text-destructive">{error}</p>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="p-3 max-w-md">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">{t('Thinking...')}</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-3 max-w-md">
        <p className="text-sm text-destructive">{error}</p>
      </Card>
    )
  }

  if (!result) {
    return null
  }

  return (
    <Card className="p-3 max-w-md space-y-2">
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
        {t('Press Enter to insert or click Insert button')}
      </p>
    </Card>
  )
})

AICommandList.displayName = 'AICommandList'
export default AICommandList
