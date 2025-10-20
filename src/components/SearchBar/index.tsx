import PinButton from '@/components/PinButton'
import SearchInput from '@/components/SearchInput'
import { useSearchProfiles } from '@/hooks'
import { toNote } from '@/lib/link'
import { randomString } from '@/lib/random'
import { normalizeUrl } from '@/lib/url'
import { cn } from '@/lib/utils'
import { useSecondaryPage } from '@/PageManager'
import { useCustomFeeds } from '@/providers/CustomFeedsProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import modalManager from '@/services/modal-manager.service'
import { TCustomFeed, TSearchParams } from '@/types'
import { Hash, Notebook, Plus, Search, Server } from 'lucide-react'
import { nip19 } from 'nostr-tools'
import {
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { Input } from '../ui/input'
import UserItem, { UserItemSkeleton } from '../UserItem'

const SearchBar = forwardRef<
  TSearchBarRef,
  {
    input: string
    setInput: (input: string) => void
    onSearch: (params: TSearchParams | null) => void
    currentSearchParams?: TSearchParams | null
  }
>(({ input, setInput, onSearch, currentSearchParams }, ref) => {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const { isSmallScreen } = useScreenSize()
  const { addCustomFeed, customFeeds } = useCustomFeeds()
  const [debouncedInput, setDebouncedInput] = useState(input)
  const { profiles, isFetching: isFetchingProfiles } = useSearchProfiles(debouncedInput, 5)
  const [searching, setSearching] = useState(false)
  const [displayList, setDisplayList] = useState(false)
  const [selectableOptions, setSelectableOptions] = useState<TSearchParams[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [feedName, setFeedName] = useState('')
  const normalizedUrl = useMemo(() => {
    if (['w', 'ws', 'ws:', 'ws:/', 'wss', 'wss:', 'wss:/'].includes(input)) {
      return undefined
    }
    try {
      return normalizeUrl(input)
    } catch {
      return undefined
    }
  }, [input])
  const id = useMemo(() => `search-${randomString()}`, [])

  useImperativeHandle(ref, () => ({
    focus: () => {
      searchInputRef.current?.focus()
    },
    blur: () => {
      searchInputRef.current?.blur()
    }
  }))

  useEffect(() => {
    if (!input) {
      onSearch(null)
    }
    setSelectedIndex(-1)
  }, [input])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(input)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [input])

  const blur = () => {
    setSearching(false)
    searchInputRef.current?.blur()
  }

  const updateSearch = (params: TSearchParams) => {
    blur()

    if (params.type === 'note') {
      push(toNote(params.search))
    } else {
      onSearch(params)
    }
  }

  useEffect(() => {
    const search = input.trim()
    if (!search) return

    if (/^[0-9a-f]{64}$/.test(search)) {
      setSelectableOptions([
        { type: 'note', search },
        { type: 'profile', search }
      ])
      return
    }

    try {
      let id = search
      if (id.startsWith('nostr:')) {
        id = id.slice(6)
      }
      const { type } = nip19.decode(id)
      if (['nprofile', 'npub'].includes(type)) {
        setSelectableOptions([{ type: 'profile', search: id }])
        return
      }
      if (['nevent', 'naddr', 'note'].includes(type)) {
        setSelectableOptions([{ type: 'note', search: id }])
        return
      }
    } catch {
      // ignore
    }

    const hashtag = search.match(/[\p{L}\p{N}\p{M}]+/u)?.[0].toLowerCase() ?? ''

    setSelectableOptions([
      { type: 'notes', search },
      { type: 'hashtag', search: hashtag, input: `#${hashtag}` },
      ...(normalizedUrl ? [{ type: 'relay', search: normalizedUrl, input: normalizedUrl }] : []),
      ...profiles.map((profile) => ({
        type: 'profile',
        search: profile.npub,
        input: profile.username
      })),
      ...(profiles.length >= 5 ? [{ type: 'profiles', search }] : [])
    ] as TSearchParams[])
  }, [input, debouncedInput, profiles])

  const list = useMemo(() => {
    if (selectableOptions.length <= 0) {
      return null
    }

    return (
      <>
        {selectableOptions.map((option, index) => {
          if (option.type === 'note') {
            return (
              <NoteItem
                key={index}
                selected={selectedIndex === index}
                id={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'profile') {
            return (
              <ProfileItem
                key={index}
                selected={selectedIndex === index}
                userId={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'notes') {
            return (
              <NormalItem
                key={index}
                selected={selectedIndex === index}
                search={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'hashtag') {
            return (
              <HashtagItem
                key={index}
                selected={selectedIndex === index}
                hashtag={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'relay') {
            return (
              <RelayItem
                key={index}
                selected={selectedIndex === index}
                url={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'profiles') {
            return (
              <Item
                key={index}
                selected={selectedIndex === index}
                onClick={() => updateSearch(option)}
              >
                <div className="font-semibold">{t('Show more...')}</div>
              </Item>
            )
          }
          return null
        })}
        {isFetchingProfiles && profiles.length < 5 && (
          <div className="px-2">
            <UserItemSkeleton hideFollowButton />
          </div>
        )}
      </>
    )
  }, [selectableOptions, selectedIndex, isFetchingProfiles, profiles])

  useEffect(() => {
    setDisplayList(searching && !!input)
  }, [searching, input])

  useEffect(() => {
    if (displayList && list) {
      modalManager.register(id, () => {
        setDisplayList(false)
      })
    } else {
      modalManager.unregister(id)
    }
  }, [displayList, list])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.stopPropagation()
        if (selectableOptions.length <= 0) {
          return
        }
        onSearch(selectableOptions[selectedIndex >= 0 ? selectedIndex : 0])
        blur()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (selectableOptions.length <= 0) {
          return
        }
        setSelectedIndex((prev) => (prev + 1) % selectableOptions.length)
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (selectableOptions.length <= 0) {
          return
        }
        setSelectedIndex((prev) => (prev - 1 + selectableOptions.length) % selectableOptions.length)
        return
      }

      if (e.key === 'Escape') {
        blur()
        return
      }
    },
    [input, onSearch, selectableOptions, selectedIndex]
  )

  const handleSaveFeed = () => {
    if (!currentSearchParams) return

    // Generate default name based on search params
    let defaultName = ''
    if (currentSearchParams.type === 'notes') {
      defaultName = currentSearchParams.search
    } else if (currentSearchParams.type === 'hashtag') {
      defaultName = `#${currentSearchParams.search}`
    } else {
      defaultName = currentSearchParams.input || currentSearchParams.search
    }

    setFeedName(defaultName)
    setShowSaveDialog(true)
  }

  const handleConfirmSave = () => {
    if (!currentSearchParams || !feedName.trim()) return

    const feed: TCustomFeed = {
      id: randomString(),
      name: feedName.trim(),
      searchParams: currentSearchParams
    }

    addCustomFeed(feed)
    setShowSaveDialog(false)
    setFeedName('')
  }

  const canSaveFeed = useMemo(() => {
    if (!currentSearchParams) return false
    // Can save notes and hashtag searches
    return currentSearchParams.type === 'notes' || currentSearchParams.type === 'hashtag'
  }, [currentSearchParams])

  return (
    <>
      <div className="relative flex gap-1 items-center h-full w-full">
        {displayList && list && (
          <>
            <div
              className={cn(
                'bg-surface-background rounded-b-lg shadow-lg z-50',
                isSmallScreen
                  ? 'fixed top-12 inset-x-0'
                  : 'absolute top-full -translate-y-1 inset-x-0 pt-1 '
              )}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="h-fit">{list}</div>
            </div>
            <div className="fixed inset-0 w-full h-full" onClick={() => blur()} />
          </>
        )}
        <SearchInput
          ref={searchInputRef}
          className={cn(
            'bg-surface-background shadow-inner h-full border-none flex-1',
            searching ? 'z-50' : ''
          )}
          placeholder={t('People, keywords, or relays')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setSearching(true)}
          onBlur={() => setSearching(false)}
        />
        {currentSearchParams && (
          <PinButton
            column={{
              type: 'search',
              props: { searchParams: currentSearchParams }
            }}
          />
        )}
        {canSaveFeed && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1"
            onClick={handleSaveFeed}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">{t('Save feed')}</span>
          </Button>
        )}
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Save Custom Feed')}</DialogTitle>
            <DialogDescription>
              {t('Give this search feed a name to quickly access it later.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder={t('Feed name')}
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirmSave()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              {t('Cancel')}
            </Button>
            <Button onClick={handleConfirmSave} disabled={!feedName.trim()}>
              {t('Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})
SearchBar.displayName = 'SearchBar'
export default SearchBar

export type TSearchBarRef = {
  focus: () => void
  blur: () => void
}

function NormalItem({
  search,
  onClick,
  selected
}: {
  search: string
  onClick?: () => void
  selected?: boolean
}) {
  return (
    <Item onClick={onClick} selected={selected}>
      <Search className="text-muted-foreground" />
      <div className="font-semibold truncate">{search}</div>
    </Item>
  )
}

function HashtagItem({
  hashtag,
  onClick,
  selected
}: {
  hashtag: string
  onClick?: () => void
  selected?: boolean
}) {
  return (
    <Item onClick={onClick} selected={selected}>
      <Hash className="text-muted-foreground" />
      <div className="font-semibold truncate">{hashtag}</div>
    </Item>
  )
}

function NoteItem({
  id,
  onClick,
  selected
}: {
  id: string
  onClick?: () => void
  selected?: boolean
}) {
  return (
    <Item onClick={onClick} selected={selected}>
      <Notebook className="text-muted-foreground" />
      <div className="font-semibold truncate">{id}</div>
    </Item>
  )
}

function ProfileItem({
  userId,
  onClick,
  selected
}: {
  userId: string
  onClick?: () => void
  selected?: boolean
}) {
  return (
    <div
      className={cn('px-2 hover:bg-accent rounded-md cursor-pointer', selected && 'bg-accent')}
      onClick={onClick}
    >
      <UserItem pubkey={userId} hideFollowButton className="pointer-events-none" />
    </div>
  )
}

function RelayItem({
  url,
  onClick,
  selected
}: {
  url: string
  onClick?: () => void
  selected?: boolean
}) {
  return (
    <Item onClick={onClick} selected={selected}>
      <Server className="text-muted-foreground" />
      <div className="font-semibold truncate">{url}</div>
    </Item>
  )
}

function Item({
  className,
  children,
  selected,
  ...props
}: HTMLAttributes<HTMLDivElement> & { selected?: boolean }) {
  return (
    <div
      className={cn(
        'flex gap-2 items-center px-2 py-3 hover:bg-accent rounded-md cursor-pointer',
        selected ? 'bg-accent' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
