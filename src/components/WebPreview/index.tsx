import { useFetchWebMetadata } from '@/hooks/useFetchWebMetadata'
import { cn } from '@/lib/utils'
import { useContentPolicy } from '@/providers/ContentPolicyProvider'
import { useMemo } from 'react'
import Image from '../Image'

export default function WebPreview({ url, className }: { url: string; className?: string }) {
  const { autoLoadMedia } = useContentPolicy()
  const { title, description, image } = useFetchWebMetadata(url)

  const hostname = useMemo(() => {
    try {
      return new URL(url).hostname
    } catch {
      return ''
    }
  }, [url])

  if (!autoLoadMedia) {
    return null
  }

  if (!title) {
    return null
  }

  return (
    <div
      className={cn('p-2 clickable flex gap-2 w-full border rounded-lg overflow-hidden', className)}
      onClick={(e) => {
        e.stopPropagation()
        window.open(url, '_blank')
      }}
    >
      {image && (
        <Image
          image={{ url: image }}
          className="w-10 h-10 rounded flex-shrink-0"
          hideIfError
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold line-clamp-1 text-sm">{title}</div>
        {description && (
          <div className="text-xs text-muted-foreground line-clamp-2">{description}</div>
        )}
        <div className="text-xs text-muted-foreground mt-0.5">{hostname}</div>
      </div>
    </div>
  )
}
