import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useNostr } from '@/providers/NostrProvider'
import { useSecondaryPage } from '@/PageManager'
import { useLists } from '@/providers/ListsProvider'
import { TPageRef } from '@/types'
import { Plus, Edit, Trash2, Users, Search, ArrowLeft } from 'lucide-react'
import { toCreateList, toList, toEditList } from '@/lib/link'
import UserAvatar from '@/components/UserAvatar'
import Username from '@/components/Username'
import PinButton from '@/components/PinButton'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import client from '@/services/client.service'
import { ExtendedKind, BIG_RELAY_URLS } from '@/constants'
import { Event } from 'nostr-tools'
import { TStarterPack } from '@/providers/ListsProvider'
import NoteList from '@/components/NoteList'

const ListsPage = forwardRef((_, ref) => {
  const { t } = useTranslation()
  const layoutRef = useRef<TPageRef>(null)
  const { pubkey, checkLogin } = useNostr()
  const { push } = useSecondaryPage()
  const { lists, isLoading: isLoadingMyLists, deleteList, fetchLists } = useLists()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<TStarterPack[]>([])
  const [allPublicLists, setAllPublicLists] = useState<TStarterPack[]>([])
  const [isLoadingPublicLists, setIsLoadingPublicLists] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [listToDelete, setListToDelete] = useState<string | null>(null)
  const [selectedList, setSelectedList] = useState<TStarterPack | null>(null)
  const [isLoadingSelectedList, setIsLoadingSelectedList] = useState(false)

  useImperativeHandle(ref, () => layoutRef.current)

  useEffect(() => {
    if (pubkey) {
      fetchLists()
    }
  }, [pubkey])

  // Fetch public starter packs from relays on mount
  useEffect(() => {
    const fetchPublicLists = async () => {
      setIsLoadingPublicLists(true)
      try {
        // Fetch recent starter pack events from big relays
        const events = await client.fetchEvents(BIG_RELAY_URLS.slice(0, 5), {
          kinds: [ExtendedKind.STARTER_PACK],
          limit: 50
        })

        const parsedLists: TStarterPack[] = events.map((event) => parseStarterPackEvent(event))

        // Sort by event creation time (most recent first)
        parsedLists.sort((a, b) => b.event.created_at - a.event.created_at)

        // Remove duplicates (same author + d-tag)
        const uniqueLists = parsedLists.filter((list, index, self) =>
          index === self.findIndex((l) =>
            l.event.pubkey === list.event.pubkey && l.id === list.id
          )
        )

        setAllPublicLists(uniqueLists)
      } catch (error) {
        console.error('Failed to fetch public lists:', error)
      } finally {
        setIsLoadingPublicLists(false)
      }
    }

    fetchPublicLists()
  }, [])

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    const searchInLists = () => {
      const query = searchQuery.toLowerCase()
      const filtered = allPublicLists.filter((list) => {
        return (
          list.title.toLowerCase().includes(query) ||
          list.description?.toLowerCase().includes(query)
        )
      })
      setSearchResults(filtered)
      setIsSearching(false)
    }

    const debounce = setTimeout(searchInLists, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, allPublicLists])

  const parseStarterPackEvent = (event: Event): TStarterPack => {
    const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1] || ''
    const title = event.tags.find((tag) => tag[0] === 'title')?.[1] || 'Untitled List'
    const description = event.tags.find((tag) => tag[0] === 'description')?.[1]
    const image = event.tags.find((tag) => tag[0] === 'image')?.[1]
    const pubkeys = event.tags.filter((tag) => tag[0] === 'p').map((tag) => tag[1])

    return {
      id: dTag,
      title,
      description,
      image,
      pubkeys,
      event
    }
  }

  const handleCreateList = () => {
    if (!pubkey) {
      checkLogin()
      return
    }
    push(toCreateList())
  }

  const handleListClick = async (listId: string) => {
    // Parse listId - could be "d-tag" or "pubkey:d-tag"
    let ownerPubkey: string | undefined
    let dTag: string

    if (listId.includes(':')) {
      const [pubkey, tag] = listId.split(':')
      ownerPubkey = pubkey
      dTag = tag
    } else {
      ownerPubkey = pubkey
      dTag = listId
    }

    // Check if it's in our lists
    const ownList = lists.find((l) => l.id === dTag)

    if (ownList) {
      setSelectedList(ownList)
      return
    }

    // Otherwise, fetch the external list
    if (!ownerPubkey || !dTag) return

    setIsLoadingSelectedList(true)
    try {
      const events = await client.fetchEvents(BIG_RELAY_URLS.slice(0, 5), {
        kinds: [ExtendedKind.STARTER_PACK],
        authors: [ownerPubkey],
        '#d': [dTag],
        limit: 1
      })

      if (events.length > 0) {
        const event = events[0]
        const parsedList = parseStarterPackEvent(event)
        setSelectedList(parsedList)
      } else {
        toast.error(t('List not found'))
      }
    } catch (error) {
      console.error('Failed to fetch list:', error)
      toast.error(t('Failed to load list'))
    } finally {
      setIsLoadingSelectedList(false)
    }
  }

  const handleEditList = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    push(toEditList(id))
  }

  const handleDeleteList = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setListToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!listToDelete) return

    const { unwrap } = toast.promise(deleteList(listToDelete), {
      loading: t('Deleting list...'),
      success: t('List deleted!'),
      error: (err) => t('Failed to delete list: {{error}}', { error: err.message })
    })
    await unwrap()
    setDeleteDialogOpen(false)
    setListToDelete(null)
  }

  const renderListCard = (list: TStarterPack, isOwned: boolean = false) => (
    <Card
      key={`${list.event.pubkey}-${list.id}`}
      className="cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden"
      onClick={() => handleListClick(`${list.event.pubkey}:${list.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header with image and title */}
          <div className="flex items-start gap-3">
            {list.image && (
              <img
                src={list.image}
                alt={list.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg line-clamp-2 mb-1">{list.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {list.pubkeys.length}{' '}
                  {list.pubkeys.length === 1 ? t('member') : t('members')}
                </span>
                {!isOwned && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <div className="text-sm text-muted-foreground inline-flex items-center gap-1">
                      <span>{t('by')}</span>
                      <Username pubkey={list.event.pubkey} className="font-medium inline" />
                    </div>
                  </>
                )}
              </div>
            </div>
            {isOwned && (
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleEditList(e, list.id)}
                  title={t('Edit')}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteList(e, list.id)}
                  title={t('Delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Description */}
          {list.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {list.description}
            </p>
          )}

          {/* Profile avatars */}
          {list.pubkeys.length > 0 && (
            <div className="flex items-center -space-x-2 overflow-hidden">
              {list.pubkeys.slice(0, 5).map((pubkey, index) => (
                <div
                  key={pubkey}
                  className="ring-2 ring-background rounded-full"
                  style={{ zIndex: 5 - index }}
                >
                  <UserAvatar pubkey={pubkey} className="w-8 h-8" />
                </div>
              ))}
              {list.pubkeys.length > 5 && (
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-muted ring-2 ring-background text-xs font-medium"
                  style={{ zIndex: 0 }}
                >
                  +{list.pubkeys.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  let content: React.ReactNode = null

  // Show selected list view
  if (selectedList) {
    const isOwnList = selectedList.event.pubkey === pubkey
    content = (
      <div className="flex flex-col h-full">
        {/* List Header */}
        <div className="border-b px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedList(null)}
            className="mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Back to Lists')}
          </Button>

          <div className="flex items-start gap-4">
            {selectedList.image && (
              <img
                src={selectedList.image}
                alt={selectedList.title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-2xl font-bold mb-1">{selectedList.title}</h2>
                {isOwnList && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => push(toEditList(selectedList.id))}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t('Edit')}
                  </Button>
                )}
              </div>
              {!isOwnList && (
                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <span>{t('by')}</span>
                  <Username pubkey={selectedList.event.pubkey} className="font-medium" />
                </div>
              )}
              <div className="text-sm text-muted-foreground mb-3">
                {selectedList.pubkeys.length}{' '}
                {selectedList.pubkeys.length === 1 ? t('member') : t('members')}
              </div>
              {selectedList.description && (
                <p className="text-sm text-muted-foreground">{selectedList.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-auto">
          {selectedList.pubkeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Users className="w-16 h-16 text-muted-foreground opacity-50" />
              <div className="text-muted-foreground">{t('No members in this list')}</div>
              {isOwnList && (
                <Button onClick={() => push(toEditList(selectedList.id))} variant="outline">
                  {t('Add Members')}
                </Button>
              )}
            </div>
          ) : (
            <NoteList
              filter={{
                authors: selectedList.pubkeys,
                kinds: [1, 6]
              }}
            />
          )}
        </div>
      </div>
    )
  } else if (isLoadingSelectedList) {
    content = (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t('Loading list...')}</div>
      </div>
    )
  } else if (!pubkey) {
    content = (
      <div className="flex flex-col items-center justify-center w-full pt-8 gap-4">
        <Users className="w-16 h-16 opacity-50" />
        <p className="text-muted-foreground">{t('Login to create and manage your lists')}</p>
        <Button size="lg" onClick={() => checkLogin()}>
          {t('Login')}
        </Button>
      </div>
    )
  } else {
    content = (
      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search starter packs...')}
                className="pl-9"
              />
            </div>
            <Button onClick={handleCreateList} size="default">
              <Plus className="w-4 h-4 mr-2" />
              {t('Create')}
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t('Search Results')}</h2>
            {isSearching && (
              <div className="text-center text-muted-foreground py-8">{t('Searching...')}</div>
            )}
            {!isSearching && searchResults.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                {t('No starter packs found')}
              </div>
            )}
            <div className="grid gap-4">
              {searchResults.map((list) => renderListCard(list, list.event.pubkey === pubkey))}
            </div>
          </div>
        )}

        {/* My Lists */}
        {!searchQuery && lists.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t('My Lists')}</h2>

            {isLoadingMyLists && (
              <div className="text-center text-muted-foreground py-8">
                {t('Loading lists...')}
              </div>
            )}

            <div className="grid gap-4">
              {lists.map((list) => renderListCard(list, true))}
            </div>
          </div>
        )}

        {/* Discover Public Lists */}
        {!searchQuery && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t('Discover Starter Packs')}</h2>

            {isLoadingPublicLists && (
              <div className="text-center text-muted-foreground py-8">
                {t('Loading starter packs...')}
              </div>
            )}

            {!isLoadingPublicLists && allPublicLists.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('No starter packs found')}</p>
                <p className="text-sm">{t('Try searching or create your own')}</p>
              </div>
            )}

            <div className="grid gap-4">
              {allPublicLists.map((list) => renderListCard(list, list.event.pubkey === pubkey))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <PrimaryPageLayout
      pageName="lists"
      ref={layoutRef}
      titlebar={<ListsPageTitlebar selectedList={selectedList} />}
      displayScrollToTopButton
    >
      {content}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Delete List?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This action cannot be undone. This will permanently delete the list.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('Delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PrimaryPageLayout>
  )
})

ListsPage.displayName = 'ListsPage'
export default ListsPage

function ListsPageTitlebar({ selectedList }: { selectedList: TStarterPack | null }) {
  const { t } = useTranslation()

  return (
    <div className="flex gap-1 items-center h-full justify-between">
      <div className="font-semibold text-lg flex-1 pl-4 truncate">
        {selectedList ? selectedList.title : t('Lists')}
      </div>
      <div className="shrink-0 flex gap-1 items-center">
        <PinButton column={{ type: 'lists' }} size="titlebar-icon" />
      </div>
    </div>
  )
}
