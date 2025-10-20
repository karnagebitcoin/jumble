import { cn } from '@/lib/utils'
import { TPinnedColumn } from '@/types'
import { X } from 'lucide-react'
import { createRef } from 'react'
import Explore from '@/components/Explore'
import NotificationList from '@/components/NotificationList'
import Profile from '@/components/Profile'
import SearchResult from '@/components/SearchResult'
import Relay from '@/components/Relay'
import NormalFeed from '@/components/NormalFeed'
import BookmarkList from '@/components/BookmarkList'
import { Button } from '../ui/button'
import { usePageTheme } from '@/providers/PageThemeProvider'
import { useDeckView } from '@/providers/DeckViewProvider'
import { useCustomFeeds } from '@/providers/CustomFeedsProvider'
import { useFavoriteRelays } from '@/providers/FavoriteRelaysProvider'
import { BIG_RELAY_URLS, SEARCHABLE_RELAY_URLS } from '@/constants'
import { normalizeUrl } from '@/lib/url'

export default function DeckColumn({ column }: { column: TPinnedColumn }) {
  const { pageTheme } = usePageTheme()
  const { unpinColumn } = useDeckView()
  const { customFeeds } = useCustomFeeds()
  const { relaySets } = useFavoriteRelays()

  let content: React.ReactNode = null

  switch (column.type) {
    case 'explore':
      content = <Explore />
      break
    case 'notifications':
      content = <NotificationList />
      break
    case 'profile':
      if (column.props?.pubkey) {
        content = <Profile id={column.props.pubkey} />
      }
      break
    case 'search':
      if (column.props?.searchParams) {
        content = <SearchResult searchParams={column.props.searchParams} />
      }
      break
    case 'relay':
      if (column.props?.url) {
        const normalizedUrl = normalizeUrl(column.props.url)
        content = <Relay url={normalizedUrl} />
      }
      break
    case 'relays':
      if (column.props?.activeRelaySetId) {
        const relaySet = relaySets.find((s) => s.id === column.props.activeRelaySetId)
        if (relaySet) {
          content = (
            <NormalFeed
              subRequests={[{ urls: relaySet.relayUrls, filter: {} }]}
              showRelayCloseReason
            />
          )
        }
      }
      break
    case 'custom':
      if (column.props?.customFeedId) {
        const customFeed = customFeeds.find((f) => f.id === column.props.customFeedId)
        if (customFeed) {
          const { searchParams } = customFeed
          if (searchParams.type === 'notes') {
            content = (
              <NormalFeed
                subRequests={[
                  { urls: SEARCHABLE_RELAY_URLS, filter: { search: searchParams.search } }
                ]}
                showRelayCloseReason
              />
            )
          } else if (searchParams.type === 'hashtag') {
            content = (
              <NormalFeed
                subRequests={[{ urls: BIG_RELAY_URLS, filter: { '#t': [searchParams.search] } }]}
                showRelayCloseReason
              />
            )
          }
        }
      }
      break
  }

  if (!content) {
    return null
  }

  return (
    <div
      className={cn(
        'rounded-lg shadow-lg bg-background overflow-hidden relative flex flex-col',
        pageTheme === 'pure-black' && 'border border-neutral-900'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-background/80 hover:bg-background"
        onClick={() => unpinColumn(column.id)}
      >
        <X className="size-4" />
      </Button>
      <div className="h-full overflow-hidden">{content}</div>
    </div>
  )
}
