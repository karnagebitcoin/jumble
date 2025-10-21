import { cn } from '@/lib/utils'
import { useNostr } from '@/providers/NostrProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useZap } from '@/providers/ZapProvider'
import noteStatsService from '@/services/note-stats.service'
import { Event } from 'nostr-tools'
import { useEffect, useState } from 'react'
import BookmarkButton from '../BookmarkButton'
import ChargeZapButton from './ChargeZapButton'
import LikeButton from './LikeButton'
import Likes from './Likes'
import ReplyButton from './ReplyButton'
import RepostButton from './RepostButton'
import SeenOnButton from './SeenOnButton'
import TopZaps from './TopZaps'
import ZapButton from './ZapButton'

export default function NoteStats({
  event,
  className,
  classNames,
  fetchIfNotExisting = false,
  displayTopZapsAndLikes = false
}: {
  event: Event
  className?: string
  classNames?: {
    buttonBar?: string
  }
  fetchIfNotExisting?: boolean
  displayTopZapsAndLikes?: boolean
}) {
  const { isSmallScreen } = useScreenSize()
  const { pubkey } = useNostr()
  const { chargeZapEnabled, quickZap, onlyZapsMode } = useZap()
  const [loading, setLoading] = useState(false)

  // Show charge zap button only if charge zap is enabled AND quick zap is enabled
  const showChargeZap = chargeZapEnabled && quickZap

  useEffect(() => {
    if (!fetchIfNotExisting) return
    setLoading(true)
    noteStatsService.fetchNoteStats(event, pubkey).finally(() => setLoading(false))
  }, [event, fetchIfNotExisting])

  if (isSmallScreen) {
    return (
      <div className={cn('select-none', className)}>
        {displayTopZapsAndLikes && (
          <>
            <TopZaps event={event} />
            <Likes event={event} />
          </>
        )}
        <div
          className={cn(
            'flex justify-between items-center h-5 [&_svg]:size-5',
            loading ? 'animate-pulse' : '',
            classNames?.buttonBar
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <ReplyButton event={event} />
          <RepostButton event={event} />
          {!onlyZapsMode && <LikeButton event={event} />}
          <ZapButton event={event} />
          {showChargeZap && <ChargeZapButton event={event} />}
          <BookmarkButton event={event} />
          <SeenOnButton event={event} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('select-none', className)}>
      {displayTopZapsAndLikes && (
        <>
          <TopZaps event={event} />
          <Likes event={event} />
        </>
      )}
      <div className="flex justify-between h-5 [&_svg]:size-4">
        <div
          className={cn('flex items-center', loading ? 'animate-pulse' : '')}
          onClick={(e) => e.stopPropagation()}
        >
          <ReplyButton event={event} />
          <RepostButton event={event} />
          {!onlyZapsMode && <LikeButton event={event} />}
          <ZapButton event={event} />
          {showChargeZap && <ChargeZapButton event={event} />}
        </div>
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <BookmarkButton event={event} />
          <SeenOnButton event={event} />
        </div>
      </div>
    </div>
  )
}
