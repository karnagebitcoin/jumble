import { cn } from '@/lib/utils'
import { useMemo } from 'react'

export default function ExternalLink({ url, className }: { url: string; className?: string }) {
  const displayUrl = useMemo(() => getDisplayUrl(url), [url])

  return (
    <a
      className={cn('text-primary hover:underline', className)}
      href={url}
      target="_blank"
      onClick={(e) => e.stopPropagation()}
      rel="noreferrer"
      title={url}
    >
      {displayUrl}
    </a>
  )
}

const getDisplayUrl = (url: string, maxLength: number = 30) => {
  try {
    const urlObj = new URL(url)
    let domain = urlObj.hostname
    const path = urlObj.pathname

    if (domain.startsWith('www.')) {
      domain = domain.slice(4)
    }

    if (!path || path === '/') {
      return domain
    }

    const displayUrl = domain + path

    if (displayUrl.length > maxLength) {
      return domain + path.slice(0, maxLength - domain.length - 3) + '...'
    }

    return displayUrl
  } catch {
    return url
  }
}
