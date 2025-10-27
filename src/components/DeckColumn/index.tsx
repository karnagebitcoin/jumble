import { cn } from '@/lib/utils'
import { TPinnedColumn, TFeedSubRequest } from '@/types'
import { X, Compass, Bell, UserRound, Search, Server, Bookmark, BookOpen } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import Explore from '@/components/Explore'
import NotificationList from '@/components/NotificationList'
import Profile from '@/components/Profile'
import SearchResult from '@/components/SearchResult'
import Relay from '@/components/Relay'
import NormalFeed from '@/components/NormalFeed'
import BookmarkList from '@/components/BookmarkList'
import ArticleList from '@/components/ArticleList'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '../ui/button'
import { usePageTheme } from '@/providers/PageThemeProvider'
import { useDeckView } from '@/providers/DeckViewProvider'
import { useCustomFeeds } from '@/providers/CustomFeedsProvider'
import { useFavoriteRelays } from '@/providers/FavoriteRelaysProvider'
import { DeepBrowsingProvider } from '@/providers/DeepBrowsingProvider'
import { BIG_RELAY_URLS, SEARCHABLE_RELAY_URLS } from '@/constants'
import { normalizeUrl, simplifyUrl } from '@/lib/url'
import { useTranslation } from 'react-i18next'
import { useFetchProfile, useFetchFollowings } from '@/hooks'
import Username from '../Username'
import { useNostr } from '@/providers/NostrProvider'
import client from '@/services/client.service'

export default function DeckColumn({ column }: { column: TPinnedColumn }) {
  const { pageTheme } = usePageTheme()
  const { unpinColumn } = useDeckView()
  const { customFeeds } = useCustomFeeds()
  const { relaySets } = useFavoriteRelays()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  let content: React.ReactNode = null
  let titlebar: React.ReactNode = null

  switch (column.type) {
    case 'explore':
      titlebar = <ExploreTitlebar onClose={() => unpinColumn(column.id)} />
      content = <Explore />
      break
    case 'notifications':
      titlebar = <NotificationsTitlebar onClose={() => unpinColumn(column.id)} />
      content = <NotificationList isInDeckView={true} />
      break
    case 'profile':
      if (column.props?.pubkey) {
        titlebar = <ProfileTitlebar pubkey={column.props.pubkey} onClose={() => unpinColumn(column.id)} />
        content = <Profile id={column.props.pubkey} isInDeckView={true} />
      }
      break
    case 'search':
      if (column.props?.searchParams) {
        titlebar = <SearchTitlebar searchParams={column.props.searchParams} onClose={() => unpinColumn(column.id)} />
        content = <SearchResult searchParams={column.props.searchParams} isInDeckView={true} />
      }
      break
    case 'relay':
      if (column.props?.url) {
        const normalizedUrl = normalizeUrl(column.props.url)
        titlebar = <RelayTitlebar url={normalizedUrl} onClose={() => unpinColumn(column.id)} />
        content = <Relay url={normalizedUrl} isInDeckView={true} />
      }
      break
    case 'relays':
      if (column.props?.activeRelaySetId) {
        const relaySet = relaySets.find((s) => s.id === column.props.activeRelaySetId)
        if (relaySet) {
          titlebar = <RelaySetTitlebar name={relaySet.name} onClose={() => unpinColumn(column.id)} />
          content = (
            <NormalFeed
              subRequests={[{ urls: relaySet.relayUrls, filter: {} }]}
              showRelayCloseReason
              isInDeckView={true}
            />
          )
        }
      }
      break
    case 'custom':
      if (column.props?.customFeedId) {
        const customFeed = customFeeds.find((f) => f.id === column.props.customFeedId)
        if (customFeed) {
          titlebar = <CustomFeedTitlebar name={customFeed.name} onClose={() => unpinColumn(column.id)} />
          const { searchParams } = customFeed
          if (searchParams.type === 'notes') {
            content = (
              <NormalFeed
                subRequests={[
                  { urls: SEARCHABLE_RELAY_URLS, filter: { search: searchParams.search } }
                ]}
                showRelayCloseReason
                isInDeckView={true}
              />
            )
          } else if (searchParams.type === 'hashtag') {
            content = (
              <NormalFeed
                subRequests={[{ urls: BIG_RELAY_URLS, filter: { '#t': [searchParams.search] } }]}
                showRelayCloseReason
                isInDeckView={true}
              />
            )
          }
        }
      }
      break
    case 'bookmarks':
      titlebar = <BookmarksTitlebar onClose={() => unpinColumn(column.id)} />
      content = (
        <div className="px-4 pt-4">
          <BookmarkList />
        </div>
      )
      break
    case 'reads':
      titlebar = <ReadsTitlebar onClose={() => unpinColumn(column.id)} />
      content = <ReadsContent />
      break
  }

  if (!content) {
    return null
  }

  return (
    <div
      className={cn(
        'rounded-lg shadow-lg bg-background overflow-hidden flex flex-col',
        pageTheme === 'pure-black' && 'border border-neutral-900'
      )}
    >
      {titlebar && (
        <div className={cn(
          "sticky top-0 z-10 border-b bg-background h-12 flex items-center",
          pageTheme === 'pure-black' && 'border-neutral-900'
        )}>
          {titlebar}
        </div>
      )}
      <DeepBrowsingProvider active={true} scrollAreaRef={scrollAreaRef}>
        <ScrollArea
          className="h-full overflow-auto"
          scrollBarClassName="z-50 pt-12"
          ref={scrollAreaRef}
        >
          {content}
          <div className="h-4" />
        </ScrollArea>
      </DeepBrowsingProvider>
    </div>
  )
}

// Titlebar components
function ExploreTitlebar({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-2 px-3 h-full w-full">
      <div className="flex items-center gap-2 min-w-0">
        <Compass className="shrink-0" />
        <div className="text-lg font-semibold truncate" style={{ fontSize: `calc(var(--font-size, 14px) * 1.286)` }}>
          {t('Explore')}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

function NotificationsTitlebar({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-2 px-3 h-full w-full">
      <div className="flex items-center gap-2 min-w-0">
        <Bell className="shrink-0" />
        <div className="text-lg font-semibold truncate" style={{ fontSize: `calc(var(--font-size, 14px) * 1.286)` }}>
          {t('Notifications')}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

function ProfileTitlebar({ pubkey, onClose }: { pubkey: string; onClose: () => void }) {
  const { profile } = useFetchProfile(pubkey)
  return (
    <div className="flex items-center justify-between gap-2 px-3 h-full w-full">
      <div className="flex items-center gap-2 min-w-0">
        <UserRound className="shrink-0" />
        <div className="text-lg font-semibold truncate" style={{ fontSize: `calc(var(--font-size, 14px) * 1.286)` }}>
          <Username userId={pubkey} />
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

function SearchTitlebar({ searchParams, onClose }: { searchParams: any; onClose: () => void }) {
  const displayText = searchParams.input || searchParams.search || 'Search'
  return (
    <div className="flex items-center justify-between gap-2 px-3 h-full w-full">
      <div className="flex items-center gap-2 min-w-0">
        <Search className="shrink-0" />
        <div className="text-lg font-semibold truncate" style={{ fontSize: `calc(var(--font-size, 14px) * 1.286)` }}>
          {displayText}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

function RelayTitlebar({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 h-full w-full">
      <div className="flex items-center gap-2 min-w-0">
        <Server className="shrink-0" />
        <div className="text-lg font-semibold truncate" style={{ fontSize: `calc(var(--font-size, 14px) * 1.286)` }}>
          {simplifyUrl(url)}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

function RelaySetTitlebar({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 h-full w-full">
      <div className="flex items-center gap-2 min-w-0">
        <Server className="shrink-0" />
        <div className="text-lg font-semibold truncate" style={{ fontSize: `calc(var(--font-size, 14px) * 1.286)` }}>
          {name}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

function CustomFeedTitlebar({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 h-full w-full">
      <div className="flex items-center gap-2 min-w-0">
        <Search className="shrink-0" />
        <div className="text-lg font-semibold truncate" style={{ fontSize: `calc(var(--font-size, 14px) * 1.286)` }}>
          {name}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

function BookmarksTitlebar({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-2 px-3 h-full w-full">
      <div className="flex items-center gap-2 min-w-0">
        <Bookmark className="shrink-0" />
        <div className="text-lg font-semibold truncate" style={{ fontSize: `calc(var(--font-size, 14px) * 1.286)` }}>
          {t('Bookmarks')}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

function ReadsTitlebar({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-2 px-3 h-full w-full">
      <div className="flex items-center gap-2 min-w-0">
        <BookOpen className="shrink-0" />
        <div className="text-lg font-semibold truncate" style={{ fontSize: `calc(var(--font-size, 14px) * 1.286)` }}>
          {t('Reads')}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  )
}

function ReadsContent() {
  const { pubkey } = useNostr()
  const { followings } = useFetchFollowings(pubkey)
  const [subRequests, setSubRequests] = useState<TFeedSubRequest[]>([])

  useEffect(() => {
    if (!pubkey || !followings.length) {
      setSubRequests([])
      return
    }

    const init = async () => {
      const relayList = await client.fetchRelayList(pubkey)
      setSubRequests([
        {
          urls: relayList.read.concat(BIG_RELAY_URLS).slice(0, 8),
          filter: {
            authors: followings
          }
        }
      ])
    }

    init()
  }, [pubkey, followings])

  if (!pubkey || !followings.length) {
    return null
  }

  return <ArticleList subRequests={subRequests} />
}
