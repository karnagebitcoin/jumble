import { Separator } from '@/components/ui/separator'
import { isMentioningMutedUsers } from '@/lib/event'
import { tagNameEquals } from '@/lib/tag'
import { useContentPolicy } from '@/providers/ContentPolicyProvider'
import { useMuteList } from '@/providers/MuteListProvider'
import client from '@/services/client.service'
import { Event, kinds, nip19, verifyEvent } from 'nostr-tools'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MainNoteCard from './MainNoteCard'
import RepostDescription from './RepostDescription'

export default function RepostNoteCard({
  event,
  className,
  filterMutedNotes = true,
  pinned = false,
  hideSeparator = false
}: {
  event: Event
  className?: string
  filterMutedNotes?: boolean
  pinned?: boolean
  hideSeparator?: boolean
}) {
  const { t } = useTranslation()
  const { mutePubkeySet } = useMuteList()
  const { hideContentMentioningMutedUsers, alwaysHideMutedNotes } = useContentPolicy()
  const [targetEvent, setTargetEvent] = useState<Event | null>(null)
  const isMuted = useMemo(() => {
    return targetEvent && filterMutedNotes && mutePubkeySet.has(targetEvent.pubkey)
  }, [targetEvent, filterMutedNotes, mutePubkeySet])
  const shouldHide = useMemo(() => {
    if (!targetEvent) return true
    if (isMuted && !alwaysHideMutedNotes) {
      return true
    }
    if (hideContentMentioningMutedUsers && isMentioningMutedUsers(targetEvent, mutePubkeySet)) {
      return true
    }
    return false
  }, [targetEvent, isMuted, alwaysHideMutedNotes, hideContentMentioningMutedUsers, mutePubkeySet])
  useEffect(() => {
    const fetch = async () => {
      try {
        const eventFromContent = event.content ? (JSON.parse(event.content) as Event) : null
        if (eventFromContent && verifyEvent(eventFromContent)) {
          if (eventFromContent.kind === kinds.Repost) {
            return
          }
          client.addEventToCache(eventFromContent)
          const targetSeenOn = client.getSeenEventRelays(eventFromContent.id)
          if (targetSeenOn.length === 0) {
            const seenOn = client.getSeenEventRelays(event.id)
            seenOn.forEach((relay) => {
              client.trackEventSeenOn(eventFromContent.id, relay)
            })
          }
          setTargetEvent(eventFromContent)
          return
        }

        const [, id, relay, , pubkey] = event.tags.find(tagNameEquals('e')) ?? []
        if (!id) {
          return
        }
        const targetEventId = nip19.neventEncode({
          id,
          relays: relay ? [relay] : [],
          author: pubkey
        })
        const targetEvent = await client.fetchEvent(targetEventId)
        if (targetEvent) {
          setTargetEvent(targetEvent)
        }
      } catch {
        // ignore
      }
    }
    fetch()
  }, [event])

  if (!targetEvent || shouldHide) return null

  // If alwaysHideMutedNotes is enabled and the note is muted, show a message in the repost
  if (alwaysHideMutedNotes && isMuted) {
    return (
      <div className={className}>
        <div className="py-3">
          <RepostDescription className="px-4" reposter={event.pubkey} />
          <div className="px-4 mt-2 text-muted-foreground font-medium">
            {t('You muted this note')}
          </div>
        </div>
        {!hideSeparator && <Separator />}
      </div>
    )
  }

  return (
    <MainNoteCard
      className={className}
      reposter={event.pubkey}
      event={targetEvent}
      pinned={pinned}
      hideSeparator={hideSeparator}
    />
  )
}
