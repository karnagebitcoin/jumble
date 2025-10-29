import { useEffect, useState } from 'react'
import { PageManager } from '@/PageManager'
import ListPreviewDialog from '@/components/ListPreviewDialog'
import { useLists, TStarterPack } from '@/providers/ListsProvider'
import { useNostr } from '@/providers/NostrProvider'
import client from '@/services/client.service'
import { Event } from 'nostr-tools'
import { BIG_RELAY_URLS, ExtendedKind } from '@/constants'

/**
 * AppWithListPreview
 *
 * This component wraps the PageManager and intercepts shared list URLs
 * to show the ListPreviewDialog BEFORE loading the full list page.
 *
 * When a user clicks a shared list link (e.g., from Twitter/social media),
 * the URL will be: /lists/{pubkey}:{d-tag}?preview=1
 *
 * This component:
 * 1. Detects the preview parameter on mount
 * 2. Fetches the list data
 * 3. Shows the dialog WITHOUT loading the ListPage
 * 4. Only navigates to the list if user closes dialog or clicks "View List"
 */
export function AppWithListPreview() {
  const { pubkey: myPubkey } = useNostr()
  const { lists } = useLists()
  const [listPreview, setListPreview] = useState<{
    isOpen: boolean
    listData: TStarterPack | null
    ownerPubkey: string | null
    dTag: string | null
  }>({
    isOpen: false,
    listData: null,
    ownerPubkey: null,
    dTag: null
  })

  // Check URL on mount for shared list preview
  useEffect(() => {
    const checkForListPreview = async () => {
      const params = new URLSearchParams(window.location.search)
      const hasPreview = params.get('preview') === '1'

      if (!hasPreview) return

      // Parse the URL to extract list info
      // Expected format: /lists/{pubkey}:{d-tag}?preview=1
      const pathname = window.location.pathname
      const listMatch = pathname.match(/\/lists\/([^:]+):(.+)/)

      if (!listMatch) return

      const [, ownerPubkey, dTag] = listMatch

      // Check if this is the user's own list first
      const ownList = lists.find((l) => l.id === dTag)
      if (ownList && ownerPubkey === myPubkey) {
        // Don't show preview for own lists
        return
      }

      // Fetch the external list
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

          setListPreview({
            isOpen: true,
            listData: parsedList,
            ownerPubkey,
            dTag
          })
        }
      } catch (error) {
        console.error('Failed to fetch list for preview:', error)
      }
    }

    checkForListPreview()
  }, [lists, myPubkey])

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

  const handleClosePreview = () => {
    setListPreview({
      isOpen: false,
      listData: null,
      ownerPubkey: null,
      dTag: null
    })

    // Remove the preview parameter from URL to show the full list
    const newUrl = window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }

  // When preview dialog is open, we don't want to show the PageManager content
  // (which would try to load the ListPage). Instead, show a blank screen behind the dialog.
  if (listPreview.isOpen) {
    return (
      <>
        {/* Blank screen while preview dialog is shown */}
        <div className="flex h-screen w-screen bg-background" />

        {/* List Preview Dialog - the only UI visible in preview mode */}
        {listPreview.listData && listPreview.ownerPubkey && listPreview.dTag && (
          <ListPreviewDialog
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                handleClosePreview()
              }
            }}
            listId={listPreview.dTag}
            ownerPubkey={listPreview.ownerPubkey}
            title={listPreview.listData.title}
            description={listPreview.listData.description}
            image={listPreview.listData.image}
            pubkeys={listPreview.listData.pubkeys}
          />
        )}
      </>
    )
  }

  // Normal mode - show the PageManager (full app)
  return <PageManager />
}
