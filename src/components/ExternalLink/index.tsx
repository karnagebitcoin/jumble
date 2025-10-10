import { cn } from '@/lib/utils'

export default function ExternalLink({ url, className }: { url: string; className?: string }) {
  return (
    <a
      className={cn('text-primary hover:underline', className)}
      href={url}
      target="_blank"
      onClick={(e) => e.stopPropagation()}
      rel="noreferrer"
    >
      {url}
    </a>
  )
}
