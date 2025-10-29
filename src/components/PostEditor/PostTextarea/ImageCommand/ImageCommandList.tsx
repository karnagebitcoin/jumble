import { Button } from '@/components/ui/button'
import { useAI } from '@/providers/AIProvider'
import Image from '@/components/Image'
import { ArrowRight, Loader2 } from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type ImageCommandListProps = {
  command: (props: { text: string }) => void
  query: string
}

export type ImageCommandListHandle = {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean
}

const ImageCommandList = forwardRef<ImageCommandListHandle, ImageCommandListProps>((props, ref) => {
  const { t } = useTranslation()
  const { generateImage, isConfigured, serviceConfig } = useAI()
  const [imageUrl, setImageUrl] = useState<string>('')
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

    if (!serviceConfig.imageModel) {
      setError(t('Image model is not configured. Please select an image model in AI settings.'))
      return
    }

    setSubmitted(true)
    setLoading(true)
    setError('')
    setImageUrl('')

    console.log('=== ImageCommandList: Generating image ===')
    console.log('Query:', props.query)

    try {
      const url = await generateImage(props.query)
      console.log('=== ImageCommandList: Result ===')
      console.log('URL type:', typeof url)
      console.log('URL value:', url)
      console.log('URL length:', url?.length)

      // Check if it's a data URL
      if (url.startsWith('data:')) {
        console.log('✓ Result is a data URL (base64 encoded image)')
      } else if (url.startsWith('http')) {
        console.log('✓ Result is an HTTP URL')
      } else {
        console.log('⚠ Result is neither data URL nor HTTP URL')
      }

      setImageUrl(url)
    } catch (err: any) {
      console.error('=== ImageCommandList: Error ===')
      console.error('Error:', err)
      console.error('Error message:', err.message)
      setError(err.message || t('Failed to generate image'))
    } finally {
      setLoading(false)
      console.log('=== ImageCommandList: Complete ===')
    }
  }

  // Reset submitted state when query changes
  useEffect(() => {
    setSubmitted(false)
    setImageUrl('')
    setError('')
  }, [props.query])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        if (imageUrl && !loading) {
          // Insert the image URL
          props.command({ text: imageUrl })
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
        {t('Describe the image you want to generate...')}
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

  if (!serviceConfig.imageModel) {
    return (
      <div className="border rounded-lg bg-background z-50 pointer-events-auto p-2 max-w-md">
        <p className="text-xs text-destructive">
          {t('Image model is not configured. Please select an image model in AI settings.')}
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
          {t('Press Enter or click to generate')}
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
          {t('Generating image...')}
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
  if (imageUrl) {
    return (
      <div className="border rounded-lg bg-background z-50 pointer-events-auto p-3 max-w-md space-y-2">
        <div className="text-xs text-muted-foreground mb-2">{t('Generated Image:')}</div>

        {/* Image Preview */}
        <div className="w-full border rounded-lg overflow-hidden bg-muted">
          <Image
            image={{ url: imageUrl }}
            className="w-full h-auto max-h-96 object-contain"
            hideIfError
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              props.command({ text: imageUrl })
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
              navigator.clipboard.writeText(imageUrl)
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

  return null
})

ImageCommandList.displayName = 'ImageCommandList'
export default ImageCommandList
