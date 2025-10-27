import { Card } from '@/components/ui/card'
import Username from '@/components/Username'
import UserAvatar from '@/components/UserAvatar'
import { FormattedTimestamp } from '@/components/FormattedTimestamp'
import { SecondaryPageLink } from '@/PageManager'
import { toArticle } from '@/lib/link'
import { NostrEvent } from 'nostr-tools'
import { useMemo } from 'react'
import { nip19 } from 'nostr-tools'

export default function ArticleCard({ event }: { event: NostrEvent }) {
  const { title, summary, image, publishedAt, identifier } = useMemo(() => {
    const titleTag = event.tags.find((tag) => tag[0] === 'title')
    const summaryTag = event.tags.find((tag) => tag[0] === 'summary')
    const imageTag = event.tags.find((tag) => tag[0] === 'image')
    const publishedAtTag = event.tags.find((tag) => tag[0] === 'published_at')
    const dTag = event.tags.find((tag) => tag[0] === 'd')

    return {
      title: titleTag?.[1] || 'Untitled',
      summary: summaryTag?.[1] || '',
      image: imageTag?.[1],
      publishedAt: publishedAtTag?.[1] ? parseInt(publishedAtTag[1]) : event.created_at,
      identifier: dTag?.[1] || ''
    }
  }, [event])

  const naddr = useMemo(() => {
    const dTag = event.tags.find((tag) => tag[0] === 'd')
    if (!dTag) return ''

    return nip19.naddrEncode({
      kind: 30023,
      pubkey: event.pubkey,
      identifier: dTag[1],
      relays: []
    })
  }, [event])

  // Extract first 200 chars from content if no summary
  const displaySummary = useMemo(() => {
    if (summary) return summary

    // Remove markdown formatting for preview
    const plainText = event.content
      .replace(/[#*_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim()

    return plainText.length > 200
      ? plainText.slice(0, 200) + '...'
      : plainText
  }, [summary, event.content])

  return (
    <SecondaryPageLink to={toArticle(naddr)}>
      <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1 line-clamp-2">{title}</h3>
            {displaySummary && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {displaySummary}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserAvatar userId={event.pubkey} size="small" />
              <Username pubkey={event.pubkey} />
              <span>•</span>
              <FormattedTimestamp timestamp={publishedAt} />
            </div>
          </div>
          {image && (
            <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </Card>
    </SecondaryPageLink>
  )
}
