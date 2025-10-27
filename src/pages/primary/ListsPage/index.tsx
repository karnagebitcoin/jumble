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
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react'
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

const ListsPage = forwardRef((_, ref) => {
  const { t } = useTranslation()
  const layoutRef = useRef<TPageRef>(null)
  const { pubkey, checkLogin } = useNostr()
  const { push } = useSecondaryPage()
  const { lists, isLoading: isLoadingMyLists, deleteList, fetchLists } = useLists()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<TStarterPack[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [listToDelete, setListToDelete] = useState<string | null>(null)

  useImperativeHandle(ref, () => layoutRef.current)

  useEffect(() => {
    if (pubkey) {
      fetchLists()
    }
  }, [pubkey])

  useEffect(() => {
    const searchLists = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        // Search for starter pack events on relays
        const events = await client.fetchEvents(BIG_RELAY_URLS.slice(0, 4), {
          kinds: [ExtendedKind.STARTER_PACK],
          limit: 20
        })

        const parsedLists: TStarterPack[] = events
          .map((event) => parseStarterPackEvent(event))
          .filter((list) => {
            const query = searchQuery.toLowerCase()
            return (
              list.title.toLowerCase().includes(query) ||
              list.description?.toLowerCase().includes(query)
            )
          })

        setSearchResults(parsedLists)
      } catch (error) {
        console.error('Failed to search lists:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchLists, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

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

  const handleListClick = (id: string) => {
    push(toList(id))
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
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => handleListClick(`${list.event.pubkey}:${list.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              {list.image && (
                <img
                  src={list.image}
                  alt={list.title}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">{list.title}</h3>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    ({list.pubkeys.length}{' '}
                    {list.pubkeys.length === 1 ? t('member') : t('members')})
                  </span>
                </div>
                {!isOwned && (
                  <div className="text-xs text-muted-foreground mb-1">
                    <span>{t('by')}</span>{' '}
                    <Username pubkey={list.event.pubkey} className="font-medium" />
                  </div>
                )}
              </div>
            </div>
            {list.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {list.description}
              </p>
            )}
            {list.pubkeys.length > 0 && (
              <div className="flex -space-x-2">
                {list.pubkeys.slice(0, 5).map((pubkey) => (
                  <div key={pubkey} className="ring-2 ring-background rounded-full">
                    <UserAvatar pubkey={pubkey} className="w-8 h-8" />
                  </div>
                ))}
                {list.pubkeys.length > 5 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted ring-2 ring-background text-xs font-medium">
                    +{list.pubkeys.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>
          {isOwned && (
            <div className="flex gap-2 flex-shrink-0">
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
      </CardContent>
    </Card>
  )

  let content: React.ReactNode = null

  if (!pubkey) {
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search starter packs...')}
              className="pl-9"
            />
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
        {!searchQuery && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{t('My Lists')}</h2>
              <Button onClick={handleCreateList} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('Create List')}
              </Button>
            </div>

            {isLoadingMyLists && (
              <div className="text-center text-muted-foreground py-8">
                {t('Loading lists...')}
              </div>
            )}

            {!isLoadingMyLists && lists.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('No lists yet')}</p>
                <p className="text-sm">{t('Create your first list to get started')}</p>
              </div>
            )}

            <div className="grid gap-4">
              {lists.map((list) => renderListCard(list, true))}
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
      titlebar={<ListsPageTitlebar />}
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

function ListsPageTitlebar() {
  const { t } = useTranslation()

  return (
    <div className="flex gap-1 items-center h-full justify-between">
      <div className="font-semibold text-lg flex-1 pl-4">{t('Lists')}</div>
      <div className="shrink-0 flex gap-1 items-center">
        <PinButton column={{ type: 'lists' }} size="titlebar-icon" />
      </div>
    </div>
  )
}
